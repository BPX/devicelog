-- Username support for Trackstack
-- Run in Supabase SQL Editor

-- Publicly readable table for username → email resolution during login
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anyone can read (needed for login username→email resolution)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read usernames" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Owner can manage profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_username ON user_profiles(username);
