-- ============================================================
-- Aloe Signs Client Upload Portal – Supabase Setup Script
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the storage bucket
-- (You can also do this via the UI: Storage → New Bucket → "client-uploads", Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-uploads', 'client-uploads', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. Row Level Security (RLS) — Storage Policies
-- ============================================================

-- Policy: Clients can UPLOAD to their own folder only
CREATE POLICY "Clients can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Clients can VIEW (download) their own files only
CREATE POLICY "Clients can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can manage ALL files in the bucket
-- Replace 'admin@aloesigns.co.za' with the actual admin email if needed,
-- or use a role-based approach by assigning app_metadata.role = 'admin' in the dashboard.
CREATE POLICY "Admins can manage all files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'client-uploads'
  AND (auth.jwt() ->> 'email') LIKE '%@aloesigns.co.za'
);


-- ============================================================
-- 3. Profiles table (optional but handy for client names)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
