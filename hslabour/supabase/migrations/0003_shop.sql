-- Phase 3 — shop: instant digital products + done-for-you services.
-- Re-runnable. RLS enabled with NO policies; access via service-role server code only.
-- The customer portal is authorised by an unguessable per-job token (no buyer login).

create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_cents int not null default 0,
  kind text not null default 'instant',            -- 'instant' | 'service'
  file_path text,                                   -- instant: downloadable file in 'shop' bucket
  requires_upload boolean not null default false,   -- service: buyer uploads their CV in the portal
  revisions int not null default 0,                 -- service: included revisions
  is_active boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.shop_products(id) on delete set null,
  product_name text not null,
  buyer_email text not null,
  buyer_name text,
  brief text,                                       -- buyer instructions (service products)
  amount_cents int not null,
  status text not null default 'pending',           -- 'pending' | 'paid' | 'failed'
  payment_ref text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.service_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  token uuid not null default gen_random_uuid(),
  product_name text not null,
  buyer_email text not null,
  buyer_name text,
  brief text,
  status text not null default 'received',           -- 'received'|'in_progress'|'awaiting_client'|'delivered'
  upload_path text,                                  -- buyer's uploaded CV
  deliverable_path text,                             -- delivered file
  revisions_remaining int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivered_at timestamptz,
  unique(order_id)
);
create index if not exists service_jobs_token_idx on public.service_jobs(token);

alter table public.shop_products enable row level security;
alter table public.shop_orders   enable row level security;
alter table public.service_jobs  enable row level security;

insert into storage.buckets (id, name, public) values ('shop', 'shop', false)
  on conflict (id) do nothing;
