import { Sequelize } from 'sequelize';
import { env } from './env.js';

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
