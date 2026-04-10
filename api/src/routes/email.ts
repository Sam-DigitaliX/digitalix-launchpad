import { Hono } from 'hono';
import { sql } from '../db.js';
import { sendEmail } from '../lib/resend.js';
import {
  buildConfirmationEmail,
  buildAuditUnlockEmail,
  type ConfirmationData,
  type AuditUnlockData,
} from '../lib/email-templates.js';

const app = new Hono();

/**
 * POST /email/send
 * Replaces: supabase.functions.invoke('send-confirmation')
 */
app.post('/send-confirmation', async (c) => {
  const payload = await c.req.json();
  let subject: string;
  let html: string;
  let template_key: string;
  let toEmail: string;
  let emailMetadata: Record<string, unknown>;

  if (payload.type === 'confirmation') {
    const data = payload.data as ConfirmationData;
    const result = buildConfirmationEmail(data);
    subject = result.subject;
    html = result.html;
    template_key = result.template_key;
    toEmail = data.email;
    emailMetadata = { score: data.score, is_qualified: data.is_qualified };
  } else if (payload.type === 'audit_unlock') {
    const data = payload.data as AuditUnlockData;
    const result = buildAuditUnlockEmail(data);
    subject = result.subject;
    html = result.html;
    template_key = result.template_key;
    toEmail = data.email;
    emailMetadata = { url: data.url, score: data.score };
  } else {
    return c.json({ error: 'Unknown email type' }, 400);
  }

  // Send via Resend
  let resendId: string;
  try {
    const res = await sendEmail({ to: toEmail, subject, html });
    resendId = res.id;
  } catch (err) {
    console.error('[email/send] Resend error:', err);
    return c.json({ error: 'Email send failed', details: String(err) }, 502);
  }

  // Log email in database
  const contactRows = await sql`SELECT id FROM contacts WHERE email = ${toEmail} LIMIT 1`;
  const contactId = contactRows.length > 0 ? contactRows[0].id : null;

  const emailLogRows = await sql`
    INSERT INTO email_logs (contact_id, to_email, template_key, subject, resend_message_id, status, metadata)
    VALUES (${contactId}, ${toEmail}, ${template_key}, ${subject}, ${resendId}, 'sent', ${JSON.stringify(emailMetadata)})
    RETURNING id
  `;

  // Also log as interaction if contact exists
  if (contactId) {
    await sql`
      INSERT INTO interactions (contact_id, type, metadata)
      VALUES (${contactId}, 'email_sent', ${JSON.stringify({
        email_log_id: emailLogRows[0].id,
        template_key,
        subject,
      })})
    `;
  }

  return c.json({ success: true, message_id: resendId });
});

export default app;
