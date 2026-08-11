-- Fix account deletion 409 error
-- Run in Supabase SQL Editor

-- 1. Update delete_my_account to handle team ownership first
CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  -- Delete teams owned by this user (cascades to team_members)
  DELETE FROM public.teams WHERE owner_id = uid;
  -- Delete the user (cascades to assets, certs, employees, settings, profiles, subscriptions)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

-- 2. Add CASCADE to teams.owner_id for future safety
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_owner_id_fkey;
ALTER TABLE public.teams ADD CONSTRAINT teams_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Re-confirm grants
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;
REVOKE EXECUTE ON FUNCTION delete_my_account() FROM anon, public;
