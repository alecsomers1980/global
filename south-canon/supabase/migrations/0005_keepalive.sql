create table keep_alive (
  id uuid primary key default gen_random_uuid(),
  pinged_at timestamptz not null default now()
);

alter table keep_alive enable row level security;
-- No policy: the workflow writes with the service-role key.