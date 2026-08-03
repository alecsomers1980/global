Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 App Router + TypeScript + Tailwind. Build the dashboard data layer + reusable read-only presentational components (all SERVER components — no "use client", no hooks, no new dependencies).

AVAILABLE: from "@/lib/comps": listCompRequestRows(statuses: string[]): Promise<CompRequestRow[]>. Type CompRequestRow { id, guestName, guestSurname, guestEmail, performance, category, requester, totalSeats, houseSeats, notes, status, seatNumbers, ticketReference, approvedAt, submittedAt } from "@/lib/types". A StatusBadge component exists as a DEFAULT export at "@/components/StatusBadge" — import it as `import StatusBadge from "@/components/StatusBadge"`; it takes a `status: string` prop and renders `<StatusBadge status={...} />`. Brand Tailwind: mv.navy #060A3C, mv.blue #0F3193, mv.mint #62DAA9, mv.cream #FFFADB, mv["navy-muted"] #3D4067; font-heading Montserrat; rounded 3px.

BUILD:

===FILE: lib/dashboard.ts===
- `import { listCompRequestRows } from "./comps"; import type { CompRequestRow } from "./types";`
- `const ALL_STATUSES = ["REQUEST","TO APPROVE","APPROVED","TO ISSUE","ISSUED","DECLINED","CANCELLED","DUPLICATE/ERROR"];`
- `function normalizeCat(s: string): string` → (s||"").toLowerCase().replace(/[^a-z0-9]/g,"").
- export interfaces: `Breakdown { name: string; count: number; seats: number }`; `DashboardData { totals: { totalRequests:number; pending:number; toIssue:number; issued:number; declined:number; cancelled:number; seatsRequested:number; seatsIssued:number }; byCategory: Breakdown[]; byPerformance: Breakdown[]; byRequester: Breakdown[]; houseSeats: { count:number; seats:number }; alerts: CompRequestRow[]; rows: CompRequestRow[] }`; `SalesRow { performance:string; tickets:number; gross:number }`.
- `export async function getCompDashboard(categoryNames?: string[]): Promise<DashboardData>`:
  - rows = await listCompRequestRows(ALL_STATUSES).
  - if categoryNames?.length: const allow = new Set(categoryNames.map(normalizeCat)); rows = rows.filter(r => allow.has(normalizeCat(r.category))).
  - totals: totalRequests = rows.length; pending = count status==="REQUEST" (also count "TO APPROVE"/"APPROVED" as pending); toIssue = status==="TO ISSUE"; issued = "ISSUED"; declined = "DECLINED"; cancelled = "CANCELLED"; seatsRequested = sum totalSeats of all rows; seatsIssued = sum totalSeats where status==="ISSUED".
  - byCategory/byPerformance/byRequester: group rows by that field (skip empty names), count rows + sum totalSeats; return arrays sorted by count desc.
  - houseSeats: count rows where houseSeats===true and sum their totalSeats.
  - alerts: rows.filter(r => r.status==="ISSUED" && (!r.seatNumbers || !r.ticketReference)).
  - return all + rows.
- `export async function getSalesSummary(): Promise<SalesRow[]>`:
  - Self-contained Airtable read (own getEnv + fetch, encode path segments). Try to GET "Quicket Sales" and "Performances". Build perf id→name map (Performance Label || Production/Event). For each Quicket Sales record: performanceId from fields.Performance?.[0]; tickets += Number(Quantity Sold)||0; gross += (Number(Price)||0)*(Number(Quantity Sold)||0); group by performance name (or "Unassigned"). Return array sorted by gross desc. Wrap everything in try/catch and return [] on any error (table may be empty or not yet created).

components/dashboard/StatCard.tsx — server component. Props { label: string; value: string | number; hint?: string; accent?: "navy" | "blue" | "mint" }. A bordered card (rounded 3px), small uppercase label (mv-navy-muted), large value (mv-navy), optional hint line; left border or top accent in the chosen colour (default navy).

components/dashboard/BreakdownList.tsx — server component. Props { title: string; items: { name:string; count:number; seats:number }[] }. Card with a heading; each item a row showing name, a horizontal bar (a div whose width % = count / maxCount * 100, bg mv-blue, min 2%), and "{count} reqs · {seats} seats" on the right. Empty state "No data yet."

components/dashboard/AlertsPanel.tsx — server component. Props { alerts: CompRequestRow[] }. Card titled "Action needed". If empty → mint "All good — no outstanding issues." Else list each: guestName guestSurname — performance — "missing seat numbers/ticket reference", styled with an amber accent.

components/dashboard/CompTable.tsx — server component. Props { rows: CompRequestRow[]; caption?: string }. Responsive read-only table: columns Guest, Performance, Category, Requester, Seats, Status (use the default-imported `<StatusBadge status={row.status}/>`). On mobile, stack as cards. Empty state "No requests."

components/dashboard/DepartmentDashboard.tsx — server component. Props { title: string; staffName: string; data: DashboardData } (import DashboardData type from "@/lib/dashboard"). Renders: a branded header bar (platform name + {title} + "Signed in as {staffName}" + a "Sign out" link to /api/auth/logout); a row of StatCards (Total requests, Pending, To issue, Issued, Declined); BreakdownList for byPerformance and byRequester; AlertsPanel; then CompTable of data.rows. Mobile-friendly (cards wrap/stack).

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
