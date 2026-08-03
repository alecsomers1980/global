# Stick to Your Name — Admin Portal & Customer Features Build Spec

This is the single source of truth for the build. It is prepended to every DeepSeek
code-generation prompt, so generated code MUST match the contracts, names, and
conventions defined here exactly.

## Stack (do not change)
- Next.js 15 App Router + TypeScript, React 19
- Tailwind v3 (brand colours: `brand-pink`, `brand-teal`, `brand-purple`, `brand-orange`, `brand-yellow`, `brand-green`, `brand-blue`)
- `@vercel/postgres` (import `{ sql }`)
- `bcryptjs` for hashing, `jose` for JWT cookies
- `lucide-react` for icons
- NEW deps: `resend` (email), `@vercel/blob` (image upload)
- All API routes: `export const runtime = 'nodejs';` and parse JSON defensively.
- Money is always stored/handled in integer cents. Display helper `R ${(cents/100).toFixed(2)}`.

## Conventions
- Server-only DB access through `src/lib/db.ts`. Never import `@vercel/postgres` in client components.
- Client components start with `'use client';`.
- Admin pages are server components that call `requireAdmin()` and `redirect('/admin/login')` if not authed.
- Keep existing visual style: white rounded-2xl cards, `shadow-sm`, gray-50 background.
- Reuse existing colours/spacing. Do not restyle the existing public order form beyond what the catalog refactor requires.

## Environment variables (.env.example must list all)
```
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=
PAYFAST_MODE=sandbox
NEXT_PUBLIC_SITE_URL=http://localhost:3000
POSTGRES_URL=
ADMIN_SESSION_SECRET=change-me-to-a-long-random-string
# Seed admin (used only on first run to create the admin_users row)
ADMIN_EMAIL=melissa@aloesigns.co.za
ADMIN_PASSWORD_HASH=
# Resend
RESEND_API_KEY=
EMAIL_FROM=noreply@sticktoyourname.co.za
EMAIL_ADMIN=melissa@aloesigns.co.za
# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```

## Database schema (all in src/lib/db.ts `ensureSchema()`, idempotent)

### orders (existing — keep all columns) add:
- `status_updated_at TIMESTAMPTZ`

### settings (single row, id=1)
```
CREATE TABLE IF NOT EXISTS settings (
  id                  INTEGER PRIMARY KEY DEFAULT 1,
  set_price_cents     INTEGER NOT NULL DEFAULT 15000,
  bagtag_price_cents  INTEGER NOT NULL DEFAULT 1500,
  collect_price_cents INTEGER NOT NULL DEFAULT 0,
  pudo_price_cents    INTEGER NOT NULL DEFAULT 7000,
  courier_price_cents INTEGER NOT NULL DEFAULT 10000,
  CONSTRAINT settings_single CHECK (id = 1)
);
```
Seed one row if none exists.

### designs (admin-managed catalog)
```
CREATE TABLE IF NOT EXISTS designs (
  id          TEXT PRIMARY KEY,         -- kebab-case slug
  name        TEXT NOT NULL,
  popular     BOOLEAN NOT NULL DEFAULT FALSE,
  image_url   TEXT,                     -- Vercel Blob URL, null => gradient fallback
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
On first run, if table empty, seed from the legacy DESIGNS array currently in
`src/lib/designs.ts` (keep that array exported as `SEED_DESIGNS` for seeding only).

### admin_users (single admin for now, but table-based so reset works)
```
CREATE TABLE IF NOT EXISTS admin_users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
Seed from `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` if table empty and both env present.

### password_resets
```
CREATE TABLE IF NOT EXISTS password_resets (
  token       TEXT PRIMARY KEY,         -- random 32-byte hex
  admin_id    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE
);
```

### contact_messages
```
CREATE TABLE IF NOT EXISTS contact_messages (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## db.ts exported functions (in addition to existing ones — keep existing signatures)
- `ensureSchema()` — creates ALL tables + runs all seeds (designs, settings, admin). Safe to call repeatedly.
- Settings: `getSettings(): Promise<SettingsRow>`, `updateSettings(patch): Promise<void>`
- Designs: `listDesigns(opts?: {activeOnly?: boolean}): Promise<DesignRow[]>` (ordered by sort_order, name), `getDesign(id)`, `createDesign(d)`, `updateDesign(id, patch)`, `deleteDesign(id)`
- Admin: `getAdminByEmail(email)`, `getAdminById(id)`, `updateAdminPassword(id, hash)`
- Resets: `createReset(token, adminId, expiresAt)`, `getReset(token)`, `markResetUsed(token)`
- Contact: `insertContactMessage(m)`, `listContactMessages()`, `markMessageRead(id)`
- Orders: add `markOrderStatus(id, status)` already exists — also set `status_updated_at = NOW()`. Add `getPaidStats()` if convenient (optional).
- Keep `OrderStatus` type. Status values: `pending | paid | cancelled | failed | printing | shipped | completed`. (Admin can move a paid order through fulfilment.)

Type rows: export `SettingsRow`, `DesignRow`, `AdminRow`, `ContactRow`.

## Pricing source of truth
`getSettings()` replaces the hardcoded `PRICE_SET_CENTS` / `PRICE_BAGTAG_CENTS` / `DELIVERY[].priceCents`.
Delivery option labels/descriptions stay static in `designs.ts` (`DELIVERY_META`), but prices come from settings.

## src/lib/email.ts (Resend wrapper)
```ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM!;
const ADMIN = process.env.EMAIL_ADMIN!;
```
Functions (all best-effort: wrap in try/catch, log, never throw to caller):
- `sendOrderStatusEmail(order, newStatus)` — to customer. Friendly subject per status.
- `sendContactNotification(msg)` — to ADMIN, reply-to customer email.
- `sendPasswordResetEmail(toEmail, resetUrl)` — to admin.
- `sendNewOrderEmail(order)` — to ADMIN when an order is marked paid (optional, called from payfast notify).
If `RESEND_API_KEY` is missing, functions return silently (so local dev still works).

## src/lib/admin.ts (refactor)
- Keep cookie name `stick_admin`, JWT via jose.
- `createSessionCookie(adminId: string, remember: boolean)` — payload `{ role:'admin', sub: adminId }`. `remember` => maxAge 30d, else session cookie (no maxAge).
- `verifyAdminLogin(email, password): Promise<AdminRow | null>` — looks up `getAdminByEmail`, bcrypt.compare.
- `getSessionAdminId(): Promise<string | null>` — verify cookie, return sub.
- `isAdmin()` — boolean wrapper.
- `requireAdmin()` — returns adminId or null (pages do the redirect).
- `clearSessionCookie()` — unchanged.
- Remove the old env-hash `verifyAdminPassword`.

## API routes (all under src/app/api)

### Public
- `GET /api/catalog` → `{ designs: DesignRow[] (activeOnly), settings: SettingsRow, delivery: DELIVERY_META }`. `dynamic = 'force-dynamic'`.
- `POST /api/orders/create` (existing — UPDATE) → validate designId against DB active designs, compute amount from `getSettings()`, keep PayFast flow unchanged otherwise.
- `POST /api/orders/track` → body `{ orderId, email }`. Looks up order by id; verify email matches `customer_email` (case-insensitive). Returns `{ status, design_name, child_name, created_at, paid_at, status_updated_at }` or 404 `{error}`. Rate-limit per IP (reuse the in-memory pattern from existing login route).
- `POST /api/contact` → body `{ name, email, phone?, message }`. Validate (name>=2, valid email, message>=5). Insert + `sendContactNotification`. Rate-limit per IP. Return `{ ok:true }`.

### Admin auth
- `POST /api/admin/login` (UPDATE) → body `{ email, password, remember }`. Use `verifyAdminLogin`; on success `createSessionCookie(admin.id, !!remember)`. Keep rate limiting. Return `{ ok:true }` / 401.
- `POST /api/admin/logout` (existing GET? keep as GET that clears cookie + redirects to /admin/login). Keep working.
- `POST /api/admin/forgot` → body `{ email }`. If admin exists, create reset token (1h expiry), email link `${SITE_URL}/admin/reset?token=...`. ALWAYS return `{ ok:true }` (don't leak whether email exists).
- `POST /api/admin/reset` → body `{ token, password }`. Validate token (exists, not used, not expired), bcrypt-hash new password (cost 10), `updateAdminPassword`, `markResetUsed`. Return `{ ok:true }` / 400.

### Admin data (every handler: `if (!(await isAdmin())) return 401`)
- `POST /api/admin/orders/status` → `{ orderId, status }`. Validate status in allowed set. `markOrderStatus`. If status changed and customer email present, `sendOrderStatusEmail`. Return `{ ok:true }`.
- `GET /api/admin/designs` → all designs (incl inactive).
- `POST /api/admin/designs` → create `{ id, name, popular, image_url, active, sort_order }`. Validate id is unique kebab-case.
- `PATCH /api/admin/designs` → `{ id, ...patch }` update.
- `DELETE /api/admin/designs?id=...` → delete.
- `POST /api/admin/designs/upload` → multipart/form-data with `file`. Use `@vercel/blob` `put(filename, file, { access:'public' })`. Return `{ url }`. Accept images only, max ~5MB.
- `GET /api/admin/settings` → settings. `POST /api/admin/settings` → update price fields (validate non-negative integers).
- `GET /api/admin/messages` → list. `POST /api/admin/messages/read` → `{ id }` mark read.

## Pages (src/app)

### Public: page.tsx (REFACTOR — minimal)
- Convert to a thin server component `page.tsx` that fetches catalog server-side (`getSettings`, `listDesigns({activeOnly:true})`, `DELIVERY_META`) and renders `<OrderForm designs settings delivery />`.
- Move the existing big client form into `src/app/OrderForm.tsx` (`'use client'`), accepting props instead of importing static DESIGNS/PRICE constants. Pricing/gradients logic unchanged except sourced from props. If `design.image_url` exists, render `<img>` thumbnail (object-cover rounded), else keep the gradient circle fallback.
- Add a header/footer link "Track my order" and "Contact" → `/contact`. The track link opens `<TrackOrderModal />`.

### TrackOrderModal — `src/app/TrackOrderModal.tsx` (`'use client'`)
- Popup (fixed overlay, white rounded-2xl card, close X). Inputs: order number + email. Calls `/api/orders/track`. Shows a status timeline/badge (pending→paid→printing→shipped→completed) and child name/design. Friendly messages per status. Handles 404 ("We couldn't find that order — check the number and email.").

### /contact — `src/app/contact/page.tsx`
- Client form: name, email, phone (optional), message. Posts `/api/contact`. Success + error states. Reuse card styling. Include Aloe Signs address/WhatsApp from footer. Link back home.

### Admin
- `/admin/login` (UPDATE) — add email field, "Remember me" checkbox, show/hide password toggle (Eye/EyeOff icon), "Forgot password?" link → `/admin/forgot`. Post `{email,password,remember}`.
- `/admin/forgot` — email input → POST `/api/admin/forgot` → always show "If that email exists, a reset link has been sent."
- `/admin/reset` — reads `?token=`, new password + confirm, show/hide toggle → POST `/api/admin/reset` → on success redirect to `/admin/login`.
- `/admin` (UPDATE) — keep stats + order cards. Add: nav bar linking Orders / Designs / Pricing / Messages / Sign out. Each OrderCard gets a status `<select>` (client subcomponent `OrderStatusControl`) that POSTs `/api/admin/orders/status` and refreshes. Show fulfilment statuses too.
- `/admin/designs` — table/grid of all designs. Add-new form (name, slug auto from name, popular toggle, image upload via `/api/admin/designs/upload`, active toggle, sort order). Edit inline, toggle active, delete (confirm). Thumbnail preview.
- `/admin/settings` — form for the 5 price fields (shown in Rands, converted to cents on save). Save → `/api/admin/settings`.
- `/admin/messages` — list contact messages, unread highlighted, mark-as-read button, mailto reply link.

Admin nav: small reusable client component `src/app/admin/AdminNav.tsx` or a server header included on each admin page.

## Validation & security notes
- All admin data routes check `isAdmin()`.
- Reset tokens single-use, 1h expiry.
- Contact + track + login + forgot routes rate-limited per IP (in-memory Map, 5/min — same pattern already in login route).
- Never return password hashes to the client.
- bcrypt cost 10 for new hashes.

## Out of scope (do NOT build)
- Customer accounts / customer login (explicitly dropped — only the track-order popup).
- Multi-admin management UI.
- Payment changes beyond reading price from settings.

## Done = 
`npm run build` passes with no type errors; all routes/pages above exist; public order flow still works reading designs+prices from DB; admin can log in, change order status, add/remove/edit designs (with image upload), change prices, read contact messages, and reset password; contact form sends email via Resend; track popup returns live status.
