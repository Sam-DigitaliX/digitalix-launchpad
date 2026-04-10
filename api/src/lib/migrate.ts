import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(__dirname, '../../migrations/001_schema.sql');

async function migrate() {
  console.log('[migrate] Running 001_schema.sql...');
  const schema = readFileSync(migrationPath, 'utf-8');
  await sql.unsafe(schema);
  console.log('[migrate] Done.');
  await sql.end();
}

migrate().catch((err) => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});
