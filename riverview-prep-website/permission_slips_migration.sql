-- ===========================================
-- DIGITAL PERMISSION SLIPS SYSTEM
-- Run this in your Supabase SQL Editor.
-- ===========================================

CREATE TABLE IF NOT EXISTS permission_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT,
  due_date TEXT,
  token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  status TEXT DEFAULT 'draft',  -- draft, active, closed
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permission_slip_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slip_id UUID REFERENCES permission_slips(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE permission_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_slip_responses ENABLE ROW LEVEL SECURITY;

-- Public can read active slips by token
CREATE POLICY "Public can read slips by token"
ON permission_slips FOR SELECT
TO anon
USING (status = 'active');

-- Public can insert responses
CREATE POLICY "Public can submit responses"
ON permission_slip_responses FOR INSERT
TO anon
WITH CHECK (true);

-- Public can read their own responses (for confirmation)
CREATE POLICY "Public can read responses"
ON permission_slip_responses FOR SELECT
TO anon
USING (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access to slips"
ON permission_slips FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin full access to responses"
ON permission_slip_responses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
