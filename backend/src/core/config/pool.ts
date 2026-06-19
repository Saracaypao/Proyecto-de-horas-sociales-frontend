import { Pool } from 'pg';
import { env } from './env.js';

const isRemote = !env.databaseUrl.includes('localhost') && !env.databaseUrl.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});