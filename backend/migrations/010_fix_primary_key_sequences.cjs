"use strict";

async function repairIntegerPrimaryKey(queryInterface, tableName, sequenceName) {
  await queryInterface.sequelize.query(
    `CREATE SEQUENCE IF NOT EXISTS ${sequenceName} OWNED BY ${tableName}.id;`
  );

  await queryInterface.sequelize.query(
    `ALTER TABLE ${tableName} ALTER COLUMN id SET DEFAULT nextval('${sequenceName}'::regclass);`
  );

  await queryInterface.sequelize.query(
    `SELECT setval('${sequenceName}', COALESCE((SELECT MAX(id) FROM ${tableName}), 0) + 1, false);`
  );
}

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await repairIntegerPrimaryKey(queryInterface, 'institutions', 'institutions_id_seq');
      await repairIntegerPrimaryKey(queryInterface, 'projects', 'projects_id_seq');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query('ALTER TABLE institutions ALTER COLUMN id DROP DEFAULT;', { transaction });
      await queryInterface.sequelize.query('ALTER TABLE projects ALTER COLUMN id DROP DEFAULT;', { transaction });
      await queryInterface.sequelize.query('DROP SEQUENCE IF EXISTS institutions_id_seq;', { transaction });
      await queryInterface.sequelize.query('DROP SEQUENCE IF EXISTS projects_id_seq;', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};