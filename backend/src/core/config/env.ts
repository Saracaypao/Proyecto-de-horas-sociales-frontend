import 'dotenv/config';

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/horas_sociales_db'),
  corsOrigin: process.env.CORS_ORIGIN ??  'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
