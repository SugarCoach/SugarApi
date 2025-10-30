'use strict';
const axios = require('axios');

const DEX_BASE =
    process.env.DEXCOM_ENV === 'production'
        ? 'https://api.dexcom.com'
        : 'https://sandbox-api.dexcom.com';

// YYYY-MM-DDTHH:mm:ss en UTC sin 'Z'
function fmtUTC(date) {
    const iso = date.toISOString();            // 2025-10-30T18:15:22.123Z
    return iso.split('.')[0];                  // 2025-10-30T18:15:22
}

module.exports = {
    async latestEgv(ctx) {
        const userId = Number(ctx.params.id);
        if (!userId) return ctx.badRequest('invalid id');

        const row = await strapi.db.query('api::dexcom-token.dexcom-token').findOne({
            where: { users_permissions_user: userId },
            select: ['id', 'accessToken', 'refreshToken'],
        });
        if (!row?.accessToken) { ctx.status = 404; ctx.body = { value: null }; return; }

        // Ventana de 3 horas para pruebas
        const end = new Date();
        const start = new Date(end.getTime() - 3 * 60 * 60 * 1000);
        const qs = `startDate=${encodeURIComponent(fmtUTC(start))}&endDate=${encodeURIComponent(fmtUTC(end))}`;
        const egvUrl = `${DEX_BASE}/v2/users/self/egvs?${qs}`;

        const fetchEgvs = async (token) => {
            const r = await axios.get(egvUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            return r.data; // { egvs: [...] }
        };

        const refresh = async (rt) => {
            const body = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: rt,
                client_id: process.env.DEXCOM_CLIENT_ID,
                client_secret: process.env.DEXCOM_CLIENT_SECRET,
            });
            const r = await axios.post(`${DEX_BASE}/v2/oauth2/token`, body, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            return r.data;
        };

        try {
            const data = await fetchEgvs(row.accessToken);
            return respondWithLatest(ctx, data);
        } catch (e) {
            // 401 → refrescar y reintentar una vez
            if (e?.response?.status === 401 && row.refreshToken) {
                try {
                    const t = await refresh(row.refreshToken);
                    await strapi.db.query('api::dexcom-token.dexcom-token').update({
                        where: { id: row.id },
                        data: {
                            accessToken: t.access_token,
                            refreshToken: t.refresh_token || row.refreshToken,
                            expiresIn: t.expires_in,
                        },
                    });
                    const data2 = await fetchEgvs(t.access_token);
                    return respondWithLatest(ctx, data2);
                } catch (e2) {
                    strapi.log.error('Dexcom refresh/egvs failed', {
                        status: e2?.response?.status,
                        data: e2?.response?.data,
                    });
                    ctx.status = 502; ctx.body = { value: null }; return;
                }
            }

            // Log detallado del fallo original
            strapi.log.error('Dexcom egvs failed', {
                status: e?.response?.status,
                data: e?.response?.data,
            });
            ctx.status = 502; ctx.body = { value: null };
        }
    },
};

function respondWithLatest(ctx, payload) {
    const arr = Array.isArray(payload?.egvs) ? payload.egvs : [];
    if (!arr.length) { ctx.body = { value: null }; return; }
    arr.sort((a, b) =>
        new Date(a.systemTime).getTime() - new Date(b.systemTime).getTime()
    );
    const last = arr[arr.length - 1];
    ctx.body = { value: typeof last?.value === 'number' ? last.value : null };
}
