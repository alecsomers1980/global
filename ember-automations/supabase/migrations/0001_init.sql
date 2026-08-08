create extension if not exists pgcrypto;

create table if not exists questionnaires (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client_name text not null,
  project_name text not null,
  type text not null check (type in ('website','tool','existing')),
  status text not null default 'draft'
    check (status in ('draft','sent','in_progress','submitted','follow_up','ready_to_quote')),
  question_set jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references questionnaires(id) on delete cascade,
  question_id text not null,
  storage_path text not null,
  filename text not null,
  content_type text,
  size integer,
  uploaded_at timestamptz not null default now()
);

-- RLS on; the app uses the service-role key (bypasses RLS). No public policies = no public table access.
alter table questionnaires enable row level security;
alter table uploads enable row level security;

insert into storage.buckets (id, name, public)
values ('intake-uploads','intake-uploads', false)
on conflict (id) do nothing;
