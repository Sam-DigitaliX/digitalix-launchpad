-- Add partner attribution to audits.
-- When a user scans via /partenaires/<slug>, partner_slug is persisted
-- so we can auto-tag the contact at unlock and report leads per partner.

ALTER TABLE audits
  ADD COLUMN IF NOT EXISTS partner_slug text NULL;

CREATE INDEX IF NOT EXISTS idx_audits_partner_slug ON audits (partner_slug) WHERE partner_slug IS NOT NULL;
