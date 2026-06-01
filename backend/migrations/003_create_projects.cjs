"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'projects',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          },
          institution_id: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          titulo: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          ubicacion: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          estado: {
            type: 'project_status',
            allowNull: false,
            defaultValue: 'Activo',
          },
          carreras: {
            type: Sequelize.ARRAY(Sequelize.TEXT),
            allowNull: false,
            defaultValue: Sequelize.literal("'{}'::text[]"),
          },
          descripcion: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          resumen: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          fecha_inicio: {
            type: Sequelize.DATEONLY,
            allowNull: true,
          },
          fecha_cierre: {
            type: Sequelize.DATEONLY,
            allowNull: true,
          },
          cupos: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          image_url: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          team_members: {
            type: Sequelize.ARRAY(Sequelize.TEXT),
            allowNull: false,
            defaultValue: Sequelize.literal("'{}'::text[]"),
          },
          personas: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
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

      await queryInterface.sequelize.query(
        `ALTER TABLE projects ADD CONSTRAINT projects_fecha_cierre_after_inicio CHECK (
          fecha_inicio IS NULL OR fecha_cierre IS NULL OR fecha_cierre >= fecha_inicio
        );`,
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
      await queryInterface.dropTable('projects', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
