# Caracal Footwear — Phase 2: Commerce — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A shopper can add a vellie to cart, check out as a guest, pay via PayFast, and have stock decrement exactly once — with an order that cannot land in a "paid but stock's gone" state undetected, and correctly cannot be double-decremented if PayFast retries its notification.

**Architecture:** Zustand cart (client-only, localStorage-persisted) feeds a guest checkout form. `POST /api/checkout` re-derives every price and stock check server-side and creates a `pending` order, then signs a PayFast payload. `POST /api/payfast/notify` (the ITN webhook) is the only place money actually moves an order to `paid` — it verifies the notification four ways, then calls a single atomic Postgres function that decrements stock under row locks and reports back whether every line could be filled. If not, the order becomes `stock_conflict` — money has landed, stock hasn't, and that state is designed to be *visible*, not swallowed.

**Tech Stack:** Next.js 16.3.0 · React 19.2.4 · Zustand 5 (cart) · Supabase Postgres (RPC for atomic decrement) · PayFast (payment + ITN) · Resend (order email)

## Global Constraints

Every task's requirements implicitly include this section.

- **Next.js is version 16.3.0 — this is NOT the Next.js in your training data.** Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`. `params`/`searchParams` are Promises and must be awaited. Folders prefixed `_` are excluded from routing.
- **Never write secret values into any file.** `.env.local` only, gitignored. A PreToolUse hook blocks edits to `.env*` files — when a key is needed, tell the user which variable to set rather than attempting to write it.
- **All money is integer cents.** Never floats, never `numeric`. Reuse `formatZAR`, `randToCents`, `centsToRand` from `src/lib/money.ts` (Phase 1) — do not reimplement.
- **Reuse, do not reimplement, Phase 1's pure logic:** `calculateDelivery(subtotalCents, { freeThreshold, fee }): number` from `src/lib/delivery.ts`; `groupVariants`/`imagesForColour` from `src/lib/catalogue.ts`; `getSiteSettings(): Promise<Record<string,string>>` from `src/lib/queries/products.ts`.
- **Design tokens are fixed** and used by name, never raw hex: `canvas #14110F` · `surface #1E1A17` · `accent #C25A1E` · `accent-hi #D96B2A` · `tan #B5763A` · `cognac #A8542A` · `camel #C89660` · `text #F5F0E8` · `muted #A39A90`. `text-accent` is never used for body copy on canvas (fails AA) — display type, rules, borders and icons only.
- **Stock decrements happen ONLY inside `decrement_stock_for_order` (Task 4), called ONLY from the PayFast ITN handler (Task 7).** Never at add-to-cart, never at checkout creation. This is the single most important invariant in this phase.
- **Prices are re-validated server-side at checkout.** The cart's `priceCents` is a display snapshot only — `POST /api/checkout` re-fetches every variant's real price from the database and ignores whatever the client sent.
- **The ITN handler must be idempotent** on order status, and **must always return 200 to PayFast once the notification itself is genuine** — a non-200 makes PayFast retry a payment that already succeeded.
- **Checkout is a DB-writing, emailing form** — per the site's form-bot-protection standard it gets a honeypot field plus a submission-timing check (no CAPTCHA, no extra infra), same pattern as the Lublaw `ContactForm`.
- Multi-paragraph body copy uses `space-y-4`.
- Commit after every task. Do not batch commits.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `supabase/migrations/0002_orders.sql` | `orders`, `order_items` tables. RLS enabled, no public policies — service-role only. |
| `supabase/migrations/0003_stock_decrement.sql` | The atomic `decrement_stock_for_order` Postgres function. |
| `src/lib/orders.ts` | `OrderStatus` vocabulary, labels, `generateOrderNumber()`. |
| `src/lib/supabase/admin.ts` | Service-role Supabase client. Server-only, bypasses RLS. |
| `src/lib/cart/store.ts` | Zustand cart store, localStorage-persisted. |
| `src/lib/checkout.ts` | Pure: derives order lines and totals from cart + live variant data; anti-bot check. |
| `src/lib/payfast.ts` | Signature generation/verification, ITN host validation, payment payload builder. |
| `src/lib/resend.ts` | Thin Resend wrapper. Lazy-init, never throws. |
| `src/lib/email/templates.ts` | Inline-styled HTML email bodies. |
| `src/lib/email/send.ts` | Loads an order, sends the right emails. Best-effort — never throws. |
| `src/components/site/CartBadge.tsx` | Client component: cart item count in the header. |
| `src/components/product/ProductDetail.tsx` | *(modify)* wire the real Add to Cart action. |
| `src/app/cart/page.tsx` | Server wrapper — fetches site settings. |
| `src/components/cart/CartView.tsx` | Client: cart list, qty steppers, subtotal, delivery estimate. |
| `src/app/checkout/page.tsx` | Guest checkout form. |
| `src/components/checkout/PayFastRedirectForm.tsx` | Client: auto-submitting hidden form to PayFast. |
| `src/app/api/checkout/route.ts` | Validates, prices, creates the order, signs the PayFast payload. |
| `src/app/api/payfast/notify/route.ts` | ITN webhook. The highest-risk file in the project. |
| `src/app/api/payfast/return/route.ts` | PayFast's browser-redirect target — resolves to `/checkout/success`. |
| `src/app/checkout/success/page.tsx` | Order confirmation, status-aware. |
| `src/app/checkout/cancelled/page.tsx` | Cancelled-at-PayFast page. |
| `src/components/checkout/ClearCartOnMount.tsx` | Client: clears the Zustand cart, only rendered when an order is confirmed `paid`. |

---

## Task 1: Order schema, status vocabulary, admin client

**Files:**
- Create: `supabase/migrations/0002_orders.sql`
- Create: `src/lib/orders.ts`
- Create: `src/lib/orders.test.ts`
- Create: `src/lib/supabase/admin.ts`

**Interfaces:**
- Consumes: nothing beyond Phase 1's schema (`product_variants`).
- Produces: `OrderStatus`, `ORDER_STATUS_LABELS: Record<OrderStatus, string>`, `generateOrderNumber(): string` from `src/lib/orders.ts`. `createAdminClient(): SupabaseClient` from `src/lib/supabase/admin.ts`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0002_orders.sql`:

```sql
-- Caracal Footwear: orders schema.
-- Status vocabulary, per the design spec:
--   pending        -- created at checkout, awaiting PayFast
--   paid           -- ITN confirmed payment AND stock was decremented cleanly
--   failed         -- PayFast reported a failed payment
--   cancelled      -- PayFast reported a cancelled payment
--   stock_conflict -- ITN confirmed payment but a line item had insufficient
--                     stock; money has landed, stock has not -- this needs a
--                     human (Donald or a refund), not a silent drop
--   fulfilled       -- Donald has shipped/handed over the order (Phase 3 admin)

create type order_status as enum
  ('pending', 'paid', 'failed', 'cancelled', 'stock_conflict', 'fulfilled');

create table orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,
  customer_name      text not null,
  email              text not null,
  phone              text not null default '',
  address_line1      text not null,
  address_line2      text not null default '',
  city               text not null,
  province           text not null,
  postal_code        text not null,
  subtotal           integer not null check (subtotal >= 0),
  delivery_fee       integer not null check (delivery_fee >= 0),
  total              integer not null check (total >= 0),
  status             order_status not null default 'pending',
  payfast_payment_id text,
  payment_data       jsonb,
  created_at         timestamptz not null default now(),
  paid_at            timestamptz
);

-- A given PayFast payment must map to at most one order.
create unique index orders_payfast_payment_id_idx
  on orders (payfast_payment_id) where payfast_payment_id is not null;

create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  variant_id   uuid not null references product_variants(id),
  -- Snapshots: a later price or name change must never rewrite order history.
  product_name text not null,
  colour       text not null,
  size         integer not null,
  qty          integer not null check (qty > 0),
  unit_price   integer not null check (unit_price >= 0)
);

create index order_items_order_idx   on order_items (order_id);
create index order_items_variant_idx on order_items (variant_id);

-- No accounts exist in v1, so there is no legitimate anon/public read path
-- for orders -- every access is server-side (checkout route, ITN route, the
-- confirmation page, and later the Phase 3 admin), all via the service-role
-- client. RLS is enabled with NO policies: default-deny, not public-read.
alter table orders      enable row level security;
alter table order_items enable row level security;
```

- [ ] **Step 2: Apply the migration**

Paste into the Supabase SQL editor for the Caracal project and run it.

Verify:
```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('orders', 'order_items');
```
Expected: both rows returned.

```sql
-- must fail: RLS default-deny, no policies exist yet
set role anon;
select * from orders;
reset role;
```
Expected: `permission denied for table orders` (RLS blocks it — service-role bypasses RLS entirely, so this only proves the anon path is closed).

- [ ] **Step 3: Write the failing test for the order number format**

Create `src/lib/orders.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateOrderNumber, ORDER_STATUS_LABELS } from './orders';

describe('generateOrderNumber', () => {
  it('matches CF + 6-digit date + dash + 4-digit random', () => {
    expect(generateOrderNumber()).toMatch(/^CF\d{6}-\d{4}$/);
  });

  it('produces different numbers across calls', () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    // Collision odds are 1 in 9000 -- not flaky in practice, and if it ever
    // does collide it's telling us something real about the random range.
    expect(a).not.toBe(b);
  });
});

describe('ORDER_STATUS_LABELS', () => {
  it('has a label for every status', () => {
    const statuses = ['pending', 'paid', 'failed', 'cancelled', 'stock_conflict', 'fulfilled'] as const;
    for (const s of statuses) {
      expect(ORDER_STATUS_LABELS[s]).toBeTruthy();
    }
  });
});
```

- [ ] **Step 4: Run the tests to verify they fail**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npm test -- orders
```
Expected: FAIL — cannot resolve `./orders`.

- [ ] **Step 5: Implement `src/lib/orders.ts`**

```ts
/**
 * Order status vocabulary. `paid` and `stock_conflict` are set ONLY by the
 * PayFast ITN handler (src/app/api/payfast/notify/route.ts) -- never by hand,
 * never by the checkout route. See that file for why.
 */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'stock_conflict'
  | 'fulfilled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Payment received',
  failed: 'Payment failed',
  cancelled: 'Cancelled',
  stock_conflict: 'Stock conflict',
  fulfilled: 'Fulfilled',
};

/** Human-facing order reference, e.g. CF260805-4821. */
export function generateOrderNumber(): string {
  const d = new Date();
  const stamp =
    `${d.getFullYear() % 100}` +
    `${String(d.getMonth() + 1).padStart(2, '0')}` +
    `${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CF${stamp}-${rand}`;
}
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
npm test -- orders
```
Expected: PASS, 3 tests.

- [ ] **Step 7: Write the admin Supabase client**

Create `src/lib/supabase/admin.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client -- BYPASSES ROW LEVEL SECURITY.
 *
 * Server-only: API routes that write orders/stock, and later the Phase 3
 * admin. NEVER import this into a client component or a file that could end
 * up in a client bundle -- the key it reads has no RLS to fall back on.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Set them in .env.local.',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

- [ ] **Step 8: Verify it typechecks**

```bash
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 9: Commit**

```bash
git add caracal-footwear/supabase caracal-footwear/src/lib/orders.ts caracal-footwear/src/lib/orders.test.ts caracal-footwear/src/lib/supabase/admin.ts
git commit -m "feat(caracal): orders schema, status vocabulary, admin client

RLS on orders/order_items is enabled with no policies -- default-deny, not
public-read. There is no accounts feature in v1, so every legitimate access
path (checkout, the ITN handler, the confirmation page, the future admin)
already goes through the service-role client.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Zustand cart store

**Files:**
- Create: `src/lib/cart/store.ts`
- Create: `src/lib/cart/store.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  interface CartItem {
    variantId: string;
    productSlug: string;
    productName: string;
    colour: string;
    size: number;
    priceCents: number; // display snapshot only -- never trusted server-side
    qty: number;
  }
  useCartStore: {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
    removeItem: (variantId: string) => void;
    updateQty: (variantId: string, qty: number) => void;
    clear: () => void;
  }
  cartSubtotalCents(items: CartItem[]): number
  cartItemCount(items: CartItem[]): number
  ```

- [ ] **Step 1: Write the failing tests**

Create `src/lib/cart/store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, cartSubtotalCents, cartItemCount } from './store';

const tan9 = {
  variantId: 'v-tan-9',
  productSlug: 'classic-chukka',
  productName: 'Classic Chukka',
  colour: 'Tan',
  size: 9,
  priceCents: 55000,
};

const black10 = {
  variantId: 'v-black-10',
  productSlug: 'classic-chukka',
  productName: 'Classic Chukka',
  colour: 'Black',
  size: 10,
  priceCents: 55000,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe('addItem', () => {
  it('adds a new line at qty 1 by default', () => {
    useCartStore.getState().addItem(tan9);
    expect(useCartStore.getState().items).toEqual([{ ...tan9, qty: 1 }]);
  });

  it('increments qty when the same variant is added again', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().addItem(tan9, 2);
    expect(useCartStore.getState().items).toEqual([{ ...tan9, qty: 3 }]);
  });

  it('keeps different variants as separate lines', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().addItem(black10);
    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

describe('updateQty', () => {
  it('sets the quantity for a line', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().updateQty(tan9.variantId, 5);
    expect(useCartStore.getState().items[0].qty).toBe(5);
  });

  it('clamps quantity to the 1-20 range', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().updateQty(tan9.variantId, 999);
    expect(useCartStore.getState().items[0].qty).toBe(20);
  });

  it('removes the line when qty drops to zero or below', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().updateQty(tan9.variantId, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('removeItem', () => {
  it('removes only the matching line', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().addItem(black10);
    useCartStore.getState().removeItem(tan9.variantId);
    expect(useCartStore.getState().items).toEqual([{ ...black10, qty: 1 }]);
  });
});

describe('clear', () => {
  it('empties the cart', () => {
    useCartStore.getState().addItem(tan9);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe('cartSubtotalCents', () => {
  it('sums price times quantity across lines', () => {
    const items = [{ ...tan9, qty: 2 }, { ...black10, qty: 1 }];
    expect(cartSubtotalCents(items)).toBe(55000 * 2 + 55000);
  });

  it('is zero for an empty cart', () => {
    expect(cartSubtotalCents([])).toBe(0);
  });
});

describe('cartItemCount', () => {
  it('sums quantities, not line count', () => {
    const items = [{ ...tan9, qty: 2 }, { ...black10, qty: 3 }];
    expect(cartItemCount(items)).toBe(5);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test -- cart
```
Expected: FAIL — cannot resolve `./store`.

- [ ] **Step 3: Implement the store**

Create `src/lib/cart/store.ts`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productSlug: string;
  productName: string;
  colour: string;
  size: number;
  /** Display snapshot only. Checkout re-fetches the real price server-side. */
  priceCents: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clear: () => void;
}

/** Sane UI bound so a fat-fingered quantity can't produce an absurd order.
 *  Not a business rule -- the real limit is whatever stock allows, enforced
 *  server-side at checkout and, atomically, at the ITN. */
const MAX_LINE_QTY = 20;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, qty: Math.min(MAX_LINE_QTY, i.qty + qty) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: Math.min(MAX_LINE_QTY, qty) }] };
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      updateQty: (variantId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.variantId !== variantId) };
          }
          const clamped = Math.min(MAX_LINE_QTY, Math.floor(qty));
          return {
            items: state.items.map((i) =>
              i.variantId === variantId ? { ...i, qty: clamped } : i,
            ),
          };
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'caracal-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npm test -- cart
```
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add caracal-footwear/src/lib/cart
git commit -m "feat(caracal): zustand cart store, localStorage-persisted

priceCents on a cart line is a display snapshot only -- POST /api/checkout
(Task 5) re-fetches every price from the database and never trusts it.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Wire Add to Cart, header badge, and the cart page

**Files:**
- Modify: `src/components/product/ProductDetail.tsx`
- Create: `src/components/site/CartBadge.tsx`
- Modify: `src/components/site/Header.tsx`
- Create: `src/components/cart/CartView.tsx`
- Create: `src/app/cart/page.tsx`

**Interfaces:**
- Consumes: `useCartStore`, `cartSubtotalCents`, `cartItemCount`, `CartItem` (Task 2); `formatZAR` (Phase 1 `src/lib/money.ts`); `calculateDelivery` (Phase 1 `src/lib/delivery.ts`); `getSiteSettings` (Phase 1 `src/lib/queries/products.ts`).
- Produces: a working cart the rest of Phase 2 reads from.

- [ ] **Step 1: Replace the disabled button in `ProductDetail.tsx`**

Read the current file first — it already holds `selectedColour`, `selectedSize`, `activeGroup`, `priceCents` and the disabled "Coming soon" button. Replace only the button block and add the cart wiring:

Add to the imports at the top of `src/components/product/ProductDetail.tsx`:

```ts
import { useState as useState2 } from 'react'; // remove if useState is already imported once; see note below
import { useCartStore } from '@/lib/cart/store';
```

(Note for the implementer: `useState` is already imported once at the top of this file — do not import it twice. Add `useCartStore` to the existing `@/lib/cart/store` import list and skip the `useState2` alias above; it exists in this plan only to flag the collision.)

Add local state and a handler inside the component, after the existing `handleColourChange` function:

```ts
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const selectedSizeOption = activeGroup?.sizes.find((s) => s.size === selectedSize);

  const handleAddToCart = () => {
    if (!activeGroup || !selectedSizeOption) return;
    addItem({
      variantId: selectedSizeOption.variantId,
      productSlug: product.slug,
      productName: product.name,
      colour: activeGroup.colourName,
      size: selectedSizeOption.size,
      priceCents: selectedSizeOption.priceCents,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };
```

Replace the existing disabled button:

```tsx
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Online checkout is coming soon"
          className="w-full bg-accent text-canvas py-3 rounded-md text-sm uppercase tracking-[0.15em] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Coming soon
        </button>
```

with:

```tsx
        <button
          type="button"
          disabled={!selectedSizeOption}
          onClick={handleAddToCart}
          className="w-full bg-accent text-canvas py-3 rounded-md text-sm uppercase tracking-[0.15em] transition-colors hover:bg-accent-hi disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent"
        >
          {justAdded ? 'Added ✓' : selectedSizeOption ? 'Add to cart' : 'Select a size'}
        </button>
```

- [ ] **Step 2: Verify it typechecks**

```bash
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 3: Create the header cart badge**

Create `src/components/site/CartBadge.tsx`:

```tsx
'use client';

import { useCartStore, cartItemCount } from '@/lib/cart/store';

/**
 * A tiny client island inside the otherwise-server Header. Reads localStorage
 * via the persisted Zustand store, so this must stay a client component --
 * it cannot be folded into Header.tsx itself.
 */
export default function CartBadge() {
  const count = useCartStore((s) => cartItemCount(s.items));

  return (
    <>
      <span className="sr-only">, {count} items</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-canvas text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </>
  );
}
```

- [ ] **Step 4: Wire it into the Header**

In `src/components/site/Header.tsx`, replace the cart `Link` block:

```tsx
          <Link
            href="/cart"
            className="relative p-1 text-text hover:text-accent transition-colors"
            aria-label="Cart, 0 items"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-accent text-canvas text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
```

with:

```tsx
          <Link
            href="/cart"
            className="relative p-1 text-text hover:text-accent transition-colors"
            aria-label="Cart"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <CartBadge />
          </Link>
```

Add the import at the top:

```ts
import CartBadge from './CartBadge';
```

Header stays a server component — only `CartBadge` is a client island.

- [ ] **Step 5: Build the cart view (client)**

Create `src/components/cart/CartView.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useCartStore, cartSubtotalCents } from '@/lib/cart/store';
import { formatZAR } from '@/lib/money';
import { calculateDelivery } from '@/lib/delivery';

interface Props {
  deliverySettings: { freeThreshold: number; fee: number };
}

export default function CartView({ deliverySettings }: Props) {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-text">Your cart is empty.</p>
        <Link
          href="/range"
          className="mt-4 inline-block text-sm text-text underline underline-offset-4"
        >
          Shop the range
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotalCents(items);
  const delivery = calculateDelivery(subtotal, deliverySettings);
  const total = subtotal + delivery;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <ul className="lg:col-span-2 space-y-6" aria-label="Cart items">
        {items.map((item) => (
          <li
            key={item.variantId}
            className="flex items-center justify-between gap-4 border-b border-text/10 pb-6"
          >
            <div>
              <Link href={`/product/${item.productSlug}`} className="text-text hover:text-accent">
                {item.productName}
              </Link>
              <p className="text-xs text-muted mt-1">
                {item.colour} · Size {item.size}
              </p>
              <p className="text-sm text-text mt-1">{formatZAR(item.priceCents)}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-text/20 rounded-md">
                <button
                  type="button"
                  onClick={() => updateQty(item.variantId, item.qty - 1)}
                  aria-label={`Decrease quantity of ${item.productName}, ${item.colour}, size ${item.size}`}
                  className="w-8 h-8 text-text hover:text-accent"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm text-text" aria-live="polite">
                  {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => updateQty(item.variantId, item.qty + 1)}
                  aria-label={`Increase quantity of ${item.productName}, ${item.colour}, size ${item.size}`}
                  className="w-8 h-8 text-text hover:text-accent"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                aria-label={`Remove ${item.productName}, ${item.colour}, size ${item.size}`}
                className="text-xs text-muted hover:text-text underline underline-offset-4"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="bg-surface rounded-lg p-6 h-fit space-y-4">
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span>{formatZAR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted">
          <span>Delivery</span>
          <span>{delivery === 0 ? 'Free' : formatZAR(delivery)}</span>
        </div>
        <div className="flex justify-between text-text font-medium border-t border-text/10 pt-4">
          <span>Total</span>
          <span>{formatZAR(total)}</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full text-center bg-accent text-canvas py-3 rounded-md text-sm uppercase tracking-[0.15em] hover:bg-accent-hi transition-colors"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Build the server wrapper page**

Create `src/app/cart/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries/products';
import CartView from '@/components/cart/CartView';

export const metadata: Metadata = { title: 'Your Cart' };

export default async function CartPage() {
  const settings = await getSiteSettings();
  const deliverySettings = {
    freeThreshold: Number(settings.delivery_free_threshold),
    fee: Number(settings.delivery_fee),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <h1 className="display rule-accent text-4xl sm:text-6xl mb-10">CART</h1>
      <CartView deliverySettings={deliverySettings} />
    </div>
  );
}
```

- [ ] **Step 7: Verify, typecheck, build**

```bash
npx tsc --noEmit && npm run build
```
Expected: both exit 0.

- [ ] **Step 8: Verify in the browser**

```bash
npm run dev
```
Open a PDP, select a colour and size, click "Add to cart" — button reads "Added ✓" for 1.5s, header badge shows `1`. Add a second size — badge shows `2`, cart page lists two lines. Adjust quantity with the +/− steppers, confirm subtotal and delivery update live. Remove a line, confirm the empty state appears when the cart is emptied. Reload the page — cart contents survive (localStorage persistence). Verify at 390px width — no overflow.

- [ ] **Step 9: Commit**

```bash
git add caracal-footwear/src
git commit -m "feat(caracal): wire add-to-cart, header badge, cart page

Add to cart is disabled until a size is selected -- sold-out sizes are
already unselectable in SizeSelector, so a selected size is always in stock
at the moment of adding. Real availability is re-checked server-side at
checkout regardless.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: PayFast integration + atomic stock decrement

**Files:**
- Create: `src/lib/payfast.ts`
- Create: `supabase/migrations/0003_stock_decrement.sql`
- Modify: `.env.local.example`

**Interfaces:**
- Consumes: nothing from earlier Phase 2 tasks.
- Produces:
  ```ts
  class PayFastService {
    mode: 'sandbox' | 'production';
    getPaymentUrl(): string;
    generateSignature(data: Record<string,string>, passphrase?: string): string;
    verifySignature(data: Record<string,string>, signature: string): boolean;
    createPaymentData(params: {
      orderId: string; amount: number; customerFirstName: string;
      customerLastName: string; customerEmail: string; customerPhone?: string;
      itemName: string; itemDescription?: string;
    }): Record<string, string>;
    isValidRequestIp(ip: string | null): Promise<boolean>;
    validateWithPayFast(rawBody: string): Promise<boolean>;
  }
  export const payfast: PayFastService;
  ```
  Postgres function `decrement_stock_for_order(p_order_id uuid) returns table(ok boolean, failed_variant_ids uuid[])`, callable via `admin.rpc('decrement_stock_for_order', { p_order_id })`.

- [ ] **Step 1: Write `src/lib/payfast.ts`**

Ported from the proven `dianas-bulbinella` implementation (`src/lib/payfast.ts`) with Caracal's own env var defaults and port:

```ts
import crypto from 'crypto';
import dns from 'dns/promises';

/**
 * PayFast integration. The signature logic is ported from the dianas-bulbinella
 * and aloe-signs implementations -- field ORDER (insertion order, not
 * alphabetical) and the PHP-style urlencode are both load-bearing and were
 * corrected there after live failures. Do not "tidy" them.
 */

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: 'sandbox' | 'production';
  siteUrl: string;
}

/** PayFast's documented ITN source hosts. */
const PAYFAST_HOSTS = [
  'www.payfast.co.za',
  'sandbox.payfast.co.za',
  'w1w.payfast.co.za',
  'w2w.payfast.co.za',
];

export class PayFastService {
  private config: PayFastConfig;

  constructor() {
    this.config = {
      // Defaults are PayFast's public sandbox credentials -- safe to ship,
      // they only work against the sandbox endpoint.
      merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
      merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
      passphrase: process.env.PAYFAST_PASSPHRASE || '',
      mode: (process.env.PAYFAST_MODE as 'sandbox' | 'production') || 'sandbox',
      siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3012'),
    };
  }

  get mode() {
    return this.config.mode;
  }

  getPaymentUrl(): string {
    return this.config.mode === 'sandbox'
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }

  private getValidateUrl(): string {
    return this.config.mode === 'sandbox'
      ? 'https://sandbox.payfast.co.za/eng/query/validate'
      : 'https://www.payfast.co.za/eng/query/validate';
  }

  /**
   * URL-encode to match PHP's urlencode() exactly -- PayFast's reference
   * signature implementation is PHP. encodeURIComponent leaves ! ~ * ' ( )
   * unescaped and uses %20 for spaces; PHP uses + and escapes those.
   */
  private pfUrlEncode(value: string): string {
    return encodeURIComponent(value)
      .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
      .replace(/%20/g, '+');
  }

  /**
   * MD5 signature over the fields in INSERTION order (PayFast's documented
   * process-page order), excluding blanks, with the passphrase appended last.
   */
  generateSignature(data: Record<string, string>, passphrase?: string): string {
    const pfParamString = Object.keys(data)
      .filter((key) => data[key] !== '' && data[key] !== undefined && data[key] !== null)
      .map((key) => `${key}=${this.pfUrlEncode(String(data[key]).trim())}`)
      .join('&');

    const stringToHash = passphrase
      ? `${pfParamString}&passphrase=${this.pfUrlEncode(passphrase.trim())}`
      : pfParamString;

    return crypto.createHash('md5').update(stringToHash).digest('hex');
  }

  /** Verify the signature on an inbound ITN payload (signature already removed). */
  verifySignature(data: Record<string, string>, signature: string): boolean {
    const calculated = this.generateSignature(data, this.config.passphrase);
    return calculated === signature;
  }

  /** Build the signed field set the browser POSTs to PayFast. */
  createPaymentData(params: {
    orderId: string;
    amount: number;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone?: string;
    itemName: string;
    itemDescription?: string;
  }): Record<string, string> {
    const data: Record<string, string> = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: `${this.config.siteUrl}/api/payfast/return?orderId=${params.orderId}`,
      cancel_url: `${this.config.siteUrl}/checkout/cancelled`,
      notify_url: `${this.config.siteUrl}/api/payfast/notify`,
      name_first: params.customerFirstName,
      name_last: params.customerLastName,
      email_address: params.customerEmail,
    };

    if (params.customerPhone) data.cell_number = params.customerPhone;

    data.m_payment_id = params.orderId;
    data.amount = params.amount.toFixed(2);
    data.item_name = params.itemName;
    if (params.itemDescription) data.item_description = params.itemDescription;

    const signature = this.generateSignature(data, this.config.passphrase);
    return { ...data, signature };
  }

  /**
   * Confirm the ITN really came from a PayFast host. Resolves PayFast's
   * published hostnames and checks the request IP is among them.
   */
  async isValidRequestIp(ip: string | null): Promise<boolean> {
    if (!ip) return false;
    const resolved = await Promise.all(
      PAYFAST_HOSTS.map(async (host) => {
        try {
          return await dns.resolve4(host);
        } catch {
          return [] as string[];
        }
      }),
    );
    return resolved.flat().includes(ip);
  }

  /**
   * Server-to-server postback: echo the ITN payload back to PayFast and
   * require "VALID". The strongest guarantee the notification is genuine.
   */
  async validateWithPayFast(rawBody: string): Promise<boolean> {
    try {
      const res = await fetch(this.getValidateUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: rawBody,
      });
      const text = (await res.text()).trim();
      return text.toUpperCase().startsWith('VALID');
    } catch (e) {
      console.error('[payfast] postback validation failed', e);
      return false;
    }
  }
}

export const payfast = new PayFastService();
```

- [ ] **Step 2: Add PayFast/site env vars to the example file**

Append to `.env.local.example`:

```
# PayFast. Sandbox defaults are baked into src/lib/payfast.ts, so these are
# only required for production or to use your own sandbox test account.
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_MODE=sandbox

# Used to build PayFast's return/cancel/notify URLs and links in emails.
NEXT_PUBLIC_SITE_URL=http://localhost:3012
```

- [ ] **Step 3: Verify it typechecks**

```bash
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 4: Write the atomic stock-decrement migration**

Create `supabase/migrations/0003_stock_decrement.sql`:

```sql
-- Atomic, race-free stock decrement for a paid order.
--
-- Called ONLY from the PayFast ITN handler via the service-role client, so
-- RLS is bypassed at the connection level and this function does not need
-- SECURITY DEFINER.
--
-- A single RPC call executes as one Postgres statement, which is always one
-- transaction. Pass 1 locks every variant row this order touches with
-- SELECT ... FOR UPDATE and checks availability; pass 2 performs the
-- decrements. Because the locks from pass 1 are held for the rest of the
-- transaction, a concurrent call for the same variant blocks at its own
-- FOR UPDATE until this call's transaction ends, then re-reads the
-- now-updated stock_qty -- so two orders racing for the last unit cannot
-- both succeed, and stock_qty cannot go negative.
--
-- If ANY line is short, NOTHING is decremented (ok=false, failed_variant_ids
-- lists the short lines) -- the caller marks the order stock_conflict rather
-- than partially fulfilling it.
create or replace function decrement_stock_for_order(p_order_id uuid)
returns table (ok boolean, failed_variant_ids uuid[])
language plpgsql
as $$
declare
  v_failed uuid[] := '{}';
  v_variant_id uuid;
  v_needed integer;
  v_available integer;
begin
  for v_variant_id, v_needed in
    select oi.variant_id, oi.qty from order_items oi where oi.order_id = p_order_id
  loop
    select stock_qty into v_available
    from product_variants
    where id = v_variant_id
    for update;

    if v_available is null or v_available < v_needed then
      v_failed := array_append(v_failed, v_variant_id);
    end if;
  end loop;

  if array_length(v_failed, 1) > 0 then
    return query select false, v_failed;
    return;
  end if;

  update product_variants pv
  set stock_qty = pv.stock_qty - oi.qty
  from order_items oi
  where oi.order_id = p_order_id and pv.id = oi.variant_id;

  return query select true, '{}'::uuid[];
end;
$$;
```

- [ ] **Step 5: Apply the migration**

Paste into the Supabase SQL editor and run it.

Verify: `select proname from pg_proc where proname = 'decrement_stock_for_order';` returns one row.

- [ ] **Step 6: Verify the function single-threaded, both branches**

Run in the Supabase SQL editor (uses `classic-chukka`'s Tan/size 9 variant seeded at Phase 1). This deliberately looks up the order by its unique `order_number` in every statement rather than capturing the generated id in a variable — the Supabase web SQL editor runs plain Postgres, not `psql`, so `psql` meta-commands like `\gset` are not available here:

```sql
-- Set up a throwaway order needing more than is in stock.
update product_variants set stock_qty = 1
where product_id = (select id from products where slug = 'classic-chukka')
  and colour_name = 'Tan' and size = 9;

insert into orders (order_number, customer_name, email, address_line1, city, province, postal_code, subtotal, delivery_fee, total)
values ('TEST-CONFLICT', 'Test', 't@example.com', '1 Test St', 'Cape Town', 'Western Cape', '8001', 55000, 9900, 64900);

insert into order_items (order_id, variant_id, product_name, colour, size, qty, unit_price)
select (select id from orders where order_number = 'TEST-CONFLICT'), id, 'Classic Chukka', 'Tan', 9, 2, 55000  -- needs 2, only 1 in stock
from product_variants where product_id = (select id from products where slug = 'classic-chukka') and colour_name = 'Tan' and size = 9;

select * from decrement_stock_for_order((select id from orders where order_number = 'TEST-CONFLICT'));
```
Expected: `ok = false`, `failed_variant_ids` has one entry. Confirm stock is untouched: `select stock_qty from product_variants where product_id = (select id from products where slug='classic-chukka') and colour_name='Tan' and size=9;` → still `1`.

```sql
-- Now the success path: same order, but drop the requested qty to what's available.
update order_items set qty = 1 where order_id = (select id from orders where order_number = 'TEST-CONFLICT');
select * from decrement_stock_for_order((select id from orders where order_number = 'TEST-CONFLICT'));
```
Expected: `ok = true`, `failed_variant_ids = '{}'`. Confirm: stock is now `0`.

Clean up:
```sql
delete from orders where order_number = 'TEST-CONFLICT';
update product_variants set stock_qty = 0
where product_id = (select id from products where slug = 'classic-chukka') and colour_name = 'Tan' and size = 9;
```

The full concurrent-race version of this test (two simultaneous calls) is Task 9, Step 3 — this step only proves the single-threaded logic is correct before layering concurrency on top of it.

- [ ] **Step 7: Commit**

```bash
git add caracal-footwear/src/lib/payfast.ts caracal-footwear/supabase/migrations/0003_stock_decrement.sql caracal-footwear/.env.local.example
git commit -m "feat(caracal): PayFast integration lib and atomic stock decrement

decrement_stock_for_order locks every touched variant with SELECT FOR UPDATE
before deciding anything, so two orders racing for the last unit of a variant
cannot both succeed and stock_qty cannot go negative -- verified single-
threaded here (both the success and conflict path); the concurrent version
of this test is Task 9.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: `POST /api/checkout`

**Files:**
- Create: `src/lib/checkout.ts`
- Create: `src/lib/checkout.test.ts`
- Create: `src/app/api/checkout/route.ts`

**Interfaces:**
- Consumes: `createAdminClient` (Task 1); `generateOrderNumber` (Task 1); `payfast` (Task 4); `calculateDelivery` (Phase 1); `getSiteSettings` (Phase 1).
- Produces:
  ```ts
  interface CheckoutLine { variantId: string; qty: number }
  interface DerivedOrderLine {
    variantId: string; productName: string; colour: string; size: number;
    qty: number; unitPriceCents: number; lineTotalCents: number;
  }
  type CheckoutError =
    | { type: 'empty_cart' }
    | { type: 'unavailable'; productName: string }
    | { type: 'insufficient_stock'; productName: string };
  deriveOrderLines(cartLines, variants: Map<string, AvailableVariant>):
    { lines: DerivedOrderLine[] } | { error: CheckoutError }
  orderTotals(lines: DerivedOrderLine[], delivery: {freeThreshold:number;fee:number}):
    { subtotalCents: number; deliveryCents: number; totalCents: number }
  checkAntiBot(honeypot: string, formRenderedAtMs: number, nowMs?: number): boolean
  ```
  Route produces: `POST /api/checkout` → `{ success: true, order: {id, orderNumber, total}, payfastData, payfastUrl }` on success.

- [ ] **Step 1: Write the failing tests for the pure logic**

Create `src/lib/checkout.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { deriveOrderLines, orderTotals, checkAntiBot, type AvailableVariant } from './checkout';

function variant(over: Partial<AvailableVariant> = {}): AvailableVariant {
  return {
    id: 'v1', productName: 'Classic Chukka', colourName: 'Tan', size: 9,
    stockQty: 10, priceCents: 55000, active: true, ...over,
  };
}

describe('deriveOrderLines', () => {
  it('errors on an empty cart', () => {
    const result = deriveOrderLines([], new Map());
    expect(result).toEqual({ error: { type: 'empty_cart' } });
  });

  it('errors when a variant no longer exists', () => {
    const result = deriveOrderLines([{ variantId: 'missing', qty: 1 }], new Map());
    expect(result).toEqual({ error: { type: 'unavailable', productName: 'An item' } });
  });

  it('errors when a variant is inactive', () => {
    const variants = new Map([['v1', variant({ active: false })]]);
    const result = deriveOrderLines([{ variantId: 'v1', qty: 1 }], variants);
    expect(result).toEqual({ error: { type: 'unavailable', productName: 'Classic Chukka' } });
  });

  it('errors when requested qty exceeds stock', () => {
    const variants = new Map([['v1', variant({ stockQty: 2 })]]);
    const result = deriveOrderLines([{ variantId: 'v1', qty: 5 }], variants);
    expect(result).toEqual({ error: { type: 'insufficient_stock', productName: 'Classic Chukka' } });
  });

  it('derives a line with the DATABASE price, ignoring any client-sent price', () => {
    const variants = new Map([['v1', variant({ priceCents: 55000 })]]);
    const result = deriveOrderLines([{ variantId: 'v1', qty: 2 }], variants);
    expect(result).toEqual({
      lines: [{
        variantId: 'v1', productName: 'Classic Chukka', colour: 'Tan', size: 9,
        qty: 2, unitPriceCents: 55000, lineTotalCents: 110000,
      }],
    });
  });

  it('clamps qty to the 1-20 range', () => {
    const variants = new Map([['v1', variant({ stockQty: 999 })]]);
    const result = deriveOrderLines([{ variantId: 'v1', qty: 999 }], variants);
    expect('lines' in result && result.lines[0].qty).toBe(20);
  });
});

describe('orderTotals', () => {
  const delivery = { freeThreshold: 100000, fee: 9900 };

  it('adds delivery below the threshold', () => {
    const lines = [{ variantId: 'v1', productName: 'X', colour: 'Tan', size: 9, qty: 1, unitPriceCents: 55000, lineTotalCents: 55000 }];
    expect(orderTotals(lines, delivery)).toEqual({
      subtotalCents: 55000, deliveryCents: 9900, totalCents: 64900,
    });
  });

  it('is free at or above the threshold', () => {
    const lines = [{ variantId: 'v1', productName: 'X', colour: 'Tan', size: 9, qty: 2, unitPriceCents: 55000, lineTotalCents: 110000 }];
    expect(orderTotals(lines, delivery)).toEqual({
      subtotalCents: 110000, deliveryCents: 0, totalCents: 110000,
    });
  });
});

describe('checkAntiBot', () => {
  it('rejects a filled honeypot', () => {
    expect(checkAntiBot('spam', Date.now() - 5000)).toBe(false);
  });

  it('rejects a submission faster than 3 seconds', () => {
    expect(checkAntiBot('', Date.now() - 500)).toBe(false);
  });

  it('accepts an empty honeypot submitted after 3 seconds', () => {
    expect(checkAntiBot('', Date.now() - 5000)).toBe(true);
  });

  it('rejects a timestamp older than an hour (stale/replayed form)', () => {
    expect(checkAntiBot('', Date.now() - 1000 * 60 * 61)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test -- checkout
```
Expected: FAIL — cannot resolve `./checkout`.

- [ ] **Step 3: Implement `src/lib/checkout.ts`**

```ts
import { calculateDelivery } from './delivery';

export interface CheckoutLine {
  variantId: string;
  qty: number;
}

export interface AvailableVariant {
  id: string;
  productName: string;
  colourName: string;
  size: number;
  stockQty: number;
  priceCents: number;
  active: boolean;
}

export interface DerivedOrderLine {
  variantId: string;
  productName: string;
  colour: string;
  size: number;
  qty: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export type CheckoutError =
  | { type: 'empty_cart' }
  | { type: 'unavailable'; productName: string }
  | { type: 'insufficient_stock'; productName: string };

const MAX_LINE_QTY = 20;

/**
 * Re-derives every order line from LIVE database data. The cart's own price
 * and colour/size labels are never used here -- only variantId and qty cross
 * the trust boundary from the client.
 */
export function deriveOrderLines(
  cartLines: CheckoutLine[],
  variants: Map<string, AvailableVariant>,
): { lines: DerivedOrderLine[] } | { error: CheckoutError } {
  if (cartLines.length === 0) return { error: { type: 'empty_cart' } };

  const lines: DerivedOrderLine[] = [];
  for (const cl of cartLines) {
    const v = variants.get(cl.variantId);
    if (!v || !v.active) {
      return { error: { type: 'unavailable', productName: v?.productName ?? 'An item' } };
    }
    if (v.stockQty < cl.qty) {
      return { error: { type: 'insufficient_stock', productName: v.productName } };
    }
    const qty = Math.max(1, Math.min(MAX_LINE_QTY, Math.floor(cl.qty)));
    lines.push({
      variantId: v.id,
      productName: v.productName,
      colour: v.colourName,
      size: v.size,
      qty,
      unitPriceCents: v.priceCents,
      lineTotalCents: v.priceCents * qty,
    });
  }
  return { lines };
}

export function orderTotals(
  lines: DerivedOrderLine[],
  delivery: { freeThreshold: number; fee: number },
): { subtotalCents: number; deliveryCents: number; totalCents: number } {
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const deliveryCents = calculateDelivery(subtotalCents, delivery);
  return { subtotalCents, deliveryCents, totalCents: subtotalCents + deliveryCents };
}

/**
 * true = looks human. Honeypot must be empty; the form must have been open
 * at least 3 seconds (bots submit near-instantly) and at most an hour (a
 * stale tab replaying an old formRenderedAt is not a genuine submission).
 */
export function checkAntiBot(
  honeypot: string,
  formRenderedAtMs: number,
  nowMs: number = Date.now(),
): boolean {
  if (honeypot.trim() !== '') return false;
  const elapsed = nowMs - formRenderedAtMs;
  return elapsed >= 3000 && elapsed < 1000 * 60 * 60;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npm test -- checkout
```
Expected: PASS, 14 tests.

- [ ] **Step 5: Implement the route**

Create `src/app/api/checkout/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteSettings } from '@/lib/queries/products';
import { generateOrderNumber } from '@/lib/orders';
import { payfast } from '@/lib/payfast';
import {
  deriveOrderLines,
  orderTotals,
  checkAntiBot,
  type AvailableVariant,
  type CheckoutLine,
} from '@/lib/checkout';

export const runtime = 'nodejs';

interface CheckoutBody {
  items: CheckoutLine[];
  name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  honeypot: string;
  formRenderedAt: number;
}

function errorMessage(error: { type: string; productName?: string }): string {
  switch (error.type) {
    case 'empty_cart':
      return 'Your cart is empty.';
    case 'unavailable':
      return `${error.productName} is no longer available.`;
    case 'insufficient_stock':
      return `${error.productName} no longer has enough stock for this quantity.`;
    default:
      return 'Could not process your order.';
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;

    if (!checkAntiBot(body.honeypot ?? '', body.formRenderedAt ?? 0)) {
      return NextResponse.json({ error: 'Could not process your order.' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }
    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    if (!body.address1?.trim() || !body.city?.trim() || !body.province?.trim() || !body.postalCode?.trim()) {
      return NextResponse.json({ error: 'A full delivery address is required.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // ── Authoritative pricing and stock, re-fetched from the database ─────
    const variantIds = [...new Set(body.items.map((i) => i.variantId))];
    const { data: rows, error: fetchErr } = await admin
      .from('product_variants')
      .select('id, colour_name, size, stock_qty, price_override, active, product:products(name, active, base_price)')
      .in('id', variantIds);
    if (fetchErr) throw fetchErr;

    const variants = new Map<string, AvailableVariant>();
    for (const row of rows ?? []) {
      const product = row.product as unknown as { name: string; active: boolean; base_price: number } | null;
      variants.set(row.id, {
        id: row.id,
        productName: product?.name ?? 'An item',
        colourName: row.colour_name,
        size: row.size,
        stockQty: row.stock_qty,
        priceCents: row.price_override ?? product?.base_price ?? 0,
        active: row.active && (product?.active ?? false),
      });
    }

    const derived = deriveOrderLines(body.items, variants);
    if ('error' in derived) {
      return NextResponse.json({ error: errorMessage(derived.error) }, { status: 400 });
    }

    const settings = await getSiteSettings();
    const delivery = {
      freeThreshold: Number(settings.delivery_free_threshold),
      fee: Number(settings.delivery_fee),
    };
    const totals = orderTotals(derived.lines, delivery);

    if (totals.totalCents <= 0) {
      return NextResponse.json({ error: 'Invalid order total.' }, { status: 400 });
    }

    // ── Persist the order ────────────────────────────────────────────────
    const orderNumber = generateOrderNumber();
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() ?? '',
        address_line1: body.address1.trim(),
        address_line2: body.address2?.trim() ?? '',
        city: body.city.trim(),
        province: body.province.trim(),
        postal_code: body.postalCode.trim(),
        subtotal: totals.subtotalCents,
        delivery_fee: totals.deliveryCents,
        total: totals.totalCents,
        status: 'pending',
      })
      .select('id, order_number, total')
      .single();
    if (orderErr || !order) throw orderErr ?? new Error('Failed to create order');

    const { error: itemsErr } = await admin.from('order_items').insert(
      derived.lines.map((l) => ({
        order_id: order.id,
        variant_id: l.variantId,
        product_name: l.productName,
        colour: l.colour,
        size: l.size,
        qty: l.qty,
        unit_price: l.unitPriceCents,
      })),
    );
    if (itemsErr) {
      // Don't leave an orphaned order row with no items behind.
      await admin.from('orders').delete().eq('id', order.id);
      throw itemsErr;
    }

    // ── Sign the PayFast payload ─────────────────────────────────────────
    const [firstName, ...rest] = body.name.trim().split(' ');
    const payfastData = payfast.createPaymentData({
      orderId: order.id,
      amount: order.total / 100,
      customerFirstName: firstName,
      customerLastName: rest.join(' ') || firstName,
      customerEmail: body.email.trim(),
      customerPhone: body.phone?.trim(),
      itemName: `Caracal Footwear order ${order.order_number}`,
    });

    const response = NextResponse.json({
      success: true,
      order: { id: order.id, orderNumber: order.order_number, total: order.total },
      payfastData,
      payfastUrl: payfast.getPaymentUrl(),
    });

    response.cookies.set('pending_order_id', order.id, {
      httpOnly: true,
      path: '/',
      maxAge: 3600,
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('[checkout]', error);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
```

- [ ] **Step 6: Typecheck and build**

```bash
npx tsc --noEmit && npm run build
```
Expected: both exit 0.

- [ ] **Step 7: Verify against the real database**

```bash
npm run dev
```
In another terminal, find a real variant id with stock (set one via SQL first: `update product_variants set stock_qty = 5 where product_id = (select id from products where slug='classic-chukka') and colour_name='Tan' and size=9;`), then:

```bash
curl -s -X POST http://localhost:3012/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"variantId": "<the variant id>", "qty": 1}],
    "name": "Test Buyer", "email": "test@example.com", "phone": "0821234567",
    "address1": "1 Test St", "city": "Cape Town", "province": "Western Cape", "postalCode": "8001",
    "honeypot": "", "formRenderedAt": '$(( $(date +%s%3N) - 5000 ))'
  }'
```
Expected: `{"success":true,"order":{...},"payfastData":{...},"payfastUrl":"https://sandbox.payfast.co.za/eng/process"}`. Verify a row now exists: `select order_number, status, total from orders where order_number = '<returned orderNumber>';` → `status = 'pending'`.

Verify the honeypot rejects a bot-shaped request:
```bash
curl -s -X POST http://localhost:3012/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[],"name":"","email":"","address1":"","city":"","province":"","postalCode":"","honeypot":"filled","formRenderedAt":0}'
```
Expected: 400, `{"error":"Could not process your order."}`.

Clean up the test order: `delete from orders where order_number = '<returned orderNumber>';` (stock was NOT decremented by checkout — confirm `stock_qty` is still whatever you set it to, unchanged).

- [ ] **Step 8: Commit**

```bash
git add caracal-footwear/src
git commit -m "feat(caracal): POST /api/checkout

Every price and every stock check is re-derived from the database inside
deriveOrderLines -- the cart's own priceCents never reaches this route.
Checkout creates a pending order and signs the PayFast payload; it never
touches stock_qty, which stays the ITN handler's job alone.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Checkout page, PayFast redirect, return/success/cancelled pages

**Files:**
- Create: `src/components/checkout/PayFastRedirectForm.tsx`
- Create: `src/app/checkout/page.tsx`
- Create: `src/app/api/payfast/return/route.ts`
- Create: `src/components/checkout/ClearCartOnMount.tsx`
- Create: `src/app/checkout/success/page.tsx`
- Create: `src/app/checkout/cancelled/page.tsx`

**Interfaces:**
- Consumes: `useCartStore`, `cartSubtotalCents` (Task 2); `createAdminClient` (Task 1); `formatZAR` (Phase 1).
- Produces: the full guest checkout flow through to a status-aware confirmation page.

- [ ] **Step 1: Build the PayFast auto-submit form**

Create `src/components/checkout/PayFastRedirectForm.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';

interface Props {
  action: string;
  data: Record<string, string>;
}

/**
 * PayFast has no JS SDK to redirect through -- the browser must POST a real
 * HTML form to their process URL. This renders that form off-screen and
 * submits it itself the instant it mounts.
 */
export default function PayFastRedirectForm({ action, data }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <form ref={formRef} action={action} method="POST" className="sr-only" aria-hidden="true">
      {Object.entries(data).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </form>
  );
}
```

- [ ] **Step 2: Build the checkout page**

Create `src/app/checkout/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useCartStore, cartSubtotalCents } from '@/lib/cart/store';
import { formatZAR } from '@/lib/money';
import PayFastRedirectForm from '@/components/checkout/PayFastRedirectForm';

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
];

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const [formRenderedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<{ url: string; data: Record<string, string> } | null>(null);

  const subtotal = cartSubtotalCents(items);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          address1: form.get('address1'),
          address2: form.get('address2'),
          city: form.get('city'),
          province: form.get('province'),
          postalCode: form.get('postalCode'),
          honeypot: form.get('company'),
          formRenderedAt,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Could not process your order.');
        setSubmitting(false);
        return;
      }
      setRedirect({ url: json.payfastUrl, data: json.payfastData });
    } catch {
      setError('Could not process your order. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (redirect) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-text">Redirecting you to PayFast to complete payment…</p>
        <PayFastRedirectForm action={redirect.url} data={redirect.data} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-text">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
      <h1 className="display rule-accent text-4xl sm:text-6xl mb-10">CHECKOUT</h1>

      <p className="text-sm text-muted mb-8">
        Subtotal: {formatZAR(subtotal)}. Delivery is calculated at PayFast based on the
        final total.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot -- real users never see or fill this. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="text-xs uppercase tracking-wide text-muted">
              Full name
            </label>
            <input
              id="name" name="name" type="text" required
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-xs uppercase tracking-wide text-muted">
              Email
            </label>
            <input
              id="email" name="email" type="email" required
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="text-xs uppercase tracking-wide text-muted">
            Phone
          </label>
          <input
            id="phone" name="phone" type="tel"
            className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
          />
        </div>

        <div>
          <label htmlFor="address1" className="text-xs uppercase tracking-wide text-muted">
            Address
          </label>
          <input
            id="address1" name="address1" type="text" required
            className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
          />
          <input
            name="address2" type="text" placeholder="Apartment, suite, etc. (optional)"
            className="mt-2 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="text-xs uppercase tracking-wide text-muted">
              City
            </label>
            <input
              id="city" name="city" type="text" required
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            />
          </div>
          <div>
            <label htmlFor="province" className="text-xs uppercase tracking-wide text-muted">
              Province
            </label>
            <select
              id="province" name="province" required defaultValue=""
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            >
              <option value="" disabled>Select…</option>
              {SA_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="postalCode" className="text-xs uppercase tracking-wide text-muted">
              Postal code
            </label>
            <input
              id="postalCode" name="postalCode" type="text" required
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            />
          </div>
        </div>

        {error && <p className="text-sm text-accent" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent text-canvas py-3 rounded-md text-sm uppercase tracking-[0.15em] hover:bg-accent-hi transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Processing…' : 'Continue to PayFast'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Build the PayFast return handler**

Create `src/app/api/payfast/return/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * PayFast redirects the CUSTOMER'S BROWSER here after payment -- this is
 * separate from /api/payfast/notify, which is the server-to-server webhook
 * that actually confirms payment. The browser can arrive here before, after,
 * or without the ITN ever landing, so this route only resolves an orderId to
 * an order_number and hands off to the status-aware success page -- it never
 * changes order status itself.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.redirect(new URL('/checkout/cancelled', req.url));
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('order_number')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.redirect(new URL('/checkout/cancelled', req.url));
  }

  return NextResponse.redirect(
    new URL(`/checkout/success?order=${order.order_number}`, req.url),
  );
}
```

- [ ] **Step 4: Build the cart-clearing client component**

Create `src/components/checkout/ClearCartOnMount.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart/store';

/** Only ever rendered by the success page when an order is confirmed `paid`
 *  -- the cart must survive a cancelled or still-pending checkout. */
export default function ClearCartOnMount() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
```

- [ ] **Step 5: Build the success page**

Create `src/app/checkout/success/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatZAR } from '@/lib/money';
import ClearCartOnMount from '@/components/checkout/ClearCartOnMount';

export const metadata: Metadata = { title: 'Order Confirmation' };

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await props.searchParams;

  if (!orderNumber) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-text">We couldn't find that order.</p>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('order_number, status, total, email')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-text">We couldn't find that order.</p>
      </div>
    );
  }

  if (order.status === 'paid' || order.status === 'fulfilled') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <ClearCartOnMount />
        <h1 className="display text-3xl text-text">THANK YOU</h1>
        <p className="text-text">
          Order <span className="text-accent">{order.order_number}</span> confirmed —{' '}
          {formatZAR(order.total)}.
        </p>
        <p className="text-sm text-muted">
          A confirmation has been sent to {order.email}. Your vellies will be made to order
          and shipped within the lead time shown at checkout.
        </p>
      </div>
    );
  }

  if (order.status === 'stock_conflict') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <h1 className="display text-3xl text-text">WE NEED TO TALK TO YOU</h1>
        <p className="text-text">
          Payment for order <span className="text-accent">{order.order_number}</span> went
          through, but one or more items sold out at the same moment. We have not shipped
          anything, and we'll be in touch by email to sort out a replacement or a refund.
        </p>
      </div>
    );
  }

  if (order.status === 'failed' || order.status === 'cancelled') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <h1 className="display text-3xl text-text">PAYMENT NOT COMPLETED</h1>
        <p className="text-text">
          Order <span className="text-accent">{order.order_number}</span> was not paid. Your
          cart has been left untouched — you can try again.
        </p>
      </div>
    );
  }

  // status === 'pending': the browser beat the ITN here, which is normal and
  // usually resolves within a few seconds. No client JS/polling library --
  // a plain meta-refresh is enough for an edge case this narrow.
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
      <meta httpEquiv="refresh" content="4" />
      <h1 className="display text-3xl text-text">CONFIRMING YOUR PAYMENT</h1>
      <p className="text-text">
        Order <span className="text-accent">{order.order_number}</span> — this usually takes
        a few seconds. This page will refresh automatically.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Build the cancelled page**

Create `src/app/checkout/cancelled/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Payment Cancelled' };

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
      <h1 className="display text-3xl text-text">PAYMENT CANCELLED</h1>
      <p className="text-text">Your payment was cancelled. Your cart is still saved.</p>
      <Link href="/cart" className="inline-block text-sm text-text underline underline-offset-4">
        Back to cart
      </Link>
    </div>
  );
}
```

- [ ] **Step 7: Typecheck and build**

```bash
npx tsc --noEmit && npm run build
```
Expected: both exit 0.

- [ ] **Step 8: Verify in the browser**

```bash
npm run dev
```
Add an item to cart, go to `/checkout`, submit the honeypot-empty form — confirm you land on PayFast's sandbox payment page (the auto-submitting hidden form works). Go back and try submitting in under 3 seconds by editing `formRenderedAt` via devtools — confirm the anti-bot check rejects it. Visit `/checkout/success?order=doesnotexist` — confirm the not-found state. Visit `/checkout/cancelled` directly — confirm it renders. Verify at 390px.

- [ ] **Step 9: Commit**

```bash
git add caracal-footwear/src
git commit -m "feat(caracal): checkout page, PayFast redirect, status-aware confirmation

The success page reads live order status rather than assuming payment
succeeded just because the browser arrived there -- PayFast's browser
redirect and its server-to-server ITN are two separate, unordered events.
The cart only clears once status is confirmed paid.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: `POST /api/payfast/notify` — the ITN handler

**Files:**
- Create: `src/app/api/payfast/notify/route.ts`

**Interfaces:**
- Consumes: `payfast` (Task 4); `createAdminClient` (Task 1); the `decrement_stock_for_order` RPC (Task 4); `centsToRand` (Phase 1 `src/lib/money.ts`). Calls `sendPaidOrderEmails`/`sendStockConflictEmails` from Task 8 — **stub these as no-op async functions in this task and wire the real implementation in Task 8**, so this task is independently testable first.
- Produces: the webhook PayFast calls. No other code depends on this route's internals.

This is the highest-risk file in the project. Read it twice before moving on.

- [ ] **Step 1: Create a temporary email stub**

This task is built and verified before Task 8 exists. Create `src/lib/email/send.ts` now with stubs only — Task 8 replaces this file's contents entirely:

```ts
/** Stub -- replaced in Task 8 with real Resend sends. Keeping the signature
 *  identical means Task 7 doesn't change when Task 8 lands. */
export async function sendPaidOrderEmails(orderId: string): Promise<void> {
  console.log('[email stub] would send paid-order emails for', orderId);
}

export async function sendStockConflictEmails(orderId: string): Promise<void> {
  console.log('[email stub] would send stock-conflict emails for', orderId);
}
```

- [ ] **Step 2: Implement the ITN handler**

Create `src/app/api/payfast/notify/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { payfast } from '@/lib/payfast';
import { createAdminClient } from '@/lib/supabase/admin';
import { centsToRand } from '@/lib/money';
import { sendPaidOrderEmails, sendStockConflictEmails } from '@/lib/email/send';

export const runtime = 'nodejs';

/**
 * PayFast ITN (Instant Payment Notification).
 *
 * An order only becomes `paid` after ALL of:
 *   1. the signature verifies,
 *   2. the request came from a PayFast host (production only -- the sandbox
 *      does not always originate from PayFast's published ranges),
 *   3. PayFast itself confirms the payload via server-to-server postback,
 *   4. the amount actually paid matches the order total we stored,
 *   5. decrement_stock_for_order reports every line could be filled.
 *
 * If money clears (1-4 pass) but stock can't cover the order (5 fails), the
 * order becomes `stock_conflict` -- NOT silently left as `pending` and NOT
 * silently marked `paid`. Money has landed; that has to be visible.
 *
 * Always returns 200 once the notification itself is genuine: a non-200
 * makes PayFast retry, which we only want for transient/unknown failures.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    const signature = data.signature;
    delete data.signature;

    // 1. Signature
    if (!signature || !payfast.verifySignature(data, signature)) {
      console.error('[payfast.notify] invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2. Source host (production only)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip');
    if (payfast.mode === 'production' && !(await payfast.isValidRequestIp(ip))) {
      console.error('[payfast.notify] request from non-PayFast host', ip);
      return NextResponse.json({ error: 'Invalid source' }, { status: 403 });
    }

    // 3. Server-to-server confirmation
    if (!(await payfast.validateWithPayFast(rawBody))) {
      console.error('[payfast.notify] postback validation failed');
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const orderId = data.m_payment_id;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing m_payment_id' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: order, error: loadErr } = await admin
      .from('orders')
      .select('id, status, total, order_number')
      .eq('id', orderId)
      .single();

    if (loadErr || !order) {
      console.error('[payfast.notify] order not found', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotent: PayFast retries notifications. Only a `pending` order can
    // still be transitioned -- every other status has already been decided.
    if (order.status !== 'pending') {
      return NextResponse.json({ success: true, note: 'already processed' });
    }

    const paymentStatus = (data.payment_status || '').toUpperCase();

    if (paymentStatus === 'COMPLETE') {
      // 4. Amount actually paid must match what we stored.
      const grossPaid = Number(data.amount_gross ?? 0);
      const expected = centsToRand(order.total);
      if (Math.abs(grossPaid - expected) > 0.01) {
        console.error(
          `[payfast.notify] amount mismatch on ${order.order_number}: paid ${grossPaid} vs expected ${expected}`,
        );
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      // 5. Atomic stock decrement -- see supabase/migrations/0003_stock_decrement.sql
      const { data: stockResult, error: stockErr } = await admin
        .rpc('decrement_stock_for_order', { p_order_id: order.id })
        .single();
      if (stockErr) throw stockErr;

      if (stockResult && (stockResult as { ok: boolean }).ok) {
        const { error: updErr } = await admin
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payfast_payment_id: data.pf_payment_id ?? null,
            payment_data: data,
          })
          .eq('id', order.id);
        if (updErr) throw updErr;

        console.log(`[payfast.notify] order ${order.order_number} paid`);
        await sendPaidOrderEmails(order.id);
      } else {
        const { error: updErr } = await admin
          .from('orders')
          .update({
            status: 'stock_conflict',
            paid_at: new Date().toISOString(),
            payfast_payment_id: data.pf_payment_id ?? null,
            payment_data: data,
          })
          .eq('id', order.id);
        if (updErr) throw updErr;

        console.error(`[payfast.notify] order ${order.order_number} paid but stock conflict`, stockResult);
        await sendStockConflictEmails(order.id);
      }
    } else if (paymentStatus === 'FAILED') {
      const { error: updErr } = await admin
        .from('orders')
        .update({ status: 'failed', payment_data: data })
        .eq('id', order.id);
      if (updErr) throw updErr;
      console.log(`[payfast.notify] order ${order.order_number} failed`);
    } else if (paymentStatus === 'CANCELLED') {
      const { error: updErr } = await admin
        .from('orders')
        .update({ status: 'cancelled', payment_data: data })
        .eq('id', order.id);
      if (updErr) throw updErr;
      console.log(`[payfast.notify] order ${order.order_number} cancelled`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[payfast.notify]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Typecheck and build**

```bash
npx tsc --noEmit && npm run build
```
Expected: both exit 0.

- [ ] **Step 4: Verify the signature and idempotency checks in isolation**

```bash
npm run dev
```
```bash
curl -s -X POST http://localhost:3012/api/payfast/notify \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "m_payment_id=doesnotexist&payment_status=COMPLETE&signature=wrong"
```
Expected: 400, `{"error":"Invalid signature"}` — proves an unsigned/garbage payload cannot reach the order-loading code at all.

The full paid/stock_conflict paths, driven by real signed sandbox payloads, are verified end-to-end in Task 9 once Task 8's real emails are wired in (the stub from Step 1 logs instead of sending, which is fine for this task's scope).

- [ ] **Step 5: Commit**

```bash
git add caracal-footwear/src/app/api/payfast/notify caracal-footwear/src/lib/email/send.ts
git commit -m "feat(caracal): PayFast ITN handler with atomic stock decrement

Money and stock are two separate facts and this file is where they meet: an
order only becomes paid if BOTH the payment verifies (signature + source +
postback + amount) AND decrement_stock_for_order can fill every line. If
payment clears but stock can't, the order becomes stock_conflict rather than
paid -- that state exists so a sold-out race is never silently absorbed as a
normal sale. Idempotent on order.status: once an order leaves pending, a
retried notification is a no-op.

Email sending is stubbed pending Task 8; this task is independently
verifiable without it.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Order emails

**Files:**
- Create: `src/lib/resend.ts`
- Create: `src/lib/email/templates.ts`
- Modify: `src/lib/email/send.ts` (replace the Task 7 stub entirely)
- Modify: `.env.local.example`
- Modify: `package.json`

**Interfaces:**
- Consumes: `formatZAR` (Phase 1).
- Produces: `sendPaidOrderEmails(orderId: string): Promise<void>`, `sendStockConflictEmails(orderId: string): Promise<void>` — same signatures the Task 7 stub already used, so Task 7's route needs no changes.

- [ ] **Step 1: Install Resend**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npm install resend@^4
```
Expected: exit 0.

- [ ] **Step 2: Add email env vars to the example file**

Append to `.env.local.example`:

```
# Resend. Without RESEND_API_KEY, sends are skipped and logged -- the site
# still works, orders just don't get emailed.
RESEND_API_KEY=
RESEND_FROM_EMAIL=Caracal Footwear <onboarding@resend.dev>

# Where order and stock-conflict notifications go. Donald's own inbox.
REPORT_RECIPIENT_EMAIL=donald@caracallodge.co.za
```

- [ ] **Step 3: Write the Resend wrapper**

Create `src/lib/resend.ts`:

```ts
import { Resend } from 'resend';

/** Lazy-init so a missing key never crashes a build or an unrelated route.
 *  Email is best-effort: a failed send must never fail the caller -- an
 *  order is still real whether or not the receipt goes out. */

let client: Resend | null = null;

function getResend(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

const FROM = process.env.RESEND_FROM_EMAIL || 'Caracal Footwear <onboarding@resend.dev>';

export type SendResult = { success: boolean; error?: string };

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    console.warn('[resend] skipped, RESEND_API_KEY is not set:', subject);
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error('[resend]', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('[resend]', err);
    return { success: false, error: err instanceof Error ? err.message : 'Send failed' };
  }
}

/** Where order and stock-conflict notifications go. */
export function reportRecipient(): string | null {
  return process.env.REPORT_RECIPIENT_EMAIL || null;
}
```

- [ ] **Step 4: Write the email templates**

Create `src/lib/email/templates.ts`:

```ts
/** Plain inline-styled HTML -- these have to survive Gmail and Outlook,
 *  which strip <style> blocks and flexbox. */

import { formatZAR } from '@/lib/money';

export type EmailOrder = {
  order_number: string;
  email: string;
  customer_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
};

export type EmailItem = {
  product_name: string;
  colour: string;
  size: number;
  qty: number;
  unit_price: number;
};

export type Email = { subject: string; html: string };

function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function itemsTable(items: EmailItem[]): string {
  const rows = items
    .map(
      (i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;">${esc(i.product_name)} — ${esc(i.colour)}, size ${esc(i.size)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;text-align:right;">×${esc(i.qty)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e5e5;text-align:right;">${formatZAR(i.unit_price * i.qty)}</td>
    </tr>`,
    )
    .join('');

  return `<table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;">${rows}</table>`;
}

function addressBlock(order: EmailOrder): string {
  return [order.address_line1, order.address_line2, order.city, order.province, order.postal_code]
    .filter(Boolean)
    .map(esc)
    .join('<br>');
}

export function orderConfirmation(order: EmailOrder, items: EmailItem[]): Email {
  return {
    subject: `Your Caracal Footwear order ${order.order_number}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="font-size:20px;">Thank you, ${esc(order.customer_name)}</h1>
        <p>Order <strong>${esc(order.order_number)}</strong> is confirmed.</p>
        ${itemsTable(items)}
        <p style="margin-top:16px;">
          Subtotal: ${formatZAR(order.subtotal)}<br>
          Delivery: ${order.delivery_fee === 0 ? 'Free' : formatZAR(order.delivery_fee)}<br>
          <strong>Total: ${formatZAR(order.total)}</strong>
        </p>
        <p style="margin-top:16px;">Delivering to:<br>${addressBlock(order)}</p>
        <p style="margin-top:16px;color:#666;">Handmade to order. We'll be in touch about shipping.</p>
      </div>
    `,
  };
}

export function adminOrderNotification(order: EmailOrder, items: EmailItem[]): Email {
  return {
    subject: `New order ${order.order_number} — ${formatZAR(order.total)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="font-size:20px;">New paid order</h1>
        <p>${esc(order.customer_name)} (${esc(order.email)}, ${esc(order.phone)})</p>
        ${itemsTable(items)}
        <p style="margin-top:16px;"><strong>Total: ${formatZAR(order.total)}</strong></p>
        <p style="margin-top:16px;">Deliver to:<br>${addressBlock(order)}</p>
      </div>
    `,
  };
}

export function stockConflictCustomerEmail(order: EmailOrder): Email {
  return {
    subject: `About your order ${order.order_number}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="font-size:20px;">We need to sort something out</h1>
        <p>Hi ${esc(order.customer_name)},</p>
        <p>
          Your payment for order <strong>${esc(order.order_number)}</strong>
          (${formatZAR(order.total)}) went through, but one or more items sold out at the
          same moment yours was processed. Nothing has shipped.
        </p>
        <p>We'll be in touch shortly to arrange a replacement colour/size or a full refund.</p>
      </div>
    `,
  };
}

export function stockConflictAdminEmail(order: EmailOrder, items: EmailItem[]): Email {
  return {
    subject: `STOCK CONFLICT — order ${order.order_number} needs attention`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="font-size:20px;color:#b91c1c;">Paid order, insufficient stock</h1>
        <p>
          ${esc(order.customer_name)} (${esc(order.email)}) paid ${formatZAR(order.total)} for
          order <strong>${esc(order.order_number)}</strong>, but stock ran out for at least
          one line between checkout and payment confirming.
        </p>
        ${itemsTable(items)}
        <p style="margin-top:16px;color:#b91c1c;"><strong>Action needed: contact the customer to arrange a replacement or refund.</strong></p>
      </div>
    `,
  };
}
```

- [ ] **Step 5: Replace the Task 7 stub with real sends**

Overwrite `src/lib/email/send.ts` completely:

```ts
/** Server-side senders that load an order and mail it out.
 *
 *  Everything here is best-effort by design: a failed send must never fail
 *  the caller. The ITN handler in particular MUST still return 200 to
 *  PayFast even if Resend is down -- the money has landed either way, and a
 *  non-200 would just make PayFast retry a payment we've already processed.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, reportRecipient } from '@/lib/resend';
import {
  orderConfirmation,
  adminOrderNotification,
  stockConflictCustomerEmail,
  stockConflictAdminEmail,
  type EmailOrder,
  type EmailItem,
} from '@/lib/email/templates';

const ORDER_FIELDS =
  'order_number, email, customer_name, phone, address_line1, address_line2, city, province, postal_code, subtotal, delivery_fee, total, created_at';

const ITEM_FIELDS = 'product_name, colour, size, qty, unit_price';

async function loadOrder(orderId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select(ORDER_FIELDS)
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return null;

  const { data: items } = await admin.from('order_items').select(ITEM_FIELDS).eq('order_id', orderId);

  return {
    order: order as unknown as EmailOrder,
    items: (items ?? []) as unknown as EmailItem[],
  };
}

/** Customer receipt + Donald's heads-up. Called from the PayFast ITN once an
 *  order is confirmed paid AND stock decremented cleanly. */
export async function sendPaidOrderEmails(orderId: string): Promise<void> {
  try {
    const loaded = await loadOrder(orderId);
    if (!loaded) return;
    const { order, items } = loaded;

    const receipt = orderConfirmation(order, items);
    await sendEmail({ to: order.email, subject: receipt.subject, html: receipt.html });

    const admin = reportRecipient();
    if (admin) {
      const notice = adminOrderNotification(order, items);
      await sendEmail({ to: admin, subject: notice.subject, html: notice.html, replyTo: order.email });
    }
  } catch (error) {
    console.error('[email.sendPaidOrderEmails]', error);
  }
}

/** Called from the PayFast ITN when payment cleared but stock could not
 *  cover the order. Both the customer and Donald need to know immediately. */
export async function sendStockConflictEmails(orderId: string): Promise<void> {
  try {
    const loaded = await loadOrder(orderId);
    if (!loaded) return;
    const { order, items } = loaded;

    const customerMail = stockConflictCustomerEmail(order);
    await sendEmail({ to: order.email, subject: customerMail.subject, html: customerMail.html });

    const admin = reportRecipient();
    if (admin) {
      const adminMail = stockConflictAdminEmail(order, items);
      await sendEmail({ to: admin, subject: adminMail.subject, html: adminMail.html, replyTo: order.email });
    }
  } catch (error) {
    console.error('[email.sendStockConflictEmails]', error);
  }
}
```

- [ ] **Step 6: Typecheck and build**

```bash
npx tsc --noEmit && npm run build
```
Expected: both exit 0. This does not change `src/app/api/payfast/notify/route.ts` at all — the function signatures it imports are unchanged from the Task 7 stub.

- [ ] **Step 7: Verify a template renders sane HTML**

Create a throwaway script, run it, then delete it:

```bash
cat > /tmp/check-email.mjs <<'EOF'
import { orderConfirmation } from '../src/lib/email/templates.ts';
const html = orderConfirmation(
  { order_number: 'CF260805-1234', email: 'a@b.com', customer_name: 'Test <Name>', phone: '', address_line1: '1 Test St', address_line2: '', city: 'Cape Town', province: 'Western Cape', postal_code: '8001', subtotal: 55000, delivery_fee: 9900, total: 64900, created_at: '' },
  [{ product_name: 'Classic Chukka', colour: 'Tan', size: 9, qty: 1, unit_price: 55000 }],
).html;
console.log(html.includes('Test &lt;Name&gt;') ? 'PASS: escaped' : 'FAIL: not escaped');
console.log(html.includes('R550') ? 'PASS: subtotal formatted' : 'FAIL: subtotal missing');
EOF
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
node --experimental-strip-types /tmp/check-email.mjs
rm /tmp/check-email.mjs
```
Expected: both `PASS` lines. The escaping check matters — `customer_name` is user-supplied at checkout and lands directly in HTML.

- [ ] **Step 8: Commit**

```bash
git add caracal-footwear/src/lib/resend.ts caracal-footwear/src/lib/email caracal-footwear/.env.local.example caracal-footwear/package.json caracal-footwear/package-lock.json
git commit -m "feat(caracal): order confirmation and stock-conflict emails

Replaces the Task 7 email stub with real Resend sends -- same function
signatures, so the ITN handler needed no changes. User-supplied text
(customer_name, address) is HTML-escaped before it reaches the template.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: End-to-end sandbox verification, concurrency, and idempotency

This task exists to demonstrate the spec's success criteria 1–3, not merely assert them. Nothing here changes application code unless a check fails.

**Files:**
- Create (throwaway, deleted at the end): a concurrency test script.

**Interfaces:**
- Consumes: everything built in Tasks 1–8.

- [ ] **Step 1: Confirm required env vars**

Tell the user (do not write these yourself — the env-guardrail hook blocks edits to `.env*` files):

> For this task's sandbox run, `.env.local` needs `NEXT_PUBLIC_SITE_URL=http://localhost:3012`, `PAYFAST_MODE=sandbox` (PayFast's public sandbox merchant id/key are already defaulted in `src/lib/payfast.ts` if you don't have your own sandbox account), and — to actually receive the confirmation emails — `RESEND_API_KEY` and `REPORT_RECIPIENT_EMAIL`. Without `RESEND_API_KEY` the send is skipped and logged, which is fine for everything except actually reading the email.

- [ ] **Step 2: PayFast sandbox end-to-end walkthrough (spec success criterion 1)**

```bash
npm run dev
```

In the browser:
1. Set a variant's stock to a known value via SQL first, e.g. `update product_variants set stock_qty = 3 where product_id = (select id from products where slug = 'classic-chukka') and colour_name = 'Tan' and size = 9;`.
2. Add that exact Tan/9 Classic Chukka to cart, go to `/checkout`, fill the form, submit.
3. On PayFast's sandbox payment page, use PayFast's sandbox test card flow (any of their documented test values) to complete payment.
4. You land on `/checkout/success?order=...`. If it shows "Confirming your payment," wait for the auto-refresh — the ITN can take a few seconds to arrive.

Verify all of:
- Success page shows the **paid** state with the correct total.
- `select status, paid_at, payfast_payment_id from orders where order_number = '<order>';` → `status = 'paid'`, both other fields set.
- `select stock_qty from product_variants where product_id = (select id from products where slug='classic-chukka') and colour_name='Tan' and size=9;` → `2` (was 3, one decremented).
- Server logs show `[payfast.notify] order ... paid` and (if `RESEND_API_KEY` is set) the confirmation email arrives at the test email address, and the admin notice arrives at `REPORT_RECIPIENT_EMAIL`.
- Cart is now empty (localStorage cleared by `ClearCartOnMount`).

- [ ] **Step 3: Concurrent-order test — stock cannot go negative (spec success criterion 2)**

Set up a throwaway variant with exactly 1 unit and two orders each wanting 1:

```sql
update product_variants set stock_qty = 1
where product_id = (select id from products where slug = 'classic-chukka') and colour_name = 'Tan' and size = 9;

insert into orders (order_number, customer_name, email, address_line1, city, province, postal_code, subtotal, delivery_fee, total)
values
  ('TEST-RACE-A', 'Racer A', 'a@example.com', '1 Test St', 'Cape Town', 'Western Cape', '8001', 55000, 9900, 64900),
  ('TEST-RACE-B', 'Racer B', 'b@example.com', '1 Test St', 'Cape Town', 'Western Cape', '8001', 55000, 9900, 64900);

insert into order_items (order_id, variant_id, product_name, colour, size, qty, unit_price)
select o.id, v.id, 'Classic Chukka', 'Tan', 9, 1, 55000
from orders o, product_variants v
where o.order_number in ('TEST-RACE-A', 'TEST-RACE-B')
  and v.product_id = (select id from products where slug = 'classic-chukka')
  and v.colour_name = 'Tan' and v.size = 9;
```

Create `<scratchpad>/race-test.mjs`:

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: orders } = await supabase.from('orders').select('id, order_number').in('order_number', ['TEST-RACE-A', 'TEST-RACE-B']);

const results = await Promise.all(
  orders.map((o) => supabase.rpc('decrement_stock_for_order', { p_order_id: o.id }).single()),
);

results.forEach((r, i) => console.log(orders[i].order_number, r.data));

const { data: variant } = await supabase
  .from('product_variants')
  .select('stock_qty')
  .eq('product_id', (await supabase.from('products').select('id').eq('slug', 'classic-chukka').single()).data.id)
  .eq('colour_name', 'Tan')
  .eq('size', 9)
  .single();
console.log('final stock_qty:', variant.stock_qty);
```

Run it:
```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
node --env-file=.env.local "<scratchpad>/race-test.mjs"
```

Expected, exactly:
- One order logs `{ ok: true, failed_variant_ids: [] }`, the other logs `{ ok: false, failed_variant_ids: ['<the variant id>'] }`.
- `final stock_qty: 0` — never `-1`.

If both report `ok: true`, the `FOR UPDATE` locking in Task 4's migration is broken — stop and fix it before proceeding; this is the single most important guarantee in the phase.

Clean up:
```sql
delete from orders where order_number in ('TEST-RACE-A', 'TEST-RACE-B');
update product_variants set stock_qty = 0
where product_id = (select id from products where slug = 'classic-chukka') and colour_name = 'Tan' and size = 9;
```
Delete the throwaway script.

- [ ] **Step 4: Duplicate-ITN idempotency test (spec success criterion 3)**

Using the order that was actually paid in Step 2:

```bash
# Re-send the exact same ITN payload PayFast sent the first time. If you
# don't have the raw payload logged, simulate it: build a signed COMPLETE
# payload for the same order with payfast.createPaymentData-equivalent
# fields and payment_status=COMPLETE, post it twice.
curl -s -X POST http://localhost:3012/api/payfast/notify \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "m_payment_id=<the paid order's id>&payment_status=COMPLETE&amount_gross=<its total in rand>&signature=<a validly-generated signature for these exact fields>"
```

Because a hand-built signature is easy to get wrong, the simpler and equally valid version of this check is: **the first real ITN from Step 2 already proves the happy path; to prove idempotency, just note in the server logs whether PayFast's own sandbox sent the notification more than once (it sometimes does)** — search the dev server log for a second `[payfast.notify]` line for the same order number. Confirm:
- The second call's response is `{"success":true,"note":"already processed"}`.
- `select stock_qty from product_variants where ...` for that order's variant is unchanged since Step 2 (no double decrement).
- Only one confirmation email arrived, not two.

If PayFast's sandbox didn't retry on its own, this is still provable directly: manually call the route a second time with the exact same raw body captured from the first (real) request — since the signature was already valid once, replaying the identical bytes replays a valid signature. The `order.status !== 'pending'` guard is what must fire.

- [ ] **Step 5: Confirm the full test suite and build are still green**

```bash
npx tsc --noEmit && npm run build && npm test
```
Expected: all exit 0.

- [ ] **Step 6: Commit**

Only if Step 5 required any fixes — otherwise there is nothing new to commit, verification tasks don't always produce a diff. If fixes were needed:

```bash
git add caracal-footwear/src
git commit -m "fix(caracal): <describe what Task 9 verification caught>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Phase 2 Definition of Done

- [ ] `npm test` passes — all Phase 1 tests plus Task 1/2/5 tests (52 total: 25 Phase 1 + 3 orders + 10 cart + 14 checkout).
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `npm run build` exits 0.
- [ ] A shopper can add to cart from the PDP, adjust quantity and remove lines on `/cart`, and reach `/checkout`.
- [ ] `POST /api/checkout` re-derives price and stock from the database on every request — never trusts the client.
- [ ] A full order completes on the PayFast sandbox: order row `paid`, stock decremented exactly once, both emails sent.
- [ ] The concurrent-order test proves `stock_qty` cannot go negative and exactly one of two racing orders succeeds.
- [ ] A duplicate ITN does not double-decrement stock or double-send email.
- [ ] `stock_conflict` is reachable, visibly flagged in the DB, and emails both the customer and Donald.
- [ ] Every page verified at 390px with no horizontal scroll.
- [ ] No raw hex colours in any component — tokens only.
- [ ] No secrets committed; `.env.local` is gitignored.

---

## Open questions carried from the spec

None block Phase 2. Tracked in the spec §10 and the Phase 1 plan's equivalent section — unchanged by this phase.
