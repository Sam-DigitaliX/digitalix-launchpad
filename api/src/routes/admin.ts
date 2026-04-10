import { Hono } from 'hono';
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
      (SELECT i2.type FROM interactions i2 GROUP BY i2.type ORDER BY COUNT(*) DESC LIMIT 1) AS top_interaction_type
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

export default app;
