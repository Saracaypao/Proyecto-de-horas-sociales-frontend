"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable(
        'project_enrollments',
        {
          id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          project_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'projects', key: 'id' },
            onDelete: 'CASCADE',
          },
          student_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'students', key: 'id' },
            onDelete: 'CASCADE',
          },
          cargo: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: 'Estudiante',
          },
          activo: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        },
        { transaction }
      );

      await queryInterface.addIndex('project_enrollments', ['project_id', 'student_id'], {
        unique: true,
        name: 'project_enrollments_project_id_student_id_key',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('project_enrollments', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
