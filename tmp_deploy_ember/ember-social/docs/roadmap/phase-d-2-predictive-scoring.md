# D2 — Predicted-engagement scoring + A/B variants before publish

## Goal

Before a post is published, predict its engagement (relative to that workspace's history) and offer the user 2-3 A/B variants ranked by predicted performance. Make the user click through one before scheduling.

## Why

The user's vision: "look at what works for the niche and give suggestions." With C2's insights and A3's history, we have enough signal to score a *new* draft. Showing predicted ranks pushes the user to publish the best variant rather than the first.

## Prerequisites

- A3, C2 done.
- B1 helpful (richer voice profile = better variant generation).
- Read `_context.md`.

## Files involved

- **Create**: `src/lib/ai/score-and-vary.ts` — generates variants and scores each.
- **Create migration**: `supabase/migrations/012_post_variants.sql` — stores variants + scores per post.
- **Create**: `src/app/api/workspaces/posts/score/route.ts` — POST takes a draft, returns variants + scores.
- **Modify**: `src/app/dashboard/workspaces/[id]/compose/page.tsx` — adds a "Score & generate variants" button.
- **Modify**: `src/components/PostPreviewCard.tsx` (and approvals page) — surface the predicted score badge.

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first.
>
> **Task D2**: Pre-publish prediction + A/B variant generation.
>
> **Step 1 — Migration 012.** Store variants per post:
>
> ```sql
> create table if not exists public.post_variants (
>   id uuid primary key default uuid_generate_v4(),
>   post_id uuid not null references public.posts(id) on delete cascade,
>   variant_label text not null,           -- e.g. 'A', 'B', 'C', or 'original'
>   content text not null,
>   media_urls text[],
>   predicted_score numeric,               -- 0..1, higher = predicted to perform better
>   prediction_rationale text,
>   chosen boolean not null default false,
>   created_at timestamptz default now()
> );
>
> create index if not exists post_variants_post_idx on public.post_variants(post_id);
>
> alter table public.post_variants enable row level security;
> create policy "Agency admins manage variants"
>   on public.post_variants for all
>   using (auth.role() = 'authenticated');
> ```
>
> Update `supabase/schema.sql`.
>
> **Step 2 — Scorer + variant generator.** Create `src/lib/ai/score-and-vary.ts` exporting:
>
> ```ts
> export interface VariantWithScore {
>   label: string
>   content: string
>   media_urls?: string[]
>   predicted_score: number          // 0..1
>   rationale: string
> }
>
> export async function scoreAndVary(opts: {
>   workspaceId: string
>   draftContent: string
>   platforms: string[]
>   mediaUrls?: string[]
>   variantCount?: number   // default 3 (A,B,C)
> }): Promise<{ original: VariantWithScore; variants: VariantWithScore[] }>
> ```
>
> Implementation:
>
> - Pull `client_intelligence` and `workspace_insights` (from C2) — we need both the voice spec and the performance patterns.
> - Single LLM call (`gpt-4o-mini` or step up to `gpt-4o` for D2 only — flagship judgement matters here):
>
>   ```
>   You are an engagement-prediction assistant. Below: this brand's voice spec, what's worked for them historically (top patterns + weak patterns), and a draft post.
>
>   1. Score the original draft 0..1 for predicted engagement, with a one-sentence rationale.
>   2. Generate {variantCount} variants — distinct angles, hooks, lengths, or formats — each scored 0..1 with a rationale.
>
>   Variants must:
>   - Stay factually identical (no fabricated specs/prices/features)
>   - Stay on-voice
>   - Differ meaningfully from each other (don't just paraphrase)
>
>   Output strict JSON: { original: VariantWithScore, variants: [VariantWithScore] }
>   ```
>
> - Pass top/weak patterns from `workspace_insights` as context.
> - Fail loudly if `workspace_insights` is missing or sparse — return only the original with `predicted_score: null` and a note that scoring needs ≥10 published posts. Don't fabricate scores.
>
> **Step 3 — Endpoint.** Create `src/app/api/workspaces/posts/score/route.ts`:
>
> - `POST` body: `{ workspaceId, draftContent, platforms, mediaUrls? }`.
> - Resolve workspaceId. Auth: agency user.
> - Calls `scoreAndVary`.
> - Returns the variants. Does **not** persist `post_variants` rows yet — those are written when the user picks one.
>
> Add a follow-up `POST /api/workspaces/posts/score/persist` that takes the chosen variant and:
>
> - Either updates an existing `posts` row with the chosen content/media, OR creates a new draft if `postId` not provided.
> - Inserts the original + all variants into `post_variants` with `chosen=true` on the picked one. Keeps the alternatives for later analysis.
>
> **Step 4 — Compose UI.** In `src/app/dashboard/workspaces/[id]/compose/page.tsx`:
>
> - After the user types content + selects platforms, add a "Score & suggest variants" button. Disabled until content >40 chars.
> - On click: call the score endpoint. Show a panel with original + variants, each as a card showing content, predicted score (as a 0–100% badge with colour: red <50, yellow 50–70, green >70), and rationale tooltip.
> - User clicks one → that becomes the active draft (the textarea fills with it). The original stays in a "Recover original" link.
> - On save (whether scored or not), call the persist endpoint to store variants alongside the post.
>
> **Step 5 — Approvals UI badge.** In `src/components/PostPreviewCard.tsx`:
>
> - If the post has a chosen `post_variants` row with a score, show a small "Predicted: 78%" badge.
> - In the approvals list, sort approved-or-pending posts by predicted score desc when a "Sort by predicted score" toggle is enabled.
>
> **Step 6 — Calibration.** Once D2 has been live for a few weeks and we have actuals, add a small worker that joins `post_variants.predicted_score` against actual `post_results` engagement and computes a calibration error per workspace. Surface as a tiny dev panel — if predictions are systematically high or low, we can tune the prompt.
>
> Defer the worker; just leave a TODO comment near `scoreAndVary` mentioning the calibration plan.
>
> **Constraints**:
>
> - **Never publish a variant without explicit user click.** This is augmentation, not automation.
> - Predicted scores are *advisory* — never block a publish based on a low score.
> - Cost: scoring uses `gpt-4o` (not `gpt-4o-mini`) for variant quality. Roughly 5–10¢ per call. Cache results per draft for 5 minutes so re-clicks don't double-charge.
> - Scoring requires `workspace_insights` to be present and not sparse. If absent, return original-only with a clear UX message.
> - Don't show predicted scores to clients on the `/approve/[token]` page — they're internal.
>
> **Optional (worth flagging)**: the scoring prompt could be much stronger if we feed it the *actual top 10 posts and their engagement*, not just the summary patterns. That's more tokens but probably worth it. Default to the summary; flag to user as a possible upgrade.

## Acceptance criteria

- [ ] Migration 012 added.
- [ ] Compose page can produce 3 variants + scores for a typed draft.
- [ ] User can pick a variant; the chosen one becomes the post content.
- [ ] `post_variants` rows persisted with `chosen=true` on the selected one.
- [ ] Approvals page shows predicted score badge.
- [ ] Workspaces without insights data get a graceful "Need more posts before scoring" message — not a fake number.
- [ ] No new npm deps.
- [ ] Lint + typecheck clean.

## Out of scope

- Calibration worker (flagged TODO; build it after a few weeks of data).
- Per-platform scoring (one score across all selected platforms is fine for v1).
- Realtime A/B testing (publishing both variants and measuring) — that's a separate, larger feature.
- Image / video variant generation — D1 covers media; this step is text-only.
