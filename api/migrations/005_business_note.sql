-- ============================================================
-- DigitaliX — Add business_note column to audit_checks
-- ============================================================

ALTER TABLE audit_checks ADD COLUMN IF NOT EXISTS business_note text;
