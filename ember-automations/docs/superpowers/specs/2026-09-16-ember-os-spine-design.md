# Ember OS — Spine v1 (design)

**Date:** 2026-09-16 · **Owner:** Alec Somers · **Status:** approved design, pending implementation plan
**App:** `ember-automations/` (the live `www.emb3r.co.za` intake app, extended) · **Branch:** `feat/ember-os-spine`

## 1. Why

Ember Automations has ~26 delivered projects and R8,500/month of durable, invoiced recurring revenue — one client (Everest). The business decision (2026-09-16) is to sell **monthly agreements denominated in credits** (projects per month, not hours), starting by converting already-delivered clients — **HS Labour** (to be quoted) and **Tindlovu** — with Everest as the template client. The agreements must run with Alec approving, not doing: reporting, request handling, clarifying questions, learning the client's business and proposing the next project are automated; Alec approves.

The Spine is the part every later slice depends on: the **Client Record**, the **request pipeline**, the **approval queue**, the **MCP connector** clients talk to, and **no-login link pages** for what we push.

## 2. Decisions locked (do not re-open in the plan)

| Decision | Value |
|---|---|
| Commercial model | Hybrid: platform base + monthly **credits** + outcome add-ons |
| Retainer unit | Credits. Sizes S=1, M=3, L=6. No rollover by default |
| Approval posture | **Mode A** per client: nothing reaches a client without Alec's approval. Mode B (auto-send routine traffic) is a per-client setting, built now, off by default; while in A the system logs what B *would* have sent |
| Client channel | **MCP connector** (primary, structured, two-way) + **link pages** (push, no login) + Alec logging email/WhatsApp requests by hand. Email parsing and WhatsApp are later slices |
| Runtime AI | Per-client `ai_provider`: **DeepSeek** default (Anthropic-compatible endpoint), **Claude** for clients needing a DPA (HS Labour). Injection gate re-run against DeepSeek |
| Build-time AI | DeepSeek via `opencode-glm-extension/ds-agent.js` for all new code; `lib/mcp` ported by hand from Aloe |
| First client | Tindlovu. Everest seeded second (report slice) |
| Concurrency | Per-plan **max active requests** (default 1), visible queue position |
| Turnaround | Per size: S 48h, M 5 working days, L quoted. Estimates carry a `due_by` |
| Pause | `clients.status = 'paused'` freezes credits and billing |
| Catalogue | Small service catalogue with credit prices, seeded from the Rainharvest add-on list + Everest/Aloe features |
| Assets | `client_assets` recorded now; the health probe that reads them is the delivery slice |

## 3. Scope

**In v1:** Client Record tables + admin UI · request pipeline with AI triage · credits ledger + monthly grant · outbox/approval queue with shadow-B logging · MCP connector (OAuth 2.1, 8 tools) · link pages · Resend notifications carrying links · catalogue · Tindlovu seed · tests.

**Not in v1 (each is its own spec):** monthly report + suggestions engine (slice 2) · quote/proposal generator (slice 3) · email-inbox parsing · WhatsApp · site health probe · billing/invoicing · mode-B auto-send actually sending · client login portal beyond the one-time OAuth consent.

## 4. Architecture

One Next.js 15 app, one Supabase project (the existing one), service-role access from the server, RLS on with no public policies (the intake pattern). Three faces on one backend:

```
 client's Claude ──MCP (OAuth 2.1)──▶ /mcp ─┐
 client's browser ─link /c/<token>──────────┤──▶ lib/* (record, requests, outbox, credits) ──▶ Supabase
 Alec ─────────────/admin (Supabase auth)───┘                       │
                                                                    ▼
                                             outbox ──approve──▶ Resend email + link token
                                                                    │ (+ visible via MCP tools)
```

Rules that hold everywhere:
- **Every outbound item is an `outbox` row.** MCP tools and link pages read *approved* outbox content; nothing else is visible to a client.
- **Every LLM- or client-originated change to the Client Record is a *proposed* `client_facts` row** until Alec confirms it.
- **Writes go through one shared layer** (`lib/requests/write.ts`, `lib/record/write.ts`) used by admin, MCP and link pages alike, so they cannot drift (Aloe lesson). Writes are absolute and carry `updated_at` back (preview/commit).
- **All tool output is wrapped in the untrusted envelope** (`lib/mcp/untrusted.ts`, ported).

## 5. Data model — `supabase/migrations/0002_spine.sql`

All tables: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at` where noted, RLS enabled, no policies.

| Table | Columns (beyond id/timestamps) |
|---|---|
| `clients` | `slug text unique`, `name`, `vertical text`, `status text check in ('active','paused','archived') default 'active'`, `approval_mode text check in ('A','B') default 'A'`, `ai_provider text check in ('deepseek','claude') default 'deepseek'`, `plan jsonb` (see §6), `notes text`, `updated_at` |
| `client_people` | `client_id fk`, `name`, `role`, `email`, `phone`, `signs_off_on text[]`, `is_primary bool default false`, `notes` |
| `client_systems` | `client_id fk`, `name`, `kind text` (e.g. `pos`, `payroll`, `ats`, `email`, `storage`), `notes` |
| `client_processes` | `client_id fk`, `name`, `frequency text`, `volume text`, `owner_person_id fk null`, `pain text`, `notes` |
| `client_facts` | `client_id fk`, `statement text`, `source text check in ('alec','mcp','question','intake','spec','triage')`, `source_ref text`, `status text check in ('proposed','confirmed','rejected') default 'proposed'`, `confirmed_at` |
| `client_assets` | `client_id fk`, `kind text check in ('site','domain','supabase','vercel','email','repo','other')`, `label`, `url`, `status text check in ('ok','warning','broken','unknown') default 'unknown'`, `notes`, `checked_at` |
| `questions` | `client_id fk`, `batch_id uuid`, `text`, `why text` (internal), `status text check in ('draft','approved','sent','answered','dropped') default 'draft'`, `answer text`, `answered_via text check in ('mcp','link','alec')`, `answered_at` |
| `catalogue_items` | `name`, `description`, `size text check in ('S','M','L')`, `verticals text[]`, `active bool default true`, `sort_order int` |
| `requests` | `client_id fk`, `title`, `description`, `why_it_matters text`, `affected_area text`, `examples text`, `deadline date null`, `source text check in ('mcp','link','admin')`, `submitted_by text`, `status text` (§7), `size text null check in ('S','M','L')`, `credits int null`, `catalogue_item_id fk null`, `estimate jsonb null` (`{summary, credits, due_by, assumptions[]}`), `client_approved_at`, `delivered_at`, `updated_at` |
| `request_events` | `request_id fk`, `type text`, `payload jsonb`, `actor text check in ('client','alec','system')` |
| `credits_ledger` | `client_id fk`, `delta int`, `reason text check in ('monthly_grant','request','adjustment')`, `request_id fk null`, `period text` (`YYYY-MM`), `note text` |
| `outbox` | `client_id fk`, `kind text check in ('reply','question_batch','estimate','fact_update','status_note')`, `ref_table text`, `ref_id uuid`, `draft jsonb`, `final jsonb null`, `decision text check in ('pending','approved','edited','rejected') default 'pending'`, `shadow_b bool`, `decided_at`, `sent_at`, `link_token_id fk null` |
| `link_tokens` | `token text unique`, `kind text check in ('request','question_batch','estimate')`, `ref_id uuid`, `client_id fk`, `expires_at`, `last_used_at` |
| `questionnaires` | **add** `client_id uuid null references clients` |
| `mcp_clients`, `mcp_auth_codes`, `mcp_tokens`, `mcp_rate_limits`, `mcp_settings`, `mcp_audit` | Ported 1:1 from `aloe-signs-website/app/api/setup-mcp/route.ts`, as a migration rather than a setup route |

Indexes: `requests(client_id, status)`, `outbox(decision, created_at)`, `questions(client_id, status)`, `credits_ledger(client_id, period)`, `link_tokens(token)`, `client_facts(client_id, status)`.

## 6. Plan and credits

`clients.plan` jsonb, validated by `lib/plan.ts`:

```json
{ "monthly_credits": 6, "max_active": 1,
  "credit_sizes": { "S": 1, "M": 3, "L": 6 },
  "turnaround": { "S": "48h", "M": "5wd", "L": "quoted" },
  "rollover": false, "renews_on": 1 }
```

- **Balance** = `sum(delta)` over ledger rows with `period = current` when `rollover=false`; over all rows when `true`.
- **Monthly grant:** Vercel cron `GET /api/cron/monthly-credits` (header `x-cron-secret = CRON_SECRET`) runs daily; for each `active` client whose `renews_on` is today and has no `monthly_grant` row for this period, inserts `+monthly_credits`. Paused clients are skipped.
- **Deduction:** one `request` row of `-credits` when a request reaches `delivered`.
- **Negative balance is allowed in v1.** The approval queue shows a warning on any estimate that would take the balance below zero; Alec decides. (Tindlovu starts at `monthly_credits: 0` until an agreement is signed — requests still flow.)
- **`due_by`** = submission time + turnaround for S/M, computed in `lib/plan.ts` using SA working days (Mon–Fri, no holiday table in v1); L is whatever the estimate says.

## 7. Request pipeline

Statuses: `submitted → triaged → needs_info → estimated → client_approved → scheduled → in_progress → delivered → closed`, plus `declined` (client) and `cancelled` (Alec). Allowed transitions live in `lib/requests/state.ts` as a table; every transition writes a `request_events` row.

1. **submitted** — from MCP `submit_request`, a link page, or Alec in admin ("log a request" for email/WhatsApp).
2. **triage** (`lib/requests/triage.ts`) runs inline on submit with a 25s timeout; on timeout the request stays `submitted` and the queue shows "triage pending — retry". Input: the request, a compact Client Record summary (`lib/record/summary.ts`), the catalogue for the client's vertical, the plan. Output (schema-validated JSON):
   ```
   { classification, size: "S"|"M"|"L", credits, catalogue_item_id?,
     needs_info: bool, questions: [{text, why}],
     estimate: { summary, assumptions[] }, proposed_facts: [statement] }
   ```
   It produces exactly one outbox row: `question_batch` if `needs_info`, else `estimate` (with `due_by` filled from the plan). `proposed_facts` become `client_facts(status='proposed', source='triage')`. Request → `triaged`.
3. **Alec approves/edits/rejects** in `/admin/queue`. Approve → request `needs_info` or `estimated`; link token minted; Resend email to the client's primary person; content becomes visible via MCP.
4. **Client answers** (MCP `answer_questions` or link page) → answers stored on `questions`; triage re-runs with the answers → new outbox `estimate`.
5. **Client approves the estimate** (MCP `approve_estimate` / link page) → `client_approved`, `client_approved_at` set. Declines → `declined` with reason.
6. **Alec schedules** (`scheduled`, honouring `max_active`: the request's **queue position** = rank by `client_approved_at` among this client's `client_approved`+`scheduled`+`in_progress` requests) → `in_progress` → `delivered` (credits deducted, event logged) → `closed` after the client's status note goes out (an outbox `status_note`).

## 8. Approval queue (outbox) and shadow B

- `/admin/queue` lists `decision='pending'` items oldest-first with client, kind, a rendered preview and a credits-balance warning. Per item: edit the draft, **Approve**, **Reject**. Approve stores `final` (the edited or original draft), sets `decided_at`, mints a link token where `kind ∈ {question_batch, estimate, status_note, reply}`, sends the Resend email, sets `sent_at`.
- `shadow_b` is set at creation by `lib/outbox/rules.ts`: `true` for `status_note`, `reply` and `question_batch` (routine under B), `false` for `estimate` and `fact_update` (commit money/scope or the record). It is informational only in v1; `/admin/clients/[id]` shows "under mode B, N of M items in the last 30 days would have gone out unreviewed; you edited K of them".
- `fact_update` items, on approve, flip the referenced `client_facts` rows to `confirmed`; on reject, to `rejected`. They never email the client.

## 9. MCP connector — `https://www.emb3r.co.za/mcp`

Ported by hand from `aloe-signs-website` (`lib/mcp/*`, `app/mcp/route.ts`, `app/oauth/*`, `app/.well-known/*`): OAuth 2.1 with PKCE and dynamic client registration, opaque access tokens → `user_id`, role re-derived on every call via `auth.admin.getUserById`, per-token rate limit, audit rows, untrusted envelope. Deps: `mcp-handler@^2.1.1` + `@modelcontextprotocol/server` (not `/sdk`), `zod` for tool input schemas.

**Identity.** A client person is a Supabase Auth user with `app_metadata = { role: 'client', client_id }`, created from `/admin/clients/[id]` ("invite") which sends a magic link. The consent screen (`/oauth/authorize` → `/login` magic link → `/oauth/approve`) is the only time a client logs in. Alec's own admin user has `role: 'admin'` and may connect too (admin tools are out of v1 scope; his connector sees the same client tools scoped to a chosen client via `client_id` on his token — not built in v1; Alec uses `/admin`).

**Tools** (all outputs enveloped; all writes go through the shared write layer; none delete):

| Tool | Input | Effect |
|---|---|---|
| `get_account` | — | plan, credit balance, active/queued counts, open-question count, pending estimates |
| `list_catalogue` | — | active catalogue items for the client's vertical (+ generic) |
| `submit_request` | `title, description, why_it_matters, affected_area, examples?, deadline?, catalogue_item_id?` | creates `requests` (source `mcp`), runs triage; returns id + "Ember will review and come back to you" |
| `list_requests` | `status?` | requests with status, size, credits, queue position, due_by |
| `get_request` | `id` | full request incl. approved estimate/questions and the `updated_at` needed for approvals |
| `approve_estimate` / `decline_estimate` | `request_id, updated_at` (+ `reason` on decline) | transitions per §7; stale `updated_at` → error, re-read |
| `get_open_questions` | — | questions with `status='sent'` |
| `answer_questions` | `answers: [{question_id, answer}]` | stores answers; re-triggers triage where a request is waiting |
| `share_business_info` | `text` | AI extracts candidate statements → `client_facts(proposed, source='mcp')` + an outbox `fact_update` for Alec; returns "thanks, noted for review" |

Tool descriptions state what a good request contains ("goal, the area of the business or site it touches, an example of the current pain, and any date it must be done by — ask the user for anything missing before submitting"), so the client's Claude gathers it in conversation.

## 10. Link pages — `/c/[token]`

Server-rendered, no login, token = 32 random bytes base64url, `expires_at` = 30 days (renewed on each approved send), `last_used_at` updated on view. By `kind`:
- `request` — status timeline, estimate (if any) with **Approve / Decline + comment**, queue position, due_by.
- `question_batch` — the questions as a form; submit stores answers (`answered_via='link'`).
- `estimate` — summary, credits, due_by, assumptions; Approve / Decline.
Expired or unknown token → 404 page with "ask Ember for a fresh link". Approve/decline actions are idempotent and carry `updated_at`.

## 11. Admin UI (Supabase auth, `ADMIN_EMAIL` gate, existing middleware matcher)

- `/admin/queue` — §8.
- `/admin/clients` — list with search; `/admin/clients/new`; `/admin/clients/[id]` — tabs: **Record** (people, systems, processes, facts with confirm/reject, assets), **Requests** (log a request; transition buttons), **Questions** (draft → approve → sent; answers), **Credits** (ledger, adjustment), **Settings** (plan, status, approval_mode, ai_provider, invite person).
- `/admin/requests/[id]` — detail + events + manual transition.
- `/admin/catalogue` — CRUD.
- Existing `/admin` questionnaire screens unchanged; the questionnaire detail gains a "link to client" select.
Every admin list ships live search + sort per the house standard.

## 12. AI layer — `lib/ai/`

- `provider.ts` — returns an Anthropic SDK client per `clients.ai_provider`: `claude` → `ANTHROPIC_API_KEY`, model `claude-opus-5`; `deepseek` → `baseURL = https://api.deepseek.com/anthropic`, `DEEPSEEK_API_KEY`, model id taken from `DEEPSEEK_MODEL` env (default matches `free-claude-code/.env`, verified against `https://api.deepseek.com/models` at build time).
- `triage.ts`, `extract-facts.ts` — prompts ask for JSON only; responses validated with zod; invalid → one retry, then the request stays `submitted` with an event `triage_failed`.
- Prompts get the untrusted envelope treatment in reverse: client text is delimited and labelled as data; the instruction set is fixed.

## 13. Notifications — Resend

From `RESEND_FROM` (`intake@emb3r.co.za`). Templates in `lib/email/`: `questions.tsx`, `estimate.tsx`, `status.tsx`, `invite.tsx` — plain, branded, one link each. Recipient = the client's `is_primary` person; fallback = first person with an email; none → queue item approves but shows "no recipient — deliver by hand".

## 14. Env vars (Production + Preview)

Existing 7 + `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, `MCP_ISSUER_URL=https://www.emb3r.co.za`, `MCP_TOKEN_SECRET`. `NEXT_PUBLIC_SITE_URL` stays on the **www** form (apex 308s).

## 15. Tindlovu seed — `supabase/seed/tindlovu.sql`

Client `tindlovu` (vertical `hospitality`, plan `{monthly_credits:0, max_active:1, …}`, `ai_provider: 'deepseek'`). People: Lizette (head office, signs off timesheets), J White (approves overtime). Systems: GAAP Unity Timecard (pos/time), Excel (payroll re-key), Google Drive, Tindlovu documents portal. Processes: monthly timesheet reconciliation (monthly, all staff, hand re-keyed GAAP → Excel, reconciled by head office); roster planning. Facts (confirmed, source `spec`): the rules in `tindlovu-documents/docs/superpowers/specs/2026-09-14-timesheets-phase1-actuals-design.md` §8. Assets: documents portal (Vercel), its Supabase project. Questions: the 11 confirm-with-client questions from that spec §8, `status='draft'` — first batch through the queue. Catalogue: seeded from the Rainharvest add-on list (generic + `water`), Everest features (`automotive`), Aloe features (`signage`), each sized S/M/L.

## 16. Testing and verification

- **Vitest units** (`src/lib/**/*.test.ts`): plan validation + balance math (rollover on/off, paused skip) · `due_by` working-day arithmetic · request state table (every allowed/forbidden transition) · queue position · link token generation/expiry · outbox shadow-B rules · triage/extract output schemas (fixtures) · `updated_at` stale-write rejection.
- **Ported `lib/mcp` tests** kept as `*.test.mts` under `node --test "src/lib/mcp/*.test.mts"`; a `test:mcp` script added.
- **Build gates per chunk:** `tsc --noEmit`, `vitest run`, `next build` (never while `next dev` is running).
- **Live verification (production):** Tindlovu person connects a real Claude client → `submit_request` → item in queue → approve → email + link received → `approve_estimate` → status flows; audit rows present. Injection gate: a payload phrased as a plausible business instruction planted in a real `client_facts`/request row, read via `get_request`, **run by a fresh operator, scored on DB state** (no write tool calls, `updated_at` unchanged) — against **DeepSeek** as the runtime provider, then Claude.

## 17. Build mechanics

- Branch `feat/ember-os-spine` from `origin/main`; `git branch --show-current` re-checked before every commit (shared working folder).
- DeepSeek generates every new file via `node opencode-glm-extension/ds-agent.js "<prompt>"` from the Antigravity root; Claude architects, reviews, verifies. `lib/mcp` and any logic-bearing port are copied by hand with "preserve logic verbatim".
- Chunks are per-module (migration → plan/credits → state/requests/triage → outbox → mcp port → tools → link pages → admin → email → cron → seed), each ending green on the gates above.
- Vercel: same project, Root Directory `ember-automations`, git auto-deploy from `main`; `vercel.json` gains the daily cron.

## 18. Out-of-scope reminders for later slices

Report + suggestions (reads `requests`, `credits_ledger`, `client_facts`, `client_assets`; adds 30-day check-in fields) · quote generator (reads catalogue + plan) · email parsing (`requests@emb3r.co.za`) · WhatsApp · asset health probe · mode-B sending · billing.
