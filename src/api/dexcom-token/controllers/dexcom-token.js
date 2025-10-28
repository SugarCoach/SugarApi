'use strict';

const axios = require('axios');

// Selección de endpoint Dexcom según entorno
const DEX_BASE = process.env.DEXCOM_ENV === 'production'
  ? 'https://api.dexcom.com'
  : 'https://sandbox-api.dexcom.com';

module.exports = {
  async login(ctx) {
    const { state } = ctx.query; // ID de usuario que manda la app Android

    const redirectUri = `${process.env.RENDER_SERVER}/api/dexcom-token/callback`;

    const params = new URLSearchParams({
      client_id: process.env.DEXCOM_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'offline_access',
      state: state,
    });

    strapi.log.info(`Redirecting user ${state} to Dexcom`);
    ctx.redirect(`${DEX_BASE}/v2/oauth2/login?${params.toString()}`);
  },

  async handleCallback(ctx) {
    const { code, state, error, error_description } = ctx.query;

    // Dexcom puede devolver error directamente en el callback sin code
    if (error) {
      strapi.log.error(`Dexcom callback returned error`, {
        error,
        error_description,
        state,
      });
      return ctx.redirect('sugarcoach://callback?error=true');
    }

    if (!code) {
      strapi.log.warn('Dexcom callback received without a code.', { state });
      return ctx.redirect('sugarcoach://callback?error=true');
    }

    const redirectUri = `${process.env.RENDER_SERVER}/api/dexcom-token/callback`;

    try {
      strapi.log.info(`Exchanging code for user ${state}`);

      // Cuerpo x-www-form-urlencoded requerido por Dexcom
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.DEXCOM_CLIENT_ID,
        client_secret: process.env.DEXCOM_CLIENT_SECRET,
      });

      // Intercambio de code -> tokens
      const res = await axios.post(`${DEX_BASE}/v2/oauth2/token`, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, expires_in } = res.data;

      // Persistencia en Strapi asociada al usuario "state"
      await strapi
        .service('api::dexcom-token.dexcom-token')
        .saveOrUpdate(Number(state), {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresIn: expires_in,
        });

      strapi.log.info(`Successfully saved tokens for user ${state}`);

      // Devolvemos a la app móvil los tokens directo por deep link
      // Codificamos para que no rompa la URI en caracteres reservados
      const successUrl =
        `sugarcoach://callback?` +
        `access_token=${encodeURIComponent(access_token)}` +
        `&refresh_token=${encodeURIComponent(refresh_token)}` +
        `&expires_in=${encodeURIComponent(expires_in)}`;

      return ctx.redirect(successUrl);

    } catch (e) {
      // Log extendido para diagnóstico
      // Esto nos dice si es invalid_client, invalid_grant, etc.
      const status = e?.response?.status;
      const data = e?.response?.data;
      const noResponse = !!e?.request && !e?.response;
      const message = e?.message;

      strapi.log.error('Dexcom token exchange failed', {
        status,
        data,
        noResponse,
        message,
        dexBase: DEX_BASE,
        sent: {
          redirect_uri: redirectUri,
          client_id: process.env.DEXCOM_CLIENT_ID ? '[present]' : '[missing]',
          // no logeamos client_secret por seguridad
          state,
          code,
        },
      });

      // Profiler bruto en consola (útil en Render logs)
      console.log('RAW DEXCOM ERROR OBJECT:', e);

      return ctx.redirect('sugarcoach://callback?error=true');
    }
  },
};
