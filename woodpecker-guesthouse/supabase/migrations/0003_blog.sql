-- Woodpecker Guesthouse — AI blog pipeline schema.
-- Run after 0001_init.sql and 0002_admin_auth.sql (needs is_staff() + touch_updated_at()).

create table if not exists public.blog_posts (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  excerpt           text not null default '',
  meta_title        text not null default '',
  meta_description  text not null default '',
  content           text not null default '',
  category          text not null default '',
  hero_image        text,
  status            text not null default 'draft' check (status in ('draft', 'approved', 'published', 'discarded')),
  scheduled_for     timestamptz,
  published_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

create index if not exists blog_posts_status_idx on public.blog_posts (status);

alter table public.blog_posts enable row level security;

create policy "public read published posts" on public.blog_posts
  for select using (status = 'published');
create policy "staff all posts" on public.blog_posts
  for all using (public.is_staff()) with check (public.is_staff());