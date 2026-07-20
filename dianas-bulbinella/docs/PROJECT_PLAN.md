# Diana's Bulbinella — Build Plan

**Status:** BUILD STARTED 2026-07-09. Demo-first: seed only compliance-clean products so Diana can see the new site; flagged/renamed products enter after her sign-off.
**Workflow:** Claude = architect/reviewer. DeepSeek (via `opencode-glm-extension/ds-agent.js` → localhost:8082) writes bulk code.
**Costs:** dev is R0 (local + free tiers + open-source 3D). Paid plans only at launch, with explicit approval.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router, TS, Tailwind) | app root = `dianas-bulbinella/` |
| DB / Auth / Storage | Supabase (Postgres) | free tier for dev; demo phase runs off local seed JSON until keys exist |
| Payments | Payfast (+ Yoco/Ozow later) | Phase 2 |
| Email | Resend | free tier dev |
| 3D / Motion | React Three Fiber + drei + framer-motion | free, open-source |
| Maps | Leaflet + OpenStreetMap | free |
| Deploy | Vercel | at launch |

## Design direction — "Aurae Glow" (chosen by client 2026-07-14; supersedes "premium botanical apothecary")

- White ground `#FFFFFF` with soft aurora gradient glows (sage `#CBE7D0` → gold `#F3DCA8`), glassmorphism cards, deep green `#1F5C3D` + gold `#C89A4B` accents. **Products always on white tiles** (photos are white-background).
- Type: Fraunces (serif; ONE italic gradient accent word per heading via `.text-glow-gradient`) + Figtree body.
- Motion (Flavoury-inspired, all `prefers-reduced-motion`-safe): scroll-drawn gold **squiggle** down the homepage (`AuroraSquiggle`), **parallax** floating product cards (`Parallax`), scroll **reveals** (`Reveal`), marquee value ticker, hover-lift cards, floating glass chips.
- **Video banner**: `public/videos/botanical-banner.mp4` (Pixabay #120513 fern macro, 5.8MB, free commercial — see `public/videos/SOURCES.txt`) with forest-gradient overlay + glass CTA card.
- Specials on home: multi-item — 8-card glass grid + "All N specials" link (client requirement).
- 3D Bulbine scene (`components/three/`) parked — currently unimported; candidate for /about.

## Feature set

### Phase A — Demo storefront (NOW)
1. Home: 3D botanical hero, Shop-by-Concern tiles, specials strip, founder story, dealer teaser, newsletter.
2. Shop: `/shop` + concern hubs + range pages per [nav-map.md](nav-map.md); format/size/price filters; search.
3. Product pages: gallery, compliant copy placeholder, related products, disclaimer block.
4. **Seed data:** compliance-clean products only (no hits in [compliance-hits.csv](compliance-hits.csv)), images pulled from the WP export. Local JSON via a thin `lib/catalog.ts` data layer whose interface matches the future Supabase queries 1:1.
5. Cart UI (client-side) — checkout stubbed until Payfast keys.

### Phase B — Commerce + admin
Supabase schema + migration (products, categories, customers 2,256, orders 4,132, dealers, specials, consents, email_events, posts). Payfast checkout. Admin dashboard + **Specials Scheduler** (search/multi-select → price/% → date range → auto activate/expire, 1–2 months ahead). Dealer map + CRUD. On-hold order cleanup flag.

### Phase C — Email lifecycle (NEW — user request)
POPIA-first: consent checkbox at checkout & newsletter signup, stored with timestamp/source; every mail has unsubscribe; suppression list respected.
1. **Post-purchase:** "Congratulations on your <product>" + cross-sell (same concern/range) — sent on order completion.
2. **Replenishment:** per-product `estimated_days_supply` (admin-editable; default heuristic by size: 10ml≈30d, 100ml≈90d, 50g≈30d, 100g≈45d, 250g≈90d, 500g≈150d, capsules 10s≈10d/60s≈60d/360s≈360d) → "running low?" email at ~85% of supply, with 1-click reorder.
3. **Review request:** ~30 days post-delivery → review link; review lands in admin for moderation.
Engine: `email_queue` table + Vercel cron; Resend for delivery; all templates branded.

### Phase D — Automated blog (NEW — user request, rvrinc/HSLabour pattern)
- `posts` table + `/blog` (SSG) + per-post SEO/OG + `llms.txt` inclusion.
- Generator cron: DeepSeek drafts article on a content calendar (ingredient education, concern guides, traditional-use stories — **compliance rules enforced in the generator prompt**), Claude-tier review pass optional, saved as draft for Diana to approve or auto-publish (her choice).
- Feeds Ember Social later (same content source).

### Phase E — SEO/GEO/AI + launch
Schema.org (Product/Offer/Review/LocalBusiness/FAQ), per-page meta, sitemap, 301s from [redirects.csv](redirects.csv), llms.txt, GA4. Full catalogue import once Diana signs off names/copy. Payfast live, Vercel deploy, DNS cutover.

## DeepSeek delegation protocol
1. Claude writes self-contained task spec (file paths, props, data contracts, style tokens).
2. `node opencode-glm-extension/ds-agent.js "<prompt>"` → output reviewed by Claude before commit.
3. Claude personally writes/reviews: schema, payments, consent/email logic, compliance-sensitive copy, 3D performance budget.

## Open items
- Diana: product renames + descriptions sign-off (email sent 2026-07-09) → unblocks full catalogue.
- Supabase project + Resend keys (free tier) — needed at Phase B start.
- Newsletter list location (external? Mailchimp?) — ask Diana.
- Payfast merchant credentials — Phase B.
