import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(__dirname, '../../migrations');

async function migrate() {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`[migrate] Running ${file}...`);
    const schema = readFileSync(resolve(migrationsDir, file), 'utf-8');
    await sql.unsafe(schema);
    console.log(`[migrate] ${file} done.`);
  }

  console.log('[migrate] All migrations complete.');
  await sql.end();
}

migrate().catch((err) => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});
