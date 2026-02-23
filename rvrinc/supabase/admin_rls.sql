-- =============================================
-- RVR Inc. - Complete Admin RLS Policies
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- 1. Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 2. Helper function: check if current user is admin or attorney
create or replace function public.is_admin_or_attorney()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'attorney', 'staff')
  );
$$ language sql security definer stable;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Allow admins to view ALL profiles (for user management page)
do $$ begin
  if not exists (select from pg_policies where policyname = 'Admins can view all profiles') then
    create policy "Admins can view all profiles" on public.profiles
      for select using (public.is_admin());
  end if;
end $$;

-- Allow admins to update ALL profiles (for role changes)
do $$ begin
  if not exists (select from pg_policies where policyname = 'Admins can update all profiles') then
    create policy "Admins can update all profiles" on public.profiles
      for update using (public.is_admin());
  end if;
end $$;

-- =============================================
-- CASES TABLE POLICIES
-- =============================================

-- Allow admins to view ALL cases
do $$ begin
  if not exists (select from pg_policies where policyname = 'Admins can view all cases') then
    create policy "Admins can view all cases" on public.cases
      for select using (public.is_admin_or_attorney());
  end if;
end $$;

-- Allow admins/attorneys to INSERT cases
do $$ begin
  if not exists (select from pg_policies where policyname = 'Admins can insert cases') then
    create policy "Admins can insert cases" on public.cases
      for insert with check (public.is_admin_or_attorney());
  end if;
end $$;

-- Allow admins/attorneys to UPDATE cases
do $$ begin
  if not exists (select from pg_policies where policyname = 'Admins can update cases') then
    create policy "Admins can update cases" on public.cases
      for update using (public.is_admin_or_attorney());
  end if;
end $$;

-- Allow admins to DELETE cases
do $$ begin
  if not exists (select from pg_policies where policyname = 'Admins can delete cases') then
    create policy "Admins can delete cases" on public.cases
      for delete using (public.is_admin());
  end if;
end $$;

-- =============================================
-- DOCUMENTS TABLE POLICIES (Admin access)
-- =============================================

do $$ begin
  if not exists (select from pg_policies where policyname = 'Admins can manage all documents') then
    create policy "Admins can manage all documents" on public.documents
      for all using (public.is_admin_or_attorney());
  end if;
end $$;

-- =============================================
-- APPOINTMENTS TABLE POLICIES (if exists)
-- =============================================

do $$ begin
  if exists (select from pg_tables where tablename = 'appointments') then
    if not exists (select from pg_policies where policyname = 'Admins can manage all appointments') then
      create policy "Admins can manage all appointments" on public.appointments
        for all using (public.is_admin_or_attorney());
    end if;
  end if;
end $$;
