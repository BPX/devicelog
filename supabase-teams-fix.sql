-- NO-RECURSION TEAM POLICIES
-- Run this in Supabase SQL Editor

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Team scoped assets" ON assets;
DROP POLICY IF EXISTS "Team scoped certificates" ON certificates;
DROP POLICY IF EXISTS "Team scoped employees" ON employees;
DROP POLICY IF EXISTS "Team scoped settings" ON settings;
DROP POLICY IF EXISTS "Own membership" ON team_members;
DROP POLICY IF EXISTS "Insert membership" ON team_members;
DROP POLICY IF EXISTS "Members read" ON teams;
DROP POLICY IF EXISTS "Owner manages" ON teams;
DROP POLICY IF EXISTS "Owner manages team" ON teams;
DROP POLICY IF EXISTS "Members read their teams" ON team_members;
DROP POLICY IF EXISTS "Team membership visible" ON team_members;
DROP POLICY IF EXISTS "Teams owner access" ON teams;
DROP POLICY IF EXISTS "Teams member read" ON teams;

-- 2. TEAMS — owner does everything (no recursion)
CREATE POLICY "Teams owner" ON teams FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 3. TEAM MEMBERS — NO SUBQUERIES ON SAME TABLE
CREATE POLICY "TM self" ON team_members FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. ASSETS, CERTS, EMPLOYEES, SETTINGS — check against teams (not team_members)
CREATE POLICY "Assets owner" ON assets FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()));

CREATE POLICY "Certs owner" ON certificates FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()));

CREATE POLICY "Emps owner" ON employees FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()));

CREATE POLICY "Settings owner" ON settings FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()));
