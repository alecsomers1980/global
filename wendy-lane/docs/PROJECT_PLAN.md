# Wendy Lane — Website Rebuild Plan

**Client:** Wendy Lane cc (Woza Wendy Lane), Nelspruit / Mbombela, Mpumalanga
**Current site:** https://wozawendylane.co.za (WordPress + BeTheme + WPBakery + LayerSlider)
**Design inspiration:** Loggi — Wooden House Construction WP theme (ThemeForest #62883058)
**Roles:** Claude = planner/architect · DeepSeek v4 = coder (via `opencode-glm-extension/ds-agent.js` → localhost:8082)
**Date:** 2026-07-16

---

## 1. Business facts (verified from existing site)

| Field | Value |
|---|---|
| Established | 1993 (33 years) |
| Owner | Roy Wakefield |
| Physical address | Plot 52, Cairn Road, Nelspruit, 1200 |
| Telephone | 013 755 2408 |
| Sales (Linda Wagner) | 083 647 0473 |
| WhatsApp | +27 71 469 6131 |
| Email | sales@wozawendylane.co.za |
| Hours | Mon–Thu 07:30–17:00 · Fri 07:30–16:30 · Sat closed |
| Facebook | facebook.com/WozaWendyLane |
| Instagram | instagram.com/wendylane_nelspruit |
| Map | -25.449798, 30.896869 |

Own manufacturing operation outside Nelspruit; own trained building teams; scope covers
supply → delivery → on-site assembly. Sales team will travel for on-site quotes.

### Brand
- **Primary green `#0E7C0F`** — sampled directly from the logo PNG (deep forest green).
- **Accent `#82B440`** — Loggi's green; harmonises with the logo, use for highlights/CTA hover.
- **Timber brown `#603913`** — warm neutral, already the incumbent body-text colour.
- **Off-white `#FCFCFC`**, near-black `#111` for text.
- Logo: `intake/logo.png` (500×108, RGBA — "WOZA" script on green banner + house outline + "WENDY LANE").
- ⚠ Logo is low-res at 500px wide. **Request vector (SVG/AI/EPS) from client.**

---

## 2. Why the current site underperforms

Ranked by commercial damage:

1. **WordPress demo content is live and indexable.** Categories exist for SAT, GRE, MCAT,
   Trigonometry, French, Biology, Art history; lorem-ipsum posts at `/hello-world`,
   `/curabitur-et-ligula`, `/aliquam-erat-ac-ipsum`, `/nulla-imperdiet-sit-amet` etc.
   BeTheme demo data was never purged. Destroys topical relevance.
2. **Every page's meta description is `"Just another WordPress site"`** — the WP default.
3. **Prices are locked in three PDFs.** No HTML pricing ⇒ no ranking for
   *"wendy house prices Nelspruit"*, the highest-intent query in the market.
4. **No readable H1.** Hero headline is a baked image (`text11.png`, `text2.png`);
   real `<h1>` renders at 14px.
5. **Link + image leakage to `wlcc.co.za`** (old domain) from the homepage. Splits authority.
   → *Open question: is wlcc.co.za the same business? Redirect or disown?*
6. **`ogImage: null`** — WhatsApp is their primary channel and shared links render blank.
7. **`format-detection: telephone=no`** — phone not tappable on mobile.
8. Contact page "Open in Maps" is broken → `google.com/maps/undefined`.
9. One testimonial with a placeholder avatar. No blog, FAQ, schema, or service-area pages.
10. Title tag promises "Playground Equipment, Kennels, Furniture" — content doesn't exist
    (one orphan `/playground-equipment` page).

## 3. Competitive picture

| Competitor | What they do well | Gap we exploit |
|---|---|---|
| **mutsamvi-wendys.co.za** | Live price calculator → "Send My Quote via WhatsApp"; per-m² pricing; deep interlinked content hub | Their calculator gives **estimates**; ours uses the **real price matrix** |
| **wendyhouseoptions.co.za** | Ranks for "Wendy House Nelspruit" | Not actually Nelspruit-based — we are, since 1993 |
| **nutecwendyhousebuilders.co.za** | "Wendy House Prices SA" guide content | Pretoria-based; no Lowveld presence |
| **snupit.co.za** | Directory ranks for the local term | Aggregator, no product depth |

**Core insight:** Wendy Lane is outranked in its own town by businesses that aren't in it.
Competitors *manufacture* the trust signals (longevity, own factory, real projects) that
Wendy Lane genuinely has — and simply doesn't publish.

---

## 4. Verified pricing data

### 4a. Wendy Houses — Standard (PDF dated May 2026, incl. VAT @ 15%) — CONFIDENT

| Code | Front (m) | Side (m) | Door, no window | Window opt | With one window |
|---|---|---|---|---|---|
| W1515 | 1.5 | 1.36 | R7 300 | ND1 | R8 100 |
| W1818 | 1.8 | 1.66 | R8 720 | ND1 | R9 600 |
| W1824 | 2.4 | 1.66 | R9 720 | ND1 | R10 600 |
| W2424 | 2.4 | 2.26 | R11 320 | ND1 | R12 200 |
| W2430 | 3.0 | 2.26 | R14 820 | ND1 | R15 700 |
| W3030 | 3.0 | 2.86 | R15 320 | ND1 | R16 200 |
| W3042 | 4.2 | 2.86 | R19 620 | ND1 | R20 500 |
| W3642 | 4.2 | 3.46 | R22 050 | ND2 | R23 700 |
| W3648 | 4.8 | 3.46 | R24 150 | ND2 | R25 800 |
| W3060 | 6.0 | 2.86 | R25 950 | ND2 | R27 600 |
| W3660 | 6.0 | 3.46 | R29 950 | ND2 | R31 600 |

### 4b. Verandas — CONFIDENT

| Code | Front (m) | Side (m) | Price |
|---|---|---|---|
| V15 | 1.5 | 1.2 | R3 200 |
| V18 | 1.8 | 1.2 | R3 600 |
| V24 | 2.4 | 1.2 | R4 500 |
| V30 | 3.0 | 1.2 | R5 300 |
| V42 | 4.2 | 1.2 | R7 500 |
| V48 | 4.8 | 1.2 | R9 100 |
| V60 | 6.0 | 1.2 | R11 100 |

### 4c. Extras — RESOLVED (read off the rendered artwork; the PDF has no text layer)

| Option | Price |
|---|---|
| ND1 pine window (568w × 808h) | R880 |
| ND2 pine window (1112w × 808h) | R1 650 |
| Burglar bars for ND windows, per opening | R430 |
| Additional Wendy-style door in panel | R490 |
| Convert Wendy-style door to stable | R300 |
| Serving flap — Wendy front, flap opens as serving counter | R770 |

**Termite poison is NOT an extra** — it sits in the price list's feature band as standard,
alongside "outside walls coated with wood sealant". Delivery remains "subject to area".
Maintenance note stated on the list: **annual re-coating required**.

### 4d. Frame Built Range — RESOLVED (PDF dated 01/02/2026)

Standard inclusions: post & bearer base to max 1m off ground + one set of steps · 38/114 timber
floor joists · 22mm T&G pine floor, 22mm veranda decking · 2.7m timber-frame walls · 30mm white
Isoboard ceiling · 0.4 heavy-duty galvanised corrugated roof · barge boards to gables ·
aluminium-framed windows. **Excludes electrics + plumbing.** Furniture/sanitaryware illustrative only.

| Size | Area | Beds | Log (K/pine lining) | Chromadek + drywall | Nutec + drywall |
|---|---|---|---|---|---|
| 6 × 6 m | 36 m² | 1 | R168 668 | R183 286 | R209 899 |
| 6 × 7.2 m | 43.2 m² | 1 | R201 355 | R219 560 | R251 601 |
| 6 × 9 m | 54 m² | 2 | R243 870 | R265 525 | R301 930 |
| 7.6 × 7.6 m | 57.76 m² | 2 | R253 873 | R276 698 | R315 170 |
| 6 × 12 m | 72 m² | 3 | R313 480 | R341 950 | R388 455 |
| 7.6 × 12 m | 91.2 m² | 3 | R386 979 | R422 767 | R479 037 |

Floor plans for all six were rendered from the PDF (vector) to `public/images/plans/frame-*.png`.
They carry full room breakdowns (kitchen/living/bath/bed m² + veranda) — strong page content.

### 4e. Wendy Houses Large Layout — RESOLVED

Three tiers — **Standard / Signature / Premium**:
- Standard: 2.1m walls, knotty pine T&G fixed vertically, Wendy-style doors, cottage-pane pine windows
- Signature: 2.4m walls, knotty pine, cottage-pane pine windows, ceiling follows roof line
- Premium: 2.4m walls **double skin**, hollow-core internal cottage doors, 1.8m aluminium sliding
  door, aluminium top-hung windows, ceiling follows roof line

The four layouts sit in a 2×2 grid, each floor plan directly above its own price row.
Names/sizes were read off the plan drawings (they are raster, so absent from the text layer):

| Layout | Size | Standard | Signature | Premium |
|---|---|---|---|---|
| Open work space / classroom | 6 × 6m, 36m² | R64 610 | R89 810 | R120 240 |
| One bedroom unit | 6 × 6m, 36m² | R71 440 | R95 640 | R135 180 |
| Two bedroom unit | 6 × 8m, 48m² | R98 805 | R131 685 | R185 350 |
| Three bedroom unit | 6 × 10m, 60m² | R124 065 | R164 625 | R224 290 |

Plans extracted to `public/images/plans/{slug}.png`.

---

## 5. Architecture

### Stack
- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, deployed on **Vercel**
- Static-first (SSG) — content and prices are files, not a database
- No CMS in v1. Prices live in typed TS modules so they're diff-able and reviewable.
- `next/image` for the photo library; `next/font` for self-hosted fonts

### Why no database
Prices change roughly annually (current PDF: May 2026). A typed data module gives version
history via git and zero runtime cost. If self-service editing becomes a requirement later,
the data shape is already CMS-ready.

### Price data model (`src/data/pricing.ts`)
```ts
export const VAT_RATE = 0.15;           // prices are VAT-INCLUSIVE as published
export type WendySize   = { code: string; front: number; side: number;
                            priceNoWindow: number; windowType: 'ND1'|'ND2';
                            priceOneWindow: number };
export type Veranda     = { code: string; front: number; side: number; price: number };
export type Extra       = { id: string; label: string; price: number | null; note?: string };
export type FrameBuilt  = { size: string; area: number; bedrooms: number;
                            log: number | null; chromadek: number | null; nutec: number | null };
```
Rule: **`null` price ⇒ render "POA — request a quote", never a guessed number.**

### Route map
```
/                        Home — hero, ranges, why-us, calculator teaser, projects, testimonials
/wendy-houses            Range overview + full HTML price table
/wendy-houses/[use]      garden-sheds · guard-huts · site-offices · site-accommodation
                         storerooms · clinics · classrooms
/frame-built             Range overview + chalet price table + spec inclusions
/frame-built/[use]       getaway-cabins · holiday-cottages · general-accommodation · offices
/quote                   ★ Interactive quote builder (the centrepiece)
/gallery                 Filterable project gallery
/faq                     FAQ hub + FAQPage schema
/about                   Est. 1993, Roy, the factory, the teams
/contact                 Map, hours, tappable phone, WhatsApp, form
```

### Quote builder (`/quote`) — the differentiator
1. Choose range → **Wendy House** or **Frame Built**
2. Wendy House: pick size (11 codes) → door only / one window → add veranda →
   toggle extras (termite, burglar bars, extra door, serving flap, stable door)
3. Live-updating total, VAT-inclusive, itemised
4. Delivery shown as **"quoted by area"** — never invented
5. Output: **WhatsApp deep-link** (`wa.me/27714696131` with pre-filled itemised message)
   + email fallback via Resend
6. Extras with `price: null` render as "POA" and are excluded from the total

This directly counters Mutsamvi's estimate-only calculator with real, published numbers.

### SEO foundation
- One real `<h1>` per page, text not image
- Unique `<title>` + meta description per route (kill "Just another WordPress site")
- `LocalBusiness` + `Product` + `FAQPage` JSON-LD
- OG images per route — **critical**, WhatsApp is the primary sharing channel
- `sitemap.xml`, `robots.txt`
- Tappable `tel:` links (drop `format-detection: telephone=no`)
- **Migration:** 301 the legacy WP URLs; ensure the demo-content URLs (`/hello-world`,
  `/category/test-prep/*` …) return **410 Gone**, not soft-404s

---

## 6. Build phases

**Phase 1 — Foundation** (Claude)
Scaffold Next.js + Tailwind, brand tokens, `pricing.ts` from §4, layout/header/footer.
*Verify:* `npm run build` passes; price data typechecks.

**Phase 2 — Core pages** (DeepSeek)
Home, range overviews, use-case template, about, contact.
*Verify:* every route renders; one `<h1>` each; no lorem ipsum.

**Phase 3 — Quote builder** (DeepSeek, Claude reviews maths)
*Verify:* W3660 + window = R31 600 exactly; + V60 veranda = R42 700; null extras → POA.

**Phase 4 — Gallery, FAQ, SEO** (DeepSeek)
Gallery with real photos migrated from WP, FAQ + schema, JSON-LD, sitemap, OG images.
*Verify:* Rich Results test passes; Lighthouse SEO ≥ 95.

**Phase 5 — Launch**
Resend keys, redirect map, DNS.

---

## 7. Content & feature roadmap (post-core)

**Content (SEO):**
- Service-area pages: Mbombela/Nelspruit, White River, Hazyview, Sabie, Barberton, Malelane,
  Komatipoort, Lydenburg, Graskop
- Money-page guides: *wendy house prices Nelspruit*, *wood vs Nutec*, *does a Wendy house need
  council approval?*, *termite protection in the Lowveld*, *maintenance schedule*
- **Backyard flatlet / rental-income guide** — very high SA search volume
- Case studies from the schools + clinics work (their strongest, most under-told story)

**Features:**
- Google Reviews embed (only one testimonial exists today)
- Delivery-cost estimator by town
- Auto-generated PDF quote (mirrors the existing PDFs, but personalised)
- 3D/visual configurator (v2)
- Staff price-editing UI, if annual dev updates become a burden

---

## 8. Open questions for the client

**Resolved (2026-07-16)** — all pricing was recovered from the source PDFs with PyMuPDF;
nothing renders as POA any more:
- ~~Extras pricing~~ → §4c
- ~~Large Layout mapping~~ → §4e
- ~~Frame Built gaps~~ → §4d
- ~~`wlcc.co.za`~~ → **it already 301s correctly to wozawendylane.co.za, images included.
  Keep renewing it — it is an old domain passing link equity. New site links internally.**
- ~~Vector logo~~ → 500px raster is fine at the 200px header size; the house mark was traced
  to SVG (`public/images/house-mark.svg`) so icons are crisp at any size.

**Still open:**
1. **Correct the current site's contact attribution.** The price list shows
   **083 647 0473 = Sibusiso Mndawe** (call) and **071 469 6131 = Linda Wagner** (WhatsApp).
   The live WP site's markup conflates them; we have it right in `business.ts`.
2. Playground equipment / kennels / furniture — still offered? The old title tag claims them
   and there's an orphan `/playground-equipment` page, but no content.
3. Wendy list is dated **May 2026**, Frame Built **01/02/2026** — both current for launch?
4. Delivery: what's the radius and rate card? Currently "quoted by area" everywhere.
5. Do they want the Large Layout / Frame Built **floor plans** public? They're now on the site
   (they're strong content), but confirm the client is happy publishing the drawings.
