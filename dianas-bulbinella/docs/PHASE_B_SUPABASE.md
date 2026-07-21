# Phase B — Supabase backend, admin & Specials Scheduler

Architect: Claude · Coder: DeepSeek · Verify: Claude. Goal: move the catalogue into
Supabase, give Diana a simple admin, and ship the headline **Specials Scheduler**.

## Guiding principle
`src/lib/catalog.ts` keeps its EXACT current function signatures (getAllProducts,
getProduct, getByConcern, getByRange, getSpecials, searchProducts, relatedProducts,
formatZAR, type Product). Only the *implementation* swaps from seed JSON to Supabase.
The whole storefront (already built) then works unchanged.

## Schema (Postgres / Supabase)

**categories**
- id uuid pk default gen_random_uuid()
- slug text unique not null
- name text not null
- kind text check (kind in ('concern','range','legacy')) not null
- blurb text · sort int default 0 · created_at timestamptz default now()

**products**
- id uuid pk default gen_random_uuid()
- legacy_id int (WP post id, for traceability)
- slug text unique not null · title text not null · excerpt text
- price numeric(10,2) not null · stock text default 'instock'
- image text · format text · size text
- concerns text[] default '{}' · ranges text[] default '{}' · categories text[] default '{}'
  (arrays mirror the seed JSON 1:1 so catalog.ts stays identical; admin edits them)
- active bool default true · created_at/updated_at timestamptz

**specials** (a promo campaign, e.g. "July Promotions")
- id uuid pk · name text not null
- starts_on date not null · ends_on date not null
- note text · created_by uuid (auth.users) · created_at timestamptz default now()
- CHECK (ends_on >= starts_on)

**special_items** (products in a promo, each with its own sale price)
- id uuid pk · special_id uuid fk -> specials(id) on delete cascade
- product_id uuid fk -> products(id) on delete cascade
- special_price numeric(10,2) not null
- unique (special_id, product_id)

**profiles** (admin/staff over Supabase Auth)
- id uuid pk references auth.users(id) · email text · role text check (role in ('admin','staff')) default 'staff'
- created_at timestamptz

### Active-special logic (no cron needed)
A product is "on special" today iff it has a special_item in a special whose
`current_date between starts_on and ends_on`. `salePrice` = that special_price.
Scheduling 1–2 months ahead = just insert with a future starts_on; it auto-activates
and auto-expires by date at query time. (Optional later: a nightly cron to snapshot
`_price` for perf — not required now.)

A DB VIEW `active_special_prices (product_id, special_price, special_name)` selects the
lowest current special_price per product where today is in range — catalog.ts LEFT JOINs
it so every product read carries its live salePrice.

### RLS
- categories/products/specials/special_items/active_special_prices: SELECT for anon (storefront).
- INSERT/UPDATE/DELETE only for authenticated users whose profiles.role in ('admin','staff').
- profiles: user can read own row; admins read all.

## Build slices (each verified before the next)
- **B1 Schema + seed** — SQL migration for all tables + RLS + the view. Seed script imports
  the 366 products + 31 categories from `src/data/products.json`, and loads the current 18
  specials as one special "July Promotions" (2026-07-01 → 2026-07-31).
- **B2 catalog.ts → Supabase** — reimplement the data layer against Supabase (server client),
  salePrice sourced from active_special_prices. Storefront verified unchanged.
- **B3 Admin auth** — Supabase Auth email/password, `profiles` role gate, middleware protects
  `/admin`, login page. Seed Diana as admin.
- **B4 Specials Scheduler** (headline) — `/admin/specials`: list promos; create promo (name +
  date range); typeahead-search & multi-select products; set special price or % off per item;
  save. Edit/duplicate/delete. Preview upcoming. `/admin/products` basic list+edit comes with it.
- **B5 Storefront overlay** — /specials, home SpecialsShowcase and all cards/PDP already read
  `salePrice`; confirm they reflect DB specials incl. a future-dated promo going live.

## Env needed (from user's Supabase project)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
(service role used only in server/admin + seed script, never shipped to client).

## Cost: Supabase free tier is sufficient for build + demo (R0). Pro (~R475/mo) only at launch.
