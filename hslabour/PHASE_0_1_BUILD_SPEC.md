# H&S Labour — Phase 0 + Phase 1 Build Spec

Architect's contract for the first two phases. Claude architects; **DeepSeek codes** each chunk from this spec. Verified per chunk with `tsc --noEmit` + `eslint` + (where possible) HTTP 200.

Decisions locked in [`AFFILIATE_AND_SHOP_PLAN.md`](AFFILIATE_AND_SHOP_PLAN.md). This spec covers **Phase 0 (foundation)** and **Phase 1 (affiliate MVP)** only. Phase 2 (e-book sale loop + PayFast) is **deferred** — blocked on e-book content from the client.

---

## 0. What YOU (the user) must set up — the only real blocker

I can write and build-verify all the code, but it can't run end-to-end until a Supabase project exists. These are account actions only you can do:

### 0.1 Create the Supabase project
1. Go to **app.supabase.com → New project**. Name it e.g. `hslabour`. Region: closest (e.g. `eu-west` / `af-south` if offered). Set a strong DB password (save it).
2. Once created, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (secret — server only, never shipped to the browser) → `SUPABASE_SERVICE_ROLE_KEY`

### 0.2 Auth settings
3. **Authentication → Providers → Email**: enable **Confirm email** (this is our verification gate).
4. **Authentication → URL Configuration**: set **Site URL** to `http://localhost:3000` for dev (and the production URL later); add redirect URLs for `/auth/callback`.

### 0.3 Anti-spam (Cloudflare Turnstile — free)
5. Cloudflare dashboard → **Turnstile → Add site** → get **Site key** (public) + **Secret key**.
6. In Supabase **Authentication → Attack Protection**, enable **CAPTCHA / Turnstile** and paste the **Secret key**.
   - Site key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (used in the form).

### 0.4 Email (Resend) — needed for the media-kit/approval email (Phase 1 tail)
7. Resend account → API key → `RESEND_API_KEY`; verify the sending domain (or use the Resend test address for dev).

### 0.5 Hand me these env values (or paste into `hslabour/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=            # only if we verify server-side too; Supabase holds the primary one
RESEND_API_KEY=
RESEND_FROM="H&S Labour <noreply@hslabour.co.za>"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> DeepSeek can write **all** the code below against these env *names* and we can confirm it **builds + typechecks** before the project exists. Only **runtime auth testing** needs the live keys.

---

## 1. Dependencies to add
```
@supabase/supabase-js  @supabase/ssr        # auth + db client (SSR-safe)
resend  @react-email/components @react-email/render   # email (Phase 1 tail)
```
(Turnstile widget is loaded via a script tag — no npm package required. `react-email` mirrors Everest.)

---

## 2. Environment / config
- All Supabase access goes through helper clients (browser, server, middleware) — never instantiate inline.
- `SUPABASE_SERVICE_ROLE_KEY` is used **only** in server actions / route handlers for admin operations (approve, list-all). Never imported into a client component.

---

## 3. Database schema (Phase 0 + 1)

Single SQL migration, applied in Supabase SQL editor (`supabase/migrations/0001_init.sql`). Phase 2 tables (`ebook_orders`, `commissions`) are **not** created yet.

### `profiles` (1:1 with `auth.users`)
| column | type | notes |
|--------|------|-------|
| `id` | uuid PK | = `auth.users.id` |
| `email` | text | mirror for admin display |
| `first_name` | text | from signup (feeds `generateAffiliateCode`) |
| `last_name` | text | from signup |
| `phone` | text null | from signup |
| `email` | text | mirror for admin display |
| `role` | text default `'affiliate'` | `'affiliate' \| 'admin' \| 'customer'` |
| `is_approved` | boolean default `false` | admin gate |
| `affiliate_code` | text unique null | issued on approval |
| `promo_channels` | text null | "how will you promote" (from apply form) |
| `bank_name` | text null | payout |
| `account_number` | text null | payout |
| `branch_code` | text null | payout |
| `created_at` | timestamptz default now() | |

- **Trigger**: on `auth.users` insert → insert a `profiles` row (id, email, full_name/phone from `raw_user_meta_data`, role from metadata or default `affiliate`, `is_approved=false`). Mirrors Everest's profile-bootstrap.
- **RLS ON**:
  - select/update own row: `auth.uid() = id`.
  - admin (role `'admin'`) may select/update **all** rows (policy checks a `profiles` self-lookup or a JWT claim — use the same approach Everest uses; if Everest gates admin in server actions via service-role, replicate that and keep RLS user-scoped).
  - **No client may set `is_approved` or `affiliate_code`** — those are written only by the service-role server action.

> Match Everest's exact policy style. Re-read `everest-motoring` SQL/policies when writing this chunk so we don't diverge.

---

## 4. File map (Phases 0–1)

```
hslabour/
  .env.local                                  (user-provided)
  supabase/migrations/0001_init.sql           (schema + RLS + trigger)
  lib/supabase/client.ts                      browser client (anon)
  lib/supabase/server.ts                      server client (cookies, anon)
  lib/supabase/admin.ts                       service-role client (server-only)
  lib/affiliate/code.ts                       generateAffiliateCode(name, uuid)
  proxy.ts                                    (NEW — Next 16 renamed middleware→proxy) refresh session + guard /affiliate, /admin
  app/(auth)/login/page.tsx                   login (brand-styled)
  app/(auth)/signup/page.tsx                  ALSO used as affiliate "Apply" (Turnstile)
  app/(auth)/auth/callback/route.ts           email-confirm exchange
  app/(auth)/auth/actions.ts                  signIn / signUp / signOut server actions
  app/affiliate/page.tsx                      affiliate dashboard (approved only)
  app/affiliate/BankDetailsForm.tsx           payout details (client)
  app/affiliate/actions.ts                    saveBankDetails
  app/affiliate/links/LinkGeneratorClient.tsx ?ref= link builder
  app/admin/page.tsx                          admin home (guarded)
  app/admin/affiliates/page.tsx               list applicants/affiliates
  app/admin/affiliates/actions.ts             approve / decline / generate code (service-role)
  components/auth/TurnstileWidget.tsx         renders Cloudflare Turnstile, sets token
  emails/AffiliateMediaKit.tsx                approval/welcome email (Resend) — Phase 1 tail
```

All pages: **H&S brand** (navy `#011D58`, green `#46D835`, `mint`, Roboto) reusing existing `Container`, `PageHeader`, button styles. The existing marketing site under `app/(marketing)/` is untouched except the `/affiliate-program` page CTA now links to `/signup`.

---

## 5. Phase 0 — Foundation (build & verify first)

**Goal:** auth works end-to-end (signup → email confirm → login → session in middleware → logout), profiles auto-created, RLS on.

DeepSeek chunks:
- **0a — Supabase clients** (`lib/supabase/{client,server,admin}.ts`) using `@supabase/ssr` `createBrowserClient` / `createServerClient` (cookie adapter) + service-role admin client. Port Everest's `src/utils/supabase/*` to TS, brand-agnostic.
- **0b — Migration** (`supabase/migrations/0001_init.sql`): `profiles` table + trigger + RLS policies above.
- **0c — Proxy** (Next 16's renamed middleware): create root `hslabour/proxy.ts` (exports `proxy` fn + `config.matcher`) to refresh the Supabase session cookie and **guard** `/affiliate/*` (must be logged in) and `/admin/*` (must be `role='admin'`); redirect unauthenticated to `/login`. Runs on Node runtime.
- **0d — Auth pages + actions**: `login`, `signup`, `auth/callback`, `auth/actions.ts` (`signIn`, `signUp` with metadata `{ full_name, phone, role:'affiliate' }` + `captchaToken`, `signOut`). Brand-styled.

**Verify 0:** `tsc --noEmit` clean, `eslint` clean, `next build` succeeds. Runtime (needs live keys): signup sends a confirm email; clicking it logs you in; `/affiliate` redirects to `/login` when logged-out.

> ⚠️ `react/no-unescaped-entities` is an ERROR in this repo — use `&apos;` in JSX text; literal apostrophes are fine in prop/attribute strings. Tailwind v4 + Turbopack: after CSS-token changes, `rm -rf .next` before re-checking.

---

## 6. Phase 1 — Affiliate MVP

**Goal:** self-serve apply (verified + Turnstile) → admin approve → code issued → media-kit email → affiliate dashboard + link generator + bank details. No sales yet (those are Phase 2), so the dashboard shows an empty earnings state + the link generator.

DeepSeek chunks:
- **1a — Turnstile + Apply**: `components/auth/TurnstileWidget.tsx` + wire it into `signup`/apply form; pass `captchaToken` to `supabase.auth.signUp`. Capture `full_name`, `phone`, `promo_channels`. Update `/affiliate-program` marketing page CTA → `/signup`.
- **1b — Affiliate code util** (`lib/affiliate/code.ts`): `generateAffiliateCode(name, uuid)` = uppercased alpha of name + last 4 of uuid (Everest's exact rule).
- **1c — Admin affiliates**: `app/admin/affiliates/page.tsx` (list: name, email, verified?, approved?, code, applied date) + `actions.ts` (`approveAffiliate` → set `is_approved=true`, generate + save `affiliate_code`, send media-kit email; `declineAffiliate`; service-role only; admin-guarded).
- **1d — Affiliate dashboard**: `app/affiliate/page.tsx` — if `!is_approved` show "application pending" state; if approved show earnings summary (empty until Phase 2) + `LinkGeneratorClient` + `BankDetailsForm`.
- **1e — Link generator** (`LinkGeneratorClient.tsx`): build `${NEXT_PUBLIC_SITE_URL}/?ref=${affiliate_code}` and (once e-book page exists) `…/ebook?ref=…`; copy-to-clipboard. Adapt from Everest, swap cars→e-book/site.
- **1f — Bank details** (`BankDetailsForm.tsx` + `actions.ts` `saveBankDetails`): bank_name/account_number/branch_code → own profile row. Direct port from Everest.
- **1g — Media-kit email** (`emails/AffiliateMediaKit.tsx` + send in `approveAffiliate`): brand-styled welcome with their code + sample links. Port Everest template, rebrand.

**Verify 1:** `tsc`/`eslint`/`build` clean. Runtime: apply as a test user → see it in `/admin/affiliates` as pending/verified → approve → code appears, email arrives → log in as that user → dashboard shows code + working `?ref=` links + can save bank details. Spam check: form rejects without a Turnstile token; unverified users can't log in.

---

## 7. Reuse sources (re-read these exact Everest files when writing each chunk)
- `everest-motoring/src/utils/supabase/*` → §5 0a
- Everest profiles SQL / RLS / signup trigger → §3, §5 0b
- `everest-motoring/src/app/admin/affiliates/actions.js` (`generateAffiliateCode`, `approveAffiliateAction`) → §6 1b/1c
- `everest-motoring/src/app/affiliate/actions.js` (`saveBankDetails`) + `BankDetailsForm.jsx` → §6 1f
- `everest-motoring/src/app/affiliate/links/LinkGeneratorClient.jsx` → §6 1e
- `everest-motoring/src/app/affiliate/page.js` (dashboard) → §6 1d
- `everest-motoring/src/emails/AffiliateMediaKit.jsx` → §6 1g
- Everest middleware (session refresh) → §5 0c

**Drift guard:** Everest is `.js`; H&S is strict `.ts`. Port to typed TS, keep brand navy/green, and **preserve auth/code logic verbatim** (per the jobs-page drift lesson). For logic-bearing files, paste the full Everest file into the DeepSeek prompt with "preserve logic verbatim, retype to TS, restyle to H&S brand."

---

## 8. Deferred (NOT in this spec)
- **Phase 2:** `ebook_orders` + `commissions` tables, PayFast checkout + ITN webhook, `?ref=` cookie attribution on purchase, instant digital delivery (Storage signed URL), commission ledger UI. Blocked on e-book content/price/commission from client.
- **Phases 3–4:** shop products, service-job pipeline, customer portal, uploads/POPIA, criminal-check booking + SLA, AI drafting.
