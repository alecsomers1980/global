# A4 — Real Inbox via FB/IG webhooks

## Goal

Replace the mock-data Inbox with real comments and DMs from Facebook and Instagram, ingested via Graph API webhooks into a new `messages` table. The UI displays threads grouped by conversation, with a working reply box that posts back to FB/IG.

## Why now

Without real inbox data, every engagement feature in Phase C (auto-triage, AI replies) has nothing to operate on. This step is the data foundation for the engagement loop.

## Prerequisites

- A1 done.
- Read `_context.md`. Especially the social_accounts table (it stores the access tokens we'll need to subscribe and reply).
- The Facebook App associated with the workspace's connected Page must have the `pages_messaging`, `pages_read_engagement`, `pages_manage_metadata`, and `instagram_manage_messages` permissions. Verify this with the user before starting.

## Files involved

- **Create migration**: `supabase/migrations/006_messages.sql` — the `messages` table.
- **Create**: `src/app/api/webhooks/meta/route.ts` — webhook receiver (handles GET verification handshake + POST events for both FB and IG).
- **Create**: `src/lib/messages.ts` — helpers: `replyToFacebook`, `replyToInstagram`, `replyToComment`, `markRead`, `subscribePage`.
- **Create**: `src/app/api/workspaces/messages/route.ts` — `GET` lists threads, `POST` sends a reply.
- **Modify**: `src/app/dashboard/workspaces/[id]/inbox/page.tsx` — replace hardcoded mocks with real fetches.

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first.
>
> **Task A4**: Build the real Inbox by ingesting FB/IG webhook events into a `messages` table and rendering them in the existing Inbox UI.
>
> **Step 1 — Migration.** Create `supabase/migrations/006_messages.sql`:
>
> ```sql
> create table if not exists public.messages (
>   id uuid primary key default uuid_generate_v4(),
>   workspace_id uuid not null references public.workspaces(id) on delete cascade,
>   platform text not null check (platform in ('facebook','instagram')),
>   thread_key text not null,                -- conversation grouping (PSID for DMs, post_id for comments)
>   kind text not null check (kind in ('dm','comment')),
>   external_id text not null,               -- platform-side message/comment id (idempotency)
>   parent_external_id text,                 -- for comment replies
>   from_external_id text not null,          -- sender PSID / IG user id / commenter id
>   from_name text,
>   body text,
>   media_urls text[],
>   is_from_us boolean not null default false,
>   received_at timestamptz not null default now(),
>   read_at timestamptz,
>   replied_at timestamptz,
>   raw_payload jsonb
> );
>
> create unique index if not exists messages_external_id_uq
>   on public.messages(platform, external_id);
> create index if not exists messages_workspace_thread_idx
>   on public.messages(workspace_id, thread_key, received_at desc);
>
> alter table public.messages enable row level security;
> create policy "Agency admins manage messages"
>   on public.messages for all
>   using (auth.role() = 'authenticated');
> ```
>
> Update `supabase/schema.sql` so it stays the source of truth.
>
> **Step 2 — Webhook receiver.** Create `src/app/api/webhooks/meta/route.ts` with:
>
> - `GET` handler: Meta's verification handshake. Return `searchParams.get('hub.challenge')` as plain text when `hub.mode === 'subscribe'` and `hub.verify_token === process.env.META_WEBHOOK_VERIFY_TOKEN`. Otherwise 403.
> - `POST` handler: receives event payloads. Verify the `X-Hub-Signature-256` header against the body using HMAC-SHA256 with `process.env.META_APP_SECRET`. Reject with 401 on signature mismatch.
> - Use `createAdminClient()` (not the cookie-bound client — webhooks have no user session).
> - Parse the event. Both Page and IG events arrive at the same endpoint. Handle:
>   - **Page DM**: `entry[].messaging[].message` — kind=`dm`, thread_key = sender PSID.
>   - **Page comment / reaction**: `entry[].changes[]` with `field='feed'` and `value.item='comment'` — kind=`comment`, thread_key = the post_id.
>   - **IG DM**: `entry[].messaging[].message` (IG webhooks use the same shape as Page when subscribed via Messenger Platform).
>   - **IG comment**: `entry[].changes[]` with `field='comments'`.
> - Map each event into the `messages` schema. Look up `workspace_id` by joining the page/IG account id to `social_accounts.account_id`. If no match, log and skip — don't crash.
> - Use `external_id` as the dedupe key — idempotent on retries.
> - Always return `200` quickly; do the DB write inline (Vercel functions are short-lived but webhooks tolerate up to 20s).
>
> **Step 3 — Reply helpers.** In `src/lib/messages.ts`:
>
> - `replyToFacebookComment(commentId, accessToken, message)` → `POST graph.facebook.com/v19.0/{commentId}/comments`.
> - `replyToFacebookDm(recipientPsid, accessToken, message)` → `POST graph.facebook.com/v19.0/me/messages` with `{recipient: {id}, message: {text}}`. Honour the **24-hour rule** — if the most recent inbound message in this thread is >24h ago, throw a typed error so the API caller can present a clear message to the user.
> - `replyToInstagramComment(commentId, accessToken, message)` → same shape as FB comments.
> - `replyToInstagramDm(...)` — same as FB DMs (uses Page access token, IG-scoped recipient id).
> - All functions return `{ external_id }` from the platform response so the caller can write a corresponding `messages` row with `is_from_us=true, replied_at=now()`.
>
> **Step 4 — Inbox API.** Create `src/app/api/workspaces/messages/route.ts`:
>
> - `GET ?workspaceId=<slug-or-uuid>` — resolve workspace via `resolveWorkspaceId()`, return threads grouped by `thread_key` with the latest message's `body`, `from_name`, `received_at`, `kind`, `platform`, plus an unread count. Most-recent first. Limit 50.
> - `GET ?workspaceId=<...>&thread=<thread_key>` — return all messages in that thread, oldest first.
> - `POST` body `{ workspaceId, thread_key, body }` — look up the workspace's social_account, look up the thread to determine kind (dm vs comment) and platform, call the right helper, write our outgoing message into `messages`. Return the new row.
> - Mark thread messages as read (`read_at = now()` where null) when the GET-thread variant is hit.
>
> **Step 5 — Wire the Inbox UI.** In `src/app/dashboard/workspaces/[id]/inbox/page.tsx`:
>
> - Strip the hardcoded mock data. Fetch threads via `/api/workspaces/messages?workspaceId={id}`.
> - When a thread is selected, fetch its messages via the GET-thread variant.
> - The reply box: `POST /api/workspaces/messages`. On success, optimistically append to the thread; on the typed 24-hour error, show a clear inline notice ("This conversation is older than 24 hours — you can only reply via a tagged response. Send the user a comment first").
> - Loading + empty states. No mock data anywhere.
>
> **Step 6 — Subscription bootstrap.** Add a one-shot setup endpoint `src/app/api/workspaces/platforms/subscribe/route.ts` that, given a workspace, calls `POST graph.facebook.com/v19.0/{pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,feed` for each connected page. The user runs this once per workspace after connecting a page. Document this in the route's comments.
>
> **Constraints**:
>
> - Add these env vars: `META_WEBHOOK_VERIFY_TOKEN`, `META_APP_SECRET`. Don't read them at module load — read inside the handler so a missing var produces a clear runtime error, not a build-time crash.
> - Don't bypass signature verification, even in dev. Set `META_APP_SECRET` locally via `.env.local` and use ngrok for testing.
> - Webhooks must be idempotent — duplicate `external_id` inserts should silently no-op (use `upsert` with the unique index, or catch the unique-violation).
> - The reply API must NOT auto-reply. That's C1. This step only enables the human reply box.
> - One round-trip per inbox open — batch the GET request, don't fetch per-thread on render.

## Acceptance criteria

- [ ] Migration 006 added; schema.sql updated; user can run it manually.
- [ ] Webhook receiver verifies signature, persists events idempotently, handles both DMs and comments for FB and IG.
- [ ] Inbox UI shows real threads with real messages, no mock data.
- [ ] Reply box sends a real message that lands in the recipient's inbox / under the comment.
- [ ] 24-hour rule violations produce a clear UI message, not a 500.
- [ ] No new npm deps. No schema changes beyond migration 006.
- [ ] Lint + typecheck clean.

## Out of scope

- AI auto-reply / triage — that's C1.
- Cross-channel unified inbox (e.g. WhatsApp, TikTok DMs) — not now.
- Search inside threads — UI-level enhancement, defer.
- Read receipts back to the platform — defer.
