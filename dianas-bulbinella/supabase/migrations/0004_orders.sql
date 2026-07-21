-- Diana's Bulbinella — Phase 2: orders & checkout
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Guest checkout is supported: orders.user_id is nullable. Orders are always
-- INSERTed server-side by the checkout route using the service-role client, so
-- there is deliberately no anon/authenticated insert policy.

-- ─────────────────────────── orders ───────────────────────────
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null,
  user_id          uuid references auth.users(id) on delete set null,
  email            text not null,
  full_name        text default '',
  phone            text default '',
  delivery_method  text not null default 'delivery' check (delivery_method in ('delivery','collection')),
  delivery_address jsonb,            -- snapshot at order time
  collection_point text default '',
  subtotal         numeric(10,2) not null default 0,
  shipping         numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  -- received      = placed, awaiting payment ("Order received")
  -- paid          = PayFast confirmed  ("Payment received")
  -- completed     = packed / ready     ("Order completed")
  -- shipped/collected = fulfilled (terminal)
  status           text not null default 'received'
                     check (status in ('received','paid','completed','shipped','collected','cancelled')),
  payment_id       text,
  payment_data     jsonb,
  paid_at          timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists orders_user_idx    on public.orders (user_id);
create index if not exists orders_email_idx   on public.orders (lower(email));
create index if not exists orders_status_idx  on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ─────────────────────────── order_items ───────────────────────────
-- Everything is snapshotted so historical orders don't change when the
-- catalogue does (or when a variant is deleted).
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  variant_id    uuid references public.product_variants(id) on delete set null,
  product_slug  text default '',
  product_title text not null default '',
  size          text default '',
  image         text default '',
  unit_price    numeric(10,2) not null default 0,
  qty           int not null default 1 check (qty > 0),
  line_total    numeric(10,2) not null default 0
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ─────────────────────────── RLS ───────────────────────────
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- A signed-in customer sees their own orders; staff see everything.
drop policy if exists "read own orders" on public.orders;
create policy "read own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_staff());

drop policy if exists "read own order items" on public.order_items;
create policy "read own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_staff())
    )
  );

-- Staff update order status. (Inserts are service-role only — see header.)
drop policy if exists "staff update orders" on public.orders;
create policy "staff update orders" on public.orders
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff write order items" on public.order_items;
create policy "staff write order items" on public.order_items
  for all using (public.is_staff()) with check (public.is_staff());
