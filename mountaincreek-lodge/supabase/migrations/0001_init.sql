-- Mountain Creek Lodge — initial Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT guards where practical.

create extension if not exists "pgcrypto";

-- ─── Tables ──────────────────────────────────────────────────────────

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_description text,
  full_description text,
  category text,
  price numeric,
  duration text,
  max_guests integer,
  includes text[] default '{}',
  image text,
  tag text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists accommodation_units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sleeps integer not null default 1,
  tagline text,
  description text,
  features text[] default '{}',
  size text default 'medium',
  span text default 'col-span-1',
  images text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  category_id uuid references gallery_categories(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists red_litchi_images (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  created_at timestamptz default now()
);

create table if not exists red_litchi_settings (
  id integer primary key default 1,
  menu_url text,
  updated_at timestamptz default now(),
  constraint red_litchi_settings_singleton check (id = 1)
);

-- ─── Row Level Security ─────────────────────────────────────────────
-- Public (anon) can READ everything — it's all public marketing content.
-- No write policies are defined: all writes go through server-side API
-- routes using the service_role key, which bypasses RLS entirely. This
-- means the anon key (shipped to the browser) can never create, edit,
-- or delete anything, even if someone calls the Supabase API directly.

alter table packages enable row level security;
alter table accommodation_units enable row level security;
alter table gallery_categories enable row level security;
alter table gallery_images enable row level security;
alter table red_litchi_images enable row level security;
alter table red_litchi_settings enable row level security;

drop policy if exists "Public read packages" on packages;
create policy "Public read packages" on packages for select using (true);

drop policy if exists "Public read accommodation_units" on accommodation_units;
create policy "Public read accommodation_units" on accommodation_units for select using (true);

drop policy if exists "Public read gallery_categories" on gallery_categories;
create policy "Public read gallery_categories" on gallery_categories for select using (true);

drop policy if exists "Public read gallery_images" on gallery_images;
create policy "Public read gallery_images" on gallery_images for select using (true);

drop policy if exists "Public read red_litchi_images" on red_litchi_images;
create policy "Public read red_litchi_images" on red_litchi_images for select using (true);

drop policy if exists "Public read red_litchi_settings" on red_litchi_settings;
create policy "Public read red_litchi_settings" on red_litchi_settings for select using (true);

-- ─── Storage ─────────────────────────────────────────────────────────
-- One public bucket for all admin-uploaded media (accommodation/gallery/
-- red-litchi photos + the Red Litchi menu PDF), organised by folder.

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read site-media" on storage.objects;
create policy "Public read site-media" on storage.objects
  for select using (bucket_id = 'site-media');

-- No storage write policy is defined either — uploads go through the
-- /api/admin/upload route using the service_role key, same as the table
-- writes above.

-- ─── Seed data ───────────────────────────────────────────────────────
-- Mirrors what was previously hardcoded/localStorage-seeded on the site.
-- Each block only runs if that table is currently empty, so this file is
-- safe to paste and run more than once.

insert into packages (slug, title, short_description, full_description, category, price, duration, max_guests, includes, image, tag, active)
values
('self-catering', 'Self-Catering Accommodation', 'For travellers who love flexibility and independence.', 'Arrive, settle in, and explore the Lowveld at your own pace. The Freedom Stay gives you the comfort of your own space with all the freedom to plan your days exactly as you choose. Perfect for families, long stays, and independent travellers.', 'Self-Catering', NULL, NULL, NULL, '{"Accommodation","Self-catering facilities","Access to all lodge amenities","Complimentary local guide and recommendations"}', '/images/accommodation/IMG_8200.jpg', NULL, true),
  ('bed-and-breakfast', 'Bed & Breakfast', 'Slow mornings start here.', 'Wake up to fresh country air and enjoy a delicious breakfast at Red Litchi Farm Café before heading out to explore the Lowveld. Perfect for couples, weekend getaways, and road trippers.', 'Bed & Breakfast', NULL, NULL, NULL, '{"Accommodation","Breakfast at Red Litchi Farm Café (on premises)","Freshly brewed coffee or tea"}', '/images/packages/cafe.png', NULL, true),
  ('breakfast-and-adventure-pack', 'Breakfast & Adventure Pack', 'Designed for guests who leave before sunrise and spend their days discovering the best of the Lowveld.', 'Whether you''re heading to Kruger National Park, exploring the Panorama Route, or joining a guided safari, we''ll prepare a freshly packed breakfast and snack pack to take along. Perfect for safari lovers, photographers, and adventurers.', 'Adventure', NULL, NULL, NULL, '{"Accommodation","Freshly packed breakfast pack","Snacks and refreshments","Early departure preparation","Convenient grab-and-go collection before departure"}', '/images/packages/adventure.png', 'MOST POPULAR', true),
  ('romantic-escape', 'Romantic Escape', 'Thoughtfully curated for anniversaries, special occasions, or simply spending quality time together.', 'Arrive to a beautifully prepared room complete with a picnic basket filled with treats, wine, and locally inspired delights. Perfect for couples, anniversaries, and surprise getaways.', 'Romantic', NULL, NULL, 2, '{"Accommodation for two","Picnic basket filled with locally sourced sweet treats and snacks","Bottle of wine"}', '/images/packages/romantic.png', NULL, true)
on conflict (slug) do nothing;

insert into accommodation_units (name, sleeps, tagline, description, features, size, span, images, active)
select v.* from (values
('Main House', 10, 'The Crown Jewel', 'Spacious bedrooms, expansive deck overlooking indigenous gardens, full kitchen, private braai area', '{"Expansive Deck","Full Kitchen","Private Braai","Garden Views"}'::text[], 'premium', 'col-span-2', '{"/images/accommodation/IMG_8185.jpg","/images/accommodation/IMG_8186.jpg","/images/accommodation/IMG_8187.jpg","/images/accommodation/IMG_8188.jpg","/images/accommodation/IMG_8191.jpg","/images/accommodation/IMG_8193.jpg","/images/accommodation/IMG_8195.jpg","/images/accommodation/IMG_8197.jpg"}'::text[], true),
  ('Main House 2', 6, 'Creek-Side Comfort', 'Modern open-plan kitchen, large lounge, outdoor patio facing the creek', '{"Open-Plan Kitchen","Large Lounge","Creek Patio","Modern Finish"}'::text[], 'large', 'col-span-1', '{"/images/accommodation/IMG_8198.jpg","/images/accommodation/IMG_8200.jpg","/images/accommodation/IMG_8203.jpg","/images/accommodation/IMG_8205.jpg","/images/accommodation/IMG_8206.jpg","/images/accommodation/IMG_8208.jpg","/images/accommodation/IMG_8210.jpg"}'::text[], true),
  ('Chalet 1', 3, 'Thatched Charm', 'Cozy thatched roof, kitchen corner, private garden views', '{"Thatched Roof","Kitchen Corner","Garden Views","Cozy Interiors"}'::text[], 'medium', 'col-span-1', '{"/images/accommodation/IMG_8212.jpg","/images/accommodation/IMG_8214.jpg","/images/accommodation/IMG_8217.jpg","/images/accommodation/IMG_8219.jpg","/images/accommodation/IMG_8222.jpg","/images/accommodation/IMG_8225.jpg","/images/accommodation/IMG_8231.jpg"}'::text[], true),
  ('Chalet 2', 2, 'Romantic Retreat', 'Romantic studio layout, bathroom en-suite, direct pathway to pool', '{"Studio Layout","En-Suite Bath","Pool Access","Romantic Setting"}'::text[], 'intimate', 'col-span-1', '{"/images/accommodation/IMG_8232.jpg","/images/accommodation/IMG_8234.jpg","/images/accommodation/IMG_8236.jpg","/images/accommodation/IMG_8239.jpg","/images/accommodation/IMG_8241.jpg","/images/accommodation/IMG_8243.jpg","/images/accommodation/IMG_8244.jpg"}'::text[], true),
  ('Chalet 3', 2, 'Rustic Elegance', 'Rustic cottage charm, river stone finishes, private braai corner', '{"River Stone Finishes","Private Braai","Cottage Charm","Natural Textures"}'::text[], 'intimate', 'col-span-1', '{"/images/accommodation/IMG_8246.jpg","/images/accommodation/IMG_8249.jpg","/images/accommodation/IMG_8252.jpg","/images/accommodation/IMG_8253.jpg","/images/accommodation/IMG_8255.jpg","/images/accommodation/IMG_8257.jpg","/images/accommodation/IMG_8261.jpg"}'::text[], true),
  ('Chalet 4', 4, 'Family Loft', 'Loft bedroom, ideal for small families, fully equipped self-catering setup', '{"Loft Bedroom","Family Ideal","Self-Catering","Fully Equipped"}'::text[], 'medium', 'col-span-1', '{"/images/accommodation/IMG_8263.jpg","/images/accommodation/IMG_8267.jpg","/images/accommodation/IMG_8270.jpg","/images/accommodation/IMG_8272.jpg","/images/accommodation/IMG_8275.jpg","/images/accommodation/IMG_8278.jpg","/images/accommodation/IMG_8279.jpg"}'::text[], true),
  ('Cottage', 4, 'Secluded Haven', 'Secluded valley setting, fire pit, perfect for absolute privacy', '{"Secluded Valley","Fire Pit","Total Privacy","Nature Immersed"}'::text[], 'medium', 'col-span-2', '{"/images/accommodation/IMG_8281.jpg","/images/accommodation/IMG_8283.jpg","/images/accommodation/IMG_8287.jpg","/images/accommodation/IMG_8288.jpg","/images/accommodation/IMG_8290.jpg","/images/accommodation/IMG_8292.jpg","/images/accommodation/IMG_8293.jpg","/images/accommodation/IMG_8294.jpg"}'::text[], true)
) as v
where not exists (select 1 from accommodation_units);

insert into gallery_categories (name)
select 'Accommodation'
where not exists (select 1 from gallery_categories);

insert into gallery_images (src, category_id)
select v.* from (values
('/images/accommodation/IMG_8185.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8186.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8187.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8188.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8191.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8193.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8195.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8197.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8198.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8200.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8203.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8205.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8206.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8208.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8210.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8212.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8214.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8217.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8219.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8222.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8225.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8231.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8232.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8234.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8236.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8239.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8241.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8243.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8244.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8246.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8249.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8252.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8253.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8255.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8257.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8261.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8263.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8267.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8270.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8272.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8275.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8278.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8279.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8281.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8283.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8287.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8288.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8290.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8292.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8293.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation')),
  ('/images/accommodation/IMG_8294.jpg', (SELECT id FROM gallery_categories WHERE name = 'Accommodation'))
) as v
where not exists (select 1 from gallery_images);

insert into red_litchi_images (src)
select v.* from (values
('/images/Red Litchi/Gallery/IMG-20241029-WA0008.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0009.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0010.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0011.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0012.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0013.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0014.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0018.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0019.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0020.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0022.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0023.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0024.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0026.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0027.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0028.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0029.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0031.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0032.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0033.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0035.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0036.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0037.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0038.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0039.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0042.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0045.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0046.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0048.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0049.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0050.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0051.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0052.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0053.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0054.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0055.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0056.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0057.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0058.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0059.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0060.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0061.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0062.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0063.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0064.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0065.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0066.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0067.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0068.jpg'),
  ('/images/Red Litchi/Gallery/IMG-20241029-WA0098.jpg'),
  ('/images/Red Litchi/Gallery/WhatsApp-Image-2024-10-29-at-07.52.10_4e6e14b6.jpg')
) as v
where not exists (select 1 from red_litchi_images);

insert into red_litchi_settings (id, menu_url)
values (1, '/Red%20Litchi%20Official%20Menu.pdf')
on conflict (id) do nothing;
