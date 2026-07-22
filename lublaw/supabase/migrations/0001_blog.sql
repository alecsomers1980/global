-- Lublaw blog: single-admin CMS, no roles table.
-- RLS: public reads published posts; any authenticated session (the one
-- admin account) can read/write everything. Run via `supabase db push` or
-- paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  excerpt        text not null default '',
  content        text not null,               -- markdown
  featured_image text not null default '',     -- Supabase Storage public URL
  status         text not null default 'draft' check (status in ('draft', 'published')),
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists posts_status_idx        on public.posts (status);
create index if not exists posts_published_at_idx   on public.posts (published_at desc);

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;

drop policy if exists "public reads published posts" on public.posts;
create policy "public reads published posts" on public.posts
  for select using (status = 'published' or auth.role() = 'authenticated');

drop policy if exists "authenticated writes posts" on public.posts;
create policy "authenticated writes posts" on public.posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
