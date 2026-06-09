-- ===========================================
-- ENROLMENT APPLICATIONS & COMMUNITY GALLERIES
-- Run in Supabase SQL Editor.
-- ===========================================

-- Enrolment Applications
CREATE TABLE IF NOT EXISTS enrolment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_first_name TEXT NOT NULL,
  student_last_name TEXT NOT NULL,
  student_dob TEXT,
  grade_applying TEXT NOT NULL,
  gender TEXT,
  parent_first_name TEXT NOT NULL,
  parent_last_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  address_line1 TEXT,
  address_city TEXT,
  previous_school TEXT,
  medical_notes TEXT,
  documents TEXT[],  -- array of Supabase Storage URLs
  status TEXT DEFAULT 'pending',  -- pending, under_review, accepted, waitlisted, declined
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Community Photo Submissions
CREATE TABLE IF NOT EXISTS community_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  event_name TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  gallery_category TEXT,
  status TEXT DEFAULT 'pending',  -- pending, approved, declined
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE enrolment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_photos ENABLE ROW LEVEL SECURITY;

-- Public can insert applications
CREATE POLICY "Public can submit applications"
ON enrolment_applications FOR INSERT
TO anon
WITH CHECK (true);

-- Public can insert photos
CREATE POLICY "Public can submit photos"
ON community_photos FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Public can read own submissions"
ON community_photos FOR SELECT
TO anon
USING (true);

-- Admin can do everything
CREATE POLICY "Admin full access to applications"
ON enrolment_applications FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin full access to photos"
ON community_photos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
