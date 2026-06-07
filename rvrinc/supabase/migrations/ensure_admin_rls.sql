-- Ensure admin RLS policies exist (idempotent — safe to re-run)
-- Run in Supabase SQL Editor if you see no cases as an admin

-- 1. Helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_attorney()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'attorney', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Enable RLS on all portal tables (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_status_history ENABLE ROW LEVEL SECURITY;

-- 3. Profiles — users view own, admins view all
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin_or_attorney());
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can update all profiles') THEN
    CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

-- 4. Cases — admins/attorneys/staff can view/manage all
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can view all cases') THEN
    CREATE POLICY "Admins can view all cases" ON public.cases FOR SELECT USING (public.is_admin_or_attorney());
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can insert cases') THEN
    CREATE POLICY "Admins can insert cases" ON public.cases FOR INSERT WITH CHECK (public.is_admin_or_attorney());
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can update cases') THEN
    CREATE POLICY "Admins can update cases" ON public.cases FOR UPDATE USING (public.is_admin_or_attorney());
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can delete cases') THEN
    CREATE POLICY "Admins can delete cases" ON public.cases FOR DELETE USING (public.is_admin());
  END IF;
END $$;

-- 5. Documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can manage all documents') THEN
    CREATE POLICY "Admins can manage all documents" ON public.documents FOR ALL USING (public.is_admin_or_attorney());
  END IF;
END $$;

-- 6. Case status history — staff can insert, all staff can view
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Staff can insert status history') THEN
    CREATE POLICY "Staff can insert status history" ON public.case_status_history FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Staff can view all status history') THEN
    CREATE POLICY "Staff can view all status history" ON public.case_status_history FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff', 'attorney')
      )
    );
  END IF;
END $$;

-- 7. Verify
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('profiles', 'cases', 'documents', 'case_status_history') ORDER BY tablename, cmd;
