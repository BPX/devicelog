-- Fix Supabase Security Advisory warnings (8 → 0)
-- Run this entire script in Supabase SQL Editor (project: mbsjxuymiuevankxrgmo)
--
-- Fixes:
--   1. public_bucket_allows_listing         → Drop broad SELECT policy on asset-images
--   2. anon_security_definer_function       → Revoke EXECUTE from anon/public (3 functions)
--   3. authenticated_security_definer...    → Already correct; anon revoke satisfies both
--   4. auth_leaked_password_protection      → Must be enabled in Dashboard (see below)
-- ==========================================================================

-- ==========================================================================
-- FIX 1: Public Bucket Allows Listing
-- ==========================================================================
-- 'asset-images' is a public bucket. Individual files are accessible by
-- direct URL without any SELECT policy. The broad policy (no owner filter)
-- only enables LISTING all files — drop it.
-- ==========================================================================
DROP POLICY IF EXISTS "assets_images_select" ON storage.objects;

-- ==========================================================================
-- FIX 2 & 3: SECURITY DEFINER functions exposed to anon
-- ==========================================================================
-- is_team_member MUST stay SECURITY DEFINER (it's used in RLS policies that
-- would recurse under SECURITY INVOKER), but anon gets NULL from auth.uid()
-- so the function is useless to them anyway.
-- ==========================================================================

-- Revoke EXECUTE from anon role (blocks unauthenticated access)
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_team_member(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.lookup_user(TEXT) FROM anon;

-- Revoke from public role (catches DEFAULT grants)
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM public;
REVOKE EXECUTE ON FUNCTION public.is_team_member(UUID) FROM public;
REVOKE EXECUTE ON FUNCTION public.lookup_user(TEXT) FROM public;

-- Re-confirm authenticated can still call these
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_user(TEXT) TO authenticated;
