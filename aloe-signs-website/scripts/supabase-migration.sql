-- ============================================================
-- Aloe Signs – MIGRATION ONLY (run AFTER the original setup)
-- Adds: company/contact_number to profiles, print_jobs,
--        print_job_files, proofs, proof_comments
-- ============================================================

-- 1. Add new columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- Update the trigger function to populate new fields on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, company, contact_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'company',
    NEW.raw_user_meta_data ->> 'contact_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') LIKE '%@aloesigns.co.za');

-- Clients can delete their own files (storage)
CREATE POLICY "Clients can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- 2. Print Jobs table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.print_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Uploaded'
    CHECK (status IN ('Uploaded', 'Processing', 'Awaiting Proof Signoff', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own jobs"
  ON public.print_jobs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can create jobs"
  ON public.print_jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can update their own jobs"
  ON public.print_jobs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all jobs"
  ON public.print_jobs FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') LIKE '%@aloesigns.co.za');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.print_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 3. Print Job Files table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.print_job_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.print_jobs(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  description TEXT,
  width NUMERIC,
  height NUMERIC,
  unit TEXT DEFAULT 'mm',
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.print_job_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own job files"
  ON public.print_job_files FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.print_jobs WHERE print_jobs.id = print_job_files.job_id AND print_jobs.user_id = auth.uid()));

CREATE POLICY "Clients can add files to own jobs"
  ON public.print_job_files FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.print_jobs WHERE print_jobs.id = print_job_files.job_id AND print_jobs.user_id = auth.uid()));

CREATE POLICY "Clients can update their own job files"
  ON public.print_job_files FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.print_jobs WHERE print_jobs.id = print_job_files.job_id AND print_jobs.user_id = auth.uid()));

CREATE POLICY "Clients can delete their own job files"
  ON public.print_job_files FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.print_jobs WHERE print_jobs.id = print_job_files.job_id AND print_jobs.user_id = auth.uid()));

CREATE POLICY "Admins can manage all job files"
  ON public.print_job_files FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') LIKE '%@aloesigns.co.za');


-- ============================================================
-- 4. Proofs table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.print_jobs(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Edit Required', 'Approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own proofs"
  ON public.proofs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.print_jobs WHERE print_jobs.id = proofs.job_id AND print_jobs.user_id = auth.uid()));

CREATE POLICY "Clients can respond to proofs"
  ON public.proofs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.print_jobs WHERE print_jobs.id = proofs.job_id AND print_jobs.user_id = auth.uid()));

CREATE POLICY "Admins can manage all proofs"
  ON public.proofs FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') LIKE '%@aloesigns.co.za');


-- ============================================================
-- 5. Proof Comments table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proof_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proof_id UUID REFERENCES public.proofs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.proof_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own proof comments"
  ON public.proof_comments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.proofs JOIN public.print_jobs ON print_jobs.id = proofs.job_id
    WHERE proofs.id = proof_comments.proof_id AND print_jobs.user_id = auth.uid()
  ));

CREATE POLICY "Clients can comment on own proofs"
  ON public.proof_comments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.proofs JOIN public.print_jobs ON print_jobs.id = proofs.job_id
      WHERE proofs.id = proof_comments.proof_id AND print_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all comments"
  ON public.proof_comments FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'email') LIKE '%@aloesigns.co.za');
