-- Exec-Air Enquiry Management System
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  enquiry_details TEXT NOT NULL DEFAULT '',
  quote_value NUMERIC DEFAULT 0,
  actual_value NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'warm_lead', 'confirmed', 'on_hold', 'no_answer')),
  priority TEXT NOT NULL DEFAULT 'standard' CHECK (priority IN ('standard', 'high')),
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (we use service role from API routes)
DROP POLICY IF EXISTS "Enable all for service role" ON enquiries;
CREATE POLICY "Enable all for service role" ON enquiries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for follow-up queries
CREATE INDEX IF NOT EXISTS idx_enquiries_follow_up_date ON enquiries(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_priority ON enquiries(priority);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);

-- ============================================================
-- Projects Table
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  gallery TEXT[] DEFAULT '{}',
  location TEXT,
  year TEXT,
  equipment TEXT,
  client TEXT,
  sector TEXT NOT NULL DEFAULT 'Commercial' CHECK (sector IN ('Commercial', 'Industrial', 'Residential')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for service role" ON projects;
CREATE POLICY "Enable all for service role" ON projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- ============================================================
-- Articles Table (News / Blog)
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image TEXT,
  category TEXT DEFAULT 'General',
  author TEXT DEFAULT 'Exec-Air',
  cta_text TEXT,
  cta_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for service role" ON articles;
CREATE POLICY "Enable all for service role" ON articles
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
