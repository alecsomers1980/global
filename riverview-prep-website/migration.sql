-- ===========================================
-- RIVERVIEW PREP: DATABASE FIX & COMPLETE MIGRATION (V3)
-- Fixes wrong table names from previous migration.
-- Run this in your Supabase SQL Editor.
-- ===========================================

-- STEP 1: Drop wrongly-named tables from previous migration
DROP TABLE IF EXISTS calendar;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS admissions_docs;

-- STEP 2: Create ALL tables with the CORRECT names
-- -------------------------------------------

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  event_date TEXT,
  venue TEXT,
  category TEXT DEFAULT 'Academic',
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming',
  display_start_date TEXT,
  display_end_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT,
  title TEXT,
  location TEXT,
  type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS school_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  file_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- These should already exist, but just in case:
CREATE TABLE IF NOT EXISTS homepage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_label TEXT, day_label TEXT, title TEXT, type TEXT, location TEXT,
  sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS homepage_posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, image_url TEXT, link_url TEXT,
  sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS homepage_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, description TEXT, sub_values TEXT, icon TEXT,
  sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS homepage_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT, name TEXT, role TEXT, initials TEXT,
  sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS homepage_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, full_name TEXT, image_url TEXT,
  sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, role TEXT, category TEXT DEFAULT 'Administration', bio TEXT, image_url TEXT,
  sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE, title TEXT, issue_number TEXT, term TEXT, publish_date TEXT, excerpt TEXT,
  hero_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS newsletter_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, description TEXT, cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT, urgency TEXT DEFAULT 'info', is_active BOOLEAN DEFAULT true,
  link_url TEXT, link_text TEXT, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT, email TEXT, graduation_year INTEGER, current_location TEXT, memories TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE, value TEXT, category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 3: Populate with initial data
-- -------------------------------------------

-- Events (the main events table used by Events page + Analytics)
INSERT INTO events (title, event_date, venue, category, is_featured, status, display_start_date, display_end_date)
VALUES 
  ('School Play: Oliver with a Twist', '2026-03-20', 'Main Hall', 'Culture', true, 'upcoming', '2026-02-01', '2026-03-21'),
  ('Individual Photo Day', '2026-03-25', 'Campus', 'Academic', false, 'upcoming', '2026-03-01', '2026-03-26'),
  ('Grade 7 Mentor Induction', '2026-03-27', 'Chapel', 'Academic', false, 'upcoming', '2026-03-01', '2026-03-28'),
  ('U13 Athletics Meet', '2026-04-12', 'Komatipoort', 'Sports', true, 'upcoming', '2026-03-01', '2026-04-13'),
  ('School Golf Day', '2026-07-25', 'Malelane Golf Club', 'Community', true, 'upcoming', '2026-05-01', '2026-07-26')
ON CONFLICT DO NOTHING;

-- Calendar Entries
INSERT INTO calendar_entries (date, title, location, type, description)
VALUES 
  ('2026-03-20', 'Term 1 Ends', 'Campus', 'Academic', 'Final day of the first academic term.'),
  ('2026-03-20', 'School Play Performance', 'Main Hall', 'Culture', 'Evening performance for parents.'),
  ('2026-04-14', 'Term 2 Begins', 'Campus', 'Academic', 'First day of the second academic term.')
ON CONFLICT DO NOTHING;

-- Contact Submissions (empty — these come from public form)
-- No seed data needed.

-- School Documents
INSERT INTO school_documents (name, file_url, category)
VALUES 
  ('Application Form 2026', '/documents/application-form-2026.pdf', 'Admissions'),
  ('School Prospectus', '/documents/prospectus.pdf', 'General'),
  ('Fee Structure 2026', '/documents/fees-2026.pdf', 'Finance')
ON CONFLICT DO NOTHING;

-- Homepage Events
INSERT INTO homepage_events (date_label, day_label, title, type, location, sort_order)
VALUES 
  ('20 MAR', 'THU', 'School Play: Oliver with a Twist', 'Culture', 'Main Hall', 1),
  ('25 MAR', 'TUE', 'Individual Photo Day', 'Academic', 'Campus', 2),
  ('27 MAR', 'THU', 'Grade 7 Mentor Induction', 'Academic', 'Chapel', 3),
  ('12 APR', 'SAT', 'U13 Athletics Meet', 'Sports', 'Komatipoort', 4)
ON CONFLICT DO NOTHING;

-- Homepage Posters
INSERT INTO homepage_posters (title, image_url, link_url, sort_order)
VALUES 
  ('Oliver with a Twist', '/images/oliver-with-a-twist.jpg', '/news/12-march-2026', 1),
  ('Admissions 2026', '/images/banner.jpg', '/admissions', 2)
ON CONFLICT DO NOTHING;

-- Homepage Core Values
INSERT INTO homepage_values (name, description, sub_values, icon, sort_order)
VALUES 
  ('Christian Excellence', 'Driven by faith and integrity since 1997.', 'Faith, Honesty, Respect', '💎', 1),
  ('Academic Growth', 'Nurturing universally competitive learners.', 'Innovation, Focus, Support', '📚', 2),
  ('Community Spirit', 'A family-centric environment in Malelane.', 'Unity, Giving, Heritage', '🤝', 3)
ON CONFLICT DO NOTHING;

-- Homepage Testimonials
INSERT INTO homepage_testimonials (quote, name, role, initials, sort_order)
VALUES 
  ('The best foundation my child could have asked for.', 'Sarah Thompson', 'Grade 4 Parent', 'ST', 1),
  ('Integrity isn''t just a motto here; it''s a way of life.', 'David Bekker', 'Alumnus', 'DB', 2)
ON CONFLICT DO NOTHING;

-- Homepage Associations
INSERT INTO homepage_associations (name, full_name, image_url, sort_order)
VALUES 
  ('ISASA', 'Independent Schools Association of Southern Africa', '/images/isasa.png', 1),
  ('Eco-Schools', 'Wildlife and Environment Society of South Africa', '/images/eco-schools.png', 2),
  ('IQAA', 'Independent Quality Assurance Agency', '/images/iqaa.png', 3)
ON CONFLICT DO NOTHING;

-- Staff Directory
INSERT INTO staff (name, role, category, bio, image_url, sort_order)
VALUES 
  ('Mr Murray Johnson', 'Headmaster', 'Management', 'Leading Riverview Prep with vision and integrity.', '/images/headmaster.jpg', 1),
  ('Mrs Ann-Marie Rutherford', 'Secretary', 'Administration', 'The friendly face of our front office.', '/images/Staff/Rutherford.jpg', 2),
  ('Mrs Jacomin Ferreira', 'Bursar', 'Administration', 'Managing school finances with precision.', '/images/Staff/Mrs-Jacomin-Ferreira.JPG', 3),
  ('Mrs Chanelle de Kock', 'Marketing', 'Administration', 'Promoting the school''s unique heritage.', '/images/Staff/De-Kock.jpg', 4),
  ('Mrs Jenny Bhana', 'Cubs', 'Foundation Phase', 'Nurturing our youngest learners.', '/images/Staff/Bhana.jpg', 5),
  ('Mrs Lezanne Nel', 'Grade 000', 'Foundation Phase', 'Building strong foundations.', '/images/Staff/Lezanne-Nel.jpg', 6),
  ('Mrs Debbie Tapson', 'Grade 0', 'Foundation Phase', 'Preparing children for primary school.', '/images/Staff/Tapson.jpg', 7),
  ('Mrs Wendy McKinnon', 'Grade 1', 'Foundation Phase', 'A dedicated and passionate educator.', '/images/Staff/McKinnon.jpg', 8),
  ('Ms Megan Swart', 'Grade 2', 'Foundation Phase', 'Inspiring curiosity and creativity.', '/images/Staff/Swart.jpg', 9),
  ('Mrs Michelle Johnson', 'Grade 3', 'Foundation Phase', 'Empowering learners through excellence.', '/images/Staff/Johnson.jpg', 10),
  ('Mrs Karen Kaligan', 'IT & Library', 'Specialist', 'Bridging technology and learning.', '/images/Staff/Karen-Kaligan.jpg', 11),
  ('Mrs Bronwyn Thomson', 'Grade 4', 'Intermediate Phase', 'Guiding students to academic success.', '/images/Staff/Bronwyn-Thomson.jpg', 12),
  ('Mrs Doanda Meyers', 'Grade 5', 'Intermediate Phase', 'Fostering independent thinking.', '/images/Staff/Doanda-Meyers.jpg', 13),
  ('Mrs Bianca Nieuwenhuizen', 'Grade 6', 'Senior Phase', 'Preparing leaders of tomorrow.', '/images/Staff/Bianca.jpg', 14),
  ('Mrs Gill Brokensha', 'Grade 7', 'Senior Phase', 'Guiding our senior learners with care.', '/images/Staff/Brokensha.jpg', 15),
  ('Mrs Grace Sutherland', 'Science', 'Specialist', 'Making science come alive.', '/images/Staff/Grace-Sutherland.jpg', 16),
  ('Mrs Lize-Marie Dreyer', 'Sports Coordinator', 'Sports', 'Developing athletic excellence.', '/images/Staff/Dreyer.jpg', 17),
  ('Mr Eric Vilakazi', 'Sports Intern', 'Sports', 'Supporting our sports programmes.', '/images/Staff/Vilakati.jpg', 18),
  ('Mr Andre Els', 'Estate Manager', 'Operations', 'Keeping our campus beautiful.', '/images/Staff/Andre-Els.jpg', 19),
  ('Mrs Alexa Kotze', 'Occupational Therapist', 'Specialist', 'Supporting holistic development.', '/images/Staff/Kotze.jpg', 20),
  ('Mrs Leandri Wolmarans', 'Speech Therapist', 'Specialist', 'Helping students find their voice.', '/images/Staff/Wolmarans.jpg', 21),
  ('Mrs Janet Jeary', 'Music / Admin', 'Specialist', 'Bringing harmony to campus life.', '/images/Staff/Janet-Jeary.JPG', 22)
ON CONFLICT DO NOTHING;

-- Newsletters
INSERT INTO newsletters (slug, title, issue_number, term, publish_date, excerpt)
VALUES 
  ('12-march-2026', 'Oliver with a Twist · Swimming Medals · Sports Fixtures', 'Issue 05', 'Term 1', '2026-03-12', 'Spotlights our school play and celebrates swimming achievements.'),
  ('26-february-2026', 'Golf Day Fundraiser · Book Week · Athletics Stars', 'Issue 04', 'Term 1', '2026-02-26', 'Recaps Book Week activities and announces Golf Day fundraiser.')
ON CONFLICT DO NOTHING;

-- Settings
INSERT INTO settings (key, value, category)
VALUES 
  ('site_title', 'Riverview Preparatory School', 'SEO'),
  ('site_description', 'Integrity. Excellence. Faith. Nurturing competitive learners in Malelane.', 'SEO'),
  ('school_email', 'info@riverviewprep.co.za', 'Contact'),
  ('school_phone', '+27 13 790 0000', 'Contact')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- STEP 4: Enable Row Level Security (allow all reads/writes for now)
-- -------------------------------------------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE newsletter_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations (customize later for production)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'events','calendar_entries','contact_submissions','school_documents',
    'homepage_events','homepage_posters','homepage_values','homepage_testimonials','homepage_associations',
    'staff','newsletters','newsletter_sections','gallery_albums','announcements','alumni','settings'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all select" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Allow all select" ON %I FOR SELECT USING (true)', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all insert" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Allow all insert" ON %I FOR INSERT WITH CHECK (true)', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all update" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Allow all update" ON %I FOR UPDATE USING (true)', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all delete" ON %I', tbl);
    EXECUTE format('CREATE POLICY "Allow all delete" ON %I FOR DELETE USING (true)', tbl);
  END LOOP;
END $$;
