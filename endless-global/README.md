# Endless Global Point — Website

A Next.js 14 rebuild of the Endless Global Point marketing site (business matchmaking agency:
investment, financial, trade, and consulting services).

## Stack
- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Montserrat via `next/font` (self-hosted)
- Static prerendering; contact form posts to `/api/contact`

## Develop
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Structure
- `src/lib/content.ts` — single source of truth for all page copy.
- `src/components/` — Hero, Header/Footer, ContactForm, ServicePage, and home sections.
- `src/app/` — routes: `/`, `/about-us`, the four `*-services`, `/talk-to-us`, legal pages.
- `public/images/` — brand assets.

## To finish before launch
- Fill in real **Terms** and **POPIA Privacy Policy** copy (`src/app/terms-and-conditions`, `src/app/privacy-policy`).
- Wire the contact form to email (Resend key in `/api/contact`).
- Set the production domain in `src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, `JsonLd.tsx`.

See `REPORT.md` for the full SEO/GEO, performance, and competitor analysis.
