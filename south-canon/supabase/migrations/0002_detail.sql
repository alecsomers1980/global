create type role_gender as enum ('male', 'female', 'any');
create type media_type as enum ('photo', 'video');

create table play_roles (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  name text not null,
  gender role_gender not null default 'any',
  age_range text,
  description text,
  is_ensemble boolean not null default false,
  sort int not null default 0
);

create table play_media (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  type media_type not null,
  url text not null,
  caption text,
  credit text,
  sort int not null default 0
);

create table play_press (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  quote text not null,
  source text not null,
  published_at date,
  sort int not null default 0
);

create table play_productions (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  company text not null,
  venue text,
  city text,
  country text,
  starts_on date,
  ends_on date,
  director text,
  notes text,
  is_premiere boolean not null default false
);

create index on play_roles (play_id, sort);
create index on play_media (play_id, sort);
create index on play_press (play_id, sort);
create index on play_productions (play_id, starts_on desc);

alter table play_roles enable row level security;
alter table play_media enable row level security;
alter table play_press enable row level security;
alter table play_productions enable row level security;

create policy "public reads roles" on play_roles for select using (true);
create policy "public reads media" on play_media for select using (true);
create policy "public reads press" on play_press for select using (true);
create policy "public reads productions" on play_productions for select using (true);
