-- Caracal Footwear: orders schema.
-- Status vocabulary, per the design spec:
--   pending        -- created at checkout, awaiting PayFast
--   paid           -- ITN confirmed payment AND stock was decremented cleanly
--   failed         -- PayFast reported a failed payment
--   cancelled      -- PayFast reported a cancelled payment
--   stock_conflict -- ITN confirmed payment but a line item had insufficient
--                     stock; money has landed, stock has not -- this needs a
--                     human (Donald or a refund), not a silent drop
--   fulfilled       -- Donald has shipped/handed over the order (Phase 3 admin)

create type order_status as enum
  ('pending', 'paid', 'failed', 'cancelled', 'stock_conflict', 'fulfilled');

create table orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,
  customer_name      text not null,
  email              text not null,
  phone              text not null default '',
  address_line1      text not null,
  address_line2      text not null default '',
  city               text not null,
  province           text not null,
  postal_code        text not null,
  subtotal           integer not null check (subtotal >= 0),
  delivery_fee       integer not null check (delivery_fee >= 0),
  total              integer not null check (total >= 0),
  status             order_status not null default 'pending',
  payfast_payment_id text,
  payment_data       jsonb,
  created_at         timestamptz not null default now(),
  paid_at            timestamptz
);

-- A given PayFast payment must map to at most one order.
create unique index orders_payfast_payment_id_idx
  on orders (payfast_payment_id) where payfast_payment_id is not null;

create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  variant_id   uuid not null references product_variants(id),
  -- Snapshots: a later price or name change must never rewrite order history.
  product_name text not null,
  colour       text not null,
  size         integer not null,
  qty          integer not null check (qty > 0),
  unit_price   integer not null check (unit_price >= 0)
);

create index order_items_order_idx   on order_items (order_id);
create index order_items_variant_idx on order_items (variant_id);

-- No accounts exist in v1, so there is no legitimate anon/public read path
-- for orders -- every access is server-side (checkout route, ITN route, the
-- confirmation page, and later the Phase 3 admin), all via the service-role
-- client. RLS is enabled with NO policies: default-deny, not public-read.
alter table orders      enable row level security;
alter table order_items enable row level security;
