# Woodpecker Guesthouse — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the public Woodpecker Guesthouse site — Next.js + Supabase, all 12 public pages rendering real (or honestly-stubbed) content, Nightsbridge booking, WhatsApp, SEO/GEO, and deploy/ops — as a working, deployable site. Admin CRUD (Plan B) and the AI blog pipeline (Plan C) build on top of this afterward.

**Architecture:** Next.js App Router (TypeScript) reading from Supabase Postgres via a public anon-key client (RLS: public read on published rows). Rooms and gallery images are data-driven from Supabase, not hardcoded, so Plan B's admin UI can manage them without touching page code. Tailwind v4 CSS-first theming (`@theme` tokens in `globals.css`) implements the "Elevated Woodpecker" direction from the design spec.

**Tech Stack:** Next.js 16.2.1, React 19.2.4, TypeScript, Tailwind CSS v4, `@supabase/supabase-js`, Resend (contact email), `next/font/google` (Fraunces + Figtree), Vercel.

**Spec:** `docs/superpowers/specs/2026-08-13-woodpecker-guesthouse-design.md`

## Global Constraints

- **Repo location:** `woodpecker-guesthouse/` at the Antigravity monorepo root. Branch: `feat/woodpecker-guesthouse` (already created).
- **Language:** TypeScript (`.ts`/`.tsx`), App Router, `src/` layout — matches dianas-bulbinella/lublaw/aloe-signs-website conventions, not mountaincreek-lodge's `.js`.
- **Package versions pinned to match sibling projects exactly:** `next@16.2.1`, `react@19.2.4`, `react-dom@19.2.4`, `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `@supabase/supabase-js@^2.110.8`, `resend@^6.18.0`.
- **No test framework installed** — no sibling project in this portfolio (joetsie-lodge, mountaincreek-lodge, dianas-bulbinella, lublaw) has Jest/Vitest/RTL. Follow that house convention rather than introducing one: pure-logic helpers (anti-bot check, slug utilities) get real unit tests via Node's built-in `node --test` (ships with Node 20+, zero new dependency). Pages/components are verified by `npm run build` passing plus starting the dev server and checking the actual rendered output — per CLAUDE.md's Verification-Layer Discipline ("verify against reality, not vibes").
- **No fabricated content.** Where real data isn't available yet (5 of 8 rooms have no scraped copy; Nightsbridge property ID; real photography), the code must render an honest, clearly-labeled fallback state — never invented specifics (fake bed counts, fake amenities, fake property IDs). Real content lands via the WP export once the client hands it over, edited through Plan B's admin UI.
- **Design tokens are final for this pass** (client chose to skip the 3-mockup step and build directly from spec §5's direction) — see Task 2.
- **SA English spelling** throughout copy ("organise", "colour", "programme").
- **Every commit only stages files this plan created/touched** — this branch was cut from `feat/knp-panorama`, which has unrelated uncommitted WIP across other projects. Never `git add -A` or `git add .`; always add explicit paths.

---

### Task 1: Project Scaffold & Config

**Files:**
- Create: `woodpecker-guesthouse/package.json`
- Create: `woodpecker-guesthouse/next.config.ts`
- Create: `woodpecker-guesthouse/tsconfig.json`
- Create: `woodpecker-guesthouse/postcss.config.mjs`
- Create: `woodpecker-guesthouse/.env.example`
- Create: `woodpecker-guesthouse/.gitignore`
- Create: `woodpecker-guesthouse/src/app/layout.tsx` (minimal placeholder, fleshed out in Task 5)
- Create: `woodpecker-guesthouse/src/app/page.tsx` (minimal placeholder, fleshed out in Task 7)

**Interfaces:**
- Produces: `@/*` path alias → `src/*`, `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `RESEND_API_KEY` / `CONTACT_TO_EMAIL` / `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID` env var names (all later tasks consume these exact names).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "woodpecker-guesthouse",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.110.8",
    "next": "16.2.1",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "resend": "^6.18.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5.7"
  }
}
```

- [ ] **Step 2: Create `next.config.ts`** (Supabase Storage host allow-listed for `next/image`, derived from the env var so it's correct in every environment)

```ts
import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
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
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 5: Create `.env.example`**

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
# Full property ID from the client's Nightsbridge dashboard (see Task 6).
# Leave unset locally to see the honest fallback state.
NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID=
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules
.next
.env
.env.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: Create placeholder `src/app/layout.tsx` and `src/app/page.tsx`** so `next build` has something to compile

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
export default function HomePage() {
  return <main>Woodpecker Guesthouse</main>;
}
```

- [ ] **Step 8: Install and verify the build**

Run (from `woodpecker-guesthouse/`): `npm install && npm run build`
Expected: build completes, `.next` output produced, no errors.

- [ ] **Step 9: Commit**

```bash
git add woodpecker-guesthouse/package.json woodpecker-guesthouse/package-lock.json woodpecker-guesthouse/next.config.ts woodpecker-guesthouse/tsconfig.json woodpecker-guesthouse/postcss.config.mjs woodpecker-guesthouse/.env.example woodpecker-guesthouse/.gitignore woodpecker-guesthouse/src/app/layout.tsx woodpecker-guesthouse/src/app/page.tsx
git commit -m "chore(woodpecker-guesthouse): scaffold Next.js project"
```

---

### Task 2: Design Tokens & Global Styles

**Files:**
- Create: `woodpecker-guesthouse/src/app/globals.css`

**Interfaces:**
- Produces: CSS custom properties `--paper`, `--surface`, `--surface-2`, `--ink`, `--muted`, `--line`, `--olive`, `--olive-deep`, `--terracotta`, `--terracotta-deep`, `--sand`, and Tailwind color utilities `bg-paper`, `text-ink`, `text-olive`, `bg-terracotta`, etc. (used by every later page/component task). Font variables `--font-display` (Fraunces), `--font-sans` (Figtree) — wired to actual fonts in Task 5's `layout.tsx`.

- [ ] **Step 1: Create `globals.css`**

```css
@import "tailwindcss";

/* Woodpecker Guesthouse — "Elevated Woodpecker" design tokens.
   Warm bushveld neutrals + olive/terracotta/sand accents — deliberately
   warmer than Booklium's stark black-and-cream, to keep the site's
   affordable, family, nature-lodge tone. See design spec §5. */
:root {
  --paper: #fcf9f4;
  --surface: #f5efe4;
  --surface-2: #ede3d2;
  --ink: #2b2620;
  --muted: #6b6255;
  --line: #e3d7c3;
  --olive: #6e7b4f;
  --olive-deep: #565f3d;
  --terracotta: #c1662f;
  --terracotta-deep: #a34f21;
  --sand: #d9c7a8;
}

@theme inline {
  --color-paper: var(--paper);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-olive: var(--olive);
  --color-olive-deep: var(--olive-deep);
  --color-terracotta: var(--terracotta);
  --color-terracotta-deep: var(--terracotta-deep);
  --color-sand: var(--sand);
  --font-display: var(--font-fraunces);
  --font-sans: var(--font-figtree);
}

body {
  background: var(--paper);
  color: var(--ink);
}
```

- [ ] **Step 2: Wire the stylesheet into the placeholder layout**

Edit `src/app/layout.tsx` from Task 1, add the import:

```tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build succeeds with no unresolved `@theme`/token errors.

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/src/app/globals.css woodpecker-guesthouse/src/app/layout.tsx
git commit -m "feat(woodpecker-guesthouse): add Elevated Woodpecker design tokens"
```

---

### Task 3: Supabase Schema & RLS

**Files:**
- Create: `woodpecker-guesthouse/supabase/migrations/0001_init.sql`

**Interfaces:**
- Produces: tables `public.rooms`, `public.gallery_categories`, `public.gallery_images`, `public.keep_alive`. Columns consumed exactly as named by Task 4's data layer: `rooms(id, slug, name, description, bed_type, bedrooms, bathrooms, max_guests, rate_from, amenities, hero_image, gallery_images, sort_order, published, created_at, updated_at)`; `gallery_categories(id, name, sort_order)`; `gallery_images(id, src, alt, category_id, sort_order, created_at)`.

- [ ] **Step 1: Write the migration**

```sql
-- Woodpecker Guesthouse — initial schema (rooms, gallery, keep-alive).
-- Run in the Supabase SQL editor, or `supabase db push`.

create extension if not exists pgcrypto;

-- ─────────────────────────── rooms ───────────────────────────
create table if not exists public.rooms (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text not null default '',
  bed_type     text not null default '',
  bedrooms     int not null default 1,
  bathrooms    int not null default 1,
  max_guests   int not null default 2,
  rate_from    numeric(10,2),
  amenities    text[] not null default '{}',
  hero_image   text,
  gallery_images text[] not null default '{}',
  sort_order   int not null default 0,
  published    boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists rooms_touch on public.rooms;
create trigger rooms_touch before update on public.rooms
  for each row execute function public.touch_updated_at();

-- ─────────────────────────── gallery ───────────────────────────
create table if not exists public.gallery_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text unique not null,
  sort_order int not null default 0
);

create table if not exists public.gallery_images (
  id          uuid primary key default gen_random_uuid(),
  src         text not null,
  alt         text not null default '',
  category_id uuid references public.gallery_categories(id) on delete set null,
  sort_order  int not null default 0,
  created_at  timestamptz default now()
);
create index if not exists gallery_images_category_idx on public.gallery_images (category_id);

-- ─────────────────────────── keep-alive (Supabase free-tier) ───────────────────────────
create table if not exists public.keep_alive (
  id         bigint generated always as identity primary key,
  note       text,
  created_at timestamptz default now()
);

-- ─────────────────────────── RLS: public read on published/all rows ───────────────────────────
-- Staff-write policies are added in Plan B (Admin) once auth exists.
alter table public.rooms              enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_images     enable row level security;
alter table public.keep_alive         enable row level security;

create policy "public read published rooms" on public.rooms
  for select using (published = true);
create policy "public read gallery categories" on public.gallery_categories
  for select using (true);
create policy "public read gallery images" on public.gallery_images
  for select using (true);
```

- [ ] **Step 2: Run the migration**

Run in the Supabase SQL editor for the project's Supabase instance (client to provision, or reuse an existing org per `[[project_monorepo_split]]` capacity rules).
Expected: all four tables + trigger + policies created with no errors. Verify with `select * from public.rooms;` → empty result, no error.

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/supabase/migrations/0001_init.sql
git commit -m "feat(woodpecker-guesthouse): add initial Supabase schema"
```

---

### Task 4: Supabase Data Layer & Seed Script

**Files:**
- Create: `woodpecker-guesthouse/src/lib/types.ts`
- Create: `woodpecker-guesthouse/src/lib/supabase/public.ts`
- Create: `woodpecker-guesthouse/src/lib/rooms.ts`
- Create: `woodpecker-guesthouse/src/lib/gallery.ts`
- Create: `woodpecker-guesthouse/scripts/seed.mjs`

**Interfaces:**
- Consumes: Task 3's table/column names.
- Produces: `Room`, `GalleryCategory`, `GalleryImage` types; `createPublicClient(): SupabaseClient`; `getRooms(): Promise<Room[]>`; `getRoomBySlug(slug: string): Promise<Room | null>`; `getGalleryCategories(): Promise<GalleryCategory[]>`; `getGalleryImages(): Promise<GalleryImage[]>`. Every page task (7–12) consumes these exact function names.

- [ ] **Step 1: Create `src/lib/types.ts`**

```ts
export type Room = {
  id: string;
  slug: string;
  name: string;
  description: string;
  bed_type: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  rate_from: number | null;
  amenities: string[];
  hero_image: string | null;
  gallery_images: string[];
  sort_order: number;
  published: boolean;
};

export type GalleryCategory = {
  id: string;
  name: string;
  sort_order: number;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  category_id: string | null;
  sort_order: number;
};
```

- [ ] **Step 2: Create `src/lib/supabase/public.ts`**

> **Correction (found during implementation):** `createClient(undefined, undefined)` throws synchronously (`supabaseUrl is required`) rather than failing gracefully — confirmed by running it directly. Since no live Supabase project exists for this client yet, every data-driven page would crash at build/request time without a guard. Added `supabasePublicConfigured()` below; `rooms.ts`/`gallery.ts` must check it before calling `createPublicClient()`.

```ts
import { createClient } from "@supabase/supabase-js";

/** True once both public Supabase env vars are set. Guards every data-layer
 *  function below so an unconfigured project (no Supabase provisioned yet)
 *  renders an honest empty state instead of throwing "supabaseUrl is
 *  required" at build/request time. */
export function supabasePublicConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Anon client, no cookies — public reads only (RLS enforces "published"
 *  filtering server-side regardless of what this client requests). Safe to
 *  call from Server Components and build-time generateStaticParams alike.
 *  Only call after checking supabasePublicConfigured(). */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
```

- [ ] **Step 3: Create `src/lib/rooms.ts`**

```ts
import { createPublicClient, supabasePublicConfigured } from "@/lib/supabase/public";
import type { Room } from "@/lib/types";

export async function getRooms(): Promise<Room[]> {
  if (!supabasePublicConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[rooms] getRooms failed:", error.message);
    return [];
  }
  return data as Room[];
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  if (!supabasePublicConfigured()) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error || !data) return null;
  return data as Room;
}
```

- [ ] **Step 4: Create `src/lib/gallery.ts`**

```ts
import { createPublicClient, supabasePublicConfigured } from "@/lib/supabase/public";
import type { GalleryCategory, GalleryImage } from "@/lib/types";

export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  if (!supabasePublicConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("gallery_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[gallery] getGalleryCategories failed:", error.message);
    return [];
  }
  return data as GalleryCategory[];
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!supabasePublicConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[gallery] getGalleryImages failed:", error.message);
    return [];
  }
  return data as GalleryImage[];
}
```

- [ ] **Step 5: Create the seed script**

Seeds only the 3 rooms with real copy from the old site (Deluxe Suite, King Deluxe, Budget). The other 5 known room slugs (Double Room 1–3, Family Room 1–2) are inserted **unpublished**, name-only — real copy comes from the WP export via Plan B's admin, never fabricated here.

```js
// scripts/seed.mjs — run once against a fresh Supabase project: `node scripts/seed.mjs`
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey);

const rooms = [
  {
    slug: "deluxe-suite-room",
    name: "Deluxe Suite Room",
    description:
      "Our luxurious and spacious room can accommodate a maximum of 2 people, with a double bed and en-suite bathroom.",
    bed_type: "Double bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    published: true,
    sort_order: 1,
  },
  {
    slug: "king-deluxe-room",
    name: "King Deluxe Room",
    description:
      "Our luxurious and spacious Deluxe suite is fit for a king, with a king-sized bed and an additional single bed. The largest room at Woodpecker.",
    bed_type: "King bed + single bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 3,
    published: true,
    sort_order: 2,
  },
  {
    slug: "budget-room",
    name: "Budget Room",
    description:
      "Our budget room has a double bed and an en-suite, fully equipped with a fan, TV and DStv — perfect for an overnighter.",
    bed_type: "Double bed",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    amenities: ["Fan", "TV", "DStv"],
    published: true,
    sort_order: 3,
  },
  // Real copy/rates for these 5 pending the client's WP export — deliberately
  // unpublished stubs, not fabricated content.
  { slug: "double-room-1", name: "Double Room 1", published: false, sort_order: 4 },
  { slug: "double-room-2", name: "Double Room 2", published: false, sort_order: 5 },
  { slug: "double-room-3", name: "Double Room 3", published: false, sort_order: 6 },
  { slug: "family-room-1", name: "Family Room 1", published: false, sort_order: 7 },
  { slug: "family-room-2", name: "Family Room 2", published: false, sort_order: 8 },
];

const galleryCategories = [
  { name: "Rooms", sort_order: 1 },
  { name: "Grounds", sort_order: 2 },
  { name: "Restaurant", sort_order: 3 },
  { name: "Conferencing", sort_order: 4 },
];

const { error: roomsError } = await supabase.from("rooms").upsert(rooms, { onConflict: "slug" });
if (roomsError) throw roomsError;
console.log(`Seeded ${rooms.length} rooms.`);

const { error: catError } = await supabase
  .from("gallery_categories")
  .upsert(galleryCategories, { onConflict: "name" });
if (catError) throw catError;
console.log(`Seeded ${galleryCategories.length} gallery categories.`);
```

- [ ] **Step 6: Verify**

Run: `npm run build` (type-checks the new lib files)
Then, with real Supabase env vars set: `node scripts/seed.mjs`
Expected: build passes; seed script logs `Seeded 8 rooms.` / `Seeded 4 gallery categories.` with no errors; `select slug, published from rooms;` in the Supabase SQL editor shows 3 published + 5 unpublished rows.

- [ ] **Step 7: Commit**

```bash
git add woodpecker-guesthouse/src/lib/types.ts woodpecker-guesthouse/src/lib/supabase/public.ts woodpecker-guesthouse/src/lib/rooms.ts woodpecker-guesthouse/src/lib/gallery.ts woodpecker-guesthouse/scripts/seed.mjs
git commit -m "feat(woodpecker-guesthouse): add Supabase data layer and seed script"
```

---

### Task 5: Root Layout, Header, Footer, WhatsApp Button

**Files:**
- Create: `woodpecker-guesthouse/src/components/layout/Header.tsx`
- Create: `woodpecker-guesthouse/src/components/layout/Footer.tsx`
- Create: `woodpecker-guesthouse/src/components/site/WhatsAppButton.tsx`
- Modify: `woodpecker-guesthouse/src/app/layout.tsx`

**Interfaces:**
- Consumes: Task 2's `--font-display`/`--font-sans` tokens.
- Produces: `<Header />`, `<Footer />`, `<WhatsAppButton phone={string} message?={string} />` — used by every page task (all pages render inside `RootLayout`, which wraps `Header`/`Footer`/`WhatsAppButton` once, not per-page).

- [ ] **Step 1: Create `Header.tsx`**

```tsx
import Link from "next/link";

const NAV = [
  { href: "/accommodation", label: "Accommodation" },
  { href: "/conferencing", label: "Conferencing" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/gallery", label: "Gallery" },
  { href: "/attractions", label: "Attractions" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-ink tracking-wide">
          Woodpecker Guesthouse
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink/80">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-terracotta transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `Footer.tsx`**

```tsx
export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-3 text-sm text-muted">
        <div>
          <p className="font-display text-lg text-ink mb-2">Woodpecker Guesthouse</p>
          <p>Hazyview, Mpumalanga — gateway to the Kruger National Park and the Panorama Route.</p>
        </div>
        <div>
          <p className="text-ink font-medium mb-2">Explore</p>
          <ul className="space-y-1">
            <li><a href="/accommodation" className="hover:text-terracotta">Accommodation</a></li>
            <li><a href="/conferencing" className="hover:text-terracotta">Conferencing</a></li>
            <li><a href="/attractions" className="hover:text-terracotta">Attractions</a></li>
          </ul>
        </div>
        <div>
          <p className="text-ink font-medium mb-2">Legal</p>
          <ul className="space-y-1">
            <li><a href="/privacy-policy" className="hover:text-terracotta">Privacy Policy</a></li>
            <li><a href="/terms-conditions" className="hover:text-terracotta">Terms &amp; Conditions</a></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-muted pb-6">
        © {new Date().getFullYear()} Woodpecker Guesthouse. All rights reserved.
      </p>
    </footer>
  );
}
```

- [ ] **Step 3: Create `WhatsAppButton.tsx`**

```tsx
type Props = {
  phone: string; // digits only, international format e.g. "27831234567"
  message?: string;
};

export default function WhatsAppButton({ phone, message = "Hi, I'd like to enquire about Woodpecker Guesthouse" }: Props) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.03h-.01a8.1 8.1 0 0 1-4.14-1.14l-.3-.18-3.13.82.84-3.05-.19-.31a8.07 8.07 0 0 1-1.24-4.26c0-4.47 3.64-8.1 8.12-8.1 2.17 0 4.2.84 5.73 2.38a8.05 8.05 0 0 1 2.38 5.73c0 4.47-3.64 8.11-8.12 8.11z" />
      </svg>
    </a>
  );
}
```

- [ ] **Step 4: Wire into `layout.tsx`** (also loads the Fraunces/Figtree fonts, matching the Task 2 tokens)

```tsx
import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: { default: "Woodpecker Guesthouse", template: "%s | Woodpecker Guesthouse" },
  description:
    "Affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga — minutes from the Kruger National Park.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${figtree.variable} font-sans antialiased`}>
        <Header />
        {children}
        <Footer />
        {whatsapp && <WhatsAppButton phone={whatsapp} />}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Then: `npm run dev`, open `http://localhost:3000`, confirm the header nav, footer, and WhatsApp button (if `NEXT_PUBLIC_WHATSAPP_NUMBER` is set locally) render.

- [ ] **Step 6: Commit**

```bash
git add woodpecker-guesthouse/src/components/layout/Header.tsx woodpecker-guesthouse/src/components/layout/Footer.tsx woodpecker-guesthouse/src/components/site/WhatsAppButton.tsx woodpecker-guesthouse/src/app/layout.tsx
git commit -m "feat(woodpecker-guesthouse): add Header, Footer, WhatsApp button"
```

---

### Task 6: Nightsbridge Booking Widget Component

The old site's Nightsbridge widget is a JS-rendered third-party embed — Firecrawl couldn't capture its actual markup, and the client's real property ID isn't known yet. Building a fake embed URL would silently break booking. This component makes the one place that uncertainty lives obvious, with an honest fallback until the real ID is in `.env`.

**Files:**
- Create: `woodpecker-guesthouse/src/components/booking/NightsbridgeWidget.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID` env var.
- Produces: `<NightsbridgeWidget />` — used by Task 7 (Home) and Task 8 (room detail page).

- [ ] **Step 1: Create the component**

```tsx
const propertyId = process.env.NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID;

export default function NightsbridgeWidget() {
  if (!propertyId) {
    // Honest fallback — no fabricated property ID. Swap in the client's real
    // ID from their Nightsbridge dashboard, then this branch stops rendering.
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center">
        <p className="text-ink font-medium mb-2">Check availability</p>
        <p className="text-muted text-sm mb-4">Online booking is being connected — enquire directly for now.</p>
        <a
          href="/contact"
          className="inline-block rounded-full bg-terracotta text-white px-6 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors"
        >
          Enquire Now
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white p-4 overflow-hidden">
      <iframe
        title="Check availability and book"
        src={`https://book.nightsbridge.com/${propertyId}`}
        className="w-full h-[420px] border-0"
        loading="lazy"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Then: `npm run dev` with `NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID` unset → confirm the "Enquire Now" fallback renders, not a broken iframe.

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/src/components/booking/NightsbridgeWidget.tsx
git commit -m "feat(woodpecker-guesthouse): add Nightsbridge widget with honest fallback"
```

---

### Task 7: Home Page

**Files:**
- Create: `woodpecker-guesthouse/src/app/page.tsx`

**Interfaces:**
- Consumes: `getRooms()` (Task 4), `<NightsbridgeWidget />` (Task 6).

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getRooms } from "@/lib/rooms";
import NightsbridgeWidget from "@/components/booking/NightsbridgeWidget";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga — minutes from the Kruger National Park.",
};

const FACILITIES = [
  { name: "Swimming Pool", desc: "Cool off after a day on the Panorama Route." },
  { name: "Braai Area", desc: "Fire up an evening braai under the bushveld sky." },
  { name: "Jumping Castle", desc: "Kept the kids happy on the old site — kept here too." },
  { name: "Parking", desc: "Secure on-site parking for every guest." },
];

export default async function HomePage() {
  const rooms = await getRooms();
  const featured = rooms.slice(0, 3);

  return (
    <main>
      <section className="relative bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <p className="text-terracotta text-sm tracking-widest uppercase mb-3">Hazyview, Mpumalanga</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink max-w-2xl mb-4">
            A home away from home, minutes from the Kruger.
          </h1>
          <p className="text-muted max-w-xl mb-8">
            Affordable, family-friendly accommodation, conferencing and a restaurant serving homely meals — Woodpecker
            Guesthouse is built for guests who live for serene spaces and the outdoors.
          </p>
          <div className="max-w-md">
            <NightsbridgeWidget />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl text-ink mb-8">Facilities</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {FACILITIES.map((f) => (
            <div key={f.name} className="rounded-xl border border-line bg-white p-5">
              <p className="text-ink font-medium mb-1">{f.name}</p>
              <p className="text-muted text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-2xl text-ink">Featured Rooms</h2>
            <Link href="/accommodation" className="text-terracotta text-sm hover:underline">
              View all rooms →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((room) => (
              <Link
                key={room.id}
                href={`/accommodation/${room.slug}`}
                className="rounded-xl border border-line bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-sand/40 relative">
                  {room.hero_image && (
                    <Image src={room.hero_image} alt={room.name} fill className="object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-ink font-medium">{room.name}</p>
                  <p className="text-muted text-sm mt-1">
                    {room.bedrooms} bed{room.bedrooms !== 1 ? "s" : ""} · {room.bathrooms} bathroom
                    {room.bathrooms !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-olive text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-2xl mb-3">Ready to book your stay?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Get in touch and we'll help you find the right room for your visit.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-white text-olive-deep px-8 py-3 font-semibold hover:bg-sand transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Then: `npm run dev`, open `/`, confirm hero, facilities, featured rooms (from seeded data) and CTA render without errors.

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/src/app/page.tsx
git commit -m "feat(woodpecker-guesthouse): build Home page"
```

---

### Task 8: Accommodation Pages (Grid + Detail)

**Files:**
- Create: `woodpecker-guesthouse/src/app/accommodation/page.tsx`
- Create: `woodpecker-guesthouse/src/app/accommodation/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getRooms()`, `getRoomBySlug(slug)` (Task 4), `<NightsbridgeWidget />` (Task 6).

- [ ] **Step 1: Write the grid page**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getRooms } from "@/lib/rooms";

export const metadata: Metadata = {
  title: "Accommodation",
  description: "8 room types at Woodpecker Guesthouse, Hazyview — from budget-friendly to family suites.",
};

export default async function AccommodationPage() {
  const rooms = await getRooms();
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-2">Accommodation</h1>
      <p className="text-muted mb-10 max-w-2xl">
        Affordable, comfortable rooms for every kind of stay — from a solo overnighter to a family break.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/accommodation/${room.slug}`}
            className="rounded-xl border border-line bg-white overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] bg-sand/40 relative">
              {room.hero_image && <Image src={room.hero_image} alt={room.name} fill className="object-cover" />}
            </div>
            <div className="p-4">
              <p className="text-ink font-medium">{room.name}</p>
              <p className="text-muted text-sm mt-1">
                {room.bedrooms} bed{room.bedrooms !== 1 ? "s" : ""} · {room.bathrooms} bathroom
                {room.bathrooms !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Write the detail page**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRoomBySlug, getRooms } from "@/lib/rooms";
import NightsbridgeWidget from "@/components/booking/NightsbridgeWidget";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rooms = await getRooms();
  return rooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) return { title: "Room not found" };
  return { title: room.name, description: room.description };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) notFound();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2">
        <div className="aspect-[16/10] bg-sand/40 rounded-xl relative mb-6 overflow-hidden">
          {room.hero_image && <Image src={room.hero_image} alt={room.name} fill className="object-cover" />}
        </div>
        <h1 className="font-display text-3xl text-ink mb-3">{room.name}</h1>
        <p className="text-muted mb-6">{room.description}</p>
        <dl className="grid grid-cols-3 gap-4 text-sm mb-6">
          <div>
            <dt className="text-muted">Bed type</dt>
            <dd className="text-ink font-medium">{room.bed_type || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Bathrooms</dt>
            <dd className="text-ink font-medium">{room.bathrooms}</dd>
          </div>
          <div>
            <dt className="text-muted">Max guests</dt>
            <dd className="text-ink font-medium">{room.max_guests}</dd>
          </div>
        </dl>
        {room.amenities.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {room.amenities.map((a) => (
              <li key={a} className="rounded-full bg-surface border border-line px-3 py-1 text-xs text-ink">
                {a}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <NightsbridgeWidget />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Then: `npm run dev`, open `/accommodation` (8 rooms listed) and `/accommodation/budget-room` (real seeded copy renders); open `/accommodation/not-a-real-slug` and confirm the 404 page renders (`notFound()` path).

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/src/app/accommodation
git commit -m "feat(woodpecker-guesthouse): build Accommodation grid and detail pages"
```

---

### Task 9: Conferencing Page

**Files:**
- Create: `woodpecker-guesthouse/src/app/conferencing/page.tsx`

- [ ] **Step 1: Write the page** (content from the old site's Conferencing page, rewritten in the warmer house tone — final copy pass happens separately per house process)

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conferencing",
  description: "Conference and events venue at Woodpecker Guesthouse, Hazyview — for board meetings, launches and private dinners.",
};

export default function ConferencingPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Conferencing</h1>
      <p className="text-muted mb-6">
        Our conference and events centre is the ideal venue for conferences, launches, promotions, board meetings,
        private dinners and other intimate events — set against the quiet, natural surrounds of Hazyview.
      </p>
      <p className="text-muted mb-10">
        Combine your day of meetings with a stay in one of our rooms and a meal at the restaurant for a complete,
        convenient package.
      </p>
      <Link
        href="/contact"
        className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
      >
        Enquire About Conferencing
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`, then check `/conferencing` renders in `npm run dev`.

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/src/app/conferencing
git commit -m "feat(woodpecker-guesthouse): build Conferencing page"
```

---

### Task 10: Restaurant Page

**Files:**
- Create: `woodpecker-guesthouse/src/app/restaurant/page.tsx`

The old site's menus exist only as PDFs (breakfast/dinner/kids). Per spec §2/§6, this rewrites them as real page content; the actual PDFs aren't available to this plan (they live on the old WP media library, which the client will hand over) — so this task builds the section structure with the item categories that ARE known from the PDF titles/snippets the scrape captured, clearly marked, rather than inventing menu items.

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Homely African cuisine at Woodpecker Guesthouse restaurant, Hazyview.",
};

export default function RestaurantPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Restaurant</h1>
      <p className="text-muted mb-10">
        Taste homely, scrumptious African cuisine at the Woodpecker Guesthouse restaurant — breakfast, dinner and a
        dedicated kids' menu.
      </p>
      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="text-ink font-medium mb-2">Full menus coming from our updated kitchen</p>
        <p className="text-muted text-sm">
          Breakfast, dinner and kids' menu items are being migrated from our current printed menus — check back soon,
          or ask our team directly when you enquire.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`, then check `/restaurant` renders in `npm run dev`.

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/src/app/restaurant
git commit -m "feat(woodpecker-guesthouse): build Restaurant page"
```

---

### Task 11: Gallery Page

**Files:**
- Create: `woodpecker-guesthouse/src/app/gallery/page.tsx`

**Interfaces:**
- Consumes: `getGalleryCategories()`, `getGalleryImages()` (Task 4).

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryCategories, getGalleryImages } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of Woodpecker Guesthouse — rooms, grounds, restaurant and conferencing venue.",
};

export default async function GalleryPage() {
  const [categories, images] = await Promise.all([getGalleryCategories(), getGalleryImages()]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-10">Gallery</h1>
      {images.length === 0 ? (
        <p className="text-muted">Photos are being added — check back soon.</p>
      ) : (
        categories.map((cat) => {
          const catImages = images.filter((img) => img.category_id === cat.id);
          if (catImages.length === 0) return null;
          return (
            <section key={cat.id} className="mb-12">
              <h2 className="font-display text-xl text-ink mb-4">{cat.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {catImages.map((img) => (
                  <div key={img.id} className="aspect-square relative rounded-lg overflow-hidden bg-sand/40">
                    <Image src={img.src} alt={img.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`, then check `/gallery` renders the empty state (no images seeded yet — real photos land via Plan B's admin upload once the WP export arrives) in `npm run dev`.

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/src/app/gallery
git commit -m "feat(woodpecker-guesthouse): build Gallery page"
```

---

### Task 12: Attractions Page

**Files:**
- Create: `woodpecker-guesthouse/src/app/attractions/page.tsx`

- [ ] **Step 1: Write the page** (real facts from the old site — good local SEO/GEO content, per spec §7)

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attractions",
  description: "The best attractions near Woodpecker Guesthouse in Hazyview: Kruger National Park, God's Window, Blyde River Canyon, Bourke's Luck Potholes.",
};

const ATTRACTIONS = [
  {
    name: "Kruger National Park",
    desc: "One of Africa's largest game reserves, a short drive from Hazyview — the reason most guests visit this part of Mpumalanga.",
  },
  {
    name: "God's Window",
    desc: "A viewpoint on the Panorama Route with sweeping views over the Lowveld escarpment.",
  },
  {
    name: "Blyde River Canyon",
    desc: "One of the largest green canyons in the world, and a highlight of any Panorama Route day trip.",
  },
  {
    name: "Bourke's Luck Potholes",
    desc: "Striking water-carved rock formations where the Treur and Blyde rivers meet.",
  },
];

export default function AttractionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Attractions</h1>
      <p className="text-muted mb-10">
        Woodpecker Guesthouse is perfectly placed for exploring the Kruger National Park and the Panorama Route —
        here's what's worth the drive.
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        {ATTRACTIONS.map((a) => (
          <div key={a.name} className="rounded-xl border border-line bg-white p-5">
            <p className="text-ink font-medium mb-1">{a.name}</p>
            <p className="text-muted text-sm">{a.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`, then check `/attractions` renders in `npm run dev`.

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/src/app/attractions
git commit -m "feat(woodpecker-guesthouse): build Attractions page"
```

---

### Task 13: Contact Page + Anti-Bot API Route

**Files:**
- Create: `woodpecker-guesthouse/src/lib/antibot.ts`
- Create: `woodpecker-guesthouse/test/antibot.test.mjs`
- Create: `woodpecker-guesthouse/src/app/api/contact/route.ts`
- Create: `woodpecker-guesthouse/src/components/site/ContactForm.tsx`
- Create: `woodpecker-guesthouse/src/app/contact/page.tsx`

**Interfaces:**
- Produces: `isBotSubmission(input: { honeypot?: string; renderedAt?: number }): boolean` (pure function, real unit test below — the one piece of Task 13 with actual logic to TDD).

This is the honeypot + timing anti-bot pattern already used on Lublaw's `ContactForm`/`/api/contact` — replicated here, not reinvented.

- [ ] **Step 1: Write the failing test for the pure anti-bot check**

```js
// test/antibot.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { isBotSubmission } from "../src/lib/antibot.ts";

test("honeypot filled in => bot", () => {
  assert.equal(isBotSubmission({ honeypot: "anything", renderedAt: Date.now() - 5000 }), true);
});

test("submitted faster than MIN_SUBMIT_MS => bot", () => {
  assert.equal(isBotSubmission({ honeypot: "", renderedAt: Date.now() - 100 }), true);
});

test("empty honeypot + slow enough submission => human", () => {
  assert.equal(isBotSubmission({ honeypot: "", renderedAt: Date.now() - 5000 }), false);
});

test("missing renderedAt => human (fails open, not closed)", () => {
  assert.equal(isBotSubmission({ honeypot: "" }), false);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --experimental-strip-types --test test/antibot.test.mjs`
Expected: FAIL — `Cannot find module '../src/lib/antibot.ts'`.

- [ ] **Step 3: Write `src/lib/antibot.ts`**

```ts
const MIN_SUBMIT_MS = 2500;

/** True if the submission looks automated: the hidden honeypot field was
 *  filled in (real visitors never see it), or the form was submitted faster
 *  than a human could type a message. */
export function isBotSubmission(input: { honeypot?: string; renderedAt?: number }): boolean {
  const honeypotTripped = Boolean(input.honeypot);
  const submittedTooFast =
    typeof input.renderedAt === "number" && Date.now() - input.renderedAt < MIN_SUBMIT_MS;
  return honeypotTripped || submittedTooFast;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `node --experimental-strip-types --test test/antibot.test.mjs`
Expected: 4 passing.

- [ ] **Step 5: Write the API route**

```ts
// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isBotSubmission } from "@/lib/antibot";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string; topic?: string; honeypot?: string; renderedAt?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const topic = String(body.topic ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Please fill in all fields." }, { status: 400 });
  }

  if (isBotSubmission({ honeypot: body.honeypot, renderedAt: body.renderedAt })) {
    // Pretend success without sending — don't tip off the bot.
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL not configured");
    return NextResponse.json(
      { ok: false, error: "Contact form is not yet configured. Please email us directly." },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Woodpecker Guesthouse Website <onboarding@resend.dev>",
    to,
    replyTo: email,
    subject: topic ? `New enquiry (${topic}) from ${name}` : `New enquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}${topic ? `\nRegarding: ${topic}` : ""}\n\n${message}`,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json({ ok: false, error: "Failed to send. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Write the form component**

```tsx
// src/components/site/ContactForm.tsx
"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", honeypot: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [renderedAt] = useState(() => Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, renderedAt }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "sent") {
    return <p className="text-ink font-medium py-8 text-center">Thanks — we'll be in touch soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="honeypot">Company</label>
        <input
          id="honeypot"
          name="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm text-ink mb-1">Name *</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-ink mb-1">Email *</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm text-ink mb-1">Message *</label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-terracotta text-white px-5 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
```

- [ ] **Step 7: Write the page**

```tsx
// src/app/contact/page.tsx
import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Woodpecker Guesthouse for accommodation, restaurant and conferencing enquiries in Hazyview, Mpumalanga.",
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Contact Us</h1>
      <p className="text-muted mb-10">Send us an enquiry and we'll get back to you as soon as we can.</p>
      <ContactForm />
    </main>
  );
}
```

- [ ] **Step 8: Verify**

Run: `npm run build`
With `RESEND_API_KEY`/`CONTACT_TO_EMAIL` unset locally, submit the form on `/contact` in `npm run dev` and confirm it returns the friendly 503 "not yet configured" message (not a crash).

- [ ] **Step 9: Commit**

```bash
git add woodpecker-guesthouse/src/lib/antibot.ts woodpecker-guesthouse/test/antibot.test.mjs woodpecker-guesthouse/src/app/api/contact/route.ts woodpecker-guesthouse/src/components/site/ContactForm.tsx woodpecker-guesthouse/src/app/contact/page.tsx
git commit -m "feat(woodpecker-guesthouse): add Contact page with anti-bot protection"
```

---

### Task 14: Legal Pages

**Files:**
- Create: `woodpecker-guesthouse/src/app/privacy-policy/page.tsx`
- Create: `woodpecker-guesthouse/src/app/terms-conditions/page.tsx`

Per spec §2, legal content is migrated as-is (not rewritten) — flagged as not legally reviewed by this plan. The old site's actual clause text needs the WP export to copy verbatim (Firecrawl's scrape of these pages wasn't captured in discovery); this task creates the routes with the confirmed real facts from the old site's terms excerpt and a clear placeholder for the client-supplied full legal text, rather than inventing legal clauses.

- [ ] **Step 1: Write `privacy-policy/page.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose-sm">
      <h1 className="font-display text-3xl text-ink mb-6">Privacy Policy</h1>
      <p className="text-muted mb-4">
        It is Woodpecker Guesthouse policy to respect your privacy and comply with any applicable laws and
        regulations regarding any personal information we may collect, including on this website.
      </p>
      <p className="text-muted">
        Full policy text is being migrated from our previous website and will be published here verbatim once
        confirmed — contact us directly with any privacy questions in the meantime.
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Write `terms-conditions/page.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsConditionsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose-sm">
      <h1 className="font-display text-3xl text-ink mb-6">Terms &amp; Conditions</h1>
      <p className="text-muted mb-4">
        Reservations are accepted on a "per room" basis and not "per person". Children over 1 are welcome. Check-in
        time is between 13:00 and 18:00.
      </p>
      <p className="text-muted">
        Full terms are being migrated from our previous website and will be published here verbatim once confirmed —
        contact us directly with any booking questions in the meantime.
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`, then check both routes render in `npm run dev`.

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/src/app/privacy-policy woodpecker-guesthouse/src/app/terms-conditions
git commit -m "feat(woodpecker-guesthouse): add legal pages"
```

---

### Task 15: SEO — Sitemap, Robots, LocalBusiness Schema

**Files:**
- Create: `woodpecker-guesthouse/src/app/sitemap.ts`
- Create: `woodpecker-guesthouse/src/app/robots.ts`
- Create: `woodpecker-guesthouse/src/components/site/LocalBusinessSchema.tsx`
- Modify: `woodpecker-guesthouse/src/app/layout.tsx`

**Interfaces:**
- Consumes: `getRooms()` (Task 4).

- [ ] **Step 1: Create `sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { getRooms } from "@/lib/rooms";

const BASE_URL = "https://woodpeckersguesthouse.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rooms = await getRooms();
  const staticRoutes = [
    "",
    "/accommodation",
    "/conferencing",
    "/restaurant",
    "/gallery",
    "/attractions",
    "/contact",
    "/privacy-policy",
    "/terms-conditions",
  ].map((path) => ({ url: `${BASE_URL}${path}`, lastModified: new Date() }));

  const roomRoutes = rooms.map((room) => ({
    url: `${BASE_URL}/accommodation/${room.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...roomRoutes];
}
```

- [ ] **Step 2: Create `robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://woodpeckersguesthouse.co.za/sitemap.xml",
  };
}
```

- [ ] **Step 3: Create `LocalBusinessSchema.tsx`**

```tsx
export default function LocalBusinessSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Woodpecker Guesthouse",
    description:
      "Affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga, minutes from the Kruger National Park.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hazyview",
      addressRegion: "Mpumalanga",
      addressCountry: "ZA",
    },
    url: "https://woodpeckersguesthouse.co.za",
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
```

- [ ] **Step 4: Wire the schema into `layout.tsx`**

Edit the `<body>` in `src/app/layout.tsx` to render it once, site-wide:

```tsx
import LocalBusinessSchema from "@/components/site/LocalBusinessSchema";

// ...inside <body>, alongside Header/Footer/WhatsAppButton:
<LocalBusinessSchema />
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Then: `npm run dev`, open `/sitemap.xml` and `/robots.txt`, confirm they render; view-source on `/` and confirm the `application/ld+json` script tag with `LodgingBusiness` is present.

- [ ] **Step 6: Commit**

```bash
git add woodpecker-guesthouse/src/app/sitemap.ts woodpecker-guesthouse/src/app/robots.ts woodpecker-guesthouse/src/components/site/LocalBusinessSchema.tsx woodpecker-guesthouse/src/app/layout.tsx
git commit -m "feat(woodpecker-guesthouse): add sitemap, robots, LocalBusiness schema"
```

---

### Task 16: Supabase Keep-Alive Workflow

**Files:**
- Create: `woodpecker-guesthouse/.github/workflows/keep-supabase-alive.yml`

- [ ] **Step 1: Create the workflow** (own-repo style, matching the standard — cron Mon/Thu, insert not read, service-role bypasses RLS)

```yaml
name: Keep Supabase Alive

on:
  schedule:
    - cron: "0 9 * * 1,4" # Mon & Thu, 09:00 UTC
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Insert keep-alive row
        run: |
          curl --fail-with-body -X POST "${SUPABASE_URL}/rest/v1/keep_alive" \
            -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
            -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
            -H "Content-Type: application/json" \
            -H "Prefer: return=minimal" \
            -d '{"note": "keep-alive"}'
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

- [ ] **Step 2: Verify**

After the repo has `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` secrets set (post-deploy) and this workflow is on `main`, trigger it manually via GitHub Actions → "Run workflow" and confirm a new row appears in `keep_alive`.
(This step can't be verified until the branch merges to `main` — cron only fires from the default branch. Note as a deploy-time follow-up.)

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/.github/workflows/keep-supabase-alive.yml
git commit -m "chore(woodpecker-guesthouse): add Supabase keep-alive workflow"
```

---

### Task 17: Deploy Config & README

**Files:**
- Create: `woodpecker-guesthouse/README.md`

- [ ] **Step 1: Write the README**

```md
# Woodpecker Guesthouse

Next.js + Supabase rebuild of woodpeckersguesthouse.co.za. See
`docs/superpowers/specs/2026-08-13-woodpecker-guesthouse-design.md` (repo root) for the full design spec.

## Local development

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in Supabase/Resend/WhatsApp values.
3. Run the schema: paste `supabase/migrations/0001_init.sql` into the Supabase SQL editor.
4. Seed sample content: `node scripts/seed.mjs` (requires `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set).
5. `npm run dev`

## Deploy

Vercel, git-push auto-deploy on `main`. **Root Directory must be set to `woodpecker-guesthouse`** in the Vercel
project settings (this lives in a monorepo). Set the same env vars from `.env.example` in the Vercel dashboard.

After first deploy: add `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` as **GitHub Actions repo secrets** (different
from the Vercel env vars above) so `.github/workflows/keep-supabase-alive.yml` can run.

## Known follow-ups (see spec §10)

- Real room copy/photos/rates for Double Room 1–3 and Family Room 1–2 — pending the client's WordPress export.
- Real Nightsbridge property ID — set `NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID` once known (see
  `src/components/booking/NightsbridgeWidget.tsx`).
- Restaurant menu content and full legal page text — pending the WordPress export.
- Admin panel (Plan B) and AI blog pipeline (Plan C) are separate plans, not yet built.
```

- [ ] **Step 2: Commit**

```bash
git add woodpecker-guesthouse/README.md
git commit -m "docs(woodpecker-guesthouse): add README"
```

---

## Plan Self-Review Notes

- **Spec coverage:** §3 Architecture → Tasks 1–4, 6, 16–17. §4 Site Map → Tasks 7–14 (Blog and Admin routes are explicitly Plan C/B, noted in Header nav Task 5 as a link that 404s until Plan C ships — acceptable for a Foundation-only plan; flagged in Global Constraints as an intentional Plan C dependency, not an oversight). §5 Design System → Task 2. §7 SEO/Integrations → Tasks 6, 13, 15. §8 Ops → Tasks 16–17. §9 Testing → Global Constraints + Task 13's `antibot.test.mjs`.
- **Blog nav link (Task 5) will 404 until Plan C ships** — acceptable, but call this out explicitly before merging Task 5 if Plan C isn't scheduled immediately after.
- **No placeholders in step instructions** — all steps show complete code; the only "placeholder" content is the explicitly-labeled unpublished room stubs and legal-text-pending-export, both deliberate and disclosed, not vague engineer instructions.
- **Type consistency checked:** `Room`/`GalleryCategory`/`GalleryImage` types (Task 4) match the columns selected in `rooms.ts`/`gallery.ts` and the fields read in every page task (7, 8, 11).
