Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 + TypeScript (server-side). Build workflow email notifications. AVAILABLE: `import { sendMail } from "@/lib/email";` (sendMail({ to: string; subject: string; html: string }): Promise<void>). `import { listCompRequestRows } from "@/lib/comps";` (CompRequestRow has id, guestName, guestSurname, performance, category, requester, totalSeats, houseSeats, notes, status, seatNumbers, ticketReference). Env: APP_BASE_URL, NOTIFY_APPROVERS, NOTIFY_BOXOFFICE, CRON_SECRET, AIRTABLE_API_KEY, AIRTABLE_BASE_ID.

Airtable tables/fields: "Comp Requests" (fields "Guest Name","Guest Surname","Guest Email","House Seats","Notes","Total Seats Requested","Ticket Status","Seat Numbers","Ticket Reference", links "Performance","Category","Requester" = arrays of record ids); "Performances" (primary "Production/Event", optional "Performance Label"); "Categories" (primary "Category Name"); "Users" (primary "Name","Email","Role","Can Approve" checkbox,"Active" checkbox); "Requesters" (primary "Name","Email").

BUILD:

===FILE: lib/notifications.ts===
- Self-contained Airtable read helper (lazy env getter; encode each path segment before "?"; Bearer auth; throw on non-ok). `async function aGet(pathAndQuery): Promise<any>` returns parsed JSON.
- `function appUrl(path: string): string` → `${process.env.APP_BASE_URL || "http://localhost:3000"}${path}`.
- `function escapeHtml(s)` basic escaping for interpolated values.
- `async function loadContext(compRequestId: string)` → GET `Comp Requests/${compRequestId}`; from fields read guestName, guestSurname, guestEmail, houseSeats(!!), notes, seats(Total Seats Requested), status, seatNumbers, ticketReference. Resolve performanceName via GET `Performances/${f.Performance?.[0]}` (Performance Label || Production/Event || "the performance") — only if a linked id exists. Resolve categoryName via `Categories/${f.Category?.[0]}` ("Category Name"). Resolve requester via `Requesters/${f.Requester?.[0]}` → { requesterName, requesterEmail }. Return one object with all of these (guard every linked lookup; default names to "" and emails to undefined).
- `async function getApproverEmails(): Promise<string[]>` → GET `Users?filterByFormula=${encodeURIComponent("AND({Can Approve}=1,{Active}=1)")}`; map fields.Email (filter truthy). If empty, fall back to (process.env.NOTIFY_APPROVERS||"").split(",").map(trim).filter(Boolean).
- `async function getBoxOfficeEmails(): Promise<string[]>` → Users filterByFormula AND({Role}='Box Office',{Active}=1) → Emails; fallback NOTIFY_BOXOFFICE similarly.
- A small `async function send(to: string|undefined, subject: string, html: string)` that no-ops if `to` is falsy, else awaits sendMail.
- EXPORTED notify functions — EACH must wrap its whole body in try/catch and console.error on failure (NEVER throw, so the workflow action is never broken):
  - `notifySubmitted(compRequestId: string): Promise<void>` — load ctx; build a details HTML block (requester, guest name+surname, performance, category, guest email, house seats yes/no, seats, notes, current status). Email EACH approver (loop getApproverEmails) subject `New comp request to approve — ${guest} (${performance})`, body = details + a paragraph link to ${appUrl("/approvals")}. ALSO send the requester a short confirmation (subject `We’ve received your request — ${performance}`, body acknowledging it and noting they’ll be updated).
  - `notifyApproved(compRequestId): Promise<void>` — load ctx; email EACH box-office address subject `Ready to issue — ${guest} (${performance})` with details + link to ${appUrl("/box-office")}. ALSO email requester subject `Your comp request was approved — ${performance}`.
  - `notifyDeclined(compRequestId, reason: string): Promise<void>` — email requester subject `Update on your comp request — ${performance}`, body says it could not be fulfilled, includes the reason.
  - `notifyIssued(compRequestId): Promise<void>` — email requester subject `Tickets issued — ${performance}`, body includes seat numbers and ticket reference and the guest name.
  - `notifyMissingData(items: { id: string; guest: string; performance: string; seatNumbers: string; ticketReference: string }[]): Promise<void>` — if items empty, return. Recipients = unique union of getApproverEmails + getBoxOfficeEmails. Email each, subject `Action needed — issued comps missing details`, body = an HTML list of items showing guest, performance, and which field(s) are blank.
- Keep emails clean and branded-lite (simple HTML: a heading, a definition list/table, a mint or blue button-style link). No external templates.

app/api/notifications/missing-data/route.ts — `export const dynamic = "force-dynamic";` `export async function GET(req: Request)`:
- Authorise: require `Authorization` header === `Bearer ${process.env.CRON_SECRET}` (and CRON_SECRET set); else 401 JSON.
- const rows = await listCompRequestRows(["ISSUED"]); const missing = rows.filter(r => !r.seatNumbers || !r.ticketReference); map to { id, guest: `${r.guestName} ${r.guestSurname}`, performance: r.performance, seatNumbers: r.seatNumbers, ticketReference: r.ticketReference }; await notifyMissingData(missing); return NextResponse.json({ ok:true, count: missing.length }). Wrap in try/catch → 500. `import { NextResponse } from "next/server";` and import listCompRequestRows + notifyMissingData.

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
