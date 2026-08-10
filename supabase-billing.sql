-- Trackstack Billing — Stripe subscriptions
-- Run in Supabase SQL Editor

-- 1. Subscriptions table
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

-- 2. RLS — users read/write their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_self" ON subscriptions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Edge function schema for storing Stripe secrets
-- Run via Supabase CLI: supabase secrets set STRIPE_SECRET_KEY=sk_live_...
-- And: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
