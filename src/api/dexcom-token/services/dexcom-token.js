'use strict';

/**
 * dexcom-token service
 */

/*const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::dexcom-token.dexcom-token');*/

module.exports = () => ({
  async saveOrUpdate(userId, data) {
    // buscar si ya existe un registro para este usuario
    const existing = await strapi.db.query('api::dexcom-token.dexcom-token').findOne({
      where: { user: userId },
    });

    if (existing) {
      // actualizar
      return await strapi.db.query('api::dexcom-token.dexcom-token').update({
        where: { id: existing.id },
        data: { ...data, user: userId },
      });
    }

    // crear nuevo
    return await strapi.db.query('api::dexcom-token.dexcom-token').create({
      data: { ...data, user: userId },
    });
  },
});
