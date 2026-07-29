# Bushnews Public Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Bushnews public site to match the jNews "AI News" layout, running on live Supabase data, with the multi-tenant seams needed to add the other seven titles.

**Architecture:** One Next.js app serves many news titles. `src/middleware.ts` maps the request hostname to a site id and rewrites the URL to `/<siteId>/…`, so every page still statically generates per tenant and reader traffic is served from the edge rather than Supabase. Each site owns a config file (brand tokens, nav, domains) and its own `HomePage.tsx` composed from shared primitives in `src/components/news/`. All Supabase reads filter on `site_id`.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19.2.3, Tailwind CSS 4, Supabase (Postgres), Cloudflare R2 (media), Vitest (unit), Playwright (E2E), date-fns, lucide-react.

## Global Constraints

- **Site id for Bushnews is `bushbuckridge-news`**, not `bushnews`. This is the existing `site_id` default on all 1,110 migrated rows. Do not rename it — nothing gains from an UPDATE across every row.
- **Never hardcode a colour.** All brand colour comes through CSS custom properties (`var(--brand-accent)` etc.) set from the site config. A literal hex in a component is a bug.
- **Every Supabase read filters on `site_id`.** No exceptions.
- **Accent colour is `#E60000`.** Not `#FF0000`, not the reference demo's indigo.
- **Fonts are Roboto** (body and headings), replacing the current Space Grotesk / Inter / IBM Plex Mono.
- **Next.js 16: `params` and `searchParams` are Promises.** Always `await` them in page components.
- **Deferred — do not build:** Saved Posts / bookmarks, comments and comment counts, share counts, AI features, admin CMS, ad booking portal.
- **Reference layout:** <https://jnews.io/ai-news/>
- **Spec:** `docs/superpowers/specs/2026-07-29-newsroom-platform-bushnews-public-site-design.md`

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/middleware.ts` | Hostname → site id, rewrite to `/<siteId>/…` |
| `src/sites/types.ts` | `SiteConfig`, `BrandTokens` type definitions |
| `src/sites/registry.ts` | Site list + `resolveSiteByHost` + `getSiteById` |
| `src/sites/bushnews/config.ts` | Bushnews brand tokens, nav, domains, logo |
| `src/sites/bushnews/HomePage.tsx` | jNews-style composition for Bushnews only |
| `src/lib/text.ts` | `excerptFromHtml`, `spreadByCategory` — pure, unit-tested |
| `src/lib/queries.ts` | All Supabase reads, every one site-scoped |
| `src/lib/media.ts` | `getImageUrl` against the R2 base URL |
| `src/components/news/*.tsx` | Shared primitives and modules |
| `src/app/[site]/…` | Tenant-scoped routes |
| `supabase/migrations/0001_*.sql` | Schema changes |
| `wp-migration/extract-relations.js` | Pull categories, relationships, authors from the dump |
| `wp-migration/migrate-relations.js` | Load them into Supabase |
| `wp-migration/migrate-media-to-r2.js` | Supabase Storage → R2 |
| `tests/**`, `e2e/**` | Unit and E2E tests |

**Modified:** `src/lib/supabase.ts` (remove hardcoded credentials), `src/app/layout.tsx` (Roboto, token injection), `src/app/globals.css` (tokens replace literals), `next.config.ts` (R2 remote pattern), `package.json` (test scripts).

**Deleted at the end:** `src/components/Hero.tsx`, `src/components/Features.tsx`, `src/components/Navbar.tsx`, `src/lib/demo-content.ts`, `src/app/page.tsx`, `src/app/article/[slug]/` — all superseded. Task 15 removes them only once nothing imports them.

---

### Task 1: Test infrastructure and credential hygiene

**Files:**
- Modify: `package.json`
- Modify: `src/lib/supabase.ts:1-17`
- Create: `vitest.config.ts`, `playwright.config.ts`, `tests/lib/supabase.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` (Vitest, unit) and `npm run e2e` (Playwright). `src/lib/supabase.ts` exports `supabase` and throws at import time when env vars are missing.

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest@^3 @playwright/test@^1.50
npx playwright install chromium
```

- [ ] **Step 2: Write the failing test**

Create `tests/lib/supabase.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const ORIGINAL = { ...process.env };

describe('supabase client', () => {
  beforeEach(() => { process.env = { ...ORIGINAL }; });
  afterEach(() => { process.env = { ...ORIGINAL }; });

  it('throws when the Supabase URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    await expect(import('../../src/lib/supabase?missing-url')).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/
    );
  });

  it('does not contain a hardcoded credential fallback', async () => {
    const fs = await import('node:fs/promises');
    const source = await fs.readFile('src/lib/supabase.ts', 'utf8');
    expect(source).not.toMatch(/https:\/\/[a-z0-9]+\.supabase\.co/);
    expect(source).not.toMatch(/eyJhbGciOi/);
  });
});
```

- [ ] **Step 3: Add config files**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

- [ ] **Step 4: Add scripts to `package.json`**

Add to the `scripts` block:

```json
"test": "vitest run",
"test:watch": "vitest",
"e2e": "playwright test"
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — the hardcoded-credential assertion fails, because `src/lib/supabase.ts` still contains the literal URL and key.

- [ ] **Step 6: Rewrite `src/lib/supabase.ts`**

Replace the whole file:

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
if (!supabaseKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');

export const supabase = createClient(supabaseUrl, supabaseKey);
```

`getImageUrl` moves out to its own module. Do **not** re-export it from `supabase.ts` — `media.ts` imports `supabase`, so a re-export would create a circular dependency.

Create `src/lib/media.ts` with the current behaviour so nothing breaks yet:

```ts
import { supabase } from './supabase';

export function getImageUrl(path: string | null) {
  if (!path) return '/placeholder-news.jpg';
  if (path.startsWith('http')) return path;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
```

- [ ] **Step 7: Repoint the two existing importers**

`src/app/page.tsx` and `src/app/article/[slug]/page.tsx` both import `getImageUrl` from `@/lib/supabase`. Change each import line so `getImageUrl` comes from `@/lib/media`:

```ts
// src/app/page.tsx — line 4
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/media';
```

```ts
// src/app/article/[slug]/page.tsx — line 1
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/lib/media";
```

Both files are deleted later (Tasks 4 and 15); this keeps the build green until then.

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 2 tests.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts playwright.config.ts tests src/lib src/app
git commit -m "chore: add test infrastructure, remove hardcoded Supabase credentials"
```

---

### Task 2: Schema changes and taxonomy backfill

**Files:**
- Create: `supabase/migrations/0001_categories_authors_views.sql`
- Create: `wp-migration/extract-relations.js`
- Create: `wp-migration/migrate-relations.js`

**Interfaces:**
- Consumes: nothing
- Produces: table `post_categories(post_id uuid, category_id uuid)`; columns `posts.author text`, `posts.view_count integer not null default 0`; RPC `increment_view_count(p_slug text, p_site_id text)`. `categories` populated with 6 rows for site `bushbuckridge-news`.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/0001_categories_authors_views.sql`:

```sql
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.post_categories (
    post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS wp_term_id BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS categories_site_slug_idx
    ON public.categories (site_id, slug);

CREATE INDEX IF NOT EXISTS posts_site_status_published_idx
    ON public.posts (site_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_site_slug_idx
    ON public.posts (site_id, slug);
CREATE INDEX IF NOT EXISTS post_categories_category_idx
    ON public.post_categories (category_id);

ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view post categories" ON public.post_categories;
CREATE POLICY "Public can view post categories" ON public.post_categories
    FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.increment_view_count(p_slug TEXT, p_site_id TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.posts
       SET view_count = view_count + 1
     WHERE slug = p_slug AND site_id = p_site_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_view_count(TEXT, TEXT) TO anon;
```

- [ ] **Step 2: Apply the migration**

Paste the file into the Supabase SQL editor and run it.
Expected: `Success. No rows returned.`

Verify:

```sql
SELECT column_name FROM information_schema.columns
 WHERE table_name = 'posts' AND column_name IN ('author','view_count');
```
Expected: 2 rows.

- [ ] **Step 3: Write the extraction script**

Create `wp-migration/extract-relations.js`:

```js
const fs = require('fs');
const path = require('path');

const DUMP = path.join(__dirname, 'bushnxfzxw_wp2114.sql');
const OUT = path.join(__dirname, 'relations.json');

const sql = fs.readFileSync(DUMP, 'utf8');

function insertBlock(table) {
  const re = new RegExp('INSERT INTO `' + table + '` \\([^)]*\\) VALUES\\s*([\\s\\S]*?);\\s*\\n');
  const m = sql.match(re);
  return m ? m[1] : '';
}

// wp_terms: (term_id, 'name', 'slug', term_group)
const terms = {};
for (const [id, name, slug] of insertBlock('wp_terms').matchAll(/\((\d+), '([^']*)', '([^']*)', \d+\)/g)) {
  terms[id] = { name, slug };
}

// wp_term_taxonomy: (term_taxonomy_id, term_id, 'taxonomy', 'description', parent, count)
const taxonomyIdToTerm = {};
const categories = [];
for (const [ttId, termId, taxonomy] of insertBlock('wp_term_taxonomy').matchAll(/\((\d+), (\d+), '([^']*)', '[^']*', \d+, \d+\)/g)) {
  if (taxonomy !== 'category') continue;
  const term = terms[termId];
  if (!term) continue;
  taxonomyIdToTerm[ttId] = term;
  categories.push({ wp_term_id: Number(termId), name: term.name, slug: term.slug });
}

// wp_term_relationships: (object_id, term_taxonomy_id, term_order)
const relationships = [];
for (const [objectId, ttId] of insertBlock('wp_term_relationships').matchAll(/\((\d+), (\d+), \d+\)/g)) {
  const term = taxonomyIdToTerm[ttId];
  if (!term) continue;
  relationships.push({ wp_post_id: Number(objectId), category_slug: term.slug });
}

// wp_users: (ID, 'login', 'pass', 'nicename', 'email', 'url', 'registered', 'activation', status, 'display_name')
const users = {};
for (const m of insertBlock('wp_users').matchAll(/\((\d+), '[^']*', '[^']*', '[^']*', '[^']*', '[^']*', '[^']*', '[^']*', \d+, '([^']*)'\)/g)) {
  users[m[1]] = m[2];
}

// post_author is field 2 of wp_posts: (ID, post_author, 'post_date', ...)
const postAuthors = {};
for (const m of sql.matchAll(/\((\d+), (\d+), '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}', '\d{4}-\d{2}-\d{2}/g)) {
  postAuthors[m[1]] = users[m[2]] || null;
}

fs.writeFileSync(OUT, JSON.stringify({ categories, relationships, postAuthors }, null, 2));
console.log(`categories: ${categories.length}`);
console.log(`relationships: ${relationships.length}`);
console.log(`posts with an author: ${Object.values(postAuthors).filter(Boolean).length}`);
```

- [ ] **Step 4: Run the extraction**

Run: `node wp-migration/extract-relations.js`
Expected: `categories: 8`, `relationships:` a number in the low thousands, and a non-zero author count. If categories is not 8, the regexes have drifted from the dump — stop and inspect `relations.json` before continuing.

- [ ] **Step 5: Write the loader script**

Create `wp-migration/migrate-relations.js`:

```js
require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SITE_ID = 'bushbuckridge-news';
const NAV_EXCLUDED = ['top-story', 'uncategorized'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { categories, relationships, postAuthors } =
    JSON.parse(fs.readFileSync(path.join(__dirname, 'relations.json'), 'utf8'));

  // 1. Upsert categories
  const rows = categories.map(c => ({ name: c.name, slug: c.slug, site_id: SITE_ID }));
  const { error: catErr } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'site_id,slug' });
  if (catErr) throw catErr;

  const { data: dbCats } = await supabase
    .from('categories').select('id, slug').eq('site_id', SITE_ID);
  const catIdBySlug = Object.fromEntries(dbCats.map(c => [c.slug, c.id]));
  console.log(`categories in DB: ${dbCats.length}`);

  // 2. Map wp_id → post uuid (paged; there are ~1,110 posts)
  const postIdByWpId = {};
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('posts').select('id, wp_id').eq('site_id', SITE_ID).range(from, from + 999);
    if (error) throw error;
    if (!data.length) break;
    for (const p of data) postIdByWpId[p.wp_id] = p.id;
    if (data.length < 1000) break;
  }
  console.log(`posts in DB: ${Object.keys(postIdByWpId).length}`);

  // 3. Insert post_categories
  const links = [];
  for (const rel of relationships) {
    const postId = postIdByWpId[rel.wp_post_id];
    const categoryId = catIdBySlug[rel.category_slug];
    if (postId && categoryId) links.push({ post_id: postId, category_id: categoryId });
  }
  for (let i = 0; i < links.length; i += 500) {
    const { error } = await supabase
      .from('post_categories').upsert(links.slice(i, i + 500), { onConflict: 'post_id,category_id' });
    if (error) throw error;
  }
  console.log(`post_categories linked: ${links.length}`);

  // 4. Backfill authors
  let authorCount = 0;
  for (const [wpId, author] of Object.entries(postAuthors)) {
    const postId = postIdByWpId[wpId];
    if (!postId || !author) continue;
    const { error } = await supabase.from('posts').update({ author }).eq('id', postId);
    if (error) throw error;
    authorCount++;
  }
  console.log(`authors set: ${authorCount}`);
  console.log(`nav categories: ${dbCats.filter(c => !NAV_EXCLUDED.includes(c.slug)).length} (expected 6)`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 6: Run the loader**

Run: `cd wp-migration && node migrate-relations.js`
Expected output ends with `nav categories: 6 (expected 6)` and a non-zero `post_categories linked` count.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations wp-migration/extract-relations.js wp-migration/migrate-relations.js
git commit -m "feat(db): add post_categories, author and view_count; backfill from WP dump"
```

---

### Task 3: Site registry and tenant routing

**Files:**
- Create: `src/sites/types.ts`, `src/sites/registry.ts`, `src/sites/bushnews/config.ts`, `src/middleware.ts`
- Create: `tests/sites/registry.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type SiteConfig = { id, name, tagline, domains, logo: {src,width,height,alt}, tokens: BrandTokens, nav: {label,slug}[], social: {label,href}[] }`
  - `type BrandTokens = { accent, accentHover, heroBg, heroText, heroMuted }`
  - `SITES: SiteConfig[]`, `DEFAULT_SITE_ID: string`
  - `resolveSiteByHost(host: string | null): SiteConfig | null`
  - `getSiteById(id: string): SiteConfig | undefined`

- [ ] **Step 1: Write the failing test**

Create `tests/sites/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveSiteByHost, getSiteById, DEFAULT_SITE_ID } from '../../src/sites/registry';

describe('resolveSiteByHost', () => {
  it('resolves the production domain', () => {
    expect(resolveSiteByHost('bushnews.co.za')?.id).toBe('bushbuckridge-news');
  });

  it('ignores a www prefix', () => {
    expect(resolveSiteByHost('www.bushnews.co.za')?.id).toBe('bushbuckridge-news');
  });

  it('ignores a port', () => {
    expect(resolveSiteByHost('bushnews.co.za:3000')?.id).toBe('bushbuckridge-news');
  });

  it('is case insensitive', () => {
    expect(resolveSiteByHost('BushNews.CO.ZA')?.id).toBe('bushbuckridge-news');
  });

  it('falls back to the default site on localhost', () => {
    expect(resolveSiteByHost('localhost:3000')?.id).toBe(DEFAULT_SITE_ID);
  });

  it('falls back to the default site on a vercel preview', () => {
    expect(resolveSiteByHost('newsroom-abc123.vercel.app')?.id).toBe(DEFAULT_SITE_ID);
  });

  it('returns null for an unknown host', () => {
    expect(resolveSiteByHost('example.com')).toBeNull();
  });

  it('returns null for a missing host', () => {
    expect(resolveSiteByHost(null)).toBeNull();
  });
});

describe('getSiteById', () => {
  it('finds Bushnews', () => {
    expect(getSiteById('bushbuckridge-news')?.name).toBe('Bushbuckridge News');
  });

  it('returns undefined for an unknown id', () => {
    expect(getSiteById('nope')).toBeUndefined();
  });
});

describe('site config integrity', () => {
  it('gives Bushnews six nav categories', () => {
    expect(getSiteById('bushbuckridge-news')!.nav).toHaveLength(6);
  });

  it('never lists top-story or uncategorized in the nav', () => {
    const slugs = getSiteById('bushbuckridge-news')!.nav.map(n => n.slug);
    expect(slugs).not.toContain('top-story');
    expect(slugs).not.toContain('uncategorized');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../src/sites/registry'`.

- [ ] **Step 3: Write the types**

Create `src/sites/types.ts`:

```ts
export type BrandTokens = {
  accent: string;
  accentHover: string;
  heroBg: string;
  heroText: string;
  heroMuted: string;
};

export type NavItem = { label: string; slug: string };

export type SiteConfig = {
  id: string;
  name: string;
  tagline: string;
  domains: string[];
  logo: { src: string; width: number; height: number; alt: string };
  tokens: BrandTokens;
  nav: NavItem[];
  social: { label: string; href: string }[];
};
```

- [ ] **Step 4: Write the Bushnews config**

Create `src/sites/bushnews/config.ts`:

```ts
import type { SiteConfig } from '../types';

export const bushnews: SiteConfig = {
  id: 'bushbuckridge-news',
  name: 'Bushbuckridge News',
  tagline: 'Current news in the Bushbuckridge area',
  domains: ['bushnews.co.za'],
  logo: { src: '/sites/bushnews/logo.png', width: 200, height: 48, alt: 'Bushbuckridge News' },
  tokens: {
    accent: '#E60000',
    accentHover: '#CC0000',
    heroBg: '#14141C',
    heroText: '#FFFFFF',
    heroMuted: 'rgba(255,255,255,0.66)',
  },
  nav: [
    { label: 'Community', slug: 'community' },
    { label: 'Crime', slug: 'crime' },
    { label: 'Lifestyle', slug: 'lifestyle' },
    { label: 'Sports', slug: 'sports' },
    { label: 'Politics', slug: 'politics' },
    { label: 'Notice', slug: 'notice' },
  ],
  social: [],
};
```

Download the logo to `public/sites/bushnews/logo.png`:

```bash
curl -L -o public/sites/bushnews/logo.png https://bushnews.co.za/wp-content/uploads/2023/09/LOGO-s.png
```

(Create the directory first if needed.)

- [ ] **Step 5: Write the registry**

Create `src/sites/registry.ts`:

```ts
import type { SiteConfig } from './types';
import { bushnews } from './bushnews/config';

export const SITES: SiteConfig[] = [bushnews];
export const DEFAULT_SITE_ID = 'bushbuckridge-news';

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

export function getSiteById(id: string): SiteConfig | undefined {
  return SITES.find(s => s.id === id);
}

export function resolveSiteByHost(host: string | null): SiteConfig | null {
  if (!host) return null;

  const bare = host.toLowerCase().split(':')[0].replace(/^www\./, '');

  if (LOCAL_HOSTS.includes(bare) || bare.endsWith('.vercel.app')) {
    return getSiteById(DEFAULT_SITE_ID) ?? null;
  }

  return SITES.find(s => s.domains.includes(bare)) ?? null;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 12 tests.

- [ ] **Step 7: Write the middleware**

Create `src/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { resolveSiteByHost } from './sites/registry';

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|placeholder-news.jpg|sites).*)'],
};

export function middleware(request: NextRequest) {
  const site = resolveSiteByHost(request.headers.get('host'));

  if (!site) {
    return new NextResponse('Unknown site', { status: 404 });
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${site.id}${url.pathname}`;
  return NextResponse.rewrite(url);
}
```

- [ ] **Step 8: Commit**

```bash
git add src/sites src/middleware.ts tests/sites public/sites
git commit -m "feat(tenancy): add site registry, Bushnews config and host-rewrite middleware"
```

---

### Task 4: Brand tokens and Roboto

**Files:**
- Create: `src/app/[site]/layout.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `getSiteById`, `SiteConfig` from Task 3
- Produces: CSS custom properties `--brand-accent`, `--brand-accent-hover`, `--brand-hero-bg`, `--brand-hero-text`, `--brand-hero-muted` available to every component under `/[site]`. Root layout loads Roboto as `--font-sans`.

- [ ] **Step 1: Replace the fonts in the root layout**

Rewrite `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Newsroom',
  description: 'Regional news network',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased min-h-screen`}>{children}</body>
    </html>
  );
}
```

The noise-texture divs and the Space Grotesk / IBM Plex Mono imports are deliberately dropped — the reference layout has no texture, and the spec fixes one typeface.

- [ ] **Step 2: Add the per-site layout that injects tokens**

Create `src/app/[site]/layout.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSiteById, SITES } from '@/sites/registry';

export function generateStaticParams() {
  return SITES.map(s => ({ site: s.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ site: string }> }
): Promise<Metadata> {
  const { site: siteId } = await params;
  const site = getSiteById(siteId);
  if (!site) return {};
  return { title: site.name, description: site.tagline };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site: siteId } = await params;
  const site = getSiteById(siteId);
  if (!site) notFound();

  const style = {
    '--brand-accent': site.tokens.accent,
    '--brand-accent-hover': site.tokens.accentHover,
    '--brand-hero-bg': site.tokens.heroBg,
    '--brand-hero-text': site.tokens.heroText,
    '--brand-hero-muted': site.tokens.heroMuted,
  } as React.CSSProperties;

  return <div style={style} className="min-h-screen bg-white text-zinc-900">{children}</div>;
}
```

- [ ] **Step 3: Replace the literal colours in `globals.css`**

Replace the whole file:

```css
@import "tailwindcss";

@theme {
  --color-brand: var(--brand-accent);
  --color-hero-bg: var(--brand-hero-bg);
  --color-surface: #FFFFFF;
  --color-surface-alt: #F7F7F9;
  --color-hairline: #E6E6EA;
  --color-ink: #16161A;
  --color-muted: #6B7280;
}

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-sans), system-ui, sans-serif;
  background-color: var(--color-surface);
  color: var(--color-ink);
}

::selection {
  background-color: var(--brand-accent);
  color: #FFF;
}

/* Section heading with the accent underline used throughout the reference */
.section-heading {
  position: relative;
  font-size: 20px;
  font-weight: 700;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-hairline);
  margin-bottom: 28px;
}

.section-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 32px;
  height: 3px;
  background: var(--brand-accent);
}

.category-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-accent);
}

.meta-text {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.img-zoom { overflow: hidden; }
.img-zoom img { transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.img-zoom:hover img { transform: scale(1.04); }

.prose p { margin-top: 1.5em; margin-bottom: 1.5em; }
.prose h2, .prose h3 { margin-top: 2.5em; margin-bottom: 1.25em; }
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`
Expected: the build fails on `src/app/page.tsx` and the old components, which still import deleted CSS classes and demo content. That is expected at this point — confirm the only errors come from `src/app/page.tsx`, `src/components/Hero.tsx`, `src/components/Features.tsx`, `src/components/Navbar.tsx` and `src/app/article/[slug]/page.tsx`. Those are removed in Task 15.

To keep the build green in the meantime, delete `src/app/page.tsx` now (its replacement arrives in Task 11) and re-run:

```bash
git rm src/app/page.tsx
npm run build
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/[site]/layout.tsx src/app/globals.css
git commit -m "feat(theming): brand tokens per site, Roboto, reference-matched base styles"
```

---

### Task 5: Text utilities and the data layer

**Files:**
- Create: `src/lib/text.ts`, `src/lib/queries.ts`
- Create: `tests/lib/text.test.ts`

**Interfaces:**
- Consumes: `supabase` (Task 1)
- Produces:
  - `excerptFromHtml(html: string | null, maxChars?: number): string`
  - `spreadByCategory<T extends { categories: { slug: string }[] }>(posts: T[], limit: number, maxPerCategory: number): T[]`
  - `type PostSummary = { id, title, slug, excerpt, featured_image, published_at, author, view_count, categories: {name,slug}[] }`
  - `getCategories(siteId)`, `getHeroPosts(siteId)`, `getTrendingPosts(siteId, excludeIds)`, `getLatestPosts(siteId, {limit, offset, excludeIds})`, `getPopularPosts(siteId, limit)`, `getPostsByCategory(siteId, slug, {limit, offset})`, `getPostBySlug(siteId, slug)`, `searchPosts(siteId, q, {limit})`, `getActiveAd(siteId)`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/text.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { excerptFromHtml, spreadByCategory } from '../../src/lib/text';

describe('excerptFromHtml', () => {
  it('strips tags', () => {
    expect(excerptFromHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('decodes common entities', () => {
    expect(excerptFromHtml('<p>Fish &amp; chips &nbsp;now</p>')).toBe('Fish & chips now');
  });

  it('collapses escaped newlines', () => {
    expect(excerptFromHtml('one\\ntwo')).toBe('one two');
  });

  it('truncates on a word boundary and appends an ellipsis', () => {
    const out = excerptFromHtml('<p>' + 'word '.repeat(60) + '</p>', 40);
    expect(out.length).toBeLessThanOrEqual(43);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/wor…$/);
  });

  it('does not truncate text already short enough', () => {
    expect(excerptFromHtml('<p>Short one</p>', 40)).toBe('Short one');
  });

  it('returns an empty string for null', () => {
    expect(excerptFromHtml(null)).toBe('');
  });
});

describe('spreadByCategory', () => {
  const post = (id: string, slug: string) => ({ id, categories: [{ slug }] });

  it('caps how many posts come from any one category', () => {
    const input = [
      post('1', 'crime'), post('2', 'crime'), post('3', 'crime'),
      post('4', 'sports'), post('5', 'community'),
    ];
    const out = spreadByCategory(input, 4, 2);
    expect(out.filter(p => p.categories[0].slug === 'crime')).toHaveLength(2);
    expect(out).toHaveLength(4);
  });

  it('preserves input order', () => {
    const input = [post('1', 'crime'), post('2', 'sports'), post('3', 'community')];
    expect(spreadByCategory(input, 3, 2).map(p => p.id)).toEqual(['1', '2', '3']);
  });

  it('backfills from over-quota categories rather than returning short', () => {
    const input = [post('1', 'crime'), post('2', 'crime'), post('3', 'crime'), post('4', 'crime')];
    expect(spreadByCategory(input, 3, 2)).toHaveLength(3);
  });

  it('handles posts with no category', () => {
    const input = [{ id: '1', categories: [] }, post('2', 'crime')];
    expect(spreadByCategory(input, 2, 1)).toHaveLength(2);
  });

  it('never exceeds the limit', () => {
    const input = Array.from({ length: 20 }, (_, i) => post(String(i), 'crime'));
    expect(spreadByCategory(input, 8, 2)).toHaveLength(8);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../src/lib/text'`.

- [ ] **Step 3: Write `src/lib/text.ts`**

```ts
const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'",
  '&lt;': '<', '&gt;': '>', '&#8217;': '’', '&#8216;': '‘',
};

export function excerptFromHtml(html: string | null, maxChars = 160): string {
  if (!html) return '';

  let text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\n/g, ' ');

  for (const [entity, char] of Object.entries(ENTITIES)) {
    text = text.split(entity).join(char);
  }

  text = text.replace(/\s+/g, ' ').trim();

  if (text.length <= maxChars) return text;

  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

export function spreadByCategory<T extends { categories: { slug: string }[] }>(
  posts: T[],
  limit: number,
  maxPerCategory: number
): T[] {
  const picked: T[] = [];
  const overflow: T[] = [];
  const counts = new Map<string, number>();

  for (const post of posts) {
    const slug = post.categories[0]?.slug ?? '';
    const count = counts.get(slug) ?? 0;
    if (slug && count >= maxPerCategory) {
      overflow.push(post);
      continue;
    }
    counts.set(slug, count + 1);
    picked.push(post);
    if (picked.length === limit) return picked;
  }

  for (const post of overflow) {
    if (picked.length === limit) break;
    picked.push(post);
  }

  return picked.slice(0, limit);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 11 new tests.

- [ ] **Step 5: Write `src/lib/queries.ts`**

```ts
import { supabase } from './supabase';
import { excerptFromHtml, spreadByCategory } from './text';

const SELECT = `
  id, title, slug, content, featured_image, published_at, author, view_count,
  post_categories ( categories ( name, slug ) )
`;

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string | null;
  author: string | null;
  view_count: number;
  categories: { name: string; slug: string }[];
};

type RawPost = {
  id: string; title: string; slug: string; content: string | null;
  featured_image: string | null; published_at: string | null;
  author: string | null; view_count: number | null;
  post_categories: { categories: { name: string; slug: string } | null }[] | null;
};

const HIDDEN_CATEGORIES = ['top-story', 'uncategorized'];

function toSummary(row: RawPost): PostSummary {
  const categories = (row.post_categories ?? [])
    .map(pc => pc.categories)
    .filter((c): c is { name: string; slug: string } => !!c)
    .filter(c => !HIDDEN_CATEGORIES.includes(c.slug));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: excerptFromHtml(row.content),
    featured_image: row.featured_image,
    published_at: row.published_at,
    author: row.author,
    view_count: row.view_count ?? 0,
    categories,
  };
}

function published(siteId: string) {
  return supabase.from('posts').select(SELECT).eq('site_id', siteId).eq('status', 'publish');
}

export async function getCategories(siteId: string) {
  const { data } = await supabase
    .from('categories').select('name, slug').eq('site_id', siteId).order('name');
  return (data ?? []).filter(c => !HIDDEN_CATEGORIES.includes(c.slug));
}

/** Hero band: 1 feature, 2 secondaries, 5 headlines. */
export async function getHeroPosts(siteId: string) {
  const { data } = await published(siteId)
    .order('is_top_story', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(8);

  const posts = (data ?? []).map(toSummary);
  return {
    feature: posts[0] ?? null,
    secondaries: posts.slice(1, 3),
    headlines: posts.slice(3, 8),
  };
}

export async function getTrendingPosts(siteId: string, excludeIds: string[]) {
  const { data } = await published(siteId)
    .order('published_at', { ascending: false })
    .limit(40);

  const posts = (data ?? []).map(toSummary).filter(p => !excludeIds.includes(p.id));
  return spreadByCategory(posts, 8, 2);
}

export async function getLatestPosts(
  siteId: string,
  { limit = 6, offset = 0, excludeIds = [] as string[] } = {}
) {
  const { data } = await published(siteId)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit + excludeIds.length - 1);

  return (data ?? []).map(toSummary).filter(p => !excludeIds.includes(p.id)).slice(0, limit);
}

/**
 * Popular ordering degrades gracefully: view_count leads, but every row starts
 * at 0, so is_top_story then recency decide until real traffic accumulates.
 */
export async function getPopularPosts(siteId: string, limit = 5) {
  const { data } = await published(siteId)
    .order('view_count', { ascending: false })
    .order('is_top_story', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map(toSummary);
}

export async function getPostsByCategory(
  siteId: string,
  categorySlug: string,
  { limit = 12, offset = 0 } = {}
) {
  const { data: category } = await supabase
    .from('categories').select('id, name, slug')
    .eq('site_id', siteId).eq('slug', categorySlug).maybeSingle();

  if (!category) return { category: null, posts: [] as PostSummary[] };

  const { data: links } = await supabase
    .from('post_categories').select('post_id').eq('category_id', category.id);

  const ids = (links ?? []).map(l => l.post_id);
  if (!ids.length) return { category, posts: [] as PostSummary[] };

  const { data } = await published(siteId)
    .in('id', ids)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { category, posts: (data ?? []).map(toSummary) };
}

export async function getPostBySlug(siteId: string, slug: string) {
  const { data } = await published(siteId).eq('slug', slug).maybeSingle();
  if (!data) return null;
  return { ...toSummary(data), content: data.content ?? '' };
}

export async function searchPosts(siteId: string, query: string, { limit = 20 } = {}) {
  if (!query.trim()) return [];
  const { data } = await published(siteId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data ?? []).map(toSummary);
}

export async function getActiveAd(siteId: string) {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('advertisements')
    .select('client_name, banner_url, target_link')
    .eq('site_id', siteId).eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .limit(1).maybeSingle();
  return data ?? null;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/text.ts src/lib/queries.ts tests/lib/text.test.ts
git commit -m "feat(data): site-scoped query layer with tested text utilities"
```

---

### Task 6: News primitives

**Files:**
- Create: `src/components/news/CategoryPill.tsx`, `Byline.tsx`, `ArticleCard.tsx`, `ArticleRow.tsx`, `HeadlineListItem.tsx`, `SectionHeading.tsx`, `AdSlot.tsx`

**Interfaces:**
- Consumes: `PostSummary` (Task 5), `getImageUrl` (Task 1)
- Produces: the seven components above. `ArticleCard` takes `{ post, variant?: 'feature' | 'standard' | 'compact', priority?: boolean }`. `ArticleRow` takes `{ post }`. `HeadlineListItem` takes `{ post, onDark?: boolean }`. `AdSlot` takes `{ ad, size: 'leaderboard' | 'rectangle' }`.

- [ ] **Step 1: `CategoryPill.tsx`**

```tsx
import Link from 'next/link';

export default function CategoryPill({
  category,
  variant = 'kicker',
}: {
  category: { name: string; slug: string };
  variant?: 'kicker' | 'solid';
}) {
  if (variant === 'solid') {
    return (
      <Link
        href={`/${category.slug}`}
        className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        {category.name}
      </Link>
    );
  }

  return (
    <Link href={`/${category.slug}`} className="category-kicker hover:underline">
      {category.name}
    </Link>
  );
}
```

- [ ] **Step 2: `Byline.tsx`**

```tsx
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Byline({
  author,
  publishedAt,
  onDark = false,
}: {
  author: string | null;
  publishedAt: string | null;
  onDark?: boolean;
}) {
  const color = onDark ? { color: 'var(--brand-hero-muted)' } : undefined;

  return (
    <div className="flex items-center gap-3 meta-text" style={color}>
      {author && (
        <span>
          By <span className="font-bold">{author}</span>
        </span>
      )}
      {publishedAt && (
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(new Date(publishedAt), 'MMMM d, yyyy')}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `ArticleCard.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/media';
import type { PostSummary } from '@/lib/queries';
import CategoryPill from './CategoryPill';
import Byline from './Byline';

const RATIO = {
  feature: 'aspect-[16/10]',
  standard: 'aspect-[16/9]',
  compact: 'aspect-[4/3]',
};

export default function ArticleCard({
  post,
  variant = 'standard',
  priority = false,
}: {
  post: PostSummary;
  variant?: 'feature' | 'standard' | 'compact';
  priority?: boolean;
}) {
  const category = post.categories[0];

  if (variant === 'feature') {
    return (
      <Link href={`/article/${post.slug}`} className="group block relative img-zoom">
        <div className={`relative w-full ${RATIO.feature}`}>
          <Image
            src={getImageUrl(post.featured_image)}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3">
          {category && <CategoryPill category={category} variant="solid" />}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-balance leading-tight">
            {post.title}
          </h2>
          <Byline author={post.author} publishedAt={post.published_at} onDark />
        </div>
      </Link>
    );
  }

  return (
    <article className="flex flex-col gap-3">
      <Link href={`/article/${post.slug}`} className="block img-zoom">
        <div className={`relative w-full ${RATIO[variant]}`}>
          <Image
            src={getImageUrl(post.featured_image)}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      </Link>
      {category && <CategoryPill category={category} />}
      <Link href={`/article/${post.slug}`}>
        <h3 className="font-bold leading-snug text-balance hover:text-[var(--brand-accent)] transition-colors">
          {post.title}
        </h3>
      </Link>
      <Byline author={post.author} publishedAt={post.published_at} />
    </article>
  );
}
```

- [ ] **Step 4: `ArticleRow.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/media';
import type { PostSummary } from '@/lib/queries';
import Byline from './Byline';

export default function ArticleRow({ post }: { post: PostSummary }) {
  return (
    <article className="flex flex-col sm:flex-row gap-5">
      <Link href={`/article/${post.slug}`} className="block img-zoom shrink-0">
        <div className="relative w-full sm:w-[260px] aspect-[4/3]">
          <Image
            src={getImageUrl(post.featured_image)}
            alt={post.title}
            fill
            sizes="260px"
            className="object-cover"
          />
        </div>
      </Link>
      <div className="flex flex-col gap-2">
        <Link href={`/article/${post.slug}`}>
          <h3 className="text-xl md:text-2xl font-bold leading-tight text-balance hover:text-[var(--brand-accent)] transition-colors">
            {post.title}
          </h3>
        </Link>
        <Byline author={post.author} publishedAt={post.published_at} />
        <p className="text-[15px] leading-relaxed text-[var(--color-muted)]">{post.excerpt}</p>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: `HeadlineListItem.tsx`**

```tsx
import Link from 'next/link';
import type { PostSummary } from '@/lib/queries';
import CategoryPill from './CategoryPill';
import Byline from './Byline';

export default function HeadlineListItem({
  post,
  onDark = false,
}: {
  post: PostSummary;
  onDark?: boolean;
}) {
  const category = post.categories[0];

  return (
    <article className="flex flex-col gap-2 py-5 border-b border-white/10 last:border-b-0">
      {category && <CategoryPill category={category} />}
      <Link href={`/article/${post.slug}`}>
        <h4
          className="text-lg font-bold leading-snug text-balance hover:opacity-80 transition-opacity"
          style={onDark ? { color: 'var(--brand-hero-text)' } : undefined}
        >
          {post.title}
        </h4>
      </Link>
      <Byline author={null} publishedAt={post.published_at} onDark={onDark} />
    </article>
  );
}
```

- [ ] **Step 6: `SectionHeading.tsx`**

```tsx
export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="section-heading">{children}</h2>;
}
```

- [ ] **Step 7: `AdSlot.tsx`**

```tsx
type Ad = { client_name: string; banner_url: string; target_link: string | null };

const SIZES = {
  leaderboard: 'h-[100px] max-w-4xl',
  rectangle: 'aspect-[300/250] w-full',
};

export default function AdSlot({
  ad,
  size,
}: {
  ad: Ad | null;
  size: 'leaderboard' | 'rectangle';
}) {
  if (!ad) return null;

  const banner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ad.banner_url} alt={ad.client_name} className="w-full h-full object-cover" />
  );

  return (
    <div className={`relative overflow-hidden bg-[var(--color-surface-alt)] ${SIZES[size]}`}>
      {ad.target_link ? (
        <a href={ad.target_link} target="_blank" rel="noopener sponsored">
          {banner}
        </a>
      ) : (
        banner
      )}
    </div>
  );
}
```

- [ ] **Step 8: Verify the build compiles**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/news
git commit -m "feat(ui): news primitives — cards, rows, bylines, pills, ad slot"
```

---

### Task 7: Site header and footer

**Files:**
- Create: `src/components/news/SiteHeader.tsx`, `src/components/news/SiteFooter.tsx`, `src/components/news/SearchBox.tsx`

**Interfaces:**
- Consumes: `SiteConfig` (Task 3), `getCategories`, `getLatestPosts` (Task 5)
- Produces: `SiteHeader({ site })`, `SiteFooter({ site, recentPosts })`. `SearchBox` is a client component.

- [ ] **Step 1: `SearchBox.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="flex items-center">
      {open && (
        <form onSubmit={submit}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stories"
            aria-label="Search stories"
            className="w-40 md:w-56 px-3 py-1.5 text-sm border border-[var(--color-hairline)] focus:outline-none focus:border-[var(--brand-accent)]"
          />
        </form>
      )}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close search' : 'Open search'}
        className="p-2 hover:text-[var(--brand-accent)] transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: `SiteHeader.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { SiteConfig } from '@/sites/types';
import SearchBox from './SearchBox';

export default function SiteHeader({ site }: { site: SiteConfig }) {
  return (
    <header className="w-full bg-white border-b border-[var(--color-hairline)]">
      <div className="max-w-[1300px] mx-auto px-6 h-[72px] flex items-center gap-8">
        <Link href="/" className="shrink-0">
          <Image
            src={site.logo.src}
            alt={site.logo.alt}
            width={site.logo.width}
            height={site.logo.height}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 flex-1">
          <Link
            href="/"
            className="text-[13px] font-bold uppercase tracking-wide hover:text-[var(--brand-accent)] transition-colors"
          >
            Home
          </Link>
          {site.nav.map(item => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="text-[13px] font-bold uppercase tracking-wide hover:text-[var(--brand-accent)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto lg:ml-0">
          <SearchBox />
        </div>
      </div>

      <nav className="lg:hidden border-t border-[var(--color-hairline)] overflow-x-auto">
        <div className="flex gap-5 px-6 py-3 whitespace-nowrap">
          {site.nav.map(item => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="text-[12px] font-bold uppercase tracking-wide"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
```

The reference's dark-mode toggle and "Saved Posts" button are intentionally absent — Saved Posts is on the deferred list, and a theme toggle is not in this spec.

- [ ] **Step 3: `SiteFooter.tsx`**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { SiteConfig } from '@/sites/types';
import type { PostSummary } from '@/lib/queries';
import NewsletterForm from './NewsletterForm';

export default function SiteFooter({
  site,
  recentPosts,
}: {
  site: SiteConfig;
  recentPosts: PostSummary[];
}) {
  return (
    <footer className="bg-[var(--color-surface-alt)] border-t border-[var(--color-hairline)] mt-20">
      <div className="max-w-[1300px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="flex flex-col gap-4">
          <Image
            src={site.logo.src}
            alt={site.logo.alt}
            width={site.logo.width}
            height={site.logo.height}
            className="h-9 w-auto"
          />
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">{site.tagline}</p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold">Recent Posts</h3>
          <ul className="flex flex-col gap-3">
            {recentPosts.slice(0, 3).map(post => (
              <li key={post.id}>
                <Link
                  href={`/article/${post.slug}`}
                  className="text-sm leading-snug hover:text-[var(--brand-accent)] transition-colors"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold">Categories</h3>
          <ul className="grid grid-cols-2 gap-y-2">
            {site.nav.map(item => (
              <li key={item.slug}>
                <Link
                  href={`/${item.slug}`}
                  className="text-sm hover:text-[var(--brand-accent)] transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold">Weekly Newsletter</h3>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Get the week&apos;s Bushbuckridge headlines in your inbox.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-[var(--color-hairline)]">
        <div className="max-w-[1300px] mx-auto px-6 py-5 text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: `NewsletterForm.tsx`**

Newsletter *delivery* is out of scope; capture is not. Store to a table so the addresses are not lost.

Add to `supabase/migrations/0001_categories_authors_views.sql` (re-run the file — every statement is idempotent):

```sql
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email      TEXT NOT NULL,
    site_id    TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (site_id, email)
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);
```

Create `src/components/news/NewsletterForm.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const params = useParams<{ site: string }>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim(), site_id: params.site });
    setStatus(error && error.code !== '23505' ? 'error' : 'done');
  }

  if (status === 'done') {
    return <p className="text-sm font-medium">You&apos;re signed up. Thanks.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Your email address"
        className="px-3 py-2.5 text-sm bg-white border border-[var(--color-hairline)] focus:outline-none focus:border-[var(--brand-accent)]"
      />
      <button
        type="submit"
        disabled={status === 'saving'}
        className="py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        {status === 'saving' ? 'Signing up…' : 'Sign Up'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-[var(--brand-accent)]">
          That didn&apos;t save. Please try again.
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 5: Apply the newsletter migration**

Re-run `supabase/migrations/0001_categories_authors_views.sql` in the Supabase SQL editor.
Expected: `Success. No rows returned.`

- [ ] **Step 6: Commit**

```bash
git add src/components/news supabase/migrations
git commit -m "feat(ui): site header, footer and newsletter capture"
```

---

### Task 8: Hero band

**Files:**
- Create: `src/components/news/HeroBand.tsx`

**Interfaces:**
- Consumes: `getHeroPosts` result shape, `ArticleCard`, `HeadlineListItem`
- Produces: `HeroBand({ feature, secondaries, headlines })`

- [ ] **Step 1: Write the component**

```tsx
import type { PostSummary } from '@/lib/queries';
import ArticleCard from './ArticleCard';
import HeadlineListItem from './HeadlineListItem';

export default function HeroBand({
  feature,
  secondaries,
  headlines,
}: {
  feature: PostSummary | null;
  secondaries: PostSummary[];
  headlines: PostSummary[];
}) {
  if (!feature) return null;

  return (
    <section
      className="w-full"
      style={{ backgroundColor: 'var(--brand-hero-bg)', color: 'var(--brand-hero-text)' }}
    >
      <div className="max-w-[1300px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <ArticleCard post={feature} variant="feature" priority />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {secondaries.map(post => (
              <div key={post.id} className="[&_h3]:text-white">
                <ArticleCard post={post} variant="standard" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          {headlines.map(post => (
            <HeadlineListItem key={post.id} post={post} onDark />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/news/HeroBand.tsx
git commit -m "feat(ui): hero band matching the reference layout"
```

---

### Task 9: Trending carousel and latest feed

**Files:**
- Create: `src/components/news/TrendingCarousel.tsx`, `src/components/news/LatestFeed.tsx`

**Interfaces:**
- Consumes: `PostSummary`, `ArticleCard`, `ArticleRow`, `SectionHeading`, `getLatestPosts`
- Produces: `TrendingCarousel({ posts })` (client component — it scrolls), `LatestFeed({ siteId, initialPosts, excludeIds })` (client component — Load More)

- [ ] **Step 1: `TrendingCarousel.tsx`**

```tsx
'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PostSummary } from '@/lib/queries';
import ArticleCard from './ArticleCard';
import SectionHeading from './SectionHeading';

export default function TrendingCarousel({ posts }: { posts: PostSummary[] }) {
  const track = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    track.current?.scrollBy({ left: direction * track.current.clientWidth, behavior: 'smooth' });
  }

  if (!posts.length) return null;

  return (
    <section className="max-w-[1300px] mx-auto px-6 py-14">
      <SectionHeading>Trending</SectionHeading>

      <div
        ref={track}
        className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] md:auto-cols-[minmax(0,25%)] gap-7 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {posts.map(post => (
          <ArticleCard key={post.id} post={post} variant="compact" />
        ))}
      </div>

      <div className="flex gap-2 mt-8">
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous trending stories"
          className="w-9 h-9 border border-[var(--color-hairline)] flex items-center justify-center hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Next trending stories"
          className="w-9 h-9 border border-[var(--color-hairline)] flex items-center justify-center hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add the Load More server action**

Create `src/lib/actions.ts`. It deliberately does **not** live under `src/app/[site]/` — importing across a path containing literal brackets is needlessly fragile.

```ts
'use server';

import { getLatestPosts } from '@/lib/queries';

export async function loadMorePosts(siteId: string, offset: number, excludeIds: string[]) {
  return getLatestPosts(siteId, { limit: 6, offset, excludeIds });
}
```

- [ ] **Step 3: `LatestFeed.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { PostSummary } from '@/lib/queries';
import ArticleRow from './ArticleRow';
import SectionHeading from './SectionHeading';
import { loadMorePosts } from '@/lib/actions';

const PAGE_SIZE = 6;

export default function LatestFeed({
  siteId,
  initialPosts,
  excludeIds,
}: {
  siteId: string;
  initialPosts: PostSummary[];
  excludeIds: string[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [exhausted, setExhausted] = useState(initialPosts.length < PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const next = await loadMorePosts(siteId, posts.length, excludeIds);
    setPosts(current => [...current, ...next]);
    setExhausted(next.length < PAGE_SIZE);
    setLoading(false);
  }

  return (
    <div>
      <SectionHeading>Latest story</SectionHeading>

      <div className="flex flex-col gap-10">
        {posts.map(post => (
          <ArticleRow key={post.id} post={post} />
        ))}
      </div>

      {!exhausted && (
        <div className="flex items-center gap-6 mt-12">
          <span className="flex-1 h-px bg-[var(--color-hairline)]" />
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 text-sm font-bold uppercase tracking-wide border border-[var(--color-hairline)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load More'}
          </button>
          <span className="flex-1 h-px bg-[var(--color-hairline)]" />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/news/TrendingCarousel.tsx src/components/news/LatestFeed.tsx src/lib/actions.ts
git commit -m "feat(ui): trending carousel and latest feed with load more"
```

---

### Task 10: Sidebar

**Files:**
- Create: `src/components/news/PopularPosts.tsx`, `src/components/news/Sidebar.tsx`

**Interfaces:**
- Consumes: `PostSummary`, `AdSlot`, `SectionHeading`, `getPopularPosts`, `getActiveAd`
- Produces: `Sidebar({ ad, popular })`

- [ ] **Step 1: `PopularPosts.tsx`**

The reference numbers these 01–05. That numbering is real information — it is a ranking, not decoration — so it stays.

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/media';
import type { PostSummary } from '@/lib/queries';
import SectionHeading from './SectionHeading';

export default function PopularPosts({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) return null;

  const [lead, ...rest] = posts;

  return (
    <section>
      <SectionHeading>Popular posts</SectionHeading>

      <Link href={`/article/${lead.slug}`} className="block img-zoom">
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={getImageUrl(lead.featured_image)}
            alt={lead.title}
            fill
            sizes="300px"
            className="object-cover"
          />
        </div>
      </Link>

      <div className="flex items-start gap-4 py-4 border-b border-[var(--color-hairline)]">
        <Link href={`/article/${lead.slug}`} className="flex-1">
          <h4 className="font-bold leading-snug hover:text-[var(--brand-accent)] transition-colors">
            {lead.title}
          </h4>
        </Link>
        <span className="text-3xl font-bold text-[var(--color-hairline)] tabular-nums">01</span>
      </div>

      <ol className="flex flex-col">
        {rest.map((post, i) => (
          <li
            key={post.id}
            className="flex items-start gap-4 py-4 border-b border-[var(--color-hairline)] last:border-b-0"
          >
            <span className="w-10 h-10 shrink-0 rounded-full border border-[var(--color-hairline)] flex items-center justify-center text-sm font-bold text-[var(--color-muted)] tabular-nums">
              {String(i + 2).padStart(2, '0')}
            </span>
            <Link href={`/article/${post.slug}`}>
              <h4 className="text-sm font-bold leading-snug hover:text-[var(--brand-accent)] transition-colors">
                {post.title}
              </h4>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 2: `Sidebar.tsx`**

```tsx
import type { PostSummary } from '@/lib/queries';
import AdSlot from './AdSlot';
import PopularPosts from './PopularPosts';

type Ad = { client_name: string; banner_url: string; target_link: string | null };

export default function Sidebar({ ad, popular }: { ad: Ad | null; popular: PostSummary[] }) {
  return (
    <aside className="flex flex-col gap-12">
      <AdSlot ad={ad} size="rectangle" />
      <PopularPosts posts={popular} />
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/news/PopularPosts.tsx src/components/news/Sidebar.tsx
git commit -m "feat(ui): sidebar with ad slot and ranked popular posts"
```

---

### Task 11: Bushnews homepage

**Files:**
- Create: `src/sites/bushnews/HomePage.tsx`, `src/app/[site]/page.tsx`

**Interfaces:**
- Consumes: every module from Tasks 7–10, every query from Task 5
- Produces: `BushnewsHomePage({ site })`; the `/` route for any tenant dispatches by site id.

- [ ] **Step 1: `src/sites/bushnews/HomePage.tsx`**

```tsx
import type { SiteConfig } from '../types';
import {
  getHeroPosts, getTrendingPosts, getLatestPosts, getPopularPosts, getActiveAd,
} from '@/lib/queries';
import SiteHeader from '@/components/news/SiteHeader';
import SiteFooter from '@/components/news/SiteFooter';
import HeroBand from '@/components/news/HeroBand';
import TrendingCarousel from '@/components/news/TrendingCarousel';
import LatestFeed from '@/components/news/LatestFeed';
import Sidebar from '@/components/news/Sidebar';

export default async function BushnewsHomePage({ site }: { site: SiteConfig }) {
  const hero = await getHeroPosts(site.id);
  const heroIds = [hero.feature?.id, ...hero.secondaries.map(p => p.id), ...hero.headlines.map(p => p.id)]
    .filter((id): id is string => !!id);

  const [trending, latest, popular, ad] = await Promise.all([
    getTrendingPosts(site.id, heroIds),
    getLatestPosts(site.id, { limit: 6, excludeIds: heroIds }),
    getPopularPosts(site.id, 5),
    getActiveAd(site.id),
  ]);

  return (
    <>
      <SiteHeader site={site} />
      <HeroBand {...hero} />
      <TrendingCarousel posts={trending} />

      <section className="max-w-[1300px] mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <LatestFeed siteId={site.id} initialPosts={latest} excludeIds={heroIds} />
        </div>
        <div className="lg:col-span-4">
          <Sidebar ad={ad} popular={popular} />
        </div>
      </section>

      <SiteFooter site={site} recentPosts={latest} />
    </>
  );
}
```

- [ ] **Step 2: `src/app/[site]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { getSiteById } from '@/sites/registry';
import type { SiteConfig } from '@/sites/types';
import BushnewsHomePage from '@/sites/bushnews/HomePage';

export const revalidate = 300;

/** Each site supplies its own homepage composition. Add a line per new title. */
type HomePageComponent = (props: { site: SiteConfig }) => Promise<React.ReactElement>;

const HOME_PAGES: Record<string, HomePageComponent> = {
  'bushbuckridge-news': BushnewsHomePage,
};

export default async function Page({ params }: { params: Promise<{ site: string }> }) {
  const { site: siteId } = await params;
  const site = getSiteById(siteId);
  if (!site) notFound();

  const HomePage = HOME_PAGES[site.id];
  if (!HomePage) notFound();

  return <HomePage site={site} />;
}
```

- [ ] **Step 3: Run the site and check it renders**

Run: `npm run dev`, open <http://localhost:3000>
Expected: header with 6 categories, dark hero band with a large feature plus 2 secondaries plus 5 headlines, trending row, latest feed with Load More, sidebar with popular posts, 4-column footer. All content is real Bushnews articles.

- [ ] **Step 4: Commit**

```bash
git add src/sites/bushnews/HomePage.tsx src/app/[site]/page.tsx
git commit -m "feat(bushnews): homepage composed from shared news modules"
```

---

### Task 12: Category, article and search routes

**Files:**
- Create: `src/components/news/ViewBeacon.tsx`, `src/app/[site]/[category]/page.tsx`, `src/app/[site]/article/[slug]/page.tsx`, `src/app/[site]/search/page.tsx`, `src/app/[site]/not-found.tsx`

**Interfaces:**
- Consumes: `getPostsByCategory`, `getPostBySlug`, `searchPosts`, `getPopularPosts`, `getActiveAd`, all UI modules, RPC `increment_view_count` (Task 2)
- Produces: `ViewBeacon({ slug, siteId })` and the three public routes

- [ ] **Step 1: `ViewBeacon.tsx`**

The article route imports this, so it must exist first. Article pages are statically cached, so the count is incremented from the browser rather than during render.

Create `src/components/news/ViewBeacon.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ViewBeacon({ slug, siteId }: { slug: string; siteId: string }) {
  useEffect(() => {
    const key = `viewed:${siteId}:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    supabase.rpc('increment_view_count', { p_slug: slug, p_site_id: siteId });
  }, [slug, siteId]);

  return null;
}
```

- [ ] **Step 2: Category route**

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSiteById } from '@/sites/registry';
import { getPostsByCategory, getPopularPosts, getActiveAd } from '@/lib/queries';
import SiteHeader from '@/components/news/SiteHeader';
import SiteFooter from '@/components/news/SiteFooter';
import SectionHeading from '@/components/news/SectionHeading';
import ArticleRow from '@/components/news/ArticleRow';
import Sidebar from '@/components/news/Sidebar';

export const revalidate = 300;

type Props = { params: Promise<{ site: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site: siteId, category } = await params;
  const site = getSiteById(siteId);
  const item = site?.nav.find(n => n.slug === category);
  return item && site ? { title: `${item.label} — ${site.name}` } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { site: siteId, category: slug } = await params;
  const site = getSiteById(siteId);
  if (!site) notFound();
  if (!site.nav.some(n => n.slug === slug)) notFound();

  const { category, posts } = await getPostsByCategory(site.id, slug, { limit: 12 });
  if (!category) notFound();

  const [popular, ad] = await Promise.all([getPopularPosts(site.id, 5), getActiveAd(site.id)]);

  return (
    <>
      <SiteHeader site={site} />
      <section className="max-w-[1300px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <SectionHeading>{category.name}</SectionHeading>
          {posts.length === 0 ? (
            <p className="text-[var(--color-muted)]">No stories in this section yet.</p>
          ) : (
            <div className="flex flex-col gap-10">
              {posts.map(post => <ArticleRow key={post.id} post={post} />)}
            </div>
          )}
        </div>
        <div className="lg:col-span-4">
          <Sidebar ad={ad} popular={popular} />
        </div>
      </section>
      <SiteFooter site={site} recentPosts={posts.slice(0, 3)} />
    </>
  );
}
```

- [ ] **Step 3: Article route**

```tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getSiteById } from '@/sites/registry';
import { getPostBySlug, getPopularPosts, getActiveAd } from '@/lib/queries';
import { getImageUrl } from '@/lib/media';
import SiteHeader from '@/components/news/SiteHeader';
import SiteFooter from '@/components/news/SiteFooter';
import Sidebar from '@/components/news/Sidebar';
import CategoryPill from '@/components/news/CategoryPill';
import Byline from '@/components/news/Byline';
import ViewBeacon from '@/components/news/ViewBeacon';

export const revalidate = 300;

type Props = { params: Promise<{ site: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site: siteId, slug } = await params;
  const site = getSiteById(siteId);
  if (!site) return {};
  const post = await getPostBySlug(site.id, slug);
  if (!post) return {};
  return {
    title: `${post.title} — ${site.name}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [getImageUrl(post.featured_image)] : [],
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { site: siteId, slug } = await params;
  const site = getSiteById(siteId);
  if (!site) notFound();

  const post = await getPostBySlug(site.id, slug);
  if (!post) notFound();

  const [popular, ad] = await Promise.all([getPopularPosts(site.id, 5), getActiveAd(site.id)]);

  return (
    <>
      <SiteHeader site={site} />
      <ViewBeacon slug={post.slug} siteId={site.id} />

      <article className="max-w-[1300px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {post.categories[0] && <CategoryPill category={post.categories[0]} variant="solid" />}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-balance">{post.title}</h1>
          <Byline author={post.author} publishedAt={post.published_at} />

          {post.featured_image && (
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={getImageUrl(post.featured_image)}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
          )}

          <div
            className="prose max-w-[68ch] text-[17px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <div className="lg:col-span-4">
          <Sidebar ad={ad} popular={popular} />
        </div>
      </article>

      <SiteFooter site={site} recentPosts={popular.slice(0, 3)} />
    </>
  );
}
```

The article body is trusted HTML from the client's own WordPress export, rendered with `dangerouslySetInnerHTML` exactly as the current article page already does. When the admin phase opens authoring to more people, that content becomes untrusted and must be sanitised — note it in the admin spec.

- [ ] **Step 4: Search route**

```tsx
import { notFound } from 'next/navigation';
import { getSiteById } from '@/sites/registry';
import { searchPosts, getPopularPosts, getActiveAd } from '@/lib/queries';
import SiteHeader from '@/components/news/SiteHeader';
import SiteFooter from '@/components/news/SiteFooter';
import SectionHeading from '@/components/news/SectionHeading';
import ArticleRow from '@/components/news/ArticleRow';
import Sidebar from '@/components/news/Sidebar';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ site: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { site: siteId } = await params;
  const { q = '' } = await searchParams;

  const site = getSiteById(siteId);
  if (!site) notFound();

  const [posts, popular, ad] = await Promise.all([
    searchPosts(site.id, q),
    getPopularPosts(site.id, 5),
    getActiveAd(site.id),
  ]);

  return (
    <>
      <SiteHeader site={site} />
      <section className="max-w-[1300px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <SectionHeading>
            {q ? `${posts.length} result${posts.length === 1 ? '' : 's'} for “${q}”` : 'Search'}
          </SectionHeading>
          <div className="flex flex-col gap-10">
            {posts.map(post => <ArticleRow key={post.id} post={post} />)}
          </div>
          {q && posts.length === 0 && (
            <p className="text-[var(--color-muted)]">
              Nothing matched that search. Try a different word.
            </p>
          )}
        </div>
        <div className="lg:col-span-4">
          <Sidebar ad={ad} popular={popular} />
        </div>
      </section>
      <SiteFooter site={site} recentPosts={popular.slice(0, 3)} />
    </>
  );
}
```

- [ ] **Step 5: Not-found page**

Create `src/app/[site]/not-found.tsx`:

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-[1300px] mx-auto px-6 py-32 text-center flex flex-col gap-5">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-[var(--color-muted)]">
        That story may have moved, or the link may be wrong.
      </p>
      <Link href="/" className="font-bold text-[var(--brand-accent)] hover:underline">
        Back to the homepage
      </Link>
    </main>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add "src/app/[site]" src/components/news/ViewBeacon.tsx
git commit -m "feat(routes): category, article, search and not-found pages"
```

---

### Task 13: Verify view counting end to end

**Files:** none — this task verifies the `ViewBeacon` built in Task 12 against the RPC built in Task 2.

**Interfaces:**
- Consumes: `ViewBeacon` (Task 12), RPC `increment_view_count` (Task 2)
- Produces: confirmation that `posts.view_count` actually rises, which is what makes `getPopularPosts` meaningful

- [ ] **Step 1: Confirm the RPC is callable by the anon role**

In the Supabase SQL editor:

```sql
SELECT has_function_privilege('anon', 'public.increment_view_count(text,text)', 'execute');
```
Expected: `true`. If `false`, re-run the `GRANT EXECUTE` line from Task 2.

- [ ] **Step 2: Drive the flow**

Run `npm run dev`, open any article, then reload the page once.

- [ ] **Step 3: Check the count**

```sql
SELECT slug, view_count FROM posts WHERE view_count > 0;
```
Expected: exactly one row with `view_count` = 1. The `1` — not `2` — proves the session guard works; a second row means the beacon fired on a page it shouldn't have.

- [ ] **Step 4: Confirm Popular reorders**

Bump one article well above the others and reload the homepage:

```sql
UPDATE posts SET view_count = 500 WHERE slug = '<the slug you opened>';
```
Expected: that article is now `01` in the Popular posts sidebar. Reset it afterwards with `UPDATE posts SET view_count = 1 WHERE slug = '<slug>';`

---

### Task 14: Media migration to Cloudflare R2

**Files:**
- Create: `wp-migration/migrate-media-to-r2.js`
- Modify: `src/lib/media.ts`, `next.config.ts`, `.env.local`

**Interfaces:**
- Consumes: existing Supabase Storage `media` bucket
- Produces: `getImageUrl` resolving against `NEXT_PUBLIC_MEDIA_BASE_URL`

**Blocked on:** Cloudflare R2 account, bucket, public URL, and an API token from Alec. Do not start this task until those exist.

- [ ] **Step 1: Add env vars**

Add to `.env.local` (values from the R2 dashboard):

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=bushnews-media
NEXT_PUBLIC_MEDIA_BASE_URL=https://media.bushnews.co.za
```

- [ ] **Step 2: Write the transfer script**

```bash
npm install -D @aws-sdk/client-s3
```

Create `wp-migration/migrate-media-to-r2.js`:

```js
require('dotenv').config({ path: '../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

async function listAll(prefix = '') {
  const out = [];
  const { data, error } = await supabase.storage.from('media').list(prefix, { limit: 1000 });
  if (error) throw error;
  for (const entry of data) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) out.push(...await listAll(path));
    else out.push(path);
  }
  return out;
}

async function main() {
  const paths = await listAll();
  console.log(`objects to copy: ${paths.length}`);

  let copied = 0;
  for (const path of paths) {
    const { data, error } = await supabase.storage.from('media').download(path);
    if (error) { console.error(`download failed: ${path}`, error.message); continue; }

    const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: path,
      Body: Buffer.from(await data.arrayBuffer()),
      ContentType: TYPES[ext] || 'application/octet-stream',
    }));
    copied++;
    if (copied % 100 === 0) console.log(`copied ${copied}/${paths.length}`);
  }

  console.log(`done: ${copied}/${paths.length} copied`);
  if (copied !== paths.length) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Run the transfer**

Run: `cd wp-migration && node migrate-media-to-r2.js`
Expected: final line `done: N/N copied` with both numbers equal.

- [ ] **Step 4: Repoint `getImageUrl`**

Replace `src/lib/media.ts`:

```ts
const BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export function getImageUrl(path: string | null) {
  if (!path) return '/placeholder-news.jpg';
  if (path.startsWith('http')) return path;
  if (!BASE) throw new Error('NEXT_PUBLIC_MEDIA_BASE_URL is not set');
  return `${BASE}/${path.replace(/^\/+/, '')}`;
}
```

Remove the `export { getImageUrl } from './media';` line from `src/lib/supabase.ts` — nothing imports it from there any more.

- [ ] **Step 5: Update `next.config.ts`**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: new URL(process.env.NEXT_PUBLIC_MEDIA_BASE_URL!).hostname },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Verify no Supabase Storage URLs remain**

Run: `grep -r "storage.from('media')" src/ || echo "clean"`
Expected: `clean`. (Git Bash — in PowerShell use `Select-String -Path src\* -Pattern "storage.from" -Recurse`.)

Then `npm run dev` and confirm images still load on the homepage and an article page.

- [ ] **Step 7: Commit**

```bash
git add wp-migration/migrate-media-to-r2.js src/lib/media.ts src/lib/supabase.ts next.config.ts package.json
git commit -m "feat(media): serve images from Cloudflare R2 instead of Supabase Storage"
```

---

### Task 15: Remove superseded code and verify against the success criteria

**Files:**
- Delete: `src/components/Hero.tsx`, `src/components/Features.tsx`, `src/components/Navbar.tsx`, `src/lib/demo-content.ts`, `src/app/article/`
- Create: `e2e/public-site.spec.ts`

**Interfaces:**
- Consumes: everything above
- Produces: a passing E2E suite covering the spec's success criteria

- [ ] **Step 1: Confirm nothing imports the old components**

Run: `grep -rE "demo-content|components/(Hero|Features|Navbar)" src/ || echo "clean"`
Expected: `clean`. If not, fix the importer first.

- [ ] **Step 2: Delete them**

```bash
git rm -r src/components/Hero.tsx src/components/Features.tsx src/components/Navbar.tsx src/lib/demo-content.ts src/app/article
```

- [ ] **Step 3: Write the E2E suite**

Create `e2e/public-site.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const CATEGORIES = ['community', 'crime', 'lifestyle', 'sports', 'politics', 'notice'];

test('homepage renders the hero, trending, latest feed and sidebar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2 })).not.toHaveCount(0);
  await expect(page.getByText('Trending')).toBeVisible();
  await expect(page.getByText('Latest story')).toBeVisible();
  await expect(page.getByText('Popular posts')).toBeVisible();
});

test('homepage shows no placeholder content', async ({ page }) => {
  await page.goto('/');
  const body = await page.textContent('body');
  expect(body).not.toContain('Lorem ipsum');
  expect(body).not.toContain('JOHN DOE');
});

for (const slug of CATEGORIES) {
  test(`category /${slug} resolves and lists stories`, async ({ page }) => {
    const response = await page.goto(`/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('article')).not.toHaveCount(0);
  });
}

test('every nav link resolves', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('header nav a').evaluateAll(
    links => links.map(l => (l as HTMLAnchorElement).getAttribute('href'))
  );
  for (const href of hrefs) {
    if (!href) continue;
    const response = await page.goto(href);
    expect(response?.status(), `${href} should not 404`).toBe(200);
  }
});

test('search returns results', async ({ page }) => {
  await page.goto('/search?q=Bushbuckridge');
  await expect(page.locator('article').first()).toBeVisible();
});

test('an article page renders byline, image and body', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href^="/article/"]').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.prose')).not.toBeEmpty();
});

test('an unknown host is rejected', async ({ request }) => {
  const response = await request.get('/', { headers: { host: 'not-a-known-site.example' } });
  expect(response.status()).toBe(404);
});

for (const [width, height] of [[1440, 900], [768, 1024], [375, 812]] as const) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflows).toBe(false);
  });
}
```

- [ ] **Step 4: Run everything**

```bash
npm test
npm run build
npm run e2e
```
Expected: all three pass. Fix failures before continuing — this is the spec's verification gate, not a formality.

- [ ] **Step 5: Prove tenant isolation manually**

In the Supabase SQL editor:

```sql
INSERT INTO posts (title, slug, content, status, site_id, published_at)
VALUES ('ISOLATION CANARY', 'isolation-canary', 'canary', 'publish', 'test-site', NOW());
```

Reload the homepage and search for "ISOLATION CANARY". Expected: it does **not** appear anywhere.

Then remove it:

```sql
DELETE FROM posts WHERE site_id = 'test-site';
```

- [ ] **Step 6: Check Lighthouse**

Run: `npx lighthouse http://localhost:3000/article/<any-slug> --only-categories=performance --quiet --chrome-flags="--headless"`
Expected: performance ≥ 90. If below, check that images use `next/image` with correct `sizes` and that only the hero feature has `priority`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: E2E coverage for the public site; remove superseded components"
```

---

### Task 16: Rename the project and split the repository

**Files:** the whole directory

**Interfaces:**
- Consumes: a fully working, verified site
- Produces: `newsroom-platform/` as its own private GitHub repo

This is deliberately last. It involves a Vercel dashboard change that cannot be scripted, and doing it earlier would block the build if anything went wrong.

- [ ] **Step 1: Confirm the working tree is clean**

Run: `git status --porcelain -- .`
Expected: no output.

- [ ] **Step 2: Rename the directory**

```bash
cd ..
git mv bushbuckridge-news newsroom-platform
git commit -m "chore: rename bushbuckridge-news to newsroom-platform"
```

- [ ] **Step 3: Reinstall and rebuild**

```bash
cd newsroom-platform
rm -rf .next
npm install
npm run build
```
Expected: PASS.

- [ ] **Step 4: Update Vercel (manual — Alec)**

In the Vercel dashboard for this project: **Settings → General → Root Directory**, change `bushbuckridge-news` to `newsroom-platform`. Then **Settings → Domains**, confirm `bushnews.co.za` and `www.bushnews.co.za` are attached.

Without this the next deploy fails to find the project.

- [ ] **Step 5: Split into its own repository**

Follow the same `git filter-repo` procedure used for the other project splits, then push to a new private GitHub repo named `newsroom-platform`.

- [ ] **Step 6: Add the Supabase keep-alive workflow**

The new repo needs the standard keep-alive workflow so the free-tier database never pauses. Copy `.github/workflows/keep-alive.yml` from an existing split repo and point it at this project's Supabase credentials.

---

## Post-Plan: what to raise with the client

Carried from spec §10 — none of these block the build, but all three need answers before cutover:

1. **Archive depth** — ~1,000 pre-2025 posts are still not migrated.
2. **`noindex, nofollow`** on the live `bushnews.co.za` must be resolved.
3. **A higher-resolution logo** than the 200px WordPress upload.

## Post-Plan: deferred, to re-surface at the admin spec

Saved Posts / bookmarks · comments and comment counts · share counts · AI features · admin CMS · ad booking portal · sanitising article HTML once authoring opens to more people.
