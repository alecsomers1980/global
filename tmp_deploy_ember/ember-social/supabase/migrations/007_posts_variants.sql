alter table public.posts
  add column if not exists variants jsonb default '{}'::jsonb,
  add column if not exists pillar text,
  add column if not exists rationale text;
