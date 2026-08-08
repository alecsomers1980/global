# Kruger Panorama Experience — Website Rebuild

**Date:** 2026-08-08
**Status:** Approved design, ready for implementation plan
**Client:** Kruger Panorama Experience (KPE) — Vonixiluva Hospitality (Pty) Ltd
**Replaces:** knp-panorama.com (WordPress + BeJourney theme + WooCommerce + WP-Travel)
**Visual reference:** https://demo.goodlayers.com/traveltour/homepages/camper/

---

## 1. Purpose

Rebuild knp-panorama.com as a fast, static Next.js marketing site that:

1. Reproduces the visual language of the Goodlayers TravelTour "Camper" demo as closely as
   practical, adapted to South African bushveld imagery.
2. Removes the WooCommerce paygate, cart, checkout, login/registration and all displayed
   prices. Every commercial path terminates in a **quote request**, not a transaction.
3. Discards the large volume of leftover theme demo content on the current site.

### Success criteria

- Every page in §4 renders and is reachable from the header or footer.
- No route, link, button or component anywhere on the site references a cart, checkout,
  payment, price, login or user account. Verified by grep over `src/` for
  `cart|checkout|payment|login|R[0-9]` and by a click-through of every page.
- Submitting the quote form on a tour page delivers an email to `info@knp-panorama.com`
  containing the tour name, and an auto-reply to the traveller. Verified by a real send,
  not by inspection.
- `npm run build` completes with no errors and no TypeScript errors.
- Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on Home and one tour page, mobile preset.
- No fabricated review, rating, testimonial, statistic or staff member appears anywhere.

---

## 2. What the current site actually contains

Audited 2026-08-08 via Firecrawl map + scrape.

### Real content (carries over)

**Business:** Kruger Panorama Experience (KPE), trading under Vonixiluva Hospitality (Pty) Ltd.
A community-involved tour operator in the Mpumalanga Lowveld. Guides are born and raised in
local communities. Partners with **Grow Through Learning**, a nonprofit working on nature
conservation, climate action and youth empowerment. Tour revenue funds environmental
education, youth programmes and community employment.

**Contact:** +27 (0) 73 490 1886 · info@knp-panorama.com

**Four service pillars:** Safari · Tours · Transfers · Accommodation

**Five experiences (the only real products):**

| Experience | Notes from current site |
|---|---|
| Half Day Safari — Kruger National Park | Shortened version of the full day |
| Full Day Safari — Kruger National Park | 8–10 hrs dawn to dusk; morning game drive, bush breakfast/picnic, midday ecosystems, afternoon drive, sunset. Bush braai included. Lunch + transport included. Was priced R1 100 |
| Half Day Panorama | Panorama Route |
| Full Day Panorama | Panorama Route |
| OR Tambo Transfer | Airport transfer |

**Comfort tiers** (used as a selector across the old site): Affordable Comfort · Premium
Comfort · Luxurious Experience.

**Destination taxonomy** (8 categories, mostly aspirational — only Kruger and Panorama have
products today): Kruger National Park · The Panorama Route · eSwatini · Mozambique · Local
Experiences · Johannesburg · Family Experiences · Adventure Experiences.

**Named landmarks referenced:** Blyde River Canyon, Bourke's Luck Potholes, God's Window,
Sabi Sands, Lowveld Botanical Garden, Pilgrim's Rest.

**Accommodation** — five descriptive tiers (Budget, Affordable, Comfort, Luxury, Exclusive)
plus two real partner guesthouses, both in Hazyview:

- **Woodpecker Guesthouse** — woodpeckersguesthouse.co.za
- **Fourways Guest House** — fourwayshazyview.co.za

Both currently expose a **Nightsbridge** availability widget. Per client decision these stay.

### Demo residue (discarded)

Leftover TravelTour/BeJourney sample data still live on the production site and must not be
carried over: `ttbm_places` for Bogura, Dim Pahar, Ravello, Amalfi, Positano, Pompeii, Capri,
Sorrento, Naples, Berlin landmarks, Cox's Bazar; lorem-ipsum blog posts; fictional guides
Adam Smith, Mahim, Shamim, Sumon, Rabiul; WooCommerce products with hash slugs; `/shop`,
`/cart`, `/checkout`, `/my-account`, `/wp-travel-checkout`, `/wp-travel-dashboard`,
`/hotel-search`, `/lotus-grid`, `/orchid-grid`.

---

## 3. Visual system

Derived from a full-page capture of the Camper demo.

### Tokens

| Token | Value | Use |
|---|---|---|
| `amber` | `#FFAF19` | Primary accent — buttons, links, active nav underline, pagination dots, icon badges |
| `amber-soft` | `#FFB156` | Hover / secondary accent |
| `ink` | `#141414` | Header bar, footer, dark overlays |
| `text` | `#1F1F1F` | Body copy |
| `paper` | `#FFFFFF` | Page background |
| `radius` | `3px` | Global border radius — the demo is near-square |
| `font` | Josefin Sans (400/600/700) | Everything; loaded via `next/font/google` |

Headings are uppercase with wide letter-spacing (`0.08em`–`0.2em`). The hero headline is the
one genuinely large type element on the page.

### Recurring patterns to reproduce

1. **Header** — slim near-black bar. Logo left, centred nav, amber flush-right block. Sticky.
   The demo's flush-right block is "Login"; ours is **"Request a Quote"**.
2. **Hero** — full-bleed photo, dark scrim, centred small tracked eyebrow, huge uppercase
   headline, one line of subcopy, amber button. A white **experience finder** card straddles
   the bottom edge of the hero, half overlapping the section below.
3. **Section header** — left-aligned title with a small amber "View All" link pushed to the
   right edge of the container.
4. **Watermark** — very faint grey mountain-outline SVG behind alternating sections. The
   demo uses an alpine range; ours uses a **Blyde Canyon / escarpment** silhouette.
5. **Icon badges** — three across; solid amber circle containing a line icon, heading, three
   lines of copy.
6. **Portrait tile strip** — edge-to-edge, zero gutters, 3:4 tiles, title over a bottom
   gradient, carousel arrows outside the container, amber dot pagination.
7. **Experience card** — white card, 16:9 image, small dark category chip top-left, title,
   duration and location meta rows with line icons, and a bottom action row. In the demo the
   bottom row is a price; **ours is an amber "Request a Quote →"**, preserving card geometry.
8. **Wide CTA band** — centred headline, paragraph, amber button, over a faint watermark.
9. **Footer** — dark, logo, link columns, contact block.

### Deliberate deviations from the demo

| Demo feature | Decision |
|---|---|
| Prices, sale strikethroughs, currency switcher | **Removed** — client instruction |
| Cart, checkout, "Proceed Booking", login, registration | **Removed** — client instruction |
| Star ratings on cards, review counts | **Removed** — KPE has no verifiable reviews. See §7 |
| Testimonial carousel | **Removed** until real testimonials are supplied. See §7 |
| Animated counters ("15 Years", "200+ Camps") | **Removed** until real figures are supplied. See §7 |
| Blog / news section | **Removed** — client scope decision |
| Gallery page, team page | **Removed** — client scope decision |

---

## 4. Sitemap

| Route | Contents |
|---|---|
| `/` | See §5 |
| `/safari` | Safari pillar. Intro, the two Kruger safari cards, comfort tiers, what to expect, quote CTA |
| `/tours` | Tours pillar. Panorama Route experiences, destination tile strip, quote CTA |
| `/transfers` | Transfers pillar. OR Tambo and general transfer copy, quote CTA |
| `/accommodation` | Five tiers as descriptive sections, then Woodpecker and Fourways partner cards each with its Nightsbridge widget |
| `/experiences/[slug]` | Statically generated from `tours.ts`. Hero image, overview, highlights, inclusions/exclusions, what to bring, embedded pre-filled quote form, WhatsApp button |
| `/contact` | Contact details, map, general enquiry form (the same `QuoteForm` component with the experience/destination/comfort/dates fields hidden — see §8), WhatsApp |
| `/request-a-quote` | Standalone quote form with an experience dropdown; target of header CTA |

`/experiences` itself is not a page — `/safari`, `/tours` and `/transfers` are the three
category listings, matching the client's existing mental model.

**Redirects** (`next.config.mjs`) from the old URLs, to preserve accumulated SEO:

```
/safari-2367        -> /safari
/tours-2370         -> /tours
/transfers-2372     -> /transfers
/accommodation-2386 -> /accommodation
/about-us-2383      -> /#our-story
/contact-us-2394    -> /contact
/travel/:slug       -> /experiences/:slug   (explicit map for the 5 known tours)
/shop /cart /checkout /my-account /wp-travel-* /product/* /ttbm_places/*  -> /
```

---

## 5. Homepage composition

1. **Hero** — full-bleed Kruger image. Eyebrow `EXPLORE`, headline `THE WILD LOWVELD`,
   subcopy naming Kruger National Park and the Panorama Route, amber "Discover Experiences"
   button.
2. **Experience finder** — white card overlapping the hero base. Three selects plus a
   submit: *Experience* (Safari / Tours / Transfers / Accommodation), *Destination* (the 8
   categories), *Comfort* (Affordable / Premium / Luxurious). Submitting navigates to
   `/request-a-quote` with the selections as query parameters, which pre-fill the form. It is
   a quote router, not a search index.
3. **Three icon badges** — Local guides born in Mpumalanga · Kruger & Panorama Route
   specialists · Travel that funds community projects.
4. **Destination tile strip** — the 8 destination categories as portrait tiles. Categories
   with no product yet link to `/request-a-quote` pre-filled rather than to a dead listing.
5. **Our Experiences** — card grid of the 5 real experiences.
6. **Our Story** (`id="our-story"`) — the About content: community-driven operator, local
   guides, and the Grow Through Learning partnership with its three funded areas.
7. **Accommodation teaser** — the five tiers condensed, linking to `/accommodation`.
8. **Wide CTA band** — "Plan your Lowveld journey" → `/request-a-quote`.
9. **Footer**.

---

## 6. Data model

Tours live in `src/data/tours.ts` as typed objects. No database, no CMS, no admin panel.

```ts
export type Pillar = 'safari' | 'tours' | 'transfers';
export type Destination =
  | 'kruger-national-park' | 'panorama-route' | 'eswatini' | 'mozambique'
  | 'local-experiences' | 'johannesburg' | 'family-experiences' | 'adventure-experiences';

export interface Tour {
  slug: string;
  title: string;
  pillar: Pillar;
  destination: Destination;
  duration: string;          // "8–10 hours"
  locationLabel: string;     // "Kruger National Park, Mpumalanga"
  summary: string;           // card copy + meta description
  heroImage: string;
  gallery: string[];
  overview: string[];        // paragraphs
  highlights: { title: string; body: string }[];
  included: string[];
  excluded: string[];
  whatToBring: string[];
}
```

Destinations and comfort tiers are separate exported constants in `src/data/taxonomy.ts` so
the finder, the tile strip and the quote form all read from one source.

Adding a tour = append one object plus images. No migration, no deploy config.

---

## 7. Honesty constraints

The reference demo's credibility rests on social proof that KPE does not have. These are
hard constraints on implementation, not preferences:

- **No star ratings or review counts** on cards or tour pages.
- **No testimonials.** The testimonial carousel is not built. If the client later supplies
  real, attributable reviews, it can be added then.
- **No statistics** — no founding year, years-in-business, tours-run, guests-hosted or
  locations count, because none are verified.
- **No named guides or staff photos** unless the client supplies real ones.
- Trust is carried instead by verifiable, already-published claims: local guides from
  Mpumalanga communities, the Grow Through Learning partnership and what it funds, the two
  named partner guesthouses, and the specific itinerary detail on the Full Day Safari.

If the client later supplies real reviews, a founding year and guide bios, the rating,
testimonial and counter components can be added as a follow-up. That is out of scope here.

---

## 8. Quote request

The single conversion mechanism.

**Form fields:** name, email, phone, experience (pre-filled where known), destination,
comfort tier, travel dates (from/to), adults, children, message.

**Placement:** embedded near the foot of every `/experiences/[slug]` page pre-filled with
that experience; embedded on each pillar page pre-filled with that pillar; standalone at
`/request-a-quote` accepting query-parameter pre-fill from the homepage finder and the
destination tiles. `/contact` renders the same component in a reduced `variant="contact"`
mode — name, email, phone, message only — posting to the same endpoint with a different
subject line. There is one form component and one endpoint on the site, not two.

**Delivery:** `POST /api/quote` → Resend. Two sends: a notification to
`info@knp-panorama.com` with all fields and the source page, and an auto-reply to the
traveller confirming receipt and stating a response window. No database — email is the
system of record, matching how the client already works.

**Validation:** server-side required-field and email-format checks. Errors render inline;
success replaces the form with a confirmation.

**Anti-bot:** hidden honeypot field plus a minimum submit-time threshold. No CAPTCHA and no
third-party script, per the standing project form standard.

**WhatsApp:** a `wa.me/27734901886` deep-link button beside the form on every tour page and
in the footer, pre-filled with the experience name. Most South African tour enquiries arrive
this way.

---

## 9. Imagery

Sourced in two passes:

1. **Harvest** the current site's WordPress uploads — confirmed to include `safari.jpg`,
   `tours.jpg`, `transfer.jpg`, `accommodation.jpg` and tour hero images. These are the
   client's own and take priority.
2. **Gap-fill** with free-licence (Unsplash / Pexels) imagery that is genuinely South
   African bushveld, Kruger, or Panorama Route. No non-African wildlife, no non-SA
   landscapes, no snow or alpine imagery inherited from the reference demo.

All images converted to WebP, sized for their layout slot, served through `next/image` with
explicit dimensions. Every image carries descriptive alt text.

Harvested and stock images are recorded in `docs/image-credits.md` with source URL and
licence so the client can later swap in their own photography.

---

## 10. Stack

Directory `knp-panorama/` in the Antigravity workspace, matching sibling projects.

- Next.js 14 App Router, TypeScript, Tailwind CSS 3
- `lucide-react` for line icons
- `resend` for transactional email
- No database, so no Supabase keep-alive workflow is required
- Deployment: Vercel, auto-deploy on push, project Root Directory set to `knp-panorama`

**Environment variables:** `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `QUOTE_FROM_EMAIL`.
Documented in `.env.example`; real values never committed.

### Component boundaries

Each component owns one thing and takes data as props, so pages stay declarative:

```
components/
  layout/     Header, Footer, MobileNav
  home/       Hero, ExperienceFinder, IconBadges, DestinationStrip, StoryBlock, CtaBand
  tours/      TourCard, TourGrid, TourMeta, HighlightList, InclusionList
  quote/      QuoteForm, QuoteFormFields, WhatsAppButton
  ui/         SectionHeader, Watermark, Button, Select, Carousel
```

`QuoteForm`, `ExperienceFinder` and `Carousel` are the client components; everything else is
a server component. `Carousel` is shared by the destination strip and any future card
carousel.

---

## 11. SEO / GEO

- Per-page metadata; tour pages generate title and description from `tours.ts`.
- `TouristTrip` and `LocalBusiness` JSON-LD. `LocalBusiness` carries the real phone, email
  and Mpumalanga service area. **No `aggregateRating`** — see §7.
- Target phrases drawn from real client positioning: Kruger National Park safari, Panorama
  Route tour, Hazyview, Nelspruit, Mpumalanga Lowveld, OR Tambo transfer, community safari.
- `sitemap.ts`, `robots.ts`, canonical URLs, Open Graph images per page.

---

## 12. Out of scope

Blog and AI article generation · gallery page · guides/team page · online booking or payment
of any kind · user accounts · multi-currency · admin CMS · live availability for KPE's own
tours · translation.

---

## 13. Open items for the client

Not blocking the build; each has a stated default so implementation can proceed.

1. **Real photography.** Default: harvest + stock per §9. The client's own photos can replace
   them at any point without code changes.
2. **Reviews, founding year, guide bios.** Default: those components are not built (§7).
3. **Prices.** The client asked for prices removed. Recorded here that the Full Day Safari
   was publicly listed at R1 100 and that removing all price signals may cost enquiries from
   price-comparing travellers. Default: follow the client's instruction, no prices anywhere.
4. **Nightsbridge widgets** are third-party iframes and cannot be fully restyled to match.
   Default: wrap each in a branded card frame.
