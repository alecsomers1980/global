Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 App Router + TypeScript. Build the Quicket sync + webhook endpoints. AVAILABLE IMPORTS (exist):
- from "@/lib/quicket-sync": syncPerformancesFromQuicket(eventId: string|number, season: string): Promise<{created:number;updated:number;total:number}>; recordWebhookSale(payload: any): Promise<{recorded:number}>
- from "@/lib/session": getStaffFromRequest(req: Request): StaffSession | null
- `import { NextResponse } from "next/server";`
Env: QUICKET_EVENT_ID, CURRENT_SEASON (default "2026"), CRON_SECRET, QUICKET_WEBHOOK_SECRET, APP_BASE_URL.

BUILD:

===FILE: app/api/quicket/sync/route.ts===
`export const dynamic = "force-dynamic";` and `export async function GET(req: Request)` (GET so Vercel Cron can call it).
- Authorise: allow if the Authorization header equals `Bearer ${process.env.CRON_SECRET}` (and CRON_SECRET is set); OR if getStaffFromRequest(req)?.role === "Admin". Otherwise return 401 JSON.
- Read eventId = process.env.QUICKET_EVENT_ID; if missing → 400 JSON "QUICKET_EVENT_ID not configured".
- const season = process.env.CURRENT_SEASON || "2026".
- try: const summary = await syncPerformancesFromQuicket(eventId, season); return NextResponse.json({ ok:true, ...summary }); catch e: return NextResponse.json({ ok:false, error: e.message }, { status: 500 }).
===END===

app/api/quicket/webhook/route.ts — `export async function POST(req: Request)`.
- Read the URL token query param; if it does not equal process.env.QUICKET_WEBHOOK_SECRET (or secret unset) → return NextResponse.json({ ok:false }, { status: 401 }).
- Parse JSON body (guard against parse errors). Call recordWebhookSale(payload).
- Always return HTTP 200 on processed requests (webhooks should get a 2xx): NextResponse.json({ ok:true, recorded }). If recordWebhookSale throws, console.error and still return 200 with { ok:false } (so Quicket does not retry-storm). Add a comment that Quicket webhooks are not cryptographically signed, so the shared `?token=` is the guard.
- `export const dynamic = "force-dynamic";`

vercel.json — a minimal config with a daily cron calling the sync endpoint:
{ "crons": [ { "path": "/api/quicket/sync", "schedule": "0 3 * * *" } ] }
(Add a top-level comment is not valid JSON — output pure JSON only.)

QUICKET.md — a concise integration note (Markdown) covering:
- Required env vars: QUICKET_API_KEY, QUICKET_USER_TOKEN, QUICKET_EVENT_ID, CRON_SECRET, QUICKET_WEBHOOK_SECRET (all on Maynardville-owned accounts).
- Performances sync: the daily Vercel cron (03:00 UTC) GETs /api/quicket/sync (authorised via CRON_SECRET bearer); it upserts Performances from the Quicket event's schedules and never overwrites manual fields (Capacity, Active, Performance Type). Can also be run manually by an Admin.
- Webhook: in Quicket go to your event → Settings → Integrations → Webhooks, set the "Checkout completed" listening URL to `https://<APP_BASE_URL>/api/quicket/webhook?token=<QUICKET_WEBHOOK_SECRET>`. Each completed purchase appends rows to the Quicket Sales table.
- Known limitations: sold-counts accumulate from webhooks (the documented event object only exposes a soldOut boolean, not counts); per-performance matching uses Quicket event id + date; full guest-list reconciliation is a Phase-1 follow-up once Quicket confirms the guest-list endpoint + rate limits.

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
