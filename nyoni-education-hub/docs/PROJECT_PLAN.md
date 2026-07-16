# Nyoni Education Hub — Rebuild Plan

## Source material
- Live site: https://nyoniedu.co.za (WordPress/Divi) — scraped for copy, brand colors, logo
- Look & feel reference: https://educeet-reactjs.vercel.app/?storefront=envato-elements (course-marketplace template) — used for layout rhythm, card/hero patterns, stat badges — NOT for its ed-tech/marketplace content, which doesn't apply here

## Brand identity (from live-site scrape)
- Primary (teal/green): `#159B87` — carries the "environmentally friendly" identity
- Deep text/navy: `#0F3B48` — headings, footer background
- Soft accent bg: `#E6F3FB` — pale sky blue, calm section backgrounds
- Warm accent (new, not on old site): muted sand/honey `#E8A24C` — for CTAs, borrowed from the inspiration site's warm-accent-on-dark pattern, to avoid an all-teal/clinical feel and add warmth for a "relaxed environment for anxious kids" positioning
- Background: warm off-white `#FBF9F4` rather than pure white — softer, calmer
- Logo + favicon: downloaded from live site into `public/images/`
- Headings: Montserrat (per scrape). Body: Inter/Roboto (clean, calm, readable) — Montserrat is used site-wide on the live version so we'll keep one family for consistency rather than trust the scrape's imperfect body-font detection.

## Grade structure (per client direction, supersedes what's currently live)
- **School**: Grade 4 – 7
- **Tutor Centre**: Grade 8 – 12

## Core brand pillars to foreground (from brief + testimonials on live site)
1. Environmentally friendly / nature-connected learning
2. Soft skills development (collaboration, communication, resilience)
3. Calm, low-anxiety environment — explicitly good for neurodivergent/anxious/introverted kids (real testimonials confirm this)
4. Understanding over memorization — critical thinking, project-based learning
5. Small classes, individual attention

## Sitemap
- `/` — Home
- `/our-story` — Our Story (history, vision, mission, values)
- `/school` — School, Grade 4–7 (CAPS curriculum, project-based learning, no homework, limited exams)
- `/tutor-centre` — Tutor Centre, Grade 8–12 (CAPS, online provider, NSC exams)
- `/philosophy` — Teaching philosophy / progressive education approach
- `/gallery` — Photo gallery
- `/admissions` — Admissions process / enquiry
- `/contact` — Contact details + form

## Homepage sections (layout rhythm inspired by Educeet template)
1. **Hero** — rounded/soft-shape hero, tagline "Where curiosity leads and creativity thrives", dual CTA (Enquire / Book a Tour), small floating stat badges (class size, years running)
2. **Value strip** — Critical Thinking · Skills Development · Future Oriented · Child Centered · Inspire Innovation · Holistic Growth (ticker/pill row, matches live-site copy)
3. **Two-track program cards** — big visual tiles for School (Gr 4–7) and Tutor Centre (Gr 8–12), each linking to its own page
4. **Our approach** — split section: project-based learning, no rote memorization, small classes (image + copy, stat counters)
5. **Environment & wellbeing** — new section: eco-friendly campus + calm/low-anxiety environment, drawing on real testimonial language
6. **We Value** — 5-value grid (Collaboration & Communication, Kindness & Compassion, Commitment & Perseverance, Respect & Citizenship, Gratitude & Appreciation)
7. **Testimonials** — 3 real parent quotes from live site, carousel
8. **CTA banner** — "Ready to see if Nyoni is the right fit?" → Book a Tour / Contact
9. **Footer** — logo, address (Portion 25, Bellevue, New Plaston Road, White River), phone, email, social (Facebook/Instagram), page links

## Tech stack (matches other Antigravity Next.js projects, e.g. eastlake-drilling)
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- `lucide-react` for icons
- Static content (no CMS) — copy sourced from scrape + brief, marked `TODO` where real data (staff photos, gallery images, exact stats) is needed
- Resend for contact form (added when contact page is built, keys TODO)

## Workflow
Claude = architect/planner (this doc + component specs + review). DeepSeek v4 (via `ds-agent.js` / local proxy) = coder for components/pages, output reviewed and wired in by Claude.

## Known gaps / placeholders to flag to client
- No real gallery photos yet — placeholder images used, need real photos
- No staff/instructor bios or photos
- Exact stats (years running, student numbers) not published on old site — using soft/qualitative copy instead of fabricated numbers
- Contact form needs Resend API key before going live
