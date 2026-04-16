-- =============================================
-- সিরাত প্রপার্টিজ Real Estate OS
-- Full Database Schema
-- Supabase SQL Editor-এ paste করে run করো
-- =============================================

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'agent', 'admin', 'super_admin', 'hr_admin', 'accounts_admin')),
  is_verified BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  address TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  whatsapp_number TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. kyc_documents
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doc_type TEXT CHECK (doc_type IN ('nid', 'trade_license', 'passport')),
  doc_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT CHECK (property_type IN ('flat', 'land_share', 'commercial', 'duplex', 'plot')),
  listing_type TEXT CHECK (listing_type IN ('sale', 'rent', 'installment')),
  price NUMERIC,
  area_sqft NUMERIC,
  location TEXT,
  district TEXT,
  address TEXT,
  amenities JSONB DEFAULT '[]',
  floor_number INT,
  total_floors INT,
  facing TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'sold')),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. property_images
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. property_units
CREATE TABLE IF NOT EXISTS property_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INT,
  area_sqft NUMERIC,
  price NUMERIC,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'sold')),
  booked_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES property_units(id),
  booking_type TEXT CHECK (booking_type IN ('full_payment', 'installment', 'rent')),
  total_amount NUMERIC,
  advance_amount NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  agent_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. installments
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  installment_number INT,
  due_date DATE,
  amount NUMERIC,
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  license_number TEXT,
  is_premium BOOLEAN DEFAULT false,
  total_sales INT DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. agent_listings
CREATE TABLE IF NOT EXISTS agent_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  property_id UUID REFERENCES properties(id),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'rejected', 'completed')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- 11. commission_deals
CREATE TABLE IF NOT EXISTS commission_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_listing_id UUID REFERENCES agent_listings(id),
  seller_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  property_id UUID REFERENCES properties(id),
  commission_type TEXT CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value NUMERIC,
  deadline_days INT,
  deadline_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. commissions
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES commission_deals(id),
  agent_id UUID REFERENCES agents(id),
  booking_id UUID REFERENCES bookings(id),
  sale_amount NUMERIC,
  commission_amount NUMERIC,
  platform_cut NUMERIC,
  agent_receivable NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. wallets
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. wallet_transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id),
  type TEXT CHECK (type IN ('credit', 'debit')),
  amount NUMERIC,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. withdraw_requests
CREATE TABLE IF NOT EXISTS withdraw_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  amount NUMERIC,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  start_date DATE,
  expected_end_date DATE,
  current_progress INT DEFAULT 0,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. project_updates
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  posted_by UUID REFERENCES users(id),
  title TEXT,
  description TEXT,
  media_urls JSONB DEFAULT '[]',
  update_type TEXT CHECK (update_type IN ('progress', 'announcement', 'milestone')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. landing_pages
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sections JSONB DEFAULT '[]',
  custom_slug TEXT UNIQUE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 19. chats
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 21. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT,
  type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 22. employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  employee_id TEXT UNIQUE,
  department TEXT,
  designation TEXT,
  join_date DATE,
  base_salary NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resigned', 'terminated')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 23. payroll
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  month DATE,
  base_salary NUMERIC,
  bonus NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_salary NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 24. kpi_records
CREATE TABLE IF NOT EXISTS kpi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  month DATE,
  leads_generated INT DEFAULT 0,
  sales_closed INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  score NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 25. expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_by UUID REFERENCES users(id),
  category TEXT,
  amount NUMERIC,
  description TEXT,
  expense_date DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 26. ledger
CREATE TABLE IF NOT EXISTS ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('income', 'expense')),
  amount NUMERIC,
  description TEXT,
  reference_id UUID,
  recorded_by UUID REFERENCES users(id),
  transaction_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 27. tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 28. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 29. subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  plan TEXT CHECK (plan IN ('basic', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  amount_paid NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Realtime enable করো
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- Done! সব 29টা table তৈরি হয়ে গেছে।
-- =============================================
