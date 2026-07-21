-- Diana's Bulbinella — Phase: product reviews (verified-buyer)
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Reviews are INSERTed server-side by /api/reviews with the service-role client
-- (same pattern as orders): the route enforces the verified-buyer gate, the
-- compliance screen, and the auto-approve rule (clean verified 4-5★ → approved,
-- else pending). There is deliberately no anon/authenticated insert policy —
-- the public can only SELECT approved rows. See docs/reviews-plan.md.

-- ─────────────────────────── reviews ───────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,   -- provenance
  rating      int  not null check (rating between 1 and 5),
  title       text not null default '',
  body        text not null default '',
  verified    boolean not null default false,                         -- bought it
  status      text not null default 'pending'
                check (status in ('pending','approved','hidden')),
  staff_reply text not null default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, product_id)          -- one review per customer per product
);
create index if not exists reviews_product_status_idx on public.reviews (product_id, status);
create index if not exists reviews_status_idx         on public.reviews (status);
create index if not exists reviews_created_idx        on public.reviews (created_at);

drop trigger if exists reviews_touch on public.reviews;
create trigger reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();

-- ─────────────── denormalised aggregate on products ───────────────
-- Lets a grid of product cards show stars without an extra query per card.
alter table public.products add column if not exists rating_avg   numeric(2,1) not null default 0;
alter table public.products add column if not exists rating_count int          not null default 0;

-- Recompute avg + count over APPROVED reviews for a single product.
create or replace function public.recount_product_rating(pid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.products p
     set rating_count = agg.cnt,
         rating_avg   = agg.avg
    from (
      select count(*)                                    as cnt,
             coalesce(round(avg(rating)::numeric, 1), 0) as avg
        from public.reviews
       where product_id = pid and status = 'approved'
    ) agg
   where p.id = pid;
end $$;

-- Fire on any review change; handle a product_id change (rare) by touching both.
create or replace function public.reviews_recount()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recount_product_rating(old.product_id);
    return old;
  end if;
  perform public.recount_product_rating(new.product_id);
  if (tg_op = 'UPDATE' and new.product_id is distinct from old.product_id) then
    perform public.recount_product_rating(old.product_id);
  end if;
  return new;
end $$;

drop trigger if exists reviews_recount_trg on public.reviews;
create trigger reviews_recount_trg
  after insert or update or delete on public.reviews
  for each row execute function public.reviews_recount();

-- ─────────────────────────── RLS ───────────────────────────
alter table public.reviews enable row level security;

-- Public reads approved reviews; staff read everything.
drop policy if exists "read approved reviews" on public.reviews;
create policy "read approved reviews" on public.reviews
  for select using (status = 'approved' or public.is_staff());

-- Staff moderate (approve / hide / reply / delete). Inserts are service-role only.
drop policy if exists "staff write reviews" on public.reviews;
create policy "staff write reviews" on public.reviews
  for all using (public.is_staff()) with check (public.is_staff());
