import type { Context, Next } from 'hono';
import { sql } from '../db.js';

/**
 * Middleware: verifies admin key from Authorization: Bearer <key> header
 * against admin_config table. Sets c.set('adminKey', key) on success.
 */
export async function adminAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const key = authHeader.slice(7);

  const rows = await sql`SELECT key FROM admin_config WHERE id = 1`;
  if (rows.length === 0 || rows[0].key !== key) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('adminKey', key);
  await next();
}
