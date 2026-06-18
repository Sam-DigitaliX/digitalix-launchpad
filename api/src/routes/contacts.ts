import { Hono } from 'hono';
import { sql } from '../db.js';
import { sendLeadNotification } from '../lib/telegram.js';

const app = new Hono();

/**
 * POST /api/contacts
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
    lead_source,
    traffic_source,
    ga_client_id,
    gclid,
    interaction_type,
    interaction_metadata,
  } = body;

  if (!email) {
    return c.json({ error: 'email is required' }, 400);
  }

  // Resolve traffic source: explicit field, else the visit source in the metadata.
  const resolvedSource =
    traffic_source ??
    (interaction_metadata?.current_visit_source as string | undefined) ??
    (interaction_metadata?.first_visit_source as string | undefined) ??
    null;

  const result = await sql`
    INSERT INTO contacts (
      email, full_name, company_name, phone, profile_type,
      qualification_score, is_qualified,
      gdpr_consent, gdpr_consent_at, newsletter_optin,
      behavioral_profile, lead_source, traffic_source, ga_client_id, gclid,
      first_seen_at, last_seen_at
    ) VALUES (
      ${email}, ${full_name ?? null}, ${company_name ?? null}, ${phone ?? null}, ${profile_type ?? null},
      ${qualification_score ?? null}, ${is_qualified ?? null},
      ${gdpr_consent ?? null}, ${gdpr_consent_at ?? null}, ${newsletter_optin ?? false},
      ${behavioral_profile ?? null}, ${lead_source ?? null}, ${resolvedSource}, ${ga_client_id ?? null}, ${gclid ?? null},
      now(), now()
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
      lead_source          = COALESCE(contacts.lead_source, EXCLUDED.lead_source),
      traffic_source       = COALESCE(contacts.traffic_source, EXCLUDED.traffic_source),
      ga_client_id         = COALESCE(contacts.ga_client_id, EXCLUDED.ga_client_id),
      gclid                = COALESCE(EXCLUDED.gclid, contacts.gclid),
      last_seen_at         = now()
    RETURNING id
  `;

  const contactId = result[0].id as string;

  // Auto-assign "prospect" tag for new contacts
  await sql`
    INSERT INTO contact_tags (contact_id, label)
    VALUES (${contactId}, 'prospect')
    ON CONFLICT (contact_id, label) DO NOTHING
  `;

  if (interaction_type) {
    await sql`
      INSERT INTO interactions (contact_id, type, metadata)
      VALUES (${contactId}, ${interaction_type}, ${JSON.stringify(interaction_metadata ?? {})})
    `;
  }

  // Auto-assign "prioritaire" tag if contact is qualified (hot)
  if (is_qualified === true) {
    await sql`
      INSERT INTO contact_tags (contact_id, label)
      VALUES (${contactId}, 'prioritaire')
      ON CONFLICT (contact_id, label) DO NOTHING
    `;
  }

  // Real-time Telegram lead notification (fire-and-forget — never blocks the response).
  void sendLeadNotification({
    contactId,
    email,
    leadSource: lead_source ?? interaction_type ?? 'contact',
    interactionType: interaction_type ?? null,
    trafficSource: resolvedSource,
    profileType: profile_type ?? null,
    company: company_name ?? null,
    qualificationScore: qualification_score ?? null,
    isQualified: is_qualified ?? null,
  });

  return c.json({ success: true, contact_id: contactId });
});

export default app;
