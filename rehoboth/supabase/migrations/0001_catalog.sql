-- Rehoboth catalogue.
--
-- price_trade and min_qty_trade exist from the first migration on purpose: the
-- distribution pricelist has both a "Distr. Shop Min of 10" column and a retail
-- column, and the agreed plan is retail-first with a distributor tier later.
-- Carrying both now makes that tier a feature flag rather than a migration.

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  botanical_name text,
  -- Per-product accent lifted from the printed label artwork.
  accent_hex text not null default '#6C8781',
  summary text,
  traditional_use text,
  ingredients text,
  directions text,
  storage text,
  hero_image text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type variant_format as enum
  ('powder', 'capsules', 'bulk', 'ointment', 'oil', 'bar', 'tincture', 'balm');

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  format variant_format not null,
  size_label text not null,
  barcode text,
  price_retail numeric(10,2) not null,
  price_trade numeric(10,2),
  min_qty_trade int not null default 10,
  stock int not null default 0,
  sort_order int not null default 0,
  active boolean not null default true,
  unique (product_id, format, size_label)
);

create index product_variants_product_id_idx on product_variants (product_id);

alter table products enable row level security;
alter table product_variants enable row level security;

create policy "public read active products"
  on products for select using (active);

create policy "public read active variants"
  on product_variants for select using (active);
