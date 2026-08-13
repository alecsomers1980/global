# Woodpecker Guesthouse — Rebuild Design Spec

**Date**: 2026-08-13
**Status**: Approved by client, pending spec review
**Old site**: https://woodpeckersguesthouse.co.za (WordPress + Elementor)
**Design reference**: Booklium Boutique (MotoPress hotel theme demo) — structural/UX reference only, not a literal skin

## 1. Overview

Full rebuild of Woodpecker Guesthouse's website — a family-friendly, affordable guesthouse and conferencing venue in Hazyview, Mpumalanga (Kruger National Park / Panorama Route area). The old site is WordPress/Elementor, still on Nightsbridge for bookings, and has a compromised blog (spam dating-site posts injected under the original WP install, dated 2022) that will not be carried forward.

**Goal**: elevate visual polish and site performance to match a modern boutique-hotel presentation, while preserving Woodpecker's actual affordable, family-oriented positioning (jumping castle, braai area, budget rooms, kids' menu). Not a luxury repositioning — a better-built, better-photographed version of what the guesthouse already is.

**Non-goals**: no booking-system replacement (Nightsbridge stays), no rate/inventory management build (that lives in Nightsbridge), no multi-language support (not requested), no specials/offers dedicated section (declined during discovery — a specials teaser on Home is sufficient, no separate page/system).

## 2. Content Source

Client has WordPress admin/export access to the old site. This is the source of truth for room copy, rates, facility descriptions, and original photography — used instead of scraping the live site. Legal pages (Privacy Policy, Terms & Conditions) are migrated as-is; nothing else from the old WP install (including any post/page content) is trusted without review, given the evidence of prior compromise.

Menu content (breakfast/dinner/kids) currently lives only as PDFs — these get rewritten as real page content on Restaurant (PDFs may still be offered as an optional download, not the primary format).

## 3. Architecture & Tech Stack

- **Framework**: Next.js (App Router), matching the sibling-project convention (joetsie-lodge, mountaincreek-lodge, Aloe, Everest, Nyoni, HSLabour).
- **Backend**: Supabase — Postgres (rooms, gallery, blog posts, staff auth), Storage (images).
- **Hosting**: Vercel, git-push auto-deploy on `main`, Root Directory = `woodpecker-guesthouse`.
- **Repo location**: `woodpecker-guesthouse/` at the Antigravity monorepo root (eligible for the eventual per-project repo split, same as other projects).
- **Booking**: Nightsbridge widget/iframe embed, same integration model as the old site — no custom booking backend.
- **Why Supabase over Sanity** (mountaincreek-lodge's CMS choice): client chose consistency with the majority of the current portfolio so existing admin/gallery/blog/auth code can be reused nearly as-is, rather than maintaining two different CMS patterns across lodge-type sites.

## 4. Site Map

| Page | Notes |
|---|---|
| Home | Hero w/ Nightsbridge booking bar overlay, intro, facilities strip, featured rooms, testimonials, specials teaser, CTA |
| Accommodation | Grid of 8 rooms → individual detail pages |
| Accommodation/[slug] | Gallery, amenities, rates, "Check Availability" → Nightsbridge |
| Conferencing | Venue details, capacity, enquiry form |
| Restaurant | Breakfast/dinner/kids menu as real content (PDF download optional) |
| Gallery | Categorized property photos |
| Attractions | Kruger NP, God's Window, Blyde River Canyon, Bourke's Luck Potholes — local SEO/GEO content |
| Blog | New — Panorama Route / Kruger-area travel content, SEO/GEO |
| Blog/[slug] | Article page |
| Contact | Form (honeypot + timing anti-bot) + map + WhatsApp |
| Privacy Policy / Terms | Migrated as-is |
| /admin | Staff login + admin panel (see §6) |

Rooms migrated from the old site: Deluxe Suite Room, King Deluxe Room, Budget Room, Double Room 1–3, Family Room 1–2 (8 total).

## 5. Design System — "Elevated Woodpecker"

- **Layout**: full-bleed hero photography, generous whitespace, overlaid booking bar, clean grid room cards — structural DNA borrowed from Booklium.
- **Type**: warm elegant serif for headings (lodge-warm, not city-apartment-cold), clean sans-serif body.
- **Palette**: warm neutrals + a bushveld-derived accent (olive/terracotta/sand) — deliberately not Booklium's stark black-and-cream, to keep the family/nature warmth.
- **Photography**: real property photos from the WP export only — no stock. South African/African family representation where people appear in imagery, per standing house rule.
- **Copy tone**: welcoming, accessible, family-friendly — "affordable" and "family" stay explicit in the language. Not aspirational-luxury copywriting.
- **3 design options**: per agency standard, client will be shown 3 distinct visual directions (mockups) before any is committed to code.

## 6. Admin & Content Management

Owner-editable admin panel at `/admin`, Supabase-authed.

- **Staff login**: forgot-password flow, show-password toggle, keep-me-signed-in, optional TOTP 2FA — all four shipped in the first pass (standing requirement).
- **Rooms admin**: edit copy/amenities/rates/photos, reorder, publish/unpublish.
- **Gallery admin**: multi-file upload, automatic optimization on upload (sharp → WebP, ~80 quality, capped 2400px long edge), category delete (images fall back to Uncategorized via `ON DELETE SET NULL`), bulk select + delete. Built first pass, not retrofitted.
- **Blog admin**: full standard —
  1. Monthly generation cron (Anthropic, drafts N posts, emails admin to review)
  2. "Generate a draft now" button (same generator, on demand)
  3. Draft → Approved → Published (+ Discarded) queue, editable before approving
  4. Publish cron (flips approved+due posts to published)
  5. Compliance guard in the prompt: unique-angle, first-hand voice, strict no-fabrication
  6. Hero image matches the post's actual subject (curated library, category fallback)
  7. Premium reading typography (bespoke `.article-body`, not raw markdown)

  Modeled directly on the Aloe Signs News implementation (`news_posts` table, `/portal/admin/news` pattern, generate/publish crons).

## 7. SEO / GEO & Integrations

- Semantic HTML5 (`header`/`main`/`article`/`section`/`footer`), single `<h1>` per page, meta title/description on every page.
- Structured data: LocalBusiness/Hotel schema, Article schema on blog posts.
- Content and structure legible to AI search (ChatGPT/Perplexity/Gemini), not just Google — direct-answer framing where relevant, especially on Attractions and Blog.
- WhatsApp click-to-chat floating button.
- Nightsbridge booking widget embedded on Home and every room detail page.
- Contact form: honeypot + timing anti-bot (no CAPTCHA), matching the existing pattern used on Lublaw's ContactForm.

## 8. Ops

- Supabase keep-alive: GitHub Actions workflow, own-repo style (`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` secrets, cron Mon/Thu), `keep_alive` table.
- Deploy: git push → Vercel auto-deploy, Root Directory = `woodpecker-guesthouse`.

## 9. Testing / Verification

- Build passes (`next build`) before every commit that touches the app.
- Admin auth: unauthenticated requests to `/admin/*` API routes return 403/redirect.
- Gallery upload: verified against the production deploy (not just localhost) per the known Supabase Storage Buffer-corruption gotcha — POST a real file, re-download, confirm it opens.
- Blog pipeline: manual "Generate now" produces a readable draft with a correctly-matched hero image; publish cron flips approved+due posts.
- Nightsbridge widget renders and accepts a test date range on Home and one room page.
- Mobile responsiveness and Lighthouse performance pass on Home, one room page, and Blog.

## 10. Risks / Open Items

- **WP export quality unknown** until the client hands it over — room copy/rates/photos may need cleanup regardless.
- **3 design options** (agency standard) must be presented and approved before implementation begins on visual styling — this happens after this spec, as part of the build's mockup phase, not before.
- Legal pages (Privacy/Terms) migrated as-is; not legally reviewed as part of this spec.
