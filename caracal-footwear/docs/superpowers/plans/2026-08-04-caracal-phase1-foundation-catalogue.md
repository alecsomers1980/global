# Caracal Footwear — Phase 1: Foundation & Catalogue — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A deployable Caracal Footwear site with a real Supabase-backed catalogue that a visitor can browse — range listing with filters, and a product page with working colour-swatch and size selection — styled in the approved dark cinematic art direction.

**Architecture:** Next.js 16 App Router with server components reading Supabase directly for catalogue pages. Pure business logic (pricing, delivery, stock state) lives in isolated, unit-tested modules under `src/lib/` with no framework or database dependency, so it can be tested without mocking. Data access is a thin typed layer over the Supabase client. UI is composed from small focused components; no component file exceeds one responsibility.

**Tech Stack:** Next.js 16.2.10 · React 19.2.4 · TypeScript 5 · Tailwind CSS 4 · Supabase (Postgres + Storage) · Vitest (unit tests) · Zustand (cart, Phase 2) · GSAP (cinematic layer, Phase 4)

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Next.js is version 16.2.10 — this is NOT the Next.js in your training data.** APIs, conventions and file structure differ. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices. This constraint is inherited from the Dianas build's `AGENTS.md` and is not optional.
- Pin these exact versions to match the proven Dianas build: `next@16.2.10`, `react@19.2.4`, `react-dom@19.2.4`, `@supabase/supabase-js@^2.110.5`, `@supabase/ssr@^0.12.3`, `tailwindcss@^4`, `typescript@^5`.
- **Never write secret values into any file.** Supabase keys, PayFast credentials and Resend keys live in `.env.local` only, which is gitignored. A PreToolUse hook blocks edits to `.env*` files — if a key is needed, tell the user which variable to set rather than attempting to write it.
- **Design tokens are fixed** (spec §7) and must be used by name, never as raw hex in components:
  `canvas #14110F` · `surface #1E1A17` · `accent #C25A1E` · `accent-hi #D96B2A` · `tan #B5763A` · `cognac #A8542A` · `camel #C89660` · `text #F5F0E8` · `muted #A39A90`
- **Burnt orange `#C25A1E` is never used for body text on the charcoal canvas** — contrast fails. It is for rules, accents, borders and large display type only. All text/background pairs must meet WCAG AA.
- **Sizes are 4 to 15 inclusive** (12 sizes). **Free delivery over R1,000.** **Delivery fee below that is R99.** **Lead time is 5 working days.** All four values live in `site_settings`, never hardcoded in a component.
- **Prices are stored in whole Rand cents as integers.** Never use floating point for money.
- `stock_qty` has a database-level `CHECK (stock_qty >= 0)`. It is never decremented in Phase 1.
- **No GSAP or scroll animation in Phase 1.** Motion arrives in Phase 4 and never touches PDP, cart or checkout.
- Commit after every task. Do not batch commits.

## Delegating to DeepSeek

Code generation is delegated to DeepSeek v4 via the local proxy. The orchestrator (Claude) writes the prompt, DeepSeek writes the code, the orchestrator verifies.

**Preconditions:** proxy listening on `localhost:8082`. Check with:
```bash
curl -s -m 5 -o /dev/null -w "%{http_code}\n" http://localhost:8082/v1/models
```
`401` means up and healthy (it wants the token). Connection refused means down — start it with `./ds.ps1` from the Antigravity root, or fall back to implementing the task directly.

**Invocation:**
```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/opencode-glm-extension"
node ds-run.js <promptFile> <outFile>
node ds-apply.js <outFile> "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
```

**Every DeepSeek prompt MUST:**
1. State the Global Constraints above verbatim.
2. Give the exact target file path(s).
3. Demand output in the apply format, nothing else:
   ```
   ===FILE: relative/path/from/project/root.ts===
   <complete file content>
   ===END===
   ```
4. Ask for **complete files**, never diffs or fragments — `ds-apply.js` overwrites whole files.
5. Stay under the 8192-token output ceiling. Split a task across calls rather than truncating. Raise with `DS_MAX_TOKENS` only if a single file genuinely cannot be split.

**Do not delegate blind.** After every apply, the orchestrator runs the task's verification command and reads the generated file. DeepSeek does not know Next.js 16's breaking changes; the orchestrator is responsible for catching them.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/money.ts` | Integer-cent arithmetic and ZAR formatting. No deps. |
| `src/lib/delivery.ts` | Delivery fee from subtotal + settings. Pure. |
| `src/lib/stock.ts` | Derives display stock state from a variant. Pure. |
| `src/lib/catalogue.ts` | Groups flat variant rows into colours/sizes for the UI. Pure. |
| `src/lib/supabase/server.ts` | Server-side Supabase client factory. |
| `src/lib/supabase/types.ts` | Generated/hand-written DB row types. |
| `src/lib/queries/products.ts` | Typed product reads. Only file that talks to Supabase for catalogue. |
| `src/app/globals.css` | Tailwind 4 theme — design tokens as CSS custom properties. |
| `src/app/layout.tsx` | Root layout, fonts, grain overlay. |
| `src/components/site/Header.tsx` · `Footer.tsx` | Site chrome. |
| `src/components/shop/ProductCard.tsx` | One card in a grid. |
| `src/components/shop/RangeFilters.tsx` | Filter controls, URL-param driven. |
| `src/components/product/ColourSwatches.tsx` | Colour selection. |
| `src/components/product/SizeSelector.tsx` | Size selection + stock state. |
| `src/components/product/ProductGallery.tsx` | Image gallery, swaps on colour change. |
| `src/app/range/page.tsx` · `src/app/range/[category]/page.tsx` | Listing. |
| `src/app/product/[slug]/page.tsx` | PDP. |
| `supabase/migrations/0001_catalogue.sql` | products, variants, images, site_settings. |
| `scripts/seed-catalogue.mjs` | Placeholder catalogue seed. |

---

## Task 1: Project scaffold, design tokens, and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.local.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `vitest.config.ts`, `src/lib/money.ts`, `src/lib/money.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `formatZAR(cents: number): string`, `randToCents(rand: number): number`, `centsToRand(cents: number): number` from `src/lib/money.ts`. Design token CSS variables `--color-canvas`, `--color-surface`, `--color-accent`, `--color-accent-hi`, `--color-tan`, `--color-cognac`, `--color-camel`, `--color-text`, `--color-muted` available as Tailwind utilities `bg-canvas`, `text-accent`, etc.

- [ ] **Step 1: Scaffold the Next.js project**

Run from the Antigravity root. Answer prompts: TypeScript yes, ESLint yes, Tailwind yes, `src/` yes, App Router yes, Turbopack yes, import alias `@/*`.

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity"
npx create-next-app@16.2.10 caracal-footwear --ts --eslint --tailwind --src-dir --app --import-alias "@/*" --use-npm
```

Note: `caracal-footwear/` already contains `docs/` and `intake/`. If the scaffolder refuses a non-empty directory, scaffold to `caracal-tmp/` and move the generated files in, preserving `docs/` and `intake/`.

Expected: `caracal-footwear/package.json` exists with `next@16.2.10`.

- [ ] **Step 2: Install remaining dependencies**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npm install @supabase/supabase-js@^2.110.5 @supabase/ssr@^0.12.3 zustand@^5.0.14
npm install -D vitest@^2 @vitejs/plugin-react happy-dom
```

Expected: exit 0, no peer-dependency errors.

- [ ] **Step 3: Set the dev port and test script**

Edit `package.json` scripts to avoid colliding with other local projects (Dianas uses 3005):

```json
{
  "scripts": {
    "dev": "next dev -p 3012",
    "build": "next build",
    "start": "next start -p 3012",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 5: Write the failing test for money handling**

Create `src/lib/money.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatZAR, randToCents, centsToRand } from './money';

describe('money', () => {
  it('formats whole rand with no decimals', () => {
    expect(formatZAR(55000)).toBe('R550');
  });

  it('formats non-whole rand with two decimals', () => {
    expect(formatZAR(55050)).toBe('R550.50');
  });

  it('groups thousands with a space', () => {
    expect(formatZAR(155000)).toBe('R1 550');
  });

  it('formats zero', () => {
    expect(formatZAR(0)).toBe('R0');
  });

  it('converts rand to cents without float drift', () => {
    expect(randToCents(550.55)).toBe(55055);
    expect(randToCents(0.1)).toBe(10);
  });

  it('converts cents back to rand', () => {
    expect(centsToRand(55055)).toBe(550.55);
  });
});
```

Note the thousands separator is a **regular space**, not a non-breaking space. The Everest flyer build hit tofu glyphs because `en-ZA` `Intl.NumberFormat` emits U+00A0; this implementation avoids `Intl` for that reason.

- [ ] **Step 6: Run the test to verify it fails**

```bash
npm test -- money
```

Expected: FAIL — `Failed to resolve import "./money"`.

- [ ] **Step 7: Implement the money module**

Create `src/lib/money.ts`:

```ts
/**
 * All money in this codebase is integer cents. Never floats.
 * Formatting avoids Intl.NumberFormat because en-ZA emits U+00A0 as the
 * thousands separator, which renders as tofu in several of our display fonts.
 */

export function randToCents(rand: number): number {
  return Math.round(rand * 100);
}

export function centsToRand(cents: number): number {
  return cents / 100;
}

export function formatZAR(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const remainder = abs % 100;

  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const body = remainder === 0
    ? `R${grouped}`
    : `R${grouped}.${String(remainder).padStart(2, '0')}`;

  return negative ? `-${body}` : body;
}
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
npm test -- money
```

Expected: PASS, 6 tests.

- [ ] **Step 9: Write the design tokens into the Tailwind 4 theme**

Replace `src/app/globals.css`. Tailwind 4 uses `@theme`, not a `tailwind.config.js` colour block:

```css
@import "tailwindcss";

@theme {
  --color-canvas:    #14110F;
  --color-surface:   #1E1A17;
  --color-accent:    #C25A1E;
  --color-accent-hi: #D96B2A;
  --color-tan:       #B5763A;
  --color-cognac:    #A8542A;
  --color-camel:     #C89660;
  --color-text:      #F5F0E8;
  --color-muted:     #A39A90;
}

:root {
  color-scheme: dark;
}

body {
  background-color: var(--color-canvas);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

/* Film grain, ties the site back to the printed flyer. Decorative only. */
.grain::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 10: Create the env example file**

Create `.env.local.example` (this is a template with no real values, so the env-guardrail hook permits it):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Confirm `.gitignore` contains `.env*.local`.

- [ ] **Step 11: Verify the app builds and runs**

```bash
npm run build
```
Expected: build succeeds, exit 0.

```bash
npm run dev
```
Expected: serves on `http://localhost:3012` with a dark charcoal background.

- [ ] **Step 12: Commit**

```bash
git add caracal-footwear/
git commit -m "feat(caracal): scaffold Next 16 app with design tokens and money module

Integer-cent money handling with hand-rolled ZAR formatting -- Intl's en-ZA
locale emits U+00A0 as its thousands separator, which renders as tofu in the
display font.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Catalogue database schema

**Files:**
- Create: `supabase/migrations/0001_catalogue.sql`
- Create: `src/lib/supabase/types.ts`
- Create: `src/lib/supabase/server.ts`

**Interfaces:**
- Consumes: nothing from Task 1 except the project existing.
- Produces: TypeScript types `Product`, `ProductVariant`, `ProductImage`, `SiteSetting`, and the union types `ProductCategory = 'chukka' | 'low_cut' | 'chelsea' | 'hiker'` and `SignatureType = 'wildlife' | 'hide' | 'floral'`. Also `createServerClient(): SupabaseClient` from `src/lib/supabase/server.ts`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0001_catalogue.sql`:

```sql
-- Caracal Footwear: catalogue schema
-- Money is integer cents throughout. Never numeric, never float.

create type product_category as enum ('chukka', 'low_cut', 'chelsea', 'hiker');
create type signature_type  as enum ('wildlife', 'hide', 'floral');

create table products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  style_no       text,
  name           text not null,
  description    text not null default '',
  category       product_category not null,
  -- is_signature is orthogonal to category: a lion-panel vellie is
  -- category='low_cut' AND is_signature=true, so it appears in both
  -- /range/low-cut and /signature. There is no 'signature' category.
  is_signature   boolean not null default false,
  signature_type signature_type,
  base_price     integer not null check (base_price >= 0),
  featured       boolean not null default false,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  constraint signature_type_only_when_signature
    check ((is_signature and signature_type is not null)
        or (not is_signature and signature_type is null))
);

create table product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  colour_name    text not null,
  colour_hex     text not null,
  size           integer not null check (size between 4 and 15),
  sku            text unique,
  stock_qty      integer not null default 0 check (stock_qty >= 0),
  price_override integer check (price_override >= 0),
  active         boolean not null default true,
  unique (product_id, colour_name, size)
);

create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  colour_name text,           -- null means: applies to every colour
  url         text not null,
  alt         text not null default '',
  sort_order  integer not null default 0
);

create table site_settings (
  key   text primary key,
  value text not null
);

create index products_category_idx   on products (category) where active;
create index products_signature_idx  on products (is_signature) where active;
create index variants_product_idx    on product_variants (product_id) where active;
create index images_product_idx      on product_images (product_id, sort_order);

insert into site_settings (key, value) values
  ('delivery_free_threshold', '100000'),  -- R1000 in cents
  ('delivery_fee',            '9900'),    -- R99 in cents
  ('lead_time',               '5 working days'),
  ('contact_phone',           '082 451 0359'),
  ('contact_email',           'donald@caracallodge.co.za'),
  ('whatsapp_number',         '27824510359');

-- Public read access; writes are service-role only until admin auth lands in Phase 3.
alter table products         enable row level security;
alter table product_variants enable row level security;
alter table product_images   enable row level security;
alter table site_settings    enable row level security;

create policy "public read active products"  on products
  for select using (active);
create policy "public read active variants"  on product_variants
  for select using (active);
create policy "public read images"           on product_images
  for select using (true);
create policy "public read settings"         on site_settings
  for select using (true);
```

- [ ] **Step 2: Apply the migration**

Paste the file into the Supabase SQL editor for the Caracal project and run it.

Expected: `Success. No rows returned.`

Verify:
```sql
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
```
Expected rows: `product_images`, `product_variants`, `products`, `site_settings`.

- [ ] **Step 3: Verify the constraints actually bite**

Run each of these in the SQL editor. **All three must fail** — that is the pass condition:

```sql
-- must fail: size out of range
insert into products (slug, name, category, base_price)
  values ('t', 'T', 'chukka', 55000);
insert into product_variants (product_id, colour_name, colour_hex, size)
  select id, 'Tan', '#B5763A', 16 from products where slug = 't';
```
Expected: `violates check constraint "product_variants_size_check"`

```sql
-- must fail: negative stock
insert into product_variants (product_id, colour_name, colour_hex, size, stock_qty)
  select id, 'Tan', '#B5763A', 9, -1 from products where slug = 't';
```
Expected: `violates check constraint "product_variants_stock_qty_check"`

```sql
-- must fail: signature_type set without is_signature
insert into products (slug, name, category, base_price, signature_type)
  values ('t2', 'T2', 'chukka', 55000, 'wildlife');
```
Expected: `violates check constraint "signature_type_only_when_signature"`

Clean up: `delete from products where slug in ('t', 't2');`

- [ ] **Step 4: Write the TypeScript types**

Create `src/lib/supabase/types.ts`:

```ts
export type ProductCategory = 'chukka' | 'low_cut' | 'chelsea' | 'hiker';
export type SignatureType = 'wildlife' | 'hide' | 'floral';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  chukka:  'Chukka',
  low_cut: 'Low-Cut',
  chelsea: 'Chelsea',
  hiker:   'Hiker',
};

/** URL segment <-> enum value. The enum uses snake_case, URLs use kebab-case. */
export const CATEGORY_SLUGS: Record<ProductCategory, string> = {
  chukka:  'chukka',
  low_cut: 'low-cut',
  chelsea: 'chelsea',
  hiker:   'hiker',
};

export function categoryFromSlug(slug: string): ProductCategory | null {
  const entry = Object.entries(CATEGORY_SLUGS).find(([, s]) => s === slug);
  return entry ? (entry[0] as ProductCategory) : null;
}

export interface Product {
  id: string;
  slug: string;
  style_no: string | null;
  name: string;
  description: string;
  category: ProductCategory;
  is_signature: boolean;
  signature_type: SignatureType | null;
  /** integer cents */
  base_price: number;
  featured: boolean;
  active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  colour_name: string;
  colour_hex: string;
  size: number;
  sku: string | null;
  stock_qty: number;
  /** integer cents, overrides Product.base_price when set */
  price_override: number | null;
  active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  /** null means the image applies to every colour */
  colour_name: string | null;
  url: string;
  alt: string;
  sort_order: number;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  images: ProductImage[];
}
```

- [ ] **Step 5: Write the Supabase server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

/**
 * Read-only anon client for server components. Catalogue tables are public
 * behind RLS, so the anon key is sufficient and the service-role key must
 * never reach this path.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.local.example to .env.local and fill them in.',
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
```

- [ ] **Step 6: Verify it typechecks**

```bash
npx tsc --noEmit
```
Expected: exit 0, no errors.

- [ ] **Step 7: Commit**

```bash
git add caracal-footwear/supabase caracal-footwear/src/lib/supabase
git commit -m "feat(caracal): catalogue schema with integer-cent pricing

is_signature is orthogonal to category and enforced by a check constraint,
so a lion-panel vellie is low_cut AND signature rather than a category of
its own. Size range and non-negative stock are enforced in the database,
not only in application code.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: Pure business logic — delivery, stock state, catalogue grouping

These are the modules most likely to break silently and least likely to be caught by eye, so they get real tests. Delegate to DeepSeek with the test file included in the prompt so it implements against a fixed contract.

**Files:**
- Create: `src/lib/delivery.ts`, `src/lib/delivery.test.ts`
- Create: `src/lib/stock.ts`, `src/lib/stock.test.ts`
- Create: `src/lib/catalogue.ts`, `src/lib/catalogue.test.ts`

**Interfaces:**
- Consumes: `ProductVariant`, `ProductImage` from `src/lib/supabase/types.ts` (Task 2).
- Produces:
  - `calculateDelivery(subtotalCents: number, settings: DeliverySettings): number`
  - `interface DeliverySettings { freeThreshold: number; fee: number }`
  - `variantStockState(v: ProductVariant | undefined): 'in_stock' | 'low_stock' | 'sold_out' | 'unavailable'`
  - `groupVariants(variants: ProductVariant[], fallbackPriceCents?: number): ColourGroup[]` — `fallbackPriceCents` defaults to `0` and is used when a variant has no `price_override`
  - `interface ColourGroup { colourName: string; colourHex: string; sizes: SizeOption[] }`
  - `interface SizeOption { size: number; variantId: string; stockQty: number; priceCents: number }`
  - `imagesForColour(images: ProductImage[], colourName: string | null): ProductImage[]`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/delivery.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateDelivery } from './delivery';

const settings = { freeThreshold: 100000, fee: 9900 };

describe('calculateDelivery', () => {
  it('charges the flat fee below the threshold', () => {
    expect(calculateDelivery(55000, settings)).toBe(9900);
  });

  it('is free exactly at the threshold', () => {
    expect(calculateDelivery(100000, settings)).toBe(0);
  });

  it('is free above the threshold', () => {
    expect(calculateDelivery(150000, settings)).toBe(0);
  });

  it('charges nothing on an empty cart', () => {
    expect(calculateDelivery(0, settings)).toBe(0);
  });
});
```

Create `src/lib/stock.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { variantStockState } from './stock';
import type { ProductVariant } from './supabase/types';

function variant(over: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'v1', product_id: 'p1', colour_name: 'Tan', colour_hex: '#B5763A',
    size: 9, sku: null, stock_qty: 10, price_override: null, active: true,
    ...over,
  };
}

describe('variantStockState', () => {
  it('reports in_stock above the low threshold', () => {
    expect(variantStockState(variant({ stock_qty: 10 }))).toBe('in_stock');
  });

  it('reports low_stock at or below three', () => {
    expect(variantStockState(variant({ stock_qty: 3 }))).toBe('low_stock');
    expect(variantStockState(variant({ stock_qty: 1 }))).toBe('low_stock');
  });

  it('reports sold_out at zero', () => {
    expect(variantStockState(variant({ stock_qty: 0 }))).toBe('sold_out');
  });

  it('reports unavailable for an inactive variant even with stock', () => {
    expect(variantStockState(variant({ active: false, stock_qty: 10 }))).toBe('unavailable');
  });

  it('reports unavailable when the combination does not exist', () => {
    expect(variantStockState(undefined)).toBe('unavailable');
  });
});
```

Create `src/lib/catalogue.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { groupVariants, imagesForColour } from './catalogue';
import type { ProductVariant, ProductImage } from './supabase/types';

function v(colour: string, hex: string, size: number, over: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: `${colour}-${size}`, product_id: 'p1', colour_name: colour, colour_hex: hex,
    size, sku: null, stock_qty: 5, price_override: null, active: true, ...over,
  };
}

describe('groupVariants', () => {
  it('groups flat rows by colour', () => {
    const groups = groupVariants([
      v('Tan', '#B5763A', 9), v('Tan', '#B5763A', 10), v('Black', '#14110F', 9),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.map(g => g.colourName).sort()).toEqual(['Black', 'Tan']);
  });

  it('sorts sizes ascending within a colour', () => {
    const groups = groupVariants([
      v('Tan', '#B5763A', 12), v('Tan', '#B5763A', 4), v('Tan', '#B5763A', 9),
    ]);
    expect(groups[0].sizes.map(s => s.size)).toEqual([4, 9, 12]);
  });

  it('prefers price_override over the fallback price', () => {
    const groups = groupVariants([v('Tan', '#B5763A', 9, { price_override: 69900 })], 55000);
    expect(groups[0].sizes[0].priceCents).toBe(69900);
  });

  it('falls back to the base price when no override is set', () => {
    const groups = groupVariants([v('Tan', '#B5763A', 9)], 55000);
    expect(groups[0].sizes[0].priceCents).toBe(55000);
  });

  it('excludes inactive variants', () => {
    const groups = groupVariants([v('Tan', '#B5763A', 9, { active: false })]);
    expect(groups).toHaveLength(0);
  });

  it('returns an empty array for no variants', () => {
    expect(groupVariants([])).toEqual([]);
  });
});

describe('imagesForColour', () => {
  const images: ProductImage[] = [
    { id: '1', product_id: 'p1', colour_name: null,    url: 'a.jpg', alt: '', sort_order: 0 },
    { id: '2', product_id: 'p1', colour_name: 'Tan',   url: 'b.jpg', alt: '', sort_order: 1 },
    { id: '3', product_id: 'p1', colour_name: 'Black', url: 'c.jpg', alt: '', sort_order: 2 },
  ];

  it('returns colour-specific images plus the shared ones', () => {
    expect(imagesForColour(images, 'Tan').map(i => i.url)).toEqual(['a.jpg', 'b.jpg']);
  });

  it('returns only shared images for an unknown colour', () => {
    expect(imagesForColour(images, 'Red').map(i => i.url)).toEqual(['a.jpg']);
  });

  it('returns every image when no colour is selected', () => {
    expect(imagesForColour(images, null)).toHaveLength(3);
  });

  it('orders by sort_order', () => {
    const shuffled = [images[2], images[0], images[1]];
    expect(imagesForColour(shuffled, 'Tan').map(i => i.sort_order)).toEqual([0, 1]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test
```
Expected: FAIL — cannot resolve `./delivery`, `./stock`, `./catalogue`.

- [ ] **Step 3: Write the DeepSeek prompt**

Create the prompt at `<scratchpad>/ds-task3.md`. It must contain: the Global Constraints section verbatim, the three test files verbatim, the `ProductVariant`/`ProductImage` types verbatim, the exact Produces signatures from this task's Interfaces block, and this instruction:

> Implement exactly these three modules so every test passes. Pure functions only — no imports beyond the type imports shown. Do not modify the tests. `groupVariants` takes an optional second parameter `fallbackPriceCents: number = 0`. Output complete files in this format and nothing else:
> ```
> ===FILE: src/lib/delivery.ts===
> ...
> ===END===
> ===FILE: src/lib/stock.ts===
> ...
> ===END===
> ===FILE: src/lib/catalogue.ts===
> ...
> ===END===
> ```

- [ ] **Step 4: Run DeepSeek and apply the result**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/opencode-glm-extension"
node ds-run.js "<scratchpad>/ds-task3.md" "<scratchpad>/ds-task3-out.md"
node ds-apply.js "<scratchpad>/ds-task3-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
```
Expected: `Applied 3 file(s).`

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npm test
```
Expected: PASS — 6 money + 4 delivery + 5 stock + 10 catalogue = 25 tests.

If any fail, read the generated file, fix it directly rather than re-prompting for a third round trip.

- [ ] **Step 6: Read the generated files**

Open all three. Confirm no `any` types, no stray imports, no leftover markdown fences, and that `low_stock` uses a named constant rather than a bare `3`.

- [ ] **Step 7: Commit**

```bash
git add caracal-footwear/src/lib
git commit -m "feat(caracal): delivery, stock-state and catalogue-grouping logic

Pure and dependency-free so they test without mocking Supabase. These are the
rules most likely to break silently -- delivery threshold boundaries and the
price_override fallback both have explicit boundary tests.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Placeholder catalogue seed

**Files:**
- Create: `scripts/seed-catalogue.mjs`
- Modify: `package.json` (add the `seed` script)

**Interfaces:**
- Consumes: the schema from Task 2.
- Produces: seeded rows. No code interface.

**Seed data.** Everything here is a **placeholder derived from the client's photographs**, to be replaced through the admin before launch (spec §10). Only the three style numbers on actual box labels are used; nothing is invented beyond what the images show.

| Style | Name | Category | Colours |
| --- | --- | --- | --- |
| 420 | Classic Chukka | `chukka` | White, Red, Navy, Tan, Olive Green, Black |
| 402 | Veld Chelsea | `chelsea` | Khaki, Tan, Brown |
| 403 | Ranger Hiker | `hiker` | Cognac, Brown, Olive Green |
| — | Kalahari Low-Cut | `low_cut` | Tan, Black |

Signature products (`is_signature = true`). Each has **exactly one colour, named after
its own design** — so the Lion product's single colour is `Lion`. This keeps the
colour-swatch UI meaningful rather than showing a swatch of the base leather.

| Name | `signature_type` | `category` | Colour |
| --- | --- | --- | --- |
| Lion | `wildlife` | `low_cut` | Lion |
| Leopard | `wildlife` | `low_cut` | Leopard |
| Buffalo Sunset | `wildlife` | `chukka` | Buffalo Sunset |
| Zebra Hide | `hide` | `low_cut` | Zebra |
| Leopard Hide | `hide` | `low_cut` | Leopard Hide |
| Protea | `floral` | `chukka` | Protea |
| Succulent | `floral` | `chukka` | Succulent |

Signature `colour_hex` values are the dominant tone of each design, used only as the
swatch fill: Lion `#A8542A` · Leopard `#C89660` · Buffalo Sunset `#8A3B1E` ·
Zebra `#F5F0E8` · Leopard Hide `#B5763A` · Protea `#9B5566` · Succulent `#4A6B4F`.

**Derived counts** — the seed and every verification step must agree with these:
- Products: 4 core + 7 signature = **11**
- Colour-lines: (6 + 3 + 3 + 2) core + 7 signature = **21**
- Variants: 21 × 12 sizes = **252**
- Products by category: `chukka` 4 (420 + Buffalo Sunset + Protea + Succulent) ·
  `low_cut` 5 (Kalahari + Lion + Leopard + Zebra Hide + Leopard Hide) ·
  `chelsea` 1 · `hiker` 1
- Distinct colour names: 9 core (White, Red, Navy, Tan, Olive Green, Black, Khaki,
  Brown, Cognac) + 7 signature = **16**

**Expected totals.** Colour-lines: 6 + 3 + 3 + 2 = 14 across the core styles, plus 7
signature products at one colour each = **21 colour-lines**. At 12 sizes each that is
**11 products and 252 variants**. Every verification step below uses these numbers.

- [ ] **Step 1: Delegate the seed script to DeepSeek**

Prompt must include the Global Constraints, the seed-data table above, the signature
product list, the `0001_catalogue.sql` schema verbatim, and these rules:

> Write `scripts/seed-catalogue.mjs` — a plain Node ESM script using
> `@supabase/supabase-js`. It must:
> - Read `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from
>   `process.env` and exit code 1 with a clear message naming the missing variable.
> - **Refuse to write unless `--apply` is passed in `process.argv`**, printing what it
>   would do instead. This mirrors the Dianas convention and prevents accidental
>   overwrites.
> - Be idempotent: delete existing products by slug before inserting, letting the
>   `on delete cascade` clear variants and images.
> - Insert with `base_price = 55000` (integer cents).
> - Generate every size 4–15 inclusive for every colour, `stock_qty = 0`,
>   SKU pattern `{style_no ?? slug}-{COLOUR}-{size}` uppercased with spaces stripped.
> - Set `signature_type` only on signature products, and never otherwise — the schema
>   has a check constraint that will reject the row.
> - Set `description` from the flyer facts only: genuine leather, non-slip TPR sole,
>   handmade, 5 working days. **Invent no claims, no history, no materials not shown.**
> - Insert variants in batches of 500 to stay under statement limits.
> - Print a final summary line: `products=<n> variants=<n>`.
>
> Output the complete file in the `===FILE:===` format and nothing else.

- [ ] **Step 2: Add the seed script to package.json**

```json
"seed": "node --env-file=.env.local scripts/seed-catalogue.mjs"
```

- [ ] **Step 3: Dry-run it**

```bash
npm run seed
```
Expected: prints the plan, inserts nothing, and says `--apply` is required.

- [ ] **Step 4: Apply it**

```bash
npm run seed -- --apply
```
Expected, exactly: `products=11 variants=252`

If the variant count differs, the size loop is wrong — 21 colour-lines × 12 sizes = 252. Do not proceed until it matches.

- [ ] **Step 5: Verify in SQL**

```sql
select p.style_no, p.name, p.category, p.is_signature, count(v.id) as variants
from products p left join product_variants v on v.product_id = p.id
group by p.id order by p.is_signature, p.style_no nulls last;
```
Expected: every product's variant count is exactly `colours × 12`, and no count is zero.

```sql
select count(*) from product_variants where size < 4 or size > 15;
```
Expected: `0`.

- [ ] **Step 6: Commit**

```bash
git add caracal-footwear/scripts caracal-footwear/package.json
git commit -m "feat(caracal): placeholder catalogue seed

Requires --apply, mirroring the Dianas convention. Every product gets all 12
sizes at zero stock so Donald fills the grid rather than creating 72 rows per
style by hand. All copy is drawn from the client's flyer -- no invented claims,
and R550 remains flagged as unconfirmed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: Product query layer

**Files:**
- Create: `src/lib/queries/products.ts`

**Interfaces:**
- Consumes: `createServerClient()` (Task 2), all types from `src/lib/supabase/types.ts` (Task 2).
- Produces:
  - `listProducts(filter?: ProductFilter): Promise<ProductWithVariants[]>`
  - `interface ProductFilter { category?: ProductCategory; signatureOnly?: boolean; colour?: string; size?: number }`
  - `getProductBySlug(slug: string): Promise<ProductWithVariants | null>`
  - `getSiteSettings(): Promise<Record<string, string>>`
  - `listColours(): Promise<{ name: string; hex: string }[]>`

- [ ] **Step 1: Delegate to DeepSeek**

Prompt must include: Global Constraints, the full contents of `src/lib/supabase/types.ts` and `src/lib/supabase/server.ts`, the exact signatures above, and these rules:

> - Every query selects products joined with their variants and images in a single round trip using Supabase's nested select syntax, never N+1.
> - Only `active` products and variants are returned.
> - `colour` and `size` filters match a product if **any** of its variants match — they narrow the product list, they do not narrow the returned variants.
> - `getSiteSettings` returns a plain key→value record.
> - `listColours` returns the distinct colours across all active variants, for the filter UI.
> - Every function is `async` and returns the types above exactly. No `any`.
> - On a Supabase error, throw with a message naming the failing query.

- [ ] **Step 2: Apply and typecheck**

```bash
node ds-apply.js "<scratchpad>/ds-task5-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear" && npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 3: Verify against the real database**

Create `scripts/check-queries.mjs`:

```js
import { listProducts, getProductBySlug, getSiteSettings, listColours } from '../src/lib/queries/products.ts';

const all = await listProducts();
console.log('products:', all.length);

const chukka = await listProducts({ category: 'chukka' });
console.log('chukka products:', chukka.length);

const sig = await listProducts({ signatureOnly: true });
console.log('signature products:', sig.length);

const one = await getProductBySlug('classic-chukka');
console.log('classic-chukka variants:', one?.variants.length, 'images:', one?.images.length);

console.log('missing slug returns:', await getProductBySlug('does-not-exist'));
console.log('settings keys:', Object.keys(await getSiteSettings()).length);
console.log('colours:', (await listColours()).length);
```

Run it:
```bash
node --env-file=.env.local --experimental-strip-types scripts/check-queries.mjs
```

Expected output, exactly:
```
products: 11
chukka products: 4
signature products: 7
classic-chukka variants: 72 images: 0
missing slug returns: null
settings keys: 6
colours: 16
```

`chukka products: 4` is style 420 plus the three signature chukkas (Buffalo Sunset,
Protea, Succulent). `images: 0` is correct at this stage — no product imagery has been
uploaded yet, which is why the Task 7 and 8 verification steps check that cards and the
gallery degrade gracefully rather than crashing on an empty array.

Any mismatch means the query layer or the seed is wrong. Do not proceed until it matches.

Delete the throwaway script once it passes.

- [ ] **Step 4: Commit**

```bash
git add caracal-footwear/src/lib/queries
git commit -m "feat(caracal): typed product query layer

Single-round-trip nested selects rather than N+1. Colour and size filters
narrow which products match without narrowing each product's returned variants,
so a PDP reached through a filtered listing still shows the full size run.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Site chrome — header and footer

**Files:**
- Create: `src/components/site/Header.tsx`, `src/components/site/Footer.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` (Task 5), `CATEGORY_SLUGS`/`CATEGORY_LABELS` (Task 2).
- Produces: `<Header />` and `<Footer />` server components.

- [ ] **Step 1: Delegate to DeepSeek**

Prompt must include Global Constraints, the design tokens, `CATEGORY_LABELS`/`CATEGORY_SLUGS`, the `getSiteSettings` signature, and:

> **Header:** sticky, `bg-canvas/90` with backdrop blur, thin `border-accent/20` bottom border. Left: wordmark `CARACAL` in heavy condensed type with `FOOTWEAR` beneath in small letter-spaced `text-muted`. Centre (desktop): Range, Signature, Story, Journal. Right: cart icon with a count badge (static `0` for now — Phase 2 wires it). Mobile: hamburger opening a full-screen `bg-canvas` overlay. Keyboard accessible, visible focus rings in `--color-accent`, `aria-expanded` on the toggle.
>
> **Footer:** `bg-surface`, four columns collapsing to one on mobile — brand blurb, Shop links, Help links (Size Guide, Care, Shipping & Returns, FAQ), Contact (phone, email and a WhatsApp link built from `whatsapp_number` as `https://wa.me/<number>`). Bottom bar: copyright, Privacy, Terms. Above it, a full-width strip: "Free delivery on orders over R1 000 · Handmade in South Africa · Sizes 4 to 15".
>
> Both are server components — no `'use client'` except on the mobile menu, which must be a separate small client component. Use token utility classes (`bg-canvas`, `text-muted`, `border-accent`) and no raw hex. Multi-paragraph text uses `space-y-4`.

- [ ] **Step 2: Apply and wire into the layout**

Update `src/app/layout.tsx` to render `<Header />`, `{children}` in a `<main>`, and `<Footer />`, with `className="grain"` on the body wrapper. Set metadata: title `Caracal Footwear — Handcrafted Vellies`, description drawn from the flyer.

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```
Open `http://localhost:3012`. Confirm: dark charcoal canvas, header sticks on scroll, mobile menu opens and closes at 390px width, WhatsApp link opens `wa.me`, every nav link is reachable by Tab with a visible focus ring.

- [ ] **Step 4: Commit**

```bash
git add caracal-footwear/src
git commit -m "feat(caracal): site header and footer

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: Range listing with filters

**Files:**
- Create: `src/components/shop/ProductCard.tsx`, `src/components/shop/RangeFilters.tsx`
- Create: `src/app/range/page.tsx`, `src/app/range/[category]/page.tsx`

**Interfaces:**
- Consumes: `listProducts`, `listColours` (Task 5); `groupVariants` (Task 3); `formatZAR` (Task 1); `categoryFromSlug`, `CATEGORY_LABELS` (Task 2).
- Produces: `<ProductCard product={ProductWithVariants} />`, `<RangeFilters colours={...} activeCategory={...} />`.

- [ ] **Step 1: Delegate to DeepSeek**

Prompt must include Global Constraints, tokens, all consumed signatures, and:

> **ProductCard:** `bg-surface` tile, rounded, image at 4:5 with `next/image` and `object-cover`. Below: product name, category label in `text-muted`, price via `formatZAR`, and a row of up to six colour dots rendered from `colour_hex` with the remainder shown as `+N`. A signature product gets a small `text-accent` "Signature" tag. Hover lifts the tile and warms the border to `--color-accent`. Whole card is one link to `/product/[slug]`. Include `alt` text.
>
> **The catalogue currently has zero uploaded images.** The card MUST NOT crash or render a broken image icon on an empty `images` array. When there is no image, render a branded placeholder: a `bg-surface` block with a faint centred caracal-head mark and the product name in `text-muted`. This is not defensive padding — it is the actual state of every product until Phase 3's admin uploads real photography.
>
> **RangeFilters:** category pills (All + the four categories), a colour dot row, a size row (4–15), and a "Signature only" toggle. **State lives entirely in URL search params** — no client state — so filtered views are shareable and server-rendered. Clicking an active filter clears it. Show a "Clear all" control when any filter is set.
>
> **`/range/page.tsx`:** server component. Reads `searchParams` (remember: in Next 16 `searchParams` is a **Promise** and must be awaited — verify against `node_modules/next/dist/docs/`). Passes filters to `listProducts`. Renders the filter bar and a responsive grid: 1 column at mobile, 2 at `sm`, 3 at `lg`, 4 at `xl`. Empty state: "No vellies match those filters" plus a clear-all link.
>
> **`/range/[category]/page.tsx`:** same, with the category locked from the route param via `categoryFromSlug`. Return `notFound()` for an unknown category. `params` is also a Promise in Next 16.
>
> Both export `generateMetadata` with a category-specific title.

- [ ] **Step 2: Apply, typecheck, build**

```bash
npx tsc --noEmit && npm run build
```
Expected: both exit 0.

If the build errors on `searchParams`/`params` typing, that is the Next 16 breaking change — await them. Fix directly.

- [ ] **Step 3: Verify in the browser**

Open `http://localhost:3012/range`. Confirm:
- 11 products render with names, `R550`, and the **branded placeholder** in place of imagery — no broken-image icons, no layout collapse.
- Clicking a category pill filters and **changes the URL**; reloading that URL keeps the filter.
- `/range/chukka` shows only chukkas; `/range/nonsense` returns 404.
- A filter combination with no matches shows the empty state, not a blank page.
- Grid reflows correctly at 390px.

- [ ] **Step 4: Commit**

```bash
git add caracal-footwear/src
git commit -m "feat(caracal): range listing with URL-driven filters

Filter state lives in search params rather than client state, so filtered
views are shareable, server-rendered and survive a reload.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 8: Product detail page

**Files:**
- Create: `src/components/product/ColourSwatches.tsx`, `SizeSelector.tsx`, `ProductGallery.tsx`, `ProductDetail.tsx`
- Create: `src/app/product/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProductBySlug`, `getSiteSettings` (Task 5); `groupVariants`, `imagesForColour` (Task 3); `variantStockState` (Task 3); `formatZAR` (Task 1).
- Produces: the PDP route. `ProductDetail` is the single client component holding selection state; the three children are presentational and take props only.

- [ ] **Step 1: Delegate to DeepSeek**

Prompt must include Global Constraints, tokens, every consumed signature, and:

> **`ProductDetail`** is the only `'use client'` component. It holds `selectedColour` and `selectedSize`, derives the active variant, and passes props down. Default the colour to the first with any stock, or the first overall if all are sold out. Size starts unselected.
>
> **`ColourSwatches`:** circular buttons filled from `colour_hex`, with the colour name shown on hover and always beneath the row. Selected gets a 2px `--color-accent` ring. A colour with zero stock in every size is dimmed and marked "Sold out" but stays selectable so the customer can still see it. `aria-pressed` on each; the group has `role="group"` and an accessible label.
>
> **`SizeSelector`:** a 4-to-15 grid. Each button shows its stock state from `variantStockState` — sold out is struck through and `disabled`, low stock gets a small `text-accent` dot. Include a "Size guide" link to `/size-guide`.
>
> **`ProductGallery`:** main image plus thumbnail strip, driven by `imagesForColour(images, selectedColour)`. Changing colour swaps the gallery and resets to the first image. Keyboard-navigable thumbnails. `next/image` with `priority` on the first image only.
>
> **Handle the empty case first, not as an afterthought.** Every product currently has zero images. With an empty array, render the same branded placeholder used by `ProductCard` at the gallery's aspect ratio and **omit the thumbnail strip entirely** — do not render an empty strip. With exactly one image, show it and omit the strip too.
>
> **PDP page:** server component, `params` is a Promise — await it. `notFound()` for an unknown slug. Two-column at `lg` (gallery left, detail right), stacked on mobile. Detail column: name, style number, price, colour swatches, size selector, an "Add to cart" button that is **disabled with the label "Coming soon"** in Phase 1, then the description in `space-y-4`, then a trust row — genuine leather · non-slip TPR sole · handmade · lead time from settings · free delivery over R1 000.
>
> Export `generateMetadata` (product name + description) and `generateStaticParams` from active product slugs.
>
> **No animation on this page** beyond CSS hover/focus transitions.

- [ ] **Step 2: Apply, typecheck, build**

```bash
npx tsc --noEmit && npm run build
```
Expected: both exit 0, and the build reports statically generated product pages.

- [ ] **Step 3: Verify in the browser**

Open a product from `/range`. Confirm:
- The gallery shows the branded placeholder with **no thumbnail strip** (zero images seeded), and clicking a colour moves the selection ring without error.
- To prove the swap logic works, insert two images against different colours in SQL, reload, and confirm the gallery changes when the colour changes:
  ```sql
  insert into product_images (product_id, colour_name, url, alt, sort_order)
  select id, 'Tan', 'https://placehold.co/800x1000/B5763A/14110F.png', 'Tan', 0
  from products where slug = 'classic-chukka';
  insert into product_images (product_id, colour_name, url, alt, sort_order)
  select id, 'Black', 'https://placehold.co/800x1000/14110F/F5F0E8.png', 'Black', 0
  from products where slug = 'classic-chukka';
  ```
  Add `placehold.co` to `images.remotePatterns` in `next.config.ts` for this check, then remove both rows and the config entry afterwards.
- Size buttons reflect stock — with everything seeded at 0, **every size shows sold out**. This is correct: set one variant's `stock_qty` to 5 in SQL and confirm that single size becomes selectable.
- "Add to cart" is visibly disabled and reads "Coming soon".
- Lead time and the R1 000 threshold come from `site_settings` — change a settings row in SQL, reload, and confirm the page reflects it.
- Layout holds at 390px; no horizontal scroll.
- Tab reaches every swatch and size button with a visible focus ring.

- [ ] **Step 4: Restore everything you changed for verification**

```sql
update product_variants set stock_qty = 0 where stock_qty = 5;
delete from product_images
where url like 'https://placehold.co/%';
```

Also revert the `placehold.co` entry in `next.config.ts`.

- [ ] **Step 5: Commit**

```bash
git add caracal-footwear/src
git commit -m "feat(caracal): product detail page with colour and size selection

Selection state is held in one client component; gallery, swatches and size
grid stay presentational. Add-to-cart is deliberately disabled until Phase 2
wires the cart, rather than shipping a button that silently does nothing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Phase 1 Definition of Done

- [ ] `npm test` passes — 25 tests.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `npm run build` exits 0.
- [ ] `/range` lists all seeded products; filters work and are shareable by URL.
- [ ] `/range/[category]` works for all four categories; unknown returns 404.
- [ ] A PDP renders, swaps images on colour change, and reflects real stock state.
- [ ] Every page verified at 390px with no horizontal scroll.
- [ ] No raw hex colours in any component — tokens only.
- [ ] No secrets committed; `.env.local` is gitignored.
- [ ] Repo pushed; Vercel preview deploys green.

---

## Roadmap — remaining phases

Each gets its own plan document before implementation starts.

**Phase 2 — Commerce.** Zustand cart with localStorage persistence · `/cart` · `/checkout` guest form · `POST /api/checkout` with server-side price re-validation · PayFast signature generation · `POST /api/payfast/notify` ITN handler (signature + source-IP + amount verification, idempotent on `payfast_payment_id`, atomic stock decrement, `stock_conflict` path) · Resend order emails to customer and Donald · success/cancelled pages. *This phase handles money and is the highest-risk work in the project — it gets the most verification, including a sandbox end-to-end run and a concurrent-order test proving stock cannot go negative.*

**Phase 3 — Admin back-office.** Supabase Auth gate · product CRUD · **bulk variant generator** and **spreadsheet stock grid** (without these Donald abandons the admin) · image multi-upload with auto-optimize and bulk delete per the gallery standard · order list and status management · settings editor.

**Phase 4 — Cinematic layer & content.** GSAP ScrollTrigger homepage (nine beats per spec §6) · `/signature` collection landing · `/story` · `/size-guide` · `/care` · `/contact` with honeypot and timing anti-bot · `/faq` · `/shipping-returns` · `/privacy` · `/terms`. Motion on `/`, `/signature` and `/story` only; `prefers-reduced-motion` honoured. **Ends with a `design-self-audit` run.**

**Phase 5 — Reviews & Field Journal.** Review submission → moderation queue → PDP display · journal generation via the Anthropic API with **both** a cron and a manual "Generate now" button · approve queue · publish cron · Supabase keep-alive GitHub Action.

---

## Open questions carried from the spec

Tracked in spec §10. None block Phase 1:

1. **Price R550 or R1,550?** Seeded at R550, stored per-product — a one-line admin edit either way.
2. **Caracal Lodge connection?** Affects `/story` copy in Phase 4 only.
3. **Real style and price list.** Placeholder catalogue is replaceable through the Phase 3 admin.
4. **Company registration details** for Terms and Privacy — needed by Phase 4.
5. **Opening stock quantities** — needed before launch, not before Phase 2.
6. **Delivery fee under R1,000** — defaulted to R99 in `site_settings`.
