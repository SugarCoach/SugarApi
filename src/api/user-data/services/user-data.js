'use strict';

/**
 * user-data service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-data.user-data');
