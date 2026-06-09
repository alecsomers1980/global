# D1 — AI image / video generation pipeline

## Goal

When a post needs media but none is supplied (or supplied media is weak — wrong aspect ratio, low quality, mismatched content), generate platform-appropriate media via a hosted model provider (Replicate, Runway, or Sora). Store generated assets in the workspace's `media` table (currently unused) and attach to posts.

## Why

The user's vision: "design posts/videos/shorts that helps client with sales and enquiries." For text-first clients (B2B services, news roundups, GBP listings) we already generate copy. For visual-first verticals we need to fill the picture.

## Prerequisites

- A1, A2, A3 done.
- C2 helpful — performance insights tell us which media style works.
- The user must pick a provider and supply API credentials. **Confirm provider choice with the user before starting.** Default recommendation: Replicate for images (cheap, broad model selection) + Runway for video (better motion than open-source).

## Files involved

- **Create migration**: `supabase/migrations/011_media_generation.sql` — adds generation metadata to `media`.
- **Create**: `src/lib/ai/generate-media.ts` — provider-agnostic interface with concrete adapters.
- **Create**: `src/app/api/workspaces/media/generate/route.ts` — POST endpoint.
- **Create**: `src/app/dashboard/workspaces/[id]/media/page.tsx` — the missing media library UI.
- **Modify**: `src/app/dashboard/workspaces/[id]/compose/page.tsx` — add a "Generate image" / "Generate video" button next to the media URL input.
- **Modify**: `src/app/api/workspaces/campaign/generate/route.ts` (from A2) — optionally trigger media gen for each generated post (gated by a per-workspace setting; default off for cost).

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first.
>
> **Task D1**: Add an AI media-generation pipeline that produces platform-appropriate images and videos.
>
> **Step 0 — Provider check.** Ask the user which provider(s) to use. Defaults:
>
> - **Images**: Replicate (`black-forest-labs/flux-1.1-pro` or `stability-ai/sdxl` — Replicate is cheaper and the model is a per-call config). Cost ~$0.003/image.
> - **Videos**: Runway (`gen-3-alpha-turbo` for 10s 1080p clips). Cost ~$0.05/second of video.
> - **Alternative**: OpenAI Sora API — wait for stable, currently gated.
>
> Don't pick on the user's behalf. Get explicit answer + API keys.
>
> **Step 1 — Migration 011.** Extend the `media` table:
>
> ```sql
> alter table public.media
>   add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
>   add column if not exists kind text check (kind in ('image','video')),
>   add column if not exists url text,
>   add column if not exists thumbnail_url text,
>   add column if not exists prompt text,
>   add column if not exists provider text,
>   add column if not exists model text,
>   add column if not exists generation_cost_usd numeric,
>   add column if not exists width int,
>   add column if not exists height int,
>   add column if not exists duration_seconds numeric,
>   add column if not exists created_by uuid references auth.users(id),
>   add column if not exists created_at timestamptz default now();
>
> create index if not exists media_workspace_idx on public.media(workspace_id, created_at desc);
>
> alter table public.media enable row level security;
> create policy "Agency admins manage media"
>   on public.media for all
>   using (auth.role() = 'authenticated');
> ```
>
> Update `supabase/schema.sql`. (If `media` already has any of these columns, `if not exists` keeps it safe.)
>
> **Step 2 — Provider-agnostic interface.** Create `src/lib/ai/generate-media.ts`:
>
> ```ts
> export interface GenerateImageOpts {
>   workspaceId: string
>   prompt: string
>   aspect_ratio: '1:1' | '4:5' | '9:16' | '16:9'    // FB feed, IG feed, Reels/Stories, YouTube
>   reference_image_url?: string
>   negative_prompt?: string
> }
>
> export interface GenerateVideoOpts {
>   workspaceId: string
>   prompt: string
>   aspect_ratio: '9:16' | '16:9' | '1:1'
>   duration_seconds?: number   // default 6
>   reference_image_url?: string
> }
>
> export async function generateImage(opts: GenerateImageOpts): Promise<MediaRow>
> export async function generateVideo(opts: GenerateVideoOpts): Promise<MediaRow>
> ```
>
> - Internal: split into adapters (`src/lib/ai/providers/replicate.ts`, `src/lib/ai/providers/runway.ts`) so we can swap.
> - Both functions: enrich the prompt with the workspace's brand kit (colours, watermark) and brand voice tone tag from `client_intelligence` (e.g. "premium pre-owned car dealership tone, warm and confident").
> - On generation: download the result and re-host it on Supabase Storage (existing setup; create a `generated-media` bucket if needed). Don't link directly to provider URLs — those expire.
> - Insert a `media` row with everything: prompt, provider, model, cost, dimensions, duration, url, thumbnail_url, kind, workspace_id, created_by.
> - Return the row.
>
> **Step 3 — Endpoint.** Create `src/app/api/workspaces/media/generate/route.ts`:
>
> - `POST` body: `{ workspaceId, kind: 'image'|'video', prompt, aspect_ratio, reference_image_url?, duration_seconds? }`.
> - Resolve workspaceId. Auth: must be authenticated agency user.
> - Calls `generateImage` / `generateVideo`.
> - Returns the `media` row.
> - Costs: enforce a daily-spend cap per workspace (env-var configurable, default $5/day). Track via `sum(generation_cost_usd) where created_at > now() - interval '1 day'`. If exceeded, 429 with a clear message.
>
> **Step 4 — Media library UI.** Create `src/app/dashboard/workspaces/[id]/media/page.tsx`:
>
> - Grid of `media` rows for this workspace, most recent first.
> - Click → modal with prompt, dimensions, cost, "Use in new post" button (links to `/dashboard/workspaces/<id>/compose?mediaUrl=<url>`).
> - "Generate new" form at the top: kind, aspect ratio, prompt textarea. POSTs to the generate endpoint.
> - Surface daily spend: "$X.XX of $5 used today".
>
> **Step 5 — Compose integration.** In `src/app/dashboard/workspaces/[id]/compose/page.tsx`, next to the media URL input:
>
> - "Generate image" button → opens a small inline form (prompt only; aspect_ratio inferred from selected platforms — IG feed = 4:5, IG reels = 9:16, etc).
> - On success, fill the media URL input with the generated row's `url`.
>
> **Step 6 (optional) — Campaign integration.** In `src/app/api/workspaces/campaign/generate/route.ts` (from A2), accept an optional `generate_media: boolean` flag. If true, for each generated post idea, also generate a matching image with a prompt derived from the post content.
>
> Off by default — costs add up fast. Surface as a checkbox in the "Generate Marketing Plan" UI.
>
> **Constraints**:
>
> - **No model trained on the user's brand without consent.** All generations are zero-shot from prompt. Custom fine-tunes are a separate project.
> - Daily spend cap is non-negotiable for v1. Defaults conservative.
> - Don't link directly to Replicate/Runway URLs in `posts.media_urls` — those expire. Always go through Supabase Storage.
> - Watermark generated content per workspace settings (most clients won't want this, but a per-workspace toggle is cheap to add).
> - Surface failures clearly: provider errors, content-policy rejections, dimension mismatches all need to roll up to a clean `last_error`-style string.

## Acceptance criteria

- [ ] Migration 011 added.
- [ ] Image generation works end-to-end: prompt → Supabase-stored asset → `media` row.
- [ ] Video generation works for the chosen provider.
- [ ] Media library page lists generated media for the workspace, with "Use in new post".
- [ ] Compose page has a working "Generate image" button.
- [ ] Daily spend cap enforced.
- [ ] No regressions to existing publish flow (existing posts that supply real media URLs keep working).
- [ ] Lint + typecheck clean.

## Out of scope

- Custom-trained brand models (DreamBooth / LoRA) — defer.
- AI-edited photos (background remove, upscale) — defer; nice next step.
- Audio / voice-over generation for videos — defer.
- Multi-shot video sequences — defer; v1 is single-clip.
