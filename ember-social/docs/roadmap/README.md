# Ember Social — Roadmap

Self-contained, ordered build plan. Each phase has numbered steps; each step is a separate file with a copy-paste DeepSeek prompt, file paths, and acceptance criteria. **Do steps in order within a phase** — later steps assume earlier ones.

Read [`_context.md`](./_context.md) once before starting any step. Every step prompt assumes DeepSeek has already loaded that context.

## Status legend

- `[ ]` not started
- `[~]` in progress
- `[x]` done, reviewed
- `[!]` done by DeepSeek/GLM, **awaiting Claude review**

## Everest Motoring sprint — 4-day track (PRIORITY)

This sprint compresses the highest-value items into a focused 4-day implementation aimed at getting Everest Motoring's first 30-day plan signed off and publishing. Each day is a self-contained spec with a GLM-5.1 prompt.

- [ ] **Day 1** — Brand + social-history intake. Unified scan that pulls site colours/fonts/logo + content voice + the client's actual FB/IG history (cadence, best hours, top themes). See [day-1-brand-social-intake.md](./day-1-brand-social-intake.md).
- [ ] **Day 2** — Smart campaign generator + per-platform variants. "Generate Marketing Plan" button uses the Day 1 scan to produce a 30-day plan with FB/IG/TikTok variants and a `strategy_rationale` explaining cadence. See [day-2-smart-campaign-variants.md](./day-2-smart-campaign-variants.md).
- [ ] **Day 3** — Client review portal. Shareable `/plan/<token>` link, per-post comments, change-requests, bulk approval, PDF export with brand colours. See [day-3-review-portal-pdf.md](./day-3-review-portal-pdf.md).
- [ ] **Day 4** — Per-platform composer previews + IG first-comment + Everest operational pass. Also stretch: GBP publishing wiring. See [day-4-platform-previews-everest-polish.md](./day-4-platform-previews-everest-polish.md).

Below is the original phased backlog. The 4-day sprint subsumes A2 and parts of B1, B3; the rest remains valid for post-sprint work.

## Original phased backlog

#### Phase A — Finish what's already half-built (~1 week)

- [ ] **A1** — Apply migration 005 (`last_error` column) to production Supabase. *Manual SQL, not a DeepSeek task.* See [phase-a-1-apply-migration-005.md](./phase-a-1-apply-migration-005.md).
- [ ] **A2** — Surface the existing `/api/ai/campaign` generator in the workspace UI. Output flows into the existing approval → schedule → publish pipeline. **Highest value for the smallest amount of work.** See [phase-a-2-campaign-ui.md](./phase-a-2-campaign-ui.md).
- [ ] **A3** — Persist real engagement data into `post_results` after each successful publish, replacing the mock analytics. See [phase-a-3-post-results.md](./phase-a-3-post-results.md).
- [ ] **A4** — Replace mock Inbox with real FB/IG webhook handlers + a `messages` table. See [phase-a-4-inbox-webhooks.md](./phase-a-4-inbox-webhooks.md).

### Phase B — Extend what exists (~2-3 weeks)

- [ ] **B1** — Extend `/api/ai/analyze-brand` to ingest a client's recent FB/IG posts and write the inferred voice into `client_intelligence`. See [phase-b-1-analyze-existing-posts.md](./phase-b-1-analyze-existing-posts.md).
- [ ] **B2** — Implement TikTok / YouTube / LinkedIn publishing in `lib/publish.ts` (or remove them from the platform UI). See [phase-b-2-tiktok-youtube-linkedin.md](./phase-b-2-tiktok-youtube-linkedin.md).
- [ ] **B3** — Wire GBP local-post publishing into `lib/publish.ts` (gated behind a feature flag until Google approves the API access). See [phase-b-3-gbp-publishing.md](./phase-b-3-gbp-publishing.md).

### Phase C — Engagement loop (3-6 weeks)

- [ ] **C1** — AI triage on inbox messages: sentiment + intent classifier → auto-reply for FAQ-class messages, human-route for leads. Strict Meta-compliance guardrails. See [phase-c-1-inbox-triage.md](./phase-c-1-inbox-triage.md).
- [ ] **C2** — Feed `post_results` engagement data back into the rewriter and campaign generator so generation improves with evidence. See [phase-c-2-engagement-feedback-loop.md](./phase-c-2-engagement-feedback-loop.md).

### Phase D — Generative + predictive (later)

- [ ] **D1** — AI image/video generation pipeline (Replicate or Runway) for posts where stock media isn't enough. See [phase-d-1-media-generation.md](./phase-d-1-media-generation.md).
- [ ] **D2** — Predicted-engagement scoring + A/B variant generation before publish. See [phase-d-2-predictive-scoring.md](./phase-d-2-predictive-scoring.md).

## Workflow per step

1. Open the step's `.md` file.
2. Copy the **"DeepSeek prompt"** section verbatim into DeepSeek (or whichever code-gen agent you're using).
3. DeepSeek writes the code.
4. Update status to `[!]` in this README.
5. Ping Claude to review. Claude verifies against the step's **"Acceptance criteria"** section, runs lints/types, may push back or accept.
6. If accepted, update status to `[x]` and move to next step.

## Hard rules for DeepSeek

These apply to every step. The shared context file ([`_context.md`](./_context.md)) repeats them.

1. **Don't break existing flows.** Every change must leave the Everest trigger → approve → cron → FB publish path working end-to-end.
2. **No new dependencies without flagging.** If a step seems to require a new npm package, call it out in the response — don't silently add it.
3. **Match the existing patterns.** Server clients via `createServerSupabaseClient()` or `createAdminClient()`; browser components fetch through `/api/...` endpoints, never direct Supabase queries that include `workspace_id` filters (slug-vs-UUID bug).
4. **Migrations are additive.** Use `add column if not exists`, `create table if not exists`. Never drop or rename existing columns without explicit instruction.
5. **No mock data in production code paths.** If the real backend isn't ready, return `[]` or a 501 — don't ship hardcoded fakes the way the Inbox/Analytics pages currently do.
6. **Comments are sparse.** A short note for non-obvious *why*, never narrating *what*. Don't add boilerplate JSDoc.
