-- Diana's Bulbinella — post-purchase review-request emails.
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Mirrors reorder_reminders (0006): one row per email sent, with a unique index
-- so a given order can only ever trigger ONE review request. Written only by
-- the cron (service role); RLS grants nobody but staff any read access.

-- ─────────────── when an order was actually fulfilled ───────────────
-- The cron waits N days after FULFILMENT, not after ordering. `updated_at`
-- can't stand in for this: the touch trigger bumps it on any admin edit, so a
-- staff member fixing a typo would restart the customer's review-request clock.
alter table public.orders
  add column if not exists fulfilled_at timestamptz;

-- Existing shipped/collected orders get a best-effort stamp so the column is
-- never silently null for already-fulfilled work. Legacy orders are deliberately
-- included here, but the cron ignores them anyway (see below).
update public.orders
   set fulfilled_at = coalesce(updated_at, created_at)
 where fulfilled_at is null
   and status in ('shipped', 'collected');

-- ─────────────────────── review_requests ───────────────────────
create table if not exists public.review_requests (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  sent_at  timestamptz not null default now()
);

create index if not exists review_requests_user_idx on public.review_requests (user_id);
-- The anti-spam guarantee: one request per order, forever.
create unique index if not exists review_requests_order_uidx
  on public.review_requests (order_id);

alter table public.review_requests enable row level security;

drop policy if exists "staff read review requests" on public.review_requests;
create policy "staff read review requests" on public.review_requests
  for select using (public.is_staff());
