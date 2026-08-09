# Kruger Panorama Experience

Marketing site for Kruger Panorama Experience (KPE), trading as Vonixiluva Hospitality (Pty) Ltd —
a community-involved safari and tour operator in the Mpumalanga Lowveld, South Africa.

Replaces the previous WordPress site at knp-panorama.com. Styled after the Goodlayers TravelTour
"Camper" demo, adapted to South African bushveld imagery.

- **Design spec:** `docs/superpowers/specs/2026-08-08-knp-panorama-design.md`
- **Implementation plan:** `docs/superpowers/plans/2026-08-08-knp-panorama-rebuild.md`

## Deliberately absent

Read spec §7 before adding any of these back. Each is missing on purpose:

| Not present | Why |
|---|---|
| Prices, cart, checkout, payment | Client instruction. Every commercial path ends in a quote request. |
| Login, registration, user accounts | Nothing to log into — there is no booking system. |
| Star ratings, review counts | KPE has no verifiable reviews. Inventing them would be dishonest. |
| Testimonials | Same. Add only when the client supplies real, attributable ones. |
| Counters and statistics | No founding year, tours run or guests hosted is verified. |
| Named guides and staff photos | The old site's guides were the theme's fictional demo people. |
| `aggregateRating` / `offers` in JSON-LD | An `offers` node requires a price, and there is none. |

`npm run verify` enforces the first three mechanically. **A hit is a real failure — fix the
source, do not relax the pattern.**

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

### Environment variables

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key. Without it `/api/quote` returns 502. |
| `QUOTE_TO_EMAIL` | Where quote requests are delivered. Defaults to info@knp-panorama.com. |
| `QUOTE_FROM_EMAIL` | Sender address. Its domain must be verified in Resend. |

Never commit real values. `.env` and `.env.local` are gitignored.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Vitest — data integrity and quote validation |
| `npm run verify` | The three prohibited-content checks from spec §1 and §7 |
| `npm run check` | verify + test + build. Run this before pushing. |

## Adding a tour

1. Append a `Tour` object to `src/data/tours.ts`.
2. Drop a landscape image at `public/images/tours/<slug>.webp` (≈1600px wide).
3. `npm run check`.

The route, sitemap entry, JSON-LD and card all generate from that object. No migration, no CMS,
no deploy configuration.

## Swapping in the client's photography

Filenames are the contract. Replace files in place under `public/images/` and nothing in the code
changes. Client photography is always preferred over the Creative Commons imagery currently in
use — see the next section.

## Image licensing — read before launch

Some photographs come from Wikimedia Commons under **CC BY** and **CC BY-SA** licences, which
**require visible attribution**. That is why `/image-credits` exists and why the footer links to
it. Do not remove that page or its link while those images are in use.

Full record: `docs/image-credits.md` and `docs/stock-manifest.json`.

Four images were harvested from the client's old WordPress site. It is **not verified** whether
they are the client's own photography or stock the previous developer licensed — confirm with the
client before treating them as owned work.

Replacing everything with the client's own photography removes the obligation entirely, which is
the preferred outcome.

## Deployment

Vercel, with the project's **Root Directory set to `knp-panorama`**. Auto-deploys on push.
Set the three environment variables in the Vercel project before the first deploy, or the quote
form will fail in production.

## Known outstanding

- **The real quote email send is unverified.** The validation and anti-bot paths are tested, but
  no email has actually been sent because no Resend key was available during the build. Verify
  with a real submission before launch.
- **Nightsbridge widgets are not embedded.** The two partner guesthouse cards link out to each
  guesthouse's own booking page instead. The embed IDs could not be recovered from the old site,
  and guessing an ID would silently show the wrong property's availability. See the TODO in
  `src/app/accommodation/page.tsx`.
