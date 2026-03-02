-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In a production setting, you'd insert your initial admin user manually like so:
-- INSERT INTO admins (id) VALUES ('your-auth-user-id');

-- 2. Link Businesses to Users (for Client Portal)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Subscriptions & Billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('standard', 'enhanced', 'premium')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('profile_view', 'website_click', 'whatsapp_click', 'email_click', 'phone_click')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Row Level Security Policies

-- Ensure RLS is enabled on new tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Admins Policy: Only an admin can see the admins table
CREATE POLICY "Admins can view admins" ON admins
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Businesses: existing no RLS implies public. Let's add RLS securely while keeping them public.
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public businesses are viewable by everyone" ON businesses FOR SELECT USING (status = 'active');
CREATE POLICY "Pending businesses viewable by owners or admins" ON businesses FOR SELECT USING (
  status = 'pending' AND (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  )
);
CREATE POLICY "Admins can manage businesses" ON businesses FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);
CREATE POLICY "Business owners can update their own business" ON businesses FOR UPDATE USING (
  user_id = auth.uid()
);

-- For Enquiries, ensure anyone can insert (public lead form)
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and update enquiries" ON enquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Subscriptions: Owners can see their own, admins can manage all
CREATE POLICY "Business owners can view their subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM businesses WHERE id = subscriptions.business_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage subscriptions" ON subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Analytics: Anyone can insert (anonymously tracking clicks), Owners/Admins can select
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Business owners can view their analytics" ON analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM businesses WHERE id = analytics_events.business_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all analytics" ON analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);
