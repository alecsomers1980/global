-- Woodpecker Guesthouse — admin auth (staff profiles, is_staff(), staff-write RLS).

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- helper: is the current auth user an admin or staff?
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  );
$$;

-- auto-create a profile row (role defaults to 'staff') whenever a new
-- Supabase Auth user is created — promote to 'admin' manually in the table.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- staff-write policies on the tables Foundation (0001_init.sql) already made
-- public-read. Public-read policies from 0001 are untouched.
create policy "staff write rooms" on public.rooms
  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write gallery categories" on public.gallery_categories
  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write gallery images" on public.gallery_images
  for all using (public.is_staff()) with check (public.is_staff());

-- public bucket for room/gallery photos — service-role uploads bypass RLS,
-- and a public bucket serves reads without needing storage RLS policies.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;