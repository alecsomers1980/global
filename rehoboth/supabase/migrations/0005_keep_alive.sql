-- Supabase free-tier projects pause after a week of inactivity. A scheduled
-- insert twice a week keeps the database awake. See .github/workflows/keep-alive.yml
create table keep_alive (
  id bigserial primary key,
  pinged_at timestamptz not null default now()
);
