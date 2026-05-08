# C2 — Engagement feedback loop

## Goal

Use the `post_results` data (from A3) to improve future generation: top-performing posts inform the rewriter and campaign generator, low-performing patterns are quietly avoided. Make the platform learn from what actually works for each client.

## Why

Right now the rewriter and campaign generator operate from `client_intelligence` only — what the user *says* their voice is. After A3, we know what their audience *actually responds to*. Closing this loop is what separates a "AI content tool" from a real assistant.

## Prerequisites

- A3 done (real `post_results` populated).
- B1 helpful (gives us a strong baseline voice profile).
- Read `_context.md`.

## Files involved

- **Create**: `src/lib/ai/performance-context.ts` — builds a "what works for this client" context block from `post_results`.
- **Modify**: `src/lib/ai/rewrite-content.ts` — accept and use the performance context.
- **Modify**: `src/app/api/ai/campaign/route.ts` — same.
- **Create**: `src/app/api/cron/insights-rollup/route.ts` (or fold into existing publish-scheduled cron) — periodically compute per-workspace insights and cache them in a new `workspace_insights` table to avoid re-querying for every generation.
- **Create migration**: `supabase/migrations/010_workspace_insights.sql`.
- **Modify**: `src/app/dashboard/workspaces/[id]/analytics/page.tsx` — surface the insights panel ("AI Growth Insights" — the page already has this card, just wire it to real data).

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first.
>
> **Task C2**: Close the loop — feed real engagement data into the AI generation pipelines.
>
> **Step 1 — Migration 010.** Add an insights cache:
>
> ```sql
> create table if not exists public.workspace_insights (
>   workspace_id uuid primary key references public.workspaces(id) on delete cascade,
>   computed_at timestamptz not null default now(),
>   total_posts_30d int not null default 0,
>   top_post_ids uuid[] not null default array[]::uuid[],
>   top_patterns jsonb,         -- {hooks: [...], topics: [...], formats: [...], posting_times: [...]}
>   weak_patterns jsonb,        -- patterns to avoid
>   summary text                -- short LLM-generated summary, displayed in the analytics card
> );
>
> alter table public.workspace_insights enable row level security;
> create policy "Agency admins read insights"
>   on public.workspace_insights for all
>   using (auth.role() = 'authenticated');
> ```
>
> **Step 2 — Rollup logic.** Create `src/lib/ai/performance-context.ts` exporting:
>
> - `computeWorkspaceInsights(workspaceId): Promise<Insights>` — runs the rollup, writes to `workspace_insights`, returns the row.
>   - Pull all `posts` for this workspace with `status='published'` and `created_at > now() - interval '90 days'`.
>   - Join `post_results` for engagement.
>   - Compute total engagement per post = `likes + comments + shares + saved`. Normalise by reach if available (rate per 1000 reach) — if reach is null, fall back to absolute.
>   - Top 10 posts by normalised engagement → `top_post_ids`.
>   - Bottom 10 → for `weak_patterns`.
>   - Run a single `gpt-4o-mini` call: "Here are the top and bottom posts for this brand. Identify the patterns that distinguish them — hooks, topics, post types (reel vs feed), posting times, length, emoji density, hashtag style. Output strict JSON: {top_patterns:{hooks, topics, formats, posting_times, length_words}, weak_patterns:{...}, summary:'1-paragraph English description'}". Pass the post bodies + their engagement numbers.
>   - Store the result.
> - `getWorkspaceInsights(workspaceId, maxAgeMinutes = 60 * 12): Promise<Insights | null>` — returns cached insights if computed within `maxAgeMinutes`, else null. Caller should call `compute` if null.
>
> **Step 3 — Cron / refresh.** Either:
>
> - **(Preferred)** Fold into `src/app/api/cron/publish-scheduled/route.ts` — after the publish + analytics-refresh passes, pick one workspace whose `workspace_insights.computed_at` is oldest (or null) and recompute. This spreads compute over ticks instead of a single big batch.
> - **Or** add a new cron `/api/cron/insights-rollup` running daily, recomputing every workspace. Costs more, simpler.
>
> Pick (1). Document the choice.
>
> **Step 4 — Wire into rewriter.** In `src/lib/ai/rewrite-content.ts`:
>
> - Add an optional `performanceContext` field to the function signature, OR fetch it inline given the `workspaceId` (the function already takes `workspaceId`, so inline is cleaner).
> - Inject the cached insights into the system prompt as a "WHAT'S WORKED FOR THIS CLIENT BEFORE" section:
>
>   ```
>   PERFORMANCE SIGNAL (from this client's last 90 days of posts, ranked by engagement):
>   - Top hooks: ...
>   - Best-performing topics: ...
>   - Strongest format: <reel|feed|video>
>   - Strongest posting time: <e.g. Wednesday 13:00>
>   - Avg length of top performers: ~N words
>
>   PATTERNS TO DE-EMPHASISE (low-engagement posts shared these traits):
>   - ...
>
>   Use these as guidance, not rules. Do not parrot the top hooks verbatim. Do not avoid weak topics if the source content centres on them.
>   ```
>
> - If insights aren't available for this workspace yet (e.g. <10 published posts), skip the section silently.
>
> **Step 5 — Wire into campaign generator.** In `src/app/api/ai/campaign/route.ts`:
>
> - Same injection pattern. The campaign generator should bias toward the format/topic mix that's working, while still hitting the brand's content pillars.
> - Bonus: include posting-time guidance — if the insights show Wed 13:00 outperforms Mon 09:00, schedule heavier on Wed when laying out the 30-day plan. (The pacing helper from A2 / `src/lib/scheduling.ts` should accept an optional `preferredTimes` array.)
>
> **Step 6 — Surface in UI.** The analytics page already has a card titled "AI Growth Insights" with mock content. Replace it:
>
> - Read `workspace_insights.summary` for the headline paragraph.
> - Show top 3 working patterns + 3 to avoid as bullet lists.
> - "Last updated {N hours ago}" below.
> - "Recompute now" button → calls `/api/workspaces/insights/recompute` (create this route — POST, gated to authenticated agency users).
>
> **Constraints**:
>
> - Don't recompute on every page load — that's expensive. Use the 12h cache.
> - Insights are advisory, not deterministic — never let the LLM hardcode "always post on Wednesday at 13:00." Frame as bias, not rule.
> - If `post_results` is sparse (<10 posts), skip the LLM call entirely and write `summary='Not enough data yet — publish at least 10 posts to unlock insights'`.
> - Don't change the rewriter's *output* shape — the existing rules in `rewrite-content.ts` (length, factuality, no `...` artefact) still apply. The performance section is additive context.

## Acceptance criteria

- [ ] Migration 010 added.
- [ ] Insights computed and cached for workspaces with ≥10 published posts.
- [ ] Rewriter and campaign generator both use the insights when available.
- [ ] Analytics page shows real insights, no mock.
- [ ] "Recompute now" works.
- [ ] No regressions in trigger / publish flow.
- [ ] Lint + typecheck clean.

## Out of scope

- Per-platform insights (FB vs IG separately) — defer; v1 aggregates.
- Time-series charts of engagement — visual polish, defer.
- Predictive scoring of *new* posts before publish — that's D2.
- Cohort analysis (which audience responded to which post) — needs follower demographics; defer.
