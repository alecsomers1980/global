# A3 — Persist real engagement data into `post_results`

## Goal

After every successful publish, fetch engagement metrics from the platform and write a row into `post_results`. Replace the analytics dashboard's mock data with reads from this table.

## Why this is foundational

Every "smart" feature downstream — the engagement-feedback loop (C2), predictive scoring (D2), the marketing-plan generator improving itself — requires real performance data. Without `post_results` populated, every recommendation is guessing.

## Prerequisites

- A1 done.
- Read `_context.md`. Know the `post_results` table shape from `supabase/schema.sql`.

## Files involved

- **Read**: `supabase/schema.sql` — confirm `post_results` columns: `post_id, platform, platform_post_id, impressions, reach, likes, comments, shares, saved, fetched_at`.
- **Modify**: `src/lib/publish.ts` — after each successful platform publish, write an initial `post_results` row with `platform_post_id` and zero metrics.
- **Create**: `src/lib/analytics-fetch.ts` — per-platform fetchers (FB Graph insights, IG insights) that pull metrics for a given platform-post-id.
- **Create**: `src/app/api/cron/refresh-analytics/route.ts` — Vercel cron, runs hourly for the first 48h after publish then daily, updates `post_results` with latest numbers.
- **Modify**: `vercel.json` — register the new cron. **Note**: Vercel Hobby plan caps at 2 crons. If we're at the cap, fold this into `publish-scheduled` as a second pass (publish first, then refresh analytics for posts published in the last 7 days). Pick whichever fits the user's plan; default to the dispatcher fold-in.
- **Modify**: `src/app/dashboard/page.tsx` — replace mock stats with real reads from `post_results`.
- **Modify**: `src/app/dashboard/workspaces/[id]/analytics/page.tsx` — replace mock data with real reads, scoped to the workspace.

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first.
>
> **Task A3**: Replace the mock analytics with real engagement data persisted in `post_results`.
>
> **Step 1 — Initial row on publish.** In `src/lib/publish.ts`, the `publishPost()` function loops over `social_accounts` and calls `publishToFacebook()` / `publishToInstagram()`. After each successful publish (the platform returns `{ id }`), insert a `post_results` row immediately:
>
> ```ts
> await supabase.from('post_results').insert({
>   post_id: postId,
>   platform: account.platform,
>   platform_post_id: publishedRef.id,
>   // metrics fields left as nulls; refresh job will populate them
> })
> ```
>
> Wrap the insert in its own try/catch so an analytics-write failure doesn't mark the post as failed.
>
> **Step 2 — Per-platform metric fetchers.** Create `src/lib/analytics-fetch.ts` exporting:
>
> - `fetchFacebookMetrics(platformPostId, accessToken): Promise<Metrics>` — uses `https://graph.facebook.com/v19.0/{platformPostId}/insights?metric=post_impressions,post_impressions_unique,post_reactions_by_type_total,...&access_token=...` plus a separate call for likes/comments/shares (those come from the post object itself, not insights). Map results to the `post_results` columns.
> - `fetchInstagramMetrics(platformPostId, accessToken): Promise<Metrics>` — uses `https://graph.facebook.com/v19.0/{platformPostId}/insights?metric=impressions,reach,likes,comments,saved,shares` (note: reels have a slightly different metric set; handle both).
> - Both functions must be resilient: if a metric is missing or returns an error, return `null` for that field rather than throwing. Only throw on auth errors so the caller can flag the token.
>
> Export a `Metrics` type that maps 1:1 to `post_results` columns.
>
> **Step 3 — Refresh strategy.**
>
> Default approach (assumes Vercel Hobby's 2-cron cap): extend the existing `src/app/api/cron/publish-scheduled/route.ts`. After the publish loop, run a refresh pass:
>
> - Fetch up to 50 `post_results` rows where the related post was published within the last 7 days, ordered by `fetched_at` ascending (oldest first).
> - For each, look up the workspace's `social_accounts` row to get the access token, call the right metric fetcher, update the `post_results` row with the new metrics + `fetched_at = now()`.
> - Wrap each in its own try/catch — one bad fetch must not block the rest.
>
> If the user has Pro plan and is happy to add a third cron, create `src/app/api/cron/refresh-analytics/route.ts` instead and add it to `vercel.json` running every 30 min. **Ask in your response which plan the user is on if you're not sure** — don't blindly add a cron.
>
> **Step 4 — Replace mock dashboards.**
>
> - In `src/app/dashboard/page.tsx`, the existing component pulls from a mock data source for the stat cards. Replace with real Supabase reads:
>   - `Total Reach (30d)` = SUM(`post_results.reach`) where post.workspace_id in user's workspaces and post.created_at > 30d ago.
>   - `Engagement (30d)` = SUM(likes + comments + shares + saved) over the same scope.
>   - `Posts Published (30d)` = COUNT distinct posts with status='published' over the same scope.
>   - `Scheduled Posts` = COUNT posts with status in ('approved', 'scheduled') and scheduled_at >= now().
> - In `src/app/dashboard/workspaces/[id]/analytics/page.tsx`, do the same scoped to one workspace, plus a "Top Performing Posts" list ordered by total engagement desc, limit 10. Resolve workspace via `/api/workspaces/...` style endpoint (don't fall into the slug bug).
>
> If you need a new endpoint to feed the workspace analytics page, create `src/app/api/workspaces/analytics/route.ts` accepting `?workspaceId=...&range=30d` and returning the aggregated numbers + top-10 posts.
>
> **Constraints**:
>
> - All FB/IG fetches must respect rate limits — don't refresh metrics for posts older than 7 days (engagement is mostly settled by then).
> - Don't add a new `npm` package; use `fetch`.
> - Don't change `post_results` schema. The existing columns are sufficient.
> - Don't break the publish flow if metric-fetching fails — the publish must succeed regardless.
> - All comparisons that join through `posts` must filter by workspace via the user's session, not trust client-supplied workspace ids.

## Acceptance criteria

- [ ] After a successful publish, a `post_results` row exists with `post_id` and `platform_post_id` filled.
- [ ] After the next analytics refresh tick, that row's `impressions/reach/likes/comments/shares/saved` and `fetched_at` are populated.
- [ ] Dashboard cards on `/dashboard` show real numbers, not mocks. Loading state while fetching.
- [ ] Workspace analytics page shows real numbers + top posts.
- [ ] Publish flow still works end-to-end if FB/IG insights APIs are temporarily down.
- [ ] No new npm deps, no schema changes, no mock data left in those pages.
- [ ] Lint + typecheck clean.

## Out of scope

- Audience demographics, follower growth charts (separate table needed; later step).
- Predictive engagement scoring — D2.
- Per-post comment/reply pull — that lives in A4 (Inbox webhooks).
