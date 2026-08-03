# Module 1: Complimentary Ticket Request — UX SPECIFICATION

## 1. UX Principles & Global Patterns

| Principle | Description |
|-----------|-------------|
| **Minimal clicks** | Common actions (Approve, Issue) are reachable in 1–2 taps from list views. Contextual buttons appear only when relevant. |
| **Clear status at a glance** | Every request card/row displays a coloured status badge. The current workflow phase is immediately visible. |
| **Confirm before destructive** | All status‑changing actions (Approve, Decline, Issue) trigger a confirmation modal with summary and undo option (soft delete/reversal where possible). |
| **Optimistic UI with server confirmation** | On approve/issue, the UI updates instantly, then syncs with Airtable. If Airtable fails, rollback and show toast. |
| **Role‑based navigation** | Menu items and edit permissions are scoped to the authenticated role. Read‑only fields are visually locked (grey background, lock icon). |
| **Mobile‑first layouts** | All screens use single‑column card layouts on small screens; tables collapse into list cards; modals become full‑screen sheets. |
| **Accessibility** | All inputs have visible labels; focus outlines are royal blue (#0F3193); colour contrast meets WCAG AA (cream #FFFADB on navy #060A3C, navy on white); keyboard navigation follows natural tab order; buttons have clear roles and aria labels. |
| **Brand delivery** | Deep navy (#060A3C) for primary text and dark surfaces; royal blue (#0F3193) for primary CTAs/links; mint (#62DAA9) for positive/CTA accents; cream (#FFFADB) for text on dark; navy‑muted (#3D4067) for secondary UI; overall typeface Montserrat, 3 px border‑radius. Tone is calm, premium, festival‑elegant. |

**Global components**  
- **Top bar**: app logo left, role context right, optional breadcrumb.  
- **Status badge**: pill shaped, 3 px radius, semibold 12 px Montserrat.  
- **Confirmation modal**: centred, backdrop blur, title, body, primary + secondary action.  
- **Toast notifications**: slide‑in top‑right, mint for success, amber for warnings, soft red for errors.  
- **Data tables**: sticky header, zebra striping with navy‑muted 5% opacity, row hover highlight (royal blue 10%).  
- **Empty states**: elegant illustration + friendly message + optional CTA.  
- **Loading**: skeleton screens (pulsing navy‑muted shapes) for lists, spinners for buttons.

---

## 2. Status System (Visual)

| Status | Badge Label | Background | Text Colour | Meaning |
|--------|-------------|------------|-------------|---------|
| `REQUEST` | Requested | `#3D4067` (navy‑muted) | `#FFFADB` (cream) | New request submitted; awaiting approval review. |
| `TO APPROVE` | To Approve | `#3D4067` with checkmark icon | `#FFFADB` | Alias for items visible in approvals queue (same underlying status as REQUEST). |
| `APPROVED` | Approved | `#060A3C` (deep navy) | `#FFFADB` | Request approved, but not yet handed over to Box Office (transitional). |
| `TO ISSUE` | To Issue | `#0F3193` (royal blue) | `#FFFADB` | Approved and ready for Box Office to assign seat details. |
| `ISSUED` | Issued | `#62DAA9` (mint) | `#060A3C` | Seat numbers & ticket reference recorded; finalised. |
| `DECLINED` | Declined | `#E53935` (soft red) | `#FFFADB` | Request declined with reason. |
| `CANCELLED` | Cancelled | `#BDBDBD` (grey) | `#060A3C` | Previously issued tickets cancelled. |
| `DUPLICATE/ERROR` | Duplicate/Error | `#FFB300` (amber) | `#060A3C` | Flagged as duplicate or contains errors; needs admin review. |

*Note: `TO APPROVE` is not stored in Airtable; it is a filter label for the Approvals queue (all records with status `REQUEST`).*

---

## 3. Screen‑by‑Screen

### 3.1 Requester Form (`/request/[token]`)

**Purpose**  
Allow a token‑holder (artist, sponsor, partner, internal) to submit a complimentary ticket request.

**Who sees it**  
Authenticated user via magic link (role: Requester).

**Layout** (top to bottom)
1. **Greeting header**: “Hi [First Name], request complimentary tickets for [Festival/Performance]” with festival subtle branding.
2. **Performance select**: dropdown of eligible performances; searchable. Default: first upcoming.
3. **Category select**: dropdown of allowed categories based on token entitlements (Artist, VIP, Media, Sponsor, etc.).
4. **Guest details** card:  
   - Guest Name (required)  
   - Guest Surname (required)  
   - Guest Email (required)
5. **Seats** card:  
   - Number of tickets (stepper input, min 1, max from token)  
   - House‑seats toggle (appears only if token permits house seats; OFF by default)
6. **Notes** textarea (free text, 200 chars)
7. **Submit button** (royal blue, full width on mobile)

**Validation** (on submit)
- Performance must be selected.
- Category must be selected.
- At least 1 ticket.
- Guest name required.
- If house‑seats ON, an additional note “House seats requested” is appended.

**Success panel** (replaces form after successful submission)  
- Large mint checkmark icon.  
- “Request submitted” heading.  
- Summary: Performance, Category, Tickets, House‑seat flag, Guest name.  
- Status badge: `REQUEST` (navy‑muted).  
- Reference number (Airtable record ID tail).  
- Note: “You’ll receive an email confirmation shortly. You can return to this link to check your status.”  
- “View my requests” link (goes to status view, same token).

**States**
- **Loading**: Submit button shows spinner; entire form disabled.
- **Empty**: Form pre‑filled with requester name but everything else blank; no pre‑checked toggles.
- **Error**: Inline red text below each invalid field; toast if server error.
- **Success**: as above.

**Mobile behaviour**  
Single column, stepper becomes large tappable +/- buttons, dropdowns use native bottom‑sheet on iOS/Android.

---

### 3.2 Requester Status View (same token)

**Purpose**  
The requester can monitor all their submitted requests and current statuses.

**Who sees it**  
Requester (same magic link).

**Layout**
1. **Header**: “Your Requests” with requester name.
2. **Request list**: vertically stacked cards, each showing:
   - Performance name & date
   - Category
   - Number of tickets (+ house‑seat icon if applicable)
   - Status badge
   - Guest name
   - Submitted date
3. **Expandable detail**: tap card to expand, revealing:
   - Full guest details, dietary notes
   - Any admin notes (read‑only)
   - If `DECLINED`: decline reason in soft red box
   - If `ISSUED`: seat numbers & ticket reference
4. **Timeline snippet**: small vertical status history (e.g., “Requested 12 Oct · Approved 13 Oct · Issued 14 Oct”) inside expanded card.
5. **Refresh pull‑down**.

**States**
- **Loading**: Skeleton cards (3–4 placeholder rectangles).
- **Empty**: “You haven’t submitted any requests yet.” graphic + button “Request Tickets” (if token still valid).
- **Error**: “Unable to load your requests. Pull to retry.”
- **Success**: list populated.

**Mobile**  
Cards full width, expand animation slides down. Pull‑to‑refresh.

---

### 3.3 Approvals Screen (Jaco & Wessel)

**Purpose**  
Review, approve, or decline incoming requests; track decisions.

**Who sees it**  
Approvers (Jaco, Wessel) and any super‑admin.

**Layout**
1. **Top bar**: “Approvals” title, performance filter dropdown (all / specific), category filter, requester search box, date range.
2. **Queue** (table or card list):  
   - Columns: Requester name, Performance, Category, Tickets (count + house‑seat icon), Request date, Status badge (`REQUEST`).  
   - Row click opens **detail panel** (right‑side drawer on desktop, full‑screen modal on mobile).
3. **Detail panel** (read‑only except actions):  
   - All request fields (guest, seats, notes).  
   - Action buttons: **Approve** (royal blue) and **Decline** (outline red).  
   - Approve → confirmation modal: “Approve request for [Requester] – [Performance]? This will move it to the Box Office.” On confirm, status changes to `TO ISSUE`, captures `Approved By = current user`, timestamp, record disappears from queue.  
   - Decline → modal with predefined reasons dropdown (e.g., “Sold out”, “Not eligible”, “Duplicate”) + free text. On confirm, status → `DECLINED`, reason stored.
4. **Bulk approve** (optional): checkboxes on rows, “Approve Selected” button above table. Confirmation modal lists all selected. On confirm, all become `TO ISSUE`.
5. **Activity log** under detail: history of status changes with who/when.

**States**
- **Loading**: Skeleton table rows.
- **Empty queue**: “All requests have been processed.” illustration.
- **Error on action**: Toast with “Failed to update record. Please try again.” rollback UI.
- **Success approve/decline**: Record removed from queue with subtle animation; toast “Request approved/declined.”

**Mobile**  
Queue as cards; detail opens full‑screen with fixed bottom action bar (Approve/Decline). Bulk approve via long‑press selection mode.

---

### 3.4 Box Office Screen (Jeff)

**Purpose**  
Assign seat numbers and ticket reference to approved requests and issue tickets.

**Who sees it**  
Box Office role (Jeff).

**Layout**
Two tabs: **To Issue** (default) and **Full Comps List**.

#### Tab 1: To Issue queue
- Columns: Requester, Performance, Category, Tickets, Request date, (empty Seat/Ticket columns).  
- Row click opens **Issue panel** (drawer/modal).

**Issue panel**  
- Read‑only summary: all request details.  
- Editable fields (highlighted with mint border):  
  - **Seat Numbers** (text input, placeholder “e.g. A12, A13”)  
  - **Ticket Reference** (text input, placeholder “Quicket reference #”)  
- **Issue Tickets** button (mint, full width).  
  - **Disabled** state (greyed out) if either Seat Numbers or Ticket Reference is empty. Tooltip: “Please enter both Seat Numbers and Ticket Reference before issuing.”  
  - On click: confirmation modal “Issue tickets for [Requester] – [Performance]? Seat: [seats], Ref: [ref]”. Confirm changes status to `ISSUED`, records `Issued By = Jeff`, timestamp. Success toast, panel closes, row removed from To Issue queue.
- All other fields read‑only (grey background, lock icon).
- Jeff can edit **only** Seat Numbers, Ticket Reference, and indirectly status via Issue action.

**States**
- **Loading**: Skeleton row in queue; button spinner on issue.
- **Empty**: “All approved requests have been issued. Great job!” illustration.
- **Error**: If Airtable fails or record already issued by someone else, show error and refresh panel.
- **Guard**: If status changed externally (e.g., already `ISSUED`), disable Issue button and show warning.

#### Tab 2: Full Comps List
(see screen 3.5, but Jeff sees it read‑only with filters/search/export; no editing of locked records.)

**Mobile**  
Tabs as horizontal scroll; Issue panel becomes full‑screen modal; fields large; Issue button fixed at bottom.

---

### 3.5 FULL COMPS LIST

**Purpose**  
Comprehensive, filterable list of all issued comps, with limited editing for admins.

**Who sees it**  
Jaco, Wessel, Leadership (read‑only/editable based on role). Jeff sees read‑only version within his Box Office screen.

**Layout**
1. **Header**: “Full Comps List”
2. **Filter bar** (sticky):  
   - Performance multi‑select dropdown  
   - Category multi‑select  
   - Requester search (typeahead)  
   - Date range (from–to)  
   - “Clear filters” link
3. **Actions bar**:  
   - Search (global text search across requester, guest, seat numbers, reference)  
   - **Export CSV** button (royal blue outline) – exports currently filtered results.
4. **Table** (responsive, horizontal scroll on mobile):  
   - Columns: Requester, Performance, Date, Category, Tickets, Seat Numbers, Ticket Reference, House‑seat icon, Status badge (`ISSUED` only).  
   - Row click opens **detail panel** (read‑only for most, editable for Jaco/Wessel).
5. **Detail panel (Admin edit mode)**:  
   - Jaco/Wessel see an “Edit” toggle. When enabled, Seat Numbers and Ticket Reference fields become editable (same as Issue panel). Saving writes to Airtable with audit note “Edited by [Name]”.  
   - All other users see pure read‑only view.
6. **Locked editing indicator**: for non‑admins, a small lock icon and tooltip “Editing restricted to Jaco & Wessel”.

**States**
- **Loading**: Skeleton table.
- **Empty**: “No issued comps match your filters.” with clear filter CTA.
- **Error**: Toast if fetch fails.
- **Success**: Data displayed.

**Mobile**  
Table converts to stacked cards; filters collapse into a bottom‑sheet triggered by a filter icon. Export button moved to bottom sheet.

---

### 3.6 Leadership Dashboard

**Purpose**  
High‑level overview of complimentary ticket operations, allocations, and alerts.

**Who sees it**  
Jaco, Wessel, Festival Director (Leadership role).

**Layout** (top to bottom)
1. **Summary cards** (row of 4–5, wrap on mobile):  
   - Total Requested (count)  
   - Total Approved/Issued  
   - Total Declined  
   - Outstanding TO ISSUE (count, clickable → filtered list)  
   - Missing Seat/Reference Alerts (count, clickable)
2. **Breakdowns** section:  
   - **By Performance**: horizontal bar chart, each bar clickable → full comps filtered.  
   - **By Category**: doughnut chart.  
   - **By Requester**: top 10 list ranked by number of tickets.
3. **VIP / Media / Sponsor allocation** panel:  
   - Cards showing “VIP: X issued / Y approved”, “Media: …”, “Sponsor: …”, with a small progress bar of capacity (if configurable).
4. **Alerts panel**:  
   - List of records with status `TO ISSUE` where **Seat Numbers** or **Ticket Reference** missing for > 24 h.  
   - Each alert row: Requester, Performance, missing field(s), request age.  
   - Action: “Nudge Box Office” (sends notification to Jeff).

**States**
- **Loading**: Cards show skeleton numbers; charts show pulsing placeholder.
- **Empty dashboard** (no data): “No requests yet this season.”
- **Error**: Per‑widget error state (retry icon).
- **Success**: all populated.

**Mobile**  
Cards stack vertically; charts collapse into swipeable carousel; alerts become full‑width list.

---

## 4. Notifications (Email)

| Event | Trigger | Recipient(s) | Subject line | Body outline |
|-------|---------|--------------|--------------|--------------|
| **Request submitted** | Form successfully submitted → status `REQUEST` | Requester | Your complimentary ticket request for **{Performance}** has been received | “Hi {Name}, we’ve received your request for {N} ticket(s) for {Performance} on {Date}. Reference: {RecordID}. We’ll review it and let you know. You can check your status anytime at {StatusLink}.” |
| **Request approved** | Status changes to `TO ISSUE` (or `APPROVED`) by Jaco/Wessel | Requester | Your ticket request for **{Performance}** has been approved | “Good news! Your request for {N} tickets has been approved. The Box Office will issue your seat details soon. Reference: {RecordID}.” |
| **Request declined** | Status set to `DECLINED` with reason | Requester | Update on your ticket request for **{Performance}** | “Hi {Name}, unfortunately your request for {Performance} could not be fulfilled. Reason: {Reason}. If you have questions, please contact the festival office.” |
| **Tickets issued** | Status → `ISSUED`, seat numbers & reference recorded | Requester | Your complimentary tickets for **{Performance}** are ready | “Your tickets have been issued! Seat: {SeatNumbers}, Ref: {TicketReference}. Please present this reference at the Box Office. Performance: {Performance}, {Date} at {Time}.” |
| **Missing seat details alert** | Daily scan: `TO ISSUE` records with empty Seat Numbers or Ticket Reference > 48 h | Ops team (Jaco, Wessel, Jeff) | Action required: Outstanding ticket requests missing seat details | “The following approved requests have not been issued seat numbers or ticket reference: [list with record IDs, performances, requesters]. Please process them as soon as possible.” |

*Optional later: Push to Slack/Google Chat for operations team alerts.*

---

## 5. Navigation & Information Architecture by Role

| Role | Screens / Menu Items | Notes |
|------|----------------------|-------|
| **Requester** (artists, partners, sponsors, media) | `/request/[token]` (form) <br> `/status/[token]` (view own requests) | Accessed only via tokenised magic link. No sidebar navigation; simple header with logo. |
| **Approver** (Jaco, Wessel) | **Approvals** queue <br> **Full Comps List** (editable) <br> **Leadership Dashboard** | Sidebar/Drawer menu: Approvals, All Comps, Dashboard. |
| **Box Office** (Jeff) | **Box Office** (To Issue / Full Comps List tabs) | Menu: Issue Tickets, All Comps. Full Comps List is read‑only. |
| **Leadership** (Festival Director) | **Leadership Dashboard** <br> **Full Comps List** (read‑only) | Menu: Dashboard, All Comps. No editing capabilities. |
| **PR/Media**, **Sponsorship** operatives | Same as Requester (they submit and track their own requests) | May also get a filtered read‑only view of Full Comps List if needed — configurable, but default is requester view. |

---

## 6. Empty / Error / Edge States

### Empty States
- **Approvals queue empty**: Illustration of a checked clipboard. “All requests have been processed. Enjoy the festival!”  
- **To Issue queue empty**: Mint checkmark. “No tickets waiting for issue.”  
- **Full Comps List empty**: Zero‑state with filter clear prompt: “No issued comps found. Try adjusting your filters.”  
- **Requester status empty**: Soft graphic. “You haven’t submitted any requests yet.” with CTA to request if token valid.  
- **Dashboard empty**: “No data yet for this festival season.”

### Permission‑denied behaviour
- If a user without proper role accesses a restricted page (e.g., Jeff tries Approvals), redirect to their default screen and show toast “You don’t have permission to access that page.”  
- Read‑only fields for unauthorised roles display with grey background, a small lock icon, and a tooltip “You don’t have permission to edit.”  
- API calls from front‑end that attempt disallowed edits return 403; UI shows error state and does not update.

### Expired / Invalid Magic Link
- `/request/[token]` or `/status/[token]` with invalid/expired token:  
  - Full‑screen message: “This link is invalid or has expired.”  
  - “Please contact the festival office to request a new link.”  
  - No navigation visible.

### Airtable / Quicket Unavailable
- Top banner (amber) across all screens: “Some data may be outdated. The ticketing service is temporarily unavailable. We’ll retry automatically.”  
- Forms: Submit button shows loading for longer, then explicit error “Service unavailable. Please try again later.”  
- Data tables: stale data indicated by a subtle “updated X mins ago” label; pull‑to‑refresh attempts re‑fetch.  
- Issue flow: If Airtable write fails, button rolls back with toast “Failed to issue tickets. Please check connection and try again.”

### Concurrent Edit Handling
- When a record is loaded in a detail panel, the UI stores a `lastModified` timestamp from Airtable. On save, it sends this timestamp.  
- If the record has been modified by another user since load, Airtable returns a conflict.  
- UI shows a modal: “This record has been updated by {other user}. Your changes may be out of date. Reload the record or discard?”  
- Option “Reload” refreshes the panel with the latest data; user can re‑apply edits.  
- In the Issue panel, if status changed to `ISSUED` by another client, the panel immediately refreshes and disables the Issue button, showing “This request has already been issued.”

### Form submission error (duplicate)
- If token can only be used once and user tries to re‑submit, after validation the server responds with “You have already submitted a request with this link.” The UI replaces the form with the “Already submitted” status view.

---