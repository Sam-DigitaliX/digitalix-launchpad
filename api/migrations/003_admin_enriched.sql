-- ============================================================
-- DigitaliX — Enriched admin view with audit data + lead temperature
-- ============================================================

CREATE OR REPLACE VIEW admin_contacts_overview AS
SELECT
  c.id,
  c.email,
  c.full_name,
  c.company_name,
  c.phone,
  c.profile_type,
  c.qualification_score,
  c.is_qualified,
  c.behavioral_profile,
  c.gdpr_consent,
  c.newsletter_optin,
  c.first_seen_at,
  c.last_seen_at,
  COUNT(DISTINCT i.id)::int AS interaction_count,
  ARRAY_AGG(DISTINCT i.type) FILTER (WHERE i.type IS NOT NULL) AS interaction_types,
  MAX(i.created_at) AS last_interaction_at,
  COUNT(DISTINCT a.id)::int AS audit_count,
  MAX(a.overall_score) AS best_audit_score,
  MAX(a.created_at) AS last_audit_at,
  CASE
    WHEN c.is_qualified = true
      OR (
        array_position(ARRAY_AGG(DISTINCT i.type) FILTER (WHERE i.type IS NOT NULL), 'qualification_form') IS NOT NULL
        AND array_position(ARRAY_AGG(DISTINCT i.type) FILTER (WHERE i.type IS NOT NULL), 'audit_unlock') IS NOT NULL
      )
      THEN 'hot'
    WHEN array_position(ARRAY_AGG(DISTINCT i.type) FILTER (WHERE i.type IS NOT NULL), 'qualification_form') IS NOT NULL
      OR array_position(ARRAY_AGG(DISTINCT i.type) FILTER (WHERE i.type IS NOT NULL), 'audit_unlock') IS NOT NULL
      THEN 'warm'
    ELSE 'cold'
  END AS lead_temperature
FROM contacts c
LEFT JOIN interactions i ON i.contact_id = c.id
LEFT JOIN audits a ON a.contact_id = c.id
GROUP BY c.id
ORDER BY c.last_seen_at DESC;
