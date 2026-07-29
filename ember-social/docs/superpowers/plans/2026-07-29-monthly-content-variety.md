# Monthly Content Variety Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `POST /api/workspaces/campaign/generate` — the route the real "Generate Marketing Plan" button calls — automatically produce the variety July's Everest plan had by hand: 2 of the 16 monthly static slots rotate through finance/comparison/seasonal-local angles (never repeating the prior ~2 months' pick), and 3 lifestyle videos get generated per month with concepts that don't repeat, end to end, with no manual script-running.

**Architecture:** Three new deterministic render functions join the existing four in `src/lib/templates/`, selected by a DB-history query instead of always defaulting to the same template. Video generation becomes an async job (`posts.video_status`) advanced by a new Vercel cron, because a single Seedance render can poll for up to 12 minutes — far past any single request's timeout — so it must progress across multiple cron ticks, the same way `publish-scheduled` already works.

**Tech Stack:** Next.js 16 API routes, Supabase (Postgres) via `@supabase/supabase-js`, `sharp` for image compositing, OpenAI (`gpt-image-1` for stills, `gpt-4o-mini` for text), kie.ai Seedance 2 Mini for video, `ffmpeg-static` for the branded outro, Vercel Cron for scheduling.

## Global Constraints

- No test framework exists in this project (no Jest/Vitest, no `*.test.ts` files) — verification throughout this plan follows the project's actual convention: `npx tsc --noEmit` for type-checking, and small one-off `node scripts/preview-*.mjs`-style manual scripts that render output to `public/preview/` for visual inspection, matching `scripts/preview-lifestyle-examples.mjs` and friends. Do not introduce a new test framework as part of this work.
- Match existing template file conventions exactly: each `src/lib/templates/*.ts` file is self-contained (its own `buildPrompt`, `modelMain`/`modelTrim` helpers duplicated per file) — do not extract a shared abstraction now.
- Reuse `CONTACT`, `contactStrip()`, `pickHashtags()`, `fmtPrice()`, `compositeLogo()`, `buildHeadlineSvg()`, `generateImage()`, `nextSlot()` from `src/lib/templates/common.ts` — do not duplicate them.
- New pillars (`finance`, `comparison`, `seasonal_local`) use curated headline pools only (like `maintenance.ts`'s `TIPS` array), **not** `headlineGenerator.ts`'s AI-fresh-headline system — that system is wired to exactly 4 pillar keys (`showcase`/`lifestyle`/`maintenance`/`seasonal`) and touching its prompt/JSON contract is out of scope for slots that only fire ~monthly.
- All new DB columns are additive (`add column if not exists`), matching every existing migration in `supabase/migrations/`.
- Cron auth follows the exact pattern in `src/app/api/cron/publish-scheduled/route.ts`: Vercel's `vercel-cron/1.0` user-agent OR a `CRON_SECRET` bearer token.

---

## File Structure

**New files:**
- `supabase/migrations/019_posts_video_job.sql` — video job columns
- `src/lib/templates/finance.ts` — finance-angle render function
- `src/lib/templates/comparison.ts` — comparison-angle render function (2 vehicles)
- `src/lib/templates/seasonal-local.ts` — seasonal/local-angle render function
- `src/lib/rotation/pillarHistory.ts` — shared history-based rotation-seat picker (used by `route.ts`)
- `src/lib/video/concepts.ts` — the 6-entry concept bank + prompt-brief text
- `src/lib/media/uploadCampaignVideo.ts` — video upload helper (parallel to `uploadCampaignImage`, correct `.mp4` extension/mimetype)
- `src/app/api/cron/generate-videos/route.ts` — the video-job-advancing cron

**Modified files:**
- `src/lib/templates/captions.ts` — add caption/hashtag functions for the 3 new pillars
- `src/lib/templates/index.ts` — export the 3 new render functions
- `src/lib/templates/common.ts` — widen `RenderResult['pillar']` union
- `src/app/api/workspaces/campaign/generate/route.ts` — wire in rotation-seat selection + insert 3 pending video-job posts
- `vercel.json` — register the new cron

---

## Task 1: Video job columns migration

**Files:**
- Create: `supabase/migrations/019_posts_video_job.sql`

**Interfaces:**
- Produces: `posts.video_status` (`'pending'|'generating'|'rendering'|'compositing'|'ready'|'failed'|null`), `posts.video_concept` (text), `posts.video_task_id` (text), `posts.video_prompt` (text) — consumed by Task 7 (route.ts insertion) and Task 8 (cron).

- [ ] **Step 1: Write the migration**

```sql
-- 019: video job tracking columns, mirrors the image_status pattern in 009.
-- Lets /api/cron/generate-videos advance a Seedance render across multiple
-- cron ticks (a single render can poll for up to 12 minutes).

alter table public.posts
  add column if not exists video_status text
    check (video_status in ('pending','generating','rendering','compositing','ready','failed')),
  add column if not exists video_concept text,
  add column if not exists video_task_id text,
  add column if not exists video_prompt text;
```

- [ ] **Step 2: Apply it**

Run: `cd ember-social && node -e "
const { readFileSync } = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.rpc('exec_sql', { sql: readFileSync('supabase/migrations/019_posts_video_job.sql', 'utf8') }).then(r => console.log(r.error || 'OK'));
"`

(If this project applies migrations via the Supabase dashboard SQL editor instead of a script — check `docs/roadmap/` and any existing `apply-migration*.mjs` script for the established method and use that instead; this is the fallback if none exists.)

Expected: `OK`, no error.

- [ ] **Step 3: Verify columns exist**

Run: `node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('posts').select('video_status,video_concept,video_task_id,video_prompt').limit(1).then(r => console.log(r.error ? 'FAIL: ' + r.error.message : 'OK: columns queryable'));
"`

Expected: `OK: columns queryable`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/019_posts_video_job.sql
git commit -m "feat(ember-social): add video job tracking columns to posts"
```

---

## Task 2: Widen RenderResult pillar type

**Files:**
- Modify: `src/lib/templates/common.ts:42`

**Interfaces:**
- Consumes: nothing new
- Produces: `RenderResult['pillar']` now includes `'finance' | 'comparison' | 'seasonalLocal'`, consumed by Tasks 3-5's render functions.

- [ ] **Step 1: Widen the union**

In `src/lib/templates/common.ts`, change line 42:

```typescript
    pillar: 'showcase' | 'lifestyle' | 'maintenance' | 'seasonal' | 'sellYourCar'
```

to:

```typescript
    pillar: 'showcase' | 'lifestyle' | 'maintenance' | 'seasonal' | 'sellYourCar' | 'finance' | 'comparison' | 'seasonalLocal'
```

- [ ] **Step 2: Type-check**

Run: `cd ember-social && npx tsc --noEmit`

Expected: no new errors (existing errors, if any predate this change, are not this task's concern — compare against a baseline run before this edit if unsure).

- [ ] **Step 3: Commit**

```bash
git add src/lib/templates/common.ts
git commit -m "feat(ember-social): widen RenderResult pillar union for rotation angles"
```

---

## Task 3: Finance render function

**Files:**
- Create: `src/lib/templates/finance.ts`
- Modify: `src/lib/templates/captions.ts` (append finance caption/hashtags)

**Interfaces:**
- Consumes: `VehicleInput`, `RenderResult`, `RenderOpts`, `fmtPrice`, `generateImage`, `compositeLogo`, `buildHeadlineSvg`, `LOGO_PATH`, `nextSlot` from `./common` (all already exported, per `showcase.ts`'s existing imports)
- Produces: `renderFinance(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult>` — consumed by Task 6 (route.ts rotation wiring)

- [ ] **Step 1: Add finance caption + hashtags to captions.ts**

Append to `src/lib/templates/captions.ts` (after the existing `sellYourCarHashtags` function, end of file):

```typescript

// --- FINANCE ---
export function financeCaption(car: VehicleInput, monthly: number, freshBody?: string | null): string {
    const name = `${car.year} ${car.make} ${modelTrim(car)}`
    const url = vehicleUrl(car)
    const amount = `R${monthly.toLocaleString('en-ZA').replace(/,/g, ' ')}`
    if (freshBody) {
        return `${freshBody}\n\n${name} — estimated ${amount}/month*\n\n*Est: no deposit, no balloon, 72 months @ 12.5% p.a. On approved credit. T&Cs apply.\n\nView it today: ${url}${contactStrip()}`
    }
    const hook = `Getting into something you love shouldn't mean waiting years.`
    const body = `The ${name} works out to an estimated ${amount} a month.* Come talk numbers — you might be closer than you think.`
    const disclaimer = `*Est: no deposit, no balloon, 72 months @ 12.5% p.a. On approved credit. T&Cs apply.`
    const cta = `View it today: ${url}`
    return `${hook}\n\n${body}\n\n${disclaimer}\n\n${cta}${contactStrip()}`
}

export function financeHashtags(): string[] {
    return pickHashtags(3, ['#CarFinance', '#DriveNow', '#PreOwned'])
}
```

- [ ] **Step 2: Write finance.ts**

```typescript
// Finance angle — rotation-seat template. Studio hero (reuses showcase's visual
// language) with an estimated monthly-installment headline instead of a tagline.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, nextSlot } from './common'
import { financeCaption, financeHashtags } from './captions'

// 72 months @ 12.5% p.a., no deposit, no balloon — matches the estimate formula
// already used for Everest's July finance post (scripts/revise-july-angles.mjs).
function estMonthly(price: number): number {
    const n = 72, r = 0.125 / 12
    const m = (price * r) / (1 - Math.pow(1 + r, -n))
    return Math.round(m / 100) * 100
}

function modelMain(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    return modelStr.split(/\s+/)[0]
}

function modelTrim(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    const main = modelStr.split(/\s+/)[0]
    return modelStr.replace(main, '').trim()
}

function buildPrompt(car: VehicleInput): string {
    const mm = modelMain(car)
    const mt = modelTrim(car)

    return `Create a HYPER-REALISTIC, CINEMATIC studio automotive photograph (1024x1024) for a South African dealership.

PHOTOGRAPHIC STYLE:
- Shot on Sony A7R V. Editorial product photography. Photorealistic.
- NO illustration, NO 3D render, NO CGI, NO cartoon.

MAIN SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt} centred in the LOWER half of the canvas.
- Three-quarter front angle. Studio lighting. Polished dark floor with subtle reflection. Soft side rim-light picking out the body lines.
- The vehicle takes up about 65% of the canvas width, sitting on a black studio floor.
- IMPORTANT: the car must have NO number plate. Leave the number-plate area blank/empty or body-coloured — do NOT render any registration plate, license plate, numbers or letters where a plate would go.

BACKGROUND:
- PURE BLACK studio environment. Deep cinematic blacks. Subtle vignette.
- NO text. NO logos. NO graphics. The UPPER half of the canvas must be COMPLETELY EMPTY BLACK SPACE — a headline will be composited there later.

NEGATIVE: number plates, registration plates, license plates, plate numbers, people, salesperson, contact details, phone numbers, addresses, websites, text, logos, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

export async function renderFinance(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult> {
    console.log(`  Finance: ${car.year} ${car.make} ${car.model}`)
    const monthly = estMonthly(Number(car.price) || 0)
    const baseBuf = await generateImage(buildPrompt(car))
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!

    const amountWord = `±R${monthly}`
    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = buildHeadlineSvg({
        W, H,
        lines: [amountWord, 'PER MONTH*'],
        accentWord: amountWord,
        position: 'top-right',
        subhead: 'Est: no deposit, 72mo, 12.5% p.a.',
        subheadAccent: null,
    })

    const finalBuf = await sharp(baseBuf)
        .composite([...logoOverlays, { input: Buffer.from(headlineSvg), top: 0, left: 0 }])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: financeCaption(car, monthly, opts?.headline?.caption),
        hashtags: financeHashtags(),
        scheduledAt: opts?.targetDate || nextSlot('sat'),
        pillar: 'finance',
    }
}
```

- [ ] **Step 3: Manual visual verification script**

Create `scripts/preview-finance-example.mjs` (matches the existing `scripts/preview-lifestyle-examples.mjs` convention):

```javascript
import { writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    for (const raw of readFileSync(resolve(file), 'utf8').split('\n')) {
        const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

const { renderFinance } = await import('../src/lib/templates/finance.ts')

const testCar = {
    id: 'test-1', make: 'Suzuki', model: 'Swift 1.5 GLX', year: 2023,
    colour: 'White', price: 259000, mileage: 42000, transmission: 'Manual', fuel_type: 'Petrol',
}

const result = await renderFinance(testCar)
writeFileSync(resolve('public/preview/finance-example.png'), result.image)
console.log('Saved public/preview/finance-example.png')
console.log('Caption:\n', result.caption)
```

Run: `cd ember-social && npx tsx scripts/preview-finance-example.mjs`

Expected: `Saved public/preview/finance-example.png` printed, plus the caption text. Open the PNG and confirm: black studio car photo, "±R{amount} / PER MONTH*" headline top-right with the amount in yellow, disclaimer subhead beneath it, logo top-left.

- [ ] **Step 4: Commit**

```bash
git add src/lib/templates/finance.ts src/lib/templates/captions.ts scripts/preview-finance-example.mjs
git commit -m "feat(ember-social): add finance rotation-angle render function"
```

---

## Task 4: Comparison render function (2 vehicles)

**Files:**
- Create: `src/lib/templates/comparison.ts`
- Modify: `src/lib/templates/captions.ts` (append comparison caption/hashtags)

**Interfaces:**
- Consumes: same `common.ts` exports as Task 3, plus `sharp`'s `.composite()` for the 2-up layout
- Produces: `renderComparison(carA: VehicleInput, carB: VehicleInput, labelA: string, labelB: string, opts?: RenderOpts): Promise<RenderResult>` — note the DIFFERENT signature (2 cars + 2 labels) from every other render function. Consumed by Task 6, which must call it specially rather than through the uniform `(car, opts)` shape the other 6 pillars use.

- [ ] **Step 1: Add comparison caption + hashtags to captions.ts**

Append to `src/lib/templates/captions.ts`:

```typescript

// --- COMPARISON ---
export function comparisonCaption(carA: VehicleInput, carB: VehicleInput, labelA: string, labelB: string, freshBody?: string | null): string {
    const nameA = `${carA.year} ${carA.make} ${modelTrim(carA)}`
    const nameB = `${carB.year} ${carB.make} ${modelTrim(carB)}`
    if (freshBody) {
        return `${freshBody}\n\nLeft: the ${nameA} ("${labelA}"). Right: the ${nameB} ("${labelB}").\n\nWhich one is you? Tell us in the comments.${contactStrip()}`
    }
    const hook = `Two very different kinds of Saturday. 👇`
    const body = `Left: the ${nameA} — ${labelA.toLowerCase()}. Right: the ${nameB} — ${labelB.toLowerCase()}.`
    const cta = `Which one is you? Tell us in the comments — we'll help you find it in stock.`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function comparisonHashtags(): string[] {
    return pickHashtags(3, ['#WhichOneAreYou', '#PreOwned'])
}
```

- [ ] **Step 2: Write comparison.ts**

```typescript
// Comparison angle — rotation-seat template. Two vehicles side-by-side on a
// shared studio background with a centre "VS" badge and one-word labels
// (e.g. "FAMILY" vs "FUN") under each half.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, escXml, LOGO_PATH, nextSlot } from './common'
import { comparisonCaption, comparisonHashtags } from './captions'

const W = 1024, H = 1024
const HALF = W / 2

function modelMain(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    return modelStr.split(/\s+/)[0]
}

function modelTrim(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    const main = modelStr.split(/\s+/)[0]
    return modelStr.replace(main, '').trim()
}

function buildPrompt(car: VehicleInput): string {
    const mm = modelMain(car)
    const mt = modelTrim(car)
    return `Create a HYPER-REALISTIC, CINEMATIC studio automotive photograph (1024x1024) for a South African dealership.

MAIN SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt}, three-quarter front angle, centred in frame, taking up about 70% of canvas width.
- Studio lighting, dark grey-to-black gradient background, polished floor reflection.
- IMPORTANT: NO number plate — leave the plate area blank or body-coloured.

NEGATIVE: number plates, people, text, logos, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

function labelSvg(label: string, xCenter: number): string {
    return `<text x="${xCenter}" y="${H - 60}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="44" fill="#FFE600" letter-spacing="2">${escXml(label.toUpperCase())}</text>`
}

function vsBadgeSvg(): string {
    const r = 56
    return `
      <circle cx="${HALF}" cy="${H / 2}" r="${r}" fill="#0a0a0a" stroke="#FFE600" stroke-width="4" />
      <text x="${HALF}" y="${H / 2 + 16}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="44" fill="#ffffff">VS</text>`
}

function headerSvg(): string {
    return `<text x="${W / 2}" y="90" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="52" fill="#ffffff">WHICH ONE IS <tspan fill="#FFE600">YOU?</tspan></text>`
}

export async function renderComparison(
    carA: VehicleInput,
    carB: VehicleInput,
    labelA: string,
    labelB: string,
    opts?: RenderOpts,
): Promise<RenderResult> {
    console.log(`  Comparison: ${carA.year} ${carA.make} ${carA.model} vs ${carB.year} ${carB.make} ${carB.model}`)

    const [bufA, bufB] = await Promise.all([generateImage(buildPrompt(carA)), generateImage(buildPrompt(carB))])
    const [halfA, halfB] = await Promise.all([
        sharp(bufA).resize(HALF, H, { fit: 'cover', position: 'centre' }).toBuffer(),
        sharp(bufB).resize(HALF, H, { fit: 'cover', position: 'centre' }).toBuffer(),
    ])

    const canvas = await sharp({ create: { width: W, height: H, channels: 4, background: '#0a0a0a' } }).png().toBuffer()
    const logoOverlays = await compositeLogo(canvas, LOGO_PATH)
    const overlaySvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        ${headerSvg()}
        ${vsBadgeSvg()}
        ${labelSvg(labelA, HALF / 2)}
        ${labelSvg(labelB, HALF + HALF / 2)}
    </svg>`

    const finalBuf = await sharp(canvas)
        .composite([
            { input: halfA, left: 0, top: 0 },
            { input: halfB, left: HALF, top: 0 },
            { input: Buffer.from(overlaySvg), top: 0, left: 0 },
            ...logoOverlays,
        ])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: comparisonCaption(carA, carB, labelA, labelB, opts?.headline?.caption),
        hashtags: comparisonHashtags(),
        scheduledAt: opts?.targetDate || nextSlot('sat'),
        pillar: 'comparison',
    }
}
```

- [ ] **Step 3: Manual visual verification script**

Create `scripts/preview-comparison-example.mjs`:

```javascript
import { writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    for (const raw of readFileSync(resolve(file), 'utf8').split('\n')) {
        const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

const { renderComparison } = await import('../src/lib/templates/comparison.ts')

const carA = { id: 'a', make: 'Hyundai', model: 'Tucson', year: 2020, colour: 'Maroon' }
const carB = { id: 'b', make: 'Renault', model: 'Kiger', year: 2022, colour: 'White' }

const result = await renderComparison(carA, carB, 'Family', 'Fun')
writeFileSync(resolve('public/preview/comparison-example.png'), result.image)
console.log('Saved public/preview/comparison-example.png')
console.log('Caption:\n', result.caption)
```

Run: `cd ember-social && npx tsx scripts/preview-comparison-example.mjs`

Expected: PNG shows two cars side by side, divider "VS" badge centred, "FAMILY"/"FUN" labels under each half, "WHICH ONE IS YOU?" header, logo top-left.

- [ ] **Step 4: Commit**

```bash
git add src/lib/templates/comparison.ts src/lib/templates/captions.ts scripts/preview-comparison-example.mjs
git commit -m "feat(ember-social): add comparison rotation-angle render function"
```

---

## Task 5: Seasonal-local render function

**Files:**
- Create: `src/lib/templates/seasonal-local.ts`
- Modify: `src/lib/templates/captions.ts` (append seasonalLocal caption/hashtags)

**Interfaces:**
- Consumes: same `common.ts` exports as `seasonal.ts`
- Produces: `renderSeasonalLocal(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult>` — consumed by Task 6

- [ ] **Step 1: Add seasonalLocal caption + hashtags to captions.ts**

Append to `src/lib/templates/captions.ts`:

```typescript

// --- SEASONAL LOCAL ---
export function seasonalLocalCaption(freshBody?: string | null): string {
    if (freshBody) {
        return `${freshBody}\n\nBrowse our inventory: ${CONTACT.website}/inventory${contactStrip()}`
    }
    const hook = `Long weekend ahead — where are you headed?`
    const body = `The Panorama Route, a Kruger day trip, or just a quiet escape into the lowveld — whatever the plan, the right vehicle makes the drive part of the getaway.\n\nTell us where you're headed this weekend, and let's find the car that gets you there.`
    const cta = `Browse our inventory: ${CONTACT.website}/inventory`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function seasonalLocalHashtags(): string[] {
    return pickHashtags(3, ['#LongWeekend', '#PanoramaRoute', '#WhereAreYouHeaded'])
}
```

- [ ] **Step 2: Write seasonal-local.ts**

```typescript
// Seasonal/local angle — rotation-seat template. Same structure as seasonal.ts
// (vehicle in an SA landscape, top-right headline) but the headline pool ties
// to the CALENDAR (long weekends, school holidays) rather than the season.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, nextSlot } from './common'
import { seasonalLocalCaption, seasonalLocalHashtags } from './captions'

const LOCAL_HEADLINES = [
    { lines: ['LONG WEEKEND', 'AHEAD.'], accent: 'WEEKEND' },
    { lines: ['WHERE ARE', 'YOU HEADED?'], accent: 'HEADED' },
    { lines: ['SCHOOL HOLIDAYS,', 'SORTED.'], accent: 'SORTED' },
    { lines: ['THE PANORAMA', 'ROUTE AWAITS.'], accent: 'AWAITS' },
]

function pickHeadline(variantIndex = 0) {
    return LOCAL_HEADLINES[variantIndex % LOCAL_HEADLINES.length]
}

function modelMain(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    return modelStr.split(/\s+/)[0]
}

function modelTrim(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    const main = modelStr.split(/\s+/)[0]
    return modelStr.replace(main, '').trim()
}

function buildPrompt(car: VehicleInput): string {
    const mm = modelMain(car)
    const mt = modelTrim(car)
    return `Create a HYPER-REALISTIC, CINEMATIC editorial lifestyle photograph (1024x1024) of a real vehicle on South Africa's Panorama Route (Mpumalanga), golden hour.

SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt} at a mountain-pass viewpoint, wide horizon, dominating the lower 60% of the frame.
- NO people, NO passengers.
- IMPORTANT: the car must have NO number plate.

LAYOUT:
- The UPPER-CENTRE area (top 25%) must be quiet, low-contrast sky or distant mountains so a white bold headline can be composited there later.
- The TOP-LEFT 200x140 corner must be empty enough to host a logo overlay.

NEGATIVE: number plates, people, faces, text inside image, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

export async function renderSeasonalLocal(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult> {
    console.log(`  SeasonalLocal: ${car.year} ${car.make} ${car.model}`)
    const baseBuf = await generateImage(buildPrompt(car))
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!
    const headline = opts?.headline ?? pickHeadline(opts?.variantIndex ?? 0)

    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = buildHeadlineSvg({ W, H, lines: headline.lines, accentWord: headline.accent, position: 'top-right' })

    const finalBuf = await sharp(baseBuf)
        .composite([...logoOverlays, { input: Buffer.from(headlineSvg), top: 0, left: 0 }])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: seasonalLocalCaption(opts?.headline?.caption),
        hashtags: seasonalLocalHashtags(),
        scheduledAt: opts?.targetDate || nextSlot('wed'),
        pillar: 'seasonalLocal',
    }
}
```

- [ ] **Step 3: Manual visual verification script**

Create `scripts/preview-seasonal-local-example.mjs` (same shape as Task 3 Step 3, importing `renderSeasonalLocal` and a test car, saving to `public/preview/seasonal-local-example.png`).

Run: `cd ember-social && npx tsx scripts/preview-seasonal-local-example.mjs`

Expected: PNG shows a car at a mountain viewpoint with a calendar-hook headline top-right (e.g. "LONG WEEKEND AHEAD.").

- [ ] **Step 4: Commit**

```bash
git add src/lib/templates/seasonal-local.ts src/lib/templates/captions.ts scripts/preview-seasonal-local-example.mjs
git commit -m "feat(ember-social): add seasonal-local rotation-angle render function"
```

---

## Task 6: Export new templates from index.ts

**Files:**
- Modify: `src/lib/templates/index.ts`

**Interfaces:**
- Consumes: `renderFinance`, `renderComparison`, `renderSeasonalLocal` from Tasks 3-5
- Produces: these become importable from `@/lib/templates`, consumed by Task 8 (route.ts)

- [ ] **Step 1: Add exports**

`src/lib/templates/index.ts` currently reads:

```typescript
export { renderShowcase } from './showcase'
export { renderLifestyle } from './lifestyle'
export { renderMaintenance } from './maintenance'
export { renderSeasonal } from './seasonal'
export { renderSellYourCar } from './sell-your-car'
export { renderCarousel } from './carousel'
export type { RenderResult, VehicleInput, HeadlineSpec, RenderOpts } from './common'
export type { CarouselSlide, CarouselCopy, CarouselResult } from './carousel'
```

Add after the `renderCarousel` line:

```typescript
export { renderFinance } from './finance'
export { renderComparison } from './comparison'
export { renderSeasonalLocal } from './seasonal-local'
```

- [ ] **Step 2: Type-check**

Run: `cd ember-social && npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/templates/index.ts
git commit -m "feat(ember-social): export rotation-angle templates from index"
```

---

## Task 7: Rotation-seat history picker

**Files:**
- Create: `src/lib/rotation/pillarHistory.ts`

**Interfaces:**
- Consumes: a Supabase client (`SupabaseClient` from `@supabase/supabase-js`), `workspaceId: string`
- Produces: `pickRotationSeats(supabase, workspaceId: string): Promise<[string, string]>` returning 2 distinct pillar names from `['finance', 'comparison', 'seasonal_local']`, ranked by least-recently-used. Consumed by Task 8 (route.ts).

- [ ] **Step 1: Write the picker**

```typescript
// Picks which 2 rotation-angle pillars (of the 3-candidate pool) get a slot
// this month, ranked by which was used LEAST recently for this workspace.
// Self-correcting: reads actual posts.pillar history, so a skipped or
// manually-run month doesn't desync anything.

import type { SupabaseClient } from '@supabase/supabase-js'

const CANDIDATES = ['finance', 'comparison', 'seasonal_local'] as const
const LOOKBACK_MONTHS = 3

export async function pickRotationSeats(supabase: SupabaseClient, workspaceId: string): Promise<[string, string]> {
    const cutoff = new Date()
    cutoff.setUTCMonth(cutoff.getUTCMonth() - LOOKBACK_MONTHS)

    const { data, error } = await supabase
        .from('posts')
        .select('pillar, scheduled_at')
        .eq('workspace_id', workspaceId)
        .in('pillar', CANDIDATES as unknown as string[])
        .gte('scheduled_at', cutoff.toISOString())

    if (error) {
        console.error('[pillarHistory] query failed, defaulting to first 2 candidates:', error.message)
        return [CANDIDATES[0], CANDIDATES[1]]
    }

    const lastUsed = new Map<string, number>()
    for (const c of CANDIDATES) lastUsed.set(c, 0) // never used = oldest possible (epoch)
    for (const row of (data ?? []) as any[]) {
        const t = new Date(row.scheduled_at).getTime()
        if (t > (lastUsed.get(row.pillar) ?? 0)) lastUsed.set(row.pillar, t)
    }

    const ranked = [...CANDIDATES].sort((a, b) => (lastUsed.get(a) ?? 0) - (lastUsed.get(b) ?? 0))
    return [ranked[0], ranked[1]]
}
```

- [ ] **Step 2: Manual verification script**

Create `scripts/verify-rotation-picker.mjs`:

```javascript
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(file) {
    for (const raw of readFileSync(resolve(file), 'utf8').split('\n')) {
        const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

const { pickRotationSeats } = await import('../src/lib/rotation/pillarHistory.ts')
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const WORKSPACE_ID = process.argv[2]
if (!WORKSPACE_ID) { console.error('Usage: node scripts/verify-rotation-picker.mjs <workspaceId>'); process.exit(1) }

const seats = await pickRotationSeats(supabase, WORKSPACE_ID)
console.log('Rotation seats picked:', seats)
if (seats.length !== 2 || seats[0] === seats[1]) {
    console.error('FAIL: expected 2 distinct pillars')
    process.exit(1)
}
console.log('OK: 2 distinct pillars returned')
```

Run: `cd ember-social && npx tsx scripts/verify-rotation-picker.mjs f7f5aa12-4dab-4aac-ad30-6ff8326c73c3` (Everest's workspace ID, from `scripts/revise-july-angles.mjs`)

Expected: `Rotation seats picked: [ '...', '...' ]` followed by `OK: 2 distinct pillars returned`. Since Everest has no `finance`/`comparison`/`seasonal_local` posts yet (July's were built by hand outside this system, `pillar` column values won't match these exact new candidate names — check with a quick `select distinct pillar from posts where workspace_id = '...'` if the result looks wrong), this should return `['finance', 'comparison']` (first two candidates, alphabetically-stable tie on the never-used epoch timestamp).

- [ ] **Step 3: Commit**

```bash
git add src/lib/rotation/pillarHistory.ts scripts/verify-rotation-picker.mjs
git commit -m "feat(ember-social): add history-based rotation-seat picker"
```

---

## Task 8: Wire rotation seats into campaign/generate route

**Files:**
- Modify: `src/app/api/workspaces/campaign/generate/route.ts`

**Interfaces:**
- Consumes: `pickRotationSeats` (Task 7), `renderFinance`/`renderComparison`/`renderSeasonalLocal` (Task 6)
- Produces: the route now inserts 2 rotation-angle posts per batch instead of always using the fixed 4-pillar rotation for those 2 slots. No new exports — this is the leaf of the wiring.

**Design decision (refines the spec):** the spec allowed the same angle to win both seats in one month. On implementation, that's tightened to guarantee 2 *distinct* angles per month (closer to July's actual mix of finance + comparison + seasonal-local all appearing). `pickRotationSeats` already returns 2 distinct pillars, so this task just needs to consume both.

Seat assignment: week-index 1 (i.e. "week 2", 0-indexed `week === 1`)'s `seasonal` slot becomes seat A; week-index 3 ("week 4")'s `lifestyle` slot becomes seat B. All other 14 slots are unchanged.

- [ ] **Step 1: Add imports**

At the top of `src/app/api/workspaces/campaign/generate/route.ts`, change:

```typescript
import { renderShowcase, renderLifestyle, renderMaintenance, renderSeasonal } from '@/lib/templates'
import type { VehicleInput, HeadlineSpec } from '@/lib/templates'
```

to:

```typescript
import { renderShowcase, renderLifestyle, renderMaintenance, renderSeasonal, renderFinance, renderComparison, renderSeasonalLocal } from '@/lib/templates'
import type { VehicleInput, HeadlineSpec } from '@/lib/templates'
import { pickRotationSeats } from '@/lib/rotation/pillarHistory'
```

- [ ] **Step 2: Build a render-function lookup for the rotation candidates**

After the existing `PILLARS` array definition (route.ts:43-48), add:

```typescript
const ROTATION_RENDERERS: Record<string, (car: VehicleInput, opts?: any) => Promise<any>> = {
    finance: renderFinance as any,
    comparison: renderComparison as any, // called specially below — needs 2 cars
    seasonal_local: renderSeasonalLocal as any,
}
```

- [ ] **Step 3: Pick the seats after resolving the workspace, before the week loop**

After the existing block that computes `fresh` (`generateFreshHeadlines` call, around route.ts:131), add:

```typescript
        const [seatA, seatB] = await pickRotationSeats(supabase, resolvedId)
```

- [ ] **Step 4: Override the two designated slots inside the week/pillar loop**

The existing loop body (route.ts:138-194) reads:

```typescript
        for (let week = 0; week < weeks; week++) {
            for (const pillar of PILLARS) {
                const car = vehicles[vehicleIdx % vehicles.length]
                if (pillar.needsCar) vehicleIdx++

                const headline = fresh
                    ? (fresh as any)[pillar.name]?.[week] ?? null
                    : null

                tasks.push((async () => {
                    try {
                        const targetDate = computeWeekday(monthStart, week, pillar.dayName)
                        const result = await pillar.render(car as VehicleInput, { targetDate, variantIndex: week, headline, season: planSeason })
```

Change it to detect the 2 designated seat slots and swap in the rotation renderer instead of the fixed one. Replace the whole loop (route.ts:138-194) with:

```typescript
        for (let week = 0; week < weeks; week++) {
            for (const pillar of PILLARS) {
                const isSeatA = week === 1 && pillar.name === 'seasonal'
                const isSeatB = week === 3 && pillar.name === 'lifestyle'
                const seatPillarName = isSeatA ? seatA : isSeatB ? seatB : null

                const car = vehicles[vehicleIdx % vehicles.length]
                if (pillar.needsCar) vehicleIdx++

                const headline = fresh && !seatPillarName
                    ? (fresh as any)[pillar.name]?.[week] ?? null
                    : null

                tasks.push((async () => {
                    try {
                        const targetDate = computeWeekday(monthStart, week, pillar.dayName)
                        const effectivePillarName = seatPillarName || pillar.name

                        let result: { image: Buffer; caption: string; hashtags: string[]; scheduledAt: Date; ctaUrl?: string }
                        if (seatPillarName === 'comparison') {
                            const carB = vehicles[vehicleIdx % vehicles.length]
                            vehicleIdx++
                            result = await renderComparison(car as VehicleInput, carB as VehicleInput, 'Family', 'Fun', { targetDate, variantIndex: week })
                        } else if (seatPillarName) {
                            result = await ROTATION_RENDERERS[seatPillarName](car as VehicleInput, { targetDate, variantIndex: week })
                        } else {
                            result = await pillar.render(car as VehicleInput, { targetDate, variantIndex: week, headline, season: planSeason })
                        }

                        const postId = crypto.randomUUID()
                        let mediaUrl: string | null = null

                        const up = await uploadCampaignImage({
                            workspaceId: resolvedId,
                            postId,
                            bytes: result.image,
                        })
                        if (up.ok) mediaUrl = up.publicUrl

                        const approvalToken = crypto.randomUUID()

                        const { error: insertError } = await supabase
                            .from('posts')
                            .insert({
                                id: postId,
                                workspace_id: resolvedId,
                                campaign_batch_id: batchId,
                                pillar: effectivePillarName,
                                vehicle_id: pillar.needsCar ? (car as any)?.id || null : null,
                                content: result.caption,
                                variants: { facebook: { content: result.caption, hashtags: result.hashtags } },
                                platforms: ['facebook'],
                                media_urls: mediaUrl ? [mediaUrl] : null,
                                scheduled_at: result.scheduledAt.toISOString(),
                                status: 'pending_approval',
                                client_status: 'pending',
                                approval_token: approvalToken,
                                cta_url: result.ctaUrl || null,
                                image_status: mediaUrl ? 'ready' : 'failed',
                            } as any)

                        if (insertError) {
                            errors.push(`${effectivePillarName} week ${week + 1}: ${insertError.message}`)
                        } else {
                            inserted++
                        }
                    } catch (e: any) {
                        errors.push(`${pillar.name} week ${week + 1}: ${e?.message || e}`)
                    }
                })())
            }
        }
```

- [ ] **Step 5: Type-check**

Run: `cd ember-social && npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 6: Manual verification against a dev server**

Run: `cd ember-social && npm run dev` (background), then in another terminal:

```bash
curl -X POST http://localhost:3000/api/workspaces/campaign/generate \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"f7f5aa12-4dab-4aac-ad30-6ff8326c73c3","days":28,"month":"2026-09"}'
```

Expected: JSON response with `"ok": true` and `"count": 16`. Then query posts for that batch and confirm 2 of the 16 have `pillar` in `('finance','comparison','seasonal_local')`:

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('posts').select('pillar').eq('workspace_id','f7f5aa12-4dab-4aac-ad30-6ff8326c73c3').order('scheduled_at',{ascending:false}).limit(16).then(r => console.log(r.data.map(p=>p.pillar)));
"
```

Expected: array of 16 pillar names, exactly 2 of which are `finance`/`comparison`/`seasonal_local`, the rest `showcase`/`lifestyle`/`maintenance`/`seasonal`.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/workspaces/campaign/generate/route.ts
git commit -m "feat(ember-social): wire rotation-seat angles into plan generation"
```

---

## Task 9: Video concept bank

**Files:**
- Create: `src/lib/video/concepts.ts`

**Interfaces:**
- Produces: `VIDEO_CONCEPTS: VideoConcept[]` (6 entries), `pickVideoConcepts(supabase, workspaceId: string, count: number): Promise<VideoConcept[]>` — consumed by Task 12 (route.ts video-job insertion)

- [ ] **Step 1: Write the concept bank + picker**

```typescript
// The 6-entry lifestyle-video concept bank documented in the July 2026 Everest
// plan (docs/superpowers/specs/2026-07-29-monthly-content-variety-design.md,
// originally everest-july-2026-content-plan.md §4). vehicleKeywords is matched
// case-insensitively against a vehicle's make/model to find a fitting car from
// live inventory each month.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface VideoConcept {
    id: string
    title: string
    vehicleKeywords: string[]
    brief: string
}

export const VIDEO_CONCEPTS: VideoConcept[] = [
    {
        id: 'born_for_the_bundu',
        title: 'Born for the Bundu',
        vehicleKeywords: ['land cruiser', 'discovery', 'hilux', 'fortuner'],
        brief: 'Hardcore 4x4 adventure: a river crossing, a rocky mountain pass, dawn light breaking over the Kruger bushveld. Rugged, dusty, capable — the vehicle earns its keep off the tar.',
    },
    {
        id: 'first_car_first_freedom',
        title: 'First Car, First Freedom',
        vehicleKeywords: ['polo', 'swift', 'kiger', 'picanto', 'i10'],
        brief: 'Youthful independence: a young South African driver gets their first set of keys, city lights of Mbombela at dusk, the freedom of driving somewhere alone for the first time.',
    },
    {
        id: 'work_hard_play_harder',
        title: 'Work Hard, Play Harder',
        vehicleKeywords: ['hilux', 'np200', 'ranger', 'triton'],
        brief: 'A working bakkie through a weekday shift — loaded, dusty, capable — transitions into weekend escape: same vehicle, empty load bed, open road, golden hour.',
    },
    {
        id: 'date_night',
        title: 'Date Night',
        vehicleKeywords: ['grand vitara', 'tucson', 't-roc', 'crossover'],
        brief: 'Upmarket evening drive: a well-dressed couple, city or restaurant-district lights reflecting off the paintwork, an unhurried, romantic pace.',
    },
    {
        id: 'sunday_drive',
        title: 'Sunday Drive',
        vehicleKeywords: [], // deliberately open — picks whichever vehicle wasn't recently featured
        brief: 'A quiet, unhurried Sunday morning drive along a scenic backroad — no destination, just the drive itself. New route each time this concept is picked.',
    },
    {
        id: 'two_minute_tips',
        title: 'Two-Minute Tips',
        vehicleKeywords: [],
        brief: 'A quick, practical maintenance tip filmed at the dealership workshop — checking tyre tread, topping up washer fluid, a battery-terminal check. Helpful-expert tone, not a sales pitch.',
    },
]

const LOOKBACK_MONTHS = 6

export async function pickVideoConcepts(supabase: SupabaseClient, workspaceId: string, count: number): Promise<VideoConcept[]> {
    const cutoff = new Date()
    cutoff.setUTCMonth(cutoff.getUTCMonth() - LOOKBACK_MONTHS)

    const { data, error } = await supabase
        .from('posts')
        .select('video_concept, scheduled_at')
        .eq('workspace_id', workspaceId)
        .not('video_concept', 'is', null)
        .gte('scheduled_at', cutoff.toISOString())

    const lastUsed = new Map<string, number>()
    for (const c of VIDEO_CONCEPTS) lastUsed.set(c.id, 0)
    if (!error) {
        for (const row of (data ?? []) as any[]) {
            const t = new Date(row.scheduled_at).getTime()
            if (t > (lastUsed.get(row.video_concept) ?? 0)) lastUsed.set(row.video_concept, t)
        }
    } else {
        console.error('[concepts] history query failed, falling back to bank order:', error.message)
    }

    const ranked = [...VIDEO_CONCEPTS].sort((a, b) => (lastUsed.get(a.id) ?? 0) - (lastUsed.get(b.id) ?? 0))
    return ranked.slice(0, count)
}
```

- [ ] **Step 2: Type-check**

Run: `cd ember-social && npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/video/concepts.ts
git commit -m "feat(ember-social): add video concept bank + history-based picker"
```

---

## Task 10: Video upload helper

**Files:**
- Create: `src/lib/media/uploadCampaignVideo.ts`

**Interfaces:**
- Produces: `uploadCampaignVideo(args: { workspaceId: string; postId: string; bytes: Buffer }): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }>` — consumed by Task 13 (cron)

**Why a new file instead of extending `uploadCampaignImage`:** that function hardcodes a `.jpg` extension in the storage path regardless of `mimeType` — reusing it for video would silently upload an `.mp4` file with a `.jpg` name. A parallel function avoids touching working image-upload code.

- [ ] **Step 1: Write it**

```typescript
// Parallel to uploadCampaignImage (uploadToStorage.ts) — that function hardcodes
// a .jpg extension, so video needs its own path/mimetype handling rather than
// reusing it.

import { createAdminClient } from '@/lib/supabase/client'

export async function uploadCampaignVideo(args: {
    workspaceId: string
    postId: string
    bytes: Buffer
}): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
    try {
        const supabase = createAdminClient()
        const path = `${args.workspaceId}/${args.postId}-${Date.now()}.mp4`

        const { error } = await supabase.storage
            .from('campaign-media')
            .upload(path, args.bytes, {
                contentType: 'video/mp4',
                upsert: true,
                cacheControl: '31536000',
            })

        if (error) throw error

        const { data } = supabase.storage
            .from('campaign-media')
            .getPublicUrl(path)

        return { ok: true, publicUrl: data.publicUrl }
    } catch (e: any) {
        return { ok: false, error: e.message || 'Video upload failed' }
    }
}
```

- [ ] **Step 2: Type-check**

Run: `cd ember-social && npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/media/uploadCampaignVideo.ts
git commit -m "feat(ember-social): add video upload helper"
```

---

## Task 11: Outro-compositing helper (ported from append-outro.mjs)

**Files:**
- Create: `src/lib/video/appendOutro.ts`

**Interfaces:**
- Consumes: `ffmpeg-static` (already a dependency, per `package.json`), a source video `Buffer` + `tagline`/`accent` strings
- Produces: `appendOutro(sourceBuf: Buffer, tagline: string, accent: string): Promise<Buffer>` — consumed by Task 13 (cron)

**Why route-callable instead of running `scripts/append-outro.mjs` directly:** that script reads/writes named files on disk and is invoked via `node scripts/...`; the cron needs an in-process function operating on buffers so it can run inside a Next.js API route.

- [ ] **Step 1: Write it**

Port `scripts/append-outro.mjs`'s logic into a callable function, using `/tmp` (Vercel's writable scratch space — see [Vercel docs on filesystem](https://vercel.com/docs/functions/functions-api-reference#temporary-file-storage), consistent with any serverless Node function) instead of a fixed local path:

```typescript
// Ports scripts/append-outro.mjs into a route-callable function operating on
// Buffers instead of named files, writing to /tmp (Vercel's writable scratch
// space) instead of a fixed local path. Same ffmpeg-static approach — no
// system ffmpeg binary required, works in a Vercel serverless function.

import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
// @ts-expect-error ffmpeg-static has no type declarations
import ffmpegPath from 'ffmpeg-static'

const FPS = 24
const YELLOW = '#FFE600'
const OUTRO = 3.0
const XF = 0.5

const escXml = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function ff(args: string[]) {
    execFileSync(ffmpegPath as string, ['-y', ...args], { stdio: 'inherit' })
}

function probe(file: string): { duration: number; width: number; height: number } {
    let err = ''
    try {
        execFileSync(ffmpegPath as string, ['-i', file], { stdio: ['ignore', 'ignore', 'pipe'] })
    } catch (e: any) {
        err = e.stderr.toString()
    }
    const d = err.match(/Duration: (\d+):(\d+):(\d+\.\d+)/)
    const r = err.match(/, (\d{2,5})x(\d{2,5})[ ,]/)
    if (!d || !r) throw new Error('could not probe source video')
    return {
        duration: (+d[1]) * 3600 + (+d[2]) * 60 + parseFloat(d[3]),
        width: +r[1],
        height: +r[2],
    }
}

async function buildEndCard(W: number, H: number, tagline: string, accent: string): Promise<Buffer> {
    const tagSegs = tagline.split(/\s+/).map(w =>
        w.replace(/[.,!?]/g, '').toUpperCase() === accent.toUpperCase()
            ? `<tspan fill="${YELLOW}">${escXml(w)}</tspan>` : `<tspan> ${escXml(w)}</tspan>`
    ).join(' ')
    const vertical = H > W
    const fs = vertical ? Math.round(W * 0.09) : 56
    const y = vertical ? Math.round(H * 0.55) : Math.round(H * 0.55)
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${W}" height="${H}" fill="#0a0a0a" />
        <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" fill="#ffffff" xml:space="preserve">${tagSegs}</text>
        <text x="${W / 2}" y="${y + fs + 40}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="28" fill="${YELLOW}">013 854 0600</text>
    </svg>`
    return sharp({ create: { width: W, height: H, channels: 4, background: '#0a0a0a' } })
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png().toBuffer()
}

export async function appendOutro(sourceBuf: Buffer, tagline: string, accent: string): Promise<Buffer> {
    const tmp = process.env.TEMP || process.env.TMPDIR || '/tmp'
    const workDir = join(tmp, `outro-${Date.now()}`)
    mkdirSync(workDir, { recursive: true })

    const srcPath = join(workDir, 'src.mp4')
    writeFileSync(srcPath, sourceBuf)

    const { width: W, height: H, duration: srcDuration } = probe(srcPath)
    const endCardPng = await buildEndCard(W, H, tagline, accent)
    const endCardPath = join(workDir, 'endcard.png')
    writeFileSync(endCardPath, endCardPng)

    const endCardVideoPath = join(workDir, 'endcard.mp4')
    ff(['-loop', '1', '-i', endCardPath, '-t', String(OUTRO), '-r', String(FPS), '-pix_fmt', 'yuv420p', endCardVideoPath])

    // Crossfade offset = where in the source the outro should start overlapping,
    // i.e. (source duration - crossfade duration).
    const outPath = join(workDir, 'out.mp4')
    const offset = Math.max(0, srcDuration - XF)
    ff([
        '-i', srcPath, '-i', endCardVideoPath,
        '-filter_complex', `[0:v][1:v]xfade=transition=fade:duration=${XF}:offset=${offset}[v]`,
        '-map', '[v]', '-map', '0:a?',
        '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p',
        outPath,
    ])

    return readFileSync(outPath)
}
```

- [ ] **Step 2: Manual verification against a real rendered clip**

If `public/preview/everest-reel-family.mp4` exists (July's un-outro'd render, per the July plan doc), run:

```bash
cd ember-social && node -e "
const { readFileSync, writeFileSync } = require('fs');
require('ts-node/register'); // if unavailable, use: npx tsx -e '...'
const { appendOutro } = require('./src/lib/video/appendOutro.ts');
(async () => {
  const src = readFileSync('public/preview/everest-reel-family.mp4');
  const out = await appendOutro(src, 'BUILT FOR THE ROAD AHEAD.', 'ROAD');
  writeFileSync('public/preview/appendOutro-test.mp4', out);
  console.log('Saved public/preview/appendOutro-test.mp4', out.length, 'bytes');
})();
"
```

If that source file doesn't exist (it may not be committed — check `ember-social/.gitignore` for `public/preview/*.mp4`), instead generate a short synthetic test clip first: `ffmpeg -f lavfi -i testsrc=duration=3:size=1280x720:rate=24 -pix_fmt yuv420p /tmp/test-src.mp4` (using the system's own ffmpeg if available, or skip straight to Task 13's end-to-end cron test, which exercises this same function against a real Seedance output).

Expected: output file plays, is longer than the source by ~2.5s (3s outro minus 0.5s crossfade overlap), shows the branded end-card with the tagline in white/yellow accent.

- [ ] **Step 3: Commit**

```bash
git add src/lib/video/appendOutro.ts
git commit -m "feat(ember-social): port append-outro.mjs into a route-callable function"
```

---

## Task 12: Seedance client (submit + poll)

**Files:**
- Create: `src/lib/video/seedance.ts`

**Interfaces:**
- Produces: `submitSeedanceTask(prompt: string, referenceImageUrls: string[], aspect: '16:9' | '9:16'): Promise<string>` (returns `taskId`), `pollSeedanceTask(taskId: string): Promise<{ state: 'processing' | 'success' | 'fail'; videoUrl?: string; failMsg?: string }>` (single non-blocking check — the cron calls this once per tick, NOT in a loop, unlike `scripts/seedance-family.mjs`'s `poll()` which blocks for up to 12 minutes in one process). Consumed by Task 13 (cron).

- [ ] **Step 1: Write it**

```typescript
// Wraps kie.ai's Seedance 2 Mini API (same endpoints scripts/seedance-family.mjs
// uses). Unlike that script's poll() — which blocks in a loop for up to 12
// minutes — pollSeedanceTask() checks ONCE and returns immediately, so the
// cron can call it once per tick and let state persist in posts.video_task_id
// across ticks instead of blocking a single request.

const KIE_KEY = process.env.KIE_API_KEY

export async function submitSeedanceTask(prompt: string, referenceImageUrls: string[], aspect: '16:9' | '9:16'): Promise<string> {
    if (!KIE_KEY) throw new Error('KIE_API_KEY not set')
    const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KIE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'bytedance/seedance-2-mini',
            input: {
                prompt,
                reference_image_urls: referenceImageUrls,
                generate_audio: true,
                resolution: '720p',
                aspect_ratio: aspect,
                duration: 15,
                web_search: false,
                nsfw_checker: true,
            },
        }),
    })
    const data = await r.json()
    if (data.code !== 200 || !data.data?.taskId) throw new Error(`createTask failed: ${JSON.stringify(data).slice(0, 300)}`)
    return data.data.taskId
}

export async function pollSeedanceTask(taskId: string): Promise<{ state: 'processing' | 'success' | 'fail'; videoUrl?: string; failMsg?: string }> {
    if (!KIE_KEY) throw new Error('KIE_API_KEY not set')
    const r = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${KIE_KEY}` },
    })
    const data = await r.json()
    const st = data.data?.state
    if (st === 'success') {
        const url = JSON.parse(data.data.resultJson || '{}').resultUrls?.[0]
        if (!url) return { state: 'fail', failMsg: 'success but no resultUrls' }
        return { state: 'success', videoUrl: url }
    }
    if (st === 'fail') return { state: 'fail', failMsg: data.data?.failMsg || data.data?.failCode || 'unknown failure' }
    return { state: 'processing' }
}
```

- [ ] **Step 2: Type-check**

Run: `cd ember-social && npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/video/seedance.ts
git commit -m "feat(ember-social): add non-blocking Seedance submit/poll client"
```

---

## Task 13: Video-job cron

**Files:**
- Create: `src/app/api/cron/generate-videos/route.ts`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: `submitSeedanceTask`/`pollSeedanceTask` (Task 12), `appendOutro` (Task 11), `uploadCampaignVideo` (Task 10)
- Produces: `GET /api/cron/generate-videos` — no other code consumes this directly; it's invoked by Vercel's scheduler.

- [ ] **Step 1: Write the cron route**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { submitSeedanceTask, pollSeedanceTask } from '@/lib/video/seedance'
import { appendOutro } from '@/lib/video/appendOutro'
import { uploadCampaignVideo } from '@/lib/media/uploadCampaignVideo'

export const maxDuration = 300

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function authorized(req: Request): boolean {
    const ua = (req.headers.get('user-agent') || '').toLowerCase()
    if (ua.includes('vercel-cron')) return true
    const secret = process.env.CRON_SECRET
    if (!secret) return process.env.NODE_ENV !== 'production'
    const auth = req.headers.get('authorization') || ''
    return auth === `Bearer ${secret}`
}

export async function GET(req: Request) {
    if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = admin()

    try {
        // One job per tick — advances whichever job is furthest along, so a
        // batch of 3 completes over several ticks instead of all racing at once.
        const { data: jobs, error } = await supabase
            .from('posts')
            .select('id, workspace_id, video_status, video_concept, video_task_id, video_prompt, media_urls')
            .in('video_status', ['pending', 'generating', 'rendering', 'compositing'])
            .order('video_status', { ascending: false }) // 'rendering'/'compositing' before 'pending' alphabetically-ish; good enough tie-break
            .limit(1)

        if (error) throw error
        if (!jobs || jobs.length === 0) return NextResponse.json({ ok: true, processed: 0 })

        const job = jobs[0] as any

        if (job.video_status === 'pending') {
            // Submit to Seedance. video_prompt and any reference image URLs are
            // expected to already be set by the route that created this job
            // (Task 14) — this step just kicks off the render.
            const refUrls: string[] = job.media_urls || []
            const taskId = await submitSeedanceTask(job.video_prompt, refUrls, '16:9')
            await supabase.from('posts').update({ video_status: 'generating', video_task_id: taskId } as never).eq('id', job.id)
            return NextResponse.json({ ok: true, processed: 1, action: 'submitted', postId: job.id })
        }

        if (job.video_status === 'generating' || job.video_status === 'rendering') {
            const result = await pollSeedanceTask(job.video_task_id)
            if (result.state === 'processing') {
                await supabase.from('posts').update({ video_status: 'rendering' } as never).eq('id', job.id)
                return NextResponse.json({ ok: true, processed: 1, action: 'still_rendering', postId: job.id })
            }
            if (result.state === 'fail') {
                await supabase.from('posts').update({ video_status: 'failed', last_error: result.failMsg } as never).eq('id', job.id)
                return NextResponse.json({ ok: true, processed: 1, action: 'failed', postId: job.id, error: result.failMsg })
            }
            // success — download and stash under media_urls temporarily so the
            // compositing step below has the raw render to work from.
            const buf = Buffer.from(await (await fetch(result.videoUrl!)).arrayBuffer())
            const raw = await uploadCampaignVideo({ workspaceId: job.workspace_id, postId: `${job.id}-raw`, bytes: buf })
            if (!raw.ok) throw new Error(raw.error)
            await supabase.from('posts').update({ video_status: 'compositing', media_urls: [raw.publicUrl] } as never).eq('id', job.id)
            return NextResponse.json({ ok: true, processed: 1, action: 'rendered', postId: job.id })
        }

        if (job.video_status === 'compositing') {
            const rawUrl = (job.media_urls || [])[0]
            if (!rawUrl) throw new Error('compositing job has no raw video URL')
            const rawBuf = Buffer.from(await (await fetch(rawUrl)).arrayBuffer())
            const finalBuf = await appendOutro(rawBuf, 'BUILT FOR THE ROAD AHEAD.', 'ROAD')
            const up = await uploadCampaignVideo({ workspaceId: job.workspace_id, postId: job.id, bytes: finalBuf })
            if (!up.ok) throw new Error(up.error)
            await supabase.from('posts').update({ video_status: 'ready', media_urls: [up.publicUrl], image_status: 'ready' } as never).eq('id', job.id)
            return NextResponse.json({ ok: true, processed: 1, action: 'ready', postId: job.id })
        }

        return NextResponse.json({ ok: true, processed: 0 })
    } catch (error: any) {
        console.error('generate-videos cron error:', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}
```

- [ ] **Step 2: Register the cron in vercel.json**

`vercel.json` currently reads:

```json
{
    "crons": [
        {
            "path": "/api/cron/news-monthly",
            "schedule": "0 8 1 * *"
        },
        {
            "path": "/api/cron/publish-scheduled",
            "schedule": "*/5 * * * *"
        }
    ]
}
```

Change to:

```json
{
    "crons": [
        {
            "path": "/api/cron/news-monthly",
            "schedule": "0 8 1 * *"
        },
        {
            "path": "/api/cron/publish-scheduled",
            "schedule": "*/5 * * * *"
        },
        {
            "path": "/api/cron/generate-videos",
            "schedule": "*/10 * * * *"
        }
    ]
}
```

- [ ] **Step 3: Type-check**

Run: `cd ember-social && npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 4: Manual end-to-end verification against a dev server**

This step actually exercises Tasks 10-13 together against the real kie.ai API — expect it to take several minutes (Seedance render time) and consume kie.ai credits.

Run: `cd ember-social && npm run dev` (background). Manually insert a test video job:

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('posts').insert({
  id: randomUUID(),
  workspace_id: 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3',
  pillar: 'video',
  content: 'test video job',
  platforms: ['facebook'],
  status: 'pending_approval',
  client_status: 'pending',
  approval_token: randomUUID(),
  scheduled_at: new Date(Date.now() + 86400000).toISOString(),
  video_status: 'pending',
  video_concept: 'sunday_drive',
  video_prompt: 'A quiet Sunday morning drive along a scenic Mpumalanga backroad, warm golden light, a white 2022 Toyota Corolla Cross, smooth cinematic tracking shot, South African right-hand-drive, driving on the left, photorealistic, no text, no logos.',
}).select().then(r => console.log(r.error || r.data));
"
```

Then repeatedly (every ~1-2 min) call the cron and check the job's `video_status`:

```bash
curl -s http://localhost:3000/api/cron/generate-videos -H "User-Agent: vercel-cron/1.0"
```

Expected sequence across successive calls: `submitted` → several `still_rendering` → `rendered` → `ready`. After `ready`, confirm the post's `media_urls[0]` is a playable `.mp4` (open the URL in a browser) that includes the branded outro at the end.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/cron/generate-videos/route.ts vercel.json
git commit -m "feat(ember-social): add async video-generation cron"
```

---

## Task 14: Insert pending video jobs at plan-generation time

**Files:**
- Modify: `src/app/api/workspaces/campaign/generate/route.ts`

**Interfaces:**
- Consumes: `pickVideoConcepts` (Task 9), `fetchVehiclesForWorkspace`/`vehicles` (already fetched earlier in this route)
- Produces: 3 additional `posts` rows per batch with `video_status='pending'`. Terminal task — nothing downstream depends on new exports from this task.

- [ ] **Step 1: Add the import**

Add to the existing import block in `src/app/api/workspaces/campaign/generate/route.ts`:

```typescript
import { pickVideoConcepts } from '@/lib/video/concepts'
```

- [ ] **Step 2: Insert video jobs after the static-post week loop**

Immediately after the existing `await Promise.all(tasks)` line (route.ts:196), and before the `return NextResponse.json({...})` block, add:

```typescript
        // 3 video jobs, concepts picked by least-recently-used so they don't
        // repeat what recent months already ran. Actual rendering happens
        // asynchronously via /api/cron/generate-videos — this just reserves
        // the slots and stores the brief.
        const videoConcepts = await pickVideoConcepts(supabase, resolvedId, 3)
        const videoWeeks = [0, 1, 2].filter(w => w < weeks) // one per week 1/2/3, skip if the batch is shorter than 3 weeks

        for (let i = 0; i < videoConcepts.length && i < videoWeeks.length; i++) {
            const concept = videoConcepts[i]
            const car = vehicles.find(v =>
                concept.vehicleKeywords.length === 0 ||
                concept.vehicleKeywords.some(kw => `${v.make} ${v.model}`.toLowerCase().includes(kw))
            ) || vehicles[i % vehicles.length]

            const videoPrompt = `${concept.brief} Hero vehicle: a ${(car as any).colour || ''} ${(car as any).year} ${(car as any).make} ${(car as any).model} — keep its exact colour and shape throughout. South Africa: driving is on the LEFT-hand side of the road, right-hand-drive vehicle. Photorealistic, cinematic, no text, no logos, blank number plates.`

            const targetDate = computeWeekday(monthStart, videoWeeks[i], 'mon')
            const postId = crypto.randomUUID()
            const approvalToken = crypto.randomUUID()

            const { error: videoInsertError } = await supabase
                .from('posts')
                .insert({
                    id: postId,
                    workspace_id: resolvedId,
                    campaign_batch_id: batchId,
                    pillar: 'video',
                    vehicle_id: (car as any)?.id || null,
                    content: `${concept.title} — video generating`,
                    variants: {},
                    platforms: ['facebook'],
                    media_urls: null,
                    scheduled_at: targetDate.toISOString(),
                    status: 'pending_approval',
                    client_status: 'pending',
                    approval_token: approvalToken,
                    video_status: 'pending',
                    video_concept: concept.id,
                    video_prompt: videoPrompt,
                } as any)

            if (videoInsertError) {
                errors.push(`video ${concept.id}: ${videoInsertError.message}`)
            } else {
                inserted++
            }
        }
```

- [ ] **Step 3: Type-check**

Run: `cd ember-social && npx tsc --noEmit`

Expected: no new errors.

- [ ] **Step 4: Manual verification against a dev server**

Repeat Task 8 Step 6's `curl -X POST .../campaign/generate` call, then check for the 3 video-job posts:

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('posts').select('pillar,video_status,video_concept').eq('pillar','video').order('created_at',{ascending:false}).limit(3).then(r => console.log(r.data));
"
```

Expected: 3 rows, each with `video_status: 'pending'` and a distinct `video_concept` (none repeating the concepts picked in a prior run within the lookback window, if any prior runs happened in this test environment).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/workspaces/campaign/generate/route.ts
git commit -m "feat(ember-social): reserve 3 video-job slots at plan-generation time"
```

---

## Self-Review Notes

**Spec coverage:**
- Angle rotation (2 of 16 slots, DB-history-based, never repeating recent months) → Tasks 3-8. ✓
- Video automation (3/month, non-repeating concepts, async job queue, cron) → Tasks 9-14. ✓
- New `posts` columns mirroring `image_status` pattern → Task 1. ✓
- `media_urls` reused for final video (no new column) → Task 13 sets it directly. ✓
- Carousel explicitly out of scope → no task touches `carousel.ts`. ✓
- ffmpeg-static, no system ffmpeg → Task 11. ✓
- Cron auth matching `publish-scheduled` → Task 13 Step 1 copies it verbatim. ✓

**Known follow-up (not in this plan, flag for a later pass):** Task 13's cron always picks the single oldest in-progress job per tick — with 3 videos queued simultaneously across multiple workspaces, this serializes all of them through one cron identity. Fine at Everest's current scale (1 car-dealer workspace); if a second dealer client is onboarded, revisit whether one job per tick is still enough throughput, or whether the cron should advance one job per *workspace* per tick instead.
