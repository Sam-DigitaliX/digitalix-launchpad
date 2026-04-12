-- ============================================================
-- DigitaliX — Audit tracking tables
-- ============================================================

-- 1. audits — one row per scan request
CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  overall_score integer,
  categories jsonb,
  error_message text,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audits_domain ON audits(domain);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);

-- 2. audit_checks — one row per check result
CREATE TABLE IF NOT EXISTS audit_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  check_id text NOT NULL,
  category text NOT NULL,
  name text NOT NULL,
  status text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL,
  gated boolean NOT NULL DEFAULT false,
  raw_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_checks_audit_id ON audit_checks(audit_id);
