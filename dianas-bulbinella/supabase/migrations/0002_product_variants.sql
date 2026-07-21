-- Diana's Bulbinella — Phase B.1 schema: variable products (size variants)
-- Run in Supabase SQL editor, or `supabase db push`. See docs/PHASE_B_SUPABASE.md.
--
-- Every existing `products` row is one size today. This migration turns
-- `products` into the parent/group row and moves price/stock/image/size to a
-- new `product_variants` table — one row per size. Every product gets at
-- least one variant (its own former price/stock/image/size), so there's no
-- "simple vs variable" branch anywhere in the app. A follow-up data pass
-- (scripts/group-variants.mjs) merges products that are really the same
-- item in different sizes into one parent with multiple variants.

-- ─────────────────────────── product_variants ───────────────────────────
create table if not exists public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size       text not null default '',
  price      numeric(10,2) not null default 0,
  stock      text not null default 'instock',
  image      text default '',
  sku        text default '',
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (product_id, size)
);
create index if not exists product_variants_product_idx on public.product_variants (product_id);

drop trigger if exists product_variants_touch on public.product_variants;
create trigger product_variants_touch before update on public.product_variants
  for each row execute function public.touch_updated_at();

-- Backfill: one variant per existing product, carrying over its price/stock/image/size.
insert into public.product_variants (product_id, size, price, stock, image, sort_order)
select id, size, price, stock, image, 0
from public.products
on conflict (product_id, size) do nothing;

-- ─────────────────────────── special_items: product_id → variant_id ───────────────────────────
alter table public.special_items add column if not exists variant_id uuid references public.product_variants(id) on delete cascade;

-- Backfill via the 1:1 variant each product just got above.
update public.special_items si
set variant_id = pv.id
from public.product_variants pv
where pv.product_id = si.product_id
  and si.variant_id is null;

alter table public.special_items alter column variant_id set not null;

-- Recreate the view against variant_id BEFORE dropping product_id below —
-- the old view (from 0001) still references product_id, and Postgres won't
-- let you drop a column a view depends on. CREATE OR REPLACE can't rename an
-- output column (product_id -> variant_id), so drop and recreate instead.
drop view if exists public.active_special_prices;
create view public.active_special_prices as
select si.variant_id,
       min(si.special_price) as special_price,
       (array_agg(s.name order by si.special_price asc))[1] as special_name
from public.special_items si
join public.specials s on s.id = si.special_id
where current_date between s.starts_on and s.ends_on
group by si.variant_id;

alter table public.special_items drop constraint if exists special_items_special_id_product_id_key;
alter table public.special_items drop column if exists product_id;
alter table public.special_items add constraint special_items_special_id_variant_id_key unique (special_id, variant_id);

drop index if exists special_items_product_idx;
create index if not exists special_items_variant_idx on public.special_items (variant_id);

-- ─────────────────────────── products: drop columns now owned by variants ───────────────────────────
alter table public.products drop column if exists price;
alter table public.products drop column if exists stock;
alter table public.products drop column if exists image;
alter table public.products drop column if exists size;

-- ─────────────────────────── RLS ───────────────────────────
alter table public.product_variants enable row level security;
create policy "public read product_variants" on public.product_variants for select using (true);
create policy "staff write product_variants" on public.product_variants for all using (public.is_staff()) with check (public.is_staff());
