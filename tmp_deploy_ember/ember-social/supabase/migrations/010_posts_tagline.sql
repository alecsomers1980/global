alter table public.posts
  add column if not exists tagline text,
  add column if not exists tagline_accent text;
