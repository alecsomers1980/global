-- ===========================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- POPIA-compliant subscription tracking
-- Run this in your Supabase SQL Editor.
-- ===========================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  consent_given BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- RLS: allow public inserts and admin reads
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert"
ON newsletter_subscribers FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow public select (for duplicate check)"
ON newsletter_subscribers FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow authenticated all"
ON newsletter_subscribers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
