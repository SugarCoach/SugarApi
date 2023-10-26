'use strict';

/**
 * treatment service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::treatment.treatment');
