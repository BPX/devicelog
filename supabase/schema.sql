-- devicelog — Canonical Database Setup
-- Run once in Supabase SQL Editor: https://supabase.com/dashboard/project/mbsjxuymiuevankxrgmo/sql
-- 
-- This replaces: supabase-migration.sql, supabase-teams.sql, supabase-teams-fix.sql,
--   supabase-team-access.sql, supabase-teams-v2-rls.sql, supabase-consolidated.sql,
--   supabase-user-lookup.sql, supabase-delete-account.sql, supabase-usernames.sql,
--   supabase-billing.sql, supabase-security-advisory-fix.sql

-- ==========================================================================
-- 1. TABLES
-- ==========================================================================

-- Assets
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'laptop',
  manufacturer TEXT DEFAULT '',
  model TEXT DEFAULT '',
  serial_number TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  assigned_to TEXT DEFAULT '',
  location TEXT DEFAULT '',
  purchase_date DATE,
  warranty_expires DATE,
  notes TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  qr_code TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates & licenses
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'ssl_cert',
  issuer TEXT DEFAULT '',
  issued_at DATE,
  expires_at DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees / contacts
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  department TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (key-value per user or team)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID,
  key TEXT NOT NULL,
  value JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id, key)
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- User profiles (for username → email resolution)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_username ON user_profiles(username);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','team','enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','past_due','canceled','trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ==========================================================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ==========================================================================
-- 3. HELPER FUNCTIONS
-- ==========================================================================

-- Team membership check (MUST be SECURITY DEFINER — avoids RLS recursion)
CREATE OR REPLACE FUNCTION is_team_member(_team_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE public.team_members.team_id = _team_id
      AND public.team_members.user_id = auth.uid()
  );
$$;

-- User lookup by email (user_profiles → auth.users fallback)
CREATE OR REPLACE FUNCTION lookup_user(p_email TEXT)
RETURNS TABLE(user_id UUID, username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
    SELECT up.user_id, up.username
    FROM public.user_profiles up
    WHERE up.email = p_email
    LIMIT 1;
  IF FOUND THEN RETURN; END IF;

  RETURN QUERY
    SELECT au.id AS user_id, NULL::TEXT AS username
    FROM auth.users au
    WHERE au.email = p_email
    LIMIT 1;
END;
$$;

-- Account deletion (only the authenticated user can delete their own account)
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

-- ==========================================================================
-- 4. RLS POLICIES
-- ==========================================================================

-- Teams
CREATE POLICY "teams_owner" ON teams FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "teams_member_read" ON teams FOR SELECT
  USING (is_team_member(id));

-- Team members
CREATE POLICY "team_members_self" ON team_members FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "team_members_owner_insert" ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE public.teams.id = team_members.team_id
        AND public.teams.owner_id = auth.uid()
    )
  );
CREATE POLICY "team_members_roster_read" ON team_members FOR SELECT
  USING (is_team_member(team_id));

-- Assets (team-scoped OR personal)
CREATE POLICY "assets_team_access" ON assets FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- Certificates (team-scoped OR personal)
CREATE POLICY "certs_team_access" ON certificates FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- Employees (team-scoped OR personal)
CREATE POLICY "employees_team_access" ON employees FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- Settings (team-scoped OR personal)
CREATE POLICY "settings_team_access" ON settings FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- User profiles
CREATE POLICY "Anyone can read usernames" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Owner can manage profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "subscriptions_self" ON subscriptions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==========================================================================
-- 5. STORAGE BUCKET (asset images)
-- ==========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('asset-images', 'asset-images', true, 524288)
  ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "assets_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "assets_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "assets_images_select" ON storage.objects;

CREATE POLICY "assets_images_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'asset-images' AND auth.role() = 'authenticated');

CREATE POLICY "assets_images_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'asset-images' AND owner = auth.uid());

-- Note: SELECT policy intentionally omitted. 'asset-images' is a public bucket —
-- individual file URLs work without a SELECT policy. No broad listing needed.

-- ==========================================================================
-- 6. FUNCTION ACCESS CONTROL (security hardening)
-- ==========================================================================
-- Revoke from anon/public (these should be authenticated-only)
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_team_member(UUID) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.lookup_user(TEXT) FROM anon, public;

-- Ensure authenticated can call these
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_user(TEXT) TO authenticated;

-- ==========================================================================
-- 7. BACKFILL user_profiles for existing auth.users
-- ==========================================================================
INSERT INTO public.user_profiles (user_id, username, email)
  SELECT au.id, COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)), au.email
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON up.user_id = au.id
  WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
