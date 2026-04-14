import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { sql } from '../db.js';
import { scanUrl } from '../lib/scanner/index.js';
import { checkRateLimit } from '../lib/rate-limit.js';
import { sendEmail } from '../lib/resend.js';
import { buildAuditUnlockEmail } from '../lib/email-templates.js';
import type { ScanProgressEvent } from '../lib/scanner/types.js';
import type { ScanResult } from '../lib/scanner/index.js';

const app = new Hono();

const GATED_PLACEHOLDER = 'Debloquez les resultats complets en renseignant votre email.';

/* ──────────────────── In-memory scan state ──────────────────── */

interface ScanState {
  events: ScanProgressEvent[];
  result: ScanResult | null;
  done: boolean;
  listeners: Set<(event: ScanProgressEvent) => void>;
}

const scanStates = new Map<string, ScanState>();

// Cleanup old scan states after 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [id, state] of scanStates) {
    if (state.done && state.events.length > 0) {
      const lastEvent = state.events[state.events.length - 1];
      if (lastEvent && ('_ts' in lastEvent) && (lastEvent as unknown as { _ts: number })._ts < cutoff) {
        scanStates.delete(id);
      }
    }
  }
}, 60_000);

function pushEvent(auditId: string, event: ScanProgressEvent) {
  const state = scanStates.get(auditId);
  if (!state) return;
  (event as unknown as { _ts: number })._ts = Date.now();
  state.events.push(event);
  for (const listener of state.listeners) {
    listener(event);
  }
}

/* ──────────────────── Helpers ──────────────────── */

function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  new URL(url);
  return url;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/* ──────────────────── POST /api/audit ──────────────────── */

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

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
    ?? c.req.header('x-real-ip')
    ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return c.json({ error: 'Rate limit exceeded. Maximum 3 audits per hour.' }, 429);
  }

  // Create audit row with status 'scanning'
  const auditRows = await sql`
    INSERT INTO audits (url, domain, status, overall_score)
    VALUES (${url}, ${extractDomain(url)}, 'scanning', 0)
    RETURNING id, created_at
  `;

  const auditId = auditRows[0].id as string;

  // Initialize scan state
  const state: ScanState = { events: [], result: null, done: false, listeners: new Set() };
  scanStates.set(auditId, state);

  // Launch scan in background (non-blocking)
  void (async () => {
    try {
      const result = await scanUrl(url, (event) => pushEvent(auditId, event));

      // Update audit in DB
      await sql`
        UPDATE audits SET
          status = ${result.status},
          overall_score = ${result.overallScore},
          categories = ${JSON.stringify(result.categories)},
          error_message = ${result.errorMessage ?? null}
        WHERE id = ${auditId}
      `;

      // Insert checks
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
              raw_data: JSON.stringify(check.rawData ?? {}),
              business_note: check.businessNote ?? null,
            }))
          )}
        `;
      }

      state.result = result;
      state.done = true;
      // Push a final event to wake up SSE listeners
      pushEvent(auditId, { type: 'scan_complete', label: `Score final : ${result.overallScore}/100` });
    } catch (err) {
      console.error('[audit] Scan failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Scan failed';

      await sql`
        UPDATE audits SET status = 'failed', error_message = ${errorMessage}
        WHERE id = ${auditId}
      `;

      state.done = true;
      pushEvent(auditId, { type: 'error', label: errorMessage });
    }
  })();

  return c.json({ id: auditId });
});

/* ──────────────────── GET /api/audit/:id/progress (SSE) ──────────────────── */

app.get('/:id/progress', async (c) => {
  const id = c.req.param('id');
  const state = scanStates.get(id);

  if (!state) {
    // Scan might already be done — check DB
    const auditRows = await sql`SELECT status FROM audits WHERE id = ${id} LIMIT 1`;
    if (auditRows.length === 0) {
      return c.json({ error: 'Audit not found' }, 404);
    }
    if (auditRows[0].status === 'completed' || auditRows[0].status === 'failed') {
      // Already done, send a single complete event
      return streamSSE(c, async (stream) => {
        await stream.writeSSE({ data: JSON.stringify({ type: 'scan_complete', label: 'Audit termine' }), event: 'progress' });
      });
    }
    return c.json({ error: 'Scan state not found' }, 404);
  }

  return streamSSE(c, async (stream) => {
    // Send all past events first (replay)
    for (const event of state.events) {
      await stream.writeSSE({ data: JSON.stringify(event), event: 'progress' });
    }

    // If already done, close
    if (state.done) {
      if (state.result) {
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'result',
            result: {
              id,
              url: state.result.url,
              status: state.result.status,
              overallScore: state.result.overallScore,
              categories: state.result.categories,
              checks: state.result.checks.map((check) => ({
                ...check,
                description: check.gated ? GATED_PLACEHOLDER : check.description,
                rawData: check.gated ? {} : check.rawData,
              })),
            },
          }),
          event: 'progress',
        });
      }
      return;
    }

    // Stream live events
    await new Promise<void>((resolve) => {
      const listener = async (event: ScanProgressEvent) => {
        try {
          await stream.writeSSE({ data: JSON.stringify(event), event: 'progress' });
        } catch {
          // Client disconnected
          state.listeners.delete(listener);
          resolve();
        }

        // If scan is done, send result and close
        if (state.done && state.result) {
          try {
            await stream.writeSSE({
              data: JSON.stringify({
                type: 'result',
                result: {
                  id,
                  url: state.result.url,
                  status: state.result.status,
                  overallScore: state.result.overallScore,
                  categories: state.result.categories,
                  checks: state.result.checks.map((check) => ({
                    ...check,
                    description: check.gated ? GATED_PLACEHOLDER : check.description,
                    rawData: check.gated ? {} : check.rawData,
                  })),
                },
              }),
              event: 'progress',
            });
          } catch {
            // ignore
          }
          state.listeners.delete(listener);
          resolve();
        }
      };

      state.listeners.add(listener);

      // Safety timeout — close after 3 minutes max (scan can take 90-120s)
      setTimeout(() => {
        state.listeners.delete(listener);
        resolve();
      }, 180_000);
    });
  });
});

/* ──────────────────── GET /api/audit/:id ──────────────────── */

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
    SELECT check_id, category, name, status, description, impact, gated, raw_data, business_note
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
    rawData: isUnlocked ? (row.raw_data ?? {}) : {},
    businessNote: row.business_note ?? null,
  }));

  return c.json({
    id: audit.id,
    url: audit.url,
    status: audit.status,
    overallScore: audit.overall_score,
    categories: audit.categories,
    checks,
    errorMessage: audit.error_message,
    createdAt: audit.created_at,
  });
});

/* ──────────────────── POST /api/audit/:id/unlock ──────────────────── */

app.post('/:id/unlock', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const email = body.email;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return c.json({ error: 'Valid email is required' }, 400);
  }

  const auditRows = await sql`
    SELECT id, url, overall_score FROM audits WHERE id = ${id} LIMIT 1
  `;

  if (auditRows.length === 0) {
    return c.json({ error: 'Audit not found' }, 404);
  }

  const audit = auditRows[0];

  const contactRows = await sql`
    INSERT INTO contacts (email, first_seen_at, last_seen_at)
    VALUES (${email}, now(), now())
    ON CONFLICT (email) DO UPDATE SET last_seen_at = now()
    RETURNING id
  `;

  const contactId = contactRows[0].id as string;

  // Auto-assign "prospect" tag for new contacts
  await sql`
    INSERT INTO contact_tags (contact_id, label)
    VALUES (${contactId}, 'prospect')
    ON CONFLICT (contact_id, label) DO NOTHING
  `;

  await sql`
    UPDATE audits SET contact_id = ${contactId}, unlocked_at = now()
    WHERE id = ${id}
  `;

  await sql`
    INSERT INTO interactions (contact_id, type, metadata)
    VALUES (${contactId}, 'audit_unlock', ${JSON.stringify({
      audit_id: id,
      url: audit.url,
      score: audit.overall_score,
    })})
  `;

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
  }

  const checkRows = await sql`
    SELECT check_id, category, name, status, description, impact, gated, raw_data, business_note
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
    rawData: row.raw_data ?? {},
    businessNote: row.business_note ?? null,
  }));

  return c.json({ success: true, checks, contactId });
});

/* ──────────────────── POST /api/audit/:id/track-click ──────────────────── */

app.post('/:id/track-click', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const contactId = body.contactId;

  if (!contactId || typeof contactId !== 'string') {
    return c.json({ error: 'contactId is required' }, 400);
  }

  const auditRows = await sql`SELECT id FROM audits WHERE id = ${id} LIMIT 1`;
  const contactRows = await sql`SELECT id FROM contacts WHERE id = ${contactId} LIMIT 1`;

  if (auditRows.length === 0 || contactRows.length === 0) {
    return c.json({ error: 'Not found' }, 404);
  }

  await sql`
    INSERT INTO interactions (contact_id, type, metadata)
    VALUES (${contactId}, 'audit_email_click', ${JSON.stringify({ audit_id: id })})
  `;

  await sql`UPDATE contacts SET last_seen_at = now() WHERE id = ${contactId}`;

  return c.json({ success: true });
});

export default app;
