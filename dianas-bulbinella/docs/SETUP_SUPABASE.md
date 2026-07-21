# Supabase setup — 5 minutes, then I take over

Everything is coded. To bring it live I need a Supabase project. Do these steps
(or hand me the 3 keys and I'll do the rest):

## 1. Create the project
- Go to https://supabase.com/dashboard → **New project**
- Name it e.g. `dianas-bulbinella`, pick a region (Frankfurt/London is closest to SA), set a DB password.

## 2. Run the schema
- In the project: **SQL Editor → New query**
- Paste the entire contents of `supabase/migrations/0001_init.sql` → **Run**.
- Should say success (creates tables, RLS, the specials view, triggers).

## 3. Give me the keys
- **Project Settings → API**. Copy into `dianas-bulbinella/.env.local`:
  - Project URL           → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` `public` key   → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` key    → `SUPABASE_SERVICE_ROLE_KEY`  (secret — server only)
- (Optional) change `ADMIN_EMAIL` / `ADMIN_PASSWORD` for the /admin login the seed creates.

## 4. Tell me "keys are in" — then I run:
- `npm run seed`  → imports 366 products, 27 categories, the 18 July specials, and the admin user.
- restart dev server → storefront reads live from Supabase.
- I verify end-to-end, including **scheduling a future-dated special and confirming it auto-activates**.

## What's already built (compiles clean, waiting on keys)
- `supabase/migrations/0001_init.sql` — schema + RLS + `active_special_prices` view
- `src/lib/supabase/{server,client,admin,public}.ts`, `src/proxy.ts` — clients + /admin route guard
- `src/lib/catalog.ts` — now reads from Supabase (same interface; storefront unchanged)
- `scripts/seed-supabase.mjs` + `npm run seed`
- `/admin` — login, dashboard, products (list + edit), and the **Specials Scheduler**
  (`/admin/specials` → new/edit): search & multi-select products, set special price or % off,
  set the date range, schedule 1–2 months ahead; auto activate/expire is date-driven.

## Note
Until the keys are in, the storefront shows empty product grids (it degrades gracefully
instead of crashing). That's expected — it fills the moment the seed runs.
