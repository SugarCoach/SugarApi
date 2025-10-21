'use strict';

/**
 * dexcom-token service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::dexcom-token.dexcom-token');
