-- Orders.
--
-- channel defaults to 'retail' and exists so the distributor tier needs no
-- migration later, the same reasoning as price_trade in 0001.
--
-- No RLS policies are defined on purpose. RLS is enabled and nothing is
-- granted, so only the service role reaches these tables — orders carry
-- customer names, addresses and phone numbers, and guest checkout means there
-- is no authenticated user to scope a policy to.

-- References are human-facing ("REH-01001" on the invoice and in email), so
-- they come from a sequence rather than a random string: a small business
-- reads them out over the phone.
create sequence order_reference_seq start 1001;

create type order_status as enum ('pending','paid','failed','cancelled','fulfilled');
create type order_channel as enum ('retail','trade');

create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null
    default ('REH-' || lpad(nextval('order_reference_seq')::text, 5, '0')),
  status order_status not null default 'pending',
  channel order_channel not null default 'retail',
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  ship_line1 text,
  ship_city text,
  ship_province text,
  ship_postcode text,
  ship_country text not null default 'ZA',
  collect_from_farm boolean not null default false,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payfast_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index orders_status_idx on orders (status, created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  -- Nullable, and null on delete: a variant can be retired from the catalogue
  -- without destroying the record of what was actually bought. The name, size
  -- and price are copied here for that reason and must never be joined back.
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  size_label text not null,
  unit_price numeric(10,2) not null,
  qty int not null check (qty > 0)
);

create index order_items_order_id_idx on order_items (order_id);

alter table orders enable row level security;
alter table order_items enable row level security;

-- Settings that the client must be able to change without a deploy. Shipping
-- rates are the first entry because they are still an open question with the
-- client (spec §8.1) and the values below are the documented default.
create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

insert into site_settings (key, value) values
  ('shipping', '{"flat": 99, "free_over": 750, "collect_from_farm": true}');
