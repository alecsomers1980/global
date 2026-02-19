-- 1. Add email column to profiles table
alter table public.profiles add column if not exists email text;

-- 2. Update the trigger function to include email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    'client',
    new.email
  );
  return new;
end;
$$;

-- 3. Backfill emails for existing profiles
update public.profiles
set email = users.email
from auth.users
where profiles.id = users.id;

-- 4. Update "Existing User" names using the email if name is still generic
update public.profiles
set full_name = split_part(email, '@', 1) 
where full_name = 'Existing User';
