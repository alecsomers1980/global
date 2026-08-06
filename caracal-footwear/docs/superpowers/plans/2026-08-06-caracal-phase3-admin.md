# Caracal Footwear — Phase 3: Admin Back-Office — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donald can sign in at `/admin`, manage the catalogue (create/edit products, generate the colour×size variant grid, fill in stock on a spreadsheet-style grid, upload and organise product photos), see and progress orders, and edit site-wide settings — all without a developer.

**Architecture:** A single authenticated operator (no roles table, no 2FA — that machinery exists in the proven `dianas-bulbinella` admin for multi-staff sites and is explicitly out of scope here). `src/proxy.ts` gates every `/admin` page and `/api/admin` route at the edge; admin API routes re-verify the session server-side as a second layer before touching the service-role client. Every admin mutation goes through an API route using the Phase 2 service-role client (`createAdminClient`), never a client-side Supabase call with elevated privilege.

**Tech Stack:** Next.js 16.3.0 · React 19.2.4 · `@supabase/ssr` (session-aware clients, already installed) · `sharp` (server-side image optimization) · Supabase Storage

## Global Constraints

Every task's requirements implicitly include this section.

- **Next.js is version 16.3.0 — this is NOT the Next.js in your training data.** `params`/`searchParams` are Promises and must be awaited. `middleware.ts` is renamed `proxy.ts`, exporting a `proxy` function, not `middleware`.
- **Never write secret values into any file.** Donald's admin password is passed as a CLI argument to a one-time script, never hardcoded. `.env.local` only for keys; a PreToolUse hook blocks edits to `.env*` files.
- **All money is integer cents.** Reuse `formatZAR` from `src/lib/money.ts`. Never reimplement.
- **`stock_qty` has a DB check constraint `>= 0`.** The stock grid must not attempt to save a negative value client-side, but the constraint is the real backstop.
- **Order status invariant (from Phase 2), non-negotiable: staff can move an order to `fulfilled` and nowhere else.** `paid`, `stock_conflict`, `failed`, `cancelled` are set ONLY by the PayFast ITN handler (`src/app/api/payfast/notify/route.ts`). The admin status-update route must reject any other target status outright, not just hide the option in the UI.
- **Design tokens are fixed**, used by name: `canvas #14110F` · `surface #1E1A17` · `accent #C25A1E` · `accent-hi #D96B2A` · `text #F5F0E8` · `muted #A39A90`. `text-accent` is never body copy on canvas.
- **Every admin mutation uses the service-role client (`createAdminClient` from `src/lib/supabase/admin.ts`, Phase 2) inside an API route — never a client component talking to Supabase with elevated rights.** The session-aware clients built in this phase (`src/lib/supabase/client.ts`, `src/lib/supabase/session.ts`) are for authentication only, never for mutating catalogue/order data.
- **Image optimization happens server-side with `sharp`, never trusted from the client.** A client can upload an oversized or wrong-format file; the server is what writes to Storage.
- Commit after every task. Do not batch commits.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/supabase/client.ts` | Browser session-aware Supabase client. `persist` controls "keep me signed in" via cookie maxAge. |
| `src/lib/supabase/session.ts` | Server-side session-aware Supabase client (cookie-based). Used by `proxy.ts` and admin API routes — distinct from Phase 1's `server.ts` (anon, cookie-less, catalogue reads only). |
| `src/lib/adminAuth.ts` | `requireAdminSession()` — the second auth layer every admin API route calls. |
| `src/proxy.ts` | Route gate. Redirects unauthenticated `/admin/*` (except `/admin/login`) and `/api/admin/*` requests. |
| `scripts/create-admin-user.mjs` | One-time: provisions Donald's Supabase Auth account. Password passed as a CLI arg, never written to a file. |
| `src/components/auth/PasswordInput.tsx` | Show/hide password field. Reused across login/reset. |
| `src/app/admin/login/page.tsx` | Sign-in form. |
| `src/app/forgot-password/page.tsx` · `src/app/reset-password/page.tsx` | Password recovery flow. |
| `src/app/admin/layout.tsx` | Admin shell: sidebar nav, sign-out. Trusts `proxy.ts` for auth — does not re-check. |
| `src/components/admin/AdminNav.tsx` · `SignOutButton.tsx` | Shell pieces. |
| `src/app/admin/page.tsx` | Dashboard: order counts, revenue this month, low-stock list. |
| `supabase/migrations/0004_storage.sql` | `product-images` bucket, public-read-only policy. |
| `src/app/api/admin/products/[id]/images/route.ts` | Upload (sharp-optimized) and delete (single or by-colour) product images. |
| `src/components/admin/products/ImageManager.tsx` | Multi-upload UI, per-colour assignment, thumbnail grid, bulk delete. |
| `src/app/admin/products/page.tsx` · `new/page.tsx` · `[id]/page.tsx` | Product list, create, edit. |
| `src/components/admin/products/ProductForm.tsx` | Product fields form. |
| `src/app/api/admin/products/route.ts` · `[id]/route.ts` | Product list/create/update. No hard delete — `active` toggle only (order history references variants by FK). |
| `src/components/admin/products/VariantGenerator.tsx` | Colour+size grid generator. |
| `src/components/admin/products/StockGrid.tsx` | Spreadsheet stock editor with per-variant active toggle. |
| `src/app/api/admin/products/[id]/variants/bulk/route.ts` | Generates missing variant rows; never overwrites existing stock. |
| `src/app/api/admin/products/[id]/variants/route.ts` | Bulk stock/active update. |
| `src/app/admin/orders/page.tsx` · `[id]/page.tsx` | Order list, detail + fulfil action. |
| `src/app/api/admin/orders/route.ts` · `[id]/status/route.ts` | Order list; status update (fulfilled-only). |
| `src/app/admin/settings/page.tsx` | Settings form. |
| `src/app/api/admin/settings/route.ts` | Settings read/write. |

---

## Task 1: Session-aware Supabase clients, route gating, admin provisioning

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/session.ts`, `src/lib/adminAuth.ts`
- Create: `src/proxy.ts`
- Create: `scripts/create-admin-user.mjs`

**Interfaces:**
- Consumes: `createAdminClient` (Phase 2, `src/lib/supabase/admin.ts`).
- Produces:
  ```ts
  // client.ts
  export function createClient(persist?: boolean): SupabaseClient
  // session.ts
  export async function createSessionServerClient(): Promise<SupabaseClient>
  // adminAuth.ts
  export async function requireAdminSession(): Promise<{ userId: string } | null>
  ```

- [ ] **Step 1: Write the browser session-aware client**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Browser Supabase client (anon key, RLS-enforced) for client components --
 * the login form and the sign-out button.
 *
 * `persist` drives "keep me signed in":
 *  - true  -> cookie lives 30 days, survives a browser restart
 *  - false -> session cookie, cleared when the browser closes
 * Omitted (undefined) leaves the existing cookie lifetime alone -- what
 * every caller other than the login screen wants.
 */
export function createClient(persist?: boolean) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    persist === undefined
      ? undefined
      : { cookieOptions: { maxAge: persist ? THIRTY_DAYS : undefined } },
  );
}
```

- [ ] **Step 2: Write the server-side session-aware client**

Create `src/lib/supabase/session.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side, cookie-aware Supabase client -- reads the signed-in admin's
 * session. Distinct from src/lib/supabase/server.ts (Phase 1), which is an
 * anon, cookie-less client for public catalogue reads and knows nothing
 * about sessions. Next 16: cookies() is async.
 */
export async function createSessionServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component -- safe to ignore; proxy.ts refreshes.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Write the admin API auth guard**

Create `src/lib/adminAuth.ts`:

```ts
import { createSessionServerClient } from '@/lib/supabase/session';

/**
 * Second auth layer for every /api/admin/* route, in addition to proxy.ts.
 * Caracal has exactly one admin operator -- any authenticated Supabase user
 * IS the admin. No roles table: that machinery belongs to a multi-staff site.
 */
export async function requireAdminSession(): Promise<{ userId: string } | null> {
  const supabase = await createSessionServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { userId: user.id } : null;
}
```

- [ ] **Step 4: Write the route gate**

Create `src/proxy.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next 16 renamed `middleware.ts` -> `proxy.ts`. Refreshes the Supabase auth
 * session on every matched request and gates /admin and /api/admin.
 *
 * Caracal has one admin operator -- any authenticated user is staff. No
 * roles table, no 2FA: that's dianas-bulbinella's multi-staff machinery and
 * is out of scope here.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith('/admin') || path.startsWith('/api/admin');
  const isAdminLogin = path === '/admin/login';

  if (isAdminArea && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }
  if (isAdminLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)'],
};
```

- [ ] **Step 5: Write the admin provisioning script**

Create `scripts/create-admin-user.mjs`:

```js
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [, , email, password] = process.argv;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin-user.mjs <email> <password>');
  console.error('Password is a CLI arg, not written to any file -- pick one and pass it directly.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // no email flow for a single manually-provisioned operator
});

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Created admin user ${data.user.email} (id ${data.user.id}).`);
```

- [ ] **Step 6: Verify it typechecks**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 7: Provision Donald's account and verify the gate**

Tell the user: "Run `node --env-file=.env.local scripts/create-admin-user.mjs donald@caracallodge.co.za <a password you choose>` to create the admin account. Pick the password yourself -- I won't see or store it."

Once created, verify the gate:
```bash
npm run dev
```
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3012/admin
```
Expected: `307` (redirect to `/admin/login` — no session cookie in a bare curl request).

- [ ] **Step 8: Commit**

```bash
git add caracal-footwear/src/lib/supabase/client.ts caracal-footwear/src/lib/supabase/session.ts caracal-footwear/src/lib/adminAuth.ts caracal-footwear/src/proxy.ts caracal-footwear/scripts/create-admin-user.mjs
git commit -m "feat(caracal): session-aware auth clients, admin route gate, provisioning script

Caracal has one admin operator -- any authenticated Supabase user is staff.
No roles table, no 2FA; that machinery belongs to dianas-bulbinella's
multi-staff admin and is out of scope here. Every admin API route gets a
second auth check (requireAdminSession) in addition to proxy.ts, since a
mutation that bypasses the edge gate must still not bypass the app.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Login, forgot-password, reset-password pages

**Files:**
- Create: `src/components/auth/PasswordInput.tsx`
- Create: `src/app/admin/login/page.tsx`, `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`

**Interfaces:**
- Consumes: `createClient` (Task 1).
- Produces: the full sign-in / recover flow. No code interface — these are terminal pages.

- [ ] **Step 1: Delegate to DeepSeek**

Prompt must include the Global Constraints, design tokens, `createClient(persist?: boolean)`'s signature, and:

> Write three files for a Next.js 16.3.0 / React 19 / TypeScript / Tailwind 4 project using dark tokens: `bg-canvas`, `bg-surface`, `text-text`, `text-muted`, `text-accent`, `bg-accent` (buttons), `hover:bg-accent-hi`. `text-accent` is never body copy on canvas.
>
> **File 1: `src/components/auth/PasswordInput.tsx`** -- `'use client'`. Props: `{ id: string; value: string; onChange: (v: string) => void; placeholder?: string; autoComplete?: string; required?: boolean }` (`required` defaults to `true`). A password `<input>` with a "Show"/"Hide" toggle button positioned inside the field on the right, `aria-label` reflecting the current state, `type` switching between `"password"` and `"text"`. Style: `bg-surface border border-text/20 rounded-md px-3 py-2 pr-16 text-sm w-full text-text`, toggle button `text-xs text-muted hover:text-text`.
>
> **File 2: `src/app/admin/login/page.tsx`** -- `'use client'`, wrapped in `<Suspense fallback={null}>` around an inner component that uses `useSearchParams()` (reads `next`, defaults to `/admin`) and `useRouter()`. State: email, password, `remember` (boolean, default `true`), error, loading. On submit: `import { createClient } from '@/lib/supabase/client'`, call `createClient(remember)`, then `supabase.auth.signInWithPassword({ email, password })`. On error, show `authError.message` in a `text-accent` alert. On success, `router.push(next)` then `router.refresh()`. Form: email input, `<PasswordInput>` with a "Forgot password?" link to `/forgot-password` next to its label, a "Keep me signed in" checkbox bound to `remember`, submit button reading "Sign in" / "Signing in…" while loading. Centered card layout, `max-w-md mx-auto px-6 py-16`, card `bg-surface rounded-lg p-8`. Heading: `display text-2xl` "CARACAL ADMIN".
>
> **File 3: `src/app/forgot-password/page.tsx`** -- `'use client'`. State: email, loading, sent (boolean), error. On submit, `createClient()` (no `persist` arg) then `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })`. Supabase doesn't reveal whether the email exists, so always show a success message once the call completes without throwing, regardless of Supabase's own reported error (except a genuine network/throw, which shows a generic error). Same card layout as login. On `sent`, replace the form with "If that email exists, we've sent a reset link." plus a link back to `/admin/login`.
>
> **File 4: `src/app/reset-password/page.tsx`** -- `'use client'`. Uses a stable `const [supabase] = useState(() => createClient())`. On mount, `useEffect` that both checks `supabase.auth.getSession()` for an existing session AND subscribes via `supabase.auth.onAuthStateChange` for a `'PASSWORD_RECOVERY'` event, setting a `ready` boolean true either way (unsubscribe on cleanup). While `!ready`, show "Open the reset link from your email to continue." State: password, confirmPassword, error, success, loading. Validate password length >= 8 and that the two fields match before submitting; on submit call `supabase.auth.updateUser({ password })`. On success show a confirmation with a link to `/admin`. Uses `<PasswordInput>` for both fields with `autoComplete="new-password"`.
>
> Output all four files in this exact format and nothing else:
> ```
> ===FILE: src/components/auth/PasswordInput.tsx===
> ...
> ===END===
> ===FILE: src/app/admin/login/page.tsx===
> ...
> ===END===
> ===FILE: src/app/forgot-password/page.tsx===
> ...
> ===END===
> ===FILE: src/app/reset-password/page.tsx===
> ...
> ===END===
> ```

- [ ] **Step 2: Run DeepSeek and apply**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/opencode-glm-extension"
node ds-run.js "<scratchpad>/ds-p3-task2.md" "<scratchpad>/ds-p3-task2-out.md"
node ds-apply.js "<scratchpad>/ds-p3-task2-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
```
Expected: `Applied 4 file(s).` If fewer, the 8192-token ceiling was hit — split the prompt (PasswordInput + login in one call, forgot/reset-password in a second) and re-run only the missing files.

- [ ] **Step 3: Read every generated file and verify**

Confirm: `PasswordInput` toggles `type` correctly and has an `aria-label`. The login page calls `createClient(remember)` (not the bare `createClient()`) so "keep me signed in" actually does something. Reset-password validates length and match BEFORE calling `updateUser`. No raw hex colours.

- [ ] **Step 4: Typecheck, lint, build**

```bash
npx tsc --noEmit && npx eslint . && npm run build
```
Expected: all exit 0.

- [ ] **Step 5: Verify in the browser**

```bash
npm run dev
```
Open `/admin/login`. Sign in with the account from Task 1 — confirm you land on `/admin` (a 404 is fine for now, the page doesn't exist until Task 3; the point is the redirect happens and a session cookie is set). Sign out by clearing cookies and reload `/admin` — confirm redirect back to `/admin/login?next=%2Fadmin`. Visit `/forgot-password`, submit an email, confirm the "sent" state renders regardless of whether the address is real.

- [ ] **Step 6: Commit**

```bash
git add caracal-footwear/src/components/auth caracal-footwear/src/app/admin/login caracal-footwear/src/app/forgot-password caracal-footwear/src/app/reset-password
git commit -m "feat(caracal): admin login, forgot-password, reset-password pages

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Admin shell — layout, nav, dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/components/admin/AdminNav.tsx`, `src/components/admin/SignOutButton.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `createAdminClient` (Phase 2); `createClient` (Task 1); `formatZAR` (Phase 1); `ORDER_STATUS_LABELS` (Phase 2, `src/lib/orders.ts`).
- Produces: the `/admin` shell every later admin page renders inside.

- [ ] **Step 1: Delegate to DeepSeek**

Prompt must include Global Constraints, tokens, and:

> **`src/components/admin/SignOutButton.tsx`** -- `'use client'`. On click: `import { createClient } from '@/lib/supabase/client'`, `createClient().auth.signOut()`, then `router.push('/admin/login')` and `router.refresh()`. Button text "Sign out", `text-sm text-muted hover:text-text`.
>
> **`src/components/admin/AdminNav.tsx`** -- server component (no `'use client'`). Takes no props. A vertical nav list using `next/link`: Dashboard (`/admin`), Products (`/admin/products`), Orders (`/admin/orders`), Settings (`/admin/settings`). Each link `block px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface rounded-md`. Render `<SignOutButton />` at the bottom.
>
> **`src/app/admin/layout.tsx`** -- async server component wrapping `{children}`. Trusts `proxy.ts` for auth -- does NOT re-check the session itself (that would be redundant with the edge gate and API-route-level `requireAdminSession`). Layout: `<div className="min-h-screen bg-canvas flex">`, a `<aside className="w-56 shrink-0 border-r border-text/10 p-4">` containing a `display text-lg` "CARACAL ADMIN" heading then `<AdminNav />`, and a `<main className="flex-1 p-6 md:p-8">{children}</main>`.
>
> Output all three files:
> ```
> ===FILE: src/components/admin/SignOutButton.tsx===
> ...
> ===END===
> ===FILE: src/components/admin/AdminNav.tsx===
> ...
> ===END===
> ===FILE: src/app/admin/layout.tsx===
> ...
> ===END===
> ```

- [ ] **Step 2: Apply and typecheck**

```bash
node ds-apply.js "<scratchpad>/ds-p3-task3a-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear" && npx tsc --noEmit
```

- [ ] **Step 3: Write the dashboard page directly**

This touches order/stock data across the schema and is small enough to write directly rather than round-trip through DeepSeek. Create `src/app/admin/page.tsx`:

```tsx
import { createAdminClient } from '@/lib/supabase/admin';
import { formatZAR } from '@/lib/money';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/orders';
import Link from 'next/link';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const { data: orders } = await admin.from('orders').select('status, total, created_at');
  const allOrders = orders ?? [];

  const counts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueThisMonth = allOrders
    .filter((o) => o.status === 'paid' || o.status === 'fulfilled')
    .filter((o) => new Date(o.created_at) >= monthStart)
    .reduce((sum, o) => sum + o.total, 0);

  const { data: lowStock } = await admin
    .from('product_variants')
    .select('id, colour_name, size, stock_qty, product:products(name)')
    .eq('active', true)
    .gt('stock_qty', 0)
    .lte('stock_qty', 3)
    .order('stock_qty');

  const statuses: OrderStatus[] = ['pending', 'paid', 'stock_conflict', 'fulfilled', 'failed', 'cancelled'];

  return (
    <div className="space-y-8">
      <h1 className="display text-3xl text-text">DASHBOARD</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statuses.map((s) => (
          <div key={s} className="bg-surface rounded-lg p-4">
            <p className="text-xs text-muted uppercase tracking-wide">{ORDER_STATUS_LABELS[s]}</p>
            <p className="text-2xl text-text mt-1">{counts[s] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-lg p-4">
        <p className="text-xs text-muted uppercase tracking-wide">Revenue this month</p>
        <p className="text-2xl text-text mt-1">{formatZAR(revenueThisMonth)}</p>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Low stock (1-3 remaining)</h2>
        {lowStock && lowStock.length > 0 ? (
          <ul className="bg-surface rounded-lg divide-y divide-text/10">
            {lowStock.map((v) => {
              const product = v.product as unknown as { name: string } | null;
              return (
                <li key={v.id} className="px-4 py-2 text-sm text-text flex justify-between">
                  <span>
                    {product?.name ?? 'Unknown'} — {v.colour_name}, size {v.size}
                  </span>
                  <span className="text-accent">{v.stock_qty} left</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nothing low on stock.</p>
        )}
      </div>

      <Link href="/admin/products" className="text-sm text-text underline underline-offset-4">
        Manage products →
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck, lint, build**

```bash
npx tsc --noEmit && npx eslint . && npm run build
```
Expected: all exit 0.

- [ ] **Step 5: Verify in the browser**

Sign in, land on `/admin`. Confirm the status tiles render (all zero on a fresh DB), revenue shows `R0`, low-stock list shows "Nothing low on stock." Sign out via the button, confirm redirect to `/admin/login`.

- [ ] **Step 6: Commit**

```bash
git add caracal-footwear/src/app/admin/layout.tsx caracal-footwear/src/app/admin/page.tsx caracal-footwear/src/components/admin
git commit -m "feat(caracal): admin shell and dashboard

Layout trusts proxy.ts for auth rather than re-checking -- the session gate
lives in exactly one place.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Storage bucket, image upload/optimize/delete

**Files:**
- Create: `supabase/migrations/0004_storage.sql`
- Create: `src/app/api/admin/products/[id]/images/route.ts`
- Create: `src/components/admin/products/ImageManager.tsx`
- Modify: `package.json` (add `sharp` explicitly)

**Interfaces:**
- Consumes: `createAdminClient` (Phase 2); `requireAdminSession` (Task 1); `ProductImage` type (Phase 1, `src/lib/supabase/types.ts`).
- Produces: `POST /api/admin/products/[id]/images` (multipart upload), `DELETE /api/admin/products/[id]/images` (single or by-colour). `<ImageManager productId={string} colours={string[]} images={ProductImage[]} />`.

- [ ] **Step 1: Write the storage migration**

Create `supabase/migrations/0004_storage.sql`:

```sql
-- Product image storage. Public read (product photos are public by nature);
-- writes go through the admin API's service-role client only, which
-- bypasses RLS entirely -- so no insert/update/delete policy is needed or
-- added, matching the orders table's default-deny-except-service-role
-- pattern from Phase 2.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
```

- [ ] **Step 2: Apply the migration**

Paste into the Supabase SQL editor and run it. Verify: `select id, public from storage.buckets where id = 'product-images';` returns one row with `public = true`.

- [ ] **Step 3: Install sharp explicitly**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npm install sharp
```
Expected: exit 0. (It likely resolves instantly — Next already pulls it in transitively for `next/image`; this just makes it a first-class, pinned dependency for `prepare-images.mjs` and this route to both rely on explicitly.)

- [ ] **Step 4: Write the image API route directly**

File I/O, `sharp`, and Supabase Storage together aren't a good DeepSeek round-trip candidate — write it directly. Create `src/app/api/admin/products/[id]/images/route.ts`:

```ts
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB — sane upper bound on a phone photo

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: productId } = await params;
  const admin = createAdminClient();

  const { data: product, error: productErr } = await admin
    .from('products')
    .select('id, name')
    .eq('id', productId)
    .single();
  if (productErr || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const form = await req.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  const colour = form.get('colour');
  const colourName = typeof colour === 'string' && colour !== '' ? colour : null;

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const { data: existing } = await admin
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1);
  let nextSortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const inserted: { id: string; url: string }[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `${file.name} is larger than 10MB` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Never trust the client's own optimization -- resize and re-encode
    // server-side. 1200x900 matches the card/gallery aspect ratio the
    // frontend already builds around (see scripts/prepare-images.mjs).
    const optimized = await sharp(buffer)
      .resize(1200, 900, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toBuffer();

    const path = `${productId}/${crypto.randomUUID()}.webp`;
    const { error: uploadErr } = await admin.storage
      .from('product-images')
      .upload(path, optimized, { contentType: 'image/webp' });
    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: publicUrl } = admin.storage.from('product-images').getPublicUrl(path);

    const { data: row, error: insertErr } = await admin
      .from('product_images')
      .insert({
        product_id: productId,
        colour_name: colourName,
        url: publicUrl.publicUrl,
        alt: `${product.name}${colourName ? `, ${colourName}` : ''}`,
        sort_order: nextSortOrder++,
      })
      .select('id, url')
      .single();
    if (insertErr || !row) {
      return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 });
    }
    inserted.push(row);
  }

  return NextResponse.json({ success: true, images: inserted });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: productId } = await params;
  const admin = createAdminClient();
  const body = await req.json();

  let targetRows: { id: string; url: string }[] = [];

  if (typeof body.imageId === 'string') {
    const { data } = await admin
      .from('product_images')
      .select('id, url')
      .eq('id', body.imageId)
      .eq('product_id', productId);
    targetRows = data ?? [];
  } else if (typeof body.colour === 'string') {
    // Bulk delete: every image assigned to this colour on this product.
    const { data } = await admin
      .from('product_images')
      .select('id, url')
      .eq('product_id', productId)
      .eq('colour_name', body.colour);
    targetRows = data ?? [];
  } else {
    return NextResponse.json({ error: 'imageId or colour is required' }, { status: 400 });
  }

  if (targetRows.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 });
  }

  const paths = targetRows.map((r) => {
    const marker = '/product-images/';
    const idx = r.url.indexOf(marker);
    return idx === -1 ? r.url : r.url.slice(idx + marker.length);
  });
  await admin.storage.from('product-images').remove(paths);

  const { error: deleteErr } = await admin
    .from('product_images')
    .delete()
    .in('id', targetRows.map((r) => r.id));
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: targetRows.length });
}
```

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 6: Delegate the UI to DeepSeek**

Prompt must include Global Constraints, tokens, the `ProductImage` type (`{ id, product_id, colour_name, url, alt, sort_order }`), and:

> Write `src/components/admin/products/ImageManager.tsx`. `'use client'`. Props: `{ productId: string; colours: string[]; images: ProductImage[] }` (import `ProductImage` from `'@/lib/supabase/types'`).
>
> - A colour `<select>` (options: "All colours" mapping to an empty-string value, plus each entry in `colours`) paired with a native `<input type="file" multiple accept="image/*">` and an "Upload" button. On upload: build a `FormData` with every selected file under the key `files` (append each with `formData.append('files', file)`) and the chosen colour under `colour`, `fetch(`/api/admin/products/${productId}/images`, { method: 'POST', body: formData })`. On success, `router.refresh()` (from `next/navigation`) to reload the server-fetched image list. Show a loading state on the button while uploading and any error message returned by the API in `text-accent`.
> - Below that, a responsive thumbnail grid (`grid grid-cols-2 sm:grid-cols-4 gap-3`) of every image in `images`, each thumbnail showing the image (`<img>` is fine here, not `next/image`, since this is an admin tool not the storefront) at `aspect-square object-cover rounded-md`, a small caption below showing `image.colour_name ?? 'All colours'`, and a "Delete" button overlaid top-right that calls `DELETE` with `{ imageId: image.id }` in the JSON body, then `router.refresh()`.
> - Above the grid, for each DISTINCT colour actually present among `images` (skip `null`/all-colours images), a small "Delete all [colour] photos" button that calls `DELETE` with `{ colour }` in the body, then `router.refresh()`. Ask for confirmation via a plain `window.confirm()` before firing the bulk delete.
>
> Output the complete file:
> ```
> ===FILE: src/components/admin/products/ImageManager.tsx===
> ...
> ===END===
> ```

- [ ] **Step 7: Apply, typecheck, lint**

```bash
node ds-apply.js "<scratchpad>/ds-p3-task4-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear" && npx tsc --noEmit && npx eslint .
```
Expected: all exit 0. (`ImageManager` isn't wired into a page yet — Task 5 does that — so a standalone typecheck is the only check available here.)

- [ ] **Step 8: Commit**

```bash
git add caracal-footwear/supabase/migrations/0004_storage.sql caracal-footwear/src/app/api/admin/products/[id]/images caracal-footwear/src/components/admin/products/ImageManager.tsx caracal-footwear/package.json caracal-footwear/package-lock.json
git commit -m "feat(caracal): product image upload, optimize, and delete

Every upload is resized to 1200x900 and re-encoded to webp server-side with
sharp -- the client's own file is never trusted or stored as-is. Bulk delete
by colour removes both the DB rows and the Storage objects together, never
just one.

API route written directly (file I/O + sharp + Storage isn't a good DeepSeek
round-trip); ImageManager UI generated by DeepSeek v4.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Product list, create, edit pages + API

**Files:**
- Create: `src/components/admin/products/ProductForm.tsx`
- Create: `src/app/admin/products/page.tsx`, `src/app/admin/products/new/page.tsx`, `src/app/admin/products/[id]/page.tsx`
- Create: `src/app/api/admin/products/route.ts`, `src/app/api/admin/products/[id]/route.ts`

**Interfaces:**
- Consumes: `requireAdminSession`, `createAdminClient`; `ProductCategory`, `SignatureType`, `CATEGORY_LABELS`, `ALL_CATEGORIES` (Phase 1); `formatZAR` (Phase 1); `ImageManager` (Task 4, wired in here, not modified).
- Produces: `POST /api/admin/products`, `GET/PATCH /api/admin/products/[id]`. `<ProductForm product={Product | null} onSaved={(id: string) => void} />`.

- [ ] **Step 1: Write the API routes directly**

These enforce validation rules (no hard delete, price is integer cents, category is a real enum value) that are easy for a generic prompt to get subtly wrong — write directly. Create `src/app/api/admin/products/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';
import { ALL_CATEGORIES, type ProductCategory, type SignatureType } from '@/lib/supabase/types';

export const runtime = 'nodejs';

interface ProductInput {
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  style_no: string | null;
  is_signature: boolean;
  signature_type: SignatureType | null;
  base_price: number;
  featured: boolean;
  active: boolean;
}

function validate(body: Partial<ProductInput>): string | null {
  if (!body.slug?.trim()) return 'Slug is required.';
  if (!body.name?.trim()) return 'Name is required.';
  if (!body.category || !ALL_CATEGORIES.includes(body.category)) return 'A valid category is required.';
  if (typeof body.base_price !== 'number' || !Number.isInteger(body.base_price) || body.base_price < 0) {
    return 'Base price must be a non-negative integer number of cents.';
  }
  if (body.is_signature && !body.signature_type) return 'Signature products need a signature_type.';
  if (!body.is_signature && body.signature_type) return 'signature_type must be empty for non-signature products.';
  return null;
}

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('id, slug, name, category, is_signature, active, base_price, variants:product_variants(id)')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(req: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as Partial<ProductInput>;
  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .insert({
      slug: body.slug!.trim(),
      name: body.name!.trim(),
      description: body.description?.trim() ?? '',
      category: body.category!,
      style_no: body.style_no?.trim() || null,
      is_signature: body.is_signature ?? false,
      signature_type: body.signature_type ?? null,
      base_price: body.base_price!,
      featured: body.featured ?? false,
      active: body.active ?? true,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
```

Create `src/app/api/admin/products/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';
import { ALL_CATEGORIES, type ProductCategory, type SignatureType } from '@/lib/supabase/types';

export const runtime = 'nodejs';

interface ProductInput {
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  style_no: string | null;
  is_signature: boolean;
  signature_type: SignatureType | null;
  base_price: number;
  featured: boolean;
  active: boolean;
}

function validate(body: Partial<ProductInput>): string | null {
  if (!body.slug?.trim()) return 'Slug is required.';
  if (!body.name?.trim()) return 'Name is required.';
  if (!body.category || !ALL_CATEGORIES.includes(body.category)) return 'A valid category is required.';
  if (typeof body.base_price !== 'number' || !Number.isInteger(body.base_price) || body.base_price < 0) {
    return 'Base price must be a non-negative integer number of cents.';
  }
  if (body.is_signature && !body.signature_type) return 'Signature products need a signature_type.';
  if (!body.is_signature && body.signature_type) return 'signature_type must be empty for non-signature products.';
  return null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*, variants:product_variants(*), images:product_images(*)')
    .eq('id', id)
    .single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as Partial<ProductInput>;
  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('products')
    .update({
      slug: body.slug!.trim(),
      name: body.name!.trim(),
      description: body.description?.trim() ?? '',
      category: body.category!,
      style_no: body.style_no?.trim() || null,
      is_signature: body.is_signature ?? false,
      signature_type: body.signature_type ?? null,
      base_price: body.base_price!,
      featured: body.featured ?? false,
      active: body.active ?? true,
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

Note: there is deliberately **no `DELETE` handler**. `order_items.variant_id` references `product_variants(id)` with no `ON DELETE` clause (default `RESTRICT`), so a product that has ever been ordered cannot be hard-deleted without breaking order history. `active: false` (set via `PATCH`) is the only supported way to retire a product.

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 3: Delegate the UI to DeepSeek**

Prompt must include Global Constraints, tokens, `CATEGORY_LABELS`/`ALL_CATEGORIES`/`ProductCategory`/`SignatureType` (Phase 1 `src/lib/supabase/types.ts`), `formatZAR`, the API shapes from Step 1, and:

> **`src/components/admin/products/ProductForm.tsx`** -- `'use client'`. Props: `{ product?: { id: string; slug: string; name: string; description: string; category: ProductCategory; style_no: string | null; is_signature: boolean; signature_type: SignatureType | null; base_price: number; featured: boolean; active: boolean } }` (all fields optional via `product` being undefined for a NEW product). Local state seeded from `product` or sane empty defaults (`base_price` defaults to `0`, `category` defaults to the first entry of `ALL_CATEGORIES`, everything else empty/false). Render a form: text inputs for slug/name/style_no, a textarea for description, a `<select>` for category (`ALL_CATEGORIES.map` -> `CATEGORY_LABELS[c]`), a number input for base_price **displayed and edited in whole Rand** (convert to/from cents at the boundary: display `(base_price / 100).toFixed(2)`, on save `Math.round(parseFloat(value) * 100)`), checkboxes for is_signature/featured/active, and when is_signature is checked, a `<select>` for signature_type (`wildlife` | `hide` | `floral`) that's required and hidden otherwise. On submit: `fetch(product ? `/api/admin/products/${product.id}` : '/api/admin/products', { method: product ? 'PATCH' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })`. On success: if creating, `router.push(`/admin/products/${json.id}`)`; if editing, `router.refresh()`. Show the API's error message in `text-accent` on failure. Submit button reads "Save" / "Saving…".
>
> **`src/app/admin/products/page.tsx`** -- async server component. `title: 'Products'` metadata. Fetches `GET /api/admin/products` -- actually, since this is a server component with access to `createAdminClient` directly, query the database directly instead of calling its own API route: `const admin = createAdminClient(); const { data: products } = await admin.from('products').select('id, slug, name, category, is_signature, active, base_price, variants:product_variants(id)').order('name');`. Render a table: columns Name, Category (via `CATEGORY_LABELS`), Signature (a small badge if true), Price (`formatZAR`), Variants (`variants.length`), Active (a small dot/badge), each row linking to `/admin/products/${id}`. A "+ New product" button/link to `/admin/products/new` above the table.
>
> **`src/app/admin/products/new/page.tsx`** -- simple server component wrapper: `<h1 className="display text-3xl text-text mb-6">NEW PRODUCT</h1><ProductForm />`.
>
> Output all three files:
> ```
> ===FILE: src/components/admin/products/ProductForm.tsx===
> ...
> ===END===
> ===FILE: src/app/admin/products/page.tsx===
> ...
> ===END===
> ===FILE: src/app/admin/products/new/page.tsx===
> ...
> ===END===
> ```

- [ ] **Step 4: Apply, typecheck, lint**

```bash
node ds-apply.js "<scratchpad>/ds-p3-task5a-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear" && npx tsc --noEmit && npx eslint .
```

- [ ] **Step 5: Write the product edit page directly**

This wires together `ProductForm` (Step 3) and `ImageManager` (Task 4), and needs Phase 1's `groupVariants`/catalogue helpers plus the exact `ProductImage`/`ProductVariant` shapes — enough cross-file wiring to write directly. Create `src/app/admin/products/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '@/components/admin/products/ProductForm';
import ImageManager from '@/components/admin/products/ImageManager';
import VariantGenerator from '@/components/admin/products/VariantGenerator';
import StockGrid from '@/components/admin/products/StockGrid';
import type { ProductWithVariants } from '@/lib/supabase/types';

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('*, variants:product_variants(*), images:product_images(*)')
    .eq('id', id)
    .single<ProductWithVariants>();

  if (!product) notFound();

  const colours = [...new Set(product.variants.map((v) => v.colour_name))];

  return (
    <div className="space-y-10">
      <h1 className="display text-3xl text-text">{product.name}</h1>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Details</h2>
        <ProductForm product={product} />
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Colours &amp; sizes</h2>
        <VariantGenerator productId={product.id} existingColours={colours} />
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Stock</h2>
        <StockGrid productId={product.id} variants={product.variants} />
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Photos</h2>
        <ImageManager productId={product.id} colours={colours} images={product.images} />
      </section>
    </div>
  );
}
```

(`VariantGenerator` and `StockGrid` are built in Task 6 — this page won't compile until then. That's expected; Task 6 is the next step.)

- [ ] **Step 6: Commit**

```bash
git add caracal-footwear/src/components/admin/products/ProductForm.tsx caracal-footwear/src/app/admin/products caracal-footwear/src/app/api/admin/products
git commit -m "feat(caracal): product list, create, and edit pages

No hard delete -- order_items references product_variants with no ON DELETE
clause, so a product that has ever been ordered can't be removed without
breaking order history. active:false is the only supported retirement path.

ProductForm and the product list/new pages generated by DeepSeek v4; the
API routes and the edit page (which wires four components together) written
directly. The edit page doesn't build yet -- it references VariantGenerator
and StockGrid, built in Task 6 next.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Bulk variant generator + stock grid

**Files:**
- Create: `src/app/api/admin/products/[id]/variants/bulk/route.ts`, `src/app/api/admin/products/[id]/variants/route.ts`
- Create: `src/components/admin/products/VariantGenerator.tsx`, `src/components/admin/products/StockGrid.tsx`

**Interfaces:**
- Consumes: `requireAdminSession`, `createAdminClient`; `ALL_SIZES` (Phase 1); `ProductVariant` type (Phase 1).
- Produces: `POST /api/admin/products/[id]/variants/bulk`, `PATCH /api/admin/products/[id]/variants`. `<VariantGenerator productId colours />`, `<StockGrid productId variants />` — completes `src/app/admin/products/[id]/page.tsx` from Task 5.

- [ ] **Step 1: Write the bulk-generate route directly**

The upsert semantics (add missing combinations, never clobber existing stock) are exactly the kind of subtle correctness rule worth writing by hand. Create `src/app/api/admin/products/[id]/variants/bulk/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';
import { ALL_SIZES } from '@/lib/supabase/types';

export const runtime = 'nodejs';

interface BulkGenerateBody {
  colours: { name: string; hex: string }[];
  sizes: number[];
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: productId } = await params;
  const body = (await req.json()) as Partial<BulkGenerateBody>;

  if (!Array.isArray(body.colours) || body.colours.length === 0) {
    return NextResponse.json({ error: 'At least one colour is required.' }, { status: 400 });
  }
  if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
    return NextResponse.json({ error: 'At least one size is required.' }, { status: 400 });
  }
  const invalidSize = body.sizes.find((s) => !ALL_SIZES.includes(s));
  if (invalidSize !== undefined) {
    return NextResponse.json({ error: `Size ${invalidSize} is out of range (4-15).` }, { status: 400 });
  }
  for (const c of body.colours) {
    if (!c.name?.trim() || !/^#[0-9a-fA-F]{6}$/.test(c.hex ?? '')) {
      return NextResponse.json({ error: `Colour "${c.name ?? ''}" needs a name and a #RRGGBB hex value.` }, { status: 400 });
    }
  }

  const rows = body.colours.flatMap((c) =>
    body.sizes!.map((size) => ({
      product_id: productId,
      colour_name: c.name.trim(),
      colour_hex: c.hex,
      size,
      stock_qty: 0,
      price_override: null,
      active: true,
    })),
  );

  const admin = createAdminClient();
  // ignoreDuplicates: true -- an existing (product_id, colour_name, size) row
  // is left completely untouched, so re-running this never zeroes out stock
  // someone already entered.
  const { error, count } = await admin
    .from('product_variants')
    .upsert(rows, { onConflict: 'product_id,colour_name,size', ignoreDuplicates: true, count: 'exact' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, attempted: rows.length, created: count ?? null });
}
```

Create `src/app/api/admin/products/[id]/variants/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

interface VariantUpdate {
  id: string;
  stock_qty: number;
  active: boolean;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: productId } = await params;
  const body = (await req.json()) as { variants?: VariantUpdate[] };

  if (!Array.isArray(body.variants) || body.variants.length === 0) {
    return NextResponse.json({ error: 'No variants provided.' }, { status: 400 });
  }
  for (const v of body.variants) {
    if (!v.id || typeof v.stock_qty !== 'number' || !Number.isInteger(v.stock_qty) || v.stock_qty < 0) {
      return NextResponse.json({ error: `Invalid stock_qty for variant ${v.id ?? '?'}.` }, { status: 400 });
    }
  }

  const admin = createAdminClient();

  // Verify every variant actually belongs to this product before writing --
  // the client sends variant ids, and a stray/tampered id must not let one
  // product's stock grid write another product's row.
  const { data: owned } = await admin
    .from('product_variants')
    .select('id')
    .eq('product_id', productId)
    .in('id', body.variants.map((v) => v.id));
  const ownedIds = new Set((owned ?? []).map((r) => r.id));
  if (body.variants.some((v) => !ownedIds.has(v.id))) {
    return NextResponse.json({ error: 'One or more variants do not belong to this product.' }, { status: 403 });
  }

  for (const v of body.variants) {
    const { error } = await admin
      .from('product_variants')
      .update({ stock_qty: v.stock_qty, active: v.active })
      .eq('id', v.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: body.variants.length });
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npx tsc --noEmit
```
Expected: exit 0 (the two new route files typecheck standalone; the still-unfinished edit page from Task 5 will keep failing until Step 4 below lands the two components it imports).

- [ ] **Step 3: Delegate the UI to DeepSeek**

Prompt must include Global Constraints, tokens, `ALL_SIZES: number[]` (Phase 1, values 4-15), the `ProductVariant` type, and:

> **`src/components/admin/products/VariantGenerator.tsx`** -- `'use client'`. Props: `{ productId: string; existingColours: string[] }`. Local state: a list of `{ name: string; hex: string }` colour rows (start with one empty row: `{ name: '', hex: '#B5763A' }`), a `Set<number>` of selected sizes from `ALL_SIZES` (start empty), loading, result message. UI: for each colour row, a text input for `name` and a native `<input type="color">` bound to `hex`, plus a "Remove" button (disabled when it's the only row) and an "Add colour" button appending a new empty row. Below that, a row of checkboxes/toggle-chips for every size in `ALL_SIZES` (4 through 15). A "Generate variants" button, disabled while loading or when there are zero non-empty colour names or zero selected sizes. On click: `fetch(`/api/admin/products/${productId}/variants/bulk`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ colours: <non-empty rows>, sizes: [...selectedSizes] }) })`. On success, show `Generated ${json.created ?? json.attempted} new variant(s).` and call `router.refresh()`. On failure show the API's error in `text-accent`. Mention existingColours nowhere in the request -- it's accepted as a prop only so a future iteration could pre-fill from it; for now just render the form as described.
>
> **`src/components/admin/products/StockGrid.tsx`** -- `'use client'`. Props: `{ productId: string; variants: ProductVariant[] }` (import `ProductVariant` from `'@/lib/supabase/types'`). Group `variants` by `colour_name` into rows, with one column per distinct `size` present across all variants (sorted ascending) -- render as an HTML `<table>`: header row is sizes, each body row is one colour with a numeric `<input type="number" min="0">` per size bound to that variant's `stock_qty`, plus a small checkbox per cell (or per row -- your call, per-cell is more correct) bound to `active`. If a given colour has no variant for a given size, render an empty/disabled cell rather than crashing. Keep all edits in local component state (a `Map<string, {stock_qty:number; active:boolean}>` keyed by variant id) until "Save stock" is clicked. On save: `fetch(`/api/admin/products/${productId}/variants`, { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ variants: [...map values as {id, stock_qty, active}] }) })`, then `router.refresh()` on success, show the API error on failure. Low stock (1-3) gets a `text-accent` numeric input; zero gets `text-muted`.
>
> Output both files:
> ```
> ===FILE: src/components/admin/products/VariantGenerator.tsx===
> ...
> ===END===
> ===FILE: src/components/admin/products/StockGrid.tsx===
> ...
> ===END===
> ```

- [ ] **Step 4: Apply, typecheck, lint, build**

```bash
node ds-apply.js "<scratchpad>/ds-p3-task6-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear" && npx tsc --noEmit && npx eslint . && npm run build
```
Expected: all exit 0. This is the first point `src/app/admin/products/[id]/page.tsx` (Task 5) actually compiles, since it imports both components built here.

- [ ] **Step 5: Verify the full product-edit workflow in the browser**

```bash
npm run dev
```
Sign in, go to `/admin/products/new`, create a test product (any category, base price e.g. `R199.00`). Open its edit page. In the variant generator, add two colours (e.g. Tan `#B5763A`, Black `#14110F`) and tick sizes 8, 9, 10, click Generate — confirm the success message and that the stock grid below now shows a 2-row × 3-column table. Enter stock quantities, save, reload the page, confirm the values persisted. Toggle one variant's active checkbox off, save, reload, confirm it stuck. Delete the test product's data afterward via SQL (`delete from products where slug = '<test slug>';` — cascades to its variants/images).

- [ ] **Step 6: Commit**

```bash
git add caracal-footwear/src/app/api/admin/products/[id]/variants caracal-footwear/src/components/admin/products/VariantGenerator.tsx caracal-footwear/src/components/admin/products/StockGrid.tsx
git commit -m "feat(caracal): bulk variant generator and stock grid

Bulk-generate is an upsert with ignoreDuplicates -- re-running it after
Donald has already entered stock never zeroes anything out, it only fills in
missing colour/size combinations. The stock-save route re-verifies every
variant id actually belongs to the product before writing, so a stray id
can't touch another product's row.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Orders admin — list, detail, fulfilment

**Files:**
- Create: `src/app/admin/orders/page.tsx`, `src/app/admin/orders/[id]/page.tsx`
- Create: `src/app/api/admin/orders/route.ts`, `src/app/api/admin/orders/[id]/status/route.ts`

**Interfaces:**
- Consumes: `requireAdminSession`, `createAdminClient`; `OrderStatus`, `ORDER_STATUS_LABELS` (Phase 2, `src/lib/orders.ts`); `formatZAR` (Phase 1).
- Produces: `GET /api/admin/orders`, `PATCH /api/admin/orders/[id]/status`.

- [ ] **Step 1: Write the status-update route directly**

This is where the Phase 2 invariant gets enforced — worth writing and reading carefully by hand, not delegating. Create `src/app/api/admin/orders/[id]/status/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

/**
 * Staff can move an order to `fulfilled` and ONLY `fulfilled`. `paid` and
 * `stock_conflict` are set exclusively by the PayFast ITN handler
 * (src/app/api/payfast/notify/route.ts) -- payment state is never something
 * a human sets by hand, full stop. Rejecting every other target here is the
 * enforcement point; the admin UI only ever offering "Mark fulfilled" is
 * just the friendlier half of that, not the actual guarantee.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as { status?: string };

  if (body.status !== 'fulfilled') {
    return NextResponse.json(
      { error: 'Only "fulfilled" can be set by staff. Payment status is set by PayFast only.' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: order } = await admin.from('orders').select('status').eq('id', id).single();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Only a paid order can be marked fulfilled -- an order that's still
  // pending, or that never got past stock_conflict, hasn't actually shipped.
  if (order.status !== 'paid') {
    return NextResponse.json(
      { error: `Cannot fulfil an order with status "${order.status}" -- only a paid order can be fulfilled.` },
      { status: 400 },
    );
  }

  const { error } = await admin.from('orders').update({ status: 'fulfilled' }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

Create `src/app/api/admin/orders/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('orders')
    .select('id, order_number, customer_name, email, status, total, created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 3: Delegate the pages to DeepSeek**

Prompt must include Global Constraints, tokens, `OrderStatus`/`ORDER_STATUS_LABELS` (Phase 2), `formatZAR`, and:

> **`src/app/admin/orders/page.tsx`** -- async server component. `title: 'Orders'`. Query directly via `createAdminClient()` (`import { createAdminClient } from '@/lib/supabase/admin'`): `.from('orders').select('id, order_number, customer_name, status, total, created_at').order('created_at', { ascending: false })`. Render a table: Order #, Customer, Status (a small coloured badge -- `bg-accent/20 text-accent` for `pending`, `bg-accent text-canvas` for `paid`/`fulfilled`, `bg-text/10 text-muted` for `cancelled`/`failed`, a visibly alarming style e.g. `bg-accent text-canvas border border-accent` with the word prefixed "⚠" for `stock_conflict`), Total (`formatZAR`), Date (`new Date(created_at).toLocaleDateString('en-ZA')`), each row linking to `/admin/orders/${id}`.
>
> **`src/app/admin/orders/[id]/page.tsx`** -- async server component, `params` is a Promise (Next 16 -- await it). Query the order plus its items directly via `createAdminClient()`: order via `.from('orders').select('*').eq('id', id).single()`, items via `.from('order_items').select('*').eq('order_id', id)`. If no order, call `notFound()` from `'next/navigation'`. Render: order number as heading, status badge (same scheme as the list page), customer name/email/phone, full delivery address, an items table (product_name, colour, size, qty, unit_price and line total via `formatZAR`), subtotal/delivery_fee/total. Below that, a small client island `<FulfilOrderButton orderId={order.id} currentStatus={order.status} />` -- define this as a second component IN THE SAME FILE marked `'use client'` at the top of its own block is not possible in one file with a server component default export, so put it in a separate exported function... actually just inline a `'use client'` sub-file: create `src/components/admin/orders/FulfilOrderButton.tsx` as a fourth file. That component: `'use client'`, props `{ orderId: string; currentStatus: string }`. If `currentStatus !== 'paid'`, render nothing (or a disabled note "Only a paid order can be marked fulfilled" when `currentStatus` is `'pending'` or `'stock_conflict'` or `'failed'` or `'cancelled'`), if `currentStatus === 'fulfilled'` show a static "Fulfilled" label with no button. Otherwise show a "Mark fulfilled" button that `PATCH`es `/api/admin/orders/${orderId}/status` with `{ status: 'fulfilled' }`, then `router.refresh()` on success, shows the API's error in `text-accent` on failure.
>
> Output all three files:
> ```
> ===FILE: src/app/admin/orders/page.tsx===
> ...
> ===END===
> ===FILE: src/app/admin/orders/[id]/page.tsx===
> ...
> ===END===
> ===FILE: src/components/admin/orders/FulfilOrderButton.tsx===
> ...
> ===END===
> ```

- [ ] **Step 4: Apply, typecheck, lint, build**

```bash
node ds-apply.js "<scratchpad>/ds-p3-task7-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear" && npx tsc --noEmit && npx eslint . && npm run build
```
Expected: all exit 0.

- [ ] **Step 5: Verify the invariant holds, live**

```bash
npm run dev
```
Create a throwaway order directly in SQL at `status = 'pending'` (mirror the shape from Phase 2's verification scripts), open its admin detail page, confirm no fulfil button is offered (or it's disabled) since it isn't `paid`. Update it to `status = 'paid'` via SQL, reload, click "Mark fulfilled", confirm it flips. Then attempt to force an illegal transition directly against the API:
```bash
curl -s -X PATCH http://localhost:3012/api/admin/orders/<id>/status \
  -H "Content-Type: application/json" -d '{"status":"paid"}' \
  -w "\n%{http_code}\n"
```
Expected: `400` with the "Only \"fulfilled\" can be set by staff" message — proves the invariant is enforced at the API, not just hidden in the UI. Clean up the throwaway order: `delete from orders where order_number = '<test>';`.

- [ ] **Step 6: Commit**

```bash
git add caracal-footwear/src/app/admin/orders caracal-footwear/src/app/api/admin/orders caracal-footwear/src/components/admin/orders
git commit -m "feat(caracal): order list, detail, and fulfilment

Verified live that PATCH /api/admin/orders/[id]/status rejects any target
status other than fulfilled -- the Phase 2 invariant (payment state is
ITN-only) is enforced at the API, not just hidden from the UI.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Settings admin

**Files:**
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/app/api/admin/settings/route.ts`

**Interfaces:**
- Consumes: `requireAdminSession`, `createAdminClient`; `getSiteSettings` (Phase 1, for reference on the key set, not called from here).
- Produces: `GET /api/admin/settings`, `PATCH /api/admin/settings`.

- [ ] **Step 1: Write the API route directly**

Small and fully spec-known (the exact six `site_settings` keys from Phase 1's migration) — quicker to write than prompt. Create `src/app/api/admin/settings/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const KNOWN_KEYS = [
  'delivery_free_threshold',
  'delivery_fee',
  'lead_time',
  'contact_phone',
  'contact_email',
  'whatsapp_number',
] as const;

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from('site_settings').select('key, value');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as Record<string, string>;

  const unknownKey = Object.keys(body).find((k) => !KNOWN_KEYS.includes(k as (typeof KNOWN_KEYS)[number]));
  if (unknownKey) {
    return NextResponse.json({ error: `Unknown setting key: ${unknownKey}` }, { status: 400 });
  }
  if ('delivery_free_threshold' in body || 'delivery_fee' in body) {
    for (const key of ['delivery_free_threshold', 'delivery_fee']) {
      if (key in body && (!Number.isInteger(Number(body[key])) || Number(body[key]) < 0)) {
        return NextResponse.json({ error: `${key} must be a non-negative integer number of cents.` }, { status: 400 });
      }
    }
  }

  const admin = createAdminClient();
  for (const [key, value] of Object.entries(body)) {
    const { error } = await admin.from('site_settings').update({ value: String(value) }).eq('key', key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npx tsc --noEmit
```
Expected: exit 0.

- [ ] **Step 3: Delegate the page to DeepSeek**

Prompt must include Global Constraints, tokens, `formatZAR`, and:

> Write `src/app/admin/settings/page.tsx`. `'use client'` (the whole page, for simplicity, rather than splitting server-fetch/client-form). On mount (`useEffect`), `fetch('/api/admin/settings')`, turn the returned `settings: {key,value}[]` array into a `Record<string,string>` keyed by `key`, hold it in state. Render a form with one labeled field per known key: `delivery_free_threshold` and `delivery_fee` as **Rand** number inputs (convert cents<->Rand at the display boundary exactly like `ProductForm` does for `base_price` -- display `(Number(value)/100).toFixed(2)`, convert back to integer cents on save), `lead_time`/`contact_phone`/`contact_email`/`whatsapp_number` as plain text inputs. Labels: "Free delivery threshold (R)", "Delivery fee (R)", "Lead time", "Contact phone", "Contact email", "WhatsApp number". On submit, `PATCH /api/admin/settings` with the full edited record (converting the two money fields back to integer-cent strings first), show a "Saved" confirmation or the API's error. Standard admin styling: `bg-surface` card, `display text-3xl` heading "SETTINGS", `bg-accent text-canvas` submit button.
>
> Output the complete file:
> ```
> ===FILE: src/app/admin/settings/page.tsx===
> ...
> ===END===
> ```

- [ ] **Step 4: Apply, typecheck, lint, build**

```bash
node ds-apply.js "<scratchpad>/ds-p3-task8-out.md" "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear" && npx tsc --noEmit && npx eslint . && npm run build
```
Expected: all exit 0.

- [ ] **Step 5: Verify in the browser**

Open `/admin/settings`. Confirm the six current values load (delivery threshold shows `1000.00`, fee `99.00`, lead time "5 working days", etc. — the Phase 1 seed values). Change the lead time to a test string, save, reload, confirm it persisted. Change it back to `"5 working days"` and save again, confirming you've left the real setting as you found it.

- [ ] **Step 6: Commit**

```bash
git add caracal-footwear/src/app/admin/settings caracal-footwear/src/app/api/admin/settings
git commit -m "feat(caracal): settings admin

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: End-to-end verification

Demonstrates the full admin workflow works together, not just each piece in isolation.

**Files:** none (verification only; fixes go wherever the bug actually is).

- [ ] **Step 1: Full test suite, typecheck, lint, build**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity/caracal-footwear"
npm test && npx tsc --noEmit && npx eslint . && npm run build
```
Expected: all exit 0. (No new unit tests were added this phase — everything here is either UI or a thin API route validated by live verification, matching Phase 2's split between pure-logic-gets-tests and IO-gets-live-verification.)

- [ ] **Step 2: Full browser walkthrough of a real product, start to finish**

```bash
npm run dev
```
1. Sign in at `/admin/login`.
2. `/admin/products/new` — create a real-shaped product (pick one of Phase 1's 11 seeded products' worth of data, or a clearly-marked `TEST-` product — your choice, but clean it up after).
3. On its edit page: generate variants for 2 colours × 3 sizes, fill in stock on the grid, upload two photos (one assigned to a specific colour, one left at "All colours"), confirm the thumbnail grid shows both.
4. Visit the public `/product/<slug>` page for that product (from Phase 1) and confirm the new photos and stock actually show up there — this is the point where the admin's writes and the storefront's reads have to agree.
5. Bulk-delete the colour-specific photo via "Delete all `<colour>` photos", confirm it disappears from both the admin thumbnail grid and the public PDP on reload.
6. `/admin/orders` — confirm the list renders (empty is fine if no real orders exist).
7. `/admin/settings` — confirm it still shows the values left in place at the end of Task 8.
8. Deactivate the test product (`active` off, save) and confirm it disappears from `/range` on the public site (Phase 1's `listProducts` already filters on `active`).
9. Delete the test product entirely via SQL (`delete from products where slug = '<test>';` — cascades variants/images) and manually remove its uploaded files from the `product-images` Storage bucket via the Supabase dashboard, since the DB cascade doesn't touch Storage objects.

- [ ] **Step 3: Confirm the codebase is clean**

```bash
cd "c:/Users/info/OneDrive/Documents/Antigravity"
git status --short caracal-footwear
```
Expected: no output (everything from this phase committed, no test artifacts left behind).

- [ ] **Step 4: Commit any fixes found during walkthrough**

Only if Step 2 surfaced something. Otherwise there's nothing new to commit — this task is verification, not guaranteed to produce a diff.

---

## Phase 3 Definition of Done

- [ ] `npm test`, `npx tsc --noEmit`, `npx eslint .`, `npm run build` all exit 0.
- [ ] `/admin` is unreachable without a session (redirects to `/admin/login`); every `/api/admin/*` route independently rejects an unauthenticated request too.
- [ ] A product can be created, its variant grid generated, its stock filled in, photos uploaded and bulk-deleted by colour, and the result is visible on the live storefront pages built in Phase 1.
- [ ] An order can be viewed and marked fulfilled — and, verified against the live API, cannot be forced into `paid` or `stock_conflict` by a staff action.
- [ ] Settings can be read and edited, and the storefront (Phase 1/2) reads whatever is currently saved.
- [ ] No raw hex colours in any component -- tokens only.
- [ ] No secrets committed; Donald's password was never written to a file.

---

## Roadmap — remaining phases

**Phase 4 — Cinematic layer & content.** GSAP ScrollTrigger homepage (nine beats per spec §6) · `/signature` collection landing · `/story` · `/size-guide` · `/care` · `/contact` with honeypot and timing anti-bot · `/faq` · `/shipping-returns` · `/privacy` · `/terms`. Motion on `/`, `/signature` and `/story` only; `prefers-reduced-motion` honoured. Ends with a `design-self-audit` run.

**Phase 5 — Reviews & Field Journal.** Review submission → moderation queue → PDP display · journal generation via the Anthropic API with **both** a cron and a manual "Generate now" button · approve queue · publish cron · Supabase keep-alive GitHub Action. Adds Reviews and Journal nav entries to the admin shell built in this phase.
