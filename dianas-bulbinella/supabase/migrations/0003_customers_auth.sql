-- Diana's Bulbinella — Phase 1: customer accounts
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Turns the staff-only `profiles` table into one that also holds customers,
-- and adds saved addresses + wishlist. IMPORTANT security fix: until now
-- handle_new_user() defaulted every new signup to role 'staff'. Public
-- customer signups must be 'customer'.

-- ─────────────────────────── profiles: allow 'customer' role + fields ───────────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin','staff','customer'));

-- New signups become customers, not staff (the trigger inserts only id+email,
-- so the column default is what public sign-ups receive).
alter table public.profiles alter column role set default 'customer';

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists marketing_opt_in boolean not null default false;

-- Redefine the signup trigger to (a) default new users to 'customer' explicitly
-- and (b) copy full_name from the signUp metadata, so it persists even when
-- email confirmation delays the first session.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Let a signed-in user update their OWN profile row…
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- …but NOT their role (prevents a customer from self-promoting to admin).
-- Column-level privilege: role can only be changed by the service-role client.
revoke update (role) on public.profiles from authenticated, anon;

-- ─────────────────────────── customer_addresses ───────────────────────────
create table if not exists public.customer_addresses (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  label            text default '',
  recipient        text default '',
  phone            text default '',
  line1            text not null default '',
  line2            text default '',
  city             text default '',
  province         text default '',
  postal_code      text default '',
  collection_point text default '',
  is_default       boolean not null default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists customer_addresses_user_idx on public.customer_addresses (user_id);

drop trigger if exists customer_addresses_touch on public.customer_addresses;
create trigger customer_addresses_touch before update on public.customer_addresses
  for each row execute function public.touch_updated_at();

alter table public.customer_addresses enable row level security;
drop policy if exists "own addresses" on public.customer_addresses;
create policy "own addresses" on public.customer_addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────── wishlist_items ───────────────────────────
create table if not exists public.wishlist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);
create index if not exists wishlist_items_user_idx on public.wishlist_items (user_id);

alter table public.wishlist_items enable row level security;
drop policy if exists "own wishlist" on public.wishlist_items;
create policy "own wishlist" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
