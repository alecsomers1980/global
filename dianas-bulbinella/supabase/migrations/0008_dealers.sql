-- Diana's Bulbinella — dealers / agents + become-a-dealer applications
-- Run in Supabase SQL editor, or `supabase db push`.

-- ─────────────────────────── dealers ───────────────────────────
-- Diana's list is organised by TOWN, so one agent can appear several times
-- (Anne Maw under Durban North, La Lucia and Umhlanga). Here it's one row per
-- agent per province with every town in `areas`: she edits a phone number once,
-- and customers can still find their own town.
create table if not exists public.dealers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  business   text default '',          -- e.g. 'Gentleman's Barbershop'
  province   text not null,
  region     text default '',          -- 'Johannesburg – East Rand', 'Cape Town'
  areas      text[] not null default '{}',
  phone      text default '',
  phone_alt  text default '',
  email      text default '',
  notes      text default '',
  is_depot   boolean not null default false,  -- depot / sales leader
  active     boolean not null default true,
  sort       int default 0,
  -- Set only on rows created by `npm run seed-dealers`, so the seed can be
  -- re-run without duplicating. Rows Diana adds by hand leave this null, and
  -- unique treats nulls as distinct, so it never constrains her.
  seed_key   text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists dealers_province_idx on public.dealers (province);
create index if not exists dealers_active_idx   on public.dealers (active);
-- Town lookups are the main search on the public page.
create index if not exists dealers_areas_idx    on public.dealers using gin (areas);

drop trigger if exists dealers_touch on public.dealers;
create trigger dealers_touch before update on public.dealers
  for each row execute function public.touch_updated_at();

alter table public.dealers enable row level security;

-- The agent list is public on the current site, so the storefront reads it —
-- but only the active rows. Staff manage everything.
drop policy if exists "public read active dealers" on public.dealers;
create policy "public read active dealers" on public.dealers
  for select using (active or public.is_staff());

drop policy if exists "staff write dealers" on public.dealers;
create policy "staff write dealers" on public.dealers
  for all using (public.is_staff()) with check (public.is_staff());

-- ─────────────────────── dealer_applications ───────────────────────
-- "Become a dealer" submissions. Inserted server-side by the API route with
-- the service-role client (same approach as orders) — there is deliberately no
-- anon insert policy, so the form can be validated and rate-limited in one
-- place rather than trusting the browser.
create table if not exists public.dealer_applications (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text default '',
  province    text default '',
  town        text default '',
  business    text default '',
  message     text default '',
  status      text not null default 'pending'
                check (status in ('pending','approved','declined')),
  admin_notes text default '',
  -- Set when an approval creates the dealer record, so the two stay linked.
  dealer_id   uuid references public.dealers(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists dealer_applications_status_idx  on public.dealer_applications (status);
create index if not exists dealer_applications_created_idx on public.dealer_applications (created_at);

drop trigger if exists dealer_applications_touch on public.dealer_applications;
create trigger dealer_applications_touch before update on public.dealer_applications
  for each row execute function public.touch_updated_at();

alter table public.dealer_applications enable row level security;

-- Applications contain personal details of people who are not customers —
-- staff only, no public read.
drop policy if exists "staff read dealer applications" on public.dealer_applications;
create policy "staff read dealer applications" on public.dealer_applications
  for select using (public.is_staff());

drop policy if exists "staff update dealer applications" on public.dealer_applications;
create policy "staff update dealer applications" on public.dealer_applications
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "staff delete dealer applications" on public.dealer_applications;
create policy "staff delete dealer applications" on public.dealer_applications
  for delete using (public.is_staff());
