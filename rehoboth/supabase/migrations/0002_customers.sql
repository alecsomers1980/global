-- Customer profiles, keyed to Supabase Auth.
--
-- Accounts are optional: guest checkout stays available and orders are matched
-- to a person by email, not by a foreign key. This table exists for the profile
-- and for trade_status, which is how the distributor tier gets switched on for
-- an approved stockist without a further migration.

create type trade_status as enum ('none','pending','approved');

create table customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  trade_status trade_status not null default 'none',
  created_at timestamptz not null default now()
);

alter table customers enable row level security;

-- A customer may read and update only their own row. Unlike orders, this table
-- is safe to expose to the anon key under a policy, because every row belongs
-- to exactly one authenticated user.
create policy customers_select_own on customers
  for select using (auth.uid() = user_id);

create policy customers_update_own on customers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Populate the profile on sign-up. Without this the table stays empty, since
-- nothing in the app writes to it directly.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into customers (user_id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
