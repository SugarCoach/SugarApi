'use strict';

/**
 * daily-register service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::daily-register.daily-register');
