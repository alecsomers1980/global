# Rehoboth Commerce Core — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a claim-free retail storefront for Rehoboth Herbal Co. — 21 SKUs, PayFast checkout, and an admin the client can run without a developer.

**Architecture:** Next.js 16 App Router with Supabase for data/auth/storage and PayFast for payment. Product pricing carries both a retail and a trade column from day one so the distributor tier is a later feature flag, not a migration. A compliance module gates all product copy so no disease claim can reach production.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, Supabase (Postgres/Auth/Storage), PayFast, Resend, Framer Motion, Vercel.

**Spec:** `rehoboth/docs/superpowers/specs/2026-08-30-rehoboth-design.md`
**Design canvas:** https://claude.ai/code/artifact/f0f3bf53-f89c-46e3-bc7c-9106c09384fa

**Not in this plan:** the editorial journal. It is independent of commerce and gets
its own plan (`2026-08-30-rehoboth-journal.md`) once this ships.

---

## Global Constraints

- **Project root:** `rehoboth/` inside the Antigravity workspace. Branch `feat/rehoboth`.
- **Dev port 3010.** 3005 (dianas) and 3012 are taken.
- **Node 24.14.1.** Next 16.2.10, React 19.2.4, Tailwind 4 — match `dianas-bulbinella/package.json`.
- **Brand constant:** `#6C8781`. Mint `#F3FFF8`. Page ground `#FAFCFB`. Dark band `#10201C`.
- **Per-product accents** (from label vector art, do not invent others):
  Rosemary `#649D82` · Artemisia Annua A3 `#517C00` · Moringa `#2B4E17` ·
  Turmeric `#E3923A` · Artemisia Afra `#727A75`. Products without a printed
  accent (Neem, Lip Balm, Boerseep, Tinctures) fall back to `#6C8781`.
- **Type:** Marcellus (display), Karla (body), via `next/font/google`.
- **Never construct a Supabase client during render or prerender** — handlers and
  effects only. Constructors throw synchronously when env is unset.
- **No medical claims anywhere.** No disease name in any title, slug, body, alt
  text or meta description. Task 3 enforces this in CI.
- **Every emailing/DB-writing form** needs a honeypot field plus a submission-timing
  check. No CAPTCHA.
- **Any login** ships forgot-password, show-password and keep-me-signed-in in the
  first pass.
- **Prices are decimal(10,2) in ZAR.** Never float.
- **Facts are label-sourced.** Farm: Rehoboth Farm, Portion 21 of Farm 277JU
  Lovedale, Honeybird, Low's Creek, Mpumalanga. Contact: Frieda Grobler,
  082 824 9023, friedsgrobler@gmail.com. Partner: Foundations for Farming.
  Anything not in this list or the labels is a `[BRACKETED PLACEHOLDER]`.

---

## File Structure

```
rehoboth/
  src/
    app/
      layout.tsx                 root layout, fonts, header/footer
      page.tsx                   homepage
      shop/page.tsx              all products
      product/[slug]/page.tsx    product detail
      cart/page.tsx
      checkout/page.tsx
      checkout/success/page.tsx
      stockists/page.tsx         become-a-stockist application
      account/…                  login, signup, forgot-password, orders
      admin/…                    products, orders, stockist queue, settings
      api/payfast/notify/route.ts
      api/payfast/return/route.ts
      api/health/route.ts
    components/
      layout/Header.tsx, Footer.tsx, DisclaimerBlock.tsx
      home/Hero.tsx, VideoBand.tsx, RangeGrid.tsx, ProofBeats.tsx, StockistBand.tsx
      product/VariantSelector.tsx, ProductCard.tsx, AccentBadge.tsx
      cart/CartDrawer.tsx
      forms/BotGuard.tsx         honeypot + timing, shared by every form
    lib/
      supabase/server.ts, browser.ts
      payfast.ts                 ported from dianas
      compliance.ts              ported from dianas
      catalog.ts, orders.ts, cart.ts, email.ts
  supabase/migrations/
    0001_catalog.sql
    0002_customers.sql
    0003_orders.sql
    0004_stockist_applications.sql
    0005_keep_alive.sql
  scripts/
    seed-catalog.mjs
    compliance-scan.mjs
    optimise-media.mjs
    cut-video.mjs
  .github/workflows/keep-alive.yml
```

---

### Task 1: Scaffold, Supabase wiring, health check

**Files:**
- Create: `rehoboth/package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `.env.local.example`, `.gitignore`
- Create: `rehoboth/src/lib/supabase/server.ts`, `rehoboth/src/lib/supabase/browser.ts`
- Create: `rehoboth/src/app/api/health/route.ts`, `rehoboth/src/app/layout.tsx`, `rehoboth/src/app/page.tsx`

**Interfaces:**
- Produces: `getServerClient()` → `SupabaseClient` (service role, server-only);
  `getBrowserClient()` → `SupabaseClient` (anon, memoised singleton).

- [ ] **Step 1: Scaffold the app**

```bash
cd rehoboth
npx create-next-app@16.2.10 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-eslint --yes
```

Then set `"dev": "next dev -p 3010"` in `package.json` and move generated files under `src/`.

- [ ] **Step 2: Write `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3010
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=
PAYFAST_MODE=sandbox
RESEND_API_KEY=
ORDER_NOTIFY_EMAIL=friedsgrobler@gmail.com
```

The PayFast values above are PayFast's public sandbox credentials, correct as-is for testing.

- [ ] **Step 3: Supabase clients**

`src/lib/supabase/server.ts`:

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server-only client. Never call this at module scope or during render. */
export function getServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}
```

`src/lib/supabase/browser.ts`:

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  client = createClient(url, key);
  return client;
}
```

- [ ] **Step 4: Health route**

```ts
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    ok: true,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    time: new Date().toISOString(),
  });
}
```

- [ ] **Step 5: Verify and commit**

Run: `cd rehoboth && npm run dev` then `curl -s localhost:3010/api/health`
Expected: `{"ok":true,"commit":"local",...}`

```bash
git add rehoboth/ && git commit -m "feat(rehoboth): scaffold Next 16 app with Supabase wiring"
```

---

### Task 2: Catalogue schema and seed

**Files:**
- Create: `rehoboth/supabase/migrations/0001_catalog.sql`, `0005_keep_alive.sql`
- Create: `rehoboth/scripts/seed-catalog.mjs`
- Create: `rehoboth/.github/workflows/keep-alive.yml`

**Interfaces:**
- Produces: tables `products`, `product_variants`; seed script `npm run seed`.

- [ ] **Step 1: Write `0001_catalog.sql`**

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  botanical_name text,
  accent_hex text not null default '#6C8781',
  summary text,
  traditional_use text,
  ingredients text,
  directions text,
  hero_image text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type variant_format as enum
  ('powder','capsules','bulk','ointment','oil','bar','tincture','balm');

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  format variant_format not null,
  size_label text not null,
  barcode text,
  price_retail numeric(10,2) not null,
  price_trade numeric(10,2),
  min_qty_trade int not null default 10,
  stock int not null default 0,
  active boolean not null default true,
  unique (product_id, format, size_label)
);

create index on product_variants (product_id);
alter table products enable row level security;
alter table product_variants enable row level security;
create policy "public read products" on products for select using (active);
create policy "public read variants" on product_variants for select using (active);
```

`price_trade` and `min_qty_trade` exist now precisely so the distributor tier needs no migration later.

- [ ] **Step 2: Write `0005_keep_alive.sql`**

```sql
create table keep_alive (
  id bigserial primary key,
  pinged_at timestamptz not null default now()
);
```

- [ ] **Step 3: Write the seed script**

`scripts/seed-catalog.mjs` inserts exactly these 21 variants across 9 products.
Retail prices are the pricelist's "+30%" column; trade prices are the "Distr." column.

| Product | slug | accent | Variants (format, size, retail, trade) |
|---|---|---|---|
| Artemisia Annua A3 | artemisia-annua-a3 | #517C00 | powder 150g 217/167 · capsules 90 279/215 · bulk 1kg 984/757 · ointment 50ml 260/200 · oil — 260/200 |
| Artemisia Afra | artemisia-afra | #727A75 | powder 150g 177/136 · capsules 90 242/186 · bulk 1kg 902/694 |
| Moringa Oleifera | moringa-oleifera | #2B4E17 | powder 150g 136/105 · capsules 90 130/100 · bulk 1kg 615/473 · ointment 50ml 260/200 · oil — 260/200 |
| Turmeric with Pepper | turmeric-with-pepper | #E3923A | powder 150g 182/140 · capsules 90 195/150 |
| Rosemary | rosemary | #649D82 | powder 150g 208/160 · capsules 90 221/170 |
| Neem | neem | #6C8781 | ointment 50g 260/200 |
| Lip Balm | lip-balm | #6C8781 | balm 10g 52/40 |
| Boerseep | boerseep | #6C8781 | bar 150–170g 60/46 |
| Tinctures | tinctures | #6C8781 | tincture 30ml 150/135 |

Barcodes come from `C:\tmp\rehoboth-assets\Barcodes\*.svg` — the filename stem maps to product+format (e.g. `Rosemary_Capsules_90.svg`). Tinctures have no barcode; leave null.

- [ ] **Step 4: Run and verify**

Run: `npm run seed`
Then: `select count(*) from product_variants;`
Expected: `21`

- [ ] **Step 5: Keep-alive workflow and commit**

`.github/workflows/keep-alive.yml` — cron `0 6 * * 1,4`, inserts one row into `keep_alive`.

```bash
git add rehoboth/supabase rehoboth/scripts rehoboth/.github
git commit -m "feat(rehoboth): catalogue schema, 21-SKU seed, keep-alive"
```

---

### Task 3: Compliance guard (do this before any copy is written)

**Files:**
- Create: `rehoboth/src/lib/compliance.ts` (port from `dianas-bulbinella/src/lib/compliance.ts`)
- Create: `rehoboth/scripts/compliance-scan.mjs`
- Test: `rehoboth/src/lib/compliance.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `COMPLIANCE_TERMS: string[]`, `screen(...texts): ComplianceResult`
  where `ComplianceResult = { clean: boolean; hits: { term: string; context: string }[] }`.

- [ ] **Step 1: Write the failing test**

```ts
import { screen } from "./compliance";

test("flags the exact wording from the Rehoboth labels", () => {
  const r = screen("Assists in supporting the treatment of malaria, hepatitis, and certain cancers");
  expect(r.clean).toBe(false);
  expect(r.hits.map(h => h.term)).toEqual(
    expect.arrayContaining(["malaria", "treatment", "cancer", "hepatitis"])
  );
});

test("passes traditional-use framing", () => {
  const r = screen("Traditionally used in South Africa as a bitter tonic herb.");
  expect(r.clean).toBe(true);
});

test("flags immune booster", () => {
  expect(screen("Immune Booster Capsules").clean).toBe(false);
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test -- compliance`
Expected: FAIL — module not found.

- [ ] **Step 3: Port the module**

Copy `dianas-bulbinella/src/lib/compliance.ts` verbatim, then add these terms
found on the Rehoboth labels specifically: `malaria`, `hepatitis`, `immune booster`,
`immune support`, `medicinal`, `antifungal`, `fungal`, `viral`, `bacterial`.

- [ ] **Step 4: Run tests**

Run: `npm test -- compliance`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the repo scan script**

`scripts/compliance-scan.mjs` selects every `name`, `summary`, `traditional_use`,
`ingredients`, `directions` from `products`, plus every page's metadata, runs
`screen()` over each, prints a table of hits, and `process.exit(1)` if any.

Add to package.json: `"compliance:scan": "node --env-file=.env.local scripts/compliance-scan.mjs"`

- [ ] **Step 6: Verify and commit**

Run: `npm run compliance:scan`
Expected: `0 hits across 9 products — clean` and exit 0.

```bash
git add rehoboth/src/lib/compliance.ts rehoboth/src/lib/compliance.test.ts rehoboth/scripts/compliance-scan.mjs
git commit -m "feat(rehoboth): compliance guard with label-specific terms"
```

---

### Task 4: Design system, layout shell, disclaimer

**Files:**
- Create: `rehoboth/src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/components/layout/Header.tsx`, `Footer.tsx`, `DisclaimerBlock.tsx`

**Interfaces:**
- Produces: `<Header/>`, `<Footer/>`, `<DisclaimerBlock/>`; CSS vars
  `--brand`, `--brand-ink`, `--ground`, `--dark-band`.

- [ ] **Step 1: Tokens in `globals.css`**

```css
:root {
  --brand: #6C8781;
  --brand-ink: #F3FFF8;
  --ground: #FAFCFB;
  --surface: #EAF2EE;
  --hairline: #DFE9E4;
  --ink: #1B2521;
  --ink-soft: #56635E;
  --dark-band: #10201C;
}
```

- [ ] **Step 2: Fonts in `layout.tsx`** — `Marcellus` (400) and `Karla` (300–600) via `next/font/google`, exposed as `--font-display` and `--font-body`.

- [ ] **Step 3: `DisclaimerBlock.tsx`** renders this exact text, and it appears on every product page and the homepage:

> These are traditional herbal products, not medicines. They are not intended to diagnose, treat, cure or prevent any disease. Information reflects traditional use in South Africa and is not a substitute for professional medical advice. Consult a healthcare practitioner before use, especially if pregnant, nursing, or on medication.

- [ ] **Step 4: Header/Footer** — nav is Shop · The Range · Our Story · Journal · Stockists, wordmark left, cart right. Footer carries contact (Frieda Grobler, 082 824 9023), farm address, and `[REG NUMBER]` placeholder.

- [ ] **Step 5: Verify at phone width**

Run the dev server, open at 390px. Expected: no horizontal scroll, nav collapses to a menu button, tap targets ≥44px.

```bash
git commit -am "feat(rehoboth): design tokens, layout shell, disclaimer block"
```

---

### Task 5: Media pipeline — photos and video clips

**Files:**
- Create: `rehoboth/scripts/optimise-media.mjs`, `rehoboth/scripts/cut-video.mjs`

**Interfaces:**
- Produces: optimised WebP in `public/products/`, MP4/WebM clips in `public/video/`.

Source originals live at `C:\tmp\rehoboth-assets\` — outside the repo. Only
optimised derivatives are committed; originals are archived separately.

- [ ] **Step 1: Photo optimisation**

`optimise-media.mjs` reads `Photos/*.JPG`, writes WebP at 1600/800/400px widths.
Map shots to products: 001–002 turmeric plate · 003–004 rosemary plate ·
005–012 turmeric warm set · 010–012 boerseep · 013–019 artemisia ·
020–022 artemisia ointment tin.

- [ ] **Step 2: Video clips**

`cut-video.mjs` cuts from `rehoboth-video.mp4` (136.8s, 1920×1080@30).
**Stop at 130s — the end card from 130s carries the old "Foundations for Farming
Stewardship Centre" logo, which is not the current identity.**

| Clip | In–out | Use |
|---|---|---|
| `hero-field.mp4` | 23–34s | homepage dark band — artemisia field, workers in teal |
| `drying.mp4` | 50–62s | Our Story — leaf on shade-drying racks |
| `flowers.mp4` | 66–72s | Moringa product page — white blossom macro |
| `capsules.mp4` | 97–108s | Our Story — gloved capsule filling |

Encode each: H.264 MP4 + VP9 WebM, muted, ≤6s loop, ≤1.5MB, 1280px wide.

```bash
ffmpeg -y -ss 23 -t 11 -i rehoboth-video.mp4 -an -vf "scale=1280:-2" \
  -c:v libx264 -crf 26 -preset slow -movflags +faststart public/video/hero-field.mp4
```

- [ ] **Step 3: Verify**

Run: `ls -lh public/video/` — every file ≤1.5MB.
Play `hero-field.mp4`. Expected: field footage, no end-card branding, no audio track.

```bash
git add rehoboth/public rehoboth/scripts && git commit -m "feat(rehoboth): optimised media and video clips"
```

---

### Task 6: Homepage

**Files:**
- Modify: `rehoboth/src/app/page.tsx`
- Create: `src/components/home/Hero.tsx`, `VideoBand.tsx`, `RangeGrid.tsx`, `ProofBeats.tsx`, `StockistBand.tsx`

**Interfaces:**
- Consumes: `getFeaturedProducts()` from `lib/catalog.ts` (Task 7 defines it; for
  this task it returns 4 products with `{slug,name,accentHex,heroImage,priceFrom}`).

Build the "The Well" artboard from the canvas. Section order and copy are fixed
by the canvas — lift them, don't re-invent.

- [ ] **Step 1: Hero** — 7fr/5fr grid; emblem + "Genesis 26:22" eyebrow; headline "Room enough to do it slowly."; body naming the five plants and Low's Creek; primary CTA "Shop the range"; secondary "Watch the mill".
- [ ] **Step 2: VideoBand** — full-bleed `hero-field.mp4`, `muted playsInline loop autoPlay preload="metadata"`, teal-black gradient overlay, headline "Grown, dried and packed on one farm in Mpumalanga." Respect `prefers-reduced-motion`: render the poster frame instead.
- [ ] **Step 3: RangeGrid** — 4-up, 4/5 image ratio, name/format/price.
- [ ] **Step 4: ProofBeats** — three: one plant per bottle · traditionally used · farming that gives back.
- [ ] **Step 5: StockistBand** — brand-teal band, "Stock Rehoboth in your shop", "Wholesale from 10 units", CTA to `/stockists`.
- [ ] **Step 6: Scroll reveals** — Framer Motion, one consistent fade-and-rise, 500ms, 40px, `once: true`. Disabled under `prefers-reduced-motion`.

- [ ] **Step 7: Verify**

Screenshot at 1440px and 390px with incremental scrolling (a single unscrolled
capture false-reads scroll-reveal sections as blank). Expected: every section
visible, no horizontal scroll, video playing.

```bash
git commit -am "feat(rehoboth): homepage"
```

---

### Task 7: Shop and product pages

**Files:**
- Create: `src/app/shop/page.tsx`, `src/app/product/[slug]/page.tsx`
- Create: `src/lib/catalog.ts`, `src/components/product/VariantSelector.tsx`, `ProductCard.tsx`

**Interfaces:**
- Produces: `getProducts()`, `getProductBySlug(slug)`, `getFeaturedProducts()`.
  `Product = { id, slug, name, botanicalName, accentHex, summary, traditionalUse, ingredients, directions, heroImage, variants: Variant[] }`;
  `Variant = { id, format, sizeLabel, barcode, priceRetail, stock }`.

- [ ] **Step 1: `lib/catalog.ts`** — server-side reads, no client construction.
- [ ] **Step 2: `/shop`** — grid of all 9 products, filterable by format.
- [ ] **Step 3: `/product/[slug]`** — hero image, name, botanical name, accent bar in the product's own hex, variant selector driving price and stock, traditional-use copy, ingredients, directions ("Take 2–3 capsules daily" where the label says so), storage line, `<DisclaimerBlock/>`, add-to-cart.
- [ ] **Step 4: `generateStaticParams`** for all 9 slugs; `generateMetadata` per product — and the metadata text goes through `screen()` at build time.
- [ ] **Step 5: Verify**

Visit all 9 product pages; select every variant. Expected: 21 distinct price/stock states reachable, each page's accent bar matching the table in Global Constraints.

Run: `npm run compliance:scan` — expected clean.

```bash
git commit -am "feat(rehoboth): shop listing and product pages"
```

---

### Task 8: Cart

**Files:**
- Create: `src/lib/cart.ts` (zustand + localStorage), `src/components/cart/CartDrawer.tsx`, `src/app/cart/page.tsx`

**Interfaces:**
- Produces: `useCart()` exposing `items: CartLine[]`, `add(variantId, qty)`,
  `remove(variantId)`, `setQty(variantId, qty)`, `clear()`, `subtotal: number`.
  `CartLine = { variantId, productSlug, name, sizeLabel, priceRetail, qty }`.

- [ ] **Step 1: Failing test** — `add` twice for the same variant yields one line with qty 2; `subtotal` is the sum of `priceRetail × qty`.
- [ ] **Step 2: Run it, watch it fail.**
- [ ] **Step 3: Implement the store**, persisted to `localStorage` under `rehoboth-cart`, wrapped in try/catch so a private window with blocked storage still renders.
- [ ] **Step 4: Run tests — expected PASS.**
- [ ] **Step 5: Drawer and cart page**, quantity steppers ≥44px.
- [ ] **Step 6: Verify** — add, change qty, reload the page, cart survives.

```bash
git commit -am "feat(rehoboth): cart store and drawer"
```

---

### Task 9: Checkout and PayFast

**Files:**
- Create: `src/lib/payfast.ts` (port), `src/lib/orders.ts`
- Create: `src/app/checkout/page.tsx`, `src/app/checkout/success/page.tsx`
- Create: `src/app/api/payfast/notify/route.ts`, `src/app/api/payfast/return/route.ts`
- Create: `supabase/migrations/0003_orders.sql`

**Interfaces:**
- Consumes: `useCart()`, `getServerClient()`.
- Produces: `createOrder(input): Promise<{orderId: string; amount: number}>`,
  `markOrderPaid(orderId, payfastPaymentId)`.

- [ ] **Step 1: `0003_orders.sql`**

```sql
create type order_status as enum ('pending','paid','failed','cancelled','fulfilled');
create type order_channel as enum ('retail','trade');

create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  status order_status not null default 'pending',
  channel order_channel not null default 'retail',
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  ship_line1 text, ship_city text, ship_province text,
  ship_postcode text, ship_country text not null default 'ZA',
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payfast_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid references product_variants(id),
  product_name text not null,
  size_label text not null,
  unit_price numeric(10,2) not null,
  qty int not null
);
create index on order_items (order_id);
```

`channel` defaults to `retail` and exists so trade orders need no migration.

- [ ] **Step 2: Port `payfast.ts` verbatim** from `dianas-bulbinella/src/lib/payfast.ts`.
  Change only the localhost fallback port to 3010. **Do not tidy the signature
  function** — the field insertion order and PHP-style urlencode are load-bearing
  and were corrected after live failures.

- [ ] **Step 3: Failing test for the signature**

```ts
import { PayFastService } from "./payfast";

test("signature matches PayFast's documented insertion order", () => {
  const pf = new PayFastService();
  const sig = pf.generateSignature(
    { merchant_id: "10000100", merchant_key: "46f0cd694581a", amount: "100.00", item_name: "Test" },
    ""
  );
  expect(sig).toMatch(/^[a-f0-9]{32}$/);
});

test("blank fields are excluded from the signature", () => {
  const pf = new PayFastService();
  const a = pf.generateSignature({ merchant_id: "1", item_name: "X", item_description: "" }, "");
  const b = pf.generateSignature({ merchant_id: "1", item_name: "X" }, "");
  expect(a).toBe(b);
});
```

- [ ] **Step 4: Run — expected PASS after the port.**

- [ ] **Step 5: Checkout page** — customer details, delivery address, order summary.
  Shipping: **flat R99 nationally, free over R750, plus a free "collect from the
  farm" option.** This is the documented default assumption pending the client's
  answer (spec §8.1); it lives in `site_settings` so it changes without a deploy.
  Form carries `<BotGuard/>`.

- [ ] **Step 6: On submit** — `createOrder()` writes `orders` + `order_items` as
  `pending`, then renders a self-POSTing form of `payfast.createPaymentData()` to
  `payfast.getPaymentUrl()`.

- [ ] **Step 7: ITN route** — `/api/payfast/notify` must, in order:
  read the raw body; check `isValidRequestIp()`; check `verifySignature()`;
  check `validateWithPayFast(rawBody)`; confirm `amount_gross` equals the order
  total to 2dp; only then `markOrderPaid()`. Any failure returns 200 with no state
  change (PayFast retries on non-200). Log every rejection with the reason.

- [ ] **Step 8: Verify against the real sandbox**

Run a full sandbox transaction end to end. Expected: order row flips `pending` →
`paid`, `payfast_payment_id` populated, `paid_at` set, and the success page shows
the order reference. Confirm a replayed ITN does not double-apply.

```bash
git commit -am "feat(rehoboth): checkout and PayFast with hardened ITN"
```

---

### Task 10: Order email

**Files:**
- Create: `src/lib/email.ts`, `src/components/email/OrderConfirmation.tsx`

- [ ] **Step 1:** Resend client, constructed inside the handler only.
- [ ] **Step 2:** On successful ITN, send the customer a confirmation and
  `ORDER_NOTIFY_EMAIL` a copy. Email failure must never fail the ITN — catch,
  log, still return 200.
- [ ] **Step 3: Verify** — complete a sandbox order, confirm both emails arrive
  and the totals match the order row.

```bash
git commit -am "feat(rehoboth): order confirmation email"
```

---

### Task 11: Accounts

**Files:**
- Create: `src/app/account/login/page.tsx`, `signup/`, `forgot-password/`, `reset-password/`, `orders/`
- Create: `supabase/migrations/0002_customers.sql`

- [ ] **Step 1:** `customers` table keyed to Supabase Auth `user_id`, with a
  `trade_status` column (`none` default) reserved for the distributor tier.
- [ ] **Step 2:** Login ships **forgot-password, show-password toggle and
  keep-me-signed-in** in this first pass — not retrofitted.
- [ ] **Step 3:** Guest checkout stays available; account is optional.
- [ ] **Step 4: Verify** — sign up, log out, reset password by email, log back
  in, see past orders.

```bash
git commit -am "feat(rehoboth): customer accounts"
```

---

### Task 12: Stockist applications

**Files:**
- Create: `src/app/stockists/page.tsx`, `src/components/forms/BotGuard.tsx`
- Create: `supabase/migrations/0004_stockist_applications.sql`

**Interfaces:**
- Produces: `<BotGuard/>` — renders a visually-hidden `website` honeypot input and
  a hidden `renderedAt` timestamp. Server rejects when the honeypot is non-empty
  or the submission is under 3 seconds old.

- [ ] **Step 1: Failing test** — a POST with a filled honeypot is rejected; a POST
  1 second after render is rejected; a normal submission is accepted.
- [ ] **Step 2: Run, watch it fail.**
- [ ] **Step 3: Implement `BotGuard` and the server check.**
- [ ] **Step 4: Run — expected PASS.**
- [ ] **Step 5:** Public page pitching wholesale from 10 units; form captures
  business name, contact, phone, email, town, and what they currently stock.
  **Trade prices are never rendered on this page** — approval is manual.
- [ ] **Step 6: Verify** — submit, see the row in Supabase.

```bash
git commit -am "feat(rehoboth): stockist application with bot guard"
```

---

### Task 13: Admin

**Files:**
- Create: `src/app/admin/layout.tsx`, `products/`, `orders/`, `stockists/`, `settings/`

- [ ] **Step 1:** Route-group auth guard — Supabase session plus an `admin` role in
  `app_metadata`. Unauthenticated hits redirect to login.
- [ ] **Step 2: Products** — list, edit product copy and per-variant price/stock,
  toggle active. **Every save runs `screen()` and blocks with the flagged terms
  shown if it fails.** This is the guard that stops a claim reaching production
  through the admin.
- [ ] **Step 3: Orders** — list with status filter, detail view, mark fulfilled,
  CSV export.
- [ ] **Step 4: Stockists** — application queue, approve/decline.
- [ ] **Step 5: Settings** — shipping flat rate, free-shipping threshold,
  collection on/off, announcement bar text.
- [ ] **Step 6: Verify the actual success criterion** — as a non-developer would:
  change the Rosemary 150g price in admin, reload `/product/rosemary`, see the new
  price. Add a product, see it on `/shop`.

```bash
git commit -am "feat(rehoboth): admin for products, orders, stockists, settings"
```

---

### Task 14: SEO, legal, launch readiness

**Files:**
- Create: `src/app/sitemap.ts`, `robots.ts`, `privacy/`, `terms/`, `returns/`, `about/`

- [ ] **Step 1:** Per-page metadata, OpenGraph images, `Product` + `Organization`
  JSON-LD. **No health claims in any structured data.**
- [ ] **Step 2:** POPIA privacy notice, T&Cs, returns policy. Company registration
  number, trading address and Information Officer stay `[BRACKETED]` until the
  client supplies them — do not invent them.
- [ ] **Step 3: About page** — the Genesis 26:22 story, the farm, Foundations for
  Farming, using `drying.mp4` and `capsules.mp4`.
- [ ] **Step 4: Final verification gate.** All four must pass:

```bash
npm run compliance:scan     # expect: 0 hits
npm run build               # expect: no type errors
npx lighthouse http://localhost:3010 --only-categories=performance,accessibility --form-factor=mobile
```

Expected: compliance clean, build green, Lighthouse performance ≥90 and
accessibility ≥90 on home, shop and a product page, and a sandbox order
completing end to end one final time.

```bash
git commit -am "feat(rehoboth): SEO, legal pages, launch readiness"
```

---

## Self-review notes

**Spec coverage:** §2 discovery → Tasks 2, 5. §3 decisions → Tasks 2 (trade
columns), 6 (direction), 3 (compliance). §4 design → Tasks 4, 6. §5 architecture →
Tasks 1, 2, 9. §5.2 standards → Task 11 (login trio), 12 (bot guard), 2
(keep-alive), 1 (no render-time client). §6 compliance → Task 3 + gates in 7 and
13. §9 success criteria → Task 14's gate, plus Task 13 Step 6 for the
"admin without a developer" criterion.

**Deferred deliberately:** the journal (own plan), gated trade pricing (schema
ready, UI out of scope), replacement label artwork (client decision pending).

**Blocked on client, defaults documented in-plan:** shipping rates (Task 9 Step 5
uses R99/R750/collection via settings), retail-vs-stockist pricing (Task 2 seeds
the pricelist retail column — changing it is one seed edit), company registration
details (bracketed in Task 14).
