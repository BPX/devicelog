-- Trackstack Team RLS v2 — proper multi-tenant, no recursion
-- Run in Supabase SQL Editor
-- Replaces supabase-teams-fix.sql (owner-only) with real team-scoped access

-- 0. Helper function: check team membership without recursion
CREATE OR REPLACE FUNCTION is_team_member(_team_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = _team_id
      AND team_members.user_id = auth.uid()
  );
$$;

-- 1. Drop ALL existing policies
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

-- 2. TEAMS — owner does everything, members can read
CREATE POLICY "teams_owner" ON teams FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "teams_member_read" ON teams FOR SELECT
  USING (is_team_member(id));

-- 3. TEAM MEMBERS — self-manage, members can read roster
CREATE POLICY "team_members_self" ON team_members FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "team_members_roster_read" ON team_members FOR SELECT
  USING (is_team_member(team_id));

-- 4. ASSETS — team-scoped OR personal (solo users without a team)
CREATE POLICY "assets_team_access" ON assets FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- 5. CERTIFICATES — team-scoped OR personal
CREATE POLICY "certs_team_access" ON certificates FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- 6. EMPLOYEES — team-scoped OR personal
CREATE POLICY "employees_team_access" ON employees FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- 7. SETTINGS — team-scoped OR personal
CREATE POLICY "settings_team_access" ON settings FOR ALL
  USING (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  )
  WITH CHECK (
    (team_id IS NOT NULL AND is_team_member(team_id))
    OR (team_id IS NULL AND user_id = auth.uid())
  );

-- 8. Storage bucket for asset images (run via Supabase SQL or Dashboard)
-- Create bucket via SQL (requires storage schema):
INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('asset-images', 'asset-images', true, 524288)
  ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload/delete their own images
CREATE POLICY "assets_images_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'asset-images' AND auth.role() = 'authenticated');

CREATE POLICY "assets_images_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'asset-images' AND owner = auth.uid());

-- Anyone can read (public bucket)
CREATE POLICY "assets_images_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-images');
