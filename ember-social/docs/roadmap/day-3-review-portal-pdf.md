# Day 3 — Client review portal: comments, change requests, PDF export

## Goal

The agency generates a 30-day plan (Day 2). The client opens **one shareable link**, sees the whole plan with per-post previews, can:

1. **Comment** on individual posts.
2. **Request changes** with a status badge that flips the post back to the agency.
3. **Approve** posts individually or in bulk.
4. **Download a PDF** of the full schedule (with brand-coloured cover and per-post previews) to forward internally.

This is the artefact the user asked for: *"export that plan to a pdf or link to a page where the client can view the schedule and comment on each post if they require changes."*

## Why this matters

Without per-post comments, change-requests, and a clean shareable schedule, every revision becomes an email thread. The agency loses time and the client loses confidence. This is the single feature that turns Ember from a publishing tool into an *agency platform*.

## Prerequisites

- Day 2 merged. Posts now have `variants`, `pillar`, `rationale`, and a shared `approval_token` per batch.
- Read [`_context.md`](./_context.md).

## Files involved

- **Create**: `supabase/migrations/008_post_feedback.sql` — `post_feedback` table + `posts.client_status` column + `campaign_batches` table.
- **Create**: `src/app/api/posts/[id]/feedback/route.ts` — POST a comment, GET feedback list.
- **Create**: `src/app/api/posts/[id]/client-action/route.ts` — POST `{ action: 'approve' | 'request_changes', token: string }`.
- **Create**: `src/app/api/workspaces/campaign/pdf/route.ts` — GET, returns PDF for a batch by token.
- **Create**: `src/app/plan/[token]/page.tsx` — public read-only schedule view (no login).
- **Modify**: `src/app/approve/[token]/page.tsx` — upgrade to multi-post review with comments + change-requests + calendar/list toggle.
- **Modify**: `src/app/api/workspaces/campaign/generate/route.ts` — also insert a `campaign_batches` row to track the batch metadata (rationale, pillars, created_at).
- **Modify**: `src/app/dashboard/workspaces/[id]/approvals/page.tsx` — show change-request count badge + comment thread per post.

## Migration 008

```sql
create table if not exists public.campaign_batches (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  approval_token text unique not null,
  strategy_rationale text,
  pillars text[],
  duration_days int,
  created_at timestamptz default now()
);

alter table public.campaign_batches enable row level security;
create policy "Agency admins manage batches" on public.campaign_batches for all
  using (auth.role() = 'authenticated');

create table if not exists public.post_feedback (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  author_name text,
  author_role text check (author_role in ('client', 'agency')) default 'client',
  comment text not null,
  status text check (status in ('open', 'resolved')) default 'open',
  created_at timestamptz default now()
);

alter table public.post_feedback enable row level security;
create policy "Public can insert feedback by token" on public.post_feedback for insert
  with check (true);
create policy "Agency admins read feedback" on public.post_feedback for select
  using (auth.role() = 'authenticated');

alter table public.posts
  add column if not exists client_status text
    check (client_status in ('pending', 'approved', 'changes_requested'))
    default 'pending';

create index if not exists post_feedback_post_id_idx on public.post_feedback(post_id);
create index if not exists campaign_batches_token_idx on public.campaign_batches(approval_token);
```

## DeepSeek prompt

> You are working on Ember Social. Read `ember-social/docs/roadmap/_context.md` first. Do not break the publish spine. **One new npm dep is acceptable for PDF generation — flag it in your response.**
>
> **Task — Day 3: Client review portal (comments + change requests + PDF export).**
>
> **Step 1.** Apply migration `supabase/migrations/008_post_feedback.sql` from this spec's "Migration 008" section.
>
> **Step 2.** Update `src/app/api/workspaces/campaign/generate/route.ts` (from Day 2) to also insert a `campaign_batches` row with the generated `strategy_rationale`, `pillars`, `duration_days`, and the shared `approval_token`. The existing `posts` insert is unchanged.
>
> **Step 3.** Create `src/app/api/posts/[id]/feedback/route.ts`:
>
> - `POST` body `{ token: string, author_name: string, comment: string }`. Validate that the post's `approval_token` (via its batch — join through `campaign_batches`) matches the supplied token. Insert into `post_feedback` with `author_role='client'`. Use `createAdminClient()` (no user session for public callers).
> - `GET ?token=...` — return all feedback for the post if token matches. Used by both the public plan page and the agency approvals page (the latter has a session but we keep the same endpoint for consistency).
>
> **Step 4.** Create `src/app/api/posts/[id]/client-action/route.ts`:
>
> - `POST` body `{ token: string, action: 'approve' | 'request_changes' }`. Validate token via the batch.
> - On `approve`: set `client_status='approved'`, **and** if the post is `pending_approval`, set `status='approved'` so the existing cron picks it up. Use `createAdminClient()`.
> - On `request_changes`: set `client_status='changes_requested'`, set `status='draft'` so the cron does NOT publish it.
> - Return `{ ok: true }`.
>
> **Step 5.** Add PDF dependency. Add `@react-pdf/renderer` (only one) to `package.json` — **call this out explicitly in your response.** Create `src/lib/pdf/SchedulePdf.tsx` — a `@react-pdf/renderer` document component that takes `{ batch, posts, brandKit, workspaceName }` and renders:
>
> - Cover page: workspace name, "30-day social media plan", date range, `strategy_rationale`, pillars. Use `brandKit.primary_color` as the accent.
> - One page per post: scheduled date/time, pillar tag, FB variant content (and IG/TikTok if present), hashtags, rationale.
> - Footer on each page: "Generated by Ember Social — {today}".
>
> **Step 6.** Create `src/app/api/workspaces/campaign/pdf/route.ts`:
>
> - `GET ?token=...` — resolve the batch by token, fetch its posts + brand kit + workspace name, render `SchedulePdf` via `@react-pdf/renderer`'s `renderToStream`, return as `application/pdf` with `Content-Disposition: attachment; filename="schedule-{workspace_slug}-{YYYY-MM}.pdf"`.
>
> **Step 7.** Create `src/app/plan/[token]/page.tsx` — public read-only schedule view (no login required):
>
> - Server component. Fetch by token: `campaign_batches`, posts (ordered by `scheduled_at`), `brand_kits`, workspace name.
> - Header: workspace name + logo, "30-day plan", date range, "Download PDF" button (links to the PDF endpoint with the token).
> - Strategy rationale card (the *why*).
> - Calendar view (default) + list view toggle. Calendar = simple month grid with post counts; list = chronological cards.
> - Per-post card: scheduled date, pillar tag, **per-platform tabs** showing each variant, hashtags, and **a "Comment" CTA** that opens a textarea + name field. Submitting POSTs to `/api/posts/[id]/feedback`. Below the textarea, show existing feedback ordered newest-first.
> - Per-post **Approve** and **Request changes** buttons (only show if `client_status === 'pending'`). On click, POST to `/api/posts/[id]/client-action`. Reflect the new status with a badge: green tick for approved, amber dot for changes_requested.
> - Use brand-kit colours throughout (`primary_color` for the accent, otherwise the standard dark theme).
> - Mobile-responsive — clients will open this on phones.
>
> **Step 8.** Replace `src/app/approve/[token]/page.tsx` with a thin agency-side wrapper around the same review experience as `/plan/[token]` — i.e. include the same per-post comment thread and client-action buttons, but additionally show comment status to the agency. The token resolves the same batch; the only difference is the URL the agency emails the client (`/plan/<token>` = client-facing, `/approve/<token>` = legacy, can redirect to `/plan/<token>`).
>
> **Step 9.** Update `src/app/dashboard/workspaces/[id]/approvals/page.tsx`:
>
> - For each post, show a small badge with the number of open `post_feedback` entries.
> - Add a "Reply" affordance on each post that POSTs to `/api/posts/[id]/feedback` with `author_role='agency'`.
> - Show client_status alongside post status (e.g. `pending_approval · changes_requested` if the client flagged it).
>
> **Constraints**:
>
> - Use `createAdminClient()` for any public (token-authed) writes. Never trust the token to grant write to any post that isn't bound to that batch.
> - Sanitise comment text — strip HTML tags, cap at 2000 chars.
> - Sparse comments in code. Match existing UI styling.
> - `@react-pdf/renderer` is the **only** new dep; call it out.

## Acceptance criteria

- [ ] Migration 008 file exists, additive only.
- [ ] After Day 2 generation: a `campaign_batches` row exists for the batch with the rationale and pillars.
- [ ] `/plan/<token>` loads publicly (no login) and shows the full schedule with calendar + list toggle, brand colours, and a PDF download button.
- [ ] Per-post comment submission writes to `post_feedback` and appears immediately on refresh.
- [ ] Per-post "Approve" flips `client_status` AND `status` (`pending_approval → approved`); next cron tick publishes it.
- [ ] Per-post "Request changes" flips `client_status='changes_requested'` AND `status='draft'`; the post does NOT publish.
- [ ] `/api/workspaces/campaign/pdf?token=...` returns a valid PDF with cover + per-post pages.
- [ ] Agency `/dashboard/workspaces/<id>/approvals` shows comment counts and lets the agency reply.
- [ ] The existing Everest publish spine still works (manual sanity check on a single post).
- [ ] `npm run build` and `npm run lint` clean.
- [ ] Only one new dep added: `@react-pdf/renderer`. Called out in the response.

## Out of scope (defer)

- Email notifications when the client comments or requests changes — Day 4 stretch or later.
- Threaded comment replies — flat list for v1.
- Inline editing of post content by the client — they request changes, the agency edits.
- Real-time updates (websockets) — refresh-on-load is fine.
- Multi-language support — South African English / EN only for now.
