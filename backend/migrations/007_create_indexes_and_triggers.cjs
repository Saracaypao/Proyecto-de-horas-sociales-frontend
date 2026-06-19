"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addIndex('projects', ['institution_id'], {
        name: 'idx_projects_institution_id',
        transaction,
      });
      await queryInterface.addIndex('projects', ['estado'], {
        name: 'idx_projects_estado',
        transaction,
      });
      await queryInterface.addIndex('project_enrollments', ['project_id'], {
        name: 'idx_project_enrollments_project_id',
        transaction,
      });
      await queryInterface.addIndex('project_enrollments', ['student_id'], {
        name: 'idx_project_enrollments_student_id',
        transaction,
      });
      await queryInterface.addIndex('map_markers', ['project_id'], {
        name: 'idx_map_markers_project_id',
        transaction,
      });

      await queryInterface.sequelize.query(
        `CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`,
        { transaction }
      );

      await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_institutions_set_updated_at ON institutions;', {
        transaction,
      });
      await queryInterface.sequelize.query(
        `CREATE TRIGGER trg_institutions_set_updated_at
BEFORE UPDATE ON institutions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();`,
        { transaction }
      );

      await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_projects_set_updated_at ON projects;', {
        transaction,
      });
      await queryInterface.sequelize.query(
        `CREATE TRIGGER trg_projects_set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();`,
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
      await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_projects_set_updated_at ON projects;', { transaction });
      await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_institutions_set_updated_at ON institutions;', {
        transaction,
      });
      await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS set_updated_at();', { transaction });

      await queryInterface.removeIndex('map_markers', 'idx_map_markers_project_id', { transaction });
      await queryInterface.removeIndex('project_enrollments', 'idx_project_enrollments_student_id', { transaction });
      await queryInterface.removeIndex('project_enrollments', 'idx_project_enrollments_project_id', { transaction });
      await queryInterface.removeIndex('projects', 'idx_projects_estado', { transaction });
      await queryInterface.removeIndex('projects', 'idx_projects_institution_id', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
