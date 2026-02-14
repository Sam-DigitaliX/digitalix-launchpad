-- ============================================================
-- Migration: Email system (logs + admin functions)
-- Run this in Supabase SQL Editor AFTER 002_admin_dashboard.sql
--
-- IMPORTANT: After deploying the Edge Function, set the Resend
-- API key as a secret:
--   supabase secrets set RESEND_API_KEY=re_xxxxx
-- ============================================================

-- 1. Table: email_logs — every email sent, with tracking columns
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  to_email text NOT NULL,
  template_key text NOT NULL,        -- 'confirmation_qualified', 'confirmation_unqualified', 'audit_unlock', etc.
  subject text,
  status text NOT NULL DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
  resend_message_id text,
  metadata jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz
);

CREATE INDEX idx_email_logs_contact_id ON public.email_logs(contact_id);
CREATE INDEX idx_email_logs_template_key ON public.email_logs(template_key);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 2. RPC: log an email (called by Edge Function via service_role key — bypasses RLS)
CREATE OR REPLACE FUNCTION public.log_email(
  p_contact_email text,
  p_to_email text,
  p_template_key text,
  p_subject text,
  p_resend_message_id text DEFAULT NULL,
  p_status text DEFAULT 'sent',
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id uuid;
  v_email_id uuid;
BEGIN
  -- Resolve contact_id from email (may be null if contact doesn't exist)
  SELECT id INTO v_contact_id FROM contacts WHERE email = p_contact_email LIMIT 1;

  INSERT INTO email_logs (contact_id, to_email, template_key, subject, resend_message_id, status, metadata)
  VALUES (v_contact_id, p_to_email, p_template_key, p_subject, p_resend_message_id, p_status, p_metadata)
  RETURNING id INTO v_email_id;

  -- Also log as interaction if contact exists
  IF v_contact_id IS NOT NULL THEN
    INSERT INTO interactions (contact_id, type, metadata)
    VALUES (v_contact_id, 'email_sent', jsonb_build_object(
      'email_log_id', v_email_id,
      'template_key', p_template_key,
      'subject', p_subject
    ));
  END IF;

  RETURN v_email_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_email TO service_role;

-- 3. Admin RPC: get email stats (protected by admin key)
CREATE OR REPLACE FUNCTION public.admin_get_email_stats(p_key text)
RETURNS TABLE (
  total_sent bigint,
  sent_today bigint,
  total_opened bigint,
  total_clicked bigint,
  open_rate numeric,
  click_rate numeric,
  top_template text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
BEGIN
  PERFORM _verify_admin_key(p_key);

  SELECT COUNT(*) INTO v_total FROM email_logs;

  RETURN QUERY
  SELECT
    v_total AS total_sent,
    (SELECT COUNT(*) FROM email_logs WHERE sent_at >= CURRENT_DATE) AS sent_today,
    (SELECT COUNT(*) FROM email_logs WHERE opened_at IS NOT NULL) AS total_opened,
    (SELECT COUNT(*) FROM email_logs WHERE clicked_at IS NOT NULL) AS total_clicked,
    CASE WHEN v_total > 0
      THEN ROUND((SELECT COUNT(*) FROM email_logs WHERE opened_at IS NOT NULL)::numeric / v_total * 100, 1)
      ELSE 0
    END AS open_rate,
    CASE WHEN v_total > 0
      THEN ROUND((SELECT COUNT(*) FROM email_logs WHERE clicked_at IS NOT NULL)::numeric / v_total * 100, 1)
      ELSE 0
    END AS click_rate,
    (SELECT el.template_key FROM email_logs el GROUP BY el.template_key ORDER BY COUNT(*) DESC LIMIT 1) AS top_template;
END;
$$;

-- 4. Admin RPC: get email logs for a contact (protected by admin key)
CREATE OR REPLACE FUNCTION public.admin_get_contact_emails(p_key text, p_contact_id uuid)
RETURNS TABLE (
  id uuid,
  template_key text,
  subject text,
  status text,
  resend_message_id text,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM _verify_admin_key(p_key);

  RETURN QUERY
  SELECT el.id, el.template_key, el.subject, el.status, el.resend_message_id, el.sent_at, el.opened_at, el.clicked_at
  FROM email_logs el
  WHERE el.contact_id = p_contact_id
  ORDER BY el.sent_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_email_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_contact_emails TO anon, authenticated;
