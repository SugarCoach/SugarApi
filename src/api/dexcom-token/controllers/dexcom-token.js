'use strict';

/**
 * dexcom-token controller
 */

/*const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::dexcom-token.dexcom-token');*/

const axios = require('axios');

const DEX_BASE = process.env.DEXCOM_ENV === 'production'
  ? 'https://api.dexcom.com'
  : 'https://sandbox-api.dexcom.com';

module.exports = {
  async login(ctx) {
    const { state } = ctx.query; // viene desde la app Android

    const params = new URLSearchParams({
      client_id: process.env.DEXCOM_CLIENT_ID,
      redirect_uri: `${process.env.RENDER_SERVER}/api/dexcom-token/callback`,
      response_type: 'code',
      scope: 'offline_access',
      state: state, // se reenvía para identificar al usuario en el callback
    });

    strapi.log.info(`Redirecting user ${state} to Dexcom`);
    ctx.redirect(`${DEX_BASE}/v2/oauth2/login?${params.toString()}`);
  },

  async handleCallback(ctx) {
    const { code, state } = ctx.query;

    if (!code) {
      strapi.log.warn('Dexcom callback received without a code.');
      return ctx.redirect('sugarcoach://callback?error=true');
    }

    try {
      strapi.log.info(`Exchanging code for user ${state}`);

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.RENDER_SERVER}/api/dexcom-token/callback`,
        client_id: process.env.DEXCOM_CLIENT_ID,
        client_secret: process.env.DEXCOM_CLIENT_SECRET,
      });

      const res = await axios.post(`${DEX_BASE}/v2/oauth2/token`, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, expires_in } = res.data;

      // Guarda o actualiza los tokens asociados al usuario identificado por "state"
      await strapi.service('api::dexcom-token.dexcom-token')
        .saveOrUpdate(Number(state), {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresIn: expires_in,
        });

      strapi.log.info(`Successfully saved tokens for user ${state}`);
      return ctx.redirect('sugarcoach://callback?success=true');
    } catch (e) {
      strapi.log.error('Dexcom token exchange failed', e?.response?.data || e.message);
      return ctx.redirect('sugarcoach://callback?error=true');
    }
  },
};
