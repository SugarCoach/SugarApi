'use strict';

/**
 * dexcom-token service
 */

module.exports = ({ strapi }) => ({
  async saveOrUpdate(userId, data) {
    strapi.log.info(`Buscando token existente para el usuario: ${userId}`);

    // Buscar por la relación correcta con users_permissions_user
    const existing = await strapi.db
      .query('api::dexcom-token.dexcom-token')
      .findOne({
        where: { users_permissions_user: userId },
      });

    if (existing) {
      strapi.log.info(`Token existente encontrado (ID: ${existing.id}). Actualizando...`);

      // Actualizar usando el nombre de campo correcto
      return await strapi.db
        .query('api::dexcom-token.dexcom-token')
        .update({
          where: { id: existing.id },
          data: { ...data, users_permissions_user: userId },
        });
    }

    strapi.log.info('No se encontró token existente. Creando uno nuevo...');

    // Crear nuevo registro con el campo correcto
    return await strapi.db
      .query('api::dexcom-token.dexcom-token')
      .create({
        data: { ...data, users_permissions_user: userId },
      });
  },
});
