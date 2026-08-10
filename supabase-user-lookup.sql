-- User lookup function — checks user_profiles first, falls back to auth.users
-- Run this in Supabase SQL Editor (single query, after teams-v2-rls.sql is applied)

CREATE OR REPLACE FUNCTION lookup_user(p_email TEXT)
RETURNS TABLE(user_id UUID, username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- First check user_profiles (users who signed up through the app)
  RETURN QUERY
    SELECT up.user_id, up.username
    FROM public.user_profiles up
    WHERE up.email = p_email
    LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Fallback: check auth.users directly (users created in Supabase dashboard)
  RETURN QUERY
    SELECT au.id AS user_id, NULL::TEXT AS username
    FROM auth.users au
    WHERE au.email = p_email
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION lookup_user(TEXT) TO authenticated;

-- Also backfill missing user_profiles for existing auth.users who don't have entries
INSERT INTO public.user_profiles (user_id, username, email)
  SELECT au.id, COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)), au.email
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON up.user_id = au.id
  WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
