-- =============================================
-- সিরাত প্রপার্টিজ Real Estate OS — MASTER SCHEMA
-- Supabase SQL Editor-এ এই পুরো file paste করো, তারপর RUN করো
-- এটা আগের সব কিছু মুছে fresh start করবে — নিরাপদ
-- =============================================


-- ─────────────────────────────────────────
-- STEP 0: CLEAN SLATE — পুরনো সব table মুছো
-- (Fresh project হলেও নিরাপদ — IF EXISTS ব্যবহার করা হয়েছে)
-- ─────────────────────────────────────────

DROP TABLE IF EXISTS public.audit_logs            CASCADE;
DROP TABLE IF EXISTS public.tasks                 CASCADE;
DROP TABLE IF EXISTS public.ledger                CASCADE;
DROP TABLE IF EXISTS public.expenses              CASCADE;
DROP TABLE IF EXISTS public.kpi_records           CASCADE;
DROP TABLE IF EXISTS public.payroll               CASCADE;
DROP TABLE IF EXISTS public.employees             CASCADE;
DROP TABLE IF EXISTS public.saved_properties      CASCADE;
DROP TABLE IF EXISTS public.payments              CASCADE;
DROP TABLE IF EXISTS public.subscriptions         CASCADE;
DROP TABLE IF EXISTS public.subscription_plans    CASCADE;
DROP TABLE IF EXISTS public.notifications         CASCADE;
DROP TABLE IF EXISTS public.messages              CASCADE;
DROP TABLE IF EXISTS public.chats                 CASCADE;
DROP TABLE IF EXISTS public.landing_pages         CASCADE;
DROP TABLE IF EXISTS public.project_updates       CASCADE;
DROP TABLE IF EXISTS public.projects              CASCADE;
DROP TABLE IF EXISTS public.withdraw_requests     CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions   CASCADE;
DROP TABLE IF EXISTS public.wallets               CASCADE;
DROP TABLE IF EXISTS public.commissions           CASCADE;
DROP TABLE IF EXISTS public.commission_deals      CASCADE;
DROP TABLE IF EXISTS public.agent_listings        CASCADE;
DROP TABLE IF EXISTS public.agents                CASCADE;
DROP TABLE IF EXISTS public.installments          CASCADE;
DROP TABLE IF EXISTS public.bookings              CASCADE;
DROP TABLE IF EXISTS public.property_units        CASCADE;
DROP TABLE IF EXISTS public.property_images       CASCADE;
DROP TABLE IF EXISTS public.properties            CASCADE;
DROP TABLE IF EXISTS public.kyc_documents         CASCADE;
DROP TABLE IF EXISTS public.profiles              CASCADE;
DROP TABLE IF EXISTS public.users                 CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;


-- ─────────────────────────────────────────
-- STEP 1: USERS
-- ─────────────────────────────────────────

CREATE TABLE public.users (
  id            UUID PRIMARY KEY,
  email         TEXT UNIQUE,
  phone         TEXT UNIQUE,
  role          TEXT NOT NULL DEFAULT 'buyer'
                  CHECK (role IN ('buyer','seller','agent','admin','super_admin','hr_admin','accounts_admin')),
  is_verified   BOOLEAN DEFAULT false,
  is_blocked    BOOLEAN DEFAULT false,
  is_premium    BOOLEAN DEFAULT false,
  premium_until TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  address         TEXT,
  facebook_url    TEXT,
  linkedin_url    TEXT,
  whatsapp_number TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.kyc_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  doc_type    TEXT CHECK (doc_type IN ('nid','trade_license','passport')),
  doc_url     TEXT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 2: PROPERTIES
-- ─────────────────────────────────────────

CREATE TABLE public.properties (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id      UUID REFERENCES public.users(id),
  title          TEXT NOT NULL,
  description    TEXT,
  property_type  TEXT CHECK (property_type IN ('flat','land_share','commercial','duplex','plot')),
  listing_type   TEXT CHECK (listing_type IN ('sale','rent','installment')),
  price          NUMERIC,
  area_sqft      NUMERIC,
  location       TEXT,
  district       TEXT,
  address        TEXT,
  amenities      JSONB DEFAULT '[]',
  floor_number   INT,
  total_floors   INT,
  facing         TEXT,
  status         TEXT DEFAULT 'available' CHECK (status IN ('available','booked','sold')),
  is_published   BOOLEAN DEFAULT false,
  is_featured    BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.property_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  is_primary  BOOLEAN DEFAULT false,
  media_type  TEXT DEFAULT 'image' CHECK (media_type IN ('image','video')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.property_units (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor       INT,
  area_sqft   NUMERIC,
  price       NUMERIC,
  status      TEXT DEFAULT 'available' CHECK (status IN ('available','booked','sold')),
  booked_by   UUID REFERENCES public.users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 3: BOOKINGS & INSTALLMENTS
-- ─────────────────────────────────────────

CREATE TABLE public.bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id       UUID REFERENCES public.users(id),
  property_id    UUID REFERENCES public.properties(id),
  unit_id        UUID REFERENCES public.property_units(id),
  booking_type   TEXT CHECK (booking_type IN ('full_payment','installment','rent')),
  total_amount   NUMERIC,
  advance_amount NUMERIC,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  agent_id       UUID REFERENCES public.users(id),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.installments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  installment_number INT,
  due_date           DATE,
  amount             NUMERIC,
  paid_at            TIMESTAMPTZ,
  receipt_url        TEXT,
  status             TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  created_at         TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 4: AGENTS & COMMISSIONS
-- ─────────────────────────────────────────

CREATE TABLE public.agents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  license_number TEXT,
  is_premium     BOOLEAN DEFAULT false,
  total_sales    INT DEFAULT 0,
  rating         NUMERIC DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.agent_listings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID REFERENCES public.agents(id),
  property_id UUID REFERENCES public.properties(id),
  status      TEXT DEFAULT 'applied' CHECK (status IN ('applied','approved','rejected','completed')),
  applied_at  TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE public.commission_deals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_listing_id UUID REFERENCES public.agent_listings(id),
  seller_id        UUID REFERENCES public.users(id),
  agent_id         UUID REFERENCES public.agents(id),
  property_id      UUID REFERENCES public.properties(id),
  commission_type  TEXT CHECK (commission_type IN ('percentage','fixed')),
  commission_value NUMERIC,
  deadline_days    INT,
  deadline_date    DATE,
  status           TEXT DEFAULT 'active' CHECK (status IN ('active','completed','expired','cancelled')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.commissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id           UUID REFERENCES public.commission_deals(id),
  agent_id          UUID REFERENCES public.agents(id),
  booking_id        UUID REFERENCES public.bookings(id),
  sale_amount       NUMERIC,
  commission_amount NUMERIC,
  platform_cut      NUMERIC,
  agent_receivable  NUMERIC,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','paid')),
  approved_by       UUID REFERENCES public.users(id),
  created_at        TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 5: WALLET
-- ─────────────────────────────────────────

CREATE TABLE public.wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  balance         NUMERIC DEFAULT 0,
  total_earned    NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.wallet_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id    UUID REFERENCES public.wallets(id),
  type         TEXT CHECK (type IN ('credit','debit')),
  amount       NUMERIC,
  description  TEXT,
  reference_id UUID,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.withdraw_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id       UUID REFERENCES public.agents(id),
  amount         NUMERIC,
  bank_name      TEXT,
  account_number TEXT,
  account_name   TEXT,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  reviewed_by    UUID REFERENCES public.users(id),
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 6: PROJECTS & LANDING PAGES
-- ─────────────────────────────────────────

CREATE TABLE public.projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID REFERENCES public.users(id),
  property_id       UUID REFERENCES public.properties(id),
  title             TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  description       TEXT,
  start_date        DATE,
  expected_end_date DATE,
  current_progress  INT DEFAULT 0,
  status            TEXT DEFAULT 'active'
                      CHECK (status IN ('upcoming','active','ongoing','completed')),
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.project_updates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  posted_by   UUID REFERENCES public.users(id),
  title       TEXT,
  description TEXT,
  media_urls  JSONB DEFAULT '[]',
  update_type TEXT CHECK (update_type IN ('progress','announcement','milestone')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.landing_pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  sections     JSONB DEFAULT '[]',
  custom_slug  TEXT UNIQUE,
  is_published BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 7: CHAT & NOTIFICATIONS
-- ─────────────────────────────────────────

CREATE TABLE public.chats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id    UUID REFERENCES public.users(id),
  agent_id    UUID REFERENCES public.users(id),
  property_id UUID REFERENCES public.properties(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id    UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES public.users(id),
  content    TEXT,
  media_url  TEXT,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title        TEXT,
  body         TEXT,
  type         TEXT,
  reference_id UUID,
  is_read      BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 8: HR / ADMIN
-- ─────────────────────────────────────────

CREATE TABLE public.employees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id),
  employee_id TEXT UNIQUE,
  department  TEXT,
  designation TEXT,
  join_date   DATE,
  base_salary NUMERIC,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','resigned','terminated')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.payroll (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id),
  month       DATE,
  base_salary NUMERIC,
  bonus       NUMERIC DEFAULT 0,
  deductions  NUMERIC DEFAULT 0,
  net_salary  NUMERIC,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  paid_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.kpi_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.users(id),
  month           DATE,
  leads_generated INT DEFAULT 0,
  sales_closed    INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  score           NUMERIC DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_by  UUID REFERENCES public.users(id),
  category     TEXT,
  amount       NUMERIC,
  description  TEXT,
  expense_date DATE,
  receipt_url  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ledger (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             TEXT CHECK (type IN ('income','expense')),
  amount           NUMERIC,
  description      TEXT,
  reference_id     UUID,
  recorded_by      UUID REFERENCES public.users(id),
  transaction_date DATE,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES public.projects(id),
  title        TEXT NOT NULL,
  description  TEXT,
  assigned_to  UUID REFERENCES public.users(id),
  assigned_by  UUID REFERENCES public.users(id),
  status       TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','completed')),
  priority     TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.users(id),
  action     TEXT NOT NULL,
  table_name TEXT,
  record_id  UUID,
  old_value  JSONB,
  new_value  JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 9: MONETIZATION
-- ─────────────────────────────────────────

CREATE TABLE public.subscription_plans (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly  INTEGER NOT NULL DEFAULT 0,
  max_listings  INTEGER NOT NULL DEFAULT 5,
  max_featured  INTEGER NOT NULL DEFAULT 0,
  max_agents    INTEGER NOT NULL DEFAULT 0,
  features      JSONB DEFAULT '[]',
  is_active     BOOLEAN DEFAULT true,
  sort_order    INTEGER DEFAULT 0
);

INSERT INTO public.subscription_plans
  (id, name, price_monthly, price_yearly, max_listings, max_featured, max_agents, features, sort_order)
VALUES
  ('free',     'Free',     0,    0,     3,   0,  0,
   '["3 listings","Basic dashboard","Chat support"]', 1),
  ('pro',      'Pro',      999,  9990,  25,  3,  5,
   '["25 listings","3 featured slots","5 agents","Landing page builder","Analytics","Priority support"]', 2),
  ('business', 'Business', 2999, 29990, 999, 10, 50,
   '["Unlimited listings","10 featured slots","50 agents","Landing page builder","Advanced analytics","API access","Dedicated support"]', 3);

CREATE TABLE public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id              TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','expired','cancelled','past_due')),
  billing_cycle        TEXT NOT NULL DEFAULT 'monthly'
                         CHECK (billing_cycle IN ('monthly','yearly')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end   TIMESTAMPTZ NOT NULL,
  cancelled_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.payments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id        UUID REFERENCES public.subscriptions(id),
  amount                 INTEGER NOT NULL,
  currency               TEXT NOT NULL DEFAULT 'BDT',
  payment_type           TEXT NOT NULL
                           CHECK (payment_type IN ('subscription','featured_listing','agent_premium')),
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','completed','failed','refunded')),
  gateway                TEXT DEFAULT 'sslcommerz',
  gateway_transaction_id TEXT,
  gateway_response       JSONB,
  metadata               JSONB DEFAULT '{}',
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────
-- STEP 10: SAVED PROPERTIES
-- ─────────────────────────────────────────

CREATE TABLE public.saved_properties (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, property_id)
);


-- ─────────────────────────────────────────
-- STEP 11: INDEXES
-- ─────────────────────────────────────────

CREATE INDEX idx_properties_seller       ON public.properties(seller_id);
CREATE INDEX idx_properties_published    ON public.properties(is_published) WHERE is_published = true;
CREATE INDEX idx_properties_coords       ON public.properties(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_bookings_buyer          ON public.bookings(buyer_id);
CREATE INDEX idx_bookings_property       ON public.bookings(property_id);
CREATE INDEX idx_installments_booking    ON public.installments(booking_id);
CREATE INDEX idx_notifications_user      ON public.notifications(user_id);
CREATE INDEX idx_messages_chat           ON public.messages(chat_id);
CREATE INDEX idx_agent_listings_agent    ON public.agent_listings(agent_id);
CREATE INDEX idx_agent_listings_property ON public.agent_listings(property_id);
CREATE INDEX idx_subscriptions_user      ON public.subscriptions(user_id);
CREATE INDEX idx_payments_user           ON public.payments(user_id);
CREATE INDEX idx_saved_properties_user   ON public.saved_properties(user_id);
CREATE INDEX idx_projects_seller         ON public.projects(seller_id);
CREATE INDEX idx_projects_slug           ON public.projects(slug);


-- ─────────────────────────────────────────
-- STEP 12: AUTH TRIGGER
-- User sign up করলে auto users + profiles + wallets তৈরি হবে
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'buyer')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────
-- STEP 13: REALTIME
-- ─────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- ─────────────────────────────────────────
-- STEP 14: ROW LEVEL SECURITY
-- ─────────────────────────────────────────

-- ── users ──
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_select_admin"
  ON public.users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','hr_admin','accounts_admin')
  ));

CREATE POLICY "users_update_admin"
  ON public.users FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin')
  ));

-- ── profiles ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ── kyc_documents ──
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kyc_select_own"
  ON public.kyc_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "kyc_insert_own"
  ON public.kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kyc_select_admin"
  ON public.kyc_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin')
  ));

CREATE POLICY "kyc_update_admin"
  ON public.kyc_documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin')
  ));

-- ── properties ──
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_select_published"
  ON public.properties FOR SELECT
  USING (is_published = true);

CREATE POLICY "properties_select_own"
  ON public.properties FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "properties_insert_own"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "properties_update_own"
  ON public.properties FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "properties_delete_own"
  ON public.properties FOR DELETE
  USING (auth.uid() = seller_id);

CREATE POLICY "properties_select_admin"
  ON public.properties FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin')
  ));

-- ── property_images ──
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_images_select_all"
  ON public.property_images FOR SELECT USING (true);

CREATE POLICY "property_images_manage_seller"
  ON public.property_images FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.seller_id = auth.uid()
  ));

-- ── property_units ──
ALTER TABLE public.property_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_units_select_all"
  ON public.property_units FOR SELECT USING (true);

CREATE POLICY "property_units_manage_seller"
  ON public.property_units FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.seller_id = auth.uid()
  ));

-- ── bookings ──
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_buyer"
  ON public.bookings FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "bookings_select_seller"
  ON public.bookings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.seller_id = auth.uid()
  ));

CREATE POLICY "bookings_select_admin"
  ON public.bookings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','accounts_admin')
  ));

-- ── installments ──
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "installments_select_buyer"
  ON public.installments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.buyer_id = auth.uid()
  ));

CREATE POLICY "installments_select_seller"
  ON public.installments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.properties p ON p.id = b.property_id
    WHERE b.id = booking_id AND p.seller_id = auth.uid()
  ));

-- ── agents ──
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_select_all"
  ON public.agents FOR SELECT USING (true);

CREATE POLICY "agents_manage_own"
  ON public.agents FOR ALL
  USING (auth.uid() = user_id);

-- ── agent_listings ──
ALTER TABLE public.agent_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_listings_select_agent"
  ON public.agent_listings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents a WHERE a.id = agent_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "agent_listings_insert_agent"
  ON public.agent_listings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agents a WHERE a.id = agent_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "agent_listings_select_seller"
  ON public.agent_listings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.seller_id = auth.uid()
  ));

CREATE POLICY "agent_listings_update_seller"
  ON public.agent_listings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.seller_id = auth.uid()
  ));

CREATE POLICY "agent_listings_select_approved"
  ON public.agent_listings FOR SELECT
  USING (status = 'approved');

-- ── commission_deals ──
ALTER TABLE public.commission_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commission_deals_select_agent"
  ON public.commission_deals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents a WHERE a.id = agent_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "commission_deals_select_seller"
  ON public.commission_deals FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "commission_deals_insert_seller"
  ON public.commission_deals FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "commission_deals_update_agent"
  ON public.commission_deals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.agents a WHERE a.id = agent_id AND a.user_id = auth.uid()
  ));

-- ── commissions ──
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "commissions_select_agent"
  ON public.commissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents a WHERE a.id = agent_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "commissions_select_admin"
  ON public.commissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','accounts_admin')
  ));

-- ── wallets ──
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_select_own"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

-- ── wallet_transactions ──
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_tx_select_own"
  ON public.wallet_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.wallets w
    WHERE w.id = wallet_id AND w.user_id = auth.uid()
  ));

-- ── withdraw_requests ──
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "withdraw_select_agent"
  ON public.withdraw_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agents a
    WHERE a.id = agent_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "withdraw_insert_agent"
  ON public.withdraw_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agents a
    WHERE a.id = agent_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "withdraw_select_admin"
  ON public.withdraw_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','accounts_admin')
  ));

CREATE POLICY "withdraw_update_admin"
  ON public.withdraw_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','accounts_admin')
  ));

-- ── projects ──
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_all"
  ON public.projects FOR SELECT USING (true);

CREATE POLICY "projects_manage_seller"
  ON public.projects FOR ALL
  USING (auth.uid() = seller_id);

-- ── project_updates ──
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_updates_select_all"
  ON public.project_updates FOR SELECT USING (true);

CREATE POLICY "project_updates_manage_seller"
  ON public.project_updates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.seller_id = auth.uid()
  ));

-- ── landing_pages ──
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "landing_pages_select_published"
  ON public.landing_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "landing_pages_manage_seller"
  ON public.landing_pages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.seller_id = auth.uid()
  ));

-- ── chats ──
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chats_select_participant"
  ON public.chats FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

CREATE POLICY "chats_insert_participant"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = agent_id);

-- ── messages ──
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id = chat_id
    AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid())
  ));

CREATE POLICY "messages_insert_sender"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ── notifications ──
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ── tasks ──
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_manage_admin"
  ON public.tasks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','hr_admin')
  ));

CREATE POLICY "tasks_select_assigned"
  ON public.tasks FOR SELECT
  USING (auth.uid() = assigned_to);

-- ── employees ──
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_manage_admin"
  ON public.employees FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','hr_admin')
  ));

-- ── payroll ──
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payroll_manage_admin"
  ON public.payroll FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','hr_admin','accounts_admin')
  ));

-- ── expenses ──
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_manage_admin"
  ON public.expenses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','accounts_admin')
  ));

-- ── kpi_records ──
ALTER TABLE public.kpi_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kpi_select_own"
  ON public.kpi_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "kpi_manage_admin"
  ON public.kpi_records FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','hr_admin')
  ));

-- ── ledger ──
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ledger_manage_admin"
  ON public.ledger FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','accounts_admin')
  ));

-- ── audit_logs ──
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_superadmin"
  ON public.audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'super_admin'
  ));

-- ── subscription_plans ──
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_select_all"
  ON public.subscription_plans FOR SELECT USING (true);

-- ── subscriptions ──
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_select_admin"
  ON public.subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','accounts_admin')
  ));

-- ── payments ──
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "payments_select_admin"
  ON public.payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid()
    AND u.role IN ('admin','super_admin','accounts_admin')
  ));

-- ── saved_properties ──
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_select_own"
  ON public.saved_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_insert_own"
  ON public.saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_delete_own"
  ON public.saved_properties FOR DELETE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────
-- DONE! সব tables, trigger, RLS তৈরি হয়েছে।
-- ─────────────────────────────────────────
