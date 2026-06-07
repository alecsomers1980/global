-- Add id_number column to cases table for ID/Passport-based case lookup
-- Run this in the Supabase SQL Editor

-- Check if column exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cases' AND column_name = 'id_number'
    ) THEN
        ALTER TABLE cases ADD COLUMN id_number text;
        CREATE INDEX idx_cases_id_number ON cases(id_number);
        RAISE NOTICE 'Added id_number column to cases table';
    ELSE
        RAISE NOTICE 'id_number column already exists';
    END IF;
END $$;
