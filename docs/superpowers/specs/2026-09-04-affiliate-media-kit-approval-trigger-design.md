# Affiliate media kit on walkthrough approval — design

**Date:** 2026-09-04
**Status:** Approved by user, pending implementation plan

## Problem

Everest Motoring has an affiliate programme (dashboard, tracking links, per-car media kits) and a working `AffiliateMediaKit` email template — but nothing ever sends it. The only call site is a manual, hardcoded-recipient test route. Affiliates only learn about a new car if they happen to check `/affiliate/media` themselves.

The user wants the kit sent automatically, but only once the car's full walkthrough video has cleared human review — because the video is the thing that sometimes has mistakes, and the review step is what confirms it's fit to hand to affiliates.

## Where "approved" actually happens

Everest Motoring has its own gate (`cars.video_approval_status`) that decides whether the reel + walkthrough posts get created at all. But every post Everest sends — feed, reel, and walkthrough alike — lands in **Ember Social** (a separate app, separate Supabase project) as `status: 'pending_approval'`. A second, human approval inside Ember Social (via the `/approvals` page's Approve button, or a client token link) is what actually clears a post to publish. That second approval — inside Ember Social — is the one the user means by "when the walkthrough video is approved."

Ember Social's `posts` table has no reliable field today to tell a walkthrough post apart from a reel or feed post for the same car. The only existing check (a UI badge in `PostPreviewCard.tsx`) matches on the literal text `"Full Walkthrough"` inside `content` — fragile, because `content` is AI-rewritten per platform before it's stored and can lose that exact phrase.

## Decisions (confirmed with user)

1. **Trigger scope:** fires on the walkthrough post's approval alone. The reel's approval status is not checked.
2. **Post identification:** add a proper `post_kind` column in Ember Social, set by Everest Motoring at post-creation time (Everest already knows which post is which — no guessing needed on Ember Social's side).

## Architecture

```
Everest Motoring                         Ember Social
─────────────────                        ────────────
postApprovedVideoPosts(carId)
  → tags each post with post_kind
    ('reel' | 'walkthrough')     ──POST──▶ /api/trigger
                                            inserts posts,
                                            status='pending_approval'

                                           Someone clicks Approve
                                           (on /approvals page, or
                                           a client token link)
                                                   │
                                                   ▼
                                           status → 'approved'
                                           (admin Approve button
                                            calls the helper)
                                                   │
                                                   ▼
                                           if post_kind='walkthrough':
                                           atomically claim, then
◀──POST /api/affiliate/notify-approved──  call back to Everest
{ carId }                                 { carId }
  │
  ▼
fetch car + approved affiliates,
send each their AffiliateMediaKit
email (best-effort per affiliate)
```

## Changes — Ember Social

1. **Migration**: `posts` gets two nullable columns:
   - `post_kind text check (post_kind in ('feed','reel','walkthrough'))`
   - `affiliate_notified_at timestamptz`
   Nullable so every existing row and every non-Everest workspace's posts are untouched.
2. **`/api/trigger`**: accepts an optional `post_kind` in the payload and stores it, using the same conditional-set pattern already used for `vehicle_id`.
3. **New shared helper** `src/lib/affiliateNotify.ts`: `notifyAffiliateKitIfApproved(postId)`.
   - Atomically claims via `update posts set affiliate_notified_at = now() where id = :postId and post_kind = 'walkthrough' and affiliate_notified_at is null returning vehicle_id`. A non-walkthrough post, or one already claimed, is a silent no-op (matches nothing).
   - On a successful claim, `POST`s to `${EVEREST_SITE_URL}/api/affiliate/notify-approved` with `{ carId: vehicle_id }` and `Authorization: Bearer ${AFFILIATE_NOTIFY_SECRET}`.
   - On a thrown/non-2xx response, rolls the claim back to `null` so the next approve action on that post retries it (mirrors the exact claim → call → rollback-on-failure idiom already used in Everest's own `postApprovedVideoPosts`).
   - If `EVEREST_SITE_URL` or `AFFILIATE_NOTIFY_SECRET` isn't configured, no-ops with a `console.warn` — same missing-config pattern `createSocialPost` already uses for `EMBER_SOCIAL_API_KEY` — rather than claiming a post it can't actually notify for.
4. **One call site**: `/api/workspaces/posts/update/route.ts` (the admin Approve button on `/approvals`) calls the helper immediately after a successful `status: 'approved'` write.
   - **Correction from the original design pass:** `/api/posts/[id]/client-action/route.ts` (the client token-link approve) was assumed to be a second path worth wiring, mirroring Everest's own "both approval routes funnel through one function" pattern. Reading the full route showed it 400s with `"Not part of a campaign batch"` unless the post has a `campaign_batch_id` — and Everest's `/api/trigger` payload never sets one for vehicle posts. That route cannot process a feed/reel/walkthrough post today, so wiring the helper into it would be dead code. One call site is correct as of this writing; if vehicle posts ever gain campaign-batch support, add the same one-line call there then.
5. **New env vars**: `EVEREST_SITE_URL`, `AFFILIATE_NOTIFY_SECRET` — same shape as the existing `EMBER_SOCIAL_URL` / `EMBER_SOCIAL_API_KEY` pair, pointed the other direction.

## Changes — Everest Motoring

1. **`socialAction.js`**: `buildFeedPost`/`buildReelPost`/`buildVideoPost` call sites each pass their own `post_kind` ('feed' / 'reel' / 'walkthrough' respectively) in the `/api/trigger` payload.
2. **New shared helper** `src/utils/affiliate/mediaKit.js`: the vehicle-payload builder (mediaKitUrl, trackingLink, flyerUrl, videoUrl — currently inlined in `test-affiliate-email/route.js`) is extracted here so the test route and the real send can't drift apart.
3. **New route** `POST /api/affiliate/notify-approved`:
   - Verifies `Authorization: Bearer ${AFFILIATE_NOTIFY_SECRET}`; 401 on mismatch.
   - Body: `{ carId }`.
   - Fetches the car row; 404 if missing.
   - Queries `profiles` where `role = 'affiliate' AND is_approved = true AND affiliate_code IS NOT NULL`.
   - For each affiliate: builds their personalised vehicle payload (via the shared helper, keyed to their own `affiliate_code`) and `sendEmail()`s the existing `AffiliateMediaKit` template. Each send is wrapped in its own `try/catch` — one bad address logs a warning, the rest still go out.
   - Returns `{ success: true, notified: <count> }`.

## Error handling

- Ember Social → Everest webhook fails (network error, Everest down, 401): the claim rolls back to `null`; nothing is silently lost, and the next time that post transitions through an approve action, it retries. There is no cron — retry is driven by a future approve action, which is an acceptable bound given this is a low-frequency, human-driven event.
- Everest → Resend fails for one affiliate: logged via `console.warn`, does not affect other affiliates' sends, does not fail the endpoint.
- Approving the same post twice, or approving the reel instead of the walkthrough: no-op by construction (the `affiliate_notified_at is null` claim guard / the `post_kind = 'walkthrough'` filter).

## Explicitly out of scope

- No retroactive send for posts already sitting at `status = 'approved'` before this ships — only future approvals trigger it.
- No WhatsApp distribution (still "planned," untouched by this change).
- No gating on the reel's approval status — confirmed with user: walkthrough alone is sufficient.
- No admin UI changes — this is a backend-only trigger.

## Testing

- Ember Social: unit test `notifyAffiliateKitIfApproved` — fires exactly once for a `post_kind = 'walkthrough'` post, never for `'reel'`/`'feed'`, retries after a simulated webhook failure (mock the fetch to reject, assert the claim column is rolled back to null).
- Everest Motoring: unit test the shared vehicle-payload builder in isolation (given a car + affiliate code, produces the expected mediaKitUrl/trackingLink/flyerUrl/videoUrl).
- Manual end-to-end (only exercisable once both sides are deployed with real env vars): approve a real walkthrough for a test car in Ember Social's `/approvals` page, confirm the webhook fires, confirm an approved affiliate's inbox receives the kit with correct per-affiliate tracking link.
