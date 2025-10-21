'use strict';

/**
 * token-qr service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::token-qr.token-qr');
