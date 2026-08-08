# KNP Panorama Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild knp-panorama.com as a static Next.js marketing site that clones the Goodlayers TravelTour "Camper" visual language for a Mpumalanga / Kruger tour operator, with every commercial path ending in a quote request instead of a paygate.

**Architecture:** Next.js 14 App Router, statically generated. Five tours live as typed objects in `src/data/tours.ts` — no database, no CMS. One `QuoteForm` component and one `/api/quote` endpoint serve every conversion point on the site, pre-filled by props or query parameters. Everything except the form, the finder and the carousel is a server component.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS 3, lucide-react, Resend, Vitest, Josefin Sans via `next/font/google`.

**Spec:** `docs/superpowers/specs/2026-08-08-knp-panorama-design.md` — read §7 before writing any component that displays social proof.

## Global Constraints

- **Working directory is `knp-panorama/`.** Every path in this plan is relative to it.
- **No prices anywhere.** No currency symbol, no "from R…", no strikethrough price, no currency switcher. The Full Day Safari's old R1 100 price must not appear in code, copy, alt text or metadata.
- **No cart, checkout, payment, login, registration or user account** — no route, no link, no button, no icon.
- **No fabricated social proof** (spec §7): no star ratings, no review counts, no testimonials, no statistics or counters, no named guides. No `aggregateRating` in JSON-LD.
- **Colour tokens:** `amber #FFAF19`, `amber-soft #FFB156`, `ink #141414`, `text #1F1F1F`, `paper #FFFFFF`. Global border radius `3px`.
- **Type:** Josefin Sans 400/600/700. Headings uppercase, letter-spacing `0.08em`–`0.2em`.
- **Imagery:** South African bushveld / Kruger / Panorama Route only. No alpine, snow, or non-African wildlife inherited from the reference demo.
- **Contact details (exact):** phone `+27 (0) 73 490 1886`, tel link `+27734901886`, WhatsApp `wa.me/27734901886`, email `info@knp-panorama.com`.
- **Legal entity:** Kruger Panorama Experience (KPE), trading under Vonixiluva Hospitality (Pty) Ltd.
- **Commit after every task.** Never `--no-verify`.

---

## File Structure

```
knp-panorama/
  src/
    app/
      layout.tsx                     Root layout, font, header/footer
      page.tsx                       Home
      globals.css                    Tailwind + tokens
      safari/page.tsx                Pillar listing
      tours/page.tsx                 Pillar listing
      transfers/page.tsx             Pillar listing
      accommodation/page.tsx         Tiers + partner guesthouses
      experiences/[slug]/page.tsx    Tour detail, generateStaticParams
      contact/page.tsx               Contact
      request-a-quote/page.tsx       Standalone quote form
      api/quote/route.ts             POST endpoint
      sitemap.ts  robots.ts  not-found.tsx
    components/
      layout/     Header.tsx  Footer.tsx  MobileNav.tsx
      home/       Hero.tsx  ExperienceFinder.tsx  IconBadges.tsx
                  DestinationStrip.tsx  StoryBlock.tsx  CtaBand.tsx
      tours/      TourCard.tsx  TourGrid.tsx  TourMeta.tsx
                  HighlightList.tsx  InclusionList.tsx
      quote/      QuoteForm.tsx  WhatsAppButton.tsx
      ui/         Button.tsx  SectionHeader.tsx  Watermark.tsx  Carousel.tsx
    data/
      taxonomy.ts                    Pillars, destinations, comfort tiers
      tours.ts                       The 5 experiences
      site.ts                        Contact details, nav, partner guesthouses
    lib/
      quote-schema.ts                Validation + anti-bot, framework-free
      email.ts                       Resend send helpers
    types/tour.ts
  tests/
    taxonomy.test.ts  tours.test.ts  quote-schema.test.ts
  scripts/harvest-images.mjs
  public/images/…
  docs/image-credits.md
```

Files that change together live together: each `components/` subfolder owns one page-region concern, and `lib/quote-schema.ts` is deliberately framework-free so it can be unit-tested without booting Next.

---

## Task 1: Scaffold, tokens, and the build gate

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `.gitignore`, `.env.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: Tailwind tokens `amber`, `amber-soft`, `ink`, `paper`, `text` usable as `bg-amber`, `text-ink` etc.; font CSS variable `--font-josefin`; `npm run build`, `npm run dev`, `npm test` scripts.

- [ ] **Step 1: Create the project files**

`package.json`:

```json
{
  "name": "knp-panorama",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "lucide-react": "^1.24.0",
    "next": "14.2.35",
    "react": "^18",
    "react-dom": "^18",
    "resend": "^6.16.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.35",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5",
    "vitest": "^2.1.8"
  }
}
```

`tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amber: '#FFAF19',
        'amber-soft': '#FFB156',
        ink: '#141414',
        paper: '#FFFFFF',
        text: '#1F1F1F',
      },
      borderRadius: { DEFAULT: '3px' },
      fontFamily: { sans: ['var(--font-josefin)', 'sans-serif'] },
      letterSpacing: { wide2: '0.08em', wide3: '0.12em', wide4: '0.2em' },
      maxWidth: { container: '1200px' },
    },
  },
  plugins: [],
};
export default config;
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`postcss.config.mjs`:

```js
const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;
```

`next.config.mjs` (redirects arrive in Task 14):

```js
/** @type {import('next').NextConfig} */
const nextConfig = { images: { formats: ['image/webp'] } };
export default nextConfig;
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

`.env.example`:

```
RESEND_API_KEY=
QUOTE_TO_EMAIL=info@knp-panorama.com
QUOTE_FROM_EMAIL=website@knp-panorama.com
```

`.gitignore`:

```
node_modules
.next
out
.env
.env.local
next-env.d.ts
tsconfig.tsbuildinfo
```

- [ ] **Step 2: Write globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-paper text-text font-sans antialiased; }
  h1, h2, h3, h4 { @apply uppercase font-semibold tracking-wide2; }
}

@layer components {
  .container-kpe { @apply mx-auto w-full max-w-container px-5 md:px-8; }
  .eyebrow { @apply uppercase tracking-wide4 text-sm font-semibold; }
}
```

- [ ] **Step 3: Write the root layout**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Josefin_Sans } from 'next/font/google';
import './globals.css';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-josefin',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.knp-panorama.com'),
  title: {
    default: 'Kruger Panorama Experience | Safaris & Tours in Mpumalanga',
    template: '%s | Kruger Panorama Experience',
  },
  description:
    'Community-driven safaris, Panorama Route tours, transfers and accommodation in the Mpumalanga Lowveld, with local guides born and raised in the area.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={josefin.variable}>
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx` — temporary, replaced in Task 8:

```tsx
export default function Home() {
  return <main className="container-kpe py-20"><h1>Kruger Panorama Experience</h1></main>;
}
```

- [ ] **Step 4: Install and verify the build gate**

Run: `npm install && npm run build`
Expected: `Compiled successfully`, route `/` listed as static. No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add knp-panorama/
git commit -m "feat(knp): scaffold Next.js app with Camper design tokens"
```

---

## Task 2: Harvest imagery and record credits

The old site's photos are real, South African, and already verified: 700×1100 portrait JPEGs. **That resolution is fine for portrait tiles and 16:9 cards, but too small for full-bleed heroes** — heroes must come from stock at ≥1920px wide.

**Files:**
- Create: `scripts/harvest-images.mjs`, `docs/image-credits.md`
- Create: `public/images/destinations/*.webp`, `public/images/heroes/*.webp`, `public/images/tours/*.webp`

**Interfaces:**
- Consumes: nothing.
- Produces: image paths referenced by `tours.ts` (Task 3) and every page component. Naming contract: `/images/destinations/<slug>.webp`, `/images/heroes/<page>.webp`, `/images/tours/<tour-slug>.webp`.

- [ ] **Step 1: Write the harvest script**

`scripts/harvest-images.mjs`:

```js
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://knp-panorama.com/wp-content/uploads';
const TARGETS = [
  { url: `${BASE}/2025/02/safari.jpg`, out: 'destinations/kruger-national-park.jpg' },
  { url: `${BASE}/2025/02/tours.jpg`, out: 'destinations/panorama-route.jpg' },
  { url: `${BASE}/2025/02/transfer.jpg`, out: 'destinations/transfers.jpg' },
  { url: `${BASE}/2025/02/accommodation.jpg`, out: 'destinations/accommodation.jpg' },
];

const root = path.join(process.cwd(), 'public', 'images');
for (const t of TARGETS) {
  const res = await fetch(t.url);
  if (!res.ok) { console.error(`MISS ${res.status} ${t.url}`); continue; }
  const dest = path.join(root, t.out);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`OK ${t.out}`);
}
```

- [ ] **Step 2: Run the harvest**

Run: `node scripts/harvest-images.mjs`
Expected: four `OK` lines. Any `MISS` means that image moved — find its current URL by scraping the matching page rather than substituting stock silently.

- [ ] **Step 3: Convert to WebP and confirm dimensions**

Run: `npx --yes sharp-cli --input "public/images/destinations/*.jpg" --output public/images/destinations --format webp --quality 82`
Then delete the source JPEGs.
Expected: four `.webp` files. Confirm each is 700×1100.

- [ ] **Step 4: Source the gap-fill imagery**

Needed beyond the four harvested files, all from Unsplash or Pexels, all genuinely South African:

| Path | Subject | Min width |
|---|---|---|
| `heroes/home.webp` | Kruger bushveld at golden hour, or elephant/lion in open savannah | 1920 |
| `heroes/safari.webp` | Open game-drive vehicle in Kruger | 1920 |
| `heroes/tours.webp` | Blyde River Canyon or God's Window | 1920 |
| `heroes/transfers.webp` | Lowveld road / airport transfer vehicle | 1920 |
| `heroes/accommodation.webp` | Lodge exterior or veranda in bushveld | 1920 |
| `destinations/eswatini.webp` | eSwatini landscape | 700×1100 |
| `destinations/mozambique.webp` | Mozambique coastline | 700×1100 |
| `destinations/local-experiences.webp` | Mpumalanga village or market | 700×1100 |
| `destinations/johannesburg.webp` | Johannesburg skyline | 700×1100 |
| `destinations/family-experiences.webp` | Family on safari | 700×1100 |
| `destinations/adventure-experiences.webp` | Zip-line / hiking in Mpumalanga | 700×1100 |
| `tours/<slug>.webp` × 5 | Match each tour's subject | 1600 |

Reject any candidate showing non-African wildlife, alpine or snow scenery, or right-hand-side-of-road driving that contradicts South African road rules.

- [ ] **Step 5: Write the credits file**

`docs/image-credits.md` — a table with columns `File | Source | Photographer | Licence | Notes`. The four harvested files are recorded as `knp-panorama.com (client's existing site)` with licence `Client-owned`. Every stock file records its full source URL, photographer name, and licence (`Unsplash Licence` / `Pexels Licence`).

Add this note at the top of the file verbatim:

```markdown
> Client photography takes priority over every stock image listed here.
> When the client supplies their own library, replace files in place —
> the filenames are the contract, so no code changes are needed.
```

- [ ] **Step 6: Commit**

```bash
git add knp-panorama/public/images knp-panorama/scripts knp-panorama/docs/image-credits.md
git commit -m "feat(knp): harvest client imagery, add stock gap-fill and credits"
```

---

## Task 3: Data layer

**Files:**
- Create: `src/types/tour.ts`, `src/data/taxonomy.ts`, `src/data/tours.ts`, `src/data/site.ts`
- Test: `tests/taxonomy.test.ts`, `tests/tours.test.ts`

**Interfaces:**
- Consumes: image paths from Task 2.
- Produces:
  - `Tour`, `Pillar`, `Destination`, `ComfortTier` types
  - `TOURS: Tour[]`, `getTour(slug: string): Tour | undefined`, `getToursByPillar(p: Pillar): Tour[]`
  - `DESTINATIONS: DestinationMeta[]`, `COMFORT_TIERS: ComfortTier[]`, `PILLARS: PillarMeta[]`
  - `SITE` with `phone`, `phoneHref`, `whatsappHref`, `email`, `legalName`, `tradingName`, `guesthouses`

- [ ] **Step 1: Write the failing tests**

`tests/tours.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { TOURS, getTour, getToursByPillar } from '@/data/tours';
import { DESTINATIONS } from '@/data/taxonomy';

describe('TOURS', () => {
  it('contains the five real experiences', () => {
    expect(TOURS).toHaveLength(5);
  });

  it('has unique slugs', () => {
    const slugs = TOURS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('references only known destinations', () => {
    const known = new Set(DESTINATIONS.map((d) => d.slug));
    for (const tour of TOURS) expect(known.has(tour.destination)).toBe(true);
  });

  it('never mentions a price', () => {
    const blob = JSON.stringify(TOURS);
    expect(blob).not.toMatch(/R\s?\d|ZAR|\$|price/i);
  });

  it('gives every tour a hero image and a summary', () => {
    for (const tour of TOURS) {
      expect(tour.heroImage).toMatch(/^\/images\//);
      expect(tour.summary.length).toBeGreaterThan(40);
    }
  });

  it('looks tours up by slug', () => {
    expect(getTour('full-day-safari-kruger-national-park')?.pillar).toBe('safari');
    expect(getTour('nope')).toBeUndefined();
  });

  it('filters by pillar', () => {
    expect(getToursByPillar('safari')).toHaveLength(2);
    expect(getToursByPillar('transfers')).toHaveLength(1);
  });
});
```

`tests/taxonomy.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { DESTINATIONS, COMFORT_TIERS, PILLARS } from '@/data/taxonomy';

describe('taxonomy', () => {
  it('has the eight destinations from the old site', () => {
    expect(DESTINATIONS).toHaveLength(8);
    expect(DESTINATIONS.map((d) => d.slug)).toContain('panorama-route');
  });

  it('has the three comfort tiers', () => {
    expect(COMFORT_TIERS.map((c) => c.label)).toEqual([
      'Affordable Comfort', 'Premium Comfort', 'Luxurious Experience',
    ]);
  });

  it('gives every destination an image and a label', () => {
    for (const d of DESTINATIONS) {
      expect(d.image).toMatch(/^\/images\/destinations\//);
      expect(d.label.length).toBeGreaterThan(2);
    }
  });

  it('has four pillars', () => {
    expect(PILLARS.map((p) => p.slug)).toEqual(['safari', 'tours', 'transfers', 'accommodation']);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/data/tours'`.

- [ ] **Step 3: Write the types**

`src/types/tour.ts`:

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
  duration: string;
  locationLabel: string;
  summary: string;
  heroImage: string;
  gallery: string[];
  overview: string[];
  highlights: { title: string; body: string }[];
  included: string[];
  excluded: string[];
  whatToBring: string[];
}
```

- [ ] **Step 4: Write the taxonomy**

`src/data/taxonomy.ts`:

```ts
import type { Destination, Pillar } from '@/types/tour';

export interface DestinationMeta { slug: Destination; label: string; image: string; blurb: string; }
export interface PillarMeta { slug: Pillar | 'accommodation'; label: string; href: string; }
export interface ComfortTierMeta { slug: string; label: string; blurb: string; }

export const PILLARS: PillarMeta[] = [
  { slug: 'safari', label: 'Safari', href: '/safari' },
  { slug: 'tours', label: 'Tours', href: '/tours' },
  { slug: 'transfers', label: 'Transfers', href: '/transfers' },
  { slug: 'accommodation', label: 'Accommodation', href: '/accommodation' },
];

export const COMFORT_TIERS: ComfortTierMeta[] = [
  { slug: 'affordable', label: 'Affordable Comfort', blurb: 'Everything you need for a full day in the bush, without the frills.' },
  { slug: 'premium', label: 'Premium Comfort', blurb: 'More space, more comfort, and a slower pace through the day.' },
  { slug: 'luxurious', label: 'Luxurious Experience', blurb: 'Private guiding, premium vehicles and the finest lodges we work with.' },
];

export const DESTINATIONS: DestinationMeta[] = [
  { slug: 'kruger-national-park', label: 'Kruger National Park', image: '/images/destinations/kruger-national-park.webp', blurb: 'Open-vehicle game drives tracking the Big Five across the Lowveld.' },
  { slug: 'panorama-route', label: 'The Panorama Route', image: '/images/destinations/panorama-route.webp', blurb: "Blyde River Canyon, Bourke's Luck Potholes and God's Window." },
  { slug: 'eswatini', label: 'eSwatini', image: '/images/destinations/eswatini.webp', blurb: 'Cross-border journeys into the Kingdom of eSwatini.' },
  { slug: 'mozambique', label: 'Mozambique', image: '/images/destinations/mozambique.webp', blurb: 'Warm Indian Ocean coastline within reach of the Lowveld.' },
  { slug: 'local-experiences', label: 'Local Experiences', image: '/images/destinations/local-experiences.webp', blurb: 'Village visits, markets and cultural heritage with local guides.' },
  { slug: 'johannesburg', label: 'Johannesburg', image: '/images/destinations/johannesburg.webp', blurb: 'City connections and transfers to and from Gauteng.' },
  { slug: 'family-experiences', label: 'Family Experiences', image: '/images/destinations/family-experiences.webp', blurb: 'Paced and planned for travellers of every age.' },
  { slug: 'adventure-experiences', label: 'Adventure Experiences', image: '/images/destinations/adventure-experiences.webp', blurb: 'Zip-lining, hiking and the active side of Mpumalanga.' },
];
```

- [ ] **Step 5: Write the site data**

`src/data/site.ts`:

```ts
export const SITE = {
  tradingName: 'Kruger Panorama Experience',
  shortName: 'KPE',
  legalName: 'Vonixiluva Hospitality (Pty) Ltd',
  phone: '+27 (0) 73 490 1886',
  phoneHref: 'tel:+27734901886',
  whatsappHref: 'https://wa.me/27734901886',
  email: 'info@knp-panorama.com',
  region: 'Mpumalanga Lowveld, South Africa',
  partner: {
    name: 'Grow Through Learning',
    blurb: 'A nonprofit driving nature conservation, climate action and youth empowerment in Mpumalanga.',
    funds: [
      { title: 'Environmental Education', body: 'Teaching communities to protect South Africa’s biodiversity.' },
      { title: 'Youth Programmes', body: 'Keeping children engaged, educated and off the streets.' },
      { title: 'Community Upliftment', body: 'Creating jobs and fostering pride in local heritage.' },
    ],
  },
  guesthouses: [
    {
      name: 'Woodpecker Guesthouse',
      location: 'Hazyview, Mpumalanga',
      website: 'https://woodpeckersguesthouse.co.za/',
      blurb:
        'On the outskirts of Nelspruit in the quiet town of Hazyview, Woodpecker Guesthouse has a homely feel away from home, with affordable accommodation, events and conferencing facilities, and outdoor activities.',
    },
    {
      name: 'Fourways Guest House',
      location: 'Hazyview, Mpumalanga',
      website: 'https://fourwayshazyview.co.za/',
      blurb:
        'A serene sanctuary in the lush heart of Hazyview, positioned as a gateway to the Kruger National Park, the Panorama Route and local activities like zip-lining and cultural tours.',
    },
  ],
} as const;
```

- [ ] **Step 6: Write the tours**

`src/data/tours.ts`. Overview copy for the Full Day Safari is adapted from the client's existing published description — keep the verified specifics (8–10 hours, dawn to dusk, bush braai, lunch and transport included) and drop the theme's hedging phrases like "if accessible".

```ts
import type { Pillar, Tour } from '@/types/tour';

export const TOURS: Tour[] = [
  {
    slug: 'full-day-safari-kruger-national-park',
    title: 'Full Day Safari — Kruger National Park',
    pillar: 'safari',
    destination: 'kruger-national-park',
    duration: '8–10 hours',
    locationLabel: 'Kruger National Park, Mpumalanga',
    summary:
      'Dawn to dusk in the Kruger, with a morning game drive, a bush braai, and an afternoon tracking the quieter corners of the park.',
    heroImage: '/images/tours/full-day-safari-kruger-national-park.webp',
    gallery: [],
    overview: [
      'A full-day safari in the Kruger National Park immerses you in the park’s vast wilderness, giving you the time to see how a day in the bush actually unfolds — from the dawn chorus through to the first movements of the night.',
      'The day runs eight to ten hours, dawn to dusk, and combines game drives with proper time to stop, eat and watch.',
    ],
    highlights: [
      { title: 'Morning Game Drive', body: 'Depart at sunrise to track the Big Five while predators are still active, stopping at waterholes and rivers for elephant, hippo and crocodile.' },
      { title: 'Bush Braai', body: 'A meal at a scenic rest camp or designated picnic site, surrounded by the park.' },
      { title: 'Midday Exploration', body: 'Move between the park’s ecosystems — open savannah through to riverine forest — where the game changes with the habitat.' },
      { title: 'Afternoon Drive', body: 'Head for the less-visited areas, where wild dog and cheetah are a real possibility, and finish on a sunset vista.' },
      { title: 'Guided Throughout', body: 'Your guide reads tracks, explains the plant ecology and talks through the conservation pressures the park is under.' },
    ],
    included: ['Lunch (bush braai)', 'Transport', 'Professional local guide', 'Park entry arrangements'],
    excluded: ['Personal spending money', 'Gratuities', 'Travel insurance'],
    whatToBring: ['Comfortable, neutral-coloured clothing', 'Sunscreen and a hat', 'Binoculars', 'Camera', 'A warm layer for the early start'],
  },
  // Remaining four tours follow the same shape:
  //   half-day-safari-kruger-national-park  (safari,  kruger-national-park, '4–5 hours')
  //   full-day-panorama                     (tours,   panorama-route,       '8–10 hours')
  //   half-day-panorama                     (tours,   panorama-route,       '4–5 hours')
  //   or-tambo-transfer                     (transfers, johannesburg,       'By arrangement')
];

export function getTour(slug: string): Tour | undefined {
  return TOURS.find((t) => t.slug === slug);
}

export function getToursByPillar(pillar: Pillar): Tour[] {
  return TOURS.filter((t) => t.pillar === pillar);
}
```

Write all five in full. For the four beyond the Full Day Safari the old site published only thin copy, so write honest descriptions grounded in verifiable facts — the Panorama Route tours name Blyde River Canyon, Bourke's Luck Potholes, God's Window and Pilgrim's Rest; the OR Tambo transfer describes the Johannesburg-to-Lowveld run. **Do not invent durations, inclusions or itinerary detail that contradicts the client's material.** Where a detail genuinely isn't known, leave it out rather than guessing — `duration: 'By arrangement'` is an honest answer for the transfer.

- [ ] **Step 7: Run the tests**

Run: `npm test`
Expected: PASS — 11 tests across two files.

- [ ] **Step 8: Commit**

```bash
git add knp-panorama/src/data knp-panorama/src/types knp-panorama/tests
git commit -m "feat(knp): add tour, taxonomy and site data with integrity tests"
```

---

## Task 4: UI primitives

**Files:**
- Create: `src/components/ui/Button.tsx`, `SectionHeader.tsx`, `Watermark.tsx`, `Carousel.tsx`

**Interfaces:**
- Consumes: Tailwind tokens from Task 1.
- Produces:
  - `<Button href? variant="solid"|"outline"|"ghost" size="md"|"lg">`
  - `<SectionHeader title viewAllHref? viewAllLabel?>`
  - `<Watermark />` — absolutely positioned faint escarpment SVG
  - `<Carousel itemsPerView={n}>` — client component, arrows outside, amber dots

- [ ] **Step 1: Write Button**

```tsx
import Link from 'next/link';

type Variant = 'solid' | 'outline' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-amber text-ink hover:bg-amber-soft',
  outline: 'border border-amber text-amber hover:bg-amber hover:text-ink',
  ghost: 'text-amber hover:text-amber-soft',
};

export function Button({
  href, variant = 'solid', size = 'md', className = '', children, ...rest
}: {
  href?: string; variant?: Variant; size?: 'md' | 'lg'; className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `inline-flex items-center justify-center gap-2 rounded uppercase tracking-wide2 font-semibold transition-colors ${
    size === 'lg' ? 'px-8 py-4 text-sm' : 'px-6 py-3 text-xs'
  } ${VARIANTS[variant]} ${className}`;

  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...rest}>{children}</button>;
}
```

- [ ] **Step 2: Write SectionHeader**

Mirrors the demo: left title, amber "View All" pushed right, bottom-aligned.

```tsx
import Link from 'next/link';

export function SectionHeader({
  title, viewAllHref, viewAllLabel = 'View All',
}: { title: string; viewAllHref?: string; viewAllLabel?: string }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6">
      <h2 className="text-2xl md:text-3xl tracking-wide2">{title}</h2>
      {viewAllHref && (
        <Link href={viewAllHref} className="shrink-0 text-xs uppercase tracking-wide3 text-amber hover:text-amber-soft">
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write Watermark**

An inline SVG escarpment silhouette at very low opacity, `aria-hidden`, `pointer-events-none`, absolutely positioned and centred behind a section. Parent sections must be `relative overflow-hidden`.

```tsx
export function Watermark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.045]"
    >
      <path
        fill="#141414"
        d="M0 400 L0 300 L120 250 L240 290 L360 180 L470 250 L560 140 L680 240 L800 120 L900 220 L1010 160 L1130 260 L1240 200 L1340 280 L1440 240 L1440 400 Z"
      />
    </svg>
  );
}
```

- [ ] **Step 4: Write Carousel**

Client component. Horizontal scroll-snap track, arrow buttons positioned outside the container, amber dot pagination beneath. Arrows hidden on mobile, where the track scrolls by touch.

```tsx
'use client';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Carousel({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  const pages = 3;

  return (
    <div className="relative">
      <button onClick={() => scrollBy(-1)} aria-label="Previous"
        className="absolute -left-10 top-1/2 hidden -translate-y-1/2 text-ink/40 hover:text-amber lg:block">
        <ChevronLeft size={32} />
      </button>
      <div ref={track} onScroll={onScroll} aria-label={ariaLabel}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]{display:none}">
        {children}
      </div>
      <button onClick={() => scrollBy(1)} aria-label="Next"
        className="absolute -right-10 top-1/2 hidden -translate-y-1/2 text-ink/40 hover:text-amber lg:block">
        <ChevronRight size={32} />
      </button>
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: pages }).map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i === page ? 'bg-amber' : 'bg-ink/20'}`} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify the build**

Run: `npm run build`
Expected: `Compiled successfully`, no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add knp-panorama/src/components/ui
git commit -m "feat(knp): add UI primitives matching Camper visual language"
```

---

## Task 5: Header, footer and mobile navigation

The header is where the paygate removal becomes visible: the demo's flush-right amber block says "Login"; ours says "Request a Quote".

**Files:**
- Create: `src/components/layout/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`
- Modify: `src/app/layout.tsx` — mount Header and Footer around `{children}`

**Interfaces:**
- Consumes: `SITE` (Task 3), `PILLARS` (Task 3), `Button` (Task 4).
- Produces: site chrome on every page. No other task modifies these.

- [ ] **Step 1: Write Header**

Sticky, `bg-ink`, `h-16`. Three zones: logo left, centred nav, amber CTA block flush to the right viewport edge (no container padding on that block — it bleeds to the edge exactly like the demo). Active link carries a 2px amber underline.

```tsx
import Link from 'next/link';
import { PILLARS } from '@/data/taxonomy';
import { MobileNav } from './MobileNav';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="flex h-16 items-center">
        <Link href="/" className="flex shrink-0 items-center gap-2 px-5 md:px-8">
          <span className="text-sm font-bold uppercase tracking-wide4">Kruger Panorama</span>
        </Link>
        <nav className="mx-auto hidden items-center gap-8 lg:flex">
          <Link href="/" className="text-xs uppercase tracking-wide3 hover:text-amber">Home</Link>
          {PILLARS.map((p) => (
            <Link key={p.slug} href={p.href} className="text-xs uppercase tracking-wide3 hover:text-amber">
              {p.label}
            </Link>
          ))}
          <Link href="/contact" className="text-xs uppercase tracking-wide3 hover:text-amber">Contact</Link>
        </nav>
        <Link href="/request-a-quote"
          className="ml-auto hidden h-16 items-center bg-amber px-8 text-xs font-semibold uppercase tracking-wide3 text-ink hover:bg-amber-soft lg:flex">
          Request a Quote
        </Link>
        <MobileNav />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Write MobileNav**

Client component. Hamburger visible below `lg`, opens a full-screen `bg-ink` panel listing Home, the four pillars, Contact, and a full-width amber "Request a Quote" button. Closes on link click and on Escape.

- [ ] **Step 3: Write Footer**

`bg-ink`, four columns collapsing to one on mobile: brand + one-line positioning; Explore (the four pillars); Company (Contact, Request a Quote); Contact block with `SITE.phone` as a `tel:` link, `SITE.email` as `mailto:`, and a WhatsApp link. Bottom bar: `© {year} Kruger Panorama Experience. Vonixiluva Hospitality (Pty) Ltd.`

**No "Pay Safely With Us" block, no payment-provider logos, no currency switcher** — the demo has all three and they must not be reproduced.

- [ ] **Step 4: Mount in the root layout**

```tsx
<body>
  <Header />
  {children}
  <Footer />
</body>
```

- [ ] **Step 5: Verify in the browser**

Run: `npm run dev`
Open `http://localhost:3000`. Confirm: header is sticky on scroll; the amber CTA touches the right viewport edge; below 1024px the nav collapses to a hamburger that opens and closes; the footer shows the real phone number and email and no payment imagery.

- [ ] **Step 6: Commit**

```bash
git add knp-panorama/src/components/layout knp-panorama/src/app/layout.tsx
git commit -m "feat(knp): add header, footer and mobile nav with quote CTA"
```

---

## Task 6: Quote validation, anti-bot and the API route

This is the task with real business logic, so it gets real tests. `lib/quote-schema.ts` is deliberately free of Next and Resend imports so it runs under Vitest in a plain node environment.

**Files:**
- Create: `src/lib/quote-schema.ts`, `src/lib/email.ts`, `src/app/api/quote/route.ts`
- Test: `tests/quote-schema.test.ts`

**Interfaces:**
- Consumes: `SITE` (Task 3).
- Produces:
  - `type QuotePayload`
  - `validateQuote(input: unknown): { ok: true; data: QuotePayload } | { ok: false; errors: Record<string,string> }`
  - `isBot(input: { website?: string; renderedAt?: number }, now?: number): boolean`
  - `POST /api/quote` returning `{ ok: true }` (200) or `{ ok: false, errors }` (400)

- [ ] **Step 1: Write the failing tests**

`tests/quote-schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateQuote, isBot, MIN_SUBMIT_MS } from '@/lib/quote-schema';

const valid = {
  name: 'Thandi Mokoena',
  email: 'thandi@example.co.za',
  phone: '0821234567',
  experience: 'full-day-safari-kruger-national-park',
  destination: 'kruger-national-park',
  comfort: 'premium',
  dateFrom: '2026-09-01',
  dateTo: '2026-09-03',
  adults: 2,
  children: 1,
  message: 'We would like a private vehicle if possible.',
};

describe('validateQuote', () => {
  it('accepts a complete payload', () => {
    const r = validateQuote(valid);
    expect(r.ok).toBe(true);
  });

  it('requires name, email and phone', () => {
    const r = validateQuote({ ...valid, name: '', email: '', phone: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.name).toBeDefined();
      expect(r.errors.email).toBeDefined();
      expect(r.errors.phone).toBeDefined();
    }
  });

  it('rejects a malformed email', () => {
    const r = validateQuote({ ...valid, email: 'not-an-email' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toMatch(/valid email/i);
  });

  it('accepts a contact-variant payload with no trip fields', () => {
    const r = validateQuote({
      name: 'Sipho', email: 'sipho@example.com', phone: '0721234567',
      message: 'General question about your tours.',
    });
    expect(r.ok).toBe(true);
  });

  it('rejects adults below one when supplied', () => {
    const r = validateQuote({ ...valid, adults: 0 });
    expect(r.ok).toBe(false);
  });

  it('rejects a departure date before the arrival date', () => {
    const r = validateQuote({ ...valid, dateFrom: '2026-09-05', dateTo: '2026-09-01' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.dateTo).toBeDefined();
  });

  it('trims whitespace off the name', () => {
    const r = validateQuote({ ...valid, name: '  Thandi  ' });
    if (r.ok) expect(r.data.name).toBe('Thandi');
  });
});

describe('isBot', () => {
  it('flags a filled honeypot', () => {
    expect(isBot({ website: 'http://spam.example', renderedAt: 0 }, MIN_SUBMIT_MS + 1000)).toBe(true);
  });

  it('flags a submission faster than the threshold', () => {
    expect(isBot({ website: '', renderedAt: 10_000 }, 10_000 + MIN_SUBMIT_MS - 1)).toBe(true);
  });

  it('allows an empty honeypot after a human delay', () => {
    expect(isBot({ website: '', renderedAt: 10_000 }, 10_000 + MIN_SUBMIT_MS + 1)).toBe(false);
  });

  it('treats a missing timestamp as a bot', () => {
    expect(isBot({ website: '' }, 50_000)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/quote-schema'`.

- [ ] **Step 3: Implement the schema**

```ts
export const MIN_SUBMIT_MS = 3000;

export interface QuotePayload {
  name: string; email: string; phone: string;
  experience?: string; destination?: string; comfort?: string;
  dateFrom?: string; dateTo?: string;
  adults?: number; children?: number;
  message?: string;
  sourcePage?: string;
}

type Result =
  | { ok: true; data: QuotePayload }
  | { ok: false; errors: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateQuote(input: unknown): Result {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  const name = str(raw.name);
  const email = str(raw.email);
  const phone = str(raw.phone);

  if (!name) errors.name = 'Please tell us your name.';
  if (!email) errors.email = 'Please give us an email address.';
  else if (!EMAIL.test(email)) errors.email = 'That does not look like a valid email address.';
  if (!phone) errors.phone = 'Please give us a phone number.';

  const num = (v: unknown) => (v === undefined || v === '' ? undefined : Number(v));
  const adults = num(raw.adults);
  const children = num(raw.children);

  if (adults !== undefined && (!Number.isFinite(adults) || adults < 1)) {
    errors.adults = 'There needs to be at least one adult.';
  }
  if (children !== undefined && (!Number.isFinite(children) || children < 0)) {
    errors.children = 'Number of children cannot be negative.';
  }

  const dateFrom = str(raw.dateFrom);
  const dateTo = str(raw.dateTo);
  if (dateFrom && dateTo && new Date(dateTo) < new Date(dateFrom)) {
    errors.dateTo = 'The return date cannot be before the arrival date.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name, email, phone,
      experience: str(raw.experience) || undefined,
      destination: str(raw.destination) || undefined,
      comfort: str(raw.comfort) || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      adults, children,
      message: str(raw.message) || undefined,
      sourcePage: str(raw.sourcePage) || undefined,
    },
  };
}

export function isBot(
  input: { website?: string; renderedAt?: number },
  now: number = Date.now(),
): boolean {
  if (input.website) return true;
  if (typeof input.renderedAt !== 'number') return true;
  return now - input.renderedAt < MIN_SUBMIT_MS;
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: PASS — 11 new tests.

- [ ] **Step 5: Implement the email helpers**

`src/lib/email.ts` exports `sendQuoteNotification(data: QuotePayload)` and `sendQuoteAutoReply(data: QuotePayload)`. Both construct their Resend client inside the function from `process.env.RESEND_API_KEY` so a missing key fails at request time, not at build time.

The notification subject is `` `New quote request — ${data.experience ?? 'General enquiry'}` ``, the reply-to is the traveller's address, and the body lists every supplied field plus `sourcePage`. The auto-reply thanks the traveller by name, restates which experience they asked about, states that the team replies within one business day, and signs off with `SITE.phone` and `SITE.whatsappHref`. **Neither email may quote or imply a price.**

- [ ] **Step 6: Implement the route**

```ts
import { NextResponse } from 'next/server';
import { validateQuote, isBot } from '@/lib/quote-schema';
import { sendQuoteNotification, sendQuoteAutoReply } from '@/lib/email';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, errors: { form: 'Invalid request.' } }, { status: 400 });

  // Silently accept bots so they get no signal to retry.
  if (isBot({ website: body.website, renderedAt: body.renderedAt })) {
    return NextResponse.json({ ok: true });
  }

  const result = validateQuote(body);
  if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });

  try {
    await sendQuoteNotification(result.data);
    await sendQuoteAutoReply(result.data);
  } catch (error) {
    console.error('quote send failed', error);
    return NextResponse.json(
      { ok: false, errors: { form: 'We could not send that just now. Please phone or WhatsApp us instead.' } },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Commit**

```bash
git add knp-panorama/src/lib knp-panorama/src/app/api knp-panorama/tests/quote-schema.test.ts
git commit -m "feat(knp): add quote validation, anti-bot guard and send endpoint"
```

---

## Task 7: QuoteForm

**Files:**
- Create: `src/components/quote/QuoteForm.tsx`, `src/components/quote/WhatsAppButton.tsx`

**Interfaces:**
- Consumes: `/api/quote` (Task 6), `MIN_SUBMIT_MS` (Task 6), `DESTINATIONS`/`COMFORT_TIERS`/`TOURS` (Task 3), `Button` (Task 4).
- Produces: `<QuoteForm variant="full"|"contact" defaultExperience? defaultDestination? defaultComfort? sourcePage />` and `<WhatsAppButton experience? />`. Used by Tasks 8–12.

- [ ] **Step 1: Build the form**

Client component. On mount it records `renderedAt = Date.now()` in a ref, satisfying the timing guard from Task 6. It renders a visually hidden `website` honeypot input with `tabIndex={-1}` and `autoComplete="off"`.

`variant="full"` renders: name, email, phone, experience `<select>` (options from `TOURS`), destination `<select>` (from `DESTINATIONS`), comfort `<select>` (from `COMFORT_TIERS`), dateFrom, dateTo, adults, children, message.
`variant="contact"` renders only: name, email, phone, message.

State machine: `idle → submitting → success | error`. On success the form element is replaced by a confirmation panel — amber check icon, "Thank you, we have your request", the response-window sentence, and a WhatsApp button for anything urgent. Field errors from the 400 response render inline beneath their input in red, and the first invalid field receives focus.

Query-parameter pre-fill is handled by the **page**, which reads `searchParams` and passes `default*` props down — the form itself does not read the URL, so it stays testable and reusable.

- [ ] **Step 2: Build WhatsAppButton**

```tsx
import { SITE } from '@/data/site';

export function WhatsAppButton({ experience }: { experience?: string }) {
  const text = experience
    ? `Hi Kruger Panorama Experience, I would like a quote for the ${experience}.`
    : 'Hi Kruger Panorama Experience, I would like to enquire about a trip.';
  return (
    <a
      href={`${SITE.whatsappHref}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded border border-ink/15 px-6 py-3 text-xs font-semibold uppercase tracking-wide2 hover:border-amber hover:text-amber"
    >
      Chat on WhatsApp
    </a>
  );
}
```

- [ ] **Step 3: Verify against a real send**

Set `RESEND_API_KEY`, `QUOTE_TO_EMAIL` (your own address for the test) and `QUOTE_FROM_EMAIL` in `.env.local`.
Run: `npm run dev`, mount the form temporarily on `/`, wait more than three seconds, submit a complete payload.
Expected: confirmation panel replaces the form; a notification email arrives naming the experience; an auto-reply arrives at the traveller address; neither email contains a price.
Then verify the guards: submit with an empty name → inline error, no email. Submit within three seconds of load → `{ ok: true }` with no email sent.

This is the spec's headline success criterion. **Do not mark this task complete on inspection — the emails must actually arrive.**

- [ ] **Step 4: Commit**

```bash
git add knp-panorama/src/components/quote
git commit -m "feat(knp): add quote form with honeypot and timing guard"
```

---

## Task 8: Homepage

**Files:**
- Create: `src/components/home/Hero.tsx`, `ExperienceFinder.tsx`, `IconBadges.tsx`, `DestinationStrip.tsx`, `StoryBlock.tsx`, `CtaBand.tsx`
- Modify: `src/app/page.tsx` — replace the Task 1 placeholder

**Interfaces:**
- Consumes: Tasks 3, 4, 5, 7 and `TourGrid` from Task 9. **Build Task 9's `TourCard`/`TourGrid` first if executing strictly in order** — or stub the "Our Experiences" section here and fill it in Task 9.
- Produces: the finished `/`.

- [ ] **Step 1: Hero**

Full-bleed `next/image` with `priority` and `fill`, `object-cover`, `bg-ink/45` scrim. Centred stack: eyebrow `EXPLORE`, `<h1>` `THE WILD LOWVELD` at `text-5xl md:text-7xl tracking-wide3`, one subcopy line naming the Kruger National Park and the Panorama Route, then a `<Button href="/safari" size="lg">Discover Experiences</Button>`. Section height `min-h-[78vh]`, with `pb-24` so the finder can overlap.

- [ ] **Step 2: ExperienceFinder**

Client component, white card, `-mt-20 relative z-10`, inside `container-kpe`, `shadow-xl`. A four-column grid on desktop collapsing to one column on mobile: three `<select>`s (Experience / Destination / Comfort) and an amber submit occupying the fourth column at full height.

Submitting pushes to `/request-a-quote?experience=…&destination=…&comfort=…` via `useRouter`. It performs no filtering and shows no results — it is a quote router, and its submit button reads **Request a Quote**, not "Search".

- [ ] **Step 3: IconBadges**

Three columns, centred. Each: an 80px solid amber circle containing a white lucide icon, a `<h3>`, and two or three lines of copy. Content, matching spec §5 and §7 — these carry trust in place of the demo's fabricated counters:

| Icon | Heading | Copy |
|---|---|---|
| `Users` | Local Guides | Our guides were born and raised in Mpumalanga's communities, and they guide the Lowveld as home rather than as a destination. |
| `Binoculars` (or `Compass`) | Kruger & Panorama Specialists | We work two areas properly — the Kruger National Park and the Panorama Route — instead of covering the whole country thinly. |
| `Sprout` | Travel That Gives Back | Every trip helps fund Grow Through Learning's conservation, youth and community work in Mpumalanga. |

- [ ] **Step 4: DestinationStrip**

Edge-to-edge, zero gutters — deliberately breaks out of `container-kpe`. 3:4 portrait tiles, four visible on desktop, wrapped in `Carousel`. Each tile: `next/image` `fill object-cover`, a `bg-gradient-to-t from-ink/80` overlay, and the destination label in white at the bottom left.

Every tile links to `/request-a-quote?destination=<slug>`, **not** to a category listing page — six of the eight destinations have no product yet, and a tile that leads somewhere empty is worse than one that leads to a conversation.

- [ ] **Step 5: StoryBlock**

`id="our-story"` — the `/about-us-2383` redirect target, so this anchor must exist. Two columns: image left, copy right. Heading `A Safari That Belongs To Its Community`, two paragraphs adapted from the client's published About copy (community-driven operator, guides rooted in local communities, responsible tourism at the core), then the three `SITE.partner.funds` items as a compact list under a line naming Grow Through Learning.

State only what the client already publishes. No founding year, no numbers.

- [ ] **Step 6: CtaBand**

`relative overflow-hidden bg-[#FAFAFA] py-24` with `<Watermark />`. Centred: `<h2>` "Plan Your Lowveld Journey", one paragraph, and a `<Button href="/request-a-quote" size="lg">`.

- [ ] **Step 7: Assemble the page**

`src/app/page.tsx` composes, in order: `Hero`, `ExperienceFinder`, `IconBadges`, `DestinationStrip`, `TourGrid` (in a `SectionHeader` "Our Experiences" section, `viewAllHref="/safari"`), `StoryBlock`, an accommodation teaser linking to `/accommodation`, `CtaBand`.

- [ ] **Step 8: Verify in the browser**

Run: `npm run dev` and open `/`.
Confirm: the finder card overlaps the hero base; the destination strip runs edge-to-edge with no gutters; the carousel arrows work above 1024px and the track swipes on touch; every destination tile lands on a pre-filled `/request-a-quote`; `#our-story` scrolls correctly; no price, rating or testimonial appears anywhere on the page.

Also run `npm run build` and confirm `/` is emitted as a static route.

- [ ] **Step 9: Commit**

```bash
git add knp-panorama/src/components/home knp-panorama/src/app/page.tsx
git commit -m "feat(knp): build homepage in Camper layout"
```

---

## Task 9: Tour cards and the three pillar pages

**Files:**
- Create: `src/components/tours/TourCard.tsx`, `TourGrid.tsx`, `TourMeta.tsx`
- Create: `src/app/safari/page.tsx`, `src/app/tours/page.tsx`, `src/app/transfers/page.tsx`

**Interfaces:**
- Consumes: `TOURS`, `getToursByPillar` (Task 3); `Button`, `SectionHeader`, `Watermark` (Task 4); `QuoteForm` (Task 7).
- Produces: `<TourCard tour>`, `<TourGrid tours>`, `<TourMeta duration location>` — reused by Task 10.

- [ ] **Step 1: TourCard**

Reproduces the demo's card geometry with the price row swapped for the quote CTA:

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Tour } from '@/types/tour';
import { DESTINATIONS } from '@/data/taxonomy';

export function TourCard({ tour }: { tour: Tour }) {
  const destination = DESTINATIONS.find((d) => d.slug === tour.destination);
  return (
    <article className="group flex flex-col overflow-hidden rounded bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/experiences/${tour.slug}`} className="relative block aspect-[16/9] overflow-hidden">
        <Image src={tour.heroImage} alt={tour.title} fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw" />
        {destination && (
          <span className="absolute left-3 top-3 bg-ink/85 px-3 py-1 text-[10px] uppercase tracking-wide3 text-white">
            {destination.label}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base leading-snug tracking-wide2">
          <Link href={`/experiences/${tour.slug}`} className="hover:text-amber">{tour.title}</Link>
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-text/70 normal-case">{tour.summary}</p>
        <div className="space-y-1 text-xs text-text/60">
          <span className="flex items-center gap-2"><Clock size={14} />{tour.duration}</span>
          <span className="flex items-center gap-2"><MapPin size={14} />{tour.locationLabel}</span>
        </div>
        <Link href={`/experiences/${tour.slug}`}
          className="mt-2 flex items-center gap-2 border-t border-ink/10 pt-4 text-xs font-semibold uppercase tracking-wide3 text-amber hover:text-amber-soft">
          Request a Quote <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
```

**No star row and no review count** — the demo card has both directly above the title. Leave that space empty.

- [ ] **Step 2: TourGrid**

`grid gap-8 md:grid-cols-2 lg:grid-cols-3`, mapping `TourCard`. Renders nothing when `tours` is empty.

- [ ] **Step 3: Build the three pillar pages**

Each follows one template: a compact hero (`h-[45vh]`, page image, scrim, `<h1>`, one-line intro), an intro paragraph, a `TourGrid` of that pillar's tours, a supporting section, a `QuoteForm variant="full"` pre-filled with the pillar, and `CtaBand`.

| Route | `<h1>` | Supporting section |
|---|---|---|
| `/safari` | Safari | The three comfort tiers from `COMFORT_TIERS` as cards |
| `/tours` | Tours | The `DestinationStrip` |
| `/transfers` | Transfers | Plain copy on airport and journey transfers — OR Tambo, KMIA, lodge connections |

Each exports `metadata` with a title and a description drawn from its own copy.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: `/safari`, `/tours` and `/transfers` all listed as static (`○`).
Then in `npm run dev` confirm each page lists the right tours — Safari 2, Tours 2, Transfers 1 — and that no card shows a star, rating or price.

- [ ] **Step 5: Commit**

```bash
git add knp-panorama/src/components/tours knp-panorama/src/app/safari knp-panorama/src/app/tours knp-panorama/src/app/transfers
git commit -m "feat(knp): add tour cards and safari, tours and transfers pages"
```

---

## Task 10: Tour detail pages

**Files:**
- Create: `src/app/experiences/[slug]/page.tsx`
- Create: `src/components/tours/HighlightList.tsx`, `InclusionList.tsx`

**Interfaces:**
- Consumes: `getTour`, `TOURS` (Task 3); `TourMeta` (Task 9); `QuoteForm`, `WhatsAppButton` (Task 7).
- Produces: five static routes under `/experiences/`.

- [ ] **Step 1: Static generation and not-found**

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TOURS, getTour } from '@/data/tours';

export function generateStaticParams() {
  return TOURS.map((tour) => ({ slug: tour.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tour = getTour(params.slug);
  if (!tour) return {};
  return {
    title: tour.title,
    description: tour.summary,
    openGraph: { title: tour.title, description: tour.summary, images: [tour.heroImage] },
  };
}

export default function ExperiencePage({ params }: { params: { slug: string } }) {
  const tour = getTour(params.slug);
  if (!tour) notFound();
  // …
}
```

- [ ] **Step 2: Page composition**

In order: hero (`tour.heroImage`, scrim, `<h1>{tour.title}</h1>`, `TourMeta` beneath in white); a two-column body where the left column is Overview paragraphs → `HighlightList` → `InclusionList` (included/excluded side by side with `Check` and `X` lucide icons) → What to Bring, and the right column is a `sticky top-24` card containing `QuoteForm variant="full" defaultExperience={tour.slug} defaultDestination={tour.destination}` with a `WhatsAppButton experience={tour.title}` beneath it; then `CtaBand`.

The sticky card is where the demo puts its price box and "Check Availability" button. Ours holds the quote form. **No price, no availability calendar, no booking button.**

On mobile the sticky card drops below the body content in normal flow.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: five `/experiences/…` routes listed as static, generated by `generateStaticParams`.
In `npm run dev`, open `/experiences/full-day-safari-kruger-national-park` and confirm the overview, five highlights, inclusions and exclusions all render, the right column sticks on scroll, and the form is pre-filled with the tour. Open `/experiences/nonsense` and confirm a 404.

- [ ] **Step 4: Commit**

```bash
git add knp-panorama/src/app/experiences knp-panorama/src/components/tours
git commit -m "feat(knp): add tour detail pages with embedded quote form"
```

---

## Task 11: Accommodation

**Files:**
- Create: `src/app/accommodation/page.tsx`
- Create: `src/components/accommodation/TierList.tsx`, `PartnerCard.tsx`

**Interfaces:**
- Consumes: `SITE.guesthouses` (Task 3).
- Produces: `/accommodation`.

- [ ] **Step 1: Tier list**

Five descriptive tiers from the old site — Budget, Affordable, Comfort, Luxury, Exclusive — each a heading, a horizontal rule and a paragraph, matching the old page's rhythm. Adapt the existing copy; it is the client's own and reads well.

- [ ] **Step 2: Partner cards**

One card per `SITE.guesthouses` entry: name, location, blurb, an outbound link to the guesthouse's own site (`target="_blank" rel="noopener noreferrer"`), and its Nightsbridge widget.

Per spec §13, the Nightsbridge widget is a third-party embed that cannot be restyled. Wrap it in a branded frame so the seam is deliberate rather than accidental:

```tsx
<div className="rounded border border-ink/10 bg-[#FAFAFA] p-4">
  <p className="mb-3 text-xs uppercase tracking-wide3 text-text/60">Check availability</p>
  {/* Nightsbridge embed */}
</div>
```

Obtain each guesthouse's Nightsbridge embed code from the live old site (`/accommodation-2386`) rather than inventing a widget ID. **If the embed ID cannot be recovered, render the branded frame with a link to the guesthouse's own booking page instead — do not guess an ID.**

- [ ] **Step 3: Page composition**

Hero → intro paragraph ("where you stay can elevate your experience as much as the journey itself", adapted from the client's copy) → `TierList` → the two `PartnerCard`s → `QuoteForm variant="full"` with a heading noting that KPE will match the traveller to the right stay → `CtaBand`.

- [ ] **Step 4: Verify**

Run: `npm run dev`, open `/accommodation`.
Confirm the five tiers render, both partner cards link out correctly, and each Nightsbridge frame either loads or falls back to the guesthouse's booking link. Confirm the page states no rates.

- [ ] **Step 5: Commit**

```bash
git add knp-panorama/src/app/accommodation knp-panorama/src/components/accommodation
git commit -m "feat(knp): add accommodation page with partner guesthouses"
```

---

## Task 12: Contact and standalone quote pages

**Files:**
- Create: `src/app/contact/page.tsx`, `src/app/request-a-quote/page.tsx`

**Interfaces:**
- Consumes: `QuoteForm` (Task 7), `SITE` (Task 3).
- Produces: the header CTA's destination and the finder's destination.

- [ ] **Step 1: /request-a-quote**

Reads `searchParams` and passes them down as defaults — this is the only place query-parameter pre-fill is interpreted:

```tsx
export default function RequestAQuotePage({
  searchParams,
}: { searchParams: { experience?: string; destination?: string; comfort?: string } }) {
  return (
    <main>
      {/* compact hero */}
      <section className="container-kpe py-16">
        <QuoteForm
          variant="full"
          defaultExperience={searchParams.experience}
          defaultDestination={searchParams.destination}
          defaultComfort={searchParams.comfort}
          sourcePage="/request-a-quote"
        />
      </section>
    </main>
  );
}
```

Above the form, one short paragraph setting expectations: KPE replies with a tailored quote, and pricing depends on group size, comfort tier and season. This is where the absence of published prices is explained rather than left as a gap.

- [ ] **Step 2: /contact**

Two columns: contact details left (phone as a `tel:` link, email as `mailto:`, WhatsApp button, service area "Mpumalanga Lowveld, South Africa", and the `SITE.legalName` line), `QuoteForm variant="contact"` right.

Add a Google Maps `<iframe>` centred on Hazyview with `loading="lazy"` and a descriptive `title`. **No street address is published on the old site, so do not invent one** — centre the map on the service area, not on a fabricated pin.

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Open `/request-a-quote?experience=full-day-safari-kruger-national-park&destination=kruger-national-park&comfort=premium` and confirm all three selects are pre-selected. Click the header's "Request a Quote" from three different pages and confirm each lands correctly. Submit the contact form and confirm the email arrives with the contact-variant subject.

- [ ] **Step 4: Commit**

```bash
git add knp-panorama/src/app/contact knp-panorama/src/app/request-a-quote
git commit -m "feat(knp): add contact and standalone quote pages"
```

---

## Task 13: SEO, JSON-LD, sitemap

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`
- Create: `src/components/seo/JsonLd.tsx`
- Modify: each `page.tsx` — add or complete its `metadata` export

**Interfaces:**
- Consumes: `TOURS` (Task 3), `SITE` (Task 3).
- Produces: `<JsonLd data={…} />`.

- [ ] **Step 1: LocalBusiness JSON-LD**

Emitted once from the root layout. Uses the real phone, email and Mpumalanga service area. **Must not include `aggregateRating` or `review`** — spec §7. Include `@type: 'TravelAgency'`, `name`, `legalName`, `telephone`, `email`, `areaServed`, `url`.

- [ ] **Step 2: TouristTrip JSON-LD**

Emitted from each tour page: `name`, `description`, `touristType`, `itinerary` from `highlights`, and `provider` pointing at the TravelAgency. **No `offers` block** — an `offers` node requires a price, and there is none.

- [ ] **Step 3: sitemap.ts and robots.ts**

```ts
import type { MetadataRoute } from 'next';
import { TOURS } from '@/data/tours';

const BASE = 'https://www.knp-panorama.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/safari', '/tours', '/transfers', '/accommodation', '/contact', '/request-a-quote'];
  return [
    ...staticRoutes.map((route) => ({ url: `${BASE}${route}`, lastModified: new Date() })),
    ...TOURS.map((tour) => ({ url: `${BASE}/experiences/${tour.slug}`, lastModified: new Date() })),
  ];
}
```

`robots.ts` allows everything and points at `${BASE}/sitemap.xml`.

- [ ] **Step 4: Per-page metadata**

Every page exports a `title` and a `description` written from that page's real content, working in the target phrases from spec §11 — Kruger National Park safari, Panorama Route tour, Hazyview, Nelspruit, Mpumalanga Lowveld, OR Tambo transfer, community safari. Write them as sentences a person would read, not keyword strings.

- [ ] **Step 5: 404 page**

Branded `not-found.tsx`: heading, one line of copy, and buttons to Home and Request a Quote. This is the landing point for every retired WordPress URL that isn't explicitly redirected in Task 14.

- [ ] **Step 6: Verify**

Run: `npm run build && npm start`.
Fetch `/sitemap.xml` and confirm it lists 12 URLs (7 static + 5 tours). Fetch `/robots.txt`. View source on `/` and a tour page and paste each JSON-LD block into a schema validator — confirm both are valid and that neither contains `aggregateRating`, `review` or `offers`.

- [ ] **Step 7: Commit**

```bash
git add knp-panorama/src/app/sitemap.ts knp-panorama/src/app/robots.ts knp-panorama/src/app/not-found.tsx knp-panorama/src/components/seo
git commit -m "feat(knp): add metadata, JSON-LD, sitemap and 404"
```

---

## Task 14: Redirects and the final verification sweep

**Files:**
- Modify: `next.config.mjs`
- Create: `README.md`

**Interfaces:**
- Consumes: everything.
- Produces: a deployable site.

- [ ] **Step 1: Add the redirects**

```js
const nextConfig = {
  images: { formats: ['image/webp'] },
  async redirects() {
    return [
      { source: '/safari-2367', destination: '/safari', permanent: true },
      { source: '/tours-2370', destination: '/tours', permanent: true },
      { source: '/transfers-2372', destination: '/transfers', permanent: true },
      { source: '/accommodation-2386', destination: '/accommodation', permanent: true },
      { source: '/about-us-2383', destination: '/#our-story', permanent: true },
      { source: '/contact-us-2394', destination: '/contact', permanent: true },
      { source: '/home', destination: '/', permanent: true },

      { source: '/travel/full-day-safari-kruger-national-park', destination: '/experiences/full-day-safari-kruger-national-park', permanent: true },
      { source: '/travel/half-day-safari-kruger-national-park', destination: '/experiences/half-day-safari-kruger-national-park', permanent: true },
      { source: '/travel/full-day-panorama', destination: '/experiences/full-day-panorama', permanent: true },
      { source: '/travel/half-day-panorama', destination: '/experiences/half-day-panorama', permanent: true },
      { source: '/travel/or-tambo', destination: '/experiences/or-tambo-transfer', permanent: true },

      // Retired commerce and leftover theme demo content.
      { source: '/shop', destination: '/', permanent: true },
      { source: '/cart', destination: '/', permanent: true },
      { source: '/checkout', destination: '/', permanent: true },
      { source: '/my-account', destination: '/', permanent: true },
      { source: '/find', destination: '/request-a-quote', permanent: true },
      { source: '/hotel-search', destination: '/accommodation', permanent: true },
      { source: '/wp-travel-checkout', destination: '/request-a-quote', permanent: true },
      { source: '/wp-travel-dashboard', destination: '/', permanent: true },
      { source: '/product/:slug', destination: '/', permanent: true },
      { source: '/ttbm_places/:slug', destination: '/', permanent: true },
      { source: '/ttbm_guide/:slug', destination: '/', permanent: true },
      { source: '/travel-category/:slug', destination: '/', permanent: true },
    ];
  },
};
```

- [ ] **Step 2: Run the prohibited-content sweep**

This is spec §1's second success criterion, checked mechanically.

```bash
cd knp-panorama
grep -rniE 'add[- ]?to[- ]?cart|checkout|paygate|woocommerce|aggregateRating|"offers"' src/ && echo "FAIL" || echo "PASS: no commerce references"
grep -rnE 'R\s?[0-9]{3}|ZAR|\$[0-9]|USD|EUR' src/ && echo "FAIL" || echo "PASS: no prices"
grep -rniE 'testimonial|star-?rating|reviewCount|[0-9]+\+? (years|tours|camps|guests)' src/ && echo "FAIL" || echo "PASS: no fabricated social proof"
```

Expected: three `PASS` lines. Any hit is a real failure — fix the source, do not weaken the grep. (`/contact` and `/request-a-quote` legitimately contain the word "quote"; none of these patterns match it.)

- [ ] **Step 3: Full build and test run**

```bash
npm test && npm run build
```
Expected: all tests pass; build compiles with every route except `/api/quote` marked static (`○`).

- [ ] **Step 4: Click through every page**

Run `npm start` and visit all twelve routes plus one redirect (`/safari-2367` must land on `/safari`) and one 404. On each page confirm: no price, no cart or login, no star ratings, no testimonials, images load, and nothing in the layout is horizontally scrolling on a 375px viewport.

- [ ] **Step 5: Lighthouse**

Run Lighthouse (mobile preset) on `/` and `/experiences/full-day-safari-kruger-national-park`.
Expected: Performance ≥ 90, Accessibility ≥ 95.

If Performance falls short, the cause is almost always hero image weight — re-encode at a lower quality or smaller dimensions before touching anything else. If Accessibility falls short, check colour contrast on amber-on-white text (amber `#FFAF19` on white fails WCAG AA for body-size text — it is only used for uppercase semibold labels at ≥12px, and any failure means a contrast fix, not a threshold waiver).

- [ ] **Step 6: Write the README**

Cover: what the site is, local setup, the three environment variables, how to add a tour (append to `src/data/tours.ts`, drop an image at `/public/images/tours/<slug>.webp`), how to swap client photography in place, deployment (Vercel, Root Directory `knp-panorama`, auto-deploy on push), and a short "Deliberately absent" section listing the paygate, prices, ratings and testimonials with a pointer to spec §7 — so a future developer doesn't helpfully add them back.

- [ ] **Step 7: Commit**

```bash
git add knp-panorama/next.config.mjs knp-panorama/README.md
git commit -m "feat(knp): add legacy redirects, README and final verification sweep"
```

---

## Self-Review

**Spec coverage:** §1 purpose → Tasks 1–14; success criteria → Task 14 steps 2–5 and Task 7 step 3. §2 real content → Task 3. §2 demo residue → Task 14 redirects. §3 tokens → Task 1; patterns → Tasks 4, 5, 8, 9; deviations → Tasks 9 (no stars), 5 (no payment footer), 13 (no `aggregateRating`). §4 sitemap → Tasks 8–12; redirects → Task 14. §5 homepage → Task 8. §6 data model → Task 3. §7 honesty → enforced in Tasks 8, 9, 13 and swept in Task 14. §8 quote → Tasks 6, 7, 12. §9 imagery → Task 2. §10 stack → Task 1; component boundaries → the File Structure section. §11 SEO → Task 13. §12 out of scope → no task builds any of it. §13 open items → defaults are implemented, not deferred.

**Type consistency:** `Tour`, `Pillar`, `Destination` defined in Task 3 and consumed unchanged in Tasks 9 and 10. `getTour`/`getToursByPillar` named identically in Tasks 3, 9, 10. `validateQuote`/`isBot`/`MIN_SUBMIT_MS` defined in Task 6 and consumed in Tasks 6 and 7. `QuoteForm`'s `variant`/`default*`/`sourcePage` props are declared in Task 7 and used with those exact names in Tasks 9, 10, 11 and 12.

**Known ordering note:** Task 8 composes `TourGrid`, which Task 9 creates. Build Task 9's card and grid before Task 8's final assembly step, or stub that one section in Task 8 and complete it in Task 9. Flagged rather than reordered, because the homepage is the better early visual checkpoint.
