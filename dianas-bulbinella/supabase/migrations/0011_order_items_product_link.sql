-- Diana's Bulbinella — link order_items to the live catalogue.
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Why: the reviews verified-buyer gate (docs/reviews-plan.md) matches a customer's
-- past purchases against a product. New orders carry `product_slug`, but the 4,626
-- imported Woo orders do NOT — every legacy `order_items` row has product_slug = ''
-- and variant_id = null, because the old catalogue was one product per size and was
-- merged into variants during the rebuild. Without this column no legacy customer
-- could ever review anything, so the feature would ship dead.
--
-- `product_id` is resolved for legacy rows by `npm run backfill-order-products`
-- (size-stripped title match, ~72% of line items). It stays null where no confident
-- match exists — an unresolved row simply means that purchase can't be reviewed.

alter table public.order_items
  add column if not exists product_id uuid references public.products(id) on delete set null;

-- The verified-buyer lookup filters order_items by product; index it.
create index if not exists order_items_product_idx on public.order_items (product_id);

-- ─────────────── reviews: denormalised author display name ───────────────
-- The storefront needs "Anna B." next to each review. It CANNOT come from a
-- join: `profiles` RLS is "read own profile or is_staff", so an anon embed
-- returns null for everyone else's name (every reviewer would render as
-- "Customer"). Loosening that policy would publish all 1,885 customer names —
-- a POPIA problem. So /api/reviews computes the abbreviated name server-side
-- and stores it here: only "Anna B." is ever persisted, never the surname.
alter table public.reviews
  add column if not exists author_name text not null default '';
