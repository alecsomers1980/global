# HSLabour — Jobs Integration Build Spec (authoritative)

This is the contract for the `/jobs` section of the H&S Labour Brokers website.
Every generated file MUST conform to the names, types, signatures, and conventions below.

## 0. Stack & environment (READ THIS — it is NOT older Next.js)

- **Next.js 16.2.x, App Router, React 19, TypeScript (strict), Tailwind CSS v4.**
- Import alias: `@/*` maps to the project root (e.g. `@/lib/jobs/types`, `@/components/jobs/JobCard`).
- No `src/` directory. Routes live in `app/`, libs in `lib/`, components in `components/`.

### Next.js 16 conventions you MUST follow (different from training data)
1. **`params` and `searchParams` are async** — they are `Promise`s. Always type them as
   `Promise<...>` and `await` them:
   ```ts
   export default async function Page({ params, searchParams }: {
     params: Promise<{ slug: string }>;
     searchParams: Promise<{ city?: string; category?: string; q?: string }>;
   }) {
     const { slug } = await params;
     const sp = await searchParams;
   }
   ```
   Same in `generateMetadata({ params }: { params: Promise<{ slug: string }> })`.
2. **`fetch` is NOT cached by default.** To cache + tag for revalidation, pass:
   `fetch(url, { next: { revalidate: 3600, tags: ['jobs'] } })`.
3. **Segment config** `export const revalidate = 3600` is valid on pages and still used.
4. **On-demand revalidation**: `import { revalidateTag } from 'next/cache'` then `revalidateTag('jobs')`.
5. Do NOT use the `cacheComponents`/`use cache` directive — it is not enabled in this project.
6. Server Components by default. Only add `'use client'` to files that use hooks/browser APIs
   (the embed and the filters). Keep everything else server-side.

### Styling
- Tailwind v4 utility classes inline. Keep markup clean and semantic. No component library.
- Mobile-first, responsive. Accessible: real `<h1>`, `<a>`, `alt` text, focus styles.
- Brand: professional, trustworthy recruitment feel. Primary accent `text-blue-700 / bg-blue-700`.
  Neutral grays for body. Do not invent a heavy design system — utility classes only.

## 1. The model: PlacementPartner is the system of record

HSLabour already runs the ATS (jobs, candidates, CVs, applications, pipeline) in
**PlacementPartner**. We DO NOT rebuild any of that. Our site is a fast, SEO/GEO-optimised
marketing front-end. The `/jobs` section surfaces vacancies and routes every application back
into PlacementPartner.

Two integration modes, selected by one env var, sharing the same route shell:
- **`iframe` (DEFAULT, ships now):** embed PlacementPartner's careers widget. No feed needed.
- **`feed` (preferred, later):** ingest PP's XML/JSON vacancy feed, render native SEO pages
  with `JobPosting` JSON-LD (Google for Jobs), Apply button deep-links into PP.

The current build defaults to **iframe**. The feed path must be fully implemented too, so we
flip `JOBS_SOURCE=feed` later with no route/component rewrites.

## 2. Env contract (the entire surface with PlacementPartner)

```
JOBS_SOURCE=iframe                         # "iframe" | "feed"
NEXT_PUBLIC_PP_CAREERS_URL=                # iframe mode: PP careers/embed URL
PP_FEED_URL=                               # feed mode: PP XML/JSON vacancy feed
PP_APPLY_BASE=https://hslabour.placementpartner.co.za  # base for per-vacancy apply deep-links
CRON_SECRET=                               # bearer token guarding the sync cron
```

`NEXT_PUBLIC_*` is the only client-exposed var. Never expose `PP_FEED_URL` or `CRON_SECRET`.

## 3. Files & exact contracts

### `lib/jobs/config.ts`
```ts
export type JobsSource = "iframe" | "feed";
// Reads process.env.JOBS_SOURCE, defaults to "iframe".
export const JOBS_SOURCE: JobsSource = ...;
```

### `lib/jobs/types.ts`
```ts
export type Job = {
  ref: string;            // PlacementPartner vacancy reference/ID — join key for Apply
  slug: string;           // SEO slug: `${kebab(title)}-${ref}`
  title: string;
  description: string;    // HTML (Google for Jobs expects HTML)
  city: string;
  province?: string;
  category: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY";
  salary?: { min?: number; max?: number; period?: "HOUR" | "MONTH" | "YEAR" };
  postedAt: string;       // ISO 8601
  closesAt?: string;      // ISO 8601
  applyUrl: string;       // deep-link into PlacementPartner
};
```

### `lib/utils.ts`
Small pure helpers, no deps:
- `kebab(s: string): string` — lowercase, spaces/non-alphanumerics → single hyphens, trim hyphens.
- `stripHtml(html: string): string` — remove tags, collapse whitespace. Used for meta descriptions.
- `cn(...classes: (string | false | null | undefined)[]): string` — join truthy class names.

### `lib/jobs/apply.ts`
```ts
// Per-vacancy deep link into PlacementPartner's application form.
// Exact path pattern is provisional (TBD from Parallel); keep it in ONE place.
export function applyUrl(ref: string): string {
  const base = process.env.PP_APPLY_BASE ?? "";
  return `${base}/vacancy/${encodeURIComponent(ref)}/apply`;
}
```

### `lib/jobs/feed.ts`  (feed mode)
- `import { XMLParser } from "fast-xml-parser";`
- Export `async function fetchJobs(): Promise<Job[]>`.
- Fetch `process.env.PP_FEED_URL` with `{ next: { revalidate: 3600, tags: ["jobs"] } }`.
- If `PP_FEED_URL` is unset OR fetch fails, **return `[]`** (never throw to the page — the site
  must still build/render in iframe mode where no feed exists). Log a warning to console.
- Parse XML with `fast-xml-parser` (`new XMLParser({ ignoreAttributes: false, trimValues: true })`).
- The PP feed field names are UNKNOWN. Centralise ALL mapping in one private `normalise(raw): Job | null`
  function. Be defensive: try several likely field names
  (`reference|id`, `title`, `description`, `city|location`, `province`, `category`,
  `type|employmenttype`, salary fields, `date|posted`, `expiry|closes`). Build `slug` via
  `kebab(title)` + `-` + `ref`. Build `applyUrl` via `applyUrl(ref)`. Skip records with no ref/title.
- Map employment type strings to the union; default `"TEMPORARY"` for TES/temp, else `"FULL_TIME"`.
- Export also `async function getJob(slug: string): Promise<Job | undefined>` (find in fetchJobs()).

### `components/jobs/JobPostingJsonLd.tsx`  (server component)
- Props `{ job: Job }`. Render a `<script type="application/ld+json">` with a `JobPosting`
  schema.org object built from the job. Include: `title`, `description`, `datePosted`,
  `validThrough` (only if `closesAt`), `employmentType`, `directApply: false`,
  `hiringOrganization` (name "H&S Labour Brokers", sameAs "https://hslabour.co.za"),
  `jobLocation` PostalAddress (`addressLocality: city`, `addressRegion: province`,
  `addressCountry: "ZA"`), and `baseSalary` (currency "ZAR") only if `salary` present.
  Use `JSON.stringify` via `dangerouslySetInnerHTML`. No client JS.

### `components/jobs/JobCard.tsx`  (server component)
- Props `{ job: Job }`. A linked card (`<a href={`/jobs/${job.slug}`}>`) showing title, city/province,
  category, employment type badge, and posted date (human-readable). Tailwind, hover state, accessible.

### `components/jobs/JobFilters.tsx`  (client component, `'use client'`)
- Props `{ cities: string[]; categories: string[] }`.
- Renders city + category `<select>`s and a search text input. On change, update the URL query
  params (`city`, `category`, `q`) using `useRouter`/`usePathname`/`useSearchParams` from
  `next/navigation` (push with new search string). Server page reads params and filters.
  Keep it simple — no client-side list rendering; it only drives the URL.

### `components/jobs/PlacementPartnerEmbed.tsx`  (client component, `'use client'`)
- No props. Renders a responsive `<iframe src={process.env.NEXT_PUBLIC_PP_CAREERS_URL}>`,
  `title="Current Vacancies"`, `loading="lazy"`, full width, sensible min-height (e.g. 1200px),
  `border: 0`. Add a `message` event listener (in `useEffect`) that, if the message origin
  includes `"placementpartner"` and `event.data.height` is a number, sets the iframe height
  (auto-resize; harmless if PP never posts). Clean up the listener on unmount. If
  `NEXT_PUBLIC_PP_CAREERS_URL` is missing, render a friendly fallback `<p>` with a link placeholder.

### `app/(marketing)/jobs/page.tsx`  (server component)
- `export const revalidate = 3600;`
- Branch on `JOBS_SOURCE`:
  - **iframe:** render `<h1>Current Vacancies</h1>`, a paragraph of REAL indexable intro copy
    (H&S places permanent, contract & TES candidates across Johannesburg, Cape Town, Durban,
    Pretoria and Gqeberha — mention services/cities for SEO/GEO), then `<PlacementPartnerEmbed />`,
    then a `<noscript>` link to `NEXT_PUBLIC_PP_CAREERS_URL`.
  - **feed:** `await fetchJobs()`, derive unique sorted `cities` and `categories`, read
    `await searchParams`, filter jobs by `city`/`category`/`q` (case-insensitive title/description
    contains), render `<h1>`, intro copy, `<JobFilters cities=... categories=... />`, and a grid
    of `<JobCard />`. Empty state if no matches.
- `export const metadata` (or generateMetadata) with title
  "Job Vacancies — H&S Labour Brokers South Africa" and a descriptive meta description.
- Types: `searchParams: Promise<{ city?: string; category?: string; q?: string }>`.

### `app/(marketing)/jobs/[slug]/page.tsx`  (server component, feed mode only)
- `export const revalidate = 3600;`
- `export async function generateStaticParams()` → `(await fetchJobs()).map(j => ({ slug: j.slug }))`.
  (When the feed is empty this yields `[]`, which is fine.)
- `export async function generateMetadata({ params })` — `params: Promise<{ slug: string }>`;
  await it, look up the job, return title `${job.title} — ${job.city} | H&S Labour` and a
  `stripHtml(description)` meta description (~155 chars). If not found, return `{}`.
- Default export: await params, `getJob(slug)`; if missing call `notFound()` from `next/navigation`.
  Render `<JobPostingJsonLd job={job} />`, `<h1>`, location/category line, the description via
  `dangerouslySetInnerHTML`, and an Apply `<a href={job.applyUrl} rel="nofollow">Apply on
  PlacementPartner</a>` styled as a primary button. Add a back link to `/jobs`.

### `app/api/cron/sync-jobs/route.ts`  (route handler)
NOTE: In Next.js 16 `revalidateTag(tag)` now requires a second `profile` arg and is tied to the
`use cache` system, which we do NOT use. Use `revalidatePath` instead — stable single-arg form.
Pages already use time-based ISR (`revalidate = 3600`), so this cron just force-refreshes `/jobs`.
```ts
import { revalidatePath } from "next/cache";
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response("Unauthorized", { status: 401 });
  revalidatePath("/jobs");
  return Response.json({ revalidated: true, at: Date.now() });
}
```

### `app/(marketing)/layout.tsx`  (server component)
- A minimal shared marketing shell: a header with the H&S Labour wordmark linking to `/`, a nav
  (`Home`, `Services`, `Jobs`, `Employers`, `About`, `Contact` — plain `<a>` links; routes may not
  all exist yet, that's fine), `{children}` in a `<main className="...">` container, and a simple
  footer (company name, © year, accreditation note). Tailwind only. No client JS.

### `.env.example`
- List every var from section 2 with placeholder values and a one-line comment each.

### `vercel.json` (project root)
- A single hourly cron calling `/api/cron/sync-jobs`:
  `{ "crons": [{ "path": "/api/cron/sync-jobs", "schedule": "0 * * * *" }] }`.

## 4. Hard rules
- Type-safe, no `any` except the raw parsed feed record (type it `any` or `unknown` and narrow).
- No TODO stubs that break the build. The site MUST `next build` cleanly in **iframe** mode with
  no env vars set (feed code paths return `[]`, generateStaticParams returns `[]`).
- Do not add libraries beyond `fast-xml-parser` (already installed).
- Match the exact export names and signatures above — other files import them.

---

# PART 2 — Marketing site (home, services, programmatic city×service SEO pages)

All Next.js 16 conventions and styling rules from Part 1 apply unchanged (async params, server
components by default, Tailwind v4, accent `blue-700`, accessible semantic markup).

## 5. Data layer (single source of truth)

### `lib/site/company.ts`
```ts
export const company = {
  name: "H&S Labour Brokers",
  legalName: "H&S Labour Brokers cc",
  foundedYear: 1998,
  email: "info@hslabour.co.za",
  url: "https://hslabour.co.za",
  // Only claims we can support from their existing site:
  accreditations: ["Registered with the Department of Employment and Labour"],
  areasServed: ["South Africa"],
} as const;
```

### `lib/site/services.ts`
A `Service` type and a `services: Service[]` array (the 6 services below). One source feeds both
`/services/[service]` (via `slug`) and `/[city]/[service]` (via `locationSlug`).
```ts
export type Service = {
  slug: string;            // used in /services/[slug]
  locationSlug: string;    // used in /[city]/[locationSlug] — keyword-rich
  name: string;            // e.g. "Permanent & Contract Recruitment"
  locationName: string;    // e.g. "Recruitment Agency" (reads well as "{locationName} in {City}")
  tagline: string;         // one sentence
  challenge: string;       // 1–2 sentences: the employer's problem
  solution: string;        // 2–3 sentences: how H&S solves it
  description: string;     // 1–2 paragraphs, SEO body copy
  keywords: string[];      // 4–6 SA search phrases
  faqs: { q: string; a: string }[]; // 3–4 each, accurate & useful
};
export const services: Service[];
export function getService(slug: string): Service | undefined;
export function getServiceByLocationSlug(locationSlug: string): Service | undefined;
```
The 6 services (write accurate, SA-specific copy — do NOT invent facts/figures beyond these):
1. `slug: recruitment`, `locationSlug: recruitment-agency`, name "Permanent & Contract Recruitment",
   locationName "Recruitment Agency". Sourcing, screening and placing skilled candidates across
   sectors; 25+ years' experience; guaranteed replacement period if a placement doesn't work out.
2. `slug: tes`, `locationSlug: tes-provider`, name "Temporary Employment Services (TES)",
   locationName "TES Provider". Supply of temporary/contract workforce (labour broking); H&S
   handles payroll, statutory compliance and IR for placed staff. Mention LRA s198A deeming
   (worker deemed the client's employee after 3 months if under the BCEA earnings threshold) and
   joint-and-several liability — frame H&S as managing this compliance burden for clients.
3. `slug: payroll`, `locationSlug: payroll-services`, name "Payroll & Timesheets",
   locationName "Payroll Services". Payroll administration, timesheet capture, statutory
   deductions (PAYE, UIF, SDL), payslips and reporting.
4. `slug: vetting`, `locationSlug: vetting-services`, name "Vetting & Risk Screening",
   locationName "Vetting & Background Screening". Pre-employment screening: criminal & credit
   checks, qualification verification, psychometric & skills assessments, fraud detection.
5. `slug: hr-ir`, `locationSlug: hr-ir-management`, name "HR & IR Management",
   locationName "HR & IR Management". Employment contracts, policies, disciplinary processes,
   CCMA representation and ongoing labour-law compliance.
6. `slug: cv-response`, `locationSlug: cv-response-handling`, name "CV Response Handling",
   locationName "CV Response Handling". Advertise, receive, screen and shortlist applications so
   employers only review pre-qualified candidates.

### `lib/site/cities.ts`
```ts
export type City = { slug: string; name: string; province: string; blurb: string };
export const cities: City[];           // the 6 below
export function getCity(slug: string): City | undefined;
```
Cities: johannesburg (Gauteng), pretoria (Gauteng), cape-town (Cape Town, Western Cape),
durban (KwaZulu-Natal), gqeberha (Gqeberha, Eastern Cape), bloemfontein (Free State).
`blurb`: one sentence on H&S serving employers in that city/region (no invented addresses).

## 6. Reusable SEO JSON-LD components (`components/seo/`, server components)

- `LocalBusinessJsonLd.tsx` — props `{ city?: string; service?: string }`. Emits an
  `EmploymentAgency` (subtype of LocalBusiness) schema using `company` (name, url, email),
  `areaServed` (the city if given, else "South Africa"). `<script type="application/ld+json">`.
- `ServiceJsonLd.tsx` — props `{ name: string; description: string; city?: string }`. Emits a
  `Service` schema with `provider` = the company Organization and `areaServed`.
- `FaqJsonLd.tsx` — props `{ faqs: { q: string; a: string }[] }`. Emits a `FAQPage` schema.

## 7. Marketing pages

### `app/(marketing)/page.tsx` — Home (server component)
- `export const metadata`: title "H&S Labour Brokers — Recruitment, TES & Payroll in South Africa",
  a compelling meta description.
- Sections: (1) Hero with the dual value prop and TWO CTAs — "Hire Staff" → `/employers`,
  "Find a Job" → `/jobs`. (2) Trust strip: "Since 1998 · 25+ years", "Registered with the
  Department of Employment and Labour", "Guaranteed replacement period". (3) Services grid: map
  `services` → cards linking to `/services/{slug}` (name + tagline). (4) "Why H&S" points.
  (5) Locations: links to `/{city}/labour-broker`… use `recruitment-agency` locationSlug actually —
  link each city to `/{city.slug}/recruitment-agency` for internal linking/SEO. (6) Final CTA band.
- Include `<LocalBusinessJsonLd />`.
- This replaces the default home; the old `app/page.tsx` will be removed.

### `app/(marketing)/services/page.tsx` — Services hub (server component)
- metadata. Intro paragraph. Grid of all `services` → cards linking to `/services/{slug}`
  (name, tagline, short challenge). Include a CTA to `/employers`.

### `app/(marketing)/services/[service]/page.tsx` — Service detail (server component)
- `export const dynamicParams = false;`
- `export const revalidate = 3600;`
- `generateStaticParams()` → `services.map(s => ({ service: s.slug }))`.
- `generateMetadata({ params })` (params is `Promise<{ service: string }>`): await, `getService`,
  title `${service.name} | H&S Labour Brokers`, description from tagline/description. `{}` if missing.
- Body: await params, `getService(slug)`, `notFound()` if missing. Render H1 = name, tagline,
  challenge→solution, description, an FAQ `<section>` (render `service.faqs`), and an internal-link
  block "Available in:" linking `/{city.slug}/{service.locationSlug}` for each city. CTA to
  `/employers`. Include `<ServiceJsonLd name=... description=... />` and `<FaqJsonLd faqs=... />`.

### `app/(marketing)/[city]/[service]/page.tsx` — Programmatic city×service (server component)
- `export const dynamicParams = false;`  ← only predefined combos are valid; everything else 404s.
- `export const revalidate = 3600;`
- `generateStaticParams()` → cities × services: `cities.flatMap(c => services.map(s => ({
  city: c.slug, service: s.locationSlug })))` (= 36 pages).
- `generateMetadata({ params })` (params `Promise<{ city: string; service: string }>`): await,
  `getCity` + `getServiceByLocationSlug`; title `${service.locationName} in ${city.name} |
  H&S Labour Brokers`, a localised meta description. `{}` if either missing.
- Body: await params, look up both; `notFound()` if either missing. Render:
  H1 `${service.locationName} in ${city.name}`, a localised intro (uses city.name + province +
  service.solution), the service description, the FAQ section, an internal-link block linking the
  OTHER services in the SAME city (`/{city.slug}/{otherService.locationSlug}`) and the SAME service
  in OTHER cities (`/{otherCity.slug}/{service.locationSlug}`), and CTAs ("Hire Staff" → `/employers`,
  "View Jobs" → `/jobs`). Include `<LocalBusinessJsonLd city={city.name} service={service.locationName} />`,
  `<ServiceJsonLd name={service.name} description=... city={city.name} />`, `<FaqJsonLd faqs={service.faqs} />`.
- NOTE: `[city]/[service]` sits beside static routes (`services`, `jobs`, etc.). Static segments win,
  so this only catches city slugs. Keep city slugs distinct from any static route name.

## 8. Part 2 hard rules
- Reuse `services`, `cities`, `company` everywhere — never hardcode the lists in pages.
- All copy must be accurate to a SA labour broker; no invented addresses, phone numbers, client
  names, or statistics beyond what this spec states.
- `next build` MUST stay clean. The 36 city×service pages + 6 service pages prerender as static.

---

# PART 3 — Remaining pages, lead capture & SEO routes

Same Next.js 16 conventions and styling as before. Reuse `services`, `cities`, `company`.

## 9. Lead capture (the employer conversion path)

### `app/api/contact/route.ts` (route handler)
- `export async function POST(req: Request)`. Parse JSON body
  `{ name, company?, email, phone?, service?, message }`. Minimal validation: `name`, `email`,
  `message` required and `email` contains "@" — else `return Response.json({ ok:false, error },
  { status: 400 })`. On success: `console.log("[lead]", ...)` the submission and
  `return Response.json({ ok: true })`. Add a `// TODO: wire email (Resend) — currently logs only`.
  No external calls, no new deps.

### `components/forms/ContactForm.tsx` (client component, `'use client'`)
- Optional prop `{ heading?: string }`. Fields: name, company, email, phone, a `service` `<select>`
  populated from `services` (value = `slug`, label = `name`; plus a "General enquiry" default), and
  a message `<textarea>`. Manage state with `useState`; on submit `POST` JSON to `/api/contact`,
  show a submitting state, then a success message ("Thanks — we'll be in touch") or an error.
  Accessible labels, required attributes, Tailwind, accent `blue-700`.

## 10. Pages

### `app/(marketing)/employers/page.tsx` (server component) — the "Hire Staff" landing
- metadata: title "Hire Staff — Labour Broking, TES & Recruitment", strong description.
- Sections: hero ("Your partner in recruitment" — value prop for employers); a "What we handle"
  grid mapping `services` → cards linking `/services/{slug}`; a simple 3–4 step "How it works"
  (Brief → Source & screen → Place → Guarantee/replace); the replacement-guarantee + compliance
  reassurance (TES s198A / joint-liability handled for you); then `<ContactForm heading="Request staff" />`.

### `app/(marketing)/about/page.tsx` (server component)
- metadata. Company story (H&S Labour Brokers, operating since 1998, 25+ years), what they do,
  `company.accreditations` (Registered with the Department of Employment and Labour), areas served
  (list `cities`), why choose H&S. CTA buttons to `/employers` and `/jobs`. No invented facts.

### `app/(marketing)/contact/page.tsx` (server component)
- metadata. Show contact details from `company` (email `info@hslabour.co.za`, link `mailto:`),
  a line that H&S serves employers across the `cities`, and `<ContactForm heading="Get in touch" />`.
  Include `<LocalBusinessJsonLd />`.

## 11. SEO routes (project `app/` root, NOT inside the route group)

### `app/sitemap.ts`
- `import type { MetadataRoute } from "next";` default export `function sitemap():
  MetadataRoute.Sitemap`. Base URL `https://hslabour.co.za`. Include: `/`, `/services`, `/jobs`,
  `/employers`, `/about`, `/contact`; every `/services/{service.slug}`; every
  `/{city.slug}/{service.locationSlug}` (36). Sensible `changeFrequency`/`priority`. Derive from
  `services` and `cities` — do not hardcode.

### `app/robots.ts`
- `import type { MetadataRoute } from "next";` default export `function robots():
  MetadataRoute.Robots`. Allow all user agents, `sitemap: "https://hslabour.co.za/sitemap.xml"`,
  `host: "https://hslabour.co.za"`.

## 12. Part 3 hard rules
- `next build` MUST stay clean. ContactForm is the only new client component.
- Default-export all JSON-LD/components consistently (pages import them as default).
- No new dependencies.

---

# PART 4 — Premium home redesign: glassmorphism Hero + 3-card Features

Goal: a clean, minimalist, spacious, high-contrast layout with smooth hover transitions and subtle
micro-interactions, fully mobile-first. Stack: Next.js 16 server components, Tailwind v4, **lucide-react**
(installed). All components below are **server components** (no hooks) and **default-export**. Use the
`cn` helper from `@/lib/utils` and the `Container` component from `@/components/site/Container`.

### Design tokens (use these exact Tailwind palettes)
- Hero surface: deep gradient `bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950`, text white.
- Brand accent: `blue-600`→`indigo-600` gradients; light accent text `from-blue-300 to-cyan-200`.
- Light sections: `bg-white` / `bg-slate-50`, headings `text-slate-900`, body `text-slate-600`.
- Radii generous (`rounded-2xl`/`rounded-3xl`), shadows soft (`shadow-xl`/`shadow-2xl`).
- Transitions: `transition-all duration-300 ease-out`. Respect existing `.animate-fade-up` /
  `.animate-float` utilities (already in globals.css). Stagger entrances with arbitrary
  `[animation-delay:120ms]` etc.

### `components/site/Hero.tsx` (server component) — glassmorphism hero
- Full-bleed section flush under the header. Break out of the page container with:
  `className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950"`.
- **Decorative blobs** (absolute, `aria-hidden`, pointer-events-none): 2–3 `rounded-full blur-3xl`
  divs with brand hues at low opacity (e.g. `bg-blue-500/30`, `bg-indigo-500/25`, `bg-cyan-400/20`),
  positioned off-edges, each with `animate-float` and different arbitrary `[animation-delay:...]`.
- Inner content in a `<Container>`, vertical padding `py-24 sm:py-32 lg:py-40`, centered (`text-center`,
  `max-w-3xl mx-auto`), all wrapped in a **glass panel**:
  `rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl px-6 py-12 sm:px-12 sm:py-16`
  with class `animate-fade-up`.
- Inside the glass panel, in order:
  1. **Eyebrow pill**: inline-flex, `gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5
     text-sm text-white/80 backdrop-blur`, a lucide `ShieldCheck` icon (`h-4 w-4`), text
     "Registered • Since 1998 • 25+ years".
  2. **H1**: `mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl text-balance`.
     Copy: "Your partner in **recruitment & workforce solutions**." Wrap the bold phrase in a
     `<span className="bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">`.
  3. **Subtext**: `mt-6 text-lg text-white/70 sm:text-xl max-w-2xl mx-auto text-pretty`. Copy: permanent
     & contract recruitment, TES, payroll, vetting and HR — compliant, guaranteed, nationwide.
  4. **CTAs**: `mt-10 flex flex-col sm:flex-row gap-4 justify-center`.
     - Primary → `/employers`: `group inline-flex items-center justify-center gap-2 rounded-full bg-white
       px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-300
       hover:bg-blue-50 hover:shadow-xl hover:-translate-y-0.5`, label "Hire Staff", lucide `ArrowRight`
       (`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1`).
     - Secondary → `/jobs`: glass button `... rounded-full border border-white/30 bg-white/5 px-7 py-3.5
       text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white/10
       hover:-translate-y-0.5`, label "Find a Job", lucide `Search` (`h-4 w-4`).
  5. **Trust row**: `mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/60`,
     three items each `inline-flex items-center gap-2` with lucide icons `ShieldCheck`
     ("Dept. of Employment & Labour"), `Award` ("25+ years' experience"), `RefreshCw`
     ("Guaranteed replacement").
- Use `next/link` for the CTAs. Accessible, semantic `<section>`, single `<h1>`.

### `components/site/FeatureCard.tsx` (server component)
- Props: `{ icon: LucideIcon; title: string; description: string; href?: string }`
  (`import type { LucideIcon } from "lucide-react"`).
- Render a `group` card: `relative flex flex-col rounded-2xl border border-slate-200 bg-white p-8
  transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl`.
- Icon tile: `inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-600
  to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110`,
  render `<Icon className="h-6 w-6" aria-hidden />`.
- Title: `mt-5 text-lg font-semibold text-slate-900`. Description: `mt-2 text-sm leading-relaxed
  text-slate-600`. If `href`, a "Learn more" link `mt-4 inline-flex items-center gap-1 text-sm
  font-medium text-blue-700` with `ArrowRight` (`h-4 w-4 transition-transform group-hover:translate-x-1`),
  and make the whole card clickable via an absolute-inset stretched link (`<Link href> <span
  className="absolute inset-0" /></Link>`) for a clean tap target.

### `components/site/Features.tsx` (server component) — 3-card grid
- Holds the feature data (3 items, lucide icons): 
  1. `UserCheck` — "Specialist Recruitment" — "Permanent & contract placements across sectors, backed
     by a guaranteed replacement period." href `/services/recruitment`.
  2. `ShieldCheck` — "Compliant TES & Payroll" — "We carry the labour-broking compliance load —
     s198A, payroll, UIF/PAYE and IR — so you don't have to." href `/services/tes`.
  3. `FileSearch` — "Vetting & Screening" — "Criminal, credit, qualification and psychometric checks
     before anyone joins your team." href `/services/vetting`.
- Section: `bg-white py-20 sm:py-28`, content in `<Container>`. Header block centered (`max-w-2xl
  mx-auto text-center`): eyebrow `text-sm font-semibold uppercase tracking-wider text-blue-700`
  ("Why H&S"), H2 `mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance`
  ("Built to hire faster — and stay compliant"), supporting `mt-4 text-lg text-slate-600`.
- Grid: `mt-14 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3`, map data → `<FeatureCard />`.

### `app/(marketing)/page.tsx` — rewrite to use the new components
- Keep `export const metadata` (same intent as before).
- Render in order: `<Hero />`, `<Features />`, then a concise **services overview** band and a final
  **CTA** band — both wrapped in `<Container>` and visually consistent (light, spacious). The services
  overview maps `services` → cards linking `/services/{slug}` (reuse from before). Keep
  `<LocalBusinessJsonLd />`. Remove the old hand-rolled hero markup. Do NOT wrap anything in an extra
  max-width that fights `Hero`'s full-bleed; `Hero` breaks out on its own, the rest uses `Container`.

### Part 4 hard rules
- `next build` stays clean; all four are server components (no `'use client'`).
- Icons come only from `lucide-react`. Default-export every component.
- Mobile-first: every size/spacing has a base value then `sm:`/`lg:` step-ups. No fixed pixel widths.
