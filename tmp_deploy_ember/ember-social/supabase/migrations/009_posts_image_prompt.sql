alter table public.posts
  add column if not exists image_prompt text,
  add column if not exists image_status text
    check (image_status in ('pending', 'generating', 'ready', 'failed', 'skipped'))
    default 'pending';
