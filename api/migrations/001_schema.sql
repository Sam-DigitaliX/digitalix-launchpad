-- ============================================================
-- DigitaliX — Full database schema (migrated from Supabase)
-- Run against the dedicated PostgreSQL on Coolify
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. contacts — single source of truth per person (email key)
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  phone text,
  profile_type text,
  qualification_score integer,
  is_qualified boolean,
  gdpr_consent boolean,
  gdpr_consent_at timestamptz,
  newsletter_optin boolean DEFAULT false,
  behavioral_profile text,
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. interactions — every touchpoint logged
-- ============================================================
CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);

-- ============================================================
-- 3. email_logs — every email sent via Resend
-- ============================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  to_email text NOT NULL,
  template_key text NOT NULL,
  subject text,
  status text NOT NULL DEFAULT 'sent',
  resend_message_id text,
  metadata jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_email_logs_contact_id ON email_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_key ON email_logs(template_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- ============================================================
-- 4. admin_config — stores admin access key (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  key text NOT NULL
);

-- ============================================================
-- 5. View: admin_contacts_overview
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
  COUNT(i.id)::int AS interaction_count,
  ARRAY_AGG(DISTINCT i.type) FILTER (WHERE i.type IS NOT NULL) AS interaction_types,
  MAX(i.created_at) AS last_interaction_at
FROM contacts c
LEFT JOIN interactions i ON i.contact_id = c.id
GROUP BY c.id
ORDER BY c.last_seen_at DESC;
