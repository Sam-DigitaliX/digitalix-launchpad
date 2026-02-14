-- ============================================================
-- Migration: Admin dashboard views + RPC functions
-- Run this in Supabase SQL Editor AFTER 001_contacts_interactions.sql
--
-- IMPORTANT: After running this, set your admin key:
--   ALTER DATABASE postgres SET app.settings.admin_key = 'CHANGE-ME-to-a-strong-secret';
--   Then reconnect (or run: SELECT pg_reload_conf();)
-- ============================================================

-- 1. Materialized-style view for quick Supabase dashboard queries
CREATE OR REPLACE VIEW public.admin_contacts_overview AS
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

-- 2. RPC: list all contacts with interaction summary (protected by admin key)
CREATE OR REPLACE FUNCTION public.admin_get_contacts(p_key text)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  company_name text,
  phone text,
  profile_type text,
  qualification_score integer,
  is_qualified boolean,
  behavioral_profile text,
  gdpr_consent boolean,
  newsletter_optin boolean,
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  interaction_count integer,
  interaction_types text[],
  last_interaction_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_key IS NULL OR p_key != COALESCE(current_setting('app.settings.admin_key', true), '') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT * FROM admin_contacts_overview;
END;
$$;

-- 3. RPC: get interaction timeline for a specific contact (protected by admin key)
CREATE OR REPLACE FUNCTION public.admin_get_contact_timeline(p_key text, p_contact_id uuid)
RETURNS TABLE (
  id uuid,
  type text,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_key IS NULL OR p_key != COALESCE(current_setting('app.settings.admin_key', true), '') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT i.id, i.type, i.metadata, i.created_at
  FROM interactions i
  WHERE i.contact_id = p_contact_id
  ORDER BY i.created_at DESC;
END;
$$;

-- 4. RPC: get dashboard stats (protected by admin key)
CREATE OR REPLACE FUNCTION public.admin_get_stats(p_key text)
RETURNS TABLE (
  total_contacts bigint,
  qualified_count bigint,
  total_interactions bigint,
  interactions_today bigint,
  top_interaction_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_key IS NULL OR p_key != COALESCE(current_setting('app.settings.admin_key', true), '') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM contacts) AS total_contacts,
    (SELECT COUNT(*) FROM contacts WHERE is_qualified = true) AS qualified_count,
    (SELECT COUNT(*) FROM interactions) AS total_interactions,
    (SELECT COUNT(*) FROM interactions WHERE created_at >= CURRENT_DATE) AS interactions_today,
    (SELECT i2.type FROM interactions i2 GROUP BY i2.type ORDER BY COUNT(*) DESC LIMIT 1) AS top_interaction_type;
END;
$$;

-- 5. Grant execute to anon + authenticated
GRANT EXECUTE ON FUNCTION public.admin_get_contacts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_contact_timeline TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_stats TO anon, authenticated;
