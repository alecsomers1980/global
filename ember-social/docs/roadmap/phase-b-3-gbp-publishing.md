# B3 — Wire GBP local-post publishing into `lib/publish.ts`

## Goal

Connect the existing `src/lib/gbp.ts` (`createLocalPost()`, token refresh, etc.) into the `publishPost()` dispatcher in `src/lib/publish.ts`, so that selecting `google_business` (or whatever the current GBP platform string is) on a post actually publishes a Local Post to the connected GBP listing.

## Why

The OAuth + token refresh + `createLocalPost` are already implemented. The only missing piece is the dispatcher branch in `publish.ts`. This is small — likely a half-day of work.

## Prerequisites

- Google Business Profile API access **approved** for the user's Google Cloud project. Until approval, the `gbp.ts` helper returns `GbpApiNotApproved`. **Confirm with the user before starting** — there's no point wiring the dispatcher until the API is unblocked.
- A1 done.
- Read `src/lib/gbp.ts` and the GBP OAuth init/callback routes.

## Files involved

- **Read**: `src/lib/gbp.ts` — confirm exact function signatures and exported helpers.
- **Read**: `src/app/api/auth/gbp/{init,callback}/route.ts` — confirm `social_accounts` row shape for GBP (platform string, `account_id` semantics — is it `accounts/{id}/locations/{id}` or just the location id?).
- **Modify**: `src/lib/publish.ts` — add `publishToGbp(account, content, mediaUrls)` and the dispatcher branch.
- **Modify**: `src/components/PostPreviewCard.tsx` (and any compose/approvals UI) — make sure `google_business` shows the right label/colour.
- **Modify** (optional): `src/lib/analytics-fetch.ts` — GBP doesn't expose detailed engagement, but it has views and clicks via the Performance API; add a fetcher if useful.

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first. Then read `src/lib/gbp.ts` end to end before writing code.
>
> **Task B3**: Wire GBP local-post publishing into the publish flow.
>
> **Step 1 — Audit `gbp.ts`.** Confirm:
>
> - The exact platform string used in `social_accounts.platform` for GBP rows. Use whatever the OAuth callback writes — don't invent a new one.
> - The exact signature of `createLocalPost`. Does it accept `(accountRow, content, mediaUrls)` or something different? Adapt the dispatcher accordingly.
> - How token refresh is handled. If `gbp.ts` already wraps API calls in a refresh helper, the dispatcher just calls the helper. If not, add the refresh logic in `publishToGbp`, mirroring the FB pattern.
> - Whether `createLocalPost` returns the platform-side post id (it should — that goes into `post_results.platform_post_id`).
>
> Surface these answers as a short note before writing the dispatcher, so they're easy to verify in review.
>
> **Step 2 — Add `publishToGbp` to `src/lib/publish.ts`**:
>
> ```ts
> async function publishToGbp(
>   account: any,
>   content: string,
>   mediaUrls: string[] | null
> ): Promise<{ id: string }> {
>   // Defer to the existing helper. If the API isn't approved yet,
>   // the helper throws GbpApiNotApproved; surface that as a clear error
>   // so it shows up in posts.last_error.
>   const result = await createLocalPost({
>     account,
>     content,
>     mediaUrls,
>   })
>   return { id: result.id }
> }
> ```
>
> Adjust the param shape to whatever `createLocalPost` actually accepts.
>
> **Step 3 — Add the dispatcher branch.** In `publishPost()`:
>
> ```ts
> } else if (account.platform === '<GBP_PLATFORM_STRING>') {
>     publishedRef = await publishToGbp(account, postAny.content, postAny.media_urls)
> }
> ```
>
> Place this near the FB/IG branches, before the `else throw new Error('Publishing to ${platform} not yet supported')` fallback.
>
> **Step 4 — Approval-aware error.** GBP has CTA types (`BOOK`, `ORDER`, `LEARN_MORE`, `SIGN_UP`, etc) and date-bounded `EVENT` posts. The simple v1 just publishes a plain Update post — no CTA, no event. If `gbp.ts` already supports CTAs, expose them via an optional param object on `publishToGbp` but don't require callers to fill it.
>
> If `createLocalPost` throws `GbpApiNotApproved`, the error should propagate normally — `publishPost` already catches and writes `last_error`. Confirm the error message includes "GBP API access not approved by Google" so the user gets a useful breadcrumb in the dashboard.
>
> **Step 5 — Optional: minimal analytics.** GBP exposes Insights via the [Performance API](https://developers.google.com/my-business/reference/performance/rest). If A3 is done, add `fetchGbpMetrics(localPostName, accessToken)` to `src/lib/analytics-fetch.ts`. Map `views_searches`, `views_maps`, `actions_website`, `actions_phone` onto something sensible in `post_results` (`impressions = views_searches + views_maps`, `comments = 0` since GBP has no comments, etc.). If it gets messy, skip and ask.
>
> **Step 6 — Feature flag.** Add `GBP_PUBLISHING_ENABLED` env var. If false (default), the dispatcher branch falls back to the original "not yet supported" error message. This protects production until Google approves the API. The user flips the flag once approval lands.
>
> **Constraints**:
>
> - Don't change the `gbp.ts` API surface — just consume it.
> - GBP posts have a 1500-char limit. If `content` is longer, truncate at the last whole word + `…` before sending. Surface a warning back through `last_error` if you truncate? — actually no, just truncate silently; the AI rewriter should already produce GBP-appropriate length once we add a `gbp` post type to the rewriter (separate task, mention in your response).
> - Media: GBP supports one image; if `mediaUrls` has multiple, use the first non-video URL.

## Acceptance criteria

- [ ] `publishToGbp` exists in `src/lib/publish.ts` and is wired into the dispatcher behind the `GBP_PUBLISHING_ENABLED` flag.
- [ ] With the flag off, GBP posts fail cleanly with the existing "not supported" message.
- [ ] With the flag on and API approved, a test post lands as a GBP Update on the connected location.
- [ ] `last_error` for failed GBP posts is human-readable.
- [ ] No regressions in FB/IG publishing.
- [ ] Lint + typecheck clean.

## Out of scope

- GBP CTA buttons / event posts / offer posts — defer.
- A separate GBP post type in the rewriter (currently FB/IG-aware only) — useful, but a separate small task.
- Multi-location GBP accounts — assume one location per `social_accounts` row for now.
