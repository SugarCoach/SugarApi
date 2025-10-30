'use strict';
const axios = require('axios');

const DEX_BASE = process.env.DEXCOM_ENV === 'production'
    ? 'https://api.dexcom.com'
    : 'https://sandbox-api.dexcom.com';

module.exports = {
    async latestEgv(ctx) {
        const userId = Number(ctx.params.id);
        if (!userId) return ctx.badRequest('invalid id');

        // leer tokens guardados por tu servicio dexcom-token
        const row = await strapi.db.query('api::dexcom-token.dexcom-token').findOne({
            where: { users_permissions_user: userId },
            select: ['id', 'accessToken', 'refreshToken', 'expiresIn'],
        });
        if (!row?.accessToken) {
            ctx.status = 404; ctx.body = { value: null }; return;
        }

        // ventana 10 min
        const end = new Date();
        const start = new Date(end.getTime() - 10 * 60 * 1000);
        const qs = `startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}`;
        const egvUrl = `${DEX_BASE}/v2/users/self/egvs?${qs}`;

        const fetchEgvs = async (token) => {
            const r = await axios.get(egvUrl, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
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
            return r.data; // { access_token, refresh_token, expires_in }
        };

        try {
            const data = await fetchEgvs(row.accessToken);
            ctx.body = { value: pickLatest(data) };
            return;
        } catch (e) {
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
                    ctx.body = { value: pickLatest(data2) };
                    return;
                } catch (e2) {
                    strapi.log.error('Dexcom refresh/egvs failed', { status: e2?.response?.status, data: e2?.response?.data });
                    ctx.status = 502; ctx.body = { value: null }; return;
                }
            }
            strapi.log.error('Dexcom egvs failed', { status: e?.response?.status, data: e?.response?.data });
            ctx.status = 502; ctx.body = { value: null };
        }

        function pickLatest(payload) {
            const arr = Array.isArray(payload?.egvs) ? payload.egvs : [];
            if (!arr.length) return null;

            // Ordenar por systemTime de forma ascendente
            arr.sort((a, b) => {
                const timeA = new Date(a.systemTime).getTime();
                const timeB = new Date(b.systemTime).getTime();
                return timeA - timeB;
            });

            const last = arr[arr.length - 1];
            return typeof last?.value === 'number' ? last.value : null;
        }

    },
};
