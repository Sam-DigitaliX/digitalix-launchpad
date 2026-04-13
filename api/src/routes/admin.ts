import { Hono } from 'hono';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import os from 'node:os';
import { chromium } from 'playwright';
import { sql } from '../db.js';
import { adminAuth } from '../middleware/admin-auth.js';

const app = new Hono();

// All admin routes require x-admin-key header
app.use('/*', adminAuth);

/**
 * GET /admin/stats
 * Replaces: supabase.rpc('admin_get_stats')
 */
app.get('/stats', async (c) => {
  const rows = await sql`
    SELECT
      (SELECT COUNT(*) FROM contacts) AS total_contacts,
      (SELECT COUNT(*) FROM contacts WHERE is_qualified = true) AS qualified_count,
      (SELECT COUNT(*) FROM interactions) AS total_interactions,
      (SELECT COUNT(*) FROM interactions WHERE created_at >= CURRENT_DATE) AS interactions_today,
      (SELECT i2.type FROM interactions i2 GROUP BY i2.type ORDER BY COUNT(*) DESC LIMIT 1) AS top_interaction_type,
      (SELECT COUNT(*) FROM audits) AS total_audits,
      (SELECT COUNT(*) FROM audits WHERE created_at >= CURRENT_DATE) AS audits_today,
      (SELECT ROUND(AVG(overall_score)) FROM audits WHERE overall_score IS NOT NULL) AS avg_audit_score
  `;
  return c.json(rows[0]);
});

/**
 * GET /admin/contacts
 * Replaces: supabase.rpc('admin_get_contacts')
 */
app.get('/contacts', async (c) => {
  const rows = await sql`SELECT * FROM admin_contacts_overview`;
  return c.json(rows);
});

/**
 * GET /admin/contacts/:id/timeline
 * Replaces: supabase.rpc('admin_get_contact_timeline')
 */
app.get('/contacts/:id/timeline', async (c) => {
  const contactId = c.req.param('id');
  const rows = await sql`
    SELECT id, type, metadata, created_at
    FROM interactions
    WHERE contact_id = ${contactId}
    ORDER BY created_at DESC
  `;
  return c.json(rows);
});

/**
 * GET /admin/email-stats
 * Replaces: supabase.rpc('admin_get_email_stats')
 */
app.get('/email-stats', async (c) => {
  const rows = await sql`
    SELECT
      COUNT(*) AS total_sent,
      COUNT(*) FILTER (WHERE sent_at >= CURRENT_DATE) AS sent_today,
      COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS total_opened,
      COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) AS total_clicked,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::numeric / COUNT(*) * 100, 1)
        ELSE 0
      END AS open_rate,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::numeric / COUNT(*) * 100, 1)
        ELSE 0
      END AS click_rate,
      (SELECT el.template_key FROM email_logs el GROUP BY el.template_key ORDER BY COUNT(*) DESC LIMIT 1) AS top_template
    FROM email_logs
  `;
  return c.json(rows[0]);
});

/**
 * GET /admin/contacts/:id/emails
 * Replaces: supabase.rpc('admin_get_contact_emails')
 */
app.get('/contacts/:id/emails', async (c) => {
  const contactId = c.req.param('id');
  const rows = await sql`
    SELECT id, template_key, subject, status, resend_message_id, sent_at, opened_at, clicked_at
    FROM email_logs
    WHERE contact_id = ${contactId}
    ORDER BY sent_at DESC
  `;
  return c.json(rows);
});

/**
 * GET /admin/contacts/:id/audits
 */
app.get('/contacts/:id/audits', async (c) => {
  const contactId = c.req.param('id');
  const rows = await sql`
    SELECT id, url, domain, status, overall_score, created_at, unlocked_at
    FROM audits
    WHERE contact_id = ${contactId}
    ORDER BY created_at DESC
  `;
  return c.json(rows);
});

/**
 * PUT /admin/contacts/:id
 */
app.put('/contacts/:id', async (c) => {
  const contactId = c.req.param('id');
  const body = await c.req.json();
  const { full_name, company_name, phone, profile_type } = body;

  const rows = await sql`
    UPDATE contacts
    SET full_name = COALESCE(${full_name ?? null}, full_name),
        company_name = COALESCE(${company_name ?? null}, company_name),
        phone = COALESCE(${phone ?? null}, phone),
        profile_type = COALESCE(${profile_type ?? null}, profile_type)
    WHERE id = ${contactId}
    RETURNING id
  `;

  if (rows.length === 0) {
    return c.json({ error: 'Contact not found' }, 404);
  }
  return c.json({ success: true });
});

/**
 * DELETE /admin/contacts/:id
 */
app.delete('/contacts/:id', async (c) => {
  const contactId = c.req.param('id');
  const rows = await sql`DELETE FROM contacts WHERE id = ${contactId} RETURNING id`;
  if (rows.length === 0) {
    return c.json({ error: 'Contact not found' }, 404);
  }
  return c.json({ success: true });
});

/**
 * GET /admin/contacts/:id/notes
 */
app.get('/contacts/:id/notes', async (c) => {
  const contactId = c.req.param('id');
  const rows = await sql`
    SELECT id, content, created_at
    FROM contact_notes
    WHERE contact_id = ${contactId}
    ORDER BY created_at DESC
  `;
  return c.json(rows);
});

/**
 * POST /admin/contacts/:id/notes
 */
app.post('/contacts/:id/notes', async (c) => {
  const contactId = c.req.param('id');
  const body = await c.req.json();
  const content = body.content;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return c.json({ error: 'Content is required' }, 400);
  }

  const rows = await sql`
    INSERT INTO contact_notes (contact_id, content)
    VALUES (${contactId}, ${content.trim()})
    RETURNING id, content, created_at
  `;
  return c.json(rows[0], 201);
});

/**
 * DELETE /admin/contacts/:id/notes/:noteId
 */
app.delete('/contacts/:id/notes/:noteId', async (c) => {
  const noteId = c.req.param('noteId');
  const rows = await sql`DELETE FROM contact_notes WHERE id = ${noteId} RETURNING id`;
  if (rows.length === 0) {
    return c.json({ error: 'Note not found' }, 404);
  }
  return c.json({ success: true });
});

/**
 * GET /admin/contacts/:id/tags
 */
app.get('/contacts/:id/tags', async (c) => {
  const contactId = c.req.param('id');
  const rows = await sql`
    SELECT id, label
    FROM contact_tags
    WHERE contact_id = ${contactId}
    ORDER BY created_at
  `;
  return c.json(rows);
});

/**
 * POST /admin/contacts/:id/tags
 */
app.post('/contacts/:id/tags', async (c) => {
  const contactId = c.req.param('id');
  const body = await c.req.json();
  const label = body.label;

  if (!label || typeof label !== 'string' || !label.trim()) {
    return c.json({ error: 'Label is required' }, 400);
  }

  const rows = await sql`
    INSERT INTO contact_tags (contact_id, label)
    VALUES (${contactId}, ${label.trim().toLowerCase()})
    ON CONFLICT (contact_id, label) DO NOTHING
    RETURNING id, label
  `;

  if (rows.length === 0) {
    return c.json({ error: 'Tag already exists' }, 409);
  }
  return c.json(rows[0], 201);
});

/**
 * DELETE /admin/contacts/:id/tags/:label
 */
app.delete('/contacts/:id/tags/:label', async (c) => {
  const contactId = c.req.param('id');
  const label = decodeURIComponent(c.req.param('label'));
  const rows = await sql`
    DELETE FROM contact_tags
    WHERE contact_id = ${contactId} AND label = ${label}
    RETURNING id
  `;
  if (rows.length === 0) {
    return c.json({ error: 'Tag not found' }, 404);
  }
  return c.json({ success: true });
});

/**
 * GET /admin/health
 * System health check — all subsystems
 */
app.get('/health', async (c) => {
  const startTime = Date.now();

  interface Check {
    category: 'app' | 'data' | 'infra';
    name: string;
    status: 'ok' | 'warning' | 'error';
    message: string;
    value?: string | number;
    duration?: number;
  }

  const checks: Check[] = [];
  const versions = { node: '', postgresql: '', chromium: '' };

  // Node.js version
  versions.node = process.version;
  checks.push({
    category: 'app',
    name: 'Node.js',
    status: 'ok',
    message: process.version,
    value: process.version,
  });

  // Uptime
  const uptimeSeconds = Math.floor(process.uptime());
  const uptimeHours = Math.floor(uptimeSeconds / 3600);
  const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
  checks.push({
    category: 'app',
    name: 'Uptime',
    status: 'ok',
    message: `${uptimeHours}h ${uptimeMinutes}m`,
    value: uptimeSeconds,
  });

  // DB connection
  try {
    const t0 = Date.now();
    await sql`SELECT 1`;
    const duration = Date.now() - t0;
    checks.push({
      category: 'data',
      name: 'Database connexion',
      status: duration > 1000 ? 'warning' : 'ok',
      message: duration > 1000 ? `Lent (${duration}ms)` : `OK (${duration}ms)`,
      value: duration,
      duration,
    });
  } catch {
    checks.push({
      category: 'data',
      name: 'Database connexion',
      status: 'error',
      message: 'Connexion impossible',
    });
  }

  // PostgreSQL version
  try {
    const rows = await sql`SELECT version()`;
    const full = rows[0].version as string;
    const match = full.match(/PostgreSQL\s+([\d.]+)/);
    versions.postgresql = match ? match[1] : full;
    checks.push({
      category: 'data',
      name: 'PostgreSQL',
      status: 'ok',
      message: versions.postgresql,
      value: versions.postgresql,
    });
  } catch {
    checks.push({
      category: 'data',
      name: 'PostgreSQL',
      status: 'error',
      message: 'Impossible de lire la version',
    });
  }

  // DB tables check
  const requiredTables = ['contacts', 'interactions', 'email_logs', 'audits', 'audit_checks', 'admin_config'];
  try {
    const rows = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ANY(${requiredTables})
    `;
    const found = rows.map((r) => r.table_name as string);
    const missing = requiredTables.filter((t) => !found.includes(t));
    checks.push({
      category: 'data',
      name: 'Tables',
      status: missing.length > 0 ? 'warning' : 'ok',
      message: missing.length > 0 ? `Manquantes : ${missing.join(', ')}` : `${found.length}/${requiredTables.length} tables`,
      value: found.length,
    });
  } catch {
    checks.push({
      category: 'data',
      name: 'Tables',
      status: 'error',
      message: 'Impossible de lire les tables',
    });
  }

  // Playwright / Chromium binary
  try {
    const execPath = chromium.executablePath();
    const exists = existsSync(execPath);
    checks.push({
      category: 'app',
      name: 'Playwright',
      status: exists ? 'ok' : 'error',
      message: exists ? 'Chromium disponible' : 'Binaire introuvable',
      value: execPath,
    });
  } catch {
    checks.push({
      category: 'app',
      name: 'Playwright',
      status: 'error',
      message: 'Impossible de localiser Chromium',
    });
  }

  // Chromium version (use Playwright's executable path)
  try {
    const chromiumPath = chromium.executablePath();
    const output = execSync(`"${chromiumPath}" --version 2>/dev/null || echo "unknown"`, {
      timeout: 5000,
      encoding: 'utf-8',
    }).trim();
    const match = output.match(/([\d.]+)/);
    versions.chromium = match ? match[1] : output;
    checks.push({
      category: 'app',
      name: 'Chromium',
      status: versions.chromium !== 'unknown' ? 'ok' : 'warning',
      message: versions.chromium,
      value: versions.chromium,
    });
  } catch {
    checks.push({
      category: 'app',
      name: 'Chromium',
      status: 'warning',
      message: 'Impossible de lire la version',
    });
  }

  // Disk usage
  try {
    const output = execSync("df / --output=pcent | tail -1", {
      timeout: 5000,
      encoding: 'utf-8',
    }).trim();
    const pct = parseInt(output.replace('%', '').trim());
    checks.push({
      category: 'infra',
      name: 'Disque',
      status: pct > 95 ? 'error' : pct > 80 ? 'warning' : 'ok',
      message: `${pct}% utilisé`,
      value: pct,
    });
  } catch {
    checks.push({
      category: 'infra',
      name: 'Disque',
      status: 'warning',
      message: 'Impossible de lire',
    });
  }

  // Memory usage
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPct = Math.round(((totalMem - freeMem) / totalMem) * 100);
    const totalGB = (totalMem / 1024 / 1024 / 1024).toFixed(1);
    const freeGB = (freeMem / 1024 / 1024 / 1024).toFixed(1);
    checks.push({
      category: 'infra',
      name: 'Mémoire',
      status: usedPct > 95 ? 'error' : usedPct > 85 ? 'warning' : 'ok',
      message: `${usedPct}% utilisé (${freeGB} GB libre / ${totalGB} GB)`,
      value: usedPct,
    });
  } catch {
    checks.push({
      category: 'infra',
      name: 'Mémoire',
      status: 'warning',
      message: 'Impossible de lire',
    });
  }

  // Compute overall status
  const hasError = checks.some((ch) => ch.status === 'error');
  const hasWarning = checks.some((ch) => ch.status === 'warning');
  const overallStatus = hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy';

  return c.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: uptimeSeconds,
    duration: Date.now() - startTime,
    checks,
    versions,
  });
});

export default app;
