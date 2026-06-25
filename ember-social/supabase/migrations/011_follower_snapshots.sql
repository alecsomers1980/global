-- Follower-count snapshots for follower-growth reporting.
-- A daily cron records one row per connected social account; the monthly report
-- compares the latest snapshot in the month to the latest snapshot in the prior
-- month to derive net follower growth.

create table if not exists public.follower_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null,
  account_id text not null,
  followers integer not null default 0,
  captured_at timestamptz not null default now()
);

create index if not exists idx_follower_snapshots_lookup
  on public.follower_snapshots (workspace_id, platform, captured_at desc);
