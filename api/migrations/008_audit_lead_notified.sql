-- Idempotency guard for the deferred lead notification: the unlock path and the
-- scan-completion path can both want to notify; the atomic claim
-- (UPDATE ... WHERE lead_notified_at IS NULL RETURNING) guarantees exactly-once.
ALTER TABLE audits ADD COLUMN IF NOT EXISTS lead_notified_at timestamptz;
