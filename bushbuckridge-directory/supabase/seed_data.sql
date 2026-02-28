-- 1. SEED TAXONOMY (If not already present from previous script)
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

-- 2. SEED BUSINESSES
-- We'll use subqueries to get the IDs for Sectors and Areas
DO $$
DECLARE
    const_id UUID := (SELECT id FROM sectors WHERE slug = 'construction-engineering');
    retail_id UUID := (SELECT id FROM sectors WHERE slug = 'retail-shopping');
    tourism_id UUID := (SELECT id FROM sectors WHERE slug = 'tourism-hospitality');
    prof_id UUID := (SELECT id FROM sectors WHERE slug = 'professional-services');
    
    acorn_id UUID := (SELECT id FROM areas WHERE slug = 'acornhoek');
    central_id UUID := (SELECT id FROM areas WHERE slug = 'bushbuckridge-central');
    thula_id UUID := (SELECT id FROM areas WHERE slug = 'thulamahashe');
    dwars_id UUID := (SELECT id FROM areas WHERE slug = 'dwarsloop');
BEGIN
    -- Premium/Featured Businesses
    INSERT INTO businesses (name, sector_id, area_id, phone, whatsapp, email, description, status, package_tier, is_featured, is_verified)
    VALUES 
    ('Bushbuckridge Builders Supply', const_id, central_id, '013 799 1234', '27731234567', 'info@bbbuilders.co.za', 'Leading supplier of high-quality construction materials and hardware for the entire region. Specializing in brick manufacturing and bulk cement supply.', 'active', 'premium', true, true),
    ('Kruger Gate Safari Lodge', tourism_id, acorn_id, '013 735 5671', '27829876543', 'stay@krugergate.com', 'Luxury accommodation situated right at the Paul Kruger Gate. Experience the wild in comfort with award-winning dining and spa facilities.', 'active', 'premium', true, true);

    -- Enhanced Listings
    INSERT INTO businesses (name, sector_id, area_id, phone, whatsapp, email, description, status, package_tier, is_featured, is_verified)
    VALUES 
    ('Thula Fresh Market', retail_id, thula_id, '013 773 9988', '27712345678', 'orders@thulafresh.co.za', 'Your local source for farm-fresh produce, daily baked goods, and household essentials at affordable prices.', 'active', 'enhanced', false, true),
    ('Phoenix Accounting Services', prof_id, dwars_id, '087 802 4412', '27845551234', 'alec@phoenix.co.za', 'Professional tax, payroll, and bookkeeping services for small and medium enterprises in Bushbuckridge.', 'active', 'enhanced', false, true);

    -- Standard Listings
    INSERT INTO businesses (name, sector_id, area_id, phone, whatsapp, status, package_tier)
    VALUES 
    ('Express Car Wash', (SELECT id FROM sectors WHERE slug = 'automotive'), central_id, '072 111 2222', '27721112222', 'active', 'standard'),
    ('Zandi''s Hair & Beauty', (SELECT id FROM sectors WHERE slug = 'health-beauty'), thula_id, '079 333 4444', '27793334444', 'active', 'standard');
END $$;

-- 3. SEED SPOTLIGHT POSTS
DO $$
DECLARE
    builders_id UUID := (SELECT id FROM businesses WHERE name = 'Bushbuckridge Builders Supply');
    kruger_id UUID := (SELECT id FROM businesses WHERE name = 'Kruger Gate Safari Lodge');
BEGIN
    INSERT INTO posts (title, slug, content, business_id, image_url)
    VALUES 
    ('How Bushbuckridge Builders is Shaping the Future of Local Infrastructure', 'shaping-future-infrastructure', 'For over 15 years, Bushbuckridge Builders Supply has been more than just a hardware store. We sat down with the founder to discuss their commitment to local brick-making and community employment...', builders_id, 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800'),
    ('Unforgettable Experiences at the Edge of the Wild', 'unforgettable-kruger-gate', 'Kruger Gate Safari Lodge recently renovated their viewing deck, providing guests with unparalleled views of the Sabie River. Learn why this local gem continues to win international tourism awards...', kruger_id, 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800');
END $$;

-- 4. SEED EVENTS
INSERT INTO events (title, slug, date, venue, contact_info, is_featured)
VALUES 
('Bushbuckridge Business Expo 2026', 'business-expo-2026', '2026-05-15 09:00:00+02', 'Thulamahashe Community Hall', 'Register at info@dbib.co.za', true),
('SME Tax Workshop', 'sme-tax-workshop', '2026-04-10 14:00:00+02', 'Dwarsloop Library', 'Brought to you by Phoenix Accounting', false);

-- 5. SEED OPPORTUNITIES
INSERT INTO opportunities (title, slug, category, deadline, contact_info)
VALUES 
('Construction Tender: New Clinic Wing', 'tender-clinic-wing', 'Tenders', '2026-04-01 12:00:00+02', 'Dept of Public Works Ref #4412'),
('Youth Agriculture Training Grant', 'agri-training-grant', 'Training', '2026-03-25 16:00:00+02', 'Visit local DA office for forms');

-- 6. SEED JOBS
INSERT INTO jobs (title, slug, description, contact_info)
VALUES 
('Retail Assistant', 'job-retail-assistant', 'Seeking energetic retail assistant for Thula Fresh Market. 2 years experience required.', 'orders@thulafresh.co.za'),
('Qualified Electrician', 'job-electrician', 'Immediate opening for residential electrician in Acornhoek area.', '013 799 1234');
