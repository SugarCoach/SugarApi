'use strict';

/**
 * dexcom-token router
 */

/*const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::dexcom-token.dexcom-token');*/

module.exports = {
  routes: [
    { method: 'GET', path: '/dexcom/login', handler: 'dexcom-token.login', config: { auth: false } },
    { method: 'GET', path: '/dexcom-token/callback', handler: 'dexcom-token.handleCallback', config: { auth: false } },
  ],
};
