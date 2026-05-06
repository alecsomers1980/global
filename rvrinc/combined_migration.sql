-- ============================================
-- RVR INC: FULL MIGRATION TO NEW SUPABASE
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/ctfwxbrjyxjcdsrbdxxz/sql/new
-- ============================================

-- PART 1: MAIN SCHEMA
-- ============================================
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


-- PART 2: RAF STATUS SYSTEM
-- ============================================
-- =============================================
-- RAF Case Status Migration for RVR Inc
-- Run this against your Supabase SQL Editor
-- =============================================

-- 1. Create status lookup table
create table if not exists public.case_statuses (
  id serial primary key,
  slug text unique not null,
  label text not null,
  phase text not null check (phase in ('intake', 'claim', 'litigation', 'court', 'raf_damages', 'settlement')),
  sort_order int not null,
  default_note text,
  requires_note boolean default false,
  requires_date boolean default false,
  requires_client_action boolean default false,
  client_message text not null
);

-- 2. Insert all 34 RAF statuses
insert into public.case_statuses (slug, label, phase, sort_order, default_note, requires_note, requires_date, requires_client_action, client_message) values
-- INTAKE PHASE
('consultation_complete', 'Consultation Complete', 'intake', 1, NULL, true, false, false, 'Your initial consultation has been completed. Our team is reviewing your case.'),
('requested_records', 'Requested Hospital Records & Accident Report', 'intake', 2, NULL, false, false, false, 'We have submitted requests for your hospital records and accident report. We will update you once received.'),
('client_obtain_records', 'Client to Obtain Hospital Records', 'intake', 3, NULL, false, false, true, 'We need your help to obtain your hospital records. Please collect them and submit to our office as soon as possible.'),
('client_obtain_accident_report', 'Client to Obtain Accident Report', 'intake', 4, NULL, false, false, true, 'We need your help to obtain the accident report. Please collect it and submit to our office as soon as possible.'),
('client_obtain_records_and_report', 'Client to Obtain Hospital Records & Accident Report', 'intake', 5, NULL, false, false, true, 'We need your help to obtain both your hospital records and the accident report. Please collect them and submit to our office.'),
('client_sign_affidavit', 'Client to Sign Affidavit & Send Certified ID', 'intake', 6, NULL, false, false, true, 'Please sign the affidavit and send it back together with a certified copy of your ID document.'),

-- CLAIM LODGED PHASE
('claim_lodged', 'Claim Lodged', 'claim', 7, 'We have diarized our file for 120 days for the RAF to assess the claim. If no response, we will prepare Summons.', false, false, false, 'Your claim has been officially lodged with the RAF. We have set a 120-day follow-up period for their response.'),
('claim_documents_returned', 'Claim Documents Returned', 'claim', 8, 'We will now bring an application, and will continue with your claim.', false, false, false, 'Your claim documents have been returned. We are now preparing to bring an application to continue with your claim.'),

-- LITIGATION PHASE
('drafting_summons', 'Drafting Summons (Advocate Review)', 'litigation', 9, NULL, false, false, false, 'We are drafting the Summons document which will be reviewed by our advocate.'),
('summons_issued_served', 'Summons Issued & Served', 'litigation', 10, NULL, false, false, false, 'The Summons has been issued by the court and served on the RAF.'),
('matter_defended', 'Matter Defended', 'litigation', 11, 'We now have to mediate with RAF.', false, false, false, 'The RAF has entered a defence. We will now proceed to mediation to resolve the matter.'),
('proceeding_default', 'Proceeding on Default Basis', 'litigation', 12, NULL, false, false, false, 'We are going through processes and applications in order to proceed on a default basis.'),
('waiting_application_date', 'Waiting for Application Date from Court', 'litigation', 13, NULL, false, false, false, 'We are waiting for the court to provide an application date.'),
('followed_up_court_date', 'Followed Up Court Date', 'litigation', 14, NULL, false, false, false, 'We have followed up with the court regarding the date. We will notify you once confirmed.'),
('application_default_judgment', 'Application for Default Judgment', 'litigation', 15, NULL, false, false, false, 'The matter is undefended. We are bringing an application for Default Judgment.'),
('applied_default_judgment_date', 'Applied for Default Judgment Date', 'litigation', 16, NULL, false, false, false, 'We have applied for a Default Judgment date from the court. We will inform you once the date is set.'),

-- COURT PHASE
('default_judgment_merits', 'Default Judgment Date Set: Merits Only', 'court', 17, NULL, true, true, false, 'A court date has been set for Default Judgment on the merits of your case. The date may be moved to an earlier date.'),
('default_judgment_quantum', 'Default Judgment Date Set: Quantum Only', 'court', 18, NULL, true, true, false, 'A court date has been set for Default Judgment on quantum (the amount of damages). The date may be moved to an earlier date.'),
('default_judgment_merits_quantum', 'Default Judgment Date Set: Merits & Quantum', 'court', 19, NULL, true, true, false, 'A court date has been set for Default Judgment on both merits and quantum. The date may be moved to an earlier date.'),
('client_send_documents', 'Client to Send Documents', 'court', 20, NULL, true, false, true, 'We require certain documents from you to proceed. Please see the list of outstanding documents and submit them urgently.'),
('client_sign_discovery', 'Client to Sign & Return Discovery Affidavit', 'court', 21, NULL, false, false, true, 'Please sign the Discovery Affidavit and return it to our offices as soon as possible.'),
('client_sign_damages', 'Client to Sign Damages Affidavit', 'court', 22, NULL, false, false, true, 'Please sign the Damages Affidavit and urgently return it to our offices. This is critical to your case.'),
('matter_heard', 'Matter Heard', 'court', 23, NULL, true, false, false, 'Your matter has been heard in court. Your attorney will be in contact with you regarding the outcome.'),

-- RAF DAMAGES PHASE
('raf_undecided_general', 'RAF Undecided on General Damages', 'raf_damages', 24, 'We will now bring an application.', false, false, false, 'The RAF has not yet decided on whether you qualify for General Damages. We are preparing an application.'),
('raf_rejected_general', 'RAF Rejected General Damages Claim', 'raf_damages', 25, 'We will refer your matter to the HPCSA.', false, false, false, 'Unfortunately, the RAF has rejected your claim for General Damages. We are referring your matter to the HPCSA for further action.'),
('raf_accepted_general', 'RAF Accepted General Damages Claim', 'raf_damages', 26, NULL, false, false, false, 'The RAF has accepted your claim for General Damages. We will now proceed to the next steps.'),
('default_judgment_general_damages', 'Default Judgment Date Set: General Damages', 'court', 27, NULL, true, true, false, 'A court date has been set for Default Judgment on General Damages. The date may be moved to an earlier date.'),
('awaiting_general_damages_date', 'Awaiting Date for General Damages', 'raf_damages', 28, NULL, false, false, false, 'We are awaiting a court date for the General Damages portion of your claim.'),
('applied_raf_undertaking', 'Applied to RAF for Undertaking', 'raf_damages', 29, NULL, false, false, false, 'We have applied to the RAF for an Undertaking on your behalf.'),
('no_undertaking_received', 'No Undertaking Received from RAF', 'raf_damages', 30, 'We will bring an application.', false, false, false, 'We have not received an undertaking from the RAF. We are now preparing an application to address this.'),
('waiting_undertaking_date', 'Waiting for Undertaking Date', 'raf_damages', 31, NULL, false, false, false, 'We are waiting for a date regarding your undertaking application.'),

-- SETTLEMENT PHASE
('client_provide_bank_letter', 'Client to Provide Bank Letter', 'settlement', 32, NULL, false, false, true, 'Please provide a bank confirmation letter for payment processing. This is needed to finalise your settlement.'),
('client_attend_expert', 'Client to Attend Expert Appointments', 'settlement', 33, NULL, false, false, true, 'You need to attend expert appointments. Our offices will be in contact with you to arrange the details.'),
('demanded_interest_payment', 'Demanded Interest Payment from RAF', 'settlement', 34, NULL, false, false, false, 'We have sent a letter to the RAF demanding payment of interest on the capital amount owed to you.')
ON CONFLICT (slug) DO NOTHING;

-- 3. Create status history table
create table if not exists public.case_status_history (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  old_status text,
  new_status text not null,
  notes text,
  scheduled_date date,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz default now()
);

-- 4. Add new columns to cases table
DO $$ BEGIN
  -- Add status_notes column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'status_notes') THEN
    ALTER TABLE public.cases ADD COLUMN status_notes text;
  END IF;

  -- Add status_phase column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'status_phase') THEN
    ALTER TABLE public.cases ADD COLUMN status_phase text;
  END IF;

  -- Add scheduled_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'scheduled_date') THEN
    ALTER TABLE public.cases ADD COLUMN scheduled_date date;
  END IF;

  -- Add diary_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'diary_date') THEN
    ALTER TABLE public.cases ADD COLUMN diary_date timestamptz;
  END IF;
END $$;

-- 5. Drop old CHECK constraint on status
DO $$ BEGIN
  ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_status_check;
EXCEPTION WHEN undefined_object THEN
  NULL;
END $$;

-- 6. RLS for case_statuses (public read)
ALTER TABLE public.case_statuses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow public read on case_statuses') THEN
    CREATE POLICY "Allow public read on case_statuses" ON public.case_statuses FOR SELECT USING (true);
  END IF;
END $$;

-- 7. RLS for case_status_history
ALTER TABLE public.case_status_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view status history for their cases') THEN
    CREATE POLICY "Users can view status history for their cases" ON public.case_status_history FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = case_status_history.case_id
        AND (cases.client_id = auth.uid() OR cases.attorney_id = auth.uid())
      )
    );
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Staff can insert status history') THEN
    CREATE POLICY "Staff can insert status history" ON public.case_status_history FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Staff can view all status history') THEN
    CREATE POLICY "Staff can view all status history" ON public.case_status_history FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff', 'attorney')
      )
    );
  END IF;
END $$;


-- PART 3: PRESCRIPTION TRACKING
-- ============================================
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
