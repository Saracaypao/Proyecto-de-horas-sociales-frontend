"use strict";

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE institutions ALTER COLUMN id TYPE INTEGER USING id::integer;",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "DROP SEQUENCE IF EXISTS institutions_id_seq;",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "CREATE SEQUENCE IF NOT EXISTS institutions_id_seq OWNED BY institutions.id;",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "ALTER TABLE institutions ALTER COLUMN id SET DEFAULT nextval('institutions_id_seq'::regclass);",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "SELECT setval('institutions_id_seq', COALESCE((SELECT MAX(id) FROM institutions), 0) + 1, false);",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "ALTER TABLE projects ALTER COLUMN institution_id TYPE INTEGER USING institution_id::integer;",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "ALTER TABLE projects ADD CONSTRAINT projects_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE ON UPDATE CASCADE;",
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE institutions ALTER COLUMN id DROP DEFAULT;",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "ALTER TABLE institutions ALTER COLUMN id TYPE TEXT USING id::text;",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "DROP SEQUENCE IF EXISTS institutions_id_seq;",
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};