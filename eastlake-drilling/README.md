# East Lake Drilling

Next.js 14 rebuild of [eastlakedrilling.co.za](https://www.eastlakedrilling.co.za) — a borehole-drilling company in Randburg, Gauteng.

Modernised layout, original brand (water blue `#0089F7` / earthy brown `#8A5B20`, Poppins) and all original copy/photos.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- lucide-react (icons)
- Resend (quote-request emails)

## Pages
`/` home · `/boreholes` · `/services` · `/gallery` (lightbox) · `/faq` (accordion) · `/contact` (quote form)

## Develop
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Contact form (Resend)
The quote form posts to `/api/quote`, which emails the request via Resend.
Copy `.env.example` to `.env.local` and fill in:

```
RESEND_API_KEY=          # from resend.com
QUOTE_TO_EMAIL=info@eastlakedrilling.co.za
QUOTE_FROM_EMAIL="East Lake Drilling <onboarding@resend.dev>"   # use a verified domain in production
```

Without `RESEND_API_KEY` the form returns a 500 (the rest of the site works).

## Content
All copy lives in [`src/lib/content.ts`](src/lib/content.ts) — edit there, not in the page components.
Images are in `public/images/` (`logo.png`, `hero/`, `gallery/`).
