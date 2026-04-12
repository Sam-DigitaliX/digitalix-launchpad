import { Hono } from 'hono';
import { sql } from '../db.js';
import { scanUrl } from '../lib/scanner/index.js';
import { checkRateLimit } from '../lib/rate-limit.js';
import { sendEmail } from '../lib/resend.js';
import { buildAuditUnlockEmail } from '../lib/email-templates.js';

const app = new Hono();

const GATED_PLACEHOLDER = 'Debloquez les resultats complets en renseignant votre email.';

function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  // Validate URL format
  new URL(url);
  return url;
}

/**
 * POST /api/audit
 * Submit a URL for scanning. Returns the full AuditResult.
 */
app.post('/', async (c) => {
  const body = await c.req.json();
  const rawUrl = body.url;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return c.json({ error: 'url is required' }, 400);
  }

  let url: string;
  try {
    url = normalizeUrl(rawUrl);
  } catch {
    return c.json({ error: 'Invalid URL format' }, 400);
  }

  // Rate limiting by IP
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    ?? c.req.header('x-real-ip')
    ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return c.json({ error: 'Rate limit exceeded. Maximum 3 audits per hour.' }, 429);
  }

  // Run the scan
  const result = await scanUrl(url);

  // Insert audit row
  const auditRows = await sql`
    INSERT INTO audits (url, domain, status, overall_score, categories, error_message)
    VALUES (
      ${result.url},
      ${result.domain},
      ${result.status},
      ${result.overallScore},
      ${JSON.stringify(result.categories)},
      ${result.errorMessage ?? null}
    )
    RETURNING id, created_at
  `;

  const auditId = auditRows[0].id as string;
  const createdAt = auditRows[0].created_at as string;

  // Insert check rows
  if (result.checks.length > 0) {
    await sql`
      INSERT INTO audit_checks ${sql(
        result.checks.map((check) => ({
          audit_id: auditId,
          check_id: check.id,
          category: check.category,
          name: check.name,
          status: check.status,
          description: check.description,
          impact: check.impact,
          gated: check.gated,
          raw_data: JSON.stringify({}),
        }))
      )}
    `;
  }

  // Return result with gated descriptions masked
  return c.json({
    id: auditId,
    url: result.url,
    status: result.status,
    overallScore: result.overallScore,
    categories: result.categories,
    checks: result.checks.map((check) => ({
      ...check,
      description: check.gated ? GATED_PLACEHOLDER : check.description,
    })),
    createdAt,
  });
});

/**
 * GET /api/audit/:id
 * Retrieve an existing audit result.
 */
app.get('/:id', async (c) => {
  const id = c.req.param('id');

  const auditRows = await sql`
    SELECT id, url, status, overall_score, categories, error_message, unlocked_at, created_at
    FROM audits WHERE id = ${id} LIMIT 1
  `;

  if (auditRows.length === 0) {
    return c.json({ error: 'Audit not found' }, 404);
  }

  const audit = auditRows[0];
  const isUnlocked = audit.unlocked_at !== null;

  const checkRows = await sql`
    SELECT check_id, category, name, status, description, impact, gated
    FROM audit_checks WHERE audit_id = ${id}
    ORDER BY created_at
  `;

  const checks = checkRows.map((row) => ({
    id: row.check_id,
    category: row.category,
    name: row.name,
    status: row.status,
    description: row.gated && !isUnlocked ? GATED_PLACEHOLDER : row.description,
    impact: row.impact,
    gated: row.gated,
  }));

  return c.json({
    id: audit.id,
    url: audit.url,
    status: audit.status,
    overallScore: audit.overall_score,
    categories: audit.categories,
    checks,
    createdAt: audit.created_at,
  });
});

/**
 * POST /api/audit/:id/unlock
 * Submit email to unlock gated checks.
 */
app.post('/:id/unlock', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const email = body.email;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return c.json({ error: 'Valid email is required' }, 400);
  }

  // Check audit exists
  const auditRows = await sql`
    SELECT id, url, overall_score FROM audits WHERE id = ${id} LIMIT 1
  `;

  if (auditRows.length === 0) {
    return c.json({ error: 'Audit not found' }, 404);
  }

  const audit = auditRows[0];

  // Upsert contact
  const contactRows = await sql`
    INSERT INTO contacts (email, first_seen_at, last_seen_at)
    VALUES (${email}, now(), now())
    ON CONFLICT (email) DO UPDATE SET last_seen_at = now()
    RETURNING id
  `;

  const contactId = contactRows[0].id as string;

  // Link contact to audit and mark as unlocked
  await sql`
    UPDATE audits SET contact_id = ${contactId}, unlocked_at = now()
    WHERE id = ${id}
  `;

  // Log interaction
  await sql`
    INSERT INTO interactions (contact_id, type, metadata)
    VALUES (${contactId}, 'audit_unlock', ${JSON.stringify({
      audit_id: id,
      url: audit.url,
      score: audit.overall_score,
    })})
  `;

  // Send audit_unlock email
  try {
    const emailResult = buildAuditUnlockEmail({
      email,
      url: audit.url,
      score: audit.overall_score,
      auditId: id,
      contactId,
    });

    const resendResult = await sendEmail({
      to: email,
      subject: emailResult.subject,
      html: emailResult.html,
    });

    // Log email
    await sql`
      INSERT INTO email_logs (contact_id, to_email, template_key, subject, resend_message_id, status, metadata)
      VALUES (${contactId}, ${email}, ${emailResult.template_key}, ${emailResult.subject}, ${resendResult.id}, 'sent', ${JSON.stringify({
        audit_id: id,
        url: audit.url,
        score: audit.overall_score,
      })})
    `;
  } catch (err) {
    console.error('[audit/unlock] Email send failed:', err);
    // Don't block the unlock — email is best-effort
  }

  // Return all checks with descriptions visible
  const checkRows = await sql`
    SELECT check_id, category, name, status, description, impact, gated
    FROM audit_checks WHERE audit_id = ${id}
    ORDER BY created_at
  `;

  const checks = checkRows.map((row) => ({
    id: row.check_id,
    category: row.category,
    name: row.name,
    status: row.status,
    description: row.description,
    impact: row.impact,
    gated: row.gated,
  }));

  return c.json({ success: true, checks, contactId });
});

/**
 * POST /api/audit/:id/track-click
 * Log that a contact clicked the email link to revisit their audit.
 */
app.post('/:id/track-click', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const contactId = body.contactId;

  if (!contactId || typeof contactId !== 'string') {
    return c.json({ error: 'contactId is required' }, 400);
  }

  // Verify audit and contact exist
  const auditRows = await sql`SELECT id FROM audits WHERE id = ${id} LIMIT 1`;
  const contactRows = await sql`SELECT id FROM contacts WHERE id = ${contactId} LIMIT 1`;

  if (auditRows.length === 0 || contactRows.length === 0) {
    return c.json({ error: 'Not found' }, 404);
  }

  // Log the click interaction
  await sql`
    INSERT INTO interactions (contact_id, type, metadata)
    VALUES (${contactId}, 'audit_email_click', ${JSON.stringify({ audit_id: id })})
  `;

  // Update last_seen_at on contact
  await sql`UPDATE contacts SET last_seen_at = now() WHERE id = ${contactId}`;

  return c.json({ success: true });
});

export default app;
