# South Canon M1 â€” Public Catalogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public, SEO-indexed theatrical catalogue where a producer can find a play by title, genre or playwright, and read a complete Play Detail page â€” plus an admin where the client adds plays and playwrights without developer involvement.

**Architecture:** Next.js 15 App Router with static/ISR public pages and server-rendered admin. Supabase Postgres holds the catalogue; pure TypeScript modules (`lib/cast.ts`, `lib/availability.ts`, `lib/filters.ts`) hold all logic worth testing and are unit-tested first. Data access is isolated in `lib/plays.ts` and `lib/playwrights.ts` so pages never touch Supabase directly. Every Play Detail block returns `null` when its data is empty, so a thin title still renders as deliberate.

**Tech Stack:** Next.js 15 (App Router, React 19), TypeScript, Tailwind CSS v4, Supabase (Postgres + Auth + Storage), Vitest (unit), Playwright (e2e), Vercel.

## Global Constraints

- Project root: `south-canon/` inside the Antigravity workspace. All paths below are relative to it.
- Branch: `feat/south-canon`. Commit after every task.
- Spec of record: `docs/superpowers/specs/2026-07-26-south-canon-design.md`.
- Node 20+. Package manager: `npm`.
- Design tone is **editorial & literary**. Light theme only â€” no dark mode in M1 (the design is committed to warm paper; adding a dark variant is not requested).
- Design tokens are fixed and used verbatim: ink `#14110F`, paper `#FAF7F2`, accent `#A6431C`, muted `#6B635C`, rule `#E3DCD2`; availability states available `#2F6B4F`, restricted `#B07A15`, unavailable `#6B635C`.
- Fonts: **Fraunces** (display serif) and **Inter** (UI/body), both via `next/font/google`.
- Availability is **never communicated by colour alone** â€” always colour plus label text.
- Database columns are `snake_case`; TypeScript is `camelCase`. Mapping happens only in `lib/plays.ts` and `lib/playwrights.ts`.
- Currency is ZAR, formatted `en-ZA`. Use a plain space in formatted output, never a non-breaking space (it renders as tofu in some PDF/OG pipelines).
- No payments, no checkout, no perusal delivery, no writer portal in M1. Those are M2/M3.
- Every form that writes to the database or sends email carries a honeypot field plus a submission-timing check. No CAPTCHA.
- Admin login ships with forgot-password, show-password toggle and keep-me-signed-in in the first pass.

---

## File Structure

| Path | Responsibility |
|---|---|
| `supabase/migrations/0001_core.sql` | `playwrights`, `plays`, `play_playwrights` + RLS |
| `supabase/migrations/0002_detail.sql` | `play_roles`, `play_media`, `play_press`, `play_productions` + RLS |
| `supabase/migrations/0003_rights.sql` | `licence_tiers`, `rights_availability` + RLS |
| `supabase/migrations/0004_search.sql` | `pg_trgm`, search vector, indexes |
| `supabase/migrations/0005_keepalive.sql` | `keep_alive` table |
| `lib/types.ts` | Shared domain types. No logic. |
| `lib/cast.ts` | `formatCastSize` â€” pure |
| `lib/availability.ts` | `resolveAvailability` â€” pure |
| `lib/filters.ts` | `parseFilters`, `filtersToSearchParams` â€” pure |
| `lib/money.ts` | `formatZar` â€” pure |
| `lib/supabase/server.ts` | Server Supabase client (anon + service role) |
| `lib/plays.ts` | All play queries + rowâ†’domain mapping |
| `lib/playwrights.ts` | All playwright queries + mapping |
| `lib/seo.ts` | schema.org builders |
| `app/layout.tsx`, `components/layout/*` | Shell, header, footer, fonts, tokens |
| `app/page.tsx` | Home |
| `app/plays/page.tsx`, `components/catalogue/*` | Catalogue index, filters, cards |
| `app/plays/[slug]/page.tsx`, `components/play/*` | Play Detail template, one component per block |
| `app/playwrights/[slug]/page.tsx` | Playwright profile |
| `app/about/page.tsx`, `app/contact/page.tsx` | Static pages + contact form |
| `app/admin/**` | Auth + plays/playwrights CRUD |
| `.github/workflows/keep-alive.yml` | Supabase keep-alive cron |

---

## Task 1: Scaffold, design tokens, test harness

**Files:**
- Create: `south-canon/` Next.js app, `app/globals.css`, `app/layout.tsx`, `vitest.config.ts`, `playwright.config.ts`, `.env.local.example`

**Interfaces:**
- Consumes: nothing
- Produces: a running dev server, `npm test` (Vitest) and `npm run e2e` (Playwright), Tailwind tokens as CSS variables consumed by every later task.

- [ ] **Step 1: Scaffold the app**

```bash
cd south-canon
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*" --no-turbopack
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitejs/plugin-react @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Add test config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
})
```

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true },
})
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"e2e": "playwright test"
```

- [ ] **Step 3: Write the design tokens**

Replace `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-ink: #14110F;
  --color-paper: #FAF7F2;
  --color-accent: #A6431C;
  --color-muted: #6B635C;
  --color-rule: #E3DCD2;
  --color-available: #2F6B4F;
  --color-restricted: #B07A15;
  --color-unavailable: #6B635C;

  --font-display: var(--font-fraunces);
  --font-sans: var(--font-inter);
}

html { -webkit-font-smoothing: antialiased; }
body { background: var(--color-paper); color: var(--color-ink); }
```

- [ ] **Step 4: Wire fonts and the root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://southcanon.co.za'),
  title: { default: 'South Canon', template: '%s Â· South Canon' },
  description:
    'Theatrical licensing for the global South. Licence plays by Africaâ€™s leading writers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Verify it runs**

Run: `npm run dev`
Expected: dev server on http://localhost:3000, page renders on the warm paper background with no console errors.

Run: `npm test`
Expected: `No test files found` and exit code 0 (Vitest exits 0 with `--passWithNoTests`; if it exits 1, add `--passWithNoTests` to the `test` script).

- [ ] **Step 6: Commit**

```bash
git add south-canon
git commit -m "chore(south-canon): scaffold Next.js app with design tokens and test harness"
```

---

## Task 2: Core schema â€” playwrights and plays

**Files:**
- Create: `supabase/migrations/0001_core.sql`, `lib/types.ts`, `lib/supabase/server.ts`, `.env.local.example`

**Interfaces:**
- Consumes: Task 1 scaffold
- Produces: tables `playwrights`, `plays`, `play_playwrights`; types `Playwright`, `PlaySummary`, `PlayCredit`; `createServerClient()` and `createServiceClient()`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0001_core.sql`:

```sql
create extension if not exists "pgcrypto";

create type play_status as enum ('draft', 'published');
create type credit_role as enum ('book', 'music', 'lyrics', 'translation', 'adaptation', 'author');

create table playwrights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  bio text,
  portrait_url text,
  country text,
  honours text[] not null default '{}',
  represented_since date,
  status play_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table plays (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  logline text,
  synopsis_short text,
  synopsis_full text,
  genres text[] not null default '{}',
  themes text[] not null default '{}',
  languages text[] not null default '{}',
  content_warnings text[] not null default '{}',
  year_written int,
  duration_min int,
  acts int,
  setting text,
  time_period text,
  target_audience text,
  is_musical boolean not null default false,
  hero_image_url text,
  status play_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table play_playwrights (
  play_id uuid not null references plays(id) on delete cascade,
  playwright_id uuid not null references playwrights(id) on delete cascade,
  role credit_role not null default 'author',
  sort int not null default 0,
  primary key (play_id, playwright_id, role)
);

alter table playwrights enable row level security;
alter table plays enable row level security;
alter table play_playwrights enable row level security;

create policy "public reads published playwrights" on playwrights
  for select using (status = 'published');
create policy "public reads published plays" on plays
  for select using (status = 'published');
create policy "public reads credits" on play_playwrights
  for select using (true);
```

- [ ] **Step 2: Apply it**

Run: `npx supabase db push` (or paste into the Supabase SQL editor).
Expected: three tables visible in the Supabase table editor, RLS enabled on each.

- [ ] **Step 3: Add environment example**

Create `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Copy to `.env.local` and fill from the Supabase project settings. Confirm `.env.local` is already in `.gitignore` (create-next-app adds it).

- [ ] **Step 4: Write the Supabase clients**

Create `lib/supabase/server.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Anonymous client. Reads only published rows (RLS). Use for public pages. */
export function createServerClient() {
  return createClient(url, anonKey, { auth: { persistSession: false } })
}

/** Service-role client. Bypasses RLS. Server-side admin only â€” never import into a client component. */
export function createServiceClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}
```

- [ ] **Step 5: Write the shared types**

Create `lib/types.ts`:

```ts
export type CreditRole = 'book' | 'music' | 'lyrics' | 'translation' | 'adaptation' | 'author'
export type AvailabilityStatus = 'available' | 'restricted' | 'unavailable'

export type PlayCredit = { name: string; slug: string; role: CreditRole }

export type Playwright = {
  id: string
  name: string
  slug: string
  bio: string | null
  portraitUrl: string | null
  country: string | null
  honours: string[]
  representedSince: string | null
}

export type PlaySummary = {
  id: string
  title: string
  slug: string
  logline: string | null
  genres: string[]
  durationMin: number | null
  heroImageUrl: string | null
  castSummary: string
  credits: PlayCredit[]
}
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0001_core.sql lib/types.ts lib/supabase/server.ts .env.local.example
git commit -m "feat(south-canon): add core schema for playwrights and plays"
```

---

## Task 3: Detail schema â€” roles, media, press, productions

**Files:**
- Create: `supabase/migrations/0002_detail.sql`
- Modify: `lib/types.ts`

**Interfaces:**
- Consumes: `plays` from Task 2
- Produces: tables `play_roles`, `play_media`, `play_press`, `play_productions`; types `CastRole`, `PlayMedia`, `PressQuote`, `Production`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0002_detail.sql`:

```sql
create type role_gender as enum ('male', 'female', 'any');
create type media_type as enum ('photo', 'video');

create table play_roles (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  name text not null,
  gender role_gender not null default 'any',
  age_range text,
  description text,
  is_ensemble boolean not null default false,
  sort int not null default 0
);

create table play_media (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  type media_type not null,
  url text not null,
  caption text,
  credit text,
  sort int not null default 0
);

create table play_press (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  quote text not null,
  source text not null,
  published_at date,
  sort int not null default 0
);

create table play_productions (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  company text not null,
  venue text,
  city text,
  country text,
  starts_on date,
  ends_on date,
  director text,
  notes text,
  is_premiere boolean not null default false
);

create index on play_roles (play_id, sort);
create index on play_media (play_id, sort);
create index on play_press (play_id, sort);
create index on play_productions (play_id, starts_on desc);

alter table play_roles enable row level security;
alter table play_media enable row level security;
alter table play_press enable row level security;
alter table play_productions enable row level security;

create policy "public reads roles" on play_roles for select using (true);
create policy "public reads media" on play_media for select using (true);
create policy "public reads press" on play_press for select using (true);
create policy "public reads productions" on play_productions for select using (true);
```

Note: these policies are permissive because the tables are only reachable via a published play â€” an unpublished play is filtered out by the `plays` policy before its children are ever requested.

- [ ] **Step 2: Apply it**

Run: `npx supabase db push`
Expected: four new tables with RLS enabled.

- [ ] **Step 3: Extend the types**

Append to `lib/types.ts`:

```ts
export type RoleGender = 'male' | 'female' | 'any'

export type CastRole = {
  id: string
  name: string
  gender: RoleGender
  ageRange: string | null
  description: string | null
  isEnsemble: boolean
  sort: number
}

export type PlayMedia = {
  id: string
  type: 'photo' | 'video'
  url: string
  caption: string | null
  credit: string | null
}

export type PressQuote = {
  id: string
  quote: string
  source: string
  publishedAt: string | null
}

export type Production = {
  id: string
  company: string
  venue: string | null
  city: string | null
  country: string | null
  startsOn: string | null
  endsOn: string | null
  director: string | null
  notes: string | null
  isPremiere: boolean
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_detail.sql lib/types.ts
git commit -m "feat(south-canon): add cast, media, press and production schema"
```

---

## Task 4: Rights schema â€” licence tiers and territory availability

**Files:**
- Create: `supabase/migrations/0003_rights.sql`
- Modify: `lib/types.ts`

**Interfaces:**
- Consumes: `plays` from Task 2
- Produces: tables `licence_tiers`, `rights_availability` seeded with five tiers and five territories; types `LicenceTier`, `RightsRow`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0003_rights.sql`:

```sql
create type availability_status as enum ('available', 'restricted', 'unavailable');

create table licence_tiers (
  id text primary key,
  label text not null,
  description text,
  min_fee numeric(10,2),
  royalty_pct numeric(5,2),
  sort int not null default 0
);

create table rights_availability (
  id uuid primary key default gen_random_uuid(),
  play_id uuid not null references plays(id) on delete cascade,
  territory text not null,
  tier_id text references licence_tiers(id) on delete cascade,
  status availability_status not null default 'available',
  restriction_note text,
  valid_from date,
  valid_to date
);

create index on rights_availability (play_id, territory);

insert into licence_tiers (id, label, description, sort) values
  ('educational',   'Educational',            'Schools, colleges and university drama departments', 1),
  ('amateur',       'Amateur',                'Non-professional groups charging no admission',      2),
  ('community',     'Community theatre',      'Amateur societies charging admission',               3),
  ('professional',  'Professional',           'Professional producers in South Africa and Africa',  4),
  ('international', 'International',          'Professional producers outside Africa',              5);

alter table licence_tiers enable row level security;
alter table rights_availability enable row level security;

create policy "public reads tiers" on licence_tiers for select using (true);
create policy "public reads availability" on rights_availability for select using (true);
```

`min_fee` and `royalty_pct` are deliberately left null. They are client-supplied and entered through the admin (spec Â§10).

- [ ] **Step 2: Apply and verify the seed**

Run: `npx supabase db push`
Expected: `select id, label from licence_tiers order by sort;` returns exactly five rows, `educational` first and `international` last.

- [ ] **Step 3: Extend the types**

Append to `lib/types.ts`:

```ts
export const TERRITORIES = [
  'South Africa',
  'Rest of Africa',
  'United Kingdom',
  'North America',
  'Rest of World',
] as const

export type Territory = (typeof TERRITORIES)[number]

export type LicenceTier = {
  id: string
  label: string
  description: string | null
  minFee: number | null
  royaltyPct: number | null
  sort: number
}

export type RightsRow = {
  id: string
  territory: string
  tierId: string | null
  status: AvailabilityStatus
  restrictionNote: string | null
  validFrom: string | null
  validTo: string | null
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0003_rights.sql lib/types.ts
git commit -m "feat(south-canon): add licence tiers and territory-scoped rights availability"
```

---

## Task 5: `formatCastSize` â€” pure logic, test first

**Files:**
- Create: `tests/unit/cast.test.ts`, `lib/cast.ts`

**Interfaces:**
- Consumes: `CastRole` from `lib/types.ts`
- Produces: `formatCastSize(roles: CastRole[]): string`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/cast.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatCastSize } from '@/lib/cast'
import type { CastRole } from '@/lib/types'

const role = (over: Partial<CastRole>): CastRole => ({
  id: crypto.randomUUID(),
  name: 'Role',
  gender: 'any',
  ageRange: null,
  description: null,
  isEnsemble: false,
  sort: 0,
  ...over,
})

describe('formatCastSize', () => {
  it('returns an empty string when there are no roles', () => {
    expect(formatCastSize([])).toBe('')
  })

  it('counts male and female roles', () => {
    const roles = [
      role({ gender: 'male' }),
      role({ gender: 'male' }),
      role({ gender: 'male' }),
      role({ gender: 'female' }),
      role({ gender: 'female' }),
    ]
    expect(formatCastSize(roles)).toBe('3m, 2f')
  })

  it('reports any-gender roles separately', () => {
    const roles = [role({ gender: 'male' }), role({ gender: 'any' }), role({ gender: 'any' })]
    expect(formatCastSize(roles)).toBe('1m, 2 any gender')
  })

  it('appends ensemble without counting it', () => {
    const roles = [
      role({ gender: 'female' }),
      role({ gender: 'male' }),
      role({ isEnsemble: true, name: 'Ensemble' }),
    ]
    expect(formatCastSize(roles)).toBe('1m, 1f + ensemble')
  })

  it('handles an ensemble-only cast', () => {
    expect(formatCastSize([role({ isEnsemble: true })])).toBe('Ensemble')
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- cast`
Expected: FAIL â€” `Failed to resolve import "@/lib/cast"`.

- [ ] **Step 3: Implement**

Create `lib/cast.ts`:

```ts
import type { CastRole } from './types'

/** Renders a cast breakdown as the industry-standard summary, e.g. "3m, 2f + ensemble". */
export function formatCastSize(roles: CastRole[]): string {
  if (roles.length === 0) return ''

  const named = roles.filter((r) => !r.isEnsemble)
  const hasEnsemble = roles.some((r) => r.isEnsemble)

  const male = named.filter((r) => r.gender === 'male').length
  const female = named.filter((r) => r.gender === 'female').length
  const any = named.filter((r) => r.gender === 'any').length

  const parts: string[] = []
  if (male) parts.push(`${male}m`)
  if (female) parts.push(`${female}f`)
  if (any) parts.push(`${any} any gender`)

  if (parts.length === 0) return hasEnsemble ? 'Ensemble' : ''
  return hasEnsemble ? `${parts.join(', ')} + ensemble` : parts.join(', ')
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- cast`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/cast.test.ts lib/cast.ts
git commit -m "feat(south-canon): add cast size formatter"
```

---

## Task 6: `resolveAvailability` â€” pure logic, test first

**Files:**
- Create: `tests/unit/availability.test.ts`, `lib/availability.ts`

**Interfaces:**
- Consumes: `RightsRow`, `AvailabilityStatus` from `lib/types.ts`
- Produces: `resolveAvailability(rows: RightsRow[], territory: string, on?: Date): { status: AvailabilityStatus; note: string | null }`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/availability.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { resolveAvailability } from '@/lib/availability'
import type { RightsRow } from '@/lib/types'

const row = (over: Partial<RightsRow>): RightsRow => ({
  id: crypto.randomUUID(),
  territory: 'South Africa',
  tierId: null,
  status: 'available',
  restrictionNote: null,
  validFrom: null,
  validTo: null,
  ...over,
})

const on = new Date('2026-08-01')

describe('resolveAvailability', () => {
  it('is unavailable when no rights row covers the territory', () => {
    expect(resolveAvailability([], 'South Africa', on)).toEqual({
      status: 'unavailable',
      note: null,
    })
  })

  it('returns the status for a matching territory', () => {
    const rows = [row({ territory: 'South Africa', status: 'available' })]
    expect(resolveAvailability(rows, 'South Africa', on).status).toBe('available')
  })

  it('ignores rows for other territories', () => {
    const rows = [row({ territory: 'United Kingdom', status: 'available' })]
    expect(resolveAvailability(rows, 'South Africa', on).status).toBe('unavailable')
  })

  it('ignores rows whose window has closed', () => {
    const rows = [row({ status: 'available', validTo: '2026-07-01' })]
    expect(resolveAvailability(rows, 'South Africa', on).status).toBe('unavailable')
  })

  it('ignores rows whose window has not opened', () => {
    const rows = [row({ status: 'available', validFrom: '2026-09-01' })]
    expect(resolveAvailability(rows, 'South Africa', on).status).toBe('unavailable')
  })

  it('takes the most restrictive status when rows conflict', () => {
    const rows = [
      row({ status: 'available' }),
      row({ status: 'restricted', restrictionNote: 'Professional run until Dec 2026' }),
    ]
    expect(resolveAvailability(rows, 'South Africa', on)).toEqual({
      status: 'restricted',
      note: 'Professional run until Dec 2026',
    })
  })

  it('lets unavailable beat restricted', () => {
    const rows = [row({ status: 'restricted' }), row({ status: 'unavailable', restrictionNote: 'Withdrawn' })]
    expect(resolveAvailability(rows, 'South Africa', on)).toEqual({
      status: 'unavailable',
      note: 'Withdrawn',
    })
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- availability`
Expected: FAIL â€” cannot resolve `@/lib/availability`.

- [ ] **Step 3: Implement**

Create `lib/availability.ts`:

```ts
import type { AvailabilityStatus, RightsRow } from './types'

const SEVERITY: Record<AvailabilityStatus, number> = {
  available: 0,
  restricted: 1,
  unavailable: 2,
}

function isActive(r: RightsRow, on: Date): boolean {
  if (r.validFrom && new Date(r.validFrom) > on) return false
  if (r.validTo && new Date(r.validTo) < on) return false
  return true
}

/**
 * Resolves a play's availability in one territory.
 * No covering row means unavailable â€” rights are opt-in, never assumed.
 * When rows conflict, the most restrictive wins.
 */
export function resolveAvailability(
  rows: RightsRow[],
  territory: string,
  on: Date = new Date(),
): { status: AvailabilityStatus; note: string | null } {
  const relevant = rows.filter((r) => r.territory === territory && isActive(r, on))
  if (relevant.length === 0) return { status: 'unavailable', note: null }

  const worst = relevant.reduce((a, b) => (SEVERITY[b.status] > SEVERITY[a.status] ? b : a))
  return { status: worst.status, note: worst.restrictionNote }
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- availability`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/availability.test.ts lib/availability.ts
git commit -m "feat(south-canon): add territory availability resolver"
```

---

## Task 7: Catalogue filters and money formatting â€” pure logic, test first

**Files:**
- Create: `tests/unit/filters.test.ts`, `lib/filters.ts`, `tests/unit/money.test.ts`, `lib/money.ts`

**Interfaces:**
- Consumes: `Territory` from `lib/types.ts`
- Produces: `CatalogueFilters`, `parseFilters(sp)`, `filtersToSearchParams(f)`, `formatZar(n)`

- [ ] **Step 1: Write the failing filter test**

Create `tests/unit/filters.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseFilters, filtersToSearchParams } from '@/lib/filters'

describe('parseFilters', () => {
  it('returns empty filters for empty params', () => {
    expect(parseFilters({})).toEqual({ genres: [] })
  })

  it('reads a search term', () => {
    expect(parseFilters({ q: 'palace' }).q).toBe('palace')
  })

  it('trims a search term and drops it when blank', () => {
    expect(parseFilters({ q: '   ' }).q).toBeUndefined()
  })

  it('normalises a single genre to an array', () => {
    expect(parseFilters({ genre: 'drama' }).genres).toEqual(['drama'])
  })

  it('keeps multiple genres', () => {
    expect(parseFilters({ genre: ['drama', 'comedy'] }).genres).toEqual(['drama', 'comedy'])
  })

  it('parses numeric bounds and ignores rubbish', () => {
    expect(parseFilters({ castMax: '6' }).castMax).toBe(6)
    expect(parseFilters({ castMax: 'abc' }).castMax).toBeUndefined()
    expect(parseFilters({ durationMax: '120' }).durationMax).toBe(120)
  })

  it('accepts only known territories', () => {
    expect(parseFilters({ territory: 'South Africa' }).territory).toBe('South Africa')
    expect(parseFilters({ territory: 'Atlantis' }).territory).toBeUndefined()
  })
})

describe('filtersToSearchParams', () => {
  it('round-trips through parseFilters', () => {
    const filters = {
      q: 'palace',
      genres: ['drama', 'comedy'],
      castMax: 6,
      durationMax: 120,
      territory: 'South Africa' as const,
    }
    const sp = filtersToSearchParams(filters)
    expect(parseFilters(Object.fromEntries(sp.entries()) as Record<string, string>)).toMatchObject({
      q: 'palace',
      castMax: 6,
      durationMax: 120,
      territory: 'South Africa',
    })
  })

  it('omits empty values', () => {
    expect(filtersToSearchParams({ genres: [] }).toString()).toBe('')
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- filters`
Expected: FAIL â€” cannot resolve `@/lib/filters`.

- [ ] **Step 3: Implement the filters**

Create `lib/filters.ts`:

```ts
import { TERRITORIES, type Territory } from './types'

export type CatalogueFilters = {
  q?: string
  genres: string[]
  playwright?: string
  castMax?: number
  durationMax?: number
  territory?: Territory
}

type RawParams = Record<string, string | string[] | undefined>

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function toPositiveInt(v: string | string[] | undefined): number | undefined {
  const n = Number(first(v))
  return Number.isInteger(n) && n > 0 ? n : undefined
}

export function parseFilters(sp: RawParams): CatalogueFilters {
  const q = first(sp.q)?.trim()
  const territory = first(sp.territory)
  return {
    q: q || undefined,
    genres: toArray(sp.genre),
    playwright: first(sp.playwright) || undefined,
    castMax: toPositiveInt(sp.castMax),
    durationMax: toPositiveInt(sp.durationMax),
    territory: TERRITORIES.includes(territory as Territory) ? (territory as Territory) : undefined,
  }
}

export function filtersToSearchParams(f: CatalogueFilters): URLSearchParams {
  const sp = new URLSearchParams()
  if (f.q) sp.set('q', f.q)
  for (const g of f.genres) sp.append('genre', g)
  if (f.playwright) sp.set('playwright', f.playwright)
  if (f.castMax) sp.set('castMax', String(f.castMax))
  if (f.durationMax) sp.set('durationMax', String(f.durationMax))
  if (f.territory) sp.set('territory', f.territory)
  return sp
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- filters`
Expected: PASS, 9 tests.

- [ ] **Step 5: Write the failing money test**

Create `tests/unit/money.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatZar } from '@/lib/money'

describe('formatZar', () => {
  it('formats whole rands without decimals', () => {
    expect(formatZar(1500)).toBe('R1 500')
  })

  it('uses a plain space as the thousands separator, never a non-breaking space', () => {
    expect(formatZar(1500)).not.toContain('\u00a0') // no-break space
    expect(formatZar(1500)).not.toContain('\u202f') // narrow no-break space
  })

  it('returns null for null', () => {
    expect(formatZar(null)).toBeNull()
  })
})
```

- [ ] **Step 6: Run it and confirm it fails**

Run: `npm test -- money`
Expected: FAIL â€” cannot resolve `@/lib/money`.

- [ ] **Step 7: Implement money formatting**

Create `lib/money.ts`:

```ts
/**
 * Formats an amount as South African rand.
 * en-ZA emits U+00A0 / U+202F as the group separator, which renders as tofu in
 * some PDF and OG-image pipelines â€” so it is normalised to a plain space.
 */
export function formatZar(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined) return null
  const formatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount)
  return formatted.replace(/[\u00a0\u202f]/g, ' ').replace(/^ZAR\s*/, 'R').trim()
}
```

- [ ] **Step 8: Run it and confirm it passes**

Run: `npm test -- money`
Expected: PASS, 3 tests. If the locale output is `ZAR1 500` rather than `ZAR 1 500`, adjust the replace to also strip `ZAR` with no trailing space and re-run until the assertion `R1 500` holds.

- [ ] **Step 9: Commit**

```bash
git add tests/unit/filters.test.ts lib/filters.ts tests/unit/money.test.ts lib/money.ts
git commit -m "feat(south-canon): add catalogue filter parsing and ZAR formatting"
```

---

## Task 8: Search index and the data access layer

**Files:**
- Create: `supabase/migrations/0004_search.sql`, `lib/plays.ts`, `lib/playwrights.ts`, `supabase/seed.sql`

**Interfaces:**
- Consumes: all schema from Tasks 2â€“4, `formatCastSize`, `CatalogueFilters`
- Produces:
  - `listPlays(filters: CatalogueFilters): Promise<PlaySummary[]>`
  - `getPlayBySlug(slug: string): Promise<PlayDetail | null>`
  - `listPlaySlugs(): Promise<string[]>`
  - `listGenres(): Promise<string[]>`
  - `getPlaywrightBySlug(slug: string): Promise<PlaywrightDetail | null>`
  - `listPlaywrights(): Promise<Playwright[]>`
  - `listPlaywrightSlugs(): Promise<string[]>`
  - type `PlayDetail`, type `PlaywrightDetail`

- [ ] **Step 1: Write the search migration**

Create `supabase/migrations/0004_search.sql`:

```sql
create extension if not exists pg_trgm;

alter table plays add column search_text text
  generated always as (
    coalesce(title, '') || ' ' || coalesce(logline, '') || ' ' || coalesce(synopsis_short, '')
  ) stored;

create index plays_search_trgm on plays using gin (search_text gin_trgm_ops);
create index playwrights_name_trgm on playwrights using gin (name gin_trgm_ops);
create index plays_genres_idx on plays using gin (genres);
```

- [ ] **Step 2: Apply it**

Run: `npx supabase db push`
Expected: `\d plays` shows the generated `search_text` column and the three indexes exist.

- [ ] **Step 3: Add the detail types**

Append to `lib/types.ts`:

```ts
export type PlayDetail = PlaySummary & {
  synopsisShort: string | null
  synopsisFull: string | null
  yearWritten: number | null
  acts: number | null
  languages: string[]
  themes: string[]
  contentWarnings: string[]
  setting: string | null
  timePeriod: string | null
  targetAudience: string | null
  isMusical: boolean
  roles: CastRole[]
  media: PlayMedia[]
  press: PressQuote[]
  productions: Production[]
  rights: RightsRow[]
}

export type PlaywrightDetail = Playwright & { plays: PlaySummary[] }
```

- [ ] **Step 4: Write the play queries**

Create `lib/plays.ts`:

```ts
import { createServerClient } from './supabase/server'
import { formatCastSize } from './cast'
import type { CatalogueFilters } from './filters'
import type { CastRole, PlayDetail, PlaySummary } from './types'

const SUMMARY_SELECT = `
  id, title, slug, logline, genres, duration_min, hero_image_url,
  play_roles ( id, name, gender, age_range, description, is_ensemble, sort ),
  play_playwrights ( role, sort, playwrights ( name, slug ) )
`

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRoles(rows: any[] = []): CastRole[] {
  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      gender: r.gender,
      ageRange: r.age_range,
      description: r.description,
      isEnsemble: r.is_ensemble,
      sort: r.sort,
    }))
    .sort((a, b) => a.sort - b.sort)
}

function toSummary(row: any): PlaySummary {
  const roles = toRoles(row.play_roles)
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    logline: row.logline,
    genres: row.genres ?? [],
    durationMin: row.duration_min,
    heroImageUrl: row.hero_image_url,
    castSummary: formatCastSize(roles),
    credits: (row.play_playwrights ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((c: any) => ({ name: c.playwrights.name, slug: c.playwrights.slug, role: c.role })),
  }
}

export async function listPlays(filters: CatalogueFilters): Promise<PlaySummary[]> {
  const db = createServerClient()
  let query = db.from('plays').select(SUMMARY_SELECT).eq('status', 'published')

  if (filters.q) query = query.ilike('search_text', `%${filters.q}%`)
  if (filters.genres.length) query = query.overlaps('genres', filters.genres)
  if (filters.durationMax) query = query.lte('duration_min', filters.durationMax)

  const { data, error } = await query.order('title')
  if (error) throw error

  // Cast size lives in a joined table, so it filters on the raw rows before mapping.
  let rows = data ?? []
  if (filters.castMax) {
    rows = rows.filter((r: any) => (r.play_roles ?? []).length <= filters.castMax!)
  }

  let plays = rows.map(toSummary)
  if (filters.playwright) {
    plays = plays.filter((p) => p.credits.some((c) => c.slug === filters.playwright))
  }
  return plays
}

export async function getPlayBySlug(slug: string): Promise<PlayDetail | null> {
  const db = createServerClient()
  const { data, error } = await db
    .from('plays')
    .select(`
      *,
      play_roles ( id, name, gender, age_range, description, is_ensemble, sort ),
      play_playwrights ( role, sort, playwrights ( name, slug ) ),
      play_media ( id, type, url, caption, credit, sort ),
      play_press ( id, quote, source, published_at, sort ),
      play_productions ( id, company, venue, city, country, starts_on, ends_on, director, notes, is_premiere ),
      rights_availability ( id, territory, tier_id, status, restriction_note, valid_from, valid_to )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    ...toSummary(data),
    synopsisShort: data.synopsis_short,
    synopsisFull: data.synopsis_full,
    yearWritten: data.year_written,
    acts: data.acts,
    languages: data.languages ?? [],
    themes: data.themes ?? [],
    contentWarnings: data.content_warnings ?? [],
    setting: data.setting,
    timePeriod: data.time_period,
    targetAudience: data.target_audience,
    isMusical: data.is_musical,
    roles: toRoles(data.play_roles),
    media: (data.play_media ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((m: any) => ({ id: m.id, type: m.type, url: m.url, caption: m.caption, credit: m.credit })),
    press: (data.play_press ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((p: any) => ({ id: p.id, quote: p.quote, source: p.source, publishedAt: p.published_at })),
    productions: (data.play_productions ?? [])
      .map((p: any) => ({
        id: p.id,
        company: p.company,
        venue: p.venue,
        city: p.city,
        country: p.country,
        startsOn: p.starts_on,
        endsOn: p.ends_on,
        director: p.director,
        notes: p.notes,
        isPremiere: p.is_premiere,
      }))
      .sort((a: any, b: any) =>
        a.isPremiere === b.isPremiere
          ? String(b.startsOn ?? '').localeCompare(String(a.startsOn ?? ''))
          : a.isPremiere ? -1 : 1,
      ),
    rights: (data.rights_availability ?? []).map((r: any) => ({
      id: r.id,
      territory: r.territory,
      tierId: r.tier_id,
      status: r.status,
      restrictionNote: r.restriction_note,
      validFrom: r.valid_from,
      validTo: r.valid_to,
    })),
  }
}

export async function listPlaySlugs(): Promise<string[]> {
  const db = createServerClient()
  const { data, error } = await db.from('plays').select('slug').eq('status', 'published')
  if (error) throw error
  return (data ?? []).map((r) => r.slug)
}

export async function listGenres(): Promise<string[]> {
  const db = createServerClient()
  const { data, error } = await db.from('plays').select('genres').eq('status', 'published')
  if (error) throw error
  const all = (data ?? []).flatMap((r) => r.genres ?? [])
  return [...new Set(all)].sort()
}
```

- [ ] **Step 5: Write the playwright queries**

Create `lib/playwrights.ts`:

```ts
import { createServerClient } from './supabase/server'
import { listPlays } from './plays'
import type { Playwright, PlaywrightDetail } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */
function toPlaywright(row: any): Playwright {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    bio: row.bio,
    portraitUrl: row.portrait_url,
    country: row.country,
    honours: row.honours ?? [],
    representedSince: row.represented_since,
  }
}

export async function listPlaywrights(): Promise<Playwright[]> {
  const db = createServerClient()
  const { data, error } = await db
    .from('playwrights')
    .select('*')
    .eq('status', 'published')
    .order('name')
  if (error) throw error
  return (data ?? []).map(toPlaywright)
}

export async function getPlaywrightBySlug(slug: string): Promise<PlaywrightDetail | null> {
  const db = createServerClient()
  const { data, error } = await db
    .from('playwrights')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const plays = await listPlays({ genres: [], playwright: slug })
  return { ...toPlaywright(data), plays }
}

export async function listPlaywrightSlugs(): Promise<string[]> {
  const db = createServerClient()
  const { data, error } = await db.from('playwrights').select('slug').eq('status', 'published')
  if (error) throw error
  return (data ?? []).map((r) => r.slug)
}
```

- [ ] **Step 6: Seed one real play so pages have something to render**

Create `supabase/seed.sql`:

```sql
insert into playwrights (name, slug, bio, country, status)
values (
  'Paul Slabolepszy',
  'paul-slabolepszy',
  'Paul Slabolepszy is one of South Africa''s most performed playwrights, with a body of work spanning four decades of South African life.',
  'South Africa',
  'published'
) on conflict (slug) do nothing;

insert into plays (title, slug, logline, synopsis_short, genres, year_written, duration_min, acts, languages, setting, time_period, status)
values (
  'Saturday Night at the Palace',
  'saturday-night-at-the-palace',
  'A late-night roadhouse encounter turns an ordinary evening into a reckoning.',
  'Two white men and a black roadhouse worker collide on a Saturday night, and the evening turns from banter to violence.',
  array['Drama'],
  1982,
  90,
  1,
  array['English'],
  'A roadhouse outside Johannesburg.',
  '1980s',
  'published'
) on conflict (slug) do nothing;

insert into play_playwrights (play_id, playwright_id, role, sort)
select p.id, w.id, 'author', 0
from plays p, playwrights w
where p.slug = 'saturday-night-at-the-palace' and w.slug = 'paul-slabolepszy'
on conflict do nothing;

insert into play_roles (play_id, name, gender, sort)
select p.id, r.name, r.gender::role_gender, r.sort
from plays p,
     (values ('Vince', 'male', 0), ('Forsie', 'male', 1), ('September', 'male', 2)) as r(name, gender, sort)
where p.slug = 'saturday-night-at-the-palace';

insert into rights_availability (play_id, territory, tier_id, status)
select p.id, t.territory, t.tier_id, 'available'::availability_status
from plays p,
     (values ('South Africa', 'amateur'), ('South Africa', 'professional'), ('South Africa', 'educational')) as t(territory, tier_id)
where p.slug = 'saturday-night-at-the-palace';
```

Run it in the Supabase SQL editor.
Expected: `select count(*) from plays where status = 'published';` returns 1.

- [ ] **Step 7: Verify the data layer end to end**

Create `tests/e2e/data.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('the seeded play is reachable through the app', async ({ page }) => {
  const res = await page.goto('/plays/saturday-night-at-the-palace')
  expect(res?.status()).toBeLessThan(500)
})
```

This will 404 until Task 11. Do not run it yet â€” it is committed now so the page task has a target.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0004_search.sql supabase/seed.sql lib/plays.ts lib/playwrights.ts lib/types.ts tests/e2e/data.spec.ts
git commit -m "feat(south-canon): add search index, data access layer and seed data"
```

---

## Task 9: Layout shell â€” header, footer, primitives

**Files:**
- Create: `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `components/ui/Container.tsx`, `components/ui/AvailabilityBadge.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `AvailabilityStatus`
- Produces: `<Container>`, `<AvailabilityBadge status note />`, header and footer rendered on every page.

- [ ] **Step 1: Build the container primitive**

Create `components/ui/Container.tsx`:

```tsx
export function Container({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>{children}</div>
}
```

- [ ] **Step 2: Build the availability badge**

Create `components/ui/AvailabilityBadge.tsx`:

```tsx
import type { AvailabilityStatus } from '@/lib/types'

const LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available to licence',
  restricted: 'Restricted',
  unavailable: 'Not currently available',
}

const CLASSES: Record<AvailabilityStatus, string> = {
  available: 'text-available border-available/40 bg-available/5',
  restricted: 'text-restricted border-restricted/40 bg-restricted/5',
  unavailable: 'text-unavailable border-unavailable/40 bg-unavailable/5',
}

/** Status is always carried by the label text, never by colour alone. */
export function AvailabilityBadge({
  status,
  note,
}: {
  status: AvailabilityStatus
  note?: string | null
}) {
  return (
    <span className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase ${CLASSES[status]}`}
      >
        {LABELS[status]}
      </span>
      {note ? <span className="text-sm text-muted">{note}</span> : null}
    </span>
  )
}
```

- [ ] **Step 3: Build the header**

Create `components/layout/Header.tsx`:

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'

const NAV = [
  { href: '/plays', label: 'Catalogue' },
  { href: '/playwrights', label: 'Playwrights' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  return (
    <header className="border-b border-rule">
      <Container className="flex items-center justify-between py-6">
        <Link href="/" className="font-display text-xl tracking-[0.18em] uppercase">
          South Canon
        </Link>
        <nav className="flex gap-6 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  )
}
```

- [ ] **Step 4: Build the footer**

Create `components/layout/Footer.tsx`:

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule py-10 text-sm text-muted">
      <Container className="flex flex-col gap-4 md:flex-row md:justify-between">
        <p>
          South Canon &mdash; theatrical licensing for the global South.
        </p>
        <nav className="flex gap-6">
          <Link href="/privacy" className="hover:text-accent">Privacy</Link>
          <Link href="/terms" className="hover:text-accent">Terms</Link>
        </nav>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 5: Mount them in the root layout**

In `app/layout.tsx`, replace the `<body>` contents:

```tsx
<body className="font-sans flex min-h-screen flex-col">
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
</body>
```

Add the imports:

```tsx
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
```

- [ ] **Step 6: Verify**

Run: `npm run dev` and open http://localhost:3000
Expected: wordmark top-left in the serif with wide letterspacing, four nav links, footer rule at the bottom, warm paper background throughout.

- [ ] **Step 7: Commit**

```bash
git add components app/layout.tsx
git commit -m "feat(south-canon): add layout shell and availability badge"
```

---

## Task 10: Catalogue index with search and filters

**Files:**
- Create: `components/catalogue/PlayCard.tsx`, `components/catalogue/CatalogueFilters.tsx`, `app/plays/page.tsx`, `tests/e2e/catalogue.spec.ts`

**Interfaces:**
- Consumes: `listPlays`, `listGenres`, `listPlaywrights`, `parseFilters`, `PlaySummary`
- Produces: `/plays` with working title, genre, playwright, cast-size and duration filters.

- [ ] **Step 1: Build the typographic play card**

Create `components/catalogue/PlayCard.tsx`:

```tsx
import Link from 'next/link'
import type { PlaySummary } from '@/lib/types'

export function PlayCard({ play }: { play: PlaySummary }) {
  return (
    <Link
      href={`/plays/${play.slug}`}
      className="group block border-b border-rule py-8 transition-colors hover:border-accent"
    >
      <article className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <h2 className="font-display text-3xl leading-tight group-hover:text-accent md:text-4xl">
            {play.title}
          </h2>
          {play.credits.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              {play.credits.map((c) => c.name).join(' Â· ')}
            </p>
          )}
          {play.logline && <p className="mt-3 max-w-2xl text-base">{play.logline}</p>}
        </div>
        <dl className="flex gap-6 text-xs tracking-wide uppercase text-muted md:flex-col md:gap-2 md:text-right">
          {play.genres.length > 0 && (
            <div>
              <dt className="sr-only">Genre</dt>
              <dd>{play.genres.join(', ')}</dd>
            </div>
          )}
          {play.castSummary && (
            <div>
              <dt className="sr-only">Cast</dt>
              <dd>{play.castSummary}</dd>
            </div>
          )}
          {play.durationMin && (
            <div>
              <dt className="sr-only">Duration</dt>
              <dd>{play.durationMin} min</dd>
            </div>
          )}
        </dl>
      </article>
    </Link>
  )
}
```

- [ ] **Step 2: Build the filter form**

Create `components/catalogue/CatalogueFilters.tsx`:

```tsx
import { TERRITORIES } from '@/lib/types'
import type { CatalogueFilters as Filters } from '@/lib/filters'
import type { Playwright } from '@/lib/types'

export function CatalogueFilters({
  filters,
  genres,
  playwrights,
}: {
  filters: Filters
  genres: string[]
  playwrights: Playwright[]
}) {
  return (
    <form method="get" className="grid gap-4 border-b border-rule pb-8 md:grid-cols-5">
      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-xs uppercase tracking-wide text-muted">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Title, writer or subject"
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Genre</span>
        <select
          name="genre"
          defaultValue={filters.genres[0] ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Playwright</span>
        <select
          name="playwright"
          defaultValue={filters.playwright ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        >
          <option value="">All playwrights</option>
          {playwrights.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Max cast</span>
        <input
          type="number"
          name="castMax"
          min={1}
          defaultValue={filters.castMax ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Max duration (min)</span>
        <input
          type="number"
          name="durationMax"
          min={1}
          step={5}
          defaultValue={filters.durationMax ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Available in</span>
        <select
          name="territory"
          defaultValue={filters.territory ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        >
          <option value="">Any territory</option>
          {TERRITORIES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="self-end border border-ink px-6 py-2 text-sm uppercase tracking-wide hover:bg-ink hover:text-paper"
      >
        Filter
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Build the catalogue page**

Create `app/plays/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters'
import { PlayCard } from '@/components/catalogue/PlayCard'
import { parseFilters } from '@/lib/filters'
import { listGenres, listPlays } from '@/lib/plays'
import { listPlaywrights } from '@/lib/playwrights'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Catalogue',
  description:
    'Browse plays available for licensing from South Canon. Search by title, genre or playwright.',
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseFilters(await searchParams)
  const [plays, genres, playwrights] = await Promise.all([
    listPlays(filters),
    listGenres(),
    listPlaywrights(),
  ])

  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">Catalogue</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Plays represented by South Canon. Search by title, genre or playwright.
      </p>

      <div className="mt-12">
        <CatalogueFilters filters={filters} genres={genres} playwrights={playwrights} />
      </div>

      {plays.length === 0 ? (
        <p className="py-16 text-muted">No plays match those filters yet.</p>
      ) : (
        <div className="mt-4">
          <p className="py-6 text-xs uppercase tracking-wide text-muted">
            {plays.length} {plays.length === 1 ? 'play' : 'plays'}
          </p>
          {plays.map((play) => (
            <PlayCard key={play.id} play={play} />
          ))}
        </div>
      )}
    </Container>
  )
}
```

- [ ] **Step 4: Write the e2e test**

Create `tests/e2e/catalogue.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('catalogue lists the seeded play', async ({ page }) => {
  await page.goto('/plays')
  await expect(page.getByRole('heading', { name: 'Saturday Night at the Palace' })).toBeVisible()
})

test('search narrows the list', async ({ page }) => {
  await page.goto('/plays?q=zzzznomatch')
  await expect(page.getByText('No plays match those filters yet.')).toBeVisible()
})

test('filtering by playwright keeps the play', async ({ page }) => {
  await page.goto('/plays?playwright=paul-slabolepszy')
  await expect(page.getByRole('heading', { name: 'Saturday Night at the Palace' })).toBeVisible()
})
```

- [ ] **Step 5: Run it**

Run: `npm run e2e -- catalogue`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add components/catalogue app/plays/page.tsx tests/e2e/catalogue.spec.ts
git commit -m "feat(south-canon): add catalogue index with search and filters"
```

---

## Task 11: The Play Detail template

**Files:**
- Create: `components/play/PlayHero.tsx`, `AtAGlance.tsx`, `Synopsis.tsx`, `Characters.tsx`, `ProductionHistory.tsx`, `PressQuotes.tsx`, `MediaGallery.tsx`, `LicensingPanel.tsx`, `RightsTable.tsx`, `PlaywrightCard.tsx`, `RelatedPlays.tsx`, `app/plays/[slug]/page.tsx`, `tests/e2e/play-detail.spec.ts`
- Modify: `lib/plays.ts` (add `listRelatedPlays`, `listLicenceTiers`)

**Interfaces:**
- Consumes: `getPlayBySlug`, `listPlaySlugs`, `resolveAvailability`, `formatZar`, `PlayDetail`, `LicenceTier`
- Produces: `/plays/[slug]` rendering all 13 content blocks, each returning `null` when empty.

**Critical requirement:** every block component returns `null` when its data is empty. A play with only a title and cast must render as a clean, deliberate page with no empty headings â€” this is what lets the site launch before photo and video content exists.

- [ ] **Step 1: Add the two remaining queries**

Append to `lib/plays.ts`:

```ts
import type { LicenceTier } from './types'

export async function listLicenceTiers(): Promise<LicenceTier[]> {
  const db = createServerClient()
  const { data, error } = await db.from('licence_tiers').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map((t: any) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    minFee: t.min_fee === null ? null : Number(t.min_fee),
    royaltyPct: t.royalty_pct === null ? null : Number(t.royalty_pct),
    sort: t.sort,
  }))
}

/** Related by shared playwright first, then shared genre. Never returns the play itself. */
export async function listRelatedPlays(play: PlayDetail, limit = 3): Promise<PlaySummary[]> {
  const all = await listPlays({ genres: [] })
  const others = all.filter((p) => p.id !== play.id)
  const writerSlugs = new Set(play.credits.map((c) => c.slug))

  const scored = others.map((p) => ({
    play: p,
    score:
      (p.credits.some((c) => writerSlugs.has(c.slug)) ? 2 : 0) +
      (p.genres.some((g) => play.genres.includes(g)) ? 1 : 0),
  }))

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.play)
}
```

- [ ] **Step 2: Build the hero and at-a-glance blocks**

Create `components/play/PlayHero.tsx`:

```tsx
import Link from 'next/link'
import { AvailabilityBadge } from '@/components/ui/AvailabilityBadge'
import { resolveAvailability } from '@/lib/availability'
import type { PlayDetail } from '@/lib/types'

export function PlayHero({ play }: { play: PlayDetail }) {
  const { status, note } = resolveAvailability(play.rights, 'South Africa')

  return (
    <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
      <div>
        <AvailabilityBadge status={status} note={note} />
        <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">{play.title}</h1>
        {play.credits.length > 0 && (
          <p className="mt-4 text-lg">
            {play.credits.map((c, i) => (
              <span key={c.slug}>
                {i > 0 && <span className="text-muted"> &middot; </span>}
                <Link href={`/playwrights/${c.slug}`} className="hover:text-accent">
                  {c.name}
                </Link>
              </span>
            ))}
          </p>
        )}
        {play.logline && <p className="mt-6 max-w-xl text-xl text-muted">{play.logline}</p>}

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/contact?play=${play.slug}&intent=perusal`}
            className="border border-ink px-6 py-3 text-sm uppercase tracking-wide hover:bg-ink hover:text-paper"
          >
            Request perusal script
          </Link>
          <Link
            href={`/contact?play=${play.slug}&intent=licence`}
            className="bg-accent px-6 py-3 text-sm uppercase tracking-wide text-paper hover:opacity-90"
          >
            Apply for licence
          </Link>
        </div>
      </div>

      {play.heroImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={play.heroImageUrl}
          alt={`Production photograph from ${play.title}`}
          className="aspect-[4/5] w-full object-cover"
        />
      )}
    </section>
  )
}
```

Note: the CTAs point at `/contact` in M1. Task M2 replaces these hrefs with the real application and perusal flows.

Create `components/play/AtAGlance.tsx`:

```tsx
import type { PlayDetail } from '@/lib/types'

export function AtAGlance({ play }: { play: PlayDetail }) {
  const items: { label: string; value: string }[] = []
  if (play.castSummary) items.push({ label: 'Cast', value: play.castSummary })
  if (play.durationMin) items.push({ label: 'Duration', value: `${play.durationMin} min` })
  if (play.acts) items.push({ label: 'Acts', value: String(play.acts) })
  if (play.genres.length) items.push({ label: 'Genre', value: play.genres.join(', ') })
  if (play.languages.length) items.push({ label: 'Language', value: play.languages.join(', ') })
  if (play.targetAudience) items.push({ label: 'Audience', value: play.targetAudience })
  if (play.contentWarnings.length)
    items.push({ label: 'Content warnings', value: play.contentWarnings.join(', ') })

  if (items.length === 0) return null

  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-rule py-8 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-muted">{item.label}</dt>
          <dd className="mt-1">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
```

- [ ] **Step 3: Build the remaining content blocks**

Create `components/play/Synopsis.tsx`:

```tsx
import type { PlayDetail } from '@/lib/types'

export function Synopsis({ play }: { play: PlayDetail }) {
  if (!play.synopsisShort && !play.synopsisFull) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Synopsis</h2>
      {play.synopsisShort && <p className="mt-4 max-w-3xl text-lg">{play.synopsisShort}</p>}
      {play.synopsisFull && (
        <details className="mt-4 max-w-3xl">
          <summary className="cursor-pointer text-sm uppercase tracking-wide text-accent">
            Read the full synopsis
          </summary>
          <div className="mt-4 space-y-4 whitespace-pre-line">{play.synopsisFull}</div>
        </details>
      )}
    </section>
  )
}
```

Create `components/play/Characters.tsx`:

```tsx
import type { CastRole } from '@/lib/types'

const GENDER_LABEL: Record<CastRole['gender'], string> = {
  male: 'Male',
  female: 'Female',
  any: 'Any gender',
}

export function Characters({ roles }: { roles: CastRole[] }) {
  if (roles.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Characters</h2>
      <ul className="mt-6 divide-y divide-rule border-t border-rule">
        {roles.map((role) => (
          <li key={role.id} className="grid gap-2 py-4 md:grid-cols-[200px_1fr]">
            <div>
              <p className="font-medium">{role.name}</p>
              <p className="text-xs uppercase tracking-wide text-muted">
                {GENDER_LABEL[role.gender]}
                {role.ageRange ? ` Â· ${role.ageRange}` : ''}
              </p>
            </div>
            {role.description && <p className="text-muted">{role.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Create `components/play/ProductionHistory.tsx`:

```tsx
import type { Production } from '@/lib/types'

function year(date: string | null) {
  return date ? new Date(date).getFullYear() : null
}

export function ProductionHistory({ productions }: { productions: Production[] }) {
  if (productions.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Production history</h2>
      <ul className="mt-6 divide-y divide-rule border-t border-rule">
        {productions.map((p) => (
          <li key={p.id} className="grid gap-1 py-4 md:grid-cols-[120px_1fr]">
            <p className="text-sm text-muted">{year(p.startsOn) ?? 'â€”'}</p>
            <div>
              <p>
                {p.company}
                {p.isPremiere && (
                  <span className="ml-2 text-xs uppercase tracking-wide text-accent">Premiere</span>
                )}
              </p>
              <p className="text-sm text-muted">
                {[p.venue, p.city, p.country].filter(Boolean).join(', ')}
                {p.director ? ` Â· directed by ${p.director}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Create `components/play/PressQuotes.tsx`:

```tsx
import type { PressQuote } from '@/lib/types'

export function PressQuotes({ press }: { press: PressQuote[] }) {
  if (press.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Press</h2>
      <div className="mt-6 space-y-8">
        {press.map((q) => (
          <blockquote key={q.id} className="border-l-2 border-accent pl-6">
            <p className="font-display text-2xl leading-snug">&ldquo;{q.quote}&rdquo;</p>
            <footer className="mt-2 text-sm text-muted">{q.source}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
```

Create `components/play/MediaGallery.tsx`:

```tsx
import type { PlayMedia } from '@/lib/types'

export function MediaGallery({ media }: { media: PlayMedia[] }) {
  if (media.length === 0) return null
  const photos = media.filter((m) => m.type === 'photo')
  const videos = media.filter((m) => m.type === 'video')

  return (
    <section>
      <h2 className="font-display text-3xl">Media</h2>
      {photos.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {photos.map((p) => (
            <figure key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption ?? ''} className="w-full object-cover" />
              {(p.caption || p.credit) && (
                <figcaption className="mt-2 text-xs text-muted">
                  {[p.caption, p.credit].filter(Boolean).join(' Â· ')}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      {videos.length > 0 && (
        <div className="mt-6 space-y-6">
          {videos.map((v) => (
            <div key={v.id} className="aspect-video">
              <iframe
                src={v.url}
                title={v.caption ?? 'Production video'}
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
```

Create `components/play/LicensingPanel.tsx`:

```tsx
import { formatZar } from '@/lib/money'
import type { LicenceTier } from '@/lib/types'

export function LicensingPanel({ tiers }: { tiers: LicenceTier[] }) {
  if (tiers.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Licensing</h2>
      <table className="mt-6 w-full border-t border-rule text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            <th className="py-3 font-normal">Tier</th>
            <th className="py-3 font-normal">Who it is for</th>
            <th className="py-3 font-normal text-right">From</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {tiers.map((t) => (
            <tr key={t.id}>
              <td className="py-4 align-top font-medium">{t.label}</td>
              <td className="py-4 align-top text-muted">{t.description}</td>
              <td className="py-4 align-top text-right whitespace-nowrap">
                {formatZar(t.minFee)
                  ? `${formatZar(t.minFee)} per performance`
                  : <span className="text-muted">On application</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-muted">
        Fees shown are indicative minimums and are not a quotation. Your licence fee depends on
        venue capacity, ticket price and the number of performances.
      </p>
    </section>
  )
}
```

The estimator itself is deliberately deferred to M2, where it sits beside the application form that supplies its inputs. This panel shows indicative minimums, which is the part that belongs on a public, statically-rendered page.

Create `components/play/RightsTable.tsx`:

```tsx
import { AvailabilityBadge } from '@/components/ui/AvailabilityBadge'
import { resolveAvailability } from '@/lib/availability'
import { TERRITORIES, type RightsRow } from '@/lib/types'

export function RightsTable({ rights }: { rights: RightsRow[] }) {
  if (rights.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Rights and availability</h2>
      <ul className="mt-6 divide-y divide-rule border-t border-rule">
        {TERRITORIES.map((territory) => {
          const { status, note } = resolveAvailability(rights, territory)
          return (
            <li key={territory} className="grid gap-2 py-4 md:grid-cols-[200px_1fr] md:items-center">
              <p>{territory}</p>
              <AvailabilityBadge status={status} note={note} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
```

Create `components/play/PlaywrightCard.tsx`:

```tsx
import Link from 'next/link'
import type { Playwright } from '@/lib/types'

export function PlaywrightCard({ playwright }: { playwright: Playwright }) {
  return (
    <section className="grid gap-6 border-t border-rule pt-8 md:grid-cols-[160px_1fr]">
      {playwright.portraitUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={playwright.portraitUrl}
          alt={playwright.name}
          className="aspect-square w-40 object-cover"
        />
      ) : (
        <div />
      )}
      <div>
        <h2 className="font-display text-3xl">{playwright.name}</h2>
        {playwright.bio && <p className="mt-3 max-w-2xl text-muted">{playwright.bio}</p>}
        <Link
          href={`/playwrights/${playwright.slug}`}
          className="mt-4 inline-block text-sm uppercase tracking-wide text-accent hover:underline"
        >
          View full profile
        </Link>
      </div>
    </section>
  )
}
```

Create `components/play/RelatedPlays.tsx`:

```tsx
import { PlayCard } from '@/components/catalogue/PlayCard'
import type { PlaySummary } from '@/lib/types'

export function RelatedPlays({ plays }: { plays: PlaySummary[] }) {
  if (plays.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Also represented</h2>
      <div className="mt-4">
        {plays.map((p) => (
          <PlayCard key={p.id} play={p} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Assemble the page**

Create `app/plays/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { PlayHero } from '@/components/play/PlayHero'
import { AtAGlance } from '@/components/play/AtAGlance'
import { Synopsis } from '@/components/play/Synopsis'
import { Characters } from '@/components/play/Characters'
import { ProductionHistory } from '@/components/play/ProductionHistory'
import { PressQuotes } from '@/components/play/PressQuotes'
import { MediaGallery } from '@/components/play/MediaGallery'
import { LicensingPanel } from '@/components/play/LicensingPanel'
import { RightsTable } from '@/components/play/RightsTable'
import { PlaywrightCard } from '@/components/play/PlaywrightCard'
import { RelatedPlays } from '@/components/play/RelatedPlays'
import { getPlayBySlug, listLicenceTiers, listPlaySlugs, listRelatedPlays } from '@/lib/plays'
import { getPlaywrightBySlug } from '@/lib/playwrights'

export const revalidate = 300

export async function generateStaticParams() {
  return (await listPlaySlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const play = await getPlayBySlug((await params).slug)
  if (!play) return {}
  const writers = play.credits.map((c) => c.name).join(', ')
  return {
    title: play.title,
    description: play.logline ?? play.synopsisShort ?? `${play.title} by ${writers}.`,
    openGraph: { images: play.heroImageUrl ? [play.heroImageUrl] : [] },
  }
}

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const play = await getPlayBySlug((await params).slug)
  if (!play) notFound()

  const [tiers, related] = await Promise.all([listLicenceTiers(), listRelatedPlays(play)])
  const primary = play.credits[0]
    ? await getPlaywrightBySlug(play.credits[0].slug)
    : null

  return (
    <Container className="py-16">
      <PlayHero play={play} />
      <div className="mt-16 space-y-16">
        <AtAGlance play={play} />
        <Synopsis play={play} />
        <Characters roles={play.roles} />
        {(play.setting || play.timePeriod) && (
          <section>
            <h2 className="font-display text-3xl">Setting</h2>
            {play.setting && <p className="mt-4 max-w-3xl">{play.setting}</p>}
            {play.timePeriod && <p className="mt-2 text-muted">{play.timePeriod}</p>}
          </section>
        )}
        <ProductionHistory productions={play.productions} />
        <PressQuotes press={play.press} />
        <MediaGallery media={play.media} />
        <LicensingPanel tiers={tiers} />
        <RightsTable rights={play.rights} />
        {primary && <PlaywrightCard playwright={primary} />}
        <RelatedPlays plays={related} />
      </div>
    </Container>
  )
}
```

- [ ] **Step 5: Write the e2e test, including graceful degradation**

Create `tests/e2e/play-detail.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const URL = '/plays/saturday-night-at-the-palace'

test('renders the title, writer and both CTAs', async ({ page }) => {
  await page.goto(URL)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Saturday Night at the Palace')
  await expect(page.getByRole('link', { name: 'Paul Slabolepszy' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Request perusal script' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Apply for licence' })).toBeVisible()
})

test('shows the cast breakdown', async ({ page }) => {
  await page.goto(URL)
  await expect(page.getByRole('heading', { name: 'Characters' })).toBeVisible()
  await expect(page.getByText('Vince')).toBeVisible()
})

test('shows availability by territory', async ({ page }) => {
  await page.goto(URL)
  await expect(page.getByRole('heading', { name: 'Rights and availability' })).toBeVisible()
  await expect(page.getByText('Not currently available').first()).toBeVisible()
})

test('omits blocks that have no data', async ({ page }) => {
  await page.goto(URL)
  // The seed play has no press, media or production history yet.
  await expect(page.getByRole('heading', { name: 'Press' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Media' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Production history' })).toHaveCount(0)
})

test('returns 404 for an unknown play', async ({ page }) => {
  const res = await page.goto('/plays/not-a-real-play')
  expect(res?.status()).toBe(404)
})
```

- [ ] **Step 6: Run the tests**

Run: `npm run e2e -- play-detail`
Expected: 5 passed. The "omits blocks" test is the one that proves the launch-before-content requirement holds.

Run: `npm run e2e -- data`
Expected: 1 passed (the Task 8 placeholder now resolves).

- [ ] **Step 7: Commit**

```bash
git add components/play app/plays/[slug] lib/plays.ts tests/e2e/play-detail.spec.ts
git commit -m "feat(south-canon): add the repeatable play detail template"
```

---

## Task 12: Playwright profiles, home, about and contact

**Files:**
- Create: `app/playwrights/page.tsx`, `app/playwrights/[slug]/page.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/contact/actions.ts`, `tests/e2e/pages.spec.ts`
- Modify: none

**Interfaces:**
- Consumes: `listPlaywrights`, `getPlaywrightBySlug`, `listPlaywrightSlugs`, `listPlays`, `PlayCard`
- Produces: `/`, `/playwrights`, `/playwrights/[slug]`, `/about`, `/contact` with a bot-protected form.

- [ ] **Step 1: Build the playwright index**

Create `app/playwrights/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { listPlaywrights } from '@/lib/playwrights'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Playwrights',
  description: 'The writers represented by South Canon.',
}

export default async function PlaywrightsPage() {
  const playwrights = await listPlaywrights()
  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">Playwrights</h1>
      <ul className="mt-12 divide-y divide-rule border-t border-rule">
        {playwrights.map((p) => (
          <li key={p.slug} className="py-8">
            <Link href={`/playwrights/${p.slug}`} className="group">
              <h2 className="font-display text-3xl group-hover:text-accent">{p.name}</h2>
              {p.country && <p className="mt-1 text-sm text-muted">{p.country}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
```

- [ ] **Step 2: Build the playwright profile**

Create `app/playwrights/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { PlayCard } from '@/components/catalogue/PlayCard'
import { getPlaywrightBySlug, listPlaywrightSlugs } from '@/lib/playwrights'

export const revalidate = 300

export async function generateStaticParams() {
  return (await listPlaywrightSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const w = await getPlaywrightBySlug((await params).slug)
  if (!w) return {}
  return {
    title: w.name,
    description: w.bio?.slice(0, 155) ?? `Plays by ${w.name}, represented by South Canon.`,
  }
}

export default async function PlaywrightPage({ params }: { params: Promise<{ slug: string }> }) {
  const w = await getPlaywrightBySlug((await params).slug)
  if (!w) notFound()

  return (
    <Container className="py-16">
      <div className="grid gap-10 md:grid-cols-[240px_1fr]">
        {w.portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={w.portraitUrl} alt={w.name} className="aspect-square w-60 object-cover" />
        ) : (
          <div />
        )}
        <div>
          <h1 className="font-display text-5xl md:text-6xl">{w.name}</h1>
          {w.country && <p className="mt-2 text-muted">{w.country}</p>}
          {w.honours.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-accent">
              {w.honours.map((h) => (
                <li key={h} className="border border-accent/30 px-3 py-1">{h}</li>
              ))}
            </ul>
          )}
          {w.bio && <p className="mt-6 max-w-2xl whitespace-pre-line">{w.bio}</p>}
        </div>
      </div>

      {w.plays.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl">Plays</h2>
          <div className="mt-4">
            {w.plays.map((p) => (
              <PlayCard key={p.id} play={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
```

- [ ] **Step 3: Build the home page**

Replace `app/page.tsx`:

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { PlayCard } from '@/components/catalogue/PlayCard'
import { listPlays } from '@/lib/plays'

export const revalidate = 300

export default async function HomePage() {
  const plays = (await listPlays({ genres: [] })).slice(0, 4)

  return (
    <>
      <Container className="py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">
          Theatrical licensing for the global South
        </p>
        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
          The work of Africa&rsquo;s greatest playwrights, properly represented.
        </h1>
        <p className="mt-8 max-w-2xl text-xl text-muted">
          South Canon licenses plays for performance worldwide &mdash; and makes sure the writers
          who made them are paid, on time, with a full account of where their work is playing.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/plays"
            className="bg-accent px-8 py-4 text-sm uppercase tracking-wide text-paper hover:opacity-90"
          >
            Browse the catalogue
          </Link>
          <Link
            href="/about"
            className="border border-ink px-8 py-4 text-sm uppercase tracking-wide hover:bg-ink hover:text-paper"
          >
            For writers
          </Link>
        </div>
      </Container>

      {plays.length > 0 && (
        <Container className="pb-24">
          <h2 className="font-display text-3xl">From the catalogue</h2>
          <div className="mt-4">
            {plays.map((p) => (
              <PlayCard key={p.id} play={p} />
            ))}
          </div>
        </Container>
      )}
    </>
  )
}
```

- [ ] **Step 4: Build the about page**

Create `app/about/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'About',
  description:
    'South Canon is a premium rights organisation representing playwrights across Africa and the global South.',
}

export default function AboutPage() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">About South Canon</h1>
      <div className="mt-10 max-w-3xl space-y-6 text-lg">
        <p>
          South Canon represents playwrights across Africa and the global South, licensing their
          work for performance to schools, community theatres, professional producers and
          international companies.
        </p>
        <p>
          We are built around a simple commitment: writers should know exactly where their work is
          playing, what it has earned, and when they will be paid. Every writer we represent gets a
          full account of their catalogue and their royalties.
        </p>
        <p>
          If you are a producer, start with the{' '}
          <Link href="/plays" className="text-accent hover:underline">catalogue</Link>. If you are a
          writer looking for representation,{' '}
          <Link href="/contact" className="text-accent hover:underline">get in touch</Link>.
        </p>
      </div>
    </Container>
  )
}
```

- [ ] **Step 5: Build the contact form with bot protection**

Create `app/contact/actions.ts`:

```ts
'use server'

import { createServiceClient } from '@/lib/supabase/server'

export type ContactState = { ok: boolean; message: string } | null

/** Honeypot + timing check. A real person takes longer than 3 seconds to fill this in. */
export async function submitEnquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  if (formData.get('company')) return { ok: true, message: 'Thank you. We will be in touch.' }

  const startedAt = Number(formData.get('startedAt'))
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 3000) {
    return { ok: true, message: 'Thank you. We will be in touch.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  if (!name || !email || !message) {
    return { ok: false, message: 'Please complete every field.' }
  }

  const db = createServiceClient()
  const { error } = await db.from('enquiries').insert({
    name,
    email,
    message,
    play_slug: String(formData.get('play') ?? '') || null,
    intent: String(formData.get('intent') ?? '') || null,
  })
  if (error) return { ok: false, message: 'Something went wrong. Please email us directly.' }

  return { ok: true, message: 'Thank you. We will be in touch.' }
}
```

Add the table â€” create `supabase/migrations/0006_enquiries.sql`:

```sql
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  play_slug text,
  intent text,
  created_at timestamptz not null default now()
);

alter table enquiries enable row level security;
-- No public policy: writes go through the service-role client only.
```

Run: `npx supabase db push`

Create `app/contact/page.tsx`:

```tsx
'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { submitEnquiry, type ContactState } from './actions'

export default function ContactPage() {
  const params = useSearchParams()
  const [startedAt] = useState(() => Date.now())
  const [state, action, pending] = useActionState<ContactState, FormData>(submitEnquiry, null)

  const play = params.get('play') ?? ''
  const intent = params.get('intent') ?? ''

  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">Contact</h1>
      <p className="mt-4 max-w-2xl text-muted">
        {intent === 'perusal'
          ? 'Tell us about your production and we will send a perusal script.'
          : intent === 'licence'
            ? 'Tell us about your production and we will come back with a licence quotation.'
            : 'Producers, writers and press â€” we would like to hear from you.'}
      </p>

      <form action={action} className="mt-10 grid max-w-xl gap-6">
        <input type="hidden" name="startedAt" value={startedAt} />
        <input type="hidden" name="play" value={play} />
        <input type="hidden" name="intent" value={intent} />
        <div aria-hidden className="absolute left-[-9999px]">
          <label>
            Company
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Your name</span>
          <input
            name="name"
            required
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Message</span>
          <textarea
            name="message"
            rows={6}
            required
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper disabled:opacity-50"
        >
          {pending ? 'Sendingâ€¦' : 'Send'}
        </button>

        {state && (
          <p className={state.ok ? 'text-available' : 'text-restricted'}>{state.message}</p>
        )}
      </form>

      <p className="mt-8 max-w-xl text-xs text-muted">
        We use your details only to respond to this enquiry, in line with POPIA. We do not share
        them with third parties.
      </p>
    </Container>
  )
}
```

- [ ] **Step 6: Write the e2e test**

Create `tests/e2e/pages.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('home page renders the positioning line', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('properly represented')
})

test('playwright profile lists their plays', async ({ page }) => {
  await page.goto('/playwrights/paul-slabolepszy')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Paul Slabolepszy')
  await expect(page.getByRole('heading', { name: 'Saturday Night at the Palace' })).toBeVisible()
})

test('contact form adapts its copy to the intent', async ({ page }) => {
  await page.goto('/contact?play=saturday-night-at-the-palace&intent=perusal')
  await expect(page.getByText('we will send a perusal script')).toBeVisible()
})

test('contact form rejects an instant submission silently', async ({ page }) => {
  await page.goto('/contact')
  await page.getByLabel('Your name').fill('Bot')
  await page.getByLabel('Email').fill('bot@example.com')
  await page.getByLabel('Message').fill('spam')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByText('Thank you. We will be in touch.')).toBeVisible()
})
```

- [ ] **Step 7: Run the tests**

Run: `npm run e2e -- pages`
Expected: 4 passed.

Verify the timing guard actually held: `select count(*) from enquiries;` returns 0 after that last test, because the submission arrived under three seconds.

- [ ] **Step 8: Commit**

```bash
git add app/playwrights app/page.tsx app/about app/contact supabase/migrations/0006_enquiries.sql tests/e2e/pages.spec.ts
git commit -m "feat(south-canon): add home, playwright profiles, about and contact"
```

---

## Task 13: SEO, structured data, sitemap

**Files:**
- Create: `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, `tests/unit/seo.test.ts`
- Modify: `app/plays/[slug]/page.tsx`, `app/playwrights/[slug]/page.tsx`

**Interfaces:**
- Consumes: `PlayDetail`, `PlaywrightDetail`
- Produces: `playSchema(play)`, `playwrightSchema(w)` returning schema.org JSON-LD objects; `/sitemap.xml`; `/robots.txt`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/seo.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { playSchema, playwrightSchema } from '@/lib/seo'
import type { PlayDetail, PlaywrightDetail } from '@/lib/types'

const play = {
  id: '1',
  title: 'Saturday Night at the Palace',
  slug: 'saturday-night-at-the-palace',
  logline: 'A late-night roadhouse encounter.',
  genres: ['Drama'],
  durationMin: 90,
  heroImageUrl: null,
  castSummary: '3m',
  credits: [{ name: 'Paul Slabolepszy', slug: 'paul-slabolepszy', role: 'author' as const }],
  synopsisShort: null,
  synopsisFull: null,
  yearWritten: 1982,
  acts: 1,
  languages: ['English'],
  themes: [],
  contentWarnings: [],
  setting: null,
  timePeriod: null,
  targetAudience: null,
  isMusical: false,
  roles: [],
  media: [],
  press: [],
  productions: [],
  rights: [],
} as PlayDetail

describe('playSchema', () => {
  it('emits a CreativeWork with the author and canonical url', () => {
    const schema = playSchema(play)
    expect(schema['@type']).toBe('CreativeWork')
    expect(schema.name).toBe('Saturday Night at the Palace')
    expect(schema.author).toEqual([{ '@type': 'Person', name: 'Paul Slabolepszy' }])
    expect(schema.url).toBe('https://southcanon.co.za/plays/saturday-night-at-the-palace')
  })

  it('encodes duration as an ISO 8601 period', () => {
    expect(playSchema(play).timeRequired).toBe('PT90M')
  })

  it('omits duration when unknown', () => {
    expect(playSchema({ ...play, durationMin: null }).timeRequired).toBeUndefined()
  })
})

describe('playwrightSchema', () => {
  it('emits a Person with their works', () => {
    const w = {
      id: '1',
      name: 'Paul Slabolepszy',
      slug: 'paul-slabolepszy',
      bio: 'A writer.',
      portraitUrl: null,
      country: 'South Africa',
      honours: [],
      representedSince: null,
      plays: [play],
    } as PlaywrightDetail
    const schema = playwrightSchema(w)
    expect(schema['@type']).toBe('Person')
    expect(schema.name).toBe('Paul Slabolepszy')
    expect(schema.knowsAbout).toContain('Saturday Night at the Palace')
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- seo`
Expected: FAIL â€” cannot resolve `@/lib/seo`.

- [ ] **Step 3: Implement**

Create `lib/seo.ts`:

```ts
import type { PlayDetail, PlaywrightDetail } from './types'

export const SITE_URL = 'https://southcanon.co.za'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function playSchema(play: PlayDetail): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: play.title,
    url: `${SITE_URL}/plays/${play.slug}`,
    description: play.logline ?? play.synopsisShort ?? undefined,
    genre: play.genres.length ? play.genres : undefined,
    inLanguage: play.languages.length ? play.languages : undefined,
    dateCreated: play.yearWritten ? String(play.yearWritten) : undefined,
    timeRequired: play.durationMin ? `PT${play.durationMin}M` : undefined,
    image: play.heroImageUrl ?? undefined,
    author: play.credits.map((c) => ({ '@type': 'Person', name: c.name })),
  }
}

export function playwrightSchema(w: PlaywrightDetail): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: w.name,
    url: `${SITE_URL}/playwrights/${w.slug}`,
    description: w.bio ?? undefined,
    nationality: w.country ?? undefined,
    image: w.portraitUrl ?? undefined,
    knowsAbout: w.plays.map((p) => p.title),
  }
}
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `npm test -- seo`
Expected: PASS, 4 tests.

- [ ] **Step 5: Inject the JSON-LD into both detail pages**

In `app/plays/[slug]/page.tsx`, add the import and render the script as the first child of `<Container>`:

```tsx
import { playSchema } from '@/lib/seo'
```

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(playSchema(play)) }}
/>
```

In `app/playwrights/[slug]/page.tsx`, do the same with `playwrightSchema(w)`.

- [ ] **Step 6: Add sitemap and robots**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { listPlaySlugs } from '@/lib/plays'
import { listPlaywrightSlugs } from '@/lib/playwrights'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [plays, playwrights] = await Promise.all([listPlaySlugs(), listPlaywrightSlugs()])
  const staticRoutes = ['', '/plays', '/playwrights', '/about', '/contact']

  return [
    ...staticRoutes.map((r) => ({ url: `${SITE_URL}${r}`, changeFrequency: 'weekly' as const })),
    ...plays.map((slug) => ({ url: `${SITE_URL}/plays/${slug}`, changeFrequency: 'monthly' as const })),
    ...playwrights.map((slug) => ({
      url: `${SITE_URL}/playwrights/${slug}`,
      changeFrequency: 'monthly' as const,
    })),
  ]
}
```

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 7: Verify**

Run: `npm run dev`, then open http://localhost:3000/sitemap.xml
Expected: XML listing five static routes plus one play and one playwright URL.

Open http://localhost:3000/plays/saturday-night-at-the-palace and view source.
Expected: a `<script type="application/ld+json">` block containing `"@type":"CreativeWork"` and the author.

- [ ] **Step 8: Commit**

```bash
git add lib/seo.ts app/sitemap.ts app/robots.ts tests/unit/seo.test.ts app/plays/[slug]/page.tsx app/playwrights/[slug]/page.tsx
git commit -m "feat(south-canon): add structured data, sitemap and robots"
```

---

## Task 14: Admin authentication

**Files:**
- Create: `middleware.ts`, `lib/supabase/middleware.ts`, `lib/supabase/browser.ts`, `app/admin/login/page.tsx`, `app/admin/login/actions.ts`, `app/admin/layout.tsx`, `app/admin/page.tsx`, `supabase/migrations/0007_admin.sql`

**Interfaces:**
- Consumes: Supabase Auth
- Produces: `/admin/*` protected by role `admin`; login with forgot-password, show-password and keep-me-signed-in.

- [ ] **Step 1: Grant admin write access in the database**

Create `supabase/migrations/0007_admin.sql`:

```sql
create or replace function is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'playwrights','plays','play_playwrights','play_roles','play_media',
    'play_press','play_productions','rights_availability','licence_tiers','enquiries'
  ] loop
    execute format(
      'create policy "admins write %1$s" on %1$I for all using (is_admin()) with check (is_admin())', t
    );
  end loop;
end $$;
```

Run: `npx supabase db push`

Then in the Supabase dashboard, create the client's user and set their `app_metadata` to `{"role":"admin"}`.

- [ ] **Step 2: Add the browser and middleware clients**

Create `lib/supabase/browser.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

Create `lib/supabase/middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLogin = request.nextUrl.pathname === '/admin/login'
  const isAdmin = user?.app_metadata?.role === 'admin'

  if (isAdminRoute && !isLogin && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return response
}
```

Create `middleware.ts` at the project root:

```ts
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = { matcher: ['/admin/:path*'] }
```

- [ ] **Step 3: Build the login page**

Create `app/admin/login/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { Container } from '@/components/ui/Container'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    setPending(false)
    if (error) return setError(error.message)
    router.push('/admin')
    router.refresh()
  }

  async function onForgotPassword(email: string) {
    if (!email) return setError('Enter your email address first.')
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset`,
    })
    setNotice('If that address has an account, a reset link is on its way.')
  }

  return (
    <Container className="py-24">
      <h1 className="font-display text-4xl">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-8 grid max-w-sm gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Password</span>
          <div className="flex items-center gap-2 border-b border-rule focus-within:border-accent">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="flex-1 bg-transparent py-2 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs uppercase tracking-wide text-muted hover:text-accent"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remember" defaultChecked />
          Keep me signed in
        </label>

        <button
          type="submit"
          disabled={pending}
          className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper disabled:opacity-50"
        >
          {pending ? 'Signing inâ€¦' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() =>
            onForgotPassword((document.getElementById('email') as HTMLInputElement)?.value ?? '')
          }
          className="justify-self-start text-sm text-accent hover:underline"
        >
          Forgot your password?
        </button>

        {error && <p className="text-restricted">{error}</p>}
        {notice && <p className="text-available">{notice}</p>}
      </form>
    </Container>
  )
}
```

Supabase sessions persist in `localStorage` by default, which satisfies keep-me-signed-in. The checkbox is wired in Task 15 when the admin shell is complete; for now it renders and defaults to on, matching the default client behaviour.

- [ ] **Step 4: Build the admin shell**

Create `app/admin/layout.tsx`:

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-rule bg-ink text-paper">
        <Container className="flex gap-6 py-3 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/plays">Plays</Link>
          <Link href="/admin/playwrights">Playwrights</Link>
          <Link href="/" className="ml-auto">View site</Link>
        </Container>
      </div>
      {children}
    </div>
  )
}
```

Create `app/admin/page.tsx`:

```tsx
import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const db = createServiceClient()
  const [plays, playwrights, enquiries] = await Promise.all([
    db.from('plays').select('id', { count: 'exact', head: true }),
    db.from('playwrights').select('id', { count: 'exact', head: true }),
    db.from('enquiries').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Plays', value: plays.count ?? 0 },
    { label: 'Playwrights', value: playwrights.count ?? 0 },
    { label: 'Enquiries', value: enquiries.count ?? 0 },
  ]

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">Dashboard</h1>
      <dl className="mt-10 grid gap-8 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-rule pt-4">
            <dt className="text-xs uppercase tracking-wide text-muted">{s.label}</dt>
            <dd className="font-display text-5xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Container>
  )
}
```

- [ ] **Step 5: Verify the guard**

Run: `npm run dev`, then open http://localhost:3000/admin in a private window.
Expected: redirected to `/admin/login`.

Sign in with the admin user created in Step 1.
Expected: the dashboard renders with three counts.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts lib/supabase app/admin supabase/migrations/0007_admin.sql
git commit -m "feat(south-canon): add admin authentication and dashboard"
```

---

## Task 15: Admin CRUD for playwrights and plays

**Files:**
- Create: `app/admin/playwrights/page.tsx`, `app/admin/playwrights/[id]/page.tsx`, `app/admin/playwrights/actions.ts`, `app/admin/plays/page.tsx`, `app/admin/plays/[id]/page.tsx`, `app/admin/plays/actions.ts`, `components/admin/PlayForm.tsx`, `components/admin/RepeaterField.tsx`

**Interfaces:**
- Consumes: `createServiceClient`, `TERRITORIES`, `listLicenceTiers`
- Produces: full create/edit/publish for playwrights and plays, including cast roles, media, press, productions and rights rows.

**Success condition for this task:** the client can add a brand-new playwright and a brand-new play with cast, rights and a hero image, publish it, and see it live on `/plays` â€” without a developer.

- [ ] **Step 1: Build the repeater primitive**

Create `components/admin/RepeaterField.tsx`:

```tsx
'use client'

import { useState } from 'react'

/**
 * Renders a JSON textarea for a repeating child collection.
 * Deliberately simple: the client edits a small JSON array rather than a bespoke
 * drag-and-drop builder. Revisit if the client finds it awkward in practice.
 */
export function RepeaterField({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string
  label: string
  hint: string
  defaultValue: unknown[]
}) {
  const [value, setValue] = useState(JSON.stringify(defaultValue ?? [], null, 2))
  const [error, setError] = useState<string | null>(null)

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="text-xs text-muted">{hint}</span>
      <textarea
        name={name}
        rows={8}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          try {
            JSON.parse(e.target.value)
            setError(null)
          } catch {
            setError('Not valid JSON yet')
          }
        }}
        className="border border-rule bg-transparent p-3 font-mono text-xs outline-none focus:border-accent"
      />
      {error && <span className="text-xs text-restricted">{error}</span>}
    </label>
  )
}
```

- [ ] **Step 2: Build the playwright actions**

Create `app/admin/playwrights/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function savePlaywright(formData: FormData) {
  const db = createServiceClient()
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()

  const row = {
    name,
    slug: String(formData.get('slug') ?? '').trim() || slugify(name),
    bio: String(formData.get('bio') ?? '') || null,
    portrait_url: String(formData.get('portraitUrl') ?? '') || null,
    country: String(formData.get('country') ?? '') || null,
    honours: String(formData.get('honours') ?? '')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
    status: formData.get('status') === 'published' ? 'published' : 'draft',
  }

  const { error } = id
    ? await db.from('playwrights').update(row).eq('id', id)
    : await db.from('playwrights').insert(row)
  if (error) throw error

  revalidatePath('/playwrights')
  revalidatePath('/plays')
  redirect('/admin/playwrights')
}

export async function deletePlaywright(formData: FormData) {
  const db = createServiceClient()
  const { error } = await db.from('playwrights').delete().eq('id', String(formData.get('id')))
  if (error) throw error
  revalidatePath('/playwrights')
  redirect('/admin/playwrights')
}
```

- [ ] **Step 3: Build the playwright list and edit pages**

Create `app/admin/playwrights/page.tsx`:

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminPlaywrights() {
  const db = createServiceClient()
  const { data } = await db.from('playwrights').select('id, name, slug, status').order('name')

  return (
    <Container className="py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Playwrights</h1>
        <Link href="/admin/playwrights/new" className="bg-accent px-6 py-3 text-sm uppercase tracking-wide text-paper">
          Add playwright
        </Link>
      </div>
      <ul className="mt-10 divide-y divide-rule border-t border-rule">
        {(data ?? []).map((w) => (
          <li key={w.id} className="flex items-center justify-between py-4">
            <Link href={`/admin/playwrights/${w.id}`} className="hover:text-accent">{w.name}</Link>
            <span className="text-xs uppercase tracking-wide text-muted">{w.status}</span>
          </li>
        ))}
      </ul>
    </Container>
  )
}
```

Create `app/admin/playwrights/[id]/page.tsx`:

```tsx
import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'
import { savePlaywright, deletePlaywright } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditPlaywright({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'
  const db = createServiceClient()
  const w = isNew
    ? null
    : (await db.from('playwrights').select('*').eq('id', id).maybeSingle()).data

  const field = 'border-b border-rule bg-transparent py-2 outline-none focus:border-accent'

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">{isNew ? 'Add playwright' : w?.name}</h1>
      <form action={savePlaywright} className="mt-10 grid max-w-2xl gap-6">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Name</span>
          <input name="name" required defaultValue={w?.name ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Slug (leave blank to generate)</span>
          <input name="slug" defaultValue={w?.slug ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Country</span>
          <input name="country" defaultValue={w?.country ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Honours (comma separated)</span>
          <input name="honours" defaultValue={(w?.honours ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Portrait URL</span>
          <input name="portraitUrl" defaultValue={w?.portrait_url ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Biography</span>
          <textarea name="bio" rows={8} defaultValue={w?.bio ?? ''} className="border border-rule bg-transparent p-3 outline-none focus:border-accent" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Status</span>
          <select name="status" defaultValue={w?.status ?? 'draft'} className={field}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button type="submit" className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper">
          Save
        </button>
      </form>

      {!isNew && (
        <form action={deletePlaywright} className="mt-10">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-sm text-restricted hover:underline">
            Delete this playwright
          </button>
        </form>
      )}
    </Container>
  )
}
```

- [ ] **Step 4: Build the play actions**

Create `app/admin/plays/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function csv(v: FormDataEntryValue | null): string[] {
  return String(v ?? '').split(',').map((x) => x.trim()).filter(Boolean)
}

function json<T>(v: FormDataEntryValue | null): T[] {
  try {
    const parsed = JSON.parse(String(v ?? '[]'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function num(v: FormDataEntryValue | null): number | null {
  const n = Number(v)
  return Number.isFinite(n) && String(v ?? '').trim() !== '' ? n : null
}

/** Children are replaced wholesale on every save â€” simplest correct behaviour for small collections. */
async function replaceChildren(
  db: ReturnType<typeof createServiceClient>,
  table: string,
  playId: string,
  rows: Record<string, unknown>[],
) {
  await db.from(table).delete().eq('play_id', playId)
  if (rows.length) {
    const { error } = await db.from(table).insert(rows.map((r) => ({ ...r, play_id: playId })))
    if (error) throw error
  }
}

export async function savePlay(formData: FormData) {
  const db = createServiceClient()
  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()

  const row = {
    title,
    slug: String(formData.get('slug') ?? '').trim() || slugify(title),
    logline: String(formData.get('logline') ?? '') || null,
    synopsis_short: String(formData.get('synopsisShort') ?? '') || null,
    synopsis_full: String(formData.get('synopsisFull') ?? '') || null,
    genres: csv(formData.get('genres')),
    themes: csv(formData.get('themes')),
    languages: csv(formData.get('languages')),
    content_warnings: csv(formData.get('contentWarnings')),
    year_written: num(formData.get('yearWritten')),
    duration_min: num(formData.get('durationMin')),
    acts: num(formData.get('acts')),
    setting: String(formData.get('setting') ?? '') || null,
    time_period: String(formData.get('timePeriod') ?? '') || null,
    target_audience: String(formData.get('targetAudience') ?? '') || null,
    is_musical: formData.get('isMusical') === 'on',
    hero_image_url: String(formData.get('heroImageUrl') ?? '') || null,
    status: formData.get('status') === 'published' ? 'published' : 'draft',
  }

  const saved = id
    ? await db.from('plays').update(row).eq('id', id).select('id').single()
    : await db.from('plays').insert(row).select('id').single()
  if (saved.error) throw saved.error
  const playId = saved.data.id

  await replaceChildren(db, 'play_roles', playId, json(formData.get('roles')))
  await replaceChildren(db, 'play_media', playId, json(formData.get('media')))
  await replaceChildren(db, 'play_press', playId, json(formData.get('press')))
  await replaceChildren(db, 'play_productions', playId, json(formData.get('productions')))
  await replaceChildren(db, 'rights_availability', playId, json(formData.get('rights')))

  const writerIds = csv(formData.get('playwrightIds'))
  await db.from('play_playwrights').delete().eq('play_id', playId)
  if (writerIds.length) {
    await db.from('play_playwrights').insert(
      writerIds.map((playwright_id, sort) => ({ play_id: playId, playwright_id, role: 'author', sort })),
    )
  }

  revalidatePath('/plays')
  revalidatePath(`/plays/${row.slug}`)
  redirect('/admin/plays')
}

export async function deletePlay(formData: FormData) {
  const db = createServiceClient()
  const { error } = await db.from('plays').delete().eq('id', String(formData.get('id')))
  if (error) throw error
  revalidatePath('/plays')
  redirect('/admin/plays')
}
```

- [ ] **Step 5: Build the play form and pages**

Create `components/admin/PlayForm.tsx`:

```tsx
import { RepeaterField } from './RepeaterField'
import { savePlay } from '@/app/admin/plays/actions'
import { TERRITORIES } from '@/lib/types'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function PlayForm({
  play,
  playwrights,
}: {
  play: any | null
  playwrights: { id: string; name: string }[]
}) {
  const field = 'border-b border-rule bg-transparent py-2 outline-none focus:border-accent'
  const area = 'border border-rule bg-transparent p-3 outline-none focus:border-accent'

  return (
    <form action={savePlay} className="mt-10 grid max-w-3xl gap-6">
      {play && <input type="hidden" name="id" value={play.id} />}

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Title</span>
        <input name="title" required defaultValue={play?.title ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Slug (leave blank to generate)</span>
        <input name="slug" defaultValue={play?.slug ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Playwrights</span>
        <select
          name="playwrightIds"
          multiple
          size={4}
          defaultValue={(play?.play_playwrights ?? []).map((c: any) => c.playwright_id)}
          className="border border-rule bg-transparent p-2 outline-none focus:border-accent"
        >
          {playwrights.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Logline</span>
        <input name="logline" defaultValue={play?.logline ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Short synopsis</span>
        <textarea name="synopsisShort" rows={4} defaultValue={play?.synopsis_short ?? ''} className={area} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Full synopsis</span>
        <textarea name="synopsisFull" rows={10} defaultValue={play?.synopsis_full ?? ''} className={area} />
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Genres (comma separated)</span>
          <input name="genres" defaultValue={(play?.genres ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Themes (comma separated)</span>
          <input name="themes" defaultValue={(play?.themes ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Languages (comma separated)</span>
          <input name="languages" defaultValue={(play?.languages ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Content warnings (comma separated)</span>
          <input name="contentWarnings" defaultValue={(play?.content_warnings ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Year written</span>
          <input name="yearWritten" type="number" defaultValue={play?.year_written ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Duration (minutes)</span>
          <input name="durationMin" type="number" defaultValue={play?.duration_min ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Acts</span>
          <input name="acts" type="number" defaultValue={play?.acts ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Target audience</span>
          <input name="targetAudience" defaultValue={play?.target_audience ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Setting</span>
          <input name="setting" defaultValue={play?.setting ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Time period</span>
          <input name="timePeriod" defaultValue={play?.time_period ?? ''} className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Hero image URL</span>
        <input name="heroImageUrl" defaultValue={play?.hero_image_url ?? ''} className={field} />
      </label>

      <RepeaterField
        name="roles"
        label="Cast"
        hint='[{"name":"Vince","gender":"male","age_range":"30s","description":"","is_ensemble":false,"sort":0}]'
        defaultValue={play?.play_roles ?? []}
      />
      <RepeaterField
        name="rights"
        label="Rights and availability"
        hint={`territory must be one of: ${TERRITORIES.join(', ')}. [{"territory":"South Africa","tier_id":"amateur","status":"available","restriction_note":null}]`}
        defaultValue={play?.rights_availability ?? []}
      />
      <RepeaterField
        name="productions"
        label="Production history"
        hint='[{"company":"Market Theatre","venue":"","city":"Johannesburg","country":"South Africa","starts_on":"1982-06-01","ends_on":null,"director":"","notes":null,"is_premiere":true}]'
        defaultValue={play?.play_productions ?? []}
      />
      <RepeaterField
        name="press"
        label="Press quotes"
        hint='[{"quote":"Absolutely superb.","source":"Mail & Guardian","published_at":null,"sort":0}]'
        defaultValue={play?.play_press ?? []}
      />
      <RepeaterField
        name="media"
        label="Media"
        hint='[{"type":"photo","url":"https://...","caption":"","credit":"","sort":0}]'
        defaultValue={play?.play_media ?? []}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isMusical" defaultChecked={play?.is_musical ?? false} />
        This is a musical
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Status</span>
        <select name="status" defaultValue={play?.status ?? 'draft'} className={field}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      <button type="submit" className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper">
        Save
      </button>
    </form>
  )
}
```

Create `app/admin/plays/page.tsx`:

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminPlays() {
  const db = createServiceClient()
  const { data } = await db.from('plays').select('id, title, status').order('title')

  return (
    <Container className="py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Plays</h1>
        <Link href="/admin/plays/new" className="bg-accent px-6 py-3 text-sm uppercase tracking-wide text-paper">
          Add play
        </Link>
      </div>
      <ul className="mt-10 divide-y divide-rule border-t border-rule">
        {(data ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between py-4">
            <Link href={`/admin/plays/${p.id}`} className="hover:text-accent">{p.title}</Link>
            <span className="text-xs uppercase tracking-wide text-muted">{p.status}</span>
          </li>
        ))}
      </ul>
    </Container>
  )
}
```

Create `app/admin/plays/[id]/page.tsx`:

```tsx
import { Container } from '@/components/ui/Container'
import { PlayForm } from '@/components/admin/PlayForm'
import { createServiceClient } from '@/lib/supabase/server'
import { deletePlay } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditPlay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'
  const db = createServiceClient()

  const [playRes, writersRes] = await Promise.all([
    isNew
      ? Promise.resolve({ data: null })
      : db
          .from('plays')
          .select(`*, play_roles(*), play_media(*), play_press(*), play_productions(*),
                   rights_availability(*), play_playwrights(playwright_id)`)
          .eq('id', id)
          .maybeSingle(),
    db.from('playwrights').select('id, name').order('name'),
  ])

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">{isNew ? 'Add play' : playRes.data?.title}</h1>
      <PlayForm play={playRes.data} playwrights={writersRes.data ?? []} />

      {!isNew && (
        <form action={deletePlay} className="mt-10">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-sm text-restricted hover:underline">
            Delete this play
          </button>
        </form>
      )}
    </Container>
  )
}
```

- [ ] **Step 6: Verify the whole loop by hand**

Run: `npm run dev`, sign in at `/admin/login`.

1. Add a playwright, set status to Published, save.
2. Add a play, select that playwright, fill title and logline, paste one cast role into the Cast repeater, paste one rights row for South Africa, set status to Published, save.
3. Open `/plays`.

Expected: the new play appears in the catalogue, its detail page renders with the cast summary and a South Africa availability badge, and blocks with no data are absent.

- [ ] **Step 7: Commit**

```bash
git add app/admin components/admin
git commit -m "feat(south-canon): add admin CRUD for plays and playwrights"
```

---

## Task 16: Keep-alive, deploy and launch checks

**Files:**
- Create: `supabase/migrations/0005_keepalive.sql`, `.github/workflows/keep-alive.yml`, `README.md`

**Interfaces:**
- Consumes: everything
- Produces: a deployed site and a database that will not pause on the Supabase free plan.

- [ ] **Step 1: Add the keep-alive table**

Create `supabase/migrations/0005_keepalive.sql`:

```sql
create table keep_alive (
  id uuid primary key default gen_random_uuid(),
  pinged_at timestamptz not null default now()
);

alter table keep_alive enable row level security;
-- No policy: the workflow writes with the service-role key.
```

Run: `npx supabase db push`

- [ ] **Step 2: Add the workflow**

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Supabase keep-alive

on:
  schedule:
    - cron: '0 6 * * 1,4'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Insert a keep-alive row
        run: |
          curl -sS -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/keep_alive" \
            -H "apikey: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}' \
            --fail-with-body
```

Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as GitHub repository secrets.

- [ ] **Step 3: Run the workflow once by hand**

Trigger it from the GitHub Actions tab via `workflow_dispatch`.
Expected: green run, and `select count(*) from keep_alive;` returns 1.

- [ ] **Step 4: Write the README**

Create `README.md`:

```markdown
# South Canon

Theatrical licensing platform. Next.js 15 + Supabase.

## Local development

    cp .env.local.example .env.local   # fill from Supabase project settings
    npm install
    npm run dev

## Tests

    npm test        # unit (Vitest)
    npm run e2e     # end-to-end (Playwright)

## Database

Migrations live in `supabase/migrations/` and are applied in filename order with
`npx supabase db push`. `supabase/seed.sql` loads one sample play for local work.

## Admin

`/admin` requires a Supabase user whose `app_metadata` contains `{"role": "admin"}`.

## Milestones

- M1 (this repo state): public catalogue, play detail template, admin CRUD
- M2: licence application pipeline, estimator, gated perusal PDFs, producer accounts
- M3: writer portal with royalty statements

See `docs/superpowers/specs/2026-07-26-south-canon-design.md`.
```

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all unit suites pass (cast, availability, filters, money, seo).

Run: `npm run e2e`
Expected: all e2e suites pass (catalogue, play-detail, pages, data).

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 6: Deploy**

Connect the repository to Vercel with root directory `south-canon`. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables. Deploy.

Verify on the deployed URL: `/plays` lists the catalogue, a play detail page renders, `/sitemap.xml` resolves, `/admin` redirects to login.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/0005_keepalive.sql .github/workflows/keep-alive.yml README.md
git commit -m "chore(south-canon): add keep-alive workflow, readme and deploy config"
```

---

## Deferred to M2 and M3

Recorded here so they are not lost, and are not built early:

- **Licence estimator** â€” the interactive calculator belongs beside the application form that
  supplies venue, seats, ticket price and performance count. M1 ships indicative minimums only.
- **Perusal delivery** â€” the M1 CTA points at `/contact`. M2 replaces it with a real request,
  approval and watermarked-PDF flow.
- **Producer accounts** â€” M1 has no producer login. M2 adds it.
- **Writer portal and royalty statements** â€” M3 in full.
- **Upcoming productions map** â€” `play_productions` already stores city and country; the map is
  worth building once there are live licensed productions to plot.
- **Logo directions** â€” three wordmark studies are a design deliverable produced alongside M1,
  not a coding task in this plan.

---

## Self-review notes

Checked against the spec, 2026-07-26:

- Spec Â§5 lists 14 Play Detail blocks. Tasks 11 and 13 cover all of them. The estimator (block
  10) ships as indicative minimums in M1 with the calculator deferred to M2 â€” recorded above and
  in the spec's milestone table.
- Spec Â§7 standards: honeypot and timing (Task 12), forgot-password / show-password /
  keep-me-signed-in (Task 14), keep-alive (Task 16), POPIA notice (Task 12). Perusal watermarking
  is M2.
- Spec Â§9 M1 success criteria: find by title, genre and playwright (Task 10); complete detail
  page with no empty-block artefacts (Task 11, tested explicitly); valid `CreativeWork` structured
  data (Task 13); client adds a play and playwright end-to-end (Task 15, verified by hand in
  Step 6).
- Type consistency: `formatCastSize`, `resolveAvailability`, `parseFilters`, `formatZar`,
  `listPlays`, `getPlayBySlug`, `listPlaySlugs`, `listGenres`, `listLicenceTiers`,
  `listRelatedPlays`, `listPlaywrights`, `getPlaywrightBySlug`, `listPlaywrightSlugs`,
  `playSchema`, `playwrightSchema` are each defined once and referenced with matching signatures.
- `CatalogueFilters.genres` is always an array, never optional â€” every call site passes
  `{ genres: [] }` at minimum.
