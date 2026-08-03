Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 + TypeScript (server-side libs). Build the Quicket integration data layer. Use lazy env reads (a getter that throws only when called, NOT at module load), Node global fetch, no dependencies.

VERIFIED QUICKET API FACTS:
- Base URL: https://api.quicket.co.za/api
- Auth: `api_key` is passed as a QUERY-STRING param (from process.env.QUICKET_API_KEY). A `usertoken` HTTP header (process.env.QUICKET_USER_TOKEN) is required only for private resources (not needed for GET event).
- `GET /api/Events/{id}?api_key=KEY` returns an event object: { id, name, description, startDate, endDate, venue:{name,...}, tickets:[{id,name,price,soldOut,salesStart,salesEnd,donation,vendorTicket}], schedules:[{id,name,startDate,endDate}] }. `schedules[]` are the individual performance dates. A single-date event may have an empty schedules array.

AIRTABLE FACTS (single Maynardville-owned base; env AIRTABLE_API_KEY + AIRTABLE_BASE_ID):
- REST base https://api.airtable.com/v0/${BASE_ID}; Authorization: Bearer ${KEY}. Table names contain spaces, so URL-encode each path segment.
- "Performances" fields: "Production/Event", "Date" (ISO date), "Time" (text e.g. "19:30"), "Venue", "Capacity" (number — MANUAL, never overwrite), "Season" (single select), "Quicket Event ID" (number), "Quicket Schedule ID" (number), "Performance Type" (single select; default "Public"), "Active" (checkbox).
- "Quicket Sales" fields: "Performance" (link array), "Ticket Type Name", "Price" (number), "Quantity Sold" (number), "Synced At" (dateTime ISO).

BUILD:

===FILE: lib/quicket.ts===
- `function getQuicketEnv()` → reads QUICKET_API_KEY (required) and QUICKET_USER_TOKEN (optional); throws a clear error if api key missing; returns { apiKey, userToken, base:"https://api.quicket.co.za/api" }.
- Types: QuicketTicketType { id:number; name:string; price:number; soldOut:boolean }; QuicketSchedule { id:number; name:string; startDate:string; endDate:string }; QuicketEvent { id:number; name:string; startDate:string; endDate:string; venue?:{name?:string}; tickets:QuicketTicketType[]; schedules:QuicketSchedule[] }.
- `async function getEvent(eventId: string | number): Promise<QuicketEvent>` → GET `${base}/Events/${eventId}?api_key=${encodeURIComponent(apiKey)}`; throw on non-ok with body text; return parsed JSON coerced to QuicketEvent (default tickets/schedules to [] if absent). Add a comment that the guest-list endpoint is intentionally NOT implemented yet (path to be confirmed in Phase 1).

lib/quicket-sync.ts — writes Quicket data into Airtable. Self-contained Airtable helper (do NOT import lib/airtable.ts or lib/comps.ts).
- A `getAirtableEnv()` + `aFetch(pathAndQuery, init?)` helper: encode each path segment of the part before "?", leave query string intact; Bearer auth; throw on non-ok with body.
- `function splitDateTime(iso: string): { date: string; time: string }` → from an ISO/Quicket datetime ("2026-02-18 19:30" or ISO), return { date: "YYYY-MM-DD", time: "HH:mm" } (best-effort string parsing; if no time, time "").
- `async function syncPerformancesFromQuicket(eventId: string|number, season: string): Promise<{created:number; updated:number; total:number}>`:
  1. import getEvent from "./quicket"; const ev = await getEvent(eventId).
  2. Build a list of "performance sources": if ev.schedules.length → each schedule {scheduleId:s.id, name:s.name||ev.name, start:s.startDate}; else a single source {scheduleId:0, name:ev.name, start:ev.startDate}.
  3. For each source: GET `Performances?filterByFormula=` encodeURIComponent(`{Quicket Schedule ID}=${scheduleId}`). If a record exists → PATCH only "Date","Time","Quicket Event ID","Quicket Schedule ID" (and set "Season" only if empty) — do NOT touch Capacity/Active/Performance Type. Else POST create with "Production/Event":name, "Date","Time" (from splitDateTime(start)), "Venue": ev.venue?.name || "", "Season":season, "Quicket Event ID":Number(ev.id), "Quicket Schedule ID":scheduleId, "Performance Type":"Public", "Active":true.
  4. Tally created/updated; return summary.
- `async function recordWebhookSale(payload: any): Promise<{recorded:number}>`:
  - Only act if payload.action === "checkout_completed"; otherwise return {recorded:0}.
  - Try to find the matching Performance: GET `Performances?filterByFormula=` encodeURIComponent(`{Quicket Event ID}=${Number(payload.event_id)}`); among results, pick the one whose "Date" equals the date part of payload.event_date if present, else the first. Capture its record id (may be undefined → leave link empty).
  - Group payload.tickets (array of {ticket_type, price}) by ticket_type; for each group create one "Quicket Sales" record: { "Performance": perfId?[perfId]:undefined, "Ticket Type Name": ticket_type, "Price": Number(price)||0, "Quantity Sold": count, "Synced At": new Date().toISOString() }. (Append-only ledger; aggregation happens in reporting.)
  - Return { recorded: number_of_rows_created }. Be defensive about missing/odd payload shapes (never throw on a malformed ticket line; skip it).
Add clear comments, especially noting that per-performance matching relies on event id + date (a documented limitation).

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
