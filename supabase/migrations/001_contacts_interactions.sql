-- ============================================================
-- Migration: contacts + interactions (replaces leads table)
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Table: contacts — single source of truth per person (identified by email)
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  phone text,
  profile_type text,
  -- Latest qualification data (updated on each form submission)
  qualification_score integer,
  is_qualified boolean,
  -- Consent
  gdpr_consent boolean,
  gdpr_consent_at timestamptz,
  newsletter_optin boolean DEFAULT false,
  -- Latest behavioral profile
  behavioral_profile text,
  -- Timestamps
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 2. Table: interactions — every touchpoint logged
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  type text NOT NULL,        -- 'qualification_form', 'audit_unlock', 'resource_download', etc.
  metadata jsonb DEFAULT '{}', -- flexible payload per interaction type
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_interactions_contact_id ON public.interactions(contact_id);
CREATE INDEX idx_interactions_type ON public.interactions(type);

-- 3. Enable RLS (tables are accessed only via the RPC function below)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- 4. RPC function: atomic upsert contact + insert interaction
--    Uses SECURITY DEFINER to bypass RLS (runs as table owner)
CREATE OR REPLACE FUNCTION public.upsert_contact_with_interaction(
  p_email text,
  p_full_name text DEFAULT NULL,
  p_company_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_profile_type text DEFAULT NULL,
  p_qualification_score integer DEFAULT NULL,
  p_is_qualified boolean DEFAULT NULL,
  p_gdpr_consent boolean DEFAULT NULL,
  p_gdpr_consent_at timestamptz DEFAULT NULL,
  p_newsletter_optin boolean DEFAULT NULL,
  p_behavioral_profile text DEFAULT NULL,
  p_interaction_type text DEFAULT NULL,
  p_interaction_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_id uuid;
BEGIN
  -- Upsert contact: insert new or enrich existing (COALESCE = keep old value if new is null)
  INSERT INTO contacts (
    email, full_name, company_name, phone, profile_type,
    qualification_score, is_qualified,
    gdpr_consent, gdpr_consent_at, newsletter_optin,
    behavioral_profile, first_seen_at, last_seen_at
  ) VALUES (
    p_email, p_full_name, p_company_name, p_phone, p_profile_type,
    p_qualification_score, p_is_qualified,
    p_gdpr_consent, p_gdpr_consent_at, p_newsletter_optin,
    p_behavioral_profile, now(), now()
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
  RETURNING id INTO v_contact_id;

  -- Log interaction (if type provided)
  IF p_interaction_type IS NOT NULL THEN
    INSERT INTO interactions (contact_id, type, metadata)
    VALUES (v_contact_id, p_interaction_type, COALESCE(p_interaction_metadata, '{}'::jsonb));
  END IF;
END;
$$;

-- 5. Grant execute to anon role (frontend uses anon key)
GRANT EXECUTE ON FUNCTION public.upsert_contact_with_interaction TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_contact_with_interaction TO authenticated;
