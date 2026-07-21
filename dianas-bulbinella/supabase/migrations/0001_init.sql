-- Diana's Bulbinella — Phase B schema (catalogue, specials, admin)
-- Run in Supabase SQL editor, or `supabase db push`. See docs/PHASE_B_SUPABASE.md.

-- ─────────────────────────── categories ───────────────────────────
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  kind       text not null check (kind in ('concern','range','legacy')),
  blurb      text default '',
  sort       int  default 0,
  created_at timestamptz default now()
);

-- ─────────────────────────── products ───────────────────────────
create table if not exists public.products (
  id         uuid primary key default gen_random_uuid(),
  legacy_id  int,
  slug       text unique not null,
  title      text not null,
  excerpt    text default '',
  price      numeric(10,2) not null default 0,
  stock      text not null default 'instock',
  image      text default '',
  format     text default '',
  size       text default '',
  concerns   text[] not null default '{}',
  ranges     text[] not null default '{}',
  categories text[] not null default '{}',
  active     boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists products_concerns_idx on public.products using gin (concerns);
create index if not exists products_ranges_idx   on public.products using gin (ranges);
create index if not exists products_active_idx    on public.products (active);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ─────────────────────────── specials (promo campaigns) ───────────────────────────
create table if not exists public.specials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  starts_on  date not null,
  ends_on    date not null,
  note       text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  check (ends_on >= starts_on)
);

create table if not exists public.special_items (
  id            uuid primary key default gen_random_uuid(),
  special_id    uuid not null references public.specials(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  special_price numeric(10,2) not null check (special_price >= 0),
  unique (special_id, product_id)
);
create index if not exists special_items_product_idx on public.special_items (product_id);

-- ─────────────────────────── active special prices (view) ───────────────────────────
-- Lowest current special price per product where TODAY is within the promo window.
-- Scheduling ahead = future starts_on; auto activate/expire is purely date-driven.
create or replace view public.active_special_prices as
select si.product_id,
       min(si.special_price) as special_price,
       (array_agg(s.name order by si.special_price asc))[1] as special_name
from public.special_items si
join public.specials s on s.id = si.special_id
where current_date between s.starts_on and s.ends_on
group by si.product_id;

-- ─────────────────────────── profiles (admin/staff) ───────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'staff' check (role in ('admin','staff')),
  created_at timestamptz default now()
);

-- helper: is the current auth user an admin or staff?
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','staff')
  );
$$;

-- ─────────────────────────── RLS ───────────────────────────
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.specials       enable row level security;
alter table public.special_items  enable row level security;
alter table public.profiles       enable row level security;

-- public storefront reads
create policy "public read categories"    on public.categories    for select using (true);
create policy "public read products"       on public.products      for select using (true);
create policy "public read specials"       on public.specials      for select using (true);
create policy "public read special_items"  on public.special_items for select using (true);

-- staff writes (all mutations)
create policy "staff write categories"     on public.categories    for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write products"       on public.products      for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write specials"       on public.specials      for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write special_items"  on public.special_items for all using (public.is_staff()) with check (public.is_staff());

-- profiles: user reads own row; staff read all; only service role writes (seed/admin API)
create policy "read own profile"           on public.profiles      for select using (auth.uid() = id or public.is_staff());

-- auto-create a profile row on signup (default role staff; promote to admin manually / via seed)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- The `active_special_prices` view runs security-invoker by default in PG15+/Supabase;
-- underlying tables already allow public select, so anon can read it.
