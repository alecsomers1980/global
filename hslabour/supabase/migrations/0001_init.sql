-- profiles (1:1 with auth.users) + signup trigger + RLS + column hardening
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  role text not null default 'affiliate',
  is_approved boolean not null default false,
  affiliate_code text unique,
  promo_channels text,
  bank_name text,
  account_number text,
  branch_code text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users may read their own profile row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Users may update their own profile row (column privileges restrict which columns)
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Column-level hardening: authenticated users can update ONLY payout/contact fields,
-- never role / is_approved / affiliate_code (those are written by the service role only).
revoke update on public.profiles from authenticated;
grant update (first_name, last_name, phone, bank_name, account_number, branch_code)
  on public.profiles to authenticated;

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone, promo_channels, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'promo_channels',
    coalesce(new.raw_user_meta_data->>'role', 'affiliate')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();