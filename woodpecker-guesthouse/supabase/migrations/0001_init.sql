-- Woodpecker Guesthouse — initial schema (rooms, gallery, keep-alive).
-- Run in the Supabase SQL editor, or `supabase db push`.

create extension if not exists pgcrypto;

-- ─────────────────────────── rooms ───────────────────────────
create table if not exists public.rooms (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text not null default '',
  bed_type     text not null default '',
  bedrooms     int not null default 1,
  bathrooms    int not null default 1,
  max_guests   int not null default 2,
  rate_from    numeric(10,2),
  amenities    text[] not null default '{}',
  hero_image   text,
  gallery_images text[] not null default '{}',
  sort_order   int not null default 0,
  published    boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists rooms_touch on public.rooms;
create trigger rooms_touch before update on public.rooms
  for each row execute function public.touch_updated_at();

-- ─────────────────────────── gallery ───────────────────────────
create table if not exists public.gallery_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text unique not null,
  sort_order int not null default 0
);

create table if not exists public.gallery_images (
  id          uuid primary key default gen_random_uuid(),
  src         text not null,
  alt         text not null default '',
  category_id uuid references public.gallery_categories(id) on delete set null,
  sort_order  int not null default 0,
  created_at  timestamptz default now()
);
create index if not exists gallery_images_category_idx on public.gallery_images (category_id);

-- ─────────────────────────── keep-alive (Supabase free-tier) ───────────────────────────
create table if not exists public.keep_alive (
  id         bigint generated always as identity primary key,
  note       text,
  created_at timestamptz default now()
);

-- ─────────────────────────── RLS: public read on published/all rows ───────────────────────────
-- Staff-write policies are added in Plan B (Admin) once auth exists.
alter table public.rooms              enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_images     enable row level security;
alter table public.keep_alive         enable row level security;

create policy "public read published rooms" on public.rooms
  for select using (published = true);
create policy "public read gallery categories" on public.gallery_categories
  for select using (true);
create policy "public read gallery images" on public.gallery_images
  for select using (true);