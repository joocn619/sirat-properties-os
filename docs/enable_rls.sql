-- =============================================
-- Sirat Properties — Row Level Security (RLS) Policies
-- Run this in Supabase SQL Editor for production
-- =============================================

-- ── 1. users ──
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'hr_admin', 'accounts_admin'))
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
  );

-- ── 2. profiles ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 3. kyc_documents ──
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own KYC" ON kyc_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC" ON kyc_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all KYC" ON kyc_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update KYC" ON kyc_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
  );

-- ── 4. properties ──
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published properties" ON properties
  FOR SELECT USING (status = 'published');

CREATE POLICY "Sellers can read own properties" ON properties
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = seller_id);

CREATE POLICY "Admins can read all properties" ON properties
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin'))
  );

-- ── 5. property_images ──
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read property images" ON property_images
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage own property images" ON property_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.seller_id = auth.uid())
  );

-- ── 6. property_units ──
ALTER TABLE property_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read units of published properties" ON property_units
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage own property units" ON property_units
  FOR ALL USING (
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.seller_id = auth.uid())
  );

-- ── 7. bookings ──
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can read own bookings" ON bookings
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can read bookings on their properties" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.seller_id = auth.uid())
  );

CREATE POLICY "Admins can read all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'accounts_admin'))
  );

-- ── 8. installments ──
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can read own installments" ON installments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.buyer_id = auth.uid())
  );

CREATE POLICY "Sellers can read installments on their bookings" ON installments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.id = booking_id AND p.seller_id = auth.uid()
    )
  );

-- ── 9. agent_listings ──
ALTER TABLE agent_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can read own applications" ON agent_listings
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert own applications" ON agent_listings
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Sellers can read applications on their properties" ON agent_listings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.seller_id = auth.uid())
  );

CREATE POLICY "Sellers can update applications on their properties" ON agent_listings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.seller_id = auth.uid())
  );

CREATE POLICY "Public can read approved agents for published properties" ON agent_listings
  FOR SELECT USING (status = 'approved');

-- ── 10. commission_deals ──
ALTER TABLE commission_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can read own deals" ON commission_deals
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Sellers can read deals they created" ON commission_deals
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert deals" ON commission_deals
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Agents can update deals (respond)" ON commission_deals
  FOR UPDATE USING (auth.uid() = agent_id);

-- ── 11. wallets ──
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- ── 12. wallet_transactions ──
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM wallets w WHERE w.id = wallet_id AND w.user_id = auth.uid())
  );

-- ── 13. withdraw_requests ──
ALTER TABLE withdraw_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own withdrawals" ON withdraw_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals" ON withdraw_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all withdrawals" ON withdraw_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'accounts_admin'))
  );

CREATE POLICY "Admins can update withdrawals" ON withdraw_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'accounts_admin'))
  );

-- ── 14. chats ──
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chats" ON chats
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

CREATE POLICY "Users can insert chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = agent_id);

-- ── 15. messages ──
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can read messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chats c WHERE c.id = chat_id AND (c.buyer_id = auth.uid() OR c.agent_id = auth.uid()))
  );

CREATE POLICY "Chat participants can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ── 16. projects ──
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage own projects" ON projects
  FOR ALL USING (auth.uid() = seller_id);

-- ── 17. project_updates ──
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read project updates" ON project_updates
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage updates on own projects" ON project_updates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.seller_id = auth.uid())
  );

-- ── 18. landing_pages ──
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published landing pages" ON landing_pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Sellers can manage own landing pages" ON landing_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.seller_id = auth.uid())
  );

-- ── 19. notifications ──
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark read)" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ── 20. tasks (Kanban) ──
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all tasks" ON tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'hr_admin'))
  );

CREATE POLICY "Employees can read assigned tasks" ON tasks
  FOR SELECT USING (auth.uid() = assigned_to);

-- ── 21. employees ──
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR/Admin can manage employees" ON employees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'hr_admin'))
  );

-- ── 22. payroll ──
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR/Admin can manage payroll" ON payroll
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'hr_admin', 'accounts_admin'))
  );

-- ── 23. expenses ──
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accounts/Admin can manage expenses" ON expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin', 'accounts_admin'))
  );

-- ── 24. audit_logs ──
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
  );

-- ── NOTE ──
-- Service role key (used in API routes via createAdminClient) bypasses RLS.
-- This is intentional — server-side operations need full access.
-- Only the browser client (anon key) is restricted by these policies.
