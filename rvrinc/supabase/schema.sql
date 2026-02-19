-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Practice Areas Table
create table if not exists public.practice_areas (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  icon text not null,
  features text[] not null default '{}',
  created_at timestamptz default now()
);

-- Attorneys Table
create table if not exists public.attorneys (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  name text not null,
  role text not null,
  bio text not null,
  qualifications text[] not null default '{}',
  specialties text[] not null default '{}',
  image text not null,
  email text not null,
  linkedin text,
  is_partner boolean default false,
  created_at timestamptz default now()
);

-- Blog Posts Table
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  published_date date not null default CURRENT_DATE,
  author text not null,
  category text not null,
  image text,
  created_at timestamptz default now()
);

-- RLS Policies (Enable Read Access for Public)
alter table public.practice_areas enable row level security;
do $$ begin
  if not exists (select from pg_policies where policyname = 'Allow public read access on practice_areas') then
    create policy "Allow public read access on practice_areas" on public.practice_areas for select to anon using (true);
  end if;
end $$;

alter table public.attorneys enable row level security;
do $$ begin
  if not exists (select from pg_policies where policyname = 'Allow public read access on attorneys') then
    create policy "Allow public read access on attorneys" on public.attorneys for select to anon using (true);
  end if;
end $$;

alter table public.blog_posts enable row level security;
do $$ begin
  if not exists (select from pg_policies where policyname = 'Allow public read access on blog_posts') then
    create policy "Allow public read access on blog_posts" on public.blog_posts for select to anon using (true);
  end if;
end $$;

-- PORTAL SCHEMA --

-- Profiles (Extends Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text check (role in ('client', 'attorney', 'admin', 'staff')) default 'client',
  avatar_url text,
  created_at timestamptz default now()
);

-- Cases
create table if not exists public.cases (
  id uuid default gen_random_uuid() primary key,
  case_number text unique not null,
  client_id uuid references public.profiles(id) not null,
  attorney_id uuid references public.profiles(id),
  title text not null,
  description text,
  status text check (status in ('open', 'discovery', 'litigation', 'closed')) default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  name text not null,
  file_path text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- RLS for Portal --

alter table public.profiles enable row level security;
do $$ begin
  if not exists (select from pg_policies where policyname = 'Users can view their own profile') then
    create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select from pg_policies where policyname = 'Users can update their own profile') then
    create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

alter table public.cases enable row level security;
do $$ begin
  if not exists (select from pg_policies where policyname = 'Clients can view their own cases') then
    create policy "Clients can view their own cases" on public.cases for select using (auth.uid() = client_id);
  end if;
  if not exists (select from pg_policies where policyname = 'Attorneys can view assigned cases') then
    create policy "Attorneys can view assigned cases" on public.cases for select using (auth.uid() = attorney_id);
  end if;
end $$;

alter table public.documents enable row level security;
do $$ begin
  if not exists (select from pg_policies where policyname = 'Users can view documents for their cases') then
    create policy "Users can view documents for their cases" on public.documents for select using (
      exists (
        select 1 from public.cases 
        where cases.id = documents.case_id 
        and (cases.client_id = auth.uid() or cases.attorney_id = auth.uid())
      )
    );
  end if;
  if not exists (select from pg_policies where policyname = 'Users can insert documents for their cases') then
      create policy "Users can insert documents for their cases" on public.documents for insert with check (
        exists (
            select 1 from public.cases
            where cases.id = case_id
            and (cases.client_id = auth.uid() or cases.attorney_id = auth.uid())
        )
      );
  end if;
end $$;

-- STORAGE --

-- Create Bucket (if not exists logic is complex in SQL for buckets, assuming manual or idempotent insert)
insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

-- Storage Policies
-- Note: 'storage.objects' policies can conflict if repeated. We use DO block to guard.
do $$ begin
    if not exists (select from pg_policies where policyname = 'Authenticated users can upload case documents' and tablename = 'objects') then
        create policy "Authenticated users can upload case documents"
        on storage.objects for insert to authenticated with check (
            bucket_id = 'case-documents'
        );
    end if;

    if not exists (select from pg_policies where policyname = 'Users can view their own case documents' and tablename = 'objects') then
        create policy "Users can view their own case documents"
        on storage.objects for select to authenticated using (
            bucket_id = 'case-documents'
        );
    end if;
end $$;

-- Appointments
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) not null,
  attorney_id uuid references public.profiles(id) not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  notes text,
  created_at timestamptz default now()
);

alter table public.appointments enable row level security;
do $$ begin
  if not exists (select from pg_policies where policyname = 'Users can view their own appointments') then
    create policy "Users can view their own appointments" 
    on public.appointments for select using (
      auth.uid() = client_id or auth.uid() = attorney_id
    );
  end if;
  if not exists (select from pg_policies where policyname = 'Clients can create appointments') then
     create policy "Clients can create appointments"
     on public.appointments for insert to authenticated with check (
       auth.uid() = client_id
     );
  end if;
end $$;
