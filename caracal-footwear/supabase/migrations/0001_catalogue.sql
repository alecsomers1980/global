-- Caracal Footwear: catalogue schema
-- Money is integer cents throughout. Never numeric, never float.

create type product_category as enum ('chukka', 'low_cut', 'chelsea', 'hiker');
create type signature_type  as enum ('wildlife', 'hide', 'floral');

create table products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  style_no       text,
  name           text not null,
  description    text not null default '',
  category       product_category not null,
  -- is_signature is orthogonal to category: a lion-panel vellie is
  -- category='low_cut' AND is_signature=true, so it appears in both
  -- /range/low-cut and /signature. There is no 'signature' category.
  is_signature   boolean not null default false,
  signature_type signature_type,
  base_price     integer not null check (base_price >= 0),
  featured       boolean not null default false,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  constraint signature_type_only_when_signature
    check ((is_signature and signature_type is not null)
        or (not is_signature and signature_type is null))
);

create table product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  colour_name    text not null,
  colour_hex     text not null,
  size           integer not null check (size between 4 and 15),
  sku            text unique,
  stock_qty      integer not null default 0 check (stock_qty >= 0),
  price_override integer check (price_override >= 0),
  active         boolean not null default true,
  unique (product_id, colour_name, size)
);

create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  colour_name text,           -- null means: applies to every colour
  url         text not null,
  alt         text not null default '',
  sort_order  integer not null default 0
);

create table site_settings (
  key   text primary key,
  value text not null
);

create index products_category_idx  on products (category) where active;
create index products_signature_idx on products (is_signature) where active;
create index variants_product_idx   on product_variants (product_id) where active;
create index images_product_idx     on product_images (product_id, sort_order);

insert into site_settings (key, value) values
  ('delivery_free_threshold', '100000'),  -- R1000 in cents
  ('delivery_fee',            '9900'),    -- R99 in cents
  ('lead_time',               '5 working days'),
  ('contact_phone',           '082 451 0359'),
  ('contact_email',           'donald@caracallodge.co.za'),
  ('whatsapp_number',         '27824510359');

-- Public read access. Writes are service-role only until admin auth lands in
-- Phase 3, so there is deliberately no insert/update/delete policy here.
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table product_images   enable row level security;
alter table site_settings    enable row level security;

create policy "public read active products" on products
  for select using (active);
create policy "public read active variants" on product_variants
  for select using (active);
create policy "public read images"          on product_images
  for select using (true);
create policy "public read settings"        on site_settings
  for select using (true);
