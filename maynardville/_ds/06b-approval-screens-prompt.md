Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Project: Next.js 14 App Router + TypeScript + Tailwind. Build the Approvals and Box Office screens for the Maynardville comp-ticket workflow.

AVAILABLE IMPORTS (already exist — do not recreate):
- from "@/lib/comps" (SERVER ONLY — uses the secret Airtable token; never import in a "use client" file):
  - listCompRequestRows(statuses: string[]): Promise<CompRequestRow[]>
  - approveRequest(id: string, staffName: string): Promise<void>
  - declineRequest(id: string, staffName: string, reason: string): Promise<void>
  - issueRequest(id: string, staffName: string, seatNumbers: string, ticketReference: string): Promise<void>
- from "@/lib/session":
  - requireStaff(allowedRoles?: string[]): StaffSession  (server components; redirects if not allowed)
  - getStaffSession(): StaffSession | null
  - getStaffFromRequest(req: Request): StaffSession | null
- Types from "@/lib/types": CompRequestRow { id, guestName, guestSurname, guestEmail, performance, category, requester, totalSeats, houseSeats, notes, status, seatNumbers, ticketReference, approvedAt, submittedAt }; StaffSession { id, name, role }.

BRAND (Tailwind): colours mv.navy #060A3C, mv.blue #0F3193, mv.mint #62DAA9, mv.cream #FFFADB, mv["navy-muted"] #3D4067; font-heading/font-sans Montserrat; rounded DEFAULT 3px. Status badge colours: REQUEST = navy-muted bg/cream text; TO ISSUE = blue bg/cream; ISSUED = mint bg/navy; DECLINED = red bg/white. Provide a small shared inline badge helper in each client file (or a tiny components/StatusBadge.tsx).

API CONTRACT (build it): `app/api/requests/[id]/route.ts` exporting `async function PATCH(req: Request, { params }: { params: { id: string } })`:
- Body JSON: { action: "approve" | "decline" | "issue", reason?: string, seatNumbers?: string, ticketReference?: string }.
- const staff = getStaffFromRequest(req); if null → 401.
- action "approve": require staff.role === "Admin" else 403; await approveRequest(params.id, staff.name).
- action "decline": require Admin else 403; require non-empty reason else 400; await declineRequest(params.id, staff.name, reason).
- action "issue": require staff.role === "Box Office" || "Admin" else 403; require non-empty seatNumbers AND ticketReference else 400; await issueRequest(params.id, staff.name, seatNumbers, ticketReference).
- else 400 unknown action. Wrap in try/catch → 500 with message. Return NextResponse.json({ ok: true }).

BUILD THESE:

app/approvals/page.tsx — server component. `const staff = requireStaff(["Admin"]);` then `const rows = await listCompRequestRows(["REQUEST"]);`. Render a branded header bar (platform name, "Approvals", staff name + a "Sign out" link to /api/staff-login). Pass rows to <ApprovalQueue rows={rows} />. `export const dynamic = "force-dynamic";`

app/approvals/ApprovalQueue.tsx — "use client". Props { rows: CompRequestRow[] }. Keep rows in state. Render an empty state ("All requests processed") when none. Each request as a branded card: guest name+surname, performance, category, requester, seats (+ house-seat chip if houseSeats), notes, status badge, submitted time. Two actions: **Approve** (mv-blue button) and **Decline** (red outline → reveals a reason input + confirm). On Approve: PATCH `/api/requests/${id}` {action:"approve"}; on Decline: PATCH {action:"decline", reason}. While pending, disable buttons + show spinner; on success remove the row from state + show a success toast/inline message; on error show the error and keep the row. Mobile: single column.

app/box-office/page.tsx — server component. `const staff = requireStaff(["Box Office","Admin"]);` then fetch `const toIssue = await listCompRequestRows(["TO ISSUE"]);` and `const issued = await listCompRequestRows(["ISSUED"]);`. Branded header (name, "Box Office", staff + sign out). Render <BoxOfficeClient toIssue={toIssue} issued={issued} />. `export const dynamic = "force-dynamic";`

app/box-office/BoxOfficeClient.tsx — "use client". Props { toIssue: CompRequestRow[]; issued: CompRequestRow[] }. Two tabs: "To Issue" (default) and "Full Comps List". 
  - To Issue tab: each row a card with read-only request summary + two inputs: Seat Numbers and Ticket Reference (mint border). An **Issue Tickets** button (mint) that is DISABLED until BOTH inputs are non-empty (with helper text "Enter both seat numbers and ticket reference"). On click: PATCH `/api/requests/${id}` {action:"issue", seatNumbers, ticketReference}; on success move the row into the issued list (state) and out of To Issue; on error show message.
  - Full Comps List tab: read-only table (Guest, Performance, Category, Requester, Seats, Seat Numbers, Ticket Reference) of issued rows; note "Editing locked to Jaco & Wessel". Mobile: cards.

app/dashboard/page.tsx — REWRITE (server component). `const staff = getStaffSession();` If null, render a branded prompt with a link to /staff-login. If present: a branded hub showing "Signed in as {name} ({role})" + Sign out link (/api/staff-login). Show navigation cards: "Approvals" (link /approvals, show only if role Admin), "Box Office" (link /box-office, show if Box Office or Admin), and muted "coming soon" cards for PR/Media, Sponsorship, Operations, Leadership dashboards. Keep a small TODO comment that staff auth is a dev stub pending Auth.js. `export const dynamic = "force-dynamic";`

Use NextResponse from "next/server" in the route. Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
