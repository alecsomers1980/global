Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 + TypeScript + Tailwind. Restyle these existing SERVER components to a refined, premium "theatre admin" look. KEEP every prop signature identical (pages already pass these props). 

⚠️ CRITICAL: ALL brand colour utility classes MUST use the `mv-` prefix — `bg-mv-mint`, `text-mv-mint`, `text-mv-navy`, `bg-mv-navy`, `text-mv-cream`, `bg-mv-canvas`, `border-mv-line`, `text-mv-navy-muted`. There is NO bare `mint`/`navy` colour. Available shadows: `shadow-card`, `shadow-lift`. Animation: `animate-fade-up`. Radius 3px (`rounded`). lucide-react is available. Accent (mint) is used sparingly as the single highlight.

Types: `CompRequestRow` = { id, guestName, guestSurname, guestEmail, performance, category, requester, totalSeats, houseSeats, notes, status, seatNumbers, ticketReference, approvedAt, submittedAt } from "@/lib/types". `DashboardData` (from "@/lib/dashboard") = { totals:{totalRequests,pending,toIssue,issued,declined,cancelled,seatsRequested,seatsIssued}, byCategory:Breakdown[], byPerformance:Breakdown[], byRequester:Breakdown[], houseSeats:{count,seats}, alerts:CompRequestRow[], rows:CompRequestRow[] } where Breakdown={name,count,seats}. AppHeader default export at "@/components/ui/AppHeader" (props {title,subtitle?,staffName?}). StatusBadge default export at "@/components/StatusBadge" (props {status}).

BUILD (full contents, keep props):

===FILE: components/StatusBadge.tsx===
Default export `StatusBadge({ status }: { status: CompRequestRow["status"] })` (import type CompRequestRow from "@/lib/types"). A small uppercase pill (text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded inline-flex). Colour map: REQUEST → bg-mv-navy-muted text-mv-cream; "TO ISSUE" → bg-mv-blue text-mv-cream; ISSUED → bg-mv-mint text-mv-navy; DECLINED → bg-red-500 text-white; CANCELLED → bg-gray-300 text-mv-navy; "DUPLICATE/ERROR" → bg-amber-400 text-mv-navy; default → bg-mv-line text-mv-navy. 

components/dashboard/StatCard.tsx — props { label:string; value:string|number; hint?:string; accent?:"navy"|"blue"|"mint" }. A white card, border border-mv-line, rounded, shadow-card, p-5, with a top accent bar (h-1 -mt-5 -mx-5 mb-4 rounded-t) coloured by accent (navy→bg-mv-navy, blue→bg-mv-blue, mint→bg-mv-mint; default navy). Label: uppercase text-[11px] tracking-wide text-mv-navy-muted. Value: large font-heading text-3xl text-mv-navy (the focal point). Optional hint: text-xs text-mv-navy-muted mt-1.

components/dashboard/BreakdownList.tsx — props { title:string; items:{name:string;count:number;seats:number}[] }. White card (border-mv-line, rounded, shadow-card, p-5). Heading (font-heading text-mv-navy text-sm uppercase tracking-wide mb-4). For each item a row: name (text-sm text-mv-navy truncate) on the left, a thin horizontal bar (rounded-full h-1.5 bg-mv-blue, width % = count/maxCount*100, min 4%) under or beside it, and "{count} · {seats} seats" (text-xs text-mv-navy-muted) on the right. Empty state: "No data yet." (text-sm text-mv-navy-muted).

components/dashboard/AlertsPanel.tsx — props { alerts: CompRequestRow[] }. White card with a left accent border-l-4 border-amber-400, rounded, shadow-card, p-5. Title "Action needed" (font-heading text-mv-navy). If empty → a mint-tinted line "All good — no outstanding issues." (text-mv-navy with a small check). Else list each alert: "{guestName} {guestSurname}" bold + "— {performance}" + a small amber note of what's missing (seat numbers and/or ticket reference).

components/dashboard/CompTable.tsx — props { rows: CompRequestRow[]; caption?:string }. A white card wrapper (border-mv-line rounded shadow-card overflow-hidden). Optional caption as a header strip (px-5 py-3 border-b border-mv-line, font-heading text-sm text-mv-navy). Table: header row bg-mv-canvas, uppercase text-[11px] tracking-wide text-mv-navy-muted; columns Guest, Performance, Category, Requester, Seats, Status. Body rows: border-t border-mv-line, hover:bg-mv-canvas/60, px-4 py-2.5 text-sm text-mv-navy; Seats right-aligned; Status uses <StatusBadge status={row.status}/>. On mobile (sm:hidden) render rows as stacked cards instead of a table; show the table on sm+ (overflow-x-auto). Empty state: a padded "No requests." 

components/dashboard/DepartmentDashboard.tsx — props { title:string; staffName:string; data: DashboardData } (import type DashboardData from "@/lib/dashboard"; import StatCard, BreakdownList, AlertsPanel, CompTable defaults; import AppHeader default). Render `<div className="min-h-screen bg-mv-canvas">` → `<AppHeader title={title} staffName={staffName} />` → a `<main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-up">` containing: (1) a responsive grid of StatCards: Total requests (data.totals.totalRequests), Pending (data.totals.pending, accent navy), To issue (data.totals.toIssue, accent blue), Issued (data.totals.issued, accent mint), Declined (data.totals.declined); (2) a two-column (lg) grid with BreakdownList "By performance" (data.byPerformance) and BreakdownList "By requester" (data.byRequester); (3) <AlertsPanel alerts={data.alerts} />; (4) <CompTable rows={data.rows} caption="Requests" />.

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
