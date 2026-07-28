create table enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  play_slug text,
  intent text,
  created_at timestamptz not null default now()
);

alter table enquiries enable row level security;
-- No public policy: writes go through the service-role client only.
