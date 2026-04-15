-- ===========================================
-- RIVERVIEW PREP: NEWSLETTER BUILDER SCHEMA V2
-- Run this in your Supabase SQL Editor.
-- ===========================================

-- 1. Extend newsletters table
ALTER TABLE newsletters 
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS subheadline TEXT,
  ADD COLUMN IF NOT EXISTS highlights JSONB,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 2. Extend newsletter_sections table
ALTER TABLE newsletter_sections
  ADD COLUMN IF NOT EXISTS section_type TEXT DEFAULT 'content',
  ADD COLUMN IF NOT EXISTS author TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'heart',
  ADD COLUMN IF NOT EXISTS extra_data JSONB;

-- 3. Update RLS policies (just to be safe)
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all select" ON newsletters;
CREATE POLICY "Allow all select" ON newsletters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON newsletters;
CREATE POLICY "Allow all insert" ON newsletters FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all update" ON newsletters;
CREATE POLICY "Allow all update" ON newsletters FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all delete" ON newsletters;
CREATE POLICY "Allow all delete" ON newsletters FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow all select" ON newsletter_sections;
CREATE POLICY "Allow all select" ON newsletter_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON newsletter_sections;
CREATE POLICY "Allow all insert" ON newsletter_sections FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all update" ON newsletter_sections;
CREATE POLICY "Allow all update" ON newsletter_sections FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow all delete" ON newsletter_sections;
CREATE POLICY "Allow all delete" ON newsletter_sections FOR DELETE USING (true);
