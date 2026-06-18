-- Lead attribution on contacts: traffic source (LinkedIn / google / referrer…),
-- lead source (qualification_form / audit_unlock…), and Google identifiers for
-- server-side conversions later (Chantier J Phase 2: MP / offline).
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS lead_source    text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS traffic_source text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS ga_client_id   text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gclid          text;
