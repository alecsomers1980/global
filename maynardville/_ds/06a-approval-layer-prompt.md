Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Project: Next.js 14 App Router + TypeScript app over a single Maynardville-owned Airtable account (one service token; ALL role permissions enforced server-side in the app). Env: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, CURRENT_SEASON. Airtable REST base: https://api.airtable.com/v0/${AIRTABLE_BASE_ID}. Every Airtable record also has a top-level `id` and `createdTime`.

Airtable tables & fields (exact names):
- "Comp Requests": "Guest Name", "Guest Surname", "Guest Email", "House Seats" (checkbox), "Notes", "Total Seats Requested" (number), "Ticket Status" (single select: REQUEST, TO ISSUE, ISSUED, DECLINED, CANCELLED, "DUPLICATE/ERROR"), "Seat Numbers", "Ticket Reference", "Approved At" (dateTime), and link fields "Performance", "Category", "Requester" (each an array of record IDs).
- "Performances": primary "Production/Event"; also "Date"; optional "Performance Label".
- "Categories": primary "Category Name".
- "Requesters": primary "Name".
- "Approval Log": "Summary", "Action" (single select: Submitted, Approved, Declined, Issued, Status Override, Edited, Cancelled), "From Status", "To Status", "Note", and link "Related Comp Request" (array of one Comp Request id). (Do NOT set "Performed By" — leave it unset for now.)

Build these files:

===FILE: lib/types.ts===
Reproduce this existing content EXACTLY and then APPEND the new interfaces below it:

export interface Category {
  id: string;
  name: string;
}

export interface Performance {
  id: string;
  label: string;
  date: string;     // ISO date string
  time: string;
  venue: string;
  performanceType: string;
  season: string;
}

export interface Requester {
  id: string;
  name: string;
  email: string;
  role: string;
  allowedCategoryIds: string[]; // IDs of categories they can request for
}

export interface CompRequestInput {
  guestName: string;
  guestSurname: string;
  performanceId: string;       // linked Performance record ID
  categoryId: string;          // linked Category record ID
  guestEmail: string;
  houseSeats: boolean;
  notes: string;
  totalSeats: number;
  requesterId: string;         // linked Requester record ID
}

// APPEND:
// CompRequestRow — a display row with linked names resolved.
//   { id, guestName, guestSurname, guestEmail, performance (label string), category (name string),
//     requester (name string), totalSeats (number), houseSeats (boolean), notes, status,
//     seatNumbers, ticketReference, approvedAt, submittedAt }
// StaffSession — { id: string; name: string; role: "Admin" | "Box Office" | string }
===END===

lib/comps.ts — self-contained Airtable access for the comp workflow (its own small fetch helper; do NOT import from lib/airtable.ts):
- Read AIRTABLE_API_KEY and AIRTABLE_BASE_ID from env; a `cFetch(pathAndQuery, init?)` helper that adds Authorization Bearer + Content-Type, throws on non-ok with the body text.
- `listCompRequestRows(statuses: string[]): Promise<CompRequestRow[]>` — fetch "Comp Requests" filtered by Ticket Status in the given statuses (build an OR(...) filterByFormula over {Ticket Status}); ALSO fetch all "Performances", "Categories", "Requesters"; build id→name maps (Performance label = "Performance Label" || "Production/Event"; Category = "Category Name"; Requester = "Name"); join and return CompRequestRow[] (resolve the first linked id of each link field; submittedAt = record.createdTime). Sort by submittedAt ascending.
- `approveRequest(id: string, staffName: string): Promise<void>` — PATCH the record: set "Ticket Status"="TO ISSUE", "Approved At"=now ISO; then call appendApprovalLog with Action "Approved", From "REQUEST", To "TO ISSUE", note `Approved by ${staffName}`.
- `declineRequest(id: string, staffName: string, reason: string): Promise<void>` — PATCH "Ticket Status"="DECLINED"; appendApprovalLog Action "Declined", From "REQUEST", To "DECLINED", Note reason.
- `issueRequest(id: string, staffName: string, seatNumbers: string, ticketReference: string): Promise<void>` — guard: throw if seatNumbers or ticketReference is blank. PATCH "Seat Numbers", "Ticket Reference", "Ticket Status"="ISSUED"; appendApprovalLog Action "Issued", From "TO ISSUE", To "ISSUED", Note `Issued by ${staffName} — seats ${seatNumbers}, ref ${ticketReference}`.
- `appendApprovalLog({ compRequestId, action, fromStatus, toStatus, note, summary })` — POST a record to "Approval Log" with "Summary" (default `${action}`), "Action", "From Status", "To Status", "Note", and "Related Comp Request":[compRequestId].
Add clear comments and error handling.

lib/session.ts — DEV-ONLY staff identity stub (clearly comment that this is replaced by Auth.js in Phase 2; the cookie is unsigned and for development only). Uses next/headers cookies(). Cookie name "mv_staff" holding URL-encoded JSON {id,name,role}.
- `getStaffSession(): StaffSession | null` — read+parse the cookie (server component context).
- `requireStaff(allowedRoles?: string[]): StaffSession` — server helper; if no session → redirect("/staff-login"); if allowedRoles given and role not in it → redirect("/dashboard"). (import redirect from "next/navigation".)
- `getStaffFromRequest(req: Request): StaffSession | null` — parse the "mv_staff" cookie from a Request's Cookie header (for API routes).

app/staff-login/page.tsx — a DEV-ONLY branded page (navy hero, cream text) titled "Staff sign-in (dev)". Explain it's a temporary role picker until Auth.js is added. Two POST forms to /api/staff-login, each a hidden input role + name: "Continue as Jaco (Admin)" and "Continue as Jeff (Box Office)". Plus a small note.

app/api/staff-login/route.ts — POST handler: read form data (role, name), set the "mv_staff" cookie (URL-encoded JSON {id: slug(name), name, role}, httpOnly, path "/"), then redirect (303) to "/dashboard". Also export a GET that clears the cookie and redirects to "/staff-login" (acts as logout).

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
