-- Diana's Bulbinella — WooCommerce history import
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Marks orders that came from the old WordPress/WooCommerce site (4,626 of
-- them, 2018-02-21 → 2026-07-09) so eight years of history doesn't bury the
-- day-to-day queue in /admin/orders. Legacy orders still belong to their
-- customer, still show in that customer's own order history, and still count
-- towards revenue and the monthly report — they're just filed separately for
-- staff.

alter table public.orders
  add column if not exists legacy boolean not null default false;

-- The original WooCommerce status ('wc-on-hold', 'wc-processing', …).
--
-- Kept deliberately: every legacy order was an EFT (bacs) and 3,616 of them
-- sat at 'wc-on-hold' worth R2.74m. We import those as paid on Diana's word
-- that she was paid but never updated WooCommerce. If that turns out to be
-- wrong, this column makes it one UPDATE to correct rather than a re-import:
--   update public.orders set status = 'received', paid_at = null
--   where legacy and legacy_status = 'wc-on-hold';
alter table public.orders
  add column if not exists legacy_status text;

create index if not exists orders_legacy_idx on public.orders (legacy);

-- order_number is unique, and the importer writes 'WC-<old id>', which makes
-- the whole import idempotent: re-running it updates rather than duplicates.
