Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 App Router + TypeScript + Tailwind (server components). Build the department dashboard pages + the role-aware hub. Every page: `export const dynamic = "force-dynamic";`.

AVAILABLE IMPORTS:
- from "@/lib/session": requireStaff(allowedRoles?: string[]): StaffSession (redirects if not allowed); getStaffSession(): StaffSession | null.
- from "@/lib/dashboard": getCompDashboard(categoryNames?: string[]): Promise<DashboardData>; getSalesSummary(): Promise<SalesRow[]>; types DashboardData, SalesRow, Breakdown.
- from "@/components/dashboard/DepartmentDashboard": default export DepartmentDashboard (props { title, staffName, data }).
- from "@/components/dashboard/StatCard": default StatCard (props { label, value, hint?, accent? }).
- from "@/components/dashboard/BreakdownList": default BreakdownList (props { title, items }).
- from "@/components/dashboard/AlertsPanel": default AlertsPanel (props { alerts }).
- from "@/components/dashboard/CompTable": default CompTable (props { rows, caption? }).
Brand Tailwind: mv.navy #060A3C, mv.blue #0F3193, mv.mint #62DAA9, mv.cream #FFFADB, mv["navy-muted"] #3D4067; font-heading Montserrat; rounded 3px.

BUILD:

app/pr-media/page.tsx — `const staff = requireStaff(["PR & Media","Admin"]); const data = await getCompDashboard(["Media","VIP"]);` render `<DepartmentDashboard title="PR & Media" staffName={staff.name} data={data} />`.

app/sponsorship/page.tsx — requireStaff(["Sponsorships","Admin"]); data = await getCompDashboard(["Partner / Sponsor","Competition Winners"]); `<DepartmentDashboard title="Sponsorship" staffName={staff.name} data={data} />`.

app/operations/page.tsx — requireStaff(["Operations","Admin"]); data = await getCompDashboard(["Competition Winners","Cast / Crew / Team Comp","VIP","Media","Partner / Sponsor"]); `<DepartmentDashboard title="Operations" staffName={staff.name} data={data} />`.

app/leadership/page.tsx — RICHER page. `const staff = requireStaff(["Admin"]); const data = await getCompDashboard(); const sales = await getSalesSummary();` Layout:
- Branded header bar: platform name + "Festival Leadership" + "Signed in as {staff.name}" + a "Sign out" link to /api/auth/logout.
- A row of StatCards (wrap on mobile): Total requests (data.totals.totalRequests), Pending (data.totals.pending, accent navy), To issue (data.totals.toIssue, accent blue), Issued (data.totals.issued, accent mint), Declined (data.totals.declined), House seats (data.houseSeats.count, hint `${data.houseSeats.seats} seats`).
- A two-column grid (single column on mobile) of BreakdownList: "By category" (data.byCategory), "By performance" (data.byPerformance), "By requester" (data.byRequester).
- AlertsPanel with data.alerts.
- A "Quicket sales" card: if sales.length === 0 → muted "No Quicket sales synced yet." else a small table with columns Performance / Tickets / Gross (render gross as `R${Math.round(row.gross).toLocaleString()}`).
- CompTable with data.rows (caption "All complimentary requests").
- Quick links to /approvals and /box-office.

app/dashboard/page.tsx — REWRITE the hub (server component). `const staff = getStaffSession();` If null → branded prompt with a link to /staff-login. Else: branded header "Signed in as {staff.name} ({staff.role})" + "Sign out" link to /api/auth/logout. Render a grid of navigation cards (each a branded link with a title + one-line description), showing only those the role may access:
  - role "Admin": Approvals (/approvals), Box Office (/box-office), Festival Leadership (/leadership), PR & Media (/pr-media), Sponsorship (/sponsorship), Operations (/operations).
  - role "Box Office": Box Office (/box-office).
  - role "PR & Media": PR & Media (/pr-media).
  - role "Sponsorships": Sponsorship (/sponsorship).
  - role "Operations": Operations (/operations).
  Add a small footer note that staff sign-in is via email magic links. `export const dynamic = "force-dynamic";`

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
