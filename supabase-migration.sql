-- Trackstack Supabase Migration
-- Run this in the Supabase SQL Editor (https://mbsjxuymiuevankxrgmo.supabase.com)

-- 1. ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'laptop',
  manufacturer TEXT DEFAULT '',
  model TEXT DEFAULT '',
  serial_number TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  assigned_to TEXT DEFAULT '',
  location TEXT DEFAULT '',
  purchase_date TEXT,
  warranty_expires TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CERTIFICATES TABLE  
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'ssl_cert',
  issuer TEXT DEFAULT '',
  expires_at TEXT NOT NULL,
  notify_before_days INTEGER DEFAULT 30,
  document TEXT,
  doc_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  department TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SETTINGS TABLE (one row per user)
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  categories JSONB DEFAULT '["laptop","desktop","monitor","phone","tablet","server","printer","network","software","license","other"]',
  statuses JSONB DEFAULT '["active","maintenance","retired","lost"]',
  cert_types JSONB DEFAULT '["ssl_cert","software_license","support_contract","domain","other"]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users own assets" ON assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own certificates" ON certificates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own employees" ON employees FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own settings" ON settings FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
