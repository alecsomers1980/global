-- Phase 2 — e-book sale loop: product config, orders, commission ledger, storage bucket.
-- Re-runnable. All tables have RLS enabled with NO policies — access is via the
-- service-role server code only (server actions / route handlers), always user-scoped.

-- ── Single-row e-book product config (managed in /admin/ebook) ──
create table if not exists public.ebook_product (
  id int primary key default 1,
  title text not null default 'Job-Hunting E-book',
  description text,
  price_cents int not null default 0,
  commission_type text not null default 'percent',   -- 'percent' | 'flat'
  commission_value numeric not null default 0,        -- percent (e.g. 30) OR flat rands
  file_path text,                                      -- path inside the private 'ebook' bucket
  is_active boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint ebook_product_singleton check (id = 1)
);
insert into public.ebook_product (id) values (1) on conflict (id) do nothing;

-- ── Orders ──
create table if not exists public.ebook_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_email text not null,
  buyer_name text,
  amount_cents int not null,
  status text not null default 'pending',             -- 'pending' | 'paid' | 'failed'
  affiliate_id uuid references public.profiles(id) on delete set null,
  ref_code text,
  payment_ref text,                                    -- PayFast pf_payment_id
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ── Commission ledger (one per attributed paid order) ──
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ebook_orders(id) on delete cascade,
  affiliate_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents int not null,
  status text not null default 'pending',              -- 'pending' | 'approved' | 'paid'
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique(order_id)
);

alter table public.ebook_product enable row level security;
alter table public.ebook_orders  enable row level security;
alter table public.commissions   enable row level security;

-- ── Private storage bucket for the e-book file ──
insert into storage.buckets (id, name, public) values ('ebook', 'ebook', false)
  on conflict (id) do nothing;
