# Implementation Plan — Aloe Signs: Artwork dept, HP Latex prices, Settings page, Shop back-end

> **Architect:** Claude (Opus). **Implementer:** DeepSeek (`ds` session).
> This document is the single source of truth for the four features below. Follow it file-by-file.
> Locked decisions (confirmed with client): Artwork charge **auto-adds to the invoice total**; shop products live in a **database table**; the Settings page controls **artwork hourly rate + HP Latex prices + shop product prices** (no per-item jobcard prices).

Stack recap: Next.js App Router, `@vercel/postgres` (`sql`), Supabase auth. `/portal/admin/*` is protected by `middleware.ts`. New tables follow the existing **authoritative setup-route** pattern (see `app/api/setup-jobcards/route.ts`): one GET route that `CREATE TABLE IF NOT EXISTS` + `ADD COLUMN IF NOT EXISTS`, idempotent, re-runnable. Admin API routes authenticate with `createServerSupabase()` and `supabase.auth.getUser()` (copy the guard from `app/api/portal/admin/jobcards/[id]/route.ts`).

---

## PART A — Artwork department (jobcard)

**File:** `app/portal/admin/jobcards/[id]/page.tsx` — the Artwork block at ~lines 1008–1019 (rendered when `jobcard.prod_artwork`).
**No DB migration.** Everything is stored in the existing `artwork_details_json` JSONB column plus a synced `items_json` line.

### A1. Three milestone buttons with dates: Proof Sent, Approved, Received
Store under `artwork_details_json.milestones`:
```js
milestones: {
  proof_sent: { done: false, date: null },
  approved:   { done: false, date: null },
  received:   { done: false, date: null },
}
```
- Render three toggle rows (reuse the visual pattern of the existing `DeptCompleted` component, lines 156–208 — a checkbox that, when ticked, records `new Date().toISOString()` and reveals an editable `<input type="date">`).
- Toggling on sets `done:true` + `date = today` (editable). Toggling off sets `done:false` (keep or clear date — keep is fine).
- Write via a small helper mirroring `handleArtworkChange` but nested under `milestones`, e.g. `setArtworkMilestone(key, patch)`.

### A2. Hourly rate — default R250, editable
- The Rate input (line 1016) must default to the settings value when empty:
  `value = jobcard.artwork_details_json?.rate ?? settings?.artwork_hourly_rate ?? 250`
- Keep it editable (free numeric). Do **not** overwrite a rate the user already typed.
- `settings` comes from a new fetch (see A4).

### A3. Charge area — hours × rate, auto-added to invoice
- Compute: `charge = (parseFloat(hours) || 0) * (parseFloat(rate) || settings.artwork_hourly_rate || 250)`.
- Display the charge inside the Artwork block (e.g. "Charge: R {charge.toFixed(2)}").
- **Auto-add to invoice** (`items_json`): maintain ONE synced line item identified by a stable marker:
  ```js
  { _auto: 'artwork', item: 'ARTWORK / LAYOUT', quantity: hours, size: '', description: 'Design time', price: rate, total: charge.toFixed(2) }
  ```
  On any change to hours/rate (and when milestones don't matter here):
  1. Take `items_json`, find the row where `_auto === 'artwork'`.
  2. If hours > 0 and `prod_artwork` is on → upsert (update in place, or append if missing).
  3. If hours is empty/0 or `prod_artwork` toggled off → remove that row.
  4. Recompute totals exactly like the existing `recalculateTotals()` (lines 645–655): `subtotal = Σ total`, `vat = subtotal*0.15`, `total = subtotal+vat`; write `sub_total`, `vat_total`, `total`.
- The synced row will also appear in the invoice items grid (lines ~813+). That's acceptable — it stays in sync from the Artwork inputs. (Optional polish: render `_auto` rows read-only in the grid.)
- Also re-sync when `prod_artwork` is toggled off in `handleChange` (remove the auto row + recalc).

### A4. Load settings into the page
- Add `const [settings, setSettings] = useState<any>(null);`
- In a `useEffect`, `fetch('/api/settings').then(r=>r.json()).then(d=>setSettings(d.pricing))`.
- Used by A2 (rate default) and PART B (HP Latex list).

---

## PART B — HP Latex materials (jobcard)

**File:** same page. `MATERIALS` const at line 9 is used **only** in the HP Latex block (`prod_digital`, lines 1096–1143). Flatbed uses `FLATBED_MATERIALS` (unaffected).

- Replace the hardcoded `MATERIALS` source in the HP Latex block with `settings?.hp_latex_materials` (array of `{ name, price }`), falling back to the default list below if settings hasn't loaded.
- Render each row: material `name` on the left, its price (e.g. `R {price}`) on the right of the label, plus the existing checkbox. Selection still toggles the **name** into `materials_json` (unchanged behavior — preserves existing saved jobcards).
- Keep an `Other` entry (price 0) + the existing "specify other material" text field.

**Default HP Latex list** (name → price, ZAR; SA decimal comma → dot):
| name | price |
|---|---|
| Oracal 1370 | 127.67 |
| Oracal 1620 | 145.60 |
| Drytack 1370 | 184.95 |
| Drytack 1520 | 20.20 |
| Contravision 1370 | 137.00 |
| Contravision 1520 | 329.84 |
| Air Release 1370 | 675.95 |
| Air Release 1520 | 750.00 |
| PVC 1600 | 112.00 |
| Drytac Retac | 184.95 |
| Poly Lightbox 1370 | 184.95 |
| Other | 0 |

Prices are editable via the Settings page (Part C).

### B-charge. HP Latex charge = price × running meters (auto-add to invoice)
Mirror the Artwork charge (A3). The HP Latex block already has a **Running Meters** input (`digital_details_json.running_meters`, ~line 1123) and material checkboxes (names in `materials_json`).
- Compute: for each **selected HP Latex material**, look up its price in `settings.hp_latex_materials`. `unitRate = Σ(price of selected HP Latex materials)`. `charge = (parseFloat(running_meters)||0) * unitRate`.
  - Only sum materials that exist in the HP Latex price list (ignore flatbed materials, which share `materials_json`).
  - If multiple HP Latex materials are selected, their per-meter prices sum (documented assumption — the invoice line stays editable afterward).
- Display inside the HP Latex block: e.g. "Rate: R {unitRate}/m · Charge: R {charge.toFixed(2)}".
- **Auto-add to invoice**: maintain ONE synced line item identified by `_auto:'hp_latex'`:
  ```js
  { _auto:'hp_latex', item:'HP LATEX PRINT', quantity: running_meters, size:'', description:'{selected material names}', price: unitRate, total: charge.toFixed(2) }
  ```
  Upsert/remove + recalc totals exactly like A3 (find row by `_auto==='hp_latex'`). Remove when `prod_digital` is off, running_meters is empty/0, or no HP Latex material is selected.
- Reuse a shared sync helper for both A3 and B-charge (e.g. `syncAutoLineItem(marker, row|null)` that upserts-or-removes by `_auto` marker then recalculates `sub_total`/`vat_total`/`total`). Both Artwork and HP Latex call it.

---

## PART C — Settings page + settings table

### C1. Table + authoritative setup route
**New file:** `app/api/setup-settings/route.ts` (mirror `setup-jobcards`).
```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```
After creating, **seed** the `pricing` row if it does not exist (INSERT ... ON CONFLICT DO NOTHING):
```json
{
  "artwork_hourly_rate": 250,
  "hp_latex_materials": [ {"name":"Oracal 1370","price":127.67}, ...all 12 rows from Part B... ]
}
```

### C2. API
**New file:** `app/api/settings/route.ts`
- `GET` → `SELECT value FROM settings WHERE key='pricing'`; return `{ pricing: value }`. (Requires an authenticated user — same guard as other admin routes. The jobcard page and settings page both call it with the session cookie.)
- `PUT` → admin-guarded; body = full pricing object; `INSERT ... ON CONFLICT (key) DO UPDATE SET value=..., updated_at=now()`.

### C3. Settings page UI
**New file:** `app/portal/admin/settings/page.tsx` (client component, dark admin styling like `app/portal/admin/page.tsx`).
- Fetch `/api/settings` on mount.
- **Artwork:** number input for `artwork_hourly_rate`.
- **HP Latex materials:** editable table of rows `{name, price}` with add-row / delete-row buttons.
- **Save** → `PUT /api/settings` with the assembled pricing object. Toast/alert on success.

### C4. Admin hub link
**Edit:** `app/portal/admin/page.tsx` — add a third card "Settings" (icon e.g. `Settings` from lucide-react) → `/portal/admin/settings`. Keep the same card markup/classes.

---

## PART D — Shop back-end (products in DB, full CRUD)

### D1. Table + authoritative setup route (with seed)
**New file:** `app/api/setup-products/route.ts` (mirror `setup-jobcards`).
```sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT, category TEXT, description TEXT, size TEXT,
  price NUMERIC, original_price NUMERIC, discount INTEGER,
  image TEXT, features JSONB DEFAULT '[]'::jsonb, in_stock BOOLEAN DEFAULT true,
  pricing_tiers JSONB, variants JSONB, artwork_fee NUMERIC,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);
```
- **Seed if empty:** loop `productsList` from `lib/data.ts` and INSERT the 4 current products (billboards, estate-board-small/medium/large) mapping camelCase → snake_case (originalPrice→original_price, pricingTiers→pricing_tiers, inStock→in_stock, artworkFee→artwork_fee). Guard with `IF (SELECT COUNT(*) FROM products)=0`.

### D2. Product API
- **New file:** `app/api/products/route.ts`
  - `GET` (public) → all products ordered by `sort_order, name`. Map snake_case → the `Product` shape the front-end expects (camelCase).
  - `POST` (admin) → create.
- **New file:** `app/api/products/[id]/route.ts`
  - `GET` (public) → one product (camelCase).
  - `PUT` (admin) → update.
  - `DELETE` (admin) → delete.
- Centralize the row→Product mapper in a small helper (e.g. `lib/product-mapper.ts` or inline) so shop + admin agree.

### D3. Admin CRUD UI
- **New file:** `app/portal/admin/products/page.tsx` — list all products (card/table), "Add product" button, per-row Edit/Delete.
- **New file:** `app/portal/admin/products/[id]/page.tsx` — full editor: name, category (from `categories`), description, size, price, originalPrice, discount, image path, features (list editor), inStock toggle, pricingTiers editor (qty/single/double), variants editor (name/price), artworkFee. Save → POST (new) / PUT (existing).
- **Edit:** `app/portal/admin/page.tsx` — add a fourth card "Shop Products" → `/portal/admin/products`.

### D4. Wire the live shop to the DB
`lib/data.ts` **keeps** the `Product`/`PricingTier`/`ProductVariant` types and the pure helpers `getLowestUnitPrice`, `categories`. Only the *data source* moves to the API. Update these consumers:
- `app/shop/page.tsx` (client) — replace `import { products }` usage with `fetch('/api/products')` into state; keep `categories`, `getLowestUnitPrice`, `Product` type imports. Add a loading state.
- `app/shop/[id]/page.tsx` (client) — replace `getProductById`/`products` with `fetch('/api/products/'+id)` (+ fetch all for the "related" strip). Keep type + helper imports.
- `app/order/confirmation/page.tsx`, `app/order/track/page.tsx` — if they resolve product data, switch to `/api/products`.
- `app/api/orders/create/route.ts`, `app/api/orders/[id]/route.ts` — if they call `getProductById`, query the `products` table directly instead (server side).
> Grep first: `grep -rn "getProductById\|from '@/lib/data'\|from '@/lib/products'\|productsList\|\\bproducts\\b" app/` and update every hit that reads product *data* (not types/helpers).

---

## One-time activation (after deploy)
Hit each authoritative route once (they're idempotent):
- `/api/setup-settings`  → creates + seeds pricing
- `/api/setup-products`  → creates + seeds products from lib/data.ts

## Verification checklist
- [ ] Jobcard → Artwork on: three milestone toggles record + show editable dates.
- [ ] Rate empty shows 250 default (or settings value); typing a rate persists; hours×rate charge displays.
- [ ] Changing hours/rate updates the `ARTWORK / LAYOUT` line in items grid and the sub_total/VAT/total; turning Artwork off removes it and recalcs.
- [ ] HP Latex shows the 12 new materials with prices; selecting toggles into materials_json; existing jobcards still load.
- [ ] HP Latex: selecting material(s) + running meters shows Rate/m + Charge, adds an `HP LATEX PRINT` line to the invoice, and updates totals; clearing removes it.
- [ ] Settings page edits artwork rate + HP Latex prices; Save persists; jobcard reflects new values on reload.
- [ ] Shop products page: add / edit / delete works; live `/shop` and `/shop/[id]` reflect DB; add-to-cart + order flow still works.
- [ ] `npm run build` clean.

## Notes / gotchas
- Numeric columns from `@vercel/postgres` come back as strings — `parseFloat` before math and format for display.
- Keep the admin-auth guard identical to existing admin routes; never expose PUT/POST/DELETE without it. Public GETs (`/api/products*`) need no auth.
- `materials_json` is shared across departments — only change the *labels shown* under HP Latex, not the storage mechanism, so saved jobcards keep working.
