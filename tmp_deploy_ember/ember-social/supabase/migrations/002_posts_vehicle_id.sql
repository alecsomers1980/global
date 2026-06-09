-- Add vehicle_id column to posts for smart scheduling (max 2 cars per day)
alter table public.posts add column if not exists vehicle_id text;

-- Index for efficient scheduling queries
create index if not exists idx_posts_vehicle_scheduling
  on public.posts (workspace_id, scheduled_at, vehicle_id)
  where vehicle_id is not null;
