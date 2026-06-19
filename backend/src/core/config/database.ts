import { Sequelize } from 'sequelize';
import { env } from './env.js';

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export default sequelize;