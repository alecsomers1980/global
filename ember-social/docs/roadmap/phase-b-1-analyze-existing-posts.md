# B1 — Analyze a client's existing FB/IG posts to infer brand voice

## Goal

Extend `/api/ai/analyze-brand` so it can ingest a connected workspace's recent FB and IG posts (not just a website URL), derive a brand voice profile from them, and write the result into `client_intelligence` automatically. Replaces the manual intelligence form for new clients.

## Why

Right now `client_intelligence` is hand-typed. The user wants the platform to "look at existing posts of a client, look at their look and feel and tone." With FB/IG already connected via OAuth, we can pull their last 30-50 posts and let the LLM derive the voice spec.

## Prerequisites

- A4 done (we'll reuse the platform fetching patterns and the workspace's `social_accounts` access tokens).
- Read `_context.md`. Especially `social_accounts` and `client_intelligence` schemas.

## Files involved

- **Read**: `src/app/api/ai/analyze-brand/route.ts` — current website-based analysis. Don't break the website path.
- **Read**: `supabase/schema.sql` — `client_intelligence` columns: `brand_voice`, `target_audience`, `do_not_post`, `key_messages`, plus any others present.
- **Create**: `src/lib/social-fetch.ts` — `fetchRecentFacebookPosts(pageId, accessToken, limit)`, `fetchRecentInstagramPosts(igUserId, accessToken, limit)`. Each returns `{ id, content, permalink, created_at, media_type }[]`.
- **Modify**: `src/app/api/ai/analyze-brand/route.ts` — accept a new mode `source: 'website' | 'social_posts' | 'both'`.
- **Modify**: `src/app/dashboard/workspaces/[id]/intelligence/page.tsx` — add a "Analyze connected accounts" button that calls the new mode.

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first.
>
> **Task B1**: Extend the existing brand-analysis AI to derive voice from a workspace's connected FB/IG posts.
>
> **Step 1 — Social fetchers.** Create `src/lib/social-fetch.ts` exporting:
>
> - `fetchRecentFacebookPosts(pageId: string, accessToken: string, limit = 30): Promise<SocialPost[]>` — uses `https://graph.facebook.com/v19.0/{pageId}/posts?fields=id,message,permalink_url,created_time,attachments&limit={limit}&access_token=...`. Skip posts where `message` is empty.
> - `fetchRecentInstagramPosts(igUserId: string, accessToken: string, limit = 30): Promise<SocialPost[]>` — uses `https://graph.facebook.com/v19.0/{igUserId}/media?fields=id,caption,permalink,timestamp,media_type&limit={limit}&access_token=...`. Skip posts with no caption.
> - `SocialPost = { id, content, permalink, created_at, media_type }`.
> - Both must paginate via `paging.next` until `limit` posts are gathered. Hard-stop after 5 pages to avoid runaway.
> - Resilient to 4xx errors per post field — return what we have, log the rest.
>
> **Step 2 — Inspect the existing analyze-brand route.** Read `src/app/api/ai/analyze-brand/route.ts`. Note the current request shape, response shape, and the LLM prompt structure. **Do not regress** the website path.
>
> **Step 3 — Add a `source` mode.** Modify the route to accept:
>
> ```ts
> { workspaceId: string, source?: 'website' | 'social_posts' | 'both', websiteUrl?: string }
> ```
>
> Default `source = 'website'` to preserve current callers. New behaviour:
>
> - `source === 'social_posts'` (or `'both'`): Resolve workspaceId, look up `social_accounts` rows where platform in (`facebook`, `instagram`), call the appropriate fetcher for each, collect up to ~30 posts per platform.
> - Pass the collected posts to the LLM. Suggested system prompt (refine if needed):
>
>   ```
>   You are a brand strategist. Below are recent posts from a brand's social media. Derive a concise brand voice profile suitable for guiding future content. Output strict JSON with these fields:
>
>   {
>     "brand_voice": "2-3 sentence description of tone, energy, formality",
>     "target_audience": "1-2 sentence description of likely audience",
>     "key_messages": ["bullet 1", "bullet 2", ...],     // max 5
>     "do_not_post": ["thing to avoid 1", ...],          // max 5, conservative — only flag patterns clearly absent
>     "common_topics": ["topic 1", "topic 2", ...],      // max 8
>     "format_patterns": ["e.g. always opens with a 🚗 emoji", ...],  // max 5
>     "evidence": [{"observation": "...", "post_id": "..."}]  // 5-10 examples
>   }
>   ```
>
> - `source === 'both'`: Run both website analysis (existing flow) and social-post analysis, then ask the LLM to merge them into a single profile, biasing toward what the social posts show (because that's what their audience actually sees).
> - Use `gpt-4o-mini` for cost; the existing route uses it.
>
> **Step 4 — Write back into `client_intelligence`.** After the LLM returns:
>
> - Map JSON fields onto existing `client_intelligence` columns: `brand_voice`, `target_audience`, `key_messages`, `do_not_post`. Other fields (`common_topics`, `format_patterns`, `evidence`) — store in a new JSONB column `analysis_metadata` if it doesn't already exist (add via migration 007). The `evidence` array is critical for letting the user audit the AI's choices.
> - **Do not silently overwrite a non-empty `client_intelligence` row.** Return the analysis to the client UI as a "preview" first; the user clicks "Apply" to write it. The route should accept `apply: boolean` to differentiate. (Add an `apply` flag to the request schema.)
>
> **Step 5 — Migration 007.** Create `supabase/migrations/007_intelligence_metadata.sql`:
>
> ```sql
> alter table public.client_intelligence
>   add column if not exists analysis_metadata jsonb;
> ```
>
> Update `supabase/schema.sql` accordingly.
>
> **Step 6 — UI wire-up.** In `src/app/dashboard/workspaces/[id]/intelligence/page.tsx`:
>
> - Add a button "Analyze connected social accounts" near the brand voice field. Disabled if no FB/IG account is connected for this workspace.
> - On click: POST to `/api/ai/analyze-brand` with `source: 'social_posts', apply: false`. Show a preview panel with the LLM's proposed `brand_voice`, `target_audience`, `key_messages`, `do_not_post`, plus a small "Evidence" section listing the example posts with permalinks.
> - "Apply" button on the preview panel posts again with `apply: true`. Refresh the form on success.
> - "Re-analyze" runs again. Show a loader while in flight.
>
> **Constraints**:
>
> - Don't break the website path. Existing callers with no `source` field must keep working.
> - Don't auto-apply. The preview-then-apply pattern is non-negotiable — the LLM gets things wrong and the user must audit.
> - Hard cap at 60 posts total fed to the LLM (≈30 per platform). Costs add up.
> - If a workspace has no FB/IG account connected, the route should return a 400 with a clear message.
> - Don't write `evidence` into `client_intelligence.brand_voice` text — that goes in `analysis_metadata.evidence`.

## Acceptance criteria

- [ ] Migration 007 added.
- [ ] Existing `/api/ai/analyze-brand` website flow still works for callers without `source`.
- [ ] New social-posts flow works against a real connected workspace and returns a sensible JSON profile.
- [ ] Intelligence page shows the new "Analyze connected accounts" button, with a preview-and-apply flow.
- [ ] No new npm deps.
- [ ] Lint + typecheck clean.

## Out of scope

- Fetching posts from TikTok / YouTube / LinkedIn — those platforms aren't connected yet (B2 covers publishing, not ingest).
- Comparing against competitors — separate, larger feature.
- Ongoing voice drift detection — defer.
