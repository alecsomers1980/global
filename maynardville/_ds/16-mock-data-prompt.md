Output ONLY one file block in EXACTLY this format (no prose, no outer fences):

===FILE: lib/mock-data.ts===
<full file contents>
===END===

Next.js + TypeScript server module. Create DEV/PREVIEW sample data so the app's screens render populated when Airtable is NOT configured. Start the file with a clear comment: "PREVIEW SCAFFOLDING — sample data shown when AIRTABLE_API_KEY is unset. Remove (and the isPreview() hooks in lib/comps.ts, lib/dashboard.ts, lib/reporting.ts) before go-live."

Import the row type: `import type { CompRequestRow } from "./types";` (CompRequestRow = { id, guestName, guestSurname, guestEmail, performance, category, requester, totalSeats, houseSeats, notes, status, seatNumbers, ticketReference, approvedAt, submittedAt }). All other shapes use inline object types (do NOT import from ./dashboard or ./reporting — avoid import cycles).

Export:
1. `export function isPreview(): boolean { return !process.env.AIRTABLE_API_KEY; }` — true when no Airtable key is set.

2. `export const mockCompRequestRows: CompRequestRow[]` — about 12 realistic rows for the Maynardville Open-Air Festival. Use:
   - performances (the `performance` string): "Twelfth Night — 14 Feb", "Twelfth Night — 15 Feb", "Twelfth Night — 21 Feb", "Romeo & Juliet — 28 Feb".
   - requesters: "Jaco van Rensburg", "Wessel Odendaal", "Sascha Polkey", "Kerry Burns", "Alyssa van der Schyff", "Rauen Venter".
   - categories: "Media", "VIP", "Partner / Sponsor", "Competition Winners", "Cast / Crew / Team Comp", "Friends / Family".
   - statuses spread across rows: 3 with "REQUEST", 2 with "TO ISSUE", 5 with "ISSUED", 1 with "DECLINED". 
   - For ISSUED rows fill seatNumbers (e.g. "B12, B13") and ticketReference (e.g. "QKT-10432") — EXCEPT make ONE ISSUED row have empty seatNumbers AND empty ticketReference (so the "missing details" alerts panel shows something).
   - houseSeats true on 2 rows. totalSeats between 1 and 6. realistic guest names + emails. notes on a few. submittedAt = recent ISO date-times (spread over the last ~10 days). approvedAt set on TO ISSUE/ISSUED rows, "" otherwise. unique ids like "rec_mock_01"...
   - Spread categories so each department dashboard has data: at least one Media + one VIP (PR), at least one Partner / Sponsor + one Competition Winners (Sponsorship), a Cast / Crew / Team Comp (Operations/Leadership).

3. `export const mockSalesSummary: { performance: string; tickets: number; gross: number }[]` — one entry per performance above, with plausible tickets (e.g. 180–520) and gross (tickets × ~R220), sorted by gross desc.

4. `export const mockSalesVsCompReport: { rows: { performanceId: string; performance: string; date: string; capacity: number; ticketsSold: number; gross: number; compsIssued: number; compsPipeline: number; totalAllocated: number; utilisationPct: number | null; remaining: number | null }[]; totals: { performanceId: string; performance: string; date: string; capacity: number; ticketsSold: number; gross: number; compsIssued: number; compsPipeline: number; totalAllocated: number; utilisationPct: number | null; remaining: number | null } }` — one row per performance (capacity e.g. 720), with ticketsSold matching mockSalesSummary, gross matching, compsIssued/compsPipeline small (5–30), totalAllocated = ticketsSold + compsIssued, utilisationPct = round(totalAllocated/capacity*100), remaining = capacity − totalAllocated. Make one performance near/over capacity (utilisation ≥ 100) to show the red state. Compute a correct `totals` row (sum the numeric columns; utilisationPct/remaining from summed capacity). Dates ISO like "2026-02-14".

Make the data internally consistent and realistic. Output ONLY the single ===FILE: lib/mock-data.ts=== block.
