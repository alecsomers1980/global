create type availability_status as enum ('available', 'restricted', 'unavailable');

create table licence_tiers (
  id text primary key,
  label text not null,
  description text,
  min_fee numeric(10,2),
  royalty_pct numeric(5,2),
  sort int not null default 0
);

create table rights_availability (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  territory text not null,
  tier_id text references licence_tiers(id) on delete cascade,
  status availability_status not null default 'available',
  restriction_note text,
  valid_from date,
  valid_to date
);

create index on rights_availability (play_id, territory);

insert into licence_tiers (id, label, description, sort) values
  ('educational',   'Educational',            'Schools, colleges and university drama departments', 1),
  ('amateur',       'Amateur',                'Non-professional groups charging no admission',      2),
  ('community',     'Community theatre',      'Amateur societies charging admission',               3),
  ('professional',  'Professional',           'Professional producers in South Africa and Africa',  4),
  ('international', 'International',          'Professional producers outside Africa',              5);

alter table licence_tiers enable row level security;
alter table rights_availability enable row level security;

create policy "public reads tiers" on licence_tiers for select using (true);
create policy "public reads availability" on rights_availability for select using (true);
