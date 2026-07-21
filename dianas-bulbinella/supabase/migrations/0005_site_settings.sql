-- Diana's Bulbinella — home page popup settings
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Single-row settings table so Diana can swap the home page popup image (and
-- turn it off) from the admin without a deploy.

create table if not exists public.site_settings (
  id            int primary key default 1,
  popup_enabled boolean not null default true,
  popup_image   text default '/images/popup.jpeg',
  popup_alt     text default '',
  popup_link    text default '',
  updated_at    timestamptz default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings" on public.site_settings
  for select using (true);

drop policy if exists "staff write site_settings" on public.site_settings;
create policy "staff write site_settings" on public.site_settings
  for all using (public.is_staff()) with check (public.is_staff());
