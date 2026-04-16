-- =============================================
-- Phase 9 — Monetization Tables
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Subscription Plans (static reference)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  max_listings INTEGER NOT NULL DEFAULT 5,
  max_featured INTEGER NOT NULL DEFAULT 0,
  max_agents INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Seed plans
INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, max_listings, max_featured, max_agents, features, sort_order) VALUES
  ('free', 'Free', 0, 0, 3, 0, 0, '["3 listings", "Basic dashboard", "Chat support"]', 1),
  ('pro', 'Pro', 999, 9990, 25, 3, 5, '["25 listings", "3 featured slots", "5 agents", "Landing page builder", "Analytics", "Priority support"]', 2),
  ('business', 'Business', 2999, 29990, 999, 10, 50, '["Unlimited listings", "10 featured slots", "50 agents", "Landing page builder", "Advanced analytics", "API access", "Dedicated support"]', 3)
ON CONFLICT (id) DO NOTHING;

-- 2. User Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'past_due')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 3. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BDT',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'featured_listing', 'agent_premium')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  gateway TEXT DEFAULT 'sslcommerz',
  gateway_transaction_id TEXT,
  gateway_response JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- 4. Featured Listings
ALTER TABLE properties ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- 5. Agent Premium
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plans" ON subscription_plans FOR SELECT USING (true);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'accounts_admin'))
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'accounts_admin'))
);
