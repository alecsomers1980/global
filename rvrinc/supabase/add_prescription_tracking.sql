-- Add prescription deadline tracking to cases
-- The 3-year prescription clock runs from the accident date

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'accident_date'
  ) THEN
    ALTER TABLE public.cases ADD COLUMN accident_date date;
  END IF;
END $$;

-- Add index for efficient prescription queries
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cases_accident_date'
  ) THEN
    CREATE INDEX idx_cases_accident_date ON public.cases(accident_date)
    WHERE accident_date IS NOT NULL AND status != 'closed';
  END IF;
END $$;
