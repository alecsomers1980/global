Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 App Router + TypeScript + Tailwind. Build a Quicket "sales vs comp" report. AVAILABLE: `requireStaff(allowedRoles?)` from "@/lib/session" (server, redirects). Brand Tailwind: mv.navy #060A3C, mv.blue #0F3193, mv.mint #62DAA9, mv.cream #FFFADB, mv["navy-muted"] #3D4067; font-heading Montserrat; rounded 3px. Env AIRTABLE_API_KEY + AIRTABLE_BASE_ID.

Airtable tables/fields:
- "Performances": id, "Production/Event", optional "Performance Label", "Date", "Capacity" (number).
- "Quicket Sales": link "Performance" (array of one perf id), "Quantity Sold" (number), "Price" (number).
- "Comp Requests": link "Performance" (array of one perf id), "Total Seats Requested" (number), "Ticket Status" (single select).

BUILD:

===FILE: lib/reporting.ts===
- Self-contained Airtable access: lazy env getter; `async function aFetchAll(table: string): Promise<any[]>` that pages through results (encode the table-name path segment, append `?pageSize=100` and follow `offset` until none), Bearer auth, throws on non-ok.
- `export interface SalesVsCompRow { performanceId: string; performance: string; date: string; capacity: number; ticketsSold: number; gross: number; compsIssued: number; compsPipeline: number; totalAllocated: number; utilisationPct: number | null; remaining: number | null }`
- `export interface SalesVsCompReport { rows: SalesVsCompRow[]; totals: SalesVsCompRow }`
- `export async function getSalesVsComp(): Promise<SalesVsCompReport>`:
  - try/catch the whole thing; on any error return { rows: [], totals: <zeroed row with performance "Total"> }.
  - Fetch Performances, Quicket Sales, Comp Requests via aFetchAll.
  - Build perf map: id → { label: fields["Performance Label"] || fields["Production/Event"] || "Untitled", date: fields["Date"] || "", capacity: Number(fields["Capacity"]) || 0 }.
  - Aggregate sales by performance id: ticketsSold += Number("Quantity Sold")||0; gross += (Number("Price")||0)*(Number("Quantity Sold")||0). Use fields.Performance?.[0] as the id.
  - Aggregate comps by performance id: compsIssued += seats when "Ticket Status"==="ISSUED"; compsPipeline += seats when status NOT in ["DECLINED","CANCELLED","DUPLICATE/ERROR"] (seats = Number("Total Seats Requested")||0).
  - Build one row PER performance (include performances with zero activity). totalAllocated = ticketsSold + compsIssued. utilisationPct = capacity>0 ? round(totalAllocated/capacity*100) : null. remaining = capacity>0 ? capacity - totalAllocated : null.
  - Sort rows by date ascending (empty dates last).
  - totals: sum capacity, ticketsSold, gross, compsIssued, compsPipeline, totalAllocated; utilisationPct = totalCapacity>0 ? round(totalAllocated/totalCapacity*100) : null; remaining = totalCapacity>0 ? totalCapacity-totalAllocated : null; performance "Total", date "", performanceId "".
  - return { rows, totals }.

components/reports/ExportCsvButton.tsx — "use client". Props { rows: any[]; filename: string }. Renders a small mv-blue button "Export CSV". On click: build CSV from a fixed column order [performance, date, capacity, ticketsSold, gross, compsIssued, totalAllocated, utilisationPct, remaining] with a header row (human labels: Performance, Date, Capacity, Tickets Sold, Gross, Comps Issued, Total Allocated, % of Capacity, Remaining); quote values containing commas; create a Blob (text/csv), an object URL, a temporary <a download={filename}> click, then revoke. No dependencies.

app/reports/page.tsx — server component. `export const dynamic = "force-dynamic";` `const staff = requireStaff(["Admin"]);` `const report = await getSalesVsComp();` Render:
- A branded header bar: platform name + "Sales vs Comp Report" + "Sign out" link to /api/auth/logout + a "← Dashboard" link to /dashboard.
- A short caption noting sales figures accumulate from Quicket as purchases sync; figures may be empty before go-live.
- The <ExportCsvButton rows={report.rows} filename="maynardville-sales-vs-comp.csv" /> (import default).
- A responsive table: columns Performance, Date, Capacity, Tickets Sold, Gross (render `R${Math.round(gross).toLocaleString()}`), Comps Issued, Total Allocated, % of Capacity (show "—" when null, else `${n}%`; if >=100 colour the cell red, if >=85 amber, else normal), Remaining (show "—" when null). Then a bold totals row from report.totals. Right-align numeric columns. On mobile, allow horizontal scroll.
- Empty state when report.rows.length === 0: a card "No performance data yet. Performances populate from the Quicket sync, and sales accumulate as purchases come through."

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
