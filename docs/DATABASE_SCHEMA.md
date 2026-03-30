# DATABASE_SCHEMA.md — সিরাত প্রপার্টিজ Real Estate OS

## Database: PostgreSQL via Supabase

---

## Table List (Overview)

1. `users`
2. `profiles`
3. `kyc_documents`
4. `properties`
5. `property_images`
6. `property_units`
7. `bookings`
8. `installments`
9. `agents`
10. `agent_listings`
11. `commission_deals`
12. `commissions`
13. `wallets`
14. `wallet_transactions`
15. `withdraw_requests`
16. `projects`
17. `project_updates`
18. `landing_pages`
19. `chats`
20. `messages`
21. `notifications`
22. `employees`
23. `payroll`
24. `kpi_records`
25. `expenses`
26. `ledger`
27. `tasks`
28. `audit_logs`
29. `subscriptions`

---

## Schema Details

### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'agent', 'admin', 'super_admin', 'hr_admin', 'accounts_admin')),
  is_verified BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. profiles
```sql
CREATE TABLE profiles (
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
```

### 3. kyc_documents
```sql
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doc_type TEXT CHECK (doc_type IN ('nid', 'trade_license', 'passport')),
  doc_url TEXT NOT NULL,          -- Supabase Storage URL
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. properties
```sql
CREATE TABLE properties (
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
  amenities JSONB DEFAULT '[]',   -- ['lift', 'parking', 'generator', ...]
  floor_number INT,
  total_floors INT,
  facing TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'sold')),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. property_images
```sql
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,              -- Supabase Storage URL
  is_primary BOOLEAN DEFAULT false,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6. property_units
-- For land share / apartment projects with multiple units
```sql
CREATE TABLE property_units (
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
```

### 7. bookings
```sql
CREATE TABLE bookings (
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
```

### 8. installments
```sql
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  installment_number INT,
  due_date DATE,
  amount NUMERIC,
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,               -- Auto-generated receipt
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 9. agents
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  license_number TEXT,
  is_premium BOOLEAN DEFAULT false,
  total_sales INT DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 10. agent_listings
-- Agent applies to a property listing
```sql
CREATE TABLE agent_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  property_id UUID REFERENCES properties(id),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'rejected', 'completed')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);
```

### 11. commission_deals
-- Negotiated deal between seller and agent
```sql
CREATE TABLE commission_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_listing_id UUID REFERENCES agent_listings(id),
  seller_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agents(id),
  property_id UUID REFERENCES properties(id),
  commission_type TEXT CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value NUMERIC,       -- % or fixed BDT amount
  deadline_days INT,              -- e.g. 90 days to sell
  deadline_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 12. commissions
-- When a deal is completed, commission is calculated
```sql
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES commission_deals(id),
  agent_id UUID REFERENCES agents(id),
  booking_id UUID REFERENCES bookings(id),
  sale_amount NUMERIC,
  commission_amount NUMERIC,
  platform_cut NUMERIC,           -- Platform fee
  agent_receivable NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 13. wallets
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 14. wallet_transactions
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id),
  type TEXT CHECK (type IN ('credit', 'debit')),
  amount NUMERIC,
  description TEXT,
  reference_id UUID,              -- commission_id or withdraw_id
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 15. withdraw_requests
```sql
CREATE TABLE withdraw_requests (
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
```

### 16. projects
-- Construction projects that buyers can follow
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,      -- for landing page URL
  description TEXT,
  start_date DATE,
  expected_end_date DATE,
  current_progress INT DEFAULT 0, -- 0-100%
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 17. project_updates
-- Construction updates (photos/videos posted by seller)
```sql
CREATE TABLE project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  posted_by UUID REFERENCES users(id),
  title TEXT,
  description TEXT,
  media_urls JSONB DEFAULT '[]',  -- array of Supabase Storage URLs
  update_type TEXT CHECK (update_type IN ('progress', 'announcement', 'milestone')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 18. landing_pages
-- Drag & drop landing page per project
```sql
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sections JSONB DEFAULT '[]',    -- drag & drop section layout JSON
  custom_slug TEXT UNIQUE,        -- domain.com/projects/custom-slug
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 19. chats
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 20. messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 21. notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT,
  type TEXT,                      -- 'booking', 'commission', 'kyc', 'task', etc.
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 22. employees
```sql
CREATE TABLE employees (
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
```

### 23. payroll
```sql
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  month DATE,                     -- first day of the month
  base_salary NUMERIC,
  bonus NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  net_salary NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 24. kpi_records
```sql
CREATE TABLE kpi_records (
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
```

### 25. expenses
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_by UUID REFERENCES users(id),
  category TEXT,                  -- 'office_rent', 'utilities', 'salary', 'marketing', etc.
  amount NUMERIC,
  description TEXT,
  expense_date DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 26. ledger
```sql
CREATE TABLE ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('income', 'expense')),
  amount NUMERIC,
  description TEXT,
  reference_id UUID,
  recorded_by UUID REFERENCES users(id),
  transaction_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 27. tasks
```sql
CREATE TABLE tasks (
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
```

### 28. audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,           -- e.g. "changed commission", "approved KYC"
  table_name TEXT,
  record_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 29. subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  plan TEXT CHECK (plan IN ('basic', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  amount_paid NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Key Relationships (Summary)

```
users ──────── profiles (1:1)
users ──────── kyc_documents (1:many)
users ──────── wallets (1:1)
users ──────── agents (1:1, if role=agent)
users ──────── employees (1:1, if internal staff)

properties ─── property_images (1:many)
properties ─── property_units (1:many)
properties ─── projects (1:1)
properties ─── agent_listings (1:many)

bookings ────── installments (1:many)
bookings ────── commissions (1:1)

agent_listings ── commission_deals (1:1)
commission_deals ── commissions (1:1)
commissions ──── wallet_transactions (1:1)

projects ────── project_updates (1:many)
projects ────── landing_pages (1:1)
projects ────── tasks (1:many)

chats ──────── messages (1:many)
```
