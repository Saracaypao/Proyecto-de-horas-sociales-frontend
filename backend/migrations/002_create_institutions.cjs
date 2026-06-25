"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'institutions',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          },
          nombre: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          sigla: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          ubicacion: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          tipo: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          image_url: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          descripcion: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          estadisticas: {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: Sequelize.literal("'[]'::jsonb"),
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('institutions', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
