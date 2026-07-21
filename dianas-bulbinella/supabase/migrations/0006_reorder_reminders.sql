-- Diana's Bulbinella — Phase 5: reorder reminders
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- One row per reminder sent, so the cron never mails the same customer about
-- the same order twice. Written only by the cron (service role) — there is no
-- policy granting anon/authenticated any access, which with RLS enabled means
-- the table is invisible to the storefront.

create table if not exists public.reorder_reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  last_order_id uuid references public.orders(id) on delete cascade,
  sent_at       timestamptz not null default now()
);

create index if not exists reorder_reminders_user_idx on public.reorder_reminders (user_id);
create unique index if not exists reorder_reminders_order_uidx
  on public.reorder_reminders (last_order_id);

alter table public.reorder_reminders enable row level security;

-- Staff can look at what's been sent; nobody else reads it.
drop policy if exists "staff read reorder reminders" on public.reorder_reminders;
create policy "staff read reorder reminders" on public.reorder_reminders
  for select using (public.is_staff());
