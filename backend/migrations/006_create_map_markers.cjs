"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'map_markers',
        {
          id: {
            type: Sequelize.TEXT,
            allowNull: false,
            primaryKey: true,
          },
          label: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          hombres: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          mujeres: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          lat: {
            type: 'NUMERIC(10, 6)',
            allowNull: false,
          },
          lng: {
            type: 'NUMERIC(10, 6)',
            allowNull: false,
          },
          project_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'projects', key: 'id' },
            onDelete: 'SET NULL',
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
      await queryInterface.dropTable('map_markers', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
