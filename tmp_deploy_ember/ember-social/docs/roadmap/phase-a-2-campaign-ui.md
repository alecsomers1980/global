# A2 — Surface the campaign generator in the workspace UI

## Goal

A "Generate Marketing Plan" button on the workspace dashboard (and on the calendar page) that calls the existing `POST /api/ai/campaign` endpoint and writes the resulting 30-day plan as `posts` rows so they flow through the existing approval → schedule → publish pipeline.

## Why this is the top of the phase

The backend already generates a full content plan. Nothing in the UI calls it, so it's invisible. Wiring it up costs ~1 day of frontend work and unlocks the user's headline feature ("the platform should work out a marketing plan").

## Prerequisites

- A1 done (migration 005 applied — campaign-generated posts will run through the same publish flow that needs that column).
- Read [`_context.md`](./_context.md) — especially the publishing flow and slug-vs-UUID trap.

## Files involved

- **Read**: `src/app/api/ai/campaign/route.ts` — confirm the response shape, then write a server-side wrapper that persists the output.
- **Read**: `src/app/api/trigger/route.ts` — copy the insert pattern (with `approval_token`, `pending_approval` status, smart scheduling).
- **Create**: `src/app/api/workspaces/campaign/generate/route.ts` — POST endpoint that calls the campaign generator and persists each idea as a post.
- **Modify**: `src/app/dashboard/workspaces/[id]/page.tsx` — add a "Generate Marketing Plan" CTA in the existing layout.
- **Modify**: `src/app/dashboard/workspaces/[id]/calendar/page.tsx` — replace the existing "Auto-Fill Month (AI)" button's mock alert with a real call to the new endpoint.

## DeepSeek prompt

> You are working on Ember Social, a Next.js 15 + Supabase social media SaaS. Read `docs/roadmap/_context.md` first — it explains the supabase clients, the publish flow, the slug-vs-UUID trap, and the hard rules.
>
> **Task A2**: Wire up the existing `/api/ai/campaign` AI generator to actually save posts the user can review.
>
> **Step 1 — Inspect the existing generator.** Read `src/app/api/ai/campaign/route.ts` and confirm the request/response shape. Note exactly which fields the response returns per post idea (e.g. `content`, `platforms`, `pillar`, `suggested_date`, etc). The new endpoint must use this shape exactly — do not modify the AI route.
>
> **Step 2 — Create `src/app/api/workspaces/campaign/generate/route.ts`** with a `POST` handler that:
>
> - Accepts `{ workspaceId: string, durationDays?: number }` in the body (default `durationDays = 30`).
> - Calls `resolveWorkspaceId(workspaceId)` from `src/lib/resolve-workspace.ts` so slug or UUID both work.
> - Internally invokes the campaign generator (either by importing its handler logic into a shared lib function and calling it directly, or by `fetch`-ing `/api/ai/campaign` server-to-server — pick whichever is cleaner and explain why in your response).
> - For each generated post idea: inserts a row into `posts` with:
>   - `workspace_id` = resolved UUID
>   - `content` = generated content
>   - `platforms` = generated platforms (default to `['facebook', 'instagram']` if missing)
>   - `media_urls` = `null` (campaign ideas are text-first; user can add media in compose later)
>   - `scheduled_at` = computed using the same one-per-day pacing as Everest's `getNextAvailableDate`, **skipping Sundays**, starting tomorrow. Spread across the duration. Default time `09:30 SAST` = `07:30Z`.
>   - `status` = `'pending_approval'`
>   - `approval_token` = `crypto.randomUUID()` (one shared token for the whole batch — the existing `/approve/[token]` page already supports multi-post review)
> - Returns `{ success: true, count: <n>, approval_token: '...' }`.
>
> Use `createServerSupabaseClient()` for the insert (consistent with `src/app/api/trigger/route.ts`).
>
> **Step 3 — Surface the CTA.** Add a "Generate Marketing Plan" button to `src/app/dashboard/workspaces/[id]/page.tsx`. It should be visible in the main workspace overview. On click:
>
> - Show a confirm dialog: "Generate a 30-day marketing plan? This creates ~30 draft posts for review."
> - POST to `/api/workspaces/campaign/generate` with the URL `id` param as `workspaceId`.
> - On success: show a success toast/alert "Marketing plan generated — {count} posts ready to review" and link to `/dashboard/workspaces/<id>/approvals`.
> - On error: surface the message.
> - Disable the button while in flight; loading spinner.
>
> **Step 4 — Replace the calendar's mock "Auto-Fill Month".** In `src/app/dashboard/workspaces/[id]/calendar/page.tsx`, the current `handleGenerateMonth` is a mock with a `setTimeout`. Replace it with a real call to `/api/workspaces/campaign/generate`. After success, re-fetch posts.
>
> **Constraints**:
>
> - Do not modify `src/app/api/ai/campaign/route.ts`. If its response shape doesn't match what you need, surface that as a follow-up question — don't change it without checking.
> - Match the existing button styling (orange gradient, glass-card, lucide icons) — see how the "Manual Post" button is styled in the calendar page.
> - One day = one post for the simple v1. If the AI returns >30 ideas for a 30-day window, just use the first 30. If it returns fewer, that's fine; don't pad.
> - Use the same Sunday-skip logic that's already in `getNextAvailableDate` in `src/app/api/trigger/route.ts`. Consider extracting that helper into `src/lib/scheduling.ts` so both the trigger and the campaign endpoint share it — this is a small refactor, do it as part of this step.
> - **Don't** call any platform APIs (FB/IG) from this step. Posts go in as `pending_approval`; the existing cron picks them up after approval.

## Acceptance criteria

- [ ] New file `src/app/api/workspaces/campaign/generate/route.ts` exists and exports a typed POST handler.
- [ ] New file `src/lib/scheduling.ts` exists with a shared `getNextAvailableDate` (or equivalent), used by both the trigger and the new endpoint. Sunday-skip preserved.
- [ ] "Generate Marketing Plan" button visible on workspace overview page.
- [ ] Calendar's "Auto-Fill Month (AI)" button now calls the real endpoint, no `setTimeout` mock.
- [ ] After generation, posts appear in `/dashboard/workspaces/<id>/approvals` with `status='pending_approval'` and consecutive non-Sunday dates.
- [ ] Approving one of those posts and waiting for the cron tick publishes it via the existing flow without changes to `publish.ts`.
- [ ] No new npm dependencies. No platform API calls in this step. No mock data.
- [ ] `npm run lint` and `npm run typecheck` (or equivalent) clean.

## Out of scope (explicitly defer)

- Editing the campaign generator's prompt or output shape (separate step if needed).
- Per-post media generation — that's D1.
- Performance feedback into the generator — that's C2.
- Allowing the user to pick a custom date window or post frequency in the UI — v2.
