-- Trackstack — Consolidated SQL (run once, in order)
-- Run this in Supabase SQL Editor at https://mbsjxuymiuevankxrgmo.supabase.com
-- This replaces supabase-teams-v2-rls.sql + supabase-user-lookup.sql

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. Helper function: check team membership without recursion
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. User lookup function (user_profiles → auth.users fallback)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

GRANT EXECUTE ON FUNCTION lookup_user(TEXT) TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. Drop ALL existing policies on team-scoped tables
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename IN ('assets','certificates','employees','settings','team_members','teams')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. TEAMS — owner does everything, members can read
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE POLICY "teams_owner" ON teams FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "teams_member_read" ON teams FOR SELECT
  USING (is_team_member(id));

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. TEAM MEMBERS — self, owner can add, members can read roster
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. ASSETS — team-scoped OR personal
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE POLICY "assets_team_access" ON assets FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. CERTIFICATES — team-scoped OR personal
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE POLICY "certs_team_access" ON certificates FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. EMPLOYEES — team-scoped OR personal
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE POLICY "employees_team_access" ON employees FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9. SETTINGS — team-scoped OR personal
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE POLICY "settings_team_access" ON settings FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 10. Storage bucket for asset images
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('asset-images', 'asset-images', true, 524288)
  ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "assets_images_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'asset-images' AND auth.role() = 'authenticated');

CREATE POLICY "assets_images_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'asset-images' AND owner = auth.uid());

CREATE POLICY "assets_images_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-images');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 11. Backfill user_profiles for existing auth.users
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO public.user_profiles (user_id, username, email)
  SELECT au.id, COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)), au.email
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON up.user_id = au.id
  WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
