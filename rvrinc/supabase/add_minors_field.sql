-- Add minors field to cases (array of { name, id_number })
-- Run in Supabase SQL Editor

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS minors jsonb;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'cases' AND column_name = 'minors';
