-- Team member access — let all team members see shared data, not just the owner
-- Run in Supabase SQL Editor

-- Drop old owner-only policies
DROP POLICY IF EXISTS "Assets owner" ON assets;
DROP POLICY IF EXISTS "Certs owner" ON certificates;
DROP POLICY IF EXISTS "Emps owner" ON employees;
DROP POLICY IF EXISTS "Settings owner" ON settings;

-- Replace with team-scoped policies (owner OR member)
CREATE POLICY "Team assets" ON assets FOR ALL
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "Team certs" ON certificates FOR ALL
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "Team employees" ON employees FOR ALL
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "Team settings" ON settings FOR ALL
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));

-- Team members: anyone in the team can see membership
DROP POLICY IF EXISTS "TM self" ON team_members;
CREATE POLICY "TM team" ON team_members FOR ALL
  USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  WITH CHECK (user_id = auth.uid());

-- Teams: owner manages, members can read
DROP POLICY IF EXISTS "Teams owner" ON teams;
CREATE POLICY "Teams owner" ON teams FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Teams read" ON teams FOR SELECT
  USING (id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()));
