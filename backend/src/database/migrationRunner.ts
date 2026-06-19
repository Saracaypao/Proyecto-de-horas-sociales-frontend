import { readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pool } from '../core/config/pool.js';

type Direction = 'up' | 'down';

type Migration = {
  name: string;
  filePath: string;
};

type TransactionClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;
  release: () => void;
};

type Transaction = {
  client: TransactionClient;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
};

type QueryOptions = {
  transaction?: Transaction;
};

type ColumnDefinition = {
  type: { kind: string; values?: string[] } | string;
  allowNull?: boolean;
  defaultValue?: unknown;
  unique?: boolean;
  primaryKey?: boolean;
  references?: { model: string; key?: string };
  onDelete?: string;
  onUpdate?: string;
  field?: string;
};

type MigrationModule = {
  up: (queryInterface: QueryInterface, Sequelize: typeof SequelizeShim) => Promise<void>;
  down: (queryInterface: QueryInterface, Sequelize: typeof SequelizeShim) => Promise<void>;
};

type QueryInterface = {
  sequelize: {
    query: (sql: string, options?: QueryOptions) => Promise<unknown>;
    transaction: () => Promise<Transaction>;
  };
  addColumn: (tableName: string, columnName: string, definition: ColumnDefinition, options?: QueryOptions) => Promise<void>;
  removeColumn: (tableName: string, columnName: string, options?: QueryOptions) => Promise<void>;
  createTable: (tableName: string, attributes: Record<string, ColumnDefinition>, options?: QueryOptions) => Promise<void>;
  dropTable: (tableName: string, options?: QueryOptions) => Promise<void>;
  addIndex: (tableName: string, columns: string[] | string, options?: { name?: string; unique?: boolean; transaction?: Transaction }) => Promise<void>;
  removeIndex: (tableName: string, indexName: string, options?: QueryOptions) => Promise<void>;
};

const require = createRequire(import.meta.url);

const MIGRATIONS_TABLE = 'schema_migrations';

function getMigrationsDir() {
  return path.resolve(process.cwd(), 'migrations');
}

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = getMigrationsDir();
  const files = await readdir(migrationsDir);
  const parsed = new Map<string, Partial<Migration>>();

  for (const file of files) {
    const match = file.match(/^(\d+_[a-z0-9_\-]+)\.cjs$/i);
    if (!match) continue;

    const migrationName = match[1];
    parsed.set(migrationName, { name: migrationName, filePath: path.join(migrationsDir, file) });
  }

  const result = Array.from(parsed.values())
    .filter((item): item is Migration => Boolean(item.name && item.filePath))
    .sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

async function getAppliedMigrationNames(): Promise<string[]> {
  const result = await pool.query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY name ASC`);
  return result.rows.map((row: { name: string }) => String(row.name));
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function escapeStringLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function valueToSql(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'string') return escapeStringLiteral(value);
  if (value && typeof value === 'object' && (value as { kind?: string }).kind === 'literal') {
    return String((value as { value: string }).value);
  }
  if (Array.isArray(value)) {
    return `ARRAY[${value.map((item) => valueToSql(item)).join(', ')}]`;
  }
  return escapeStringLiteral(String(value));
}

function definitionToSql(definition: ColumnDefinition) {
  const parts: string[] = [];
  const type = definition.type;

  if (typeof type === 'string') {
    parts.push(type);
  } else if (type.kind === 'ENUM' && type.values) {
    parts.push(`TEXT CHECK (${quoteIdentifier('value')} IN (${type.values.map((item) => escapeStringLiteral(item)).join(', ')}))`);
  } else {
    parts.push(type.kind);
  }

  if (definition.primaryKey) parts.push('PRIMARY KEY');
  if (definition.allowNull === false) parts.push('NOT NULL');
  if (definition.unique) parts.push('UNIQUE');
  if (definition.defaultValue !== undefined) parts.push(`DEFAULT ${valueToSql(definition.defaultValue)}`);

  if (definition.references) {
    const refKey = definition.references.key ?? 'id';
    parts.push(`REFERENCES ${quoteIdentifier(definition.references.model)}(${quoteIdentifier(refKey)})`);
  }
  if (definition.onDelete) parts.push(`ON DELETE ${definition.onDelete}`);
  if (definition.onUpdate) parts.push(`ON UPDATE ${definition.onUpdate}`);

  return parts.join(' ');
}

function buildCreateTableSql(tableName: string, attributes: Record<string, ColumnDefinition>) {
  const columns = Object.entries(attributes).map(([columnName, definition]) => {
    const columnSql = definitionToSql({ ...definition, field: definition.field ?? columnName });
    return `  ${quoteIdentifier(columnName)} ${columnSql}`;
  });

  return `CREATE TABLE IF NOT EXISTS ${quoteIdentifier(tableName)} (
${columns.join(',\n')}
)`;
}

function getClientFromOptions(options?: QueryOptions) {
  return options?.transaction?.client ?? pool;
}

async function runQuery(sql: string, options?: QueryOptions) {
  const client = getClientFromOptions(options);
  await client.query(sql);
}

function createQueryInterface(): QueryInterface {
  return {
    sequelize: {
      query: async (sql: string, options?: QueryOptions) => runQuery(sql, options),
      transaction: async () => {
        const client = await pool.connect();
        await client.query('BEGIN');

        return {
          client,
          commit: async () => {
            await client.query('COMMIT');
            client.release();
          },
          rollback: async () => {
            await client.query('ROLLBACK');
            client.release();
          },
        };
      },
    },
    addColumn: async (tableName, columnName, definition, options) => {
      const sql = `ALTER TABLE ${quoteIdentifier(tableName)} ADD COLUMN ${quoteIdentifier(columnName)} ${definitionToSql(definition)}`;
      await runQuery(sql, options);
    },
    removeColumn: async (tableName, columnName, options) => {
      const sql = `ALTER TABLE ${quoteIdentifier(tableName)} DROP COLUMN IF EXISTS ${quoteIdentifier(columnName)}`;
      await runQuery(sql, options);
    },
    createTable: async (tableName, attributes, options) => {
      const sql = buildCreateTableSql(tableName, attributes);
      await runQuery(sql, options);
    },
    dropTable: async (tableName, options) => {
      const sql = `DROP TABLE IF EXISTS ${quoteIdentifier(tableName)} CASCADE`;
      await runQuery(sql, options);
    },
    addIndex: async (tableName, columns, options) => {
      const columnList = Array.isArray(columns) ? columns.map(quoteIdentifier).join(', ') : quoteIdentifier(columns);
      const indexName = options?.name ?? `${tableName}_${Array.isArray(columns) ? columns.join('_') : columns}_idx`;
      const sql = `CREATE${options?.unique ? ' UNIQUE' : ''} INDEX IF NOT EXISTS ${quoteIdentifier(indexName)} ON ${quoteIdentifier(tableName)} (${columnList})`;
      await runQuery(sql, { transaction: options?.transaction });
    },
    removeIndex: async (tableName, indexName, options) => {
      const sql = `DROP INDEX IF EXISTS ${quoteIdentifier(indexName)}`;
      await runQuery(sql, options);
    },
  };
}

const SequelizeShim = {
  BOOLEAN: { kind: 'BOOLEAN' },
  INTEGER: { kind: 'INTEGER' },
  TEXT: { kind: 'TEXT' },
  UUID: { kind: 'UUID' },
  DATE: { kind: 'DATE' },
  DATEONLY: { kind: 'DATE' },
  JSONB: { kind: 'JSONB' },
  STRING: { kind: 'TEXT' },
  NOW: { kind: 'literal', value: 'NOW()' },
  literal: (value: string) => ({ kind: 'literal', value }),
  ENUM: (...values: string[]) => ({ kind: 'ENUM', values }),
  ARRAY: (item: { kind: string }) => ({ kind: `${item.kind}[]` }),
  NUMERIC: (precision?: number, scale?: number) => ({ kind: `NUMERIC${precision ? `(${precision}${scale !== undefined ? `, ${scale}` : ''})` : ''}` }),
};

async function runMigrationModule(migration: Migration, direction: Direction) {
  const mod = require(migration.filePath) as MigrationModule;
  const queryInterface = createQueryInterface();

  if (direction === 'up') {
    await mod.up(queryInterface, SequelizeShim as typeof SequelizeShim);
  } else {
    await mod.down(queryInterface, SequelizeShim as typeof SequelizeShim);
  }
}

async function applyMigration(migration: Migration) {
  try {
    await runMigrationModule(migration, 'up');
    await pool.query(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [migration.name]);
    console.log(`Applied migration: ${migration.name}`);
  } catch (error) {
    throw error;
  }
}

async function rollbackMigration(migration: Migration) {
  try {
    await runMigrationModule(migration, 'down');
    await pool.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE name = $1`, [migration.name]);
    console.log(`Rolled back migration: ${migration.name}`);
  } catch (error) {
    throw error;
  }
}

export async function runMigrations(direction: Direction, steps = 1) {
  await ensureMigrationsTable();
  const migrations = await loadMigrations();
  const applied = await getAppliedMigrationNames();
  const appliedSet = new Set(applied);

  if (direction === 'up') {
    const pending = migrations.filter((migration) => !appliedSet.has(migration.name));
    for (const migration of pending) {
      await applyMigration(migration);
    }
    if (pending.length === 0) {
      console.log('No pending migrations.');
    }
    return;
  }

  const appliedInReverse = migrations.filter((migration) => appliedSet.has(migration.name)).reverse();
  const toRollback = appliedInReverse.slice(0, Math.max(steps, 1));

  for (const migration of toRollback) {
    await rollbackMigration(migration);
  }

  if (toRollback.length === 0) {
    console.log('No applied migrations to rollback.');
  }
}
