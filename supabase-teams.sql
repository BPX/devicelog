-- Trackstack Teams Migration
-- Run this in Supabase SQL Editor

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin','viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- 3. ADD TEAM_ID TO ALL EXISTING TABLES
ALTER TABLE assets ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey CASCADE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
ALTER TABLE settings ADD PRIMARY KEY (user_id, team_id);

-- 4. UPDATE RLS — scope by team membership
DROP POLICY IF EXISTS "Users own assets" ON assets;
DROP POLICY IF EXISTS "Users own certificates" ON certificates;
DROP POLICY IF EXISTS "Users own employees" ON employees;
DROP POLICY IF EXISTS "Users own settings" ON settings;

CREATE POLICY "Team scoped assets" ON assets FOR ALL USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Team scoped certificates" ON certificates FOR ALL USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Team scoped employees" ON employees FOR ALL USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Team scoped settings" ON settings FOR ALL USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Team members can read their own membership
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read their teams" ON team_members FOR SELECT USING (
  user_id = auth.uid() OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Teams are readable by members
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read teams" ON teams FOR SELECT USING (
  id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Owner manages team" ON teams FOR ALL USING (owner_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_assets_team ON assets(team_id);
CREATE INDEX IF NOT EXISTS idx_certificates_team ON certificates(team_id);
CREATE INDEX IF NOT EXISTS idx_employees_team ON employees(team_id);
