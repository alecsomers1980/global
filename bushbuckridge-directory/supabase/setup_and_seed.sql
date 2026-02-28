-- BUSHBUCKRIDGE DIRECTORY: COMPLETE DATABASE SETUP & SEED
-- Instructions: Run this entire script in the Supabase SQL Editor.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES (with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS sectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  description TEXT,
  services_tags TEXT[],
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  package_tier VARCHAR(20) DEFAULT 'standard' CHECK (package_tier IN ('standard', 'enhanced', 'premium')),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue VARCHAR(255) NOT NULL,
  contact_info TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) CHECK (category IN ('Funding', 'Tenders', 'Training', 'Business Support')),
  deadline TIMESTAMP WITH TIME ZONE,
  contact_info TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('buy_spot', 'general')),
  business_name VARCHAR(255),
  contact_person VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  details TEXT,
  package_requested VARCHAR(50),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SECURITY (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public read active businesses" ON businesses;
    DROP POLICY IF EXISTS "Public read sectors" ON sectors;
    DROP POLICY IF EXISTS "Public read areas" ON areas;
    DROP POLICY IF EXISTS "Public read posts" ON posts;
    DROP POLICY IF EXISTS "Public read events" ON events;
    DROP POLICY IF EXISTS "Public read opportunities" ON opportunities;
    DROP POLICY IF EXISTS "Public read jobs" ON jobs;
    DROP POLICY IF EXISTS "Public insert enquiries" ON enquiries;
END $$;

CREATE POLICY "Public read active businesses" ON businesses FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Public read sectors" ON sectors FOR SELECT TO anon USING (true);
CREATE POLICY "Public read areas" ON areas FOR SELECT TO anon USING (true);
CREATE POLICY "Public read posts" ON posts FOR SELECT TO anon USING (true);
CREATE POLICY "Public read events" ON events FOR SELECT TO anon USING (true);
CREATE POLICY "Public read opportunities" ON opportunities FOR SELECT TO anon USING (true);
CREATE POLICY "Public read jobs" ON jobs FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert enquiries" ON enquiries FOR INSERT TO anon WITH CHECK (true);

-- ADMIN POLICIES
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admin full access businesses" ON businesses;
    DROP POLICY IF EXISTS "Admin full access sectors" ON sectors;
    DROP POLICY IF EXISTS "Admin full access areas" ON areas;
    DROP POLICY IF EXISTS "Admin full access posts" ON posts;
    DROP POLICY IF EXISTS "Admin full access events" ON events;
    DROP POLICY IF EXISTS "Admin full access opportunities" ON opportunities;
    DROP POLICY IF EXISTS "Admin full access jobs" ON jobs;
    DROP POLICY IF EXISTS "Admin full access enquiries" ON enquiries;
END $$;

CREATE POLICY "Admin full access businesses" ON businesses FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access sectors" ON sectors FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access areas" ON areas FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access posts" ON posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access events" ON events FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access opportunities" ON opportunities FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access jobs" ON jobs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access enquiries" ON enquiries FOR ALL TO authenticated USING (true);

-- 4. SEED DATA
-- Taxonomy
INSERT INTO sectors (name, slug) 
VALUES 
  ('Construction & Engineering', 'construction-engineering'),
  ('Retail & Shopping', 'retail-shopping'),
  ('Tourism & Hospitality', 'tourism-hospitality'),
  ('Professional Services', 'professional-services'),
  ('Agriculture & Farming', 'agriculture-farming'),
  ('Automotive', 'automotive'),
  ('Health & Beauty', 'health-beauty')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO areas (name, slug) 
VALUES 
  ('Acornhoek', 'acornhoek'),
  ('Bushbuckridge Central', 'bushbuckridge-central'),
  ('Thulamahashe', 'thulamahashe'),
  ('Dwarsloop', 'dwarsloop'),
  ('Shatale', 'shatale'),
  ('Hluvukani', 'hluvukani'),
  ('Mkhuhlu', 'mkhuhlu')
ON CONFLICT (slug) DO NOTHING;

-- Dynamic Seeding using variables
DO $$
DECLARE
    const_id UUID := (SELECT id FROM sectors WHERE slug = 'construction-engineering');
    retail_id UUID := (SELECT id FROM sectors WHERE slug = 'retail-shopping');
    tourism_id UUID := (SELECT id FROM sectors WHERE slug = 'tourism-hospitality');
    prof_id UUID := (SELECT id FROM sectors WHERE slug = 'professional-services');
    auto_id UUID := (SELECT id FROM sectors WHERE slug = 'automotive');
    health_id UUID := (SELECT id FROM sectors WHERE slug = 'health-beauty');
    
    acorn_id UUID := (SELECT id FROM areas WHERE slug = 'acornhoek');
    central_id UUID := (SELECT id FROM areas WHERE slug = 'bushbuckridge-central');
    thula_id UUID := (SELECT id FROM areas WHERE slug = 'thulamahashe');
    dwars_id UUID := (SELECT id FROM areas WHERE slug = 'dwarsloop');
BEGIN
    -- Premium/Featured Businesses
    INSERT INTO businesses (name, sector_id, area_id, phone, whatsapp, email, description, status, package_tier, is_featured, is_verified)
    VALUES 
    ('Bushbuckridge Builders Supply', const_id, central_id, '013 799 1234', '27731234567', 'info@bbbuilders.co.za', 'Leading supplier of high-quality construction materials and hardware for the entire region. Specializing in brick manufacturing and bulk cement supply.', 'active', 'premium', true, true),
    ('Kruger Gate Safari Lodge', tourism_id, acorn_id, '013 735 5671', '27829876543', 'stay@krugergate.com', 'Luxury accommodation situated right at the Paul Kruger Gate. Experience the wild in comfort with award-winning dining and spa facilities.', 'active', 'premium', true, true)
    ON CONFLICT DO NOTHING;

    -- Enhanced Listings
    INSERT INTO businesses (name, sector_id, area_id, phone, whatsapp, email, description, status, package_tier, is_featured, is_verified)
    VALUES 
    ('Thula Fresh Market', retail_id, thula_id, '013 773 9988', '27712345678', 'orders@thulafresh.co.za', 'Your local source for farm-fresh produce, daily baked goods, and household essentials at affordable prices.', 'active', 'enhanced', false, true),
    ('Phoenix Accounting Services', prof_id, dwars_id, '087 802 4412', '27845551234', 'alec@phoenix.co.za', 'Professional tax, payroll, and bookkeeping services for small and medium enterprises in Bushbuckridge.', 'active', 'enhanced', false, true)
    ON CONFLICT DO NOTHING;

    -- Standard Listings
    INSERT INTO businesses (name, sector_id, area_id, phone, whatsapp, status, package_tier)
    VALUES 
    ('Express Car Wash', auto_id, central_id, '072 111 2222', '27721112222', 'active', 'standard'),
    ('Zandi''s Hair & Beauty', health_id, thula_id, '079 333 4444', '27793334444', 'active', 'standard')
    ON CONFLICT DO NOTHING;
END $$;

-- Spotlight Posts
DO $$
DECLARE
    builders_id UUID := (SELECT id FROM businesses WHERE name = 'Bushbuckridge Builders Supply');
    kruger_id UUID := (SELECT id FROM businesses WHERE name = 'Kruger Gate Safari Lodge');
BEGIN
    IF builders_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'shaping-future-infrastructure') THEN
        INSERT INTO posts (title, slug, content, business_id, image_url)
        VALUES ('How Bushbuckridge Builders is Shaping the Future of Local Infrastructure', 'shaping-future-infrastructure', 'For over 15 years, Bushbuckridge Builders Supply has been more than just a hardware store...', builders_id, 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800');
    END IF;

    IF kruger_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM posts WHERE slug = 'unforgettable-kruger-gate') THEN
        INSERT INTO posts (title, slug, content, business_id, image_url)
        VALUES ('Unforgettable Experiences at the Edge of the Wild', 'unforgettable-kruger-gate', 'Kruger Gate Safari Lodge recently renovated their viewing deck...', kruger_id, 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800');
    END IF;
END $$;

-- Events
INSERT INTO events (title, slug, date, venue, contact_info, is_featured)
VALUES 
('Bushbuckridge Business Expo 2026', 'business-expo-2026', '2026-05-15 09:00:00+02', 'Thulamahashe Community Hall', 'Register at info@dbib.co.za', true),
('SME Tax Workshop', 'sme-tax-workshop', '2026-04-10 14:00:00+02', 'Dwarsloop Library', 'Brought to you by Phoenix Accounting', false)
ON CONFLICT (slug) DO NOTHING;

-- Opportunities
INSERT INTO opportunities (title, slug, category, deadline, contact_info)
VALUES 
('Construction Tender: New Clinic Wing', 'tender-clinic-wing', 'Tenders', '2026-04-01 12:00:00+02', 'Dept of Public Works Ref #4412'),
('Youth Agriculture Training Grant', 'agri-training-grant', 'Training', '2026-03-25 16:00:00+02', 'Visit local DA office for forms')
ON CONFLICT (slug) DO NOTHING;

-- Jobs
INSERT INTO jobs (title, slug, description, contact_info)
VALUES 
('Retail Assistant', 'job-retail-assistant', 'Seeking energetic retail assistant for Thula Fresh Market. 2 years experience required.', 'orders@thulafresh.co.za'),
('Qualified Electrician', 'job-electrician', 'Immediate opening for residential electrician in Acornhoek area.', '013 799 1234')
ON CONFLICT (slug) DO NOTHING;
