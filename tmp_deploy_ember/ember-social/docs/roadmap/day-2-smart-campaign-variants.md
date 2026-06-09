# Day 2 — Smart campaign generator + per-platform variants

## Goal

Replace the unsurfaced `/api/ai/campaign` mock-driven flow with a real "Generate Marketing Plan" button that:

1. Reads the **scanned** brand + history data from Day 1.
2. Generates a 30-day plan with per-platform variants (`facebook`, `instagram`, `tiktok`) — copy and hashtags tuned per platform.
3. Surfaces a top-level **`strategy_rationale`** explaining frequency and timing with reasons drawn from the scan (e.g. "Posting 4×/week because your audience peaks Tue/Thu/Sat 18:00–20:00 based on your last 50 posts").
4. Persists each idea as a `posts` row with `status='pending_approval'` so it flows through the existing approve → cron → publish spine.

## Why this matters

Day 1 produces *data*. Day 2 *uses* it. Without Day 2 the campaign generator is generic ("5 pillars × 3 ideas") and never reaches the approvals queue — exactly the gap the user flagged: *"the schedule needs to be created and frequency must be determined by research with reasons."*

## Prerequisites

- Day 1 merged. `client_intelligence` has `historical_voice`, `posting_cadence_observed`, `best_performing_hours`, `top_performing_themes`.
- Read [`_context.md`](./_context.md).

## Files involved

- **Create**: `supabase/migrations/007_posts_variants.sql` — additive columns.
- **Create**: `src/lib/scheduling.ts` — shared `getNextAvailableDate` (extracted from `src/app/api/trigger/route.ts`).
- **Modify**: `src/app/api/ai/campaign/route.ts` — rewrite the generator to use scanned data + emit variants + rationale.
- **Create**: `src/app/api/workspaces/campaign/generate/route.ts` — orchestrator: call generator → persist `posts` rows.
- **Modify**: `src/app/dashboard/workspaces/[id]/page.tsx` — add "Generate Marketing Plan" CTA on workspace overview.
- **Modify**: `src/app/dashboard/workspaces/[id]/calendar/page.tsx` — replace the `setTimeout` mock at lines 64–76 with a real call.
- **Modify**: `src/app/api/trigger/route.ts` — switch to importing `getNextAvailableDate` from `src/lib/scheduling.ts` (no behaviour change).

## Migration 007

```sql
alter table public.posts
  add column if not exists variants jsonb default '{}'::jsonb,
  add column if not exists pillar text,
  add column if not exists rationale text;
```

`variants` shape: `{ facebook?: { content: string, hashtags: string[] }, instagram?: {...}, tiktok?: {...} }`. The existing `content text` column stays — it's auto-filled from `variants.facebook.content` (or first available variant) for back-compat with the publish spine.

## DeepSeek prompt

> You are working on Ember Social, a Next.js 15 + Supabase social SaaS. Read `ember-social/docs/roadmap/_context.md` first. Do not break the publish spine. No new npm deps.
>
> **Task — Day 2: Smart campaign generator + per-platform variants.**
>
> **Step 1.** Apply migration `supabase/migrations/007_posts_variants.sql` from this spec's "Migration 007" section. Additive only.
>
> **Step 2.** Create `src/lib/scheduling.ts` exporting `getNextAvailableDate(supabase, workspaceId, opts?: { startFrom?: Date, timeOfDay?: { hour: number, minute: number } }): Promise<Date>`. Move the existing logic from `src/app/api/trigger/route.ts` here — Sunday-skip preserved, one-post-per-day pacing preserved. Update the trigger route to import from this new module. No behaviour change.
>
> **Step 3.** Rewrite `src/app/api/ai/campaign/route.ts`. POST body: `{ workspaceId: string, durationDays?: number }` (default `durationDays = 30`).
>
> - Resolve via `resolveWorkspaceId()`.
> - Fetch `client_intelligence` for the workspace, including the Day 1 fields (`historical_voice`, `posting_cadence_observed`, `best_performing_hours`, `top_performing_themes`).
> - Fetch `social_accounts` to know which platforms are connected (target generation only at connected platforms; always include `facebook` even if not connected, for fallback).
> - Compute a recommended `posts_per_week` clamped to `[3, 5]`, biased toward `posting_cadence_observed.facebook` when available. Compute total post count = `round(posts_per_week * durationDays / 7)`.
> - Compute a `default_hour` from `best_performing_hours.facebook[0]` if present, else `9` (09:00 SAST = 07:00Z).
> - Build the OpenAI prompt with `gpt-4o-mini`, `response_format: { type: 'json_object' }`, temperature `0.7`. System prompt outline:
>
>   ```
>   You are a senior social media strategist generating a {durationDays}-day plan.
>
>   CLIENT PROFILE:
>   - Industry: {industry}
>   - Audience: {target_audience}
>   - Stated voice: {brand_voice}
>   - Observed voice (from their real posts): {historical_voice}
>   - Top-performing themes: {top_performing_themes}
>   - Goals: {goals}
>   - Connected platforms: {connectedPlatforms}
>
>   OUTPUT JSON SHAPE:
>   {
>     "strategy_rationale": "2-3 sentence explanation of cadence and timing, citing the observed data",
>     "pillars": ["string", "string", ...],
>     "posts": [
>       {
>         "pillar": "string (one of the pillars)",
>         "rationale": "one sentence on why this post fits this pillar / audience",
>         "day_offset": 0,
>         "variants": {
>           "facebook":  { "content": "string", "hashtags": ["string", ...] },
>           "instagram": { "content": "string", "hashtags": ["string", ...] },
>           "tiktok":    { "content": "string (script hook)", "hashtags": ["string", ...] }
>         }
>       },
>       ...
>     ]
>   }
>
>   RULES:
>   - Generate exactly {postCount} posts.
>   - day_offset is 0-indexed days from tomorrow, spread evenly across the duration, no Sundays (avoid offsets that land on Sunday).
>   - Per-platform variants: FB longer (max 600 chars), IG punchier with emojis (max 220 chars), TikTok = a script hook (max 150 chars).
>   - Hashtags: FB 2-4, IG 8-15, TikTok 3-6.
>   - Only emit variants for platforms in connectedPlatforms; always emit facebook variant.
>   - Voice must match observed voice, not just stated voice.
>   ```
>
> - Return the parsed JSON `{ strategy_rationale, pillars, posts }`. Do NOT persist here — Step 4 does that.
>
> **Step 4.** Create `src/app/api/workspaces/campaign/generate/route.ts` (POST). Body: `{ workspaceId: string, durationDays?: number }`.
>
> - Resolve workspaceId.
> - Server-to-server call to `/api/ai/campaign` (or, cleaner: extract the campaign-generation function into `src/lib/ai/campaignGenerator.ts` and call it directly — pick whichever is cleaner and explain why in the response).
> - Generate one shared `approval_token = crypto.randomUUID()` for the whole batch (the `/approve/[token]` page already supports multi-post review).
> - For each post idea, compute `scheduled_at` by calling `getNextAvailableDate(...)` from `src/lib/scheduling.ts`, using `default_hour` for the time-of-day. Iterate across the duration — one post per scheduled day, Sundays skipped.
> - Insert each row into `posts` using `createServerSupabaseClient()`:
>   - `workspace_id` = resolved UUID
>   - `content` = `variants.facebook.content` (fallback: first available variant's content)
>   - `variants` = the full variants jsonb
>   - `pillar`, `rationale`
>   - `platforms` = the keys of `variants` (e.g. `['facebook','instagram']`)
>   - `media_urls` = `null`
>   - `scheduled_at`
>   - `status = 'pending_approval'`
>   - `approval_token` = the shared batch token
> - Return `{ ok: true, count, approval_token, strategy_rationale, pillars }`.
>
> **Step 5.** Modify `src/app/dashboard/workspaces/[id]/page.tsx`. Add a prominent "Generate Marketing Plan" CTA above the three info cards (orange gradient, `Sparkles` icon). On click:
>
> - Confirm dialog: `Generate a 30-day marketing plan? This creates ~{N} draft posts for review.` Compute N from the cadence in `client_intelligence` (fallback ~17 if unset).
> - POST to `/api/workspaces/campaign/generate` with `workspaceId` = the URL param.
> - On success: toast `Marketing plan generated — {count} posts ready to review` + link to `/dashboard/workspaces/{slug}/approvals`.
> - Show `strategy_rationale` in a dismissible info panel under the button after generation.
> - Disable + spinner while in flight.
>
> **Step 6.** Modify `src/app/dashboard/workspaces/[id]/calendar/page.tsx`. Replace the `handleGenerateMonth` mock (lines 64–76) with a real call to `/api/workspaces/campaign/generate`. After success, re-fetch posts.
>
> **Constraints**:
>
> - Do not change the publish spine. `publish.ts` still reads `posts.content` — `variants` is additive.
> - Use `createServerSupabaseClient()` for the orchestrator; existing supabase client pattern for the AI route.
> - Match existing UI styling: `glass-card`, lucide icons, orange `#f97316` gradient.
> - Sparse comments. No JSDoc.
> - No new npm deps.

## Acceptance criteria

- [ ] Migration 007 file exists, additive only.
- [ ] `src/lib/scheduling.ts` exists; `src/app/api/trigger/route.ts` imports from it; no behaviour change to existing Everest trigger flow.
- [ ] `/api/ai/campaign` returns `{ strategy_rationale, pillars, posts: [{ pillar, rationale, day_offset, variants }] }`.
- [ ] `/api/workspaces/campaign/generate` inserts `pending_approval` posts with `variants`, `pillar`, `rationale`, and a shared `approval_token`.
- [ ] "Generate Marketing Plan" button on workspace overview triggers the flow end-to-end.
- [ ] Calendar's "Auto-Fill Month (AI)" button calls the real endpoint; no `setTimeout` mock remains.
- [ ] On Everest with FB connected and Day 1 scan done: generation produces N posts (3–5/week × 30 days), `strategy_rationale` references observed cadence/hours, each post has at minimum a `variants.facebook` entry.
- [ ] Approving one of those posts and waiting for the cron tick publishes it via the existing flow without touching `publish.ts`.
- [ ] No Sundays in generated `scheduled_at` dates.
- [ ] `npm run build` and `npm run lint` clean. No new npm deps.

## Out of scope (defer)

- Editing per-post `variants` in the composer — that's part of Day 4.
- Auto-generating media per variant — that's roadmap D1.
- Surfacing variants in the approval card preview — Day 3 adds the per-platform preview.
- Reusing engagement from `post_results` to weight pillars — that's roadmap C2.
