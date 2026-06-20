# H&S Labour — Affiliate Program & Shop Automations — Plan

Planning doc (no code yet). Two initiatives: (A) the e-book **Affiliate Program**, (B) the **Shop / Online Services** with built-in functions & automations. Both need the same new backend, and both can reuse a lot from the **Everest Motoring** project.

---

## Decisions locked (2026-06-19)

1. **Backend — a *dedicated* Supabase project for H&S** (its own project, separate from Everest's; we reuse Everest's *code patterns*, not its data/instance). ✅
2. **Payment gateway — PayFast** (South African; only needed from Phase 2 onward). ✅
3. **E-book — TBC by client** (content/PDF, price, commission still to be confirmed). ⏳ Blocks **Phase 2 only**; Phases 0–1 proceed without it.
4. **Affiliate signup — self-serve, with email verification + anti-spam** (Supabase email confirmation + Cloudflare Turnstile on the form + an admin-approval gate before a referral code is issued). Earns on the **e-book first**; shop products can be made affiliate-eligible later. ✅
5. **Notifications — email only** for now (Resend); WhatsApp/SMS deferred. ✅
6. **Phase order — confirmed** (Phase 0 → 1 → 2 → 3 → 4 as below). ✅

**Practical next action (user):** create the Supabase project and hand over 3 env values — see [`PHASE_0_1_BUILD_SPEC.md`](PHASE_0_1_BUILD_SPEC.md). All build work is delegated to DeepSeek (Claude architects, DeepSeek codes).

---

## 0. The big picture (read this first)

The current `hslabour` site is a **marketing front-end only** — Next.js 16, a `/api/contact` route, and the PlacementPartner jobs embed. It has **no database, no logins, no payments, no file storage**. Both the affiliate program and the shop automations need all of those.

**Confirmed: a dedicated Supabase project for H&S** (its own instance, separate from Everest's — we reuse Everest's code patterns, not its data). That's exactly what Everest Motoring already runs on, and Everest already contains a working affiliate system + admin + customer portal + email + PDF + AI we can lift. Stack to add:

- **Supabase** — Postgres + Auth (affiliates & customers log in) + Row-Level Security + Storage (CV/cert uploads, result/template delivery).
- **Resend + react-email** — transactional email (already used in Everest; an `AffiliateMediaKit` email template exists).
- **PayFast** (confirmed) — South African gateway; redirect + ITN webhook model. Needed for the e-book and any paid shop item — i.e. from **Phase 2** onward (not needed for Phases 0–1).
- **Next.js server actions** — same pattern Everest uses (no separate API layer needed).
- Optional later: **WhatsApp/SMS** (Twilio/Wati) for status updates & appointment reminders — deferred.

> Everest already depends on `@supabase/ssr`, `@supabase/supabase-js`, `resend`, `@react-email/components`, `@react-pdf/renderer`, `@anthropic-ai/sdk`, `@google/generative-ai`. These are the building blocks for everything below.

---

## PART A — Affiliate Program (e-book)

### A1. How H&S's current program works
- A marketing page only (`/affiliate-program`). To join, you **email info@hslabour.co.za**.
- Pitch: promote our job-hunting **e-book**, earn **commission per sale**, promote via blog/social/word-of-mouth, open to anyone.
- **No tracking, no automation, and the e-book is not live.** There's no way to attribute a sale to a referrer or pay them automatically.

### A2. What Everest already has (and we reuse almost as-is)
Everest's affiliate system (Next + Supabase) — files under `everest-motoring/src/app/affiliate/*` and `.../admin/affiliates/*`:

- **Identity & approval** — affiliates are Supabase users with a `profiles` row: `role='affiliate'`, `is_approved`, `affiliate_code`, plus payout `bank_name / account_number / branch_code`.
- **Tracking code** — auto-generated on approval: `NAME + last 4 of UUID` (e.g. `THABO9F2C`).
- **Referral links** — link generator builds `…/<page>?ref=<affiliate_code>`; one-click copy.
- **Affiliate portal** (`/affiliate`) — dashboard of everything attributed to them + a bank-details form.
- **Admin** (`/admin/affiliates`) — list, **approve/decline/delete**, invite-by-email (`inviteUserByEmail` with role metadata).
- **Email** — `AffiliateMediaKit.jsx` welcome/media-kit template.

**Reuse verdict: ~80% portable.** Registration, approval, codes, `?ref=` capture, dashboard shell, bank details, admin table, and the media-kit email all transfer directly. We restyle to the H&S brand (navy/green) we just built.

### A3. What's new for H&S (the e-book sale loop)
Everest attributes **leads** (car enquiries). H&S needs to attribute a **paid e-book sale**, so the new parts are:

1. **Make the e-book sellable** — a product + checkout + payment (PayFast) + **instant digital delivery** (Supabase Storage signed URL, expiring link, emailed receipt).
2. **Attribution** — capture `?ref=<code>` into a cookie on landing (e.g. 30–60 day window) → on successful purchase, write the `affiliate_id` onto the order → create a commission row.
3. **Commission ledger** — `pending → approved → paid`, with a commission rate (% or flat R per e-book).
4. **Affiliate dashboard (adapted)** — show **sales, earnings (pending/approved/paid), and a payout request**, instead of car leads.
5. **Self-serve signup (verified + anti-spam)** — replace "email us" with an **Apply** form: Supabase **email confirmation** + **Cloudflare Turnstile** CAPTCHA on submit, then an **admin-approval gate** (account stays pending with no referral code until approved). Anyone may register, but only approved affiliates get a code and can earn.

### A4. Proposed data model (new tables)
- `profiles` — extend with affiliate fields (from Everest).
- `ebook_orders` — `id, buyer_email, amount, status, affiliate_id (nullable), ref_code, created_at`.
- `commissions` — `id, affiliate_id, order_id, amount, status (pending/approved/paid), paid_at`.
- `referral_clicks` *(optional)* — for click-through analytics.

### A5. Affiliate flow (end to end)
1. Visitor applies on `/affiliate-program` (Turnstile CAPTCHA) → Supabase user created (`role=affiliate`, `is_approved=false`) → **confirmation email**; they must verify before logging in.
2. Admin reviews verified applicants → approves → `affiliate_code` generated → media-kit email sent. (Unverified / un-approved accounts can never generate a link or earn.)
3. Affiliate copies their `?ref=` link(s) and shares them.
4. Buyer lands (ref cookie set) → buys e-book → pays → gets instant download.
5. Order tagged with `affiliate_id` → commission row created (`pending`).
6. Admin reviews (monthly) → marks `approved`/`paid` → pays by EFT using bank details on file → affiliate sees status update.

### A6. Settings still to confirm (Part A)
- e-book **price** and **commission** (% or flat R per sale)? *(pending client)*
- Attribution **cookie window** (30/60/90 days)? *(default 60 unless told otherwise)*
- **Minimum payout** threshold + payout cadence (monthly EFT)?

---

## PART B — Shop / Online Services (functions & automations)

### B1. The catalogue — what each item actually is + how it's fulfilled
| # | Product | Type | Current price | Fulfilment today | Automation opportunity |
|---|---------|------|---------------|------------------|------------------------|
| 1 | **CV Template – Private Sector** | Digital download | "Request Quote" (R0) | Manual | Pay → **instant** secure download + email |
| 2 | **CV Template – Government Sector** | Digital download | "Request Quote" | Manual | Same as #1 |
| 3 | **Cover Letter Service** | Done-for-you | "Request Quote" | Email back-and-forth | Intake form → ops pipeline → delivery |
| 4 | **CV Revamp Service** | Done-for-you (incl. **2 revisions**) | "Request Quote" | Email + attachments | Upload CV → pipeline + revisions → delivery; **AI-assisted draft** |
| 5 | **Criminal Record Check** | Verification + **appointment** | "Request Quote" | Phone/email booking | Booking (location/bulk) → status → **48–72h SLA** → secure result |
| 6 | **Umalusi Matric Certification** | Verification | "Request Quote" | Manual submission | Intake + cert upload → pipeline → result |
| 7 | **Qualification Verification** | Verification | "Request Quote" | Manual submission | Intake + upload → pipeline → result; **employer bulk** |

Notes from the live product pages:
- **Criminal check** uses physical **fingerprint hubs** (Jhb North, Brackenhurst, Mitchell's Plain, Cape Town) or **on-site bulk** for companies; results in **48–72 hours** via AFIS.
- **Umalusi** covers Matric (ASC/NSC from Nov 1992), N3, NCV, GETC(ABET) — they're a registered Umalusi verification agent.
- **CV Revamp** explicitly includes a **detailed analysis + strategic revamp + two revisions**.
- Everything is currently **"Request Quote"** (no live pricing/checkout).

### B2. Three fulfilment patterns (build the platform once)
1. **Instant digital** (templates) — pay → Storage signed-URL download + emailed receipt. Simplest; ship first.
2. **Done-for-you** (cover letter, CV revamp) — structured **intake form (+ file upload)** → creates a **job** in a status pipeline → customer **portal** to track, exchange files, and use the 2 revisions → delivery.
3. **Verification / appointment** (criminal, Umalusi, qualification) — intake + **consent (POPIA)** + document upload → (criminal) **appointment/location booking** → status pipeline with **SLA timer** → secure result delivery; **employer bulk** via CSV/onsite.

### B3. Shared platform pieces (mostly mirrors Everest)
- **Orders + service-jobs table with a status pipeline** — Everest's `leads` pipeline + admin tables map directly to a "service job" pipeline (Received → In progress → Awaiting client → Delivered).
- **Customer portal** — mirrors Everest `/portal` (logged-in area: my orders, upload docs, download results, request revisions).
- **Admin console** — mirrors Everest `/admin` (queue, assign, change status, deliver, set price on quote items).
- **Checkout / quote-to-pay** — since items are quote-based today: support both (a) fixed-price instant items and (b) "request quote → admin sets price → pay link".
- **Email notifications** — Resend + react-email (order confirmation, status changes, "result ready", revision ready, review request).
- **File handling** — Supabase Storage for uploads (CVs, certificates) and deliverables, with signed URLs and consent records.
- **PDF generation** — `@react-pdf/renderer` (already in Everest) for result letters / branded deliverables.
- **AI assist (human-in-the-loop)** — Anthropic/Gemini SDKs (already in Everest) to pre-draft CV revamps & cover letters for a recruiter to finish — big time-saver, not auto-send.

### B4. Highest-value automations
- **Pay → auto-deliver** (templates) / **auto-start job** (services).
- **Intake → auto-create job + notify ops + confirm to client.**
- **Status change → auto client notification** (email now; WhatsApp/SMS later).
- **Criminal check**: appointment booking + reminders + **48–72h SLA countdown** + auto "result ready".
- **Employer/bulk**: CSV upload for multiple candidates (vetting at scale) — ties into the recruitment side of the business.
- **Post-delivery review request** (the product pages already have a reviews section).
- *(Optional)* make shop products **affiliate-eligible** too, reusing Part A attribution.

### B5. Settings still to confirm (Part B)
- Which items get **fixed pricing** vs stay **quote-first**?
- AI-assisted drafting for CV/cover-letter (recommended, using Claude) — confirm.
- Criminal-check **appointment booking** in v1, or start with manual scheduling?

---

## Reuse map — what we lift from Everest Motoring
| Need | Everest source | Reuse |
|------|----------------|-------|
| Supabase auth + SSR client | `src/utils/supabase/*`, auth routes | Direct |
| Affiliate identity/approval/codes | `admin/affiliates/actions.js`, `affiliate/*` | Direct (rebrand) |
| Referral link generator | `affiliate/links/LinkGeneratorClient.jsx` | Adapt (e-book/products instead of cars) |
| Bank details / payouts | `affiliate/BankDetailsForm.jsx`, `actions.js` | Direct |
| Admin shell + data tables | `src/app/admin/*` | Pattern reuse |
| Customer portal | `src/app/portal/*` | Pattern reuse |
| Email (Resend + templates) | `src/emails/*` incl. `AffiliateMediaKit.jsx` | Direct + new templates |
| PDF deliverables | `@react-pdf/renderer` usage | Pattern reuse |
| AI drafting | `@anthropic-ai/sdk`, Gemini | New use (CV/cover-letter) |
| Pipeline/status model | `leads` + `admin/leads/*` | Remodel as "service jobs" |

**Net-new (not in Everest):** e-book checkout + digital delivery, service intake forms + uploads, criminal-check appointment booking + SLA, commission ledger + payout marking, POPIA consent capture, **self-serve signup with Turnstile + email verification**.

---

## Suggested phasing
- **Phase 0 — Foundation:** add Supabase (auth, DB, storage) + admin shell + brand styling. *(enables everything)*
- **Phase 1 — Affiliate MVP:** apply (self-serve, verified, anti-spam) → approve → code → link generator → dashboard → admin. Start recruiting affiliates **even before the e-book is live**.
- **Phase 2 — E-book sale loop:** product + checkout + PayFast + instant delivery + `?ref=` attribution + commission ledger. *(blocked on e-book content from client)*
- **Phase 3 — Shop, easy wins:** CV templates (instant) + Cover Letter / CV Revamp (intake → pipeline → portal, with optional AI draft).
- **Phase 4 — Verification services:** Criminal (appointments + SLA), Umalusi, Qualification + employer bulk.

---

## Open decisions — RESOLVED 2026-06-19
1. Backend = **dedicated Supabase project** ✅
2. Payment gateway = **PayFast** ✅ (Phase 2+)
3. E-book content/price/commission = **pending client** ⏳ (blocks Phase 2 only)
4. Affiliate = **self-serve + email verification + Turnstile + admin approval**; **e-book first**, shop later ✅
5. Notifications = **email only** ✅
6. Phase order = **confirmed** ✅

**Only remaining blocker for Phase 2:** e-book details from the client. **Phases 0–1 are unblocked** the moment the Supabase project + env vars exist — see [`PHASE_0_1_BUILD_SPEC.md`](PHASE_0_1_BUILD_SPEC.md).
