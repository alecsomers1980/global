# Affiliate Media Kit on Walkthrough Approval — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The moment a car's full walkthrough post is approved inside Ember Social, automatically email every approved Everest Motoring affiliate their personalised media kit for that car — replacing the current state, where the existing `AffiliateMediaKit` email template is never sent except by a manual, hardcoded-recipient test route.

**Architecture:** Everest Motoring tags each post it sends to Ember Social's `/api/trigger` with a `post_kind` ('feed' | 'reel' | 'walkthrough'). When a human approves a post on Ember Social's `/approvals` page, a new shared helper atomically claims walkthrough posts (idempotent, rollback-on-failure) and calls a new authenticated webhook back on Everest Motoring, which emails the existing template to every `role='affiliate' AND is_approved=true` profile.

**Tech Stack:** Next.js (both apps), Supabase (two separate projects — Ember Social's `posts` table, Everest's `cars`/`profiles` tables), Resend (`@react-email/components`), Vitest (new to Everest Motoring, already present in Ember Social).

**Design spec:** `docs/superpowers/specs/2026-09-04-affiliate-media-kit-approval-trigger-design.md`

## Global Constraints

- No retroactive send for posts already `status = 'approved'` before this ships — only future approvals trigger it.
- No changes to `/api/posts/[id]/client-action/route.ts` — it requires `campaign_batch_id`, which Everest's vehicle posts never get, so it can never reach the code path that would need the notify call (see spec's "Correction from the original design pass").
- No WhatsApp distribution — untouched, still "planned."
- No admin UI changes on either app — this is backend-only.
- A per-affiliate email failure must never fail the rest of the batch, and a webhook failure must never surface as an error on the approval action itself (the approval already succeeded).

---

## Part 1 — Ember Social

### Task 1: Migration — `post_kind` and `affiliate_notified_at` columns

**Files:**
- Create: `ember-social/supabase/migrations/024_posts_affiliate_notify.sql`

**Interfaces:**
- Produces: `posts.post_kind` (nullable text, one of `'feed' | 'reel' | 'walkthrough'`), `posts.affiliate_notified_at` (nullable timestamptz) — both consumed by Task 2 (trigger route) and Task 3 (helper).

- [ ] **Step 1: Write the migration**

```sql
-- Discriminates which vehicle post a row is (feed / reel / full walkthrough)
-- so the Ember Social approval flow can identify the walkthrough post for a
-- given car without matching on AI-rewritten post content. Everest Motoring
-- sets this when it creates the post via /api/trigger.
alter table public.posts add column if not exists post_kind text
  check (post_kind in ('feed', 'reel', 'walkthrough'));

-- Tracks whether the affiliate media-kit webhook has already fired for this
-- post, so an approve action can never trigger it twice.
alter table public.posts add column if not exists affiliate_notified_at timestamptz;
```

- [ ] **Step 2: Apply the migration**

Run this against the Ember Social Supabase project (via the Supabase SQL editor, or `supabase db push` if the local CLI is linked to that project). There is no local Postgres for this repo to test against first — verify by querying the columns exist afterward:

```sql
select column_name, data_type from information_schema.columns
where table_name = 'posts' and column_name in ('post_kind', 'affiliate_notified_at');
```

Expected: two rows returned.

- [ ] **Step 3: Commit**

```bash
git add ember-social/supabase/migrations/024_posts_affiliate_notify.sql
git commit -m "feat(ember-social): add post_kind and affiliate_notified_at columns

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: `/api/trigger` accepts and stores `post_kind`

**Files:**
- Modify: `ember-social/src/app/api/trigger/route.ts:110-111` (destructure), `:150-153` (insert)

**Interfaces:**
- Consumes: `posts.post_kind` column from Task 1.
- Produces: every post Everest creates now carries `post_kind` in the DB — consumed by Task 3's helper (`.eq('post_kind', 'walkthrough')`) and by Task 8 (Everest sends the field).

- [ ] **Step 1: Add `post_kind` to the destructured payload**

In `ember-social/src/app/api/trigger/route.ts`, find:

```ts
        const payload = await req.json()
        const { content, platforms, scheduled_at, media_urls, preferred_time, vehicle_id } = payload
```

Replace with:

```ts
        const payload = await req.json()
        const { content, platforms, scheduled_at, media_urls, preferred_time, vehicle_id, post_kind } = payload
```

- [ ] **Step 2: Store it conditionally, same pattern as `vehicle_id`**

Find:

```ts
        // Store vehicle_id if provided (for scheduling logic)
        if (vehicle_id) {
            insertData.vehicle_id = vehicle_id
        }
```

Replace with:

```ts
        // Store vehicle_id if provided (for scheduling logic)
        if (vehicle_id) {
            insertData.vehicle_id = vehicle_id
        }

        // Store post_kind if provided — lets the approval flow identify the
        // full walkthrough post for affiliate-notify purposes (Task 3).
        if (post_kind) {
            insertData.post_kind = post_kind
        }
```

- [ ] **Step 3: Verify manually**

There's no existing test coverage for this route. Confirm with a local dev run:

```bash
cd ember-social && npm run dev
```

In another terminal, hit it with a fake key (this will 401, which confirms the route still compiles and the field addition didn't break parsing — full behavioral verification happens in Task 4's manual end-to-end check):

```bash
curl -s -X POST http://localhost:3000/api/trigger \
  -H "Authorization: Bearer es_fake" \
  -H "Content-Type: application/json" \
  -d '{"content":"test","platforms":["facebook"],"post_kind":"walkthrough"}'
```

Expected: `{"error":"Unauthorized key"}` (proves the new field didn't break JSON parsing before auth is even checked).

- [ ] **Step 4: Commit**

```bash
git add ember-social/src/app/api/trigger/route.ts
git commit -m "feat(ember-social): accept and store post_kind on /api/trigger

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: `notifyAffiliateKitIfApproved` helper (TDD)

**Files:**
- Create: `ember-social/src/lib/affiliateNotify.ts`
- Test: `ember-social/src/lib/affiliateNotify.test.ts`

**Interfaces:**
- Consumes: `createAdminClient()` from `./supabase/client` (relative import — this file is a sibling of `src/lib/supabase/`, so `./supabase/client` is shorter than the `@/lib/supabase/client` alias used elsewhere and needs no vitest alias config).
- Produces: `notifyAffiliateKitIfApproved(postId: string): Promise<{ notified: boolean }>` — consumed by Task 4.

- [ ] **Step 1: Write the failing test**

Create `ember-social/src/lib/affiliateNotify.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

let claimResult: { vehicle_id: string } | null = null
const updateCalls: any[] = []
const eqCalls: any[] = []
const isCalls: any[] = []

function makeQueryBuilder() {
    const builder: any = {
        eq: (...args: any[]) => { eqCalls.push(args); return builder },
        is: (...args: any[]) => { isCalls.push(args); return builder },
        select: () => builder,
        single: async () => ({ data: claimResult, error: null }),
    }
    return builder
}

const fakeSupabase = {
    from: () => ({
        update: (patch: any) => {
            updateCalls.push(patch)
            return makeQueryBuilder()
        },
    }),
}

vi.mock('./supabase/client', () => ({
    createAdminClient: () => fakeSupabase,
}))

const { notifyAffiliateKitIfApproved } = await import('./affiliateNotify')

beforeEach(() => {
    claimResult = null
    updateCalls.length = 0
    eqCalls.length = 0
    isCalls.length = 0
    vi.unstubAllGlobals()
    process.env.EVEREST_SITE_URL = 'https://everestmotoring.co.za'
    process.env.AFFILIATE_NOTIFY_SECRET = 'test-secret'
})

describe('notifyAffiliateKitIfApproved', () => {
    it('does nothing when the claim matches no row (not a walkthrough, or already notified)', async () => {
        claimResult = null
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)

        const result = await notifyAffiliateKitIfApproved('post-1')

        expect(result.notified).toBe(false)
        expect(fetchMock).not.toHaveBeenCalled()
        expect(eqCalls).toContainEqual(['post_kind', 'walkthrough'])
        expect(isCalls).toContainEqual(['affiliate_notified_at', null])
    })

    it('calls the Everest webhook for a claimed walkthrough post', async () => {
        claimResult = { vehicle_id: 'car-123' }
        const fetchMock = vi.fn().mockResolvedValue({ ok: true })
        vi.stubGlobal('fetch', fetchMock)

        const result = await notifyAffiliateKitIfApproved('post-1')

        expect(result.notified).toBe(true)
        expect(fetchMock).toHaveBeenCalledWith(
            'https://everestmotoring.co.za/api/affiliate/notify-approved',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({ Authorization: 'Bearer test-secret' }),
                body: JSON.stringify({ carId: 'car-123' }),
            })
        )
        expect(updateCalls).toHaveLength(1) // claim only, no rollback
    })

    it('rolls the claim back when the webhook call fails', async () => {
        claimResult = { vehicle_id: 'car-123' }
        const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
        vi.stubGlobal('fetch', fetchMock)

        const result = await notifyAffiliateKitIfApproved('post-1')

        expect(result.notified).toBe(false)
        expect(updateCalls).toHaveLength(2)
        expect(updateCalls[1]).toEqual({ affiliate_notified_at: null })
    })

    it('no-ops without calling the claim when env vars are missing', async () => {
        delete process.env.EVEREST_SITE_URL
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)

        const result = await notifyAffiliateKitIfApproved('post-1')

        expect(result.notified).toBe(false)
        expect(fetchMock).not.toHaveBeenCalled()
        expect(updateCalls).toHaveLength(0)
    })
})
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd ember-social && npx vitest run src/lib/affiliateNotify.test.ts
```

Expected: FAIL — `Cannot find module './affiliateNotify'` (the file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `ember-social/src/lib/affiliateNotify.ts`:

```ts
import { createAdminClient } from './supabase/client'

/**
 * Fires the affiliate media-kit webhook to Everest Motoring the moment a
 * car's full walkthrough post is approved — but only once. The claim
 * (flipping affiliate_notified_at from null) is atomic and scoped to
 * post_kind = 'walkthrough', so a reel, a feed post, or a post already
 * notified matches no row and this is a silent no-op. On a failed webhook
 * call the claim is rolled back so the next approve action on this post
 * retries it — there is no cron; retry is driven by a future approve
 * action, an acceptable bound for this low-frequency, human-driven event.
 */
export async function notifyAffiliateKitIfApproved(postId: string): Promise<{ notified: boolean }> {
    const siteUrl = process.env.EVEREST_SITE_URL
    const secret = process.env.AFFILIATE_NOTIFY_SECRET
    if (!siteUrl || !secret) {
        console.warn('notifyAffiliateKitIfApproved skipped: EVEREST_SITE_URL or AFFILIATE_NOTIFY_SECRET is not set')
        return { notified: false }
    }

    const supabase = createAdminClient()

    const { data: claimed } = await supabase
        .from('posts')
        .update({ affiliate_notified_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('post_kind', 'walkthrough')
        .is('affiliate_notified_at', null)
        .select('vehicle_id')
        .single()

    if (!claimed?.vehicle_id) {
        return { notified: false }
    }

    try {
        const res = await fetch(`${siteUrl}/api/affiliate/notify-approved`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${secret}`,
            },
            body: JSON.stringify({ carId: claimed.vehicle_id }),
        })
        if (!res.ok) throw new Error(`Everest webhook returned ${res.status}`)
    } catch (err: any) {
        console.error('notifyAffiliateKitIfApproved: webhook failed, rolling back claim:', err.message)
        await supabase.from('posts').update({ affiliate_notified_at: null }).eq('id', postId)
        return { notified: false }
    }

    return { notified: true }
}
```

- [ ] **Step 4: Run the tests and verify they pass**

```bash
cd ember-social && npx vitest run src/lib/affiliateNotify.test.ts
```

Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add ember-social/src/lib/affiliateNotify.ts ember-social/src/lib/affiliateNotify.test.ts
git commit -m "feat(ember-social): add notifyAffiliateKitIfApproved helper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Wire the helper into the admin Approve action

**Files:**
- Modify: `ember-social/src/app/api/workspaces/posts/update/route.ts`

**Interfaces:**
- Consumes: `notifyAffiliateKitIfApproved(postId: string)` from Task 3.

- [ ] **Step 1: Add the import**

In `ember-social/src/app/api/workspaces/posts/update/route.ts`, find:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
```

Replace with:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyAffiliateKitIfApproved } from '@/lib/affiliateNotify'
```

- [ ] **Step 2: Call it after a successful approval write**

Find:

```ts
        const { error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', postId)

        if (error) throw error

        return NextResponse.json({ success: true })
```

Replace with:

```ts
        const { error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', postId)

        if (error) throw error

        if (updates.status === 'approved') {
            await notifyAffiliateKitIfApproved(postId)
        }

        return NextResponse.json({ success: true })
```

Note: `notifyAffiliateKitIfApproved` never throws (its own webhook failure is caught internally), so this can't turn a successful approval into a reported error.

- [ ] **Step 3: Verify manually**

```bash
cd ember-social && npm run dev
```

Approve any existing post from `/dashboard/workspaces/<id>/approvals` (a non-walkthrough one is fine for this check) and confirm in the server logs there's no thrown error and the response still returns `{"success":true}`. Full behavioral verification (a real walkthrough post actually firing the webhook) happens in Task 9, once Part 2 exists on the Everest side to receive it.

- [ ] **Step 4: Commit**

```bash
git add ember-social/src/app/api/workspaces/posts/update/route.ts
git commit -m "feat(ember-social): fire affiliate notify on post approval

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Part 2 — Everest Motoring

### Task 5: Add Vitest + the shared vehicle-payload builder (TDD)

**Files:**
- Modify: `everest-motoring/package.json` (add `vitest` devDependency + `test` script)
- Create: `everest-motoring/src/utils/affiliate/mediaKit.js`
- Test: `everest-motoring/src/utils/affiliate/mediaKit.test.js`

**Interfaces:**
- Produces: `buildAffiliateVehiclePayload(car, ref, siteUrl): VehiclePayload` — consumed by Task 6 (test route refactor) and Task 7 (new notify route). `car` is a `cars` table row (needs `id, make, model, year, price, mileage, transmission, fuel_type, colour, features, main_image_url, video_url`). `ref` is the affiliate's tracking code (a string). `siteUrl` is the site's base URL (no trailing slash).

- [ ] **Step 1: Add Vitest to the project**

In `everest-motoring/package.json`, find:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
```

Replace with:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run"
  },
```

And find:

```json
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.19",
    "autoprefixer": "^10.4.24",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19"
  }
```

Replace with:

```json
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.19",
    "autoprefixer": "^10.4.24",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "vitest": "^4.1.10"
  }
```

Then install:

```bash
cd everest-motoring && npm install
```

- [ ] **Step 2: Write the failing test**

Create `everest-motoring/src/utils/affiliate/mediaKit.test.js`:

```js
import { describe, it, expect } from "vitest";
import { buildAffiliateVehiclePayload } from "./mediaKit";

const baseCar = {
    id: "car-1",
    make: "Toyota",
    model: "Hilux 2.8GD-6 Legend",
    year: 2024,
    price: 749900,
    mileage: 12500,
    transmission: "Automatic",
    fuel_type: "Diesel",
    colour: "Glacier White",
    features: ["Leather seats", "Reverse camera"],
    main_image_url: "https://example.com/hilux.jpg",
    video_url: null,
};

describe("buildAffiliateVehiclePayload", () => {
    it("formats price and mileage as en-ZA strings", () => {
        // en-ZA's Intl.NumberFormat uses U+00A0 (non-breaking space) as the
        // thousands separator, not a comma — verify against the actual
        // runtime output rather than assuming comma formatting.
        const result = buildAffiliateVehiclePayload(baseCar, "AFF123", "https://everestmotoring.co.za");
        expect(result.price).toBe("R 749 900");
        expect(result.mileage).toBe("12 500 km");
    });

    it("builds tracking/flyer/media-kit links keyed to the affiliate's ref", () => {
        const result = buildAffiliateVehiclePayload(baseCar, "AFF123", "https://everestmotoring.co.za");
        expect(result.trackingLink).toBe("https://everestmotoring.co.za/inventory/car-1?ref=AFF123");
        expect(result.flyerUrl).toBe("https://everestmotoring.co.za/api/affiliate/flyer/car-1?ref=AFF123");
        expect(result.mediaKitUrl).toBe("https://everestmotoring.co.za/affiliate/media/car-1");
    });

    it("omits videoUrl when the car has no Cloudflare Stream video", () => {
        const result = buildAffiliateVehiclePayload(baseCar, "AFF123", "https://everestmotoring.co.za");
        expect(result.videoUrl).toBeNull();
    });

    it("builds a video download link when the car has a cf: video", () => {
        const carWithVideo = { ...baseCar, video_url: "cf:abc123" };
        const result = buildAffiliateVehiclePayload(carWithVideo, "AFF123", "https://everestmotoring.co.za");
        expect(result.videoUrl).toBe(
            "https://everestmotoring.co.za/api/affiliate/video-download/car-1?ref=AFF123&redirect=1"
        );
    });

    it("leaves mileage null when the car has none", () => {
        const carNoMileage = { ...baseCar, mileage: null };
        const result = buildAffiliateVehiclePayload(carNoMileage, "AFF123", "https://everestmotoring.co.za");
        expect(result.mileage).toBeNull();
    });
});
```

- [ ] **Step 3: Run it to verify it fails**

```bash
cd everest-motoring && npx vitest run src/utils/affiliate/mediaKit.test.js
```

Expected: FAIL — `Cannot find module './mediaKit'`.

- [ ] **Step 4: Write the implementation**

Create `everest-motoring/src/utils/affiliate/mediaKit.js`:

```js
/**
 * Builds the per-affiliate vehicle payload for the AffiliateMediaKit email —
 * shared between the manual test route and the real approval-triggered
 * send so the two can't drift apart.
 */
export function buildAffiliateVehiclePayload(car, ref, siteUrl) {
    const hasVideo = typeof car.video_url === "string" && car.video_url.startsWith("cf:");

    return {
        make: car.make,
        model: car.model,
        year: car.year,
        price: `R ${new Intl.NumberFormat("en-ZA").format(car.price)}`,
        mileage: car.mileage ? `${new Intl.NumberFormat("en-ZA").format(car.mileage)} km` : null,
        transmission: car.transmission,
        fuelType: car.fuel_type,
        colour: car.colour,
        features: car.features || [],
        image: car.main_image_url,
        mediaKitUrl: `${siteUrl}/affiliate/media/${car.id}`,
        trackingLink: `${siteUrl}/inventory/${car.id}?ref=${ref}`,
        flyerUrl: `${siteUrl}/api/affiliate/flyer/${car.id}?ref=${ref}`,
        videoUrl: hasVideo ? `${siteUrl}/api/affiliate/video-download/${car.id}?ref=${ref}&redirect=1` : null,
    };
}
```

- [ ] **Step 5: Run the tests and verify they pass**

```bash
cd everest-motoring && npx vitest run src/utils/affiliate/mediaKit.test.js
```

Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add everest-motoring/package.json everest-motoring/package-lock.json everest-motoring/src/utils/affiliate/mediaKit.js everest-motoring/src/utils/affiliate/mediaKit.test.js
git commit -m "feat(everest): add vitest and shared affiliate vehicle-payload builder

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Refactor the test route onto the shared builder

**Files:**
- Modify: `everest-motoring/src/app/api/admin/test-affiliate-email/route.js`

**Interfaces:**
- Consumes: `buildAffiliateVehiclePayload` from Task 5.

- [ ] **Step 1: Replace the inline vehicle-object construction**

Replace the full contents of `everest-motoring/src/app/api/admin/test-affiliate-email/route.js` with:

```js
import * as React from "react";
import { createAdminClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/resend";
import { AffiliateMediaKit } from "@/emails/AffiliateMediaKit";
import { buildAffiliateVehiclePayload } from "@/utils/affiliate/mediaKit";

export async function GET() {
    const supabase = await createAdminClient();

    const { data: car, error } = await supabase
        .from("cars")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !car) {
        return Response.json({ success: false, error: error || "No available car found" }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://everestmotoring.co.za";
    const vehicle = buildAffiliateVehiclePayload(car, "TEST123", siteUrl);

    const result = await sendEmail({
        to: "alec@firewireit.co.za",
        subject: `[TEST] New Media Kit: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        react: React.createElement(AffiliateMediaKit, { vehicle, affiliateName: "Alec (Test)" }),
    });

    return Response.json({ success: result.success, car: { id: car.id, make: car.make, model: car.model }, result });
}
```

- [ ] **Step 2: Verify manually**

```bash
cd everest-motoring && npm run dev
```

In another terminal:

```bash
curl -s http://localhost:3000/api/admin/test-affiliate-email
```

Expected: `{"success":true,...}` and the test email arrives at `alec@firewireit.co.za`, identical in content to before this refactor (same template, same TEST123 ref).

- [ ] **Step 3: Commit**

```bash
git add everest-motoring/src/app/api/admin/test-affiliate-email/route.js
git commit -m "refactor(everest): route test-affiliate-email through the shared builder

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: New `/api/affiliate/notify-approved` webhook route (TDD)

**Files:**
- Create: `everest-motoring/vitest.config.mjs`
- Create: `everest-motoring/src/app/api/affiliate/notify-approved/route.js`
- Test: `everest-motoring/src/app/api/affiliate/notify-approved/route.test.js`

**Interfaces:**
- Consumes: `buildAffiliateVehiclePayload` from Task 5; `createAdminClient` from `@/utils/supabase/server`; `sendEmail` from `@/lib/resend`; `AffiliateMediaKit` from `@/emails/AffiliateMediaKit`.
- Produces: `POST /api/affiliate/notify-approved` — the endpoint Task 4's Ember Social helper calls with `{ carId }` and `Authorization: Bearer <AFFILIATE_NOTIFY_SECRET>`.

- [ ] **Step 1: Add the `@` alias to Vitest**

This test imports two real (unmocked) modules via the `@/` path alias (`@/emails/AffiliateMediaKit` and `@/utils/affiliate/mediaKit`) — Task 5's test never needed this since it only used relative imports. Create `everest-motoring/vitest.config.mjs`:

```js
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
```

- [ ] **Step 2: Write the failing test**

Create `everest-motoring/src/app/api/affiliate/notify-approved/route.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from "vitest";

let mockCar = null;
let mockAffiliates = [];
let mockAffiliatesError = null;
const sendEmailCalls = [];
let sendEmailResults = [];

function makeQueryBuilder(result) {
    const builder = {
        select: () => builder,
        eq: () => builder,
        not: () => builder,
        maybeSingle: async () => result,
        then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
    return builder;
}

vi.mock("@/utils/supabase/server", () => ({
    createAdminClient: async () => ({
        from: (table) => {
            if (table === "cars") return makeQueryBuilder({ data: mockCar, error: null });
            if (table === "profiles") return makeQueryBuilder({ data: mockAffiliates, error: mockAffiliatesError });
            throw new Error(`Unexpected table: ${table}`);
        },
    }),
}));

vi.mock("@/lib/resend", () => ({
    sendEmail: async (args) => {
        sendEmailCalls.push(args);
        return sendEmailResults.shift() ?? { success: true };
    },
}));

const { POST } = await import("./route");

function makeRequest(body, headers = {}) {
    const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
    return {
        headers: { get: (key) => lower[key.toLowerCase()] ?? null },
        json: async () => body,
    };
}

beforeEach(() => {
    mockCar = {
        id: "car-1",
        make: "Toyota",
        model: "Hilux",
        year: 2024,
        price: 749900,
        mileage: 12500,
        main_image_url: "https://example.com/hilux.jpg",
        video_url: null,
    };
    mockAffiliates = [];
    mockAffiliatesError = null;
    sendEmailCalls.length = 0;
    sendEmailResults = [];
    process.env.AFFILIATE_NOTIFY_SECRET = "test-secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://everestmotoring.co.za";
});

describe("POST /api/affiliate/notify-approved", () => {
    it("rejects a request with a missing or wrong bearer secret", async () => {
        const res = await POST(makeRequest({ carId: "car-1" }, { authorization: "Bearer wrong" }));
        expect(res.status).toBe(401);
        expect(sendEmailCalls).toHaveLength(0);
    });

    it("emails every approved affiliate with their own tracking ref", async () => {
        mockAffiliates = [
            { id: "a1", first_name: "Jane", email: "jane@example.com", affiliate_code: "JANEAB12" },
            { id: "a2", first_name: "Sam", email: "sam@example.com", affiliate_code: "SAMCD34" },
        ];
        sendEmailResults = [{ success: true }, { success: true }];

        const res = await POST(makeRequest({ carId: "car-1" }, { authorization: "Bearer test-secret" }));
        const body = await res.json();

        expect(body).toEqual({ success: true, notified: 2 });
        expect(sendEmailCalls).toHaveLength(2);
        expect(sendEmailCalls[0].to).toBe("jane@example.com");
        expect(sendEmailCalls[1].to).toBe("sam@example.com");
    });

    it("continues sending to the rest when one affiliate's send fails", async () => {
        mockAffiliates = [
            { id: "a1", first_name: "Jane", email: "jane@example.com", affiliate_code: "JANEAB12" },
            { id: "a2", first_name: "Sam", email: "sam@example.com", affiliate_code: "SAMCD34" },
        ];
        sendEmailResults = [{ success: false, error: "bounced" }, { success: true }];

        const res = await POST(makeRequest({ carId: "car-1" }, { authorization: "Bearer test-secret" }));
        const body = await res.json();

        expect(body).toEqual({ success: true, notified: 1 });
        expect(sendEmailCalls).toHaveLength(2);
    });

    it("404s when the car doesn't exist", async () => {
        mockCar = null;
        const res = await POST(makeRequest({ carId: "missing" }, { authorization: "Bearer test-secret" }));
        expect(res.status).toBe(404);
    });
});
```

- [ ] **Step 3: Run it to verify it fails**

```bash
cd everest-motoring && npx vitest run src/app/api/affiliate/notify-approved/route.test.js
```

Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 4: Write the implementation**

Create `everest-motoring/src/app/api/affiliate/notify-approved/route.js`:

```js
import * as React from "react";
import { createAdminClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/resend";
import { AffiliateMediaKit } from "@/emails/AffiliateMediaKit";
import { buildAffiliateVehiclePayload } from "@/utils/affiliate/mediaKit";

/**
 * Called by Ember Social the moment a car's full walkthrough post is
 * approved there. Emails every approved affiliate their personalised
 * media kit for that car.
 */
export async function POST(req) {
    const secret = process.env.AFFILIATE_NOTIFY_SECRET;
    const authHeader = req.headers.get("authorization") || "";
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { carId } = await req.json();
    if (!carId) {
        return Response.json({ success: false, error: "carId is required" }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: car } = await supabase
        .from("cars")
        .select("*")
        .eq("id", carId)
        .maybeSingle();

    if (!car) {
        return Response.json({ success: false, error: "Car not found" }, { status: 404 });
    }

    const { data: affiliates, error: affiliatesError } = await supabase
        .from("profiles")
        .select("id, first_name, email, affiliate_code")
        .eq("role", "affiliate")
        .eq("is_approved", true)
        .not("affiliate_code", "is", null);

    if (affiliatesError) {
        return Response.json({ success: false, error: affiliatesError.message }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://everestmotoring.co.za";
    let notified = 0;

    for (const affiliate of affiliates || []) {
        const vehicle = buildAffiliateVehiclePayload(car, affiliate.affiliate_code, siteUrl);
        try {
            const result = await sendEmail({
                to: affiliate.email,
                subject: `New Media Kit: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                react: React.createElement(AffiliateMediaKit, {
                    vehicle,
                    affiliateName: affiliate.first_name || "Partner",
                }),
            });
            if (result.success) {
                notified += 1;
            } else {
                console.warn(`notify-approved: send failed for affiliate ${affiliate.id}:`, result.error);
            }
        } catch (err) {
            console.warn(`notify-approved: send threw for affiliate ${affiliate.id}:`, err.message);
        }
    }

    return Response.json({ success: true, notified });
}
```

- [ ] **Step 5: Run the tests and verify they pass**

```bash
cd everest-motoring && npx vitest run src/app/api/affiliate/notify-approved/route.test.js
```

Expected: 4 passed.

- [ ] **Step 6: Run the full Everest test suite to confirm nothing else broke**

```bash
cd everest-motoring && npm test
```

Expected: all tests pass (Task 5's + this task's).

- [ ] **Step 7: Commit**

```bash
git add everest-motoring/vitest.config.mjs everest-motoring/src/app/api/affiliate/notify-approved/route.js everest-motoring/src/app/api/affiliate/notify-approved/route.test.js
git commit -m "feat(everest): add /api/affiliate/notify-approved webhook route

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Tag `post_kind` at the three post-creation call sites

**Files:**
- Modify: `everest-motoring/src/app/admin/inventory/socialAction.js:231-235` (`createSocialPost`), `:378-383` (`scheduleNewCarFeedPost`), `:426-429` (`postApprovedVideoPosts`)

**Interfaces:**
- Produces: every post Everest sends to `/api/trigger` now carries `post_kind`, matching what Task 2 stores and Task 3's helper filters on.

- [ ] **Step 1: Tag the three post types in `createSocialPost`**

Find:

```js
        // Send all 3 post types with preferred times — the trigger API will
        // assign the actual date (today or next available day, max 2 cars/day)
        const posts = [
            { ...buildFeedPost(car), preferred_time: times.feedTime, vehicle_id: car.id },
            { ...buildReelPost(car), preferred_time: times.reelTime, vehicle_id: car.id },
            { ...buildVideoPost(car), preferred_time: times.videoTime, vehicle_id: car.id },
        ];
```

Replace with:

```js
        // Send all 3 post types with preferred times — the trigger API will
        // assign the actual date (today or next available day, max 2 cars/day)
        const posts = [
            { ...buildFeedPost(car), preferred_time: times.feedTime, vehicle_id: car.id, post_kind: "feed" },
            { ...buildReelPost(car), preferred_time: times.reelTime, vehicle_id: car.id, post_kind: "reel" },
            { ...buildVideoPost(car), preferred_time: times.videoTime, vehicle_id: car.id, post_kind: "walkthrough" },
        ];
```

- [ ] **Step 2: Tag the feed post in `scheduleNewCarFeedPost`**

Find:

```js
    try {
        await sendToEmber(
            { ...buildFeedPost(car), scheduled_at: scheduledAt, vehicle_id: car.id },
            apiKey,
            apiUrl
        );
```

Replace with:

```js
    try {
        await sendToEmber(
            { ...buildFeedPost(car), scheduled_at: scheduledAt, vehicle_id: car.id, post_kind: "feed" },
            apiKey,
            apiUrl
        );
```

- [ ] **Step 3: Tag the reel and walkthrough posts in `postApprovedVideoPosts`**

Find:

```js
    const posts = [
        { ...buildReelPost(car), scheduled_at: slotIso(day, REEL_SLOT_UTC), vehicle_id: car.id },
        { ...buildVideoPost(car), scheduled_at: slotIso(day, VIDEO_SLOT_UTC), vehicle_id: car.id },
    ];
```

Replace with:

```js
    const posts = [
        { ...buildReelPost(car), scheduled_at: slotIso(day, REEL_SLOT_UTC), vehicle_id: car.id, post_kind: "reel" },
        { ...buildVideoPost(car), scheduled_at: slotIso(day, VIDEO_SLOT_UTC), vehicle_id: car.id, post_kind: "walkthrough" },
    ];
```

- [ ] **Step 4: Verify manually**

There's no existing test file for `socialAction.js` (it depends on live Supabase + the Ember Social API, per the project's existing "never exercised end to end" caveat — see `project_everest_auto_social_video_gate` note). Confirm the three edits are syntactically sound using the project's existing lint script:

```bash
cd everest-motoring && npm run lint
```

Expected: no new errors on `socialAction.js` (pre-existing warnings elsewhere in the repo, if any, are not this task's concern). Full behavioral verification happens in Task 9's end-to-end check.

- [ ] **Step 5: Commit**

```bash
git add everest-motoring/src/app/admin/inventory/socialAction.js
git commit -m "feat(everest): tag post_kind on every post sent to Ember Social

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Part 3 — Deployment and End-to-End Verification

### Task 9: Env vars and a real end-to-end run

**Files:** none (configuration + manual verification only)

- [ ] **Step 1: Generate a shared secret**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] **Step 2: Set env vars on Ember Social (Vercel)**

- `EVEREST_SITE_URL` = `https://everestmotoring.co.za`
- `AFFILIATE_NOTIFY_SECRET` = the value generated in Step 1

- [ ] **Step 3: Set the matching env var on Everest Motoring (Vercel)**

- `AFFILIATE_NOTIFY_SECRET` = the same value generated in Step 1 (must match exactly — this is the shared secret both sides check)

- [ ] **Step 4: Deploy both apps**

Everest Motoring auto-deploys on push to `main` (per `project_everest_deploy` — verify with `/api/health` once live). Ember Social does **not** auto-deploy — deploy manually from the Antigravity repo root:

```bash
cd ember-social && vercel --prod
```

- [ ] **Step 5: Run a real end-to-end check**

With a real (or disposable test) car that has a walkthrough video already rendered and posted to Ember Social as `pending_approval`:

1. Open Ember Social's `/dashboard/workspaces/<everest-workspace-id>/approvals`.
2. Find that car's full-walkthrough post (the one whose content mentions the full walkthrough) and click **Approve**.
3. Confirm the response still succeeds (no error shown).
4. Check Vercel logs for Ember Social's `posts/update` route — expect no thrown error, and (if `console.log`s are visible) evidence `notifyAffiliateKitIfApproved` ran.
5. Check Vercel logs for Everest's `/api/affiliate/notify-approved` — expect a 200 with `{"success":true,"notified":<N>}` where N matches the current approved-affiliate count.
6. Confirm at least one approved affiliate's inbox actually received the email, and that its tracking link (`?ref=<their affiliate_code>`) is theirs, not another affiliate's.

- [ ] **Step 6: Record the outcome**

Whatever the result — success or a specific failure — note it in a follow-up memory entry (`project_everest_affiliate_notify.md` or similar) the same way `project_everest_auto_social_video_gate` tracks its own "never exercised end to end" caveat, so a future session knows whether this has actually been proven live.
