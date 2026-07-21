# Diana's Bulbinella — Next.js rebuild

Rebuild of **dianas.co.za** (Diana Herbst, White River MP — ~14-yr SA botanical
health/skincare brand, 250+ products) off WordPress/WooCommerce onto Next.js.

**Proposal (design + audit + costs):**
https://claude.ai/code/artifact/bb7a7f5a-c3fa-43bf-b560-18ac41cfc3ff

## Status: proposal approved for data intake — no code yet

## Stack (planned)
Next.js (App Router) + Supabase (Postgres) + custom admin · Payfast · Vercel · Resend · Leaflet/OSM map.

## Headline features
- **Monthly Specials Scheduler** — search/select products, set special price + start/end dates, schedule 1–2 months ahead, auto-activate/expire.
- **Dealer map** — nationwide + international, province/country filter, admin CRUD, become-a-dealer form.
- **SEO/GEO/AI** — SSR + schema.org + llms.txt + concern pages + 301s from old URLs.

## ⚠ Blocker before migrating copy
Current product pages make illegal medical claims (cure cancer/diabetes/Crohn's).
Needs a SAHPRA/ARB-compliant rewrite + Diana's sign-off before descriptions carry over.

## Next steps
1. Client drops WooCommerce export → see [`intake/README.md`](intake/README.md)
2. Size real catalogue, build category/redirect map
3. Draft compliant copy rules
4. On go-ahead: scaffold Next.js + Supabase (bulk code via DeepSeek, Claude architects/reviews)
