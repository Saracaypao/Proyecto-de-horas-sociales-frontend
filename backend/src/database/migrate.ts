import { pool } from '../core/config/pool.js';
import { runMigrations } from './migrationRunner.js';

async function main() {
  const directionArg = process.argv[2];
  const stepsArg = process.argv[3];
  const direction = directionArg === 'down' ? 'down' : 'up';
  const steps = Number.isFinite(Number(stepsArg)) ? Number(stepsArg) : 1;

  try {
    await runMigrations(direction, steps);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
});
