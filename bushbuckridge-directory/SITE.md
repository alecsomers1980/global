# Site Vision: Bushbuckridge Community Directory

## 1. Overview
A streamlined, high-performance community directory for the Bushbuckridge region. Focused on raw utility: connecting local businesses, job seekers, and event organizers in a premium, easy-to-use digital portal.

**No AI features** — client-driven content, self-service architecture, integrated payments.

## 2. Core Features
- [x] Business Directory with search/filter
- [x] Self-Service Client Portal (business owners edit their own listings)
- [x] Jobs & Opportunities Board
- [x] Community Events Calendar
- [x] "Find a Service" search (by area + sector)
- [x] Advertising Tiers (Standard / Enhanced / Premium)
- [x] Admin Panel (full CRUD)
- [x] Integrated Payment Portal (PayFast)
- [x] Revenue Reporting (Admin dashboard)
- [x] Performance Reporting (Client analytics)
- [x] Mobile-First Design
- [x] Spotlight Articles (manual, editor-written features for premium partners)

## 3. Sitemap
- [x] Home (/) — Utility hub with quick navigation
- [x] Find a Service (/find-a-service) — Filtered search
- [x] Opportunities (/opportunities) — Tenders, training, funding
- [x] Jobs (/jobs) — Local vacancies
- [x] Events (/events) — Community calendar
- [x] Business Profile (/business/[id]) — Individual business pages
- [x] List Your Business (/list-your-business) — Self-registration form
- [x] Buy Your Spot (/buy-your-spot) — Signup + PayFast checkout
- [x] Login (/login) — Authentication
- [x] Client Portal (/portal) — Self-service dashboard with tier upgrades
- [x] Admin (/admin) — Site management
- [x] Articles (/articles) — Spotlight features
- [x] Payments flow (integrated into portal and signup)

## 4. Payment Integration
- **Provider**: Yoco (South African payment gateway)
- **Tiers**: Basic R199/yr | Pro Lead R799/yr | Pro Business R10 500/yr
- **Setup flow** (`/buy-your-spot` → `/api/payments/setup`, `/api/payments/initiate`): Creates account + business + Yoco checkout redirect
- **Upgrade flow** (portal): Existing businesses upgrade tiers via Yoco checkout
- **Webhook handler** (`/api/payments/yoco-webhook`): Verifies the Standard-Webhooks HMAC signature, then activates payment/subscription/business
- **Return handler** (`/api/payments/return`): Handles post-payment redirect

## 5. Removed from Scope
- ~~AI Text Rewriting~~ — Clients provide own descriptions
- ~~AI Video Generation~~ — Standard photo galleries
- ~~Automated Social Media Sync~~ — Manual only

## 6. Environment Variables Required
- `NEXT_PUBLIC_POCKETBASE_URL` — PocketBase instance URL
- `NEXT_PUBLIC_SITE_URL` — Production URL for canonical links + payment/email callbacks
- `POCKETBASE_SERVICE_EMAIL` / `POCKETBASE_SERVICE_PASSWORD` — `is_admin` service account for webhook/server writes
- Yoco secret key + `YOCO_WEBHOOK_SECRET` — checkout creation + webhook signature verification (see `lib/settings.ts` / `getYocoConfig`)
- `CRON_SECRET` — Bearer token guarding the `/api/cron/*` routes
- `RENEWAL_TOKEN_SECRET` — HMAC secret for one-click renewal links
- Resend API key — transactional email (`lib/email.ts`)
