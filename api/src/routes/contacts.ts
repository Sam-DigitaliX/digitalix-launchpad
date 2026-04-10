import { Hono } from 'hono';
import { sql } from '../db.js';

const app = new Hono();

/**
 * POST /api/contacts
 * Replaces: supabase.rpc('upsert_contact_with_interaction')
 */
app.post('/', async (c) => {
  const body = await c.req.json();
  const {
    email,
    full_name,
    company_name,
    phone,
    profile_type,
    qualification_score,
    is_qualified,
    gdpr_consent,
    gdpr_consent_at,
    newsletter_optin,
    behavioral_profile,
    interaction_type,
    interaction_metadata,
  } = body;

  if (!email) {
    return c.json({ error: 'email is required' }, 400);
  }

  const result = await sql`
    INSERT INTO contacts (
      email, full_name, company_name, phone, profile_type,
      qualification_score, is_qualified,
      gdpr_consent, gdpr_consent_at, newsletter_optin,
      behavioral_profile, first_seen_at, last_seen_at
    ) VALUES (
      ${email}, ${full_name ?? null}, ${company_name ?? null}, ${phone ?? null}, ${profile_type ?? null},
      ${qualification_score ?? null}, ${is_qualified ?? null},
      ${gdpr_consent ?? null}, ${gdpr_consent_at ?? null}, ${newsletter_optin ?? false},
      ${behavioral_profile ?? null}, now(), now()
    )
    ON CONFLICT (email) DO UPDATE SET
      full_name            = COALESCE(EXCLUDED.full_name, contacts.full_name),
      company_name         = COALESCE(EXCLUDED.company_name, contacts.company_name),
      phone                = COALESCE(EXCLUDED.phone, contacts.phone),
      profile_type         = COALESCE(EXCLUDED.profile_type, contacts.profile_type),
      qualification_score  = COALESCE(EXCLUDED.qualification_score, contacts.qualification_score),
      is_qualified         = COALESCE(EXCLUDED.is_qualified, contacts.is_qualified),
      gdpr_consent         = COALESCE(EXCLUDED.gdpr_consent, contacts.gdpr_consent),
      gdpr_consent_at      = COALESCE(EXCLUDED.gdpr_consent_at, contacts.gdpr_consent_at),
      newsletter_optin     = COALESCE(EXCLUDED.newsletter_optin, contacts.newsletter_optin),
      behavioral_profile   = COALESCE(EXCLUDED.behavioral_profile, contacts.behavioral_profile),
      last_seen_at         = now()
    RETURNING id
  `;

  const contactId = result[0].id;

  if (interaction_type) {
    await sql`
      INSERT INTO interactions (contact_id, type, metadata)
      VALUES (${contactId}, ${interaction_type}, ${JSON.stringify(interaction_metadata ?? {})})
    `;
  }

  return c.json({ success: true, contact_id: contactId });
});

export default app;
