create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text unique not null,
  name text not null,
  vertical text,
  status text not null default 'active' check (status in ('active','paused','archived')),
  approval_mode text not null default 'A' check (approval_mode in ('A','B')),
  ai_provider text not null default 'deepseek' check (ai_provider in ('deepseek','claude')),
  plan jsonb not null default '{"monthly_credits":0,"max_active":1,"credit_sizes":{"S":1,"M":3,"L":6},"turnaround":{"S":"48h","M":"5wd","L":"quoted"},"rollover":false,"renews_on":1}'::jsonb,
  notes text
);

create table if not exists client_people (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  signs_off_on text[] not null default '{}',
  is_primary boolean not null default false,
  notes text
);

create table if not exists client_systems (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  kind text,
  notes text
);

create table if not exists client_processes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  frequency text,
  volume text,
  owner_person_id uuid references client_people(id) on delete set null,
  pain text,
  notes text
);

create table if not exists client_facts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  statement text not null,
  source text not null check (source in ('alec','mcp','question','intake','spec','triage')),
  source_ref text,
  status text not null default 'proposed' check (status in ('proposed','confirmed','rejected')),
  confirmed_at timestamptz
);

create table if not exists client_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  kind text not null check (kind in ('site','domain','supabase','vercel','email','repo','other')),
  label text not null,
  url text,
  status text not null default 'unknown' check (status in ('ok','warning','broken','unknown')),
  notes text,
  checked_at timestamptz
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  batch_id uuid,
  text text not null,
  why text,
  status text not null default 'draft' check (status in ('draft','approved','sent','answered','dropped')),
  answer text,
  answered_via text check (answered_via in ('mcp','link','alec')),
  answered_at timestamptz
);

create table if not exists catalogue_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  size text not null check (size in ('S','M','L')),
  verticals text[] not null default '{}',
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text not null,
  why_it_matters text,
  affected_area text,
  examples text,
  deadline date,
  source text not null check (source in ('mcp','link','admin')),
  submitted_by text,
  status text not null default 'submitted' check (status in ('submitted','triaged','needs_info','estimated','client_approved','scheduled','in_progress','delivered','closed','declined','cancelled')),
  size text check (size in ('S','M','L')),
  credits int,
  catalogue_item_id uuid references catalogue_items(id) on delete set null,
  estimate jsonb,
  client_approved_at timestamptz,
  delivered_at timestamptz
);

create table if not exists request_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id uuid not null references requests(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  actor text not null check (actor in ('client','alec','system'))
);

create table if not exists credits_ledger (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  delta int not null,
  reason text not null check (reason in ('monthly_grant','request','adjustment')),
  request_id uuid references requests(id) on delete set null,
  period text not null,
  note text
);

create table if not exists outbox (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  kind text not null check (kind in ('reply','question_batch','estimate','fact_update','status_note')),
  ref_table text not null,
  ref_id uuid not null,
  draft jsonb not null,
  final jsonb,
  decision text not null default 'pending' check (decision in ('pending','approved','edited','rejected')),
  shadow_b boolean not null default false,
  decided_at timestamptz,
  sent_at timestamptz,
  link_token_id uuid
);

create table if not exists link_tokens (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  token text unique not null,
  kind text not null check (kind in ('request','question_batch','estimate')),
  ref_id uuid not null,
  client_id uuid not null references clients(id) on delete cascade,
  expires_at timestamptz not null,
  last_used_at timestamptz
);

alter table questionnaires add column if not exists client_id uuid references clients(id) on delete set null;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on clients;
create trigger clients_set_updated_at
before update on clients
for each row
execute function set_updated_at();

drop trigger if exists requests_set_updated_at on requests;
create trigger requests_set_updated_at
before update on requests
for each row
execute function set_updated_at();

alter table clients enable row level security;
alter table client_people enable row level security;
alter table client_systems enable row level security;
alter table client_processes enable row level security;
alter table client_facts enable row level security;
alter table client_assets enable row level security;
alter table questions enable row level security;
alter table catalogue_items enable row level security;
alter table requests enable row level security;
alter table request_events enable row level security;
alter table credits_ledger enable row level security;
alter table outbox enable row level security;
alter table link_tokens enable row level security;

create index if not exists requests_client_id_status_idx on requests(client_id, status);
create index if not exists outbox_decision_created_at_idx on outbox(decision, created_at);
create index if not exists questions_client_id_status_idx on questions(client_id, status);
create index if not exists credits_ledger_client_id_period_idx on credits_ledger(client_id, period);
create index if not exists link_tokens_token_idx on link_tokens(token);
create index if not exists client_facts_client_id_status_idx on client_facts(client_id, status);
create index if not exists client_people_client_id_idx on client_people(client_id);

