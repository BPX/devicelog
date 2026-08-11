-- Fix account deletion 409 error
-- Run in Supabase SQL Editor (project: mbsjxuymiuevankxrgmo)

CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  -- Team-scoped data (must go before the team itself)
  DELETE FROM public.settings WHERE team_id IN (SELECT id FROM public.teams WHERE owner_id = uid);
  DELETE FROM public.employees WHERE team_id IN (SELECT id FROM public.teams WHERE owner_id = uid);
  DELETE FROM public.certificates WHERE team_id IN (SELECT id FROM public.teams WHERE owner_id = uid);
  DELETE FROM public.assets WHERE team_id IN (SELECT id FROM public.teams WHERE owner_id = uid);
  DELETE FROM public.team_members WHERE team_id IN (SELECT id FROM public.teams WHERE owner_id = uid);
  DELETE FROM public.teams WHERE owner_id = uid;

  -- User-scoped data
  DELETE FROM public.settings WHERE user_id = uid;
  DELETE FROM public.employees WHERE user_id = uid;
  DELETE FROM public.certificates WHERE user_id = uid;
  DELETE FROM public.assets WHERE user_id = uid;
  DELETE FROM public.subscriptions WHERE user_id = uid;
  DELETE FROM public.user_profiles WHERE user_id = uid;

  -- Auth data
  DELETE FROM auth.sessions WHERE user_id = uid;
  DELETE FROM auth.mfa_factors WHERE user_id = uid;
  DELETE FROM auth.identities WHERE user_id = uid;

  -- Finally
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;
REVOKE EXECUTE ON FUNCTION delete_my_account() FROM anon, public;
