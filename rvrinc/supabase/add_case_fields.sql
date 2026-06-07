-- Add missing case fields + make client_id nullable
-- Run in Supabase SQL Editor

ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS raf_ref text;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS date_of_lodgement text;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS date_of_summons text;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS date_of_relodgement text;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS place_of_accident text;
ALTER TABLE public.cases ALTER COLUMN client_id DROP NOT NULL;

-- Verify
SELECT column_name, data_type, is_nullable FROM information_schema.columns
WHERE table_name = 'cases' AND column_name IN ('raf_ref', 'date_of_lodgement', 'date_of_summons', 'date_of_relodgement', 'place_of_accident', 'client_id');
