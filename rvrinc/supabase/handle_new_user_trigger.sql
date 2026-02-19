-- 1. Create the function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    'client' -- Default role
  );
  return new;
end;
$$;

-- 2. Create the trigger to call the function on every new auth.user
-- Drop first to avoid errors if re-running
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. (Optional) Backfill existing users who might be missing a profile
insert into public.profiles (id, full_name, role)
select id, coalesce(raw_user_meta_data ->> 'full_name', 'Existing User'), 'client'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
