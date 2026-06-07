-- Add branch column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Add branch column to cases
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS branch text;

-- Set all existing cases to 'pretoria'
UPDATE public.cases SET branch = 'pretoria' WHERE branch IS NULL;

-- Backfill existing profiles as completed (they predate onboarding)
UPDATE public.profiles SET profile_completed = true WHERE profile_completed IS NULL;

-- Add check constraints for valid branch values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_branch_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_branch_check CHECK (branch IN ('pretoria', 'marble-hall'));

ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_branch_check;
ALTER TABLE public.cases ADD CONSTRAINT cases_branch_check CHECK (branch IN ('pretoria', 'marble-hall'));

-- Update handle_new_user trigger to include profile_completed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, profile_completed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'New User'),
    new.email,
    'client',
    false
  );
  RETURN new;
END;
$$;
