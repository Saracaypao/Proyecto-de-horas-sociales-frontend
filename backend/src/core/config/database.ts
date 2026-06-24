import { Sequelize } from 'sequelize';
import { env } from './env.js';

const isProduction = env.nodeEnv === 'production';

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

export default sequelize;