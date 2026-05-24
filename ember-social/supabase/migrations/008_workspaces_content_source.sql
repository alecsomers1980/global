alter table public.workspaces
  add column if not exists content_source jsonb default '{}'::jsonb;
