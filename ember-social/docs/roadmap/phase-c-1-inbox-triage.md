# C1 — AI triage on Inbox messages

## Goal

When a new message lands in the `messages` table (DM or comment), classify it by intent + sentiment + urgency, auto-reply for FAQ-class messages where confidence is high, and human-route everything else with a suggested-reply pre-filled in the UI.

## Why

The user wants the platform to "engage with clients that comment and ask questions or send DMs." Doing this safely means: AI handles the obvious stuff (price, hours, location), humans handle the leads. Auto-replies must comply with Meta's 24-hour DM policy and platform community standards.

## Prerequisites

- A4 done (real `messages` table populated by webhooks).
- B1 helpful (we use the inferred brand voice for reply tone), but not strictly required. Falls back to `client_intelligence` if A4-derived voice is missing.

## Files involved

- **Create migration**: `supabase/migrations/009_message_triage.sql` — adds triage columns to `messages`.
- **Create**: `src/lib/ai/triage.ts` — the classifier + reply generator.
- **Modify**: `src/app/api/webhooks/meta/route.ts` — after persisting a new message, call the triage helper synchronously (cheap, single LLM call).
- **Modify**: `src/lib/messages.ts` — add `autoReplyIfEligible` helper.
- **Modify**: `src/app/dashboard/workspaces/[id]/inbox/page.tsx` — show triage badges (intent, urgency), and pre-fill the reply box with the suggested reply when present.
- **Create**: `src/app/api/workspaces/messages/triage-rules/route.ts` — per-workspace settings (auto-reply on/off, confidence threshold, FAQ list).

## DeepSeek prompt

> You are working on Ember Social. Read `docs/roadmap/_context.md` first.
>
> **Task C1**: Add AI triage to the Inbox. Classify intent/sentiment/urgency, auto-reply when safe, suggest replies otherwise.
>
> **Step 1 — Migration 009.** Add triage columns to `messages`:
>
> ```sql
> alter table public.messages
>   add column if not exists intent text,
>   add column if not exists sentiment text,
>   add column if not exists urgency text,
>   add column if not exists confidence numeric,
>   add column if not exists suggested_reply text,
>   add column if not exists triaged_at timestamptz,
>   add column if not exists auto_replied boolean not null default false;
> ```
>
> And a new per-workspace settings table:
>
> ```sql
> create table if not exists public.workspace_inbox_settings (
>   workspace_id uuid primary key references public.workspaces(id) on delete cascade,
>   auto_reply_enabled boolean not null default false,
>   auto_reply_threshold numeric not null default 0.85,
>   auto_reply_intents text[] not null default array['hours','location','price_inquiry','availability'],
>   custom_faq jsonb,         -- e.g. [{question_pattern, answer}]
>   updated_at timestamptz default now()
> );
>
> alter table public.workspace_inbox_settings enable row level security;
> create policy "Agency admins manage inbox settings"
>   on public.workspace_inbox_settings for all
>   using (auth.role() = 'authenticated');
> ```
>
> Update `supabase/schema.sql`.
>
> **Step 2 — Triage helper.** Create `src/lib/ai/triage.ts` exporting:
>
> ```ts
> export interface TriageResult {
>   intent: 'price_inquiry' | 'availability' | 'hours' | 'location' | 'complaint'
>         | 'lead' | 'compliment' | 'spam' | 'other'
>   sentiment: 'positive' | 'neutral' | 'negative'
>   urgency: 'low' | 'medium' | 'high'
>   confidence: number      // 0..1
>   suggested_reply: string | null
>   needs_human: boolean
>   reasoning: string       // for the audit log; not shown to user by default
> }
>
> export async function triageMessage(opts: {
>   messageId: string
>   workspaceId: string
>   body: string
>   platform: 'facebook' | 'instagram'
>   kind: 'dm' | 'comment'
>   threadHistory?: { from: 'us' | 'them'; body: string }[]
> }): Promise<TriageResult>
> ```
>
> Implementation:
>
> - Pull `client_intelligence` (brand voice, do_not_post, key_messages, custom_faq from `workspace_inbox_settings`).
> - Pull recent thread history (last 5 messages in this thread) for context.
> - Single `gpt-4o-mini` call with a JSON-schema-constrained prompt:
>
>   ```
>   You are a triage assistant for a brand's social inbox. Classify the latest message and draft a reply IF it would be safe to auto-send.
>
>   "Safe to auto-send" means:
>     - Intent is unambiguous (price, hours, location, availability, simple compliment)
>     - The reply only states facts already given to you OR asks a clarifying question
>     - No commitment, no commercial offer, no apology for unverified incidents
>     - confidence >= 0.85
>
>   For complaints, leads, or anything ambiguous: needs_human = true, suggested_reply = a draft for the human to edit.
>   For spam: intent='spam', needs_human=false, suggested_reply=null.
>
>   Output STRICT JSON matching the TriageResult schema.
>   ```
>
> - Apply the workspace's `do_not_post` rules in the prompt.
> - Default tone = brand voice; never make up facts. The known facts are: hours, phone, email, location, key_messages — pass these explicitly.
>
> **Step 3 — Hook into the webhook.** In `src/app/api/webhooks/meta/route.ts`, after persisting an inbound message (kind in dm/comment, is_from_us=false), call `triageMessage` and update the row with the result.
>
> Don't block the webhook on triage — fire it but don't `await` it for the response. Use a tiny in-process queue (just `Promise.allSettled` after returning 200 is fine for v1; if traffic grows, move to Inngest / QStash later).
>
> Hmm — actually the route handler will be killed once it returns. So you need to either: (a) await triage before returning 200 (slow but correct), or (b) push the message id onto a `pending_triage` queue table and process it from a follow-up cron. Pick (a) for v1 — single LLM call is ~1s and Meta tolerates 20s. Note the trade-off in your response.
>
> **Step 4 — Auto-reply.** After triage, in the same webhook handler:
>
> - Load `workspace_inbox_settings` for the workspace.
> - If `auto_reply_enabled` AND `triage.intent` is in `auto_reply_intents` AND `triage.confidence >= auto_reply_threshold` AND `triage.needs_human === false` AND `triage.suggested_reply` is non-empty:
>   - Call the appropriate `replyTo*` from `src/lib/messages.ts`.
>   - Insert a corresponding outbound `messages` row with `is_from_us=true, replied_at=now(), auto_replied=true`.
>   - Update the inbound row with `auto_replied=true`.
> - Respect the **24-hour rule** for DMs — if the inbound message is the start of a new conversation, fine; if it's been >24h since the user's last inbound, skip auto-reply (the platform helper should already throw — catch and log, leave for human).
> - Honour Meta's `RESPONSE` tag — auto-replies to DMs use the standard messaging window. Don't use `MESSAGE_TAG`s without explicit user opt-in (compliance risk).
>
> **Step 5 — UI updates.** In `src/app/dashboard/workspaces/[id]/inbox/page.tsx`:
>
> - Show triage badges on each thread (intent, urgency, sentiment colour).
> - When a thread is opened: if the latest inbound message has a `suggested_reply` and was not auto-replied, pre-fill the reply box with it. Add a "Regenerate suggestion" button.
> - Surface auto-replied messages clearly in the thread view (e.g. "Auto-replied" pill on outbound).
>
> Also create `src/app/dashboard/workspaces/[id]/inbox/settings/page.tsx`:
>
> - Toggles for `auto_reply_enabled`.
> - Slider for `auto_reply_threshold` (0.5 – 1.0).
> - Multi-select for `auto_reply_intents`.
> - Custom FAQ editor (key/value pairs).
> - All saved to `workspace_inbox_settings` via a new `/api/workspaces/messages/triage-rules` route.
>
> **Constraints**:
>
> - Auto-reply is **off by default**. Users must opt in per workspace.
> - Never auto-reply on `complaint`, `lead`, `negative` sentiment, or `urgency='high'` regardless of intent.
> - Don't auto-DM someone we have no prior conversation with — only reply to incoming.
> - Log every auto-reply with `auto_replied=true` so users can audit. Show a "Disable auto-reply" undo banner in the inbox after the first auto-reply each day.
> - LLM cost: ~1¢/triage at gpt-4o-mini rates. Spam-filter inbound on `from_external_id` known spammer list (defer; add a TODO).

## Acceptance criteria

- [ ] Migration 009 added.
- [ ] Webhook triages new messages within ~1s, persists `intent/sentiment/urgency/confidence/suggested_reply`.
- [ ] With auto-reply enabled and a high-confidence FAQ-class message, a real reply lands on FB/IG.
- [ ] With auto-reply off, suggested replies pre-fill the human reply box; nothing sent without click.
- [ ] Settings page lets the user toggle auto-reply on/off, set threshold, set intents.
- [ ] Inbox UI shows triage badges and auto-replied indicators.
- [ ] No new npm deps. No regressions to A4's reply flow.
- [ ] Lint + typecheck clean.

## Out of scope

- Multi-language triage — defer; assume English/SA-English for v1.
- Lead-score handoff to a CRM — defer.
- Spam classifier — flagged as TODO; v1 routes spam-suspected messages to human.
- Voice/audio message transcription — defer.
