alter table public.posts
  add column if not exists regeneration_count int default 0,
  add column if not exists referred_to_agency boolean default false;

alter table public.campaign_batches
  add column if not exists schedule_pattern text;
