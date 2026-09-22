# Ember OS — Slice 2: monthly report + suggestions (design)

**Date:** 2026-09-22 · **Status:** approved by Alec (three delivery decisions answered 2026-09-22) · **Builds on:** `2026-09-16-ember-os-spine-design.md` (Spine v1, live since 2026-09-22)

## 1. Why

Credits alone are a bill. A monthly report that says *here is what we did, here is what we noticed about your business, here is what I would do next* is what makes a retainer worth renewing — and it is the half of Alec's original brief ("reporting to them, asking for project ideas from them or give suggestions as we learn their business") that the Spine does not yet cover.

## 2. Decisions locked

| Decision | Value |
|---|---|
| Delivery | **Link page + email summary.** Email carries the headline numbers and one link; the full report lives on `/c/<token>`. No PDF |
| Scope | **New retainer clients only.** Everest's existing monthly PDF is not touched and not folded in |
| Suggestions | **2–3 priced ideas, "reply to discuss".** No one-click commit button — nobody spends credits by accident |
| Approval | Mode A as everywhere else: the report is an **outbox item** Alec approves before it sends |
| Period | The **previous calendar month**. Generated on the 1st, so the report covers the month that just ended |
| Snapshot | The report body is **frozen at generation time** in `reports.body`, so an approved report does not change under Alec when data moves |
| Check-in | **Derived, not stored.** Anything delivered 21–45 days before generation gets a "is it doing what you wanted?" line. No new columns |
| Triage latency | `submit_request` stops awaiting triage — it runs in `after()` so the client's Claude gets an instant answer |
| Env vars | **None new** |

## 3. Scope

**In:** `reports` table · report facts builder · AI suggestions with the untrusted envelope · report outbox kind + link kind · link page rendering · Resend email · monthly cron · manual "generate now" button · triage moved off the request path · tests.

**Not in:** PDF output · Everest/GA/Meta metrics · site health probe (its own slice) · one-click "I want this" on suggestions · mode-B auto-send · quote generator (slice 3).

## 4. What a report contains

Five sections, each omitted when empty rather than shown blank:

1. **What we did** — requests delivered in the period: title, size, credits. Plus credits used in the period and the balance carried.
2. **In flight** — active and queued requests with queue position and `due_by`.
3. **Waiting on you** — open questions (`status = 'sent'`) and estimates awaiting a decision (`status = 'estimated'`).
4. **What we'd do next** — 2–3 AI suggestions, each with a title, why it matters for *this* business, a size and its credit price. Drawn from the client record, the catalogue for their vertical, and what has already been delivered (so it never re-proposes something they have).
5. **A quick check** — one line per thing delivered 21–45 days ago: is it doing what you expected?

A client with nothing delivered still gets a report (sections 2–4). Clients that are `paused` or `archived`, or have no plan, are skipped entirely.

## 5. Data model — `supabase/migrations/0004_reports.sql`

```
reports(
  id uuid pk, created_at, updated_at (trigger),
  client_id uuid → clients on delete cascade,
  period text not null,                          -- 'YYYY-MM'
  status text not null default 'draft'           -- draft | approved | sent
    check (status in ('draft','approved','sent')),
  body jsonb not null,                           -- the frozen report
  outbox_id uuid,                                -- the queue item Alec decides
  link_token_id uuid,                            -- minted on approval
  approved_at timestamptz, sent_at timestamptz,
  unique (client_id, period)                     -- re-running the cron is a no-op
)
```

Plus two constraint widenings: `outbox.kind` and `link_tokens.kind` both gain `'report'`. RLS on, no policies, service role only — as with every other table.

The unique constraint is what makes the cron idempotent; a second run in the same month updates the draft in place and never creates a second queue item.

## 6. Code layout

| File | Responsibility |
|---|---|
| `src/lib/reports/period.ts` | `previousPeriod`, `periodBounds`, `periodLabel` — pure, tested |
| `src/lib/reports/facts.ts` | `loadReportInputs` (DB reads) + `composeFacts` (pure aggregation, tested) |
| `src/lib/ai/suggest.ts` | `SuggestionsSchema`, `buildSuggestPrompt`, `runSuggest` — client text delimited as data |
| `src/lib/reports/build.ts` | `buildReport(db, clientId, period)` → upsert `reports` row + queue one `report` outbox item |
| `src/lib/reports/summary.ts` | `emailSummary(body)` → the headline lines for the email — pure, tested |
| `src/lib/spine/outbox.ts` | a `report` branch in `decideOutbox`: mark approved, mint the link, send the email |
| `src/lib/spine/links.ts` | `linkPayload` gains `{ kind: "report" }` |
| `src/app/c/[token]/page.tsx` | renders a report |
| `src/app/api/cron/monthly-report/route.ts` | 1st of the month, all eligible clients |
| `src/app/api/admin/spine/reports/route.ts` | `POST { client_id, period? }` — generate now |
| `src/app/admin/clients/[id]/GenerateReportButton.tsx` | the manual trigger, per the house rule that every generator ships a cron *and* a button |

## 7. Suggestions prompt

Fixed instruction set; everything client-derived is delimited and labelled as data, exactly as triage does it. The model gets: the client record summary, the catalogue for their vertical (id, name, size), the titles of what has already been delivered, and the facts of the period. It returns JSON only: `{ suggestions: [{ title, why, size, catalogue_item_id? }] }`, 2–3 items, validated with zod, one retry, then the report generates without section 4 rather than failing.

Credits are computed from `plan.credit_sizes[size]` in our code — never taken from the model.

## 8. Triage off the request path

`submit_request`, the admin create-request route and the link answer route currently `await triageAndQueue`, which is why a 25s DeepSeek call becomes a 30s HTTP wait and, often enough, a `triage_timeout`. All three switch to `after()` from `next/server`: the response goes out immediately and triage finishes in the same invocation afterwards. `maxDuration = 60` stays for the background work.

## 9. Testing

- **Vitest:** period arithmetic (month boundaries, year rollover) · `composeFacts` on fixture rows (delivered/in-flight/waiting/check-in windows, empty client) · `emailSummary` wording and number formatting · suggestions schema (valid, too many, missing fields) · `linkKindFor('report')` and `shadowB('report')`.
- **Gates per chunk:** `tsc --noEmit`, `vitest run`, `npm run test:mcp`, and `next build` at the end (never while `next dev` is running).
- **Live:** generate a real report for Tindlovu against live Supabase + DeepSeek, approve it in `/admin/queue`, confirm the email arrives with the right numbers and the link page renders; re-run the generator to prove idempotence; check the cron endpoint's auth.

## 10. Out of scope reminders

Slice 3 is the quote/proposal generator. Email-inbox parsing, WhatsApp, the asset health probe, billing and mode-B sending remain unbuilt.
