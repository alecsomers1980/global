create extension if not exists "pgcrypto";

create type play_status as enum ('draft', 'published');
create type credit_role as enum ('book', 'music', 'lyrics', 'translation', 'adaptation', 'author');

create table playwrights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  bio text,
  portrait_url text,
  country text,
  honours text[] not null default '{}',
  represented_since date,
  status play_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table plays (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  logline text,
  synopsis_short text,
  synopsis_full text,
  genres text[] not null default '{}',
  themes text[] not null default '{}',
  languages text[] not null default '{}',
  content_warnings text[] not null default '{}',
  year_written int,
  duration_min int,
  acts int,
  setting text,
  time_period text,
  target_audience text,
  is_musical boolean not null default false,
  hero_image_url text,
  status play_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table play_playwrights (
  play_id uuid not null references plays(id) on delete cascade,
  playwright_id uuid not null references playwrights(id) on delete cascade,
  role credit_role not null default 'author',
  sort int not null default 0,
  primary key (play_id, playwright_id, role)
);

alter table playwrights enable row level security;
alter table plays enable row level security;
alter table play_playwrights enable row level security;

create policy "public reads published playwrights" on playwrights
  for select using (status = 'published');
create policy "public reads published plays" on plays
  for select using (status = 'published');
create policy "public reads credits" on play_playwrights
  for select using (true);
