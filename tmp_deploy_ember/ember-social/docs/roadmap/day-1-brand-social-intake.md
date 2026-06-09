# Day 1 — Unified brand & social history intake

## Goal

One-click "Scan brand + social" button on a workspace's Intelligence page that runs three scans in parallel and persists everything to `brand_kits` + `client_intelligence`:

1. **Website visual scan** → colours, fonts, logo (re-uses existing `/api/ai/analyze-brand`).
2. **Website content scan** → industry, voice, audience, goals (re-uses existing `/api/ai/analyze-website`).
3. **Social history scan** → historical voice, top-performing themes, observed posting cadence, best-performing hours (NEW endpoint).

## Why this matters

Everest Motoring is the priority client. Before we can generate a research-backed 30-day plan (Day 2), the AI needs ground truth about what already works on the client's accounts — not just what they say about themselves. The site scan tells us the brand's *aspiration*; the social scan tells us the *reality*. Both feed the generator.

## Prerequisites

- Read [`_context.md`](./_context.md) — supabase clients, slug-vs-UUID trap, hard rules.
- Migration 005 applied (A1).
- Facebook is connected for the target workspace. Instagram is optional — the social scan must degrade gracefully when IG isn't connected.

## Files involved

- **Create**: `supabase/migrations/006_client_intelligence_history.sql` — additive columns.
- **Create**: `src/app/api/ai/analyze-social-history/route.ts` — new FB/IG history scanner.
- **Create**: `src/app/api/workspaces/intake/run/route.ts` — orchestrator that fans out the three scans.
- **Modify**: `src/app/dashboard/workspaces/[id]/intelligence/page.tsx` — replace the standalone "Analyze Website" CTA with a unified "Scan brand + social" button + progress UI.

## Migration 006

```sql
alter table public.client_intelligence
  add column if not exists historical_voice text,
  add column if not exists top_performing_themes text[],
  add column if not exists posting_cadence_observed jsonb default '{}'::jsonb,
  add column if not exists best_performing_hours jsonb default '{}'::jsonb,
  add column if not exists last_scanned_at timestamptz;
```

## DeepSeek prompt

> You are working on Ember Social, a Next.js 15 + Supabase social SaaS. Read `ember-social/docs/roadmap/_context.md` first — it explains the supabase clients, the publish flow, the slug-vs-UUID trap, and the hard rules. Do not break the publish spine (Everest trigger → approve → cron → FB publish). No new npm deps.
>
> **Task — Day 1: Unified brand + social history intake.**
>
> **Step 1.** Apply migration `supabase/migrations/006_client_intelligence_history.sql` with the SQL in this spec's "Migration 006" section. Additive only.
>
> **Step 2.** Create `src/app/api/ai/analyze-social-history/route.ts` (POST). Body: `{ workspaceId: string }`.
>
> - Resolve via `resolveWorkspaceId()` from `src/lib/resolve-workspace.ts`.
> - Query `social_accounts` where `workspace_id = resolved` and `platform in ('facebook','instagram')`.
> - For each FB account: fetch `https://graph.facebook.com/v19.0/{account_id}/posts?fields=message,created_time,reactions.summary(total_count),comments.summary(total_count),shares&limit=50&access_token=...`. Tolerate per-account errors — log + continue, don't abort the whole scan.
> - For each IG account (if any): fetch `https://graph.facebook.com/v19.0/{account_id}/media?fields=caption,timestamp,like_count,comments_count&limit=50&access_token=...`.
> - Compute per-platform:
>   - `posts_per_week` = posts / weeks_span (rounded to 1 dp).
>   - `best_hours` = top 3 hours of day by mean engagement (likes + comments + shares).
>   - `top_themes` = pass the 30 highest-engagement captions to `gpt-4o-mini` with a system prompt: `Return JSON {historical_voice: string, top_themes: string[5]} extracting the actual tone and recurring topics from these captions.` Use `response_format: { type: 'json_object' }`.
> - Upsert into `client_intelligence` using `createAdminClient()`:
>   - `historical_voice`
>   - `top_performing_themes`
>   - `posting_cadence_observed` = e.g. `{ facebook: 4.2, instagram: null }`
>   - `best_performing_hours` = e.g. `{ facebook: [9, 18, 20] }`
>   - `last_scanned_at = now()`
> - Return `{ ok: true, summary: {...} }`. On total failure return **200** with `{ ok: false, reason: '...' }` — never 500 (the orchestrator must not abort sibling scans).
>
> **Step 3.** Create `src/app/api/workspaces/intake/run/route.ts` (POST). Body: `{ workspaceId: string, websiteUrl: string }`.
>
> - Resolve workspaceId.
> - `Promise.allSettled` three internal calls:
>   1. `POST /api/ai/analyze-brand` `{ url: websiteUrl }` → on success, upsert into `brand_kits` (primary/secondary/accent colour, font_preference, logo_url).
>   2. `POST /api/ai/analyze-website` `{ url: websiteUrl }` → on success, upsert into `client_intelligence` (industry, target_audience, brand_voice, goals, key_messages).
>   3. `POST /api/ai/analyze-social-history` `{ workspaceId }` (writes itself).
> - Return `{ brand: 'ok'|'failed', website: 'ok'|'failed', social: 'ok'|'failed'|'skipped', results: {...} }`. Always 200.
>
> **Step 4.** Modify `src/app/dashboard/workspaces/[id]/intelligence/page.tsx`:
>
> - Add a prominent "Scan brand + social" button above the form (orange gradient, `Wand2` icon).
> - Single input: website URL (pre-fill from existing intel if set).
> - On click → POST `/api/workspaces/intake/run`.
> - Show a 3-row progress card with each scan's status (loading → ok/failed/skipped) as the response resolves. Simplest acceptable v1: await the full response and show the final status badges.
> - After completion, re-fetch intel + brand kit and show a green banner: `Scan complete — {brand|website|social} ready.`
> - Keep the existing "Analyze Website" button for back-compat but mark it as the manual fallback.
>
> **Constraints**:
>
> - Use `createServerSupabaseClient()` for user-context routes; `createAdminClient()` for the social-history writer (server-only, no user session needed).
> - Sparse comments. No JSDoc. Explain *why* only when non-obvious.
> - Match existing UI styling: `glass-card`, lucide icons, orange `#f97316` gradient buttons.
> - Do not touch `publish.ts`, `trigger`, or `rewrite-content.ts`.
> - No new npm dependencies.

## Acceptance criteria

- [ ] Migration 006 file exists and is additive (`add column if not exists`). No drops, no renames.
- [ ] `src/app/api/ai/analyze-social-history/route.ts` exists, POST, returns 200 even on failure.
- [ ] `src/app/api/workspaces/intake/run/route.ts` exists, orchestrates three scans with `Promise.allSettled`, always 200.
- [ ] Intelligence page has a "Scan brand + social" button above the form with a 3-row status card.
- [ ] On Everest with `https://everestmotoring.co.za`: `historical_voice` is non-null, `posting_cadence_observed.facebook > 0`, `best_performing_hours.facebook[0]` is an integer 0–23, and `brand_kits.primary_color` is a valid hex matching their site.
- [ ] If IG isn't connected: `social` scan still returns `ok` for FB; `posting_cadence_observed.instagram` stays `null`.
- [ ] Existing publish spine still works (manual sanity check: existing Everest scheduled posts still publish via cron).
- [ ] `npm run build` clean. `npm run lint` clean.
- [ ] No new npm dependencies in `package.json`.

## Out of scope (defer)

- Using the scan results to drive the campaign generator — that's **Day 2**.
- Visualising the scanned data on a dashboard chart — Day 1 just stores it; Day 2's "strategy_rationale" surfaces it to the user.
- Per-post analytics from `post_results` — that's roadmap A3.
- Re-running the scan on a schedule — manual button only for now; consider monthly cron in a later phase.
