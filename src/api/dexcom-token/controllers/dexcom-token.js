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
    const params = new URLSearchParams({
      client_id: process.env.DEXCOM_CLIENT_ID,
      redirect_uri: `${process.env.YOUR_SERVER_BASE_URL}/api/dexcom-token/callback`,
      response_type: 'code',
      scope: 'offline_access',
    });
    ctx.redirect(`${DEX_BASE}/v2/oauth2/login?${params.toString()}`);
  },

  async handleCallback(ctx) {
    const { code, state } = ctx.query;
    if (!code) return ctx.redirect('sugarcoach://callback?error=true');

    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.YOUR_SERVER_BASE_URL}/api/dexcom-token/callback`,
        client_id: process.env.DEXCOM_CLIENT_ID,
        client_secret: process.env.DEXCOM_CLIENT_SECRET,
      });

      const res = await axios.post(`${DEX_BASE}/v2/oauth2/token`, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, expires_in, scope, token_type, user: dexUser } = res.data;

      // Guardar en tu colección integrations_dexcom
      await strapi.service('api::dexcom-integration.dexcom-integration')
        .saveOrUpdate({
          userId: Number(state) || null,        // si usás state para identificar al usuario
          dexcom_user_id: dexUser || null,
          access_token,
          refresh_token,
          expires_in,
          scope,
          token_type,
        });

      return ctx.redirect('sugarcoach://callback?success=true');
    } catch (e) {
      strapi.log.error('Dexcom token exchange failed', e?.response?.data || e.message);
      return ctx.redirect('sugarcoach://callback?error=true');
    }
  },
};

