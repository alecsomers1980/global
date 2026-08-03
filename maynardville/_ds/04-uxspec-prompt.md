You are a senior product designer. Produce a screen-by-screen UX SPECIFICATION in clean Markdown for Module 1 (the Complimentary Ticket Request workflow) of the Maynardville Festival Ops Platform — a branded Next.js web app backed by Airtable. Output Markdown only, no preamble. Practical and build-ready (engineers will follow it).

BRAND: deep navy #060A3C (primary text / dark bands), royal blue #0F3193 (primary buttons/links), mint #62DAA9 (positive/CTA accent), cream #FFFADB (text on dark), navy-muted #3D4067, white background, Montserrat typeface, 3px corner radius. Tone: elegant, calm, festival-premium. Internal staff tool — must be fast, mobile-friendly, and minimise the risk of accidental edits.

WORKFLOW (recap): Requester submits via tokenised magic link → Jaco or Wessel approve (REQUEST→TO ISSUE) → Jeff (Box Office) issues on Quicket and records Seat Numbers + Ticket Reference (TO ISSUE→ISSUED) → record locks into FULL COMPS LIST (editable only by Jaco/Wessel). Statuses: REQUEST, TO APPROVE, APPROVED, TO ISSUE, ISSUED, DECLINED, CANCELLED, DUPLICATE/ERROR.

PRODUCE THESE SECTIONS:

## 1. UX principles & global patterns
Minimal clicks, clear status at a glance, confirm-before-destructive, optimistic UI with server confirmation, role-based navigation, mobile-first layouts, accessibility (labels, focus, contrast, keyboard). Note that the requester form and a dashboard shell already exist in the codebase.

## 2. Status system (visual)
A table mapping each status → badge label, colour (use the brand palette), and meaning. Keep it legible (e.g., REQUEST = navy-muted, TO ISSUE = royal blue, ISSUED = mint/green, DECLINED/CANCELLED = grey/red, DUPLICATE/ERROR = amber).

## 3. Screen-by-screen
For EACH screen give: purpose, who sees it, layout (describe sections top-to-bottom), key components, fields shown/editable, primary/secondary actions, states (loading / empty / error / success), and mobile behaviour. Cover:
- 3.1 Requester form `/request/[token]` (exists) — greeting, performance select, allowed-category select, guest details, seats, house-seats toggle, notes; validation; success panel showing status REQUEST.
- 3.2 Requester status view — re-using the magic link to see their submitted requests and current status (read-only).
- 3.3 Approvals screen (Jaco & Wessel) — a queue of REQUEST items with quick context; record detail with all request fields; Approve / Decline (with reason) actions; capture Approved By + timestamp; optional bulk approve; what changes on approve.
- 3.4 Box Office screen (Jeff) — two tabs/panels: "TO ISSUE" queue and "FULL COMPS LIST". Issue flow: open a record, enter Seat Numbers + Ticket Reference, mark ISSUED. Hard rule: cannot set ISSUED unless both Seat Numbers and Ticket Reference are filled (inline guard). Jeff can edit ONLY those three fields; everything else read-only.
- 3.5 FULL COMPS LIST — all ISSUED comps, strong filters (performance, category, requester), search, CSV export, locked editing (only Jaco/Wessel), house-seat indicator.
- 3.6 Leadership dashboard — summary cards (total requested/approved/issued/declined; outstanding TO ISSUE; missing seat/reference alerts), breakdowns by performance/category/requester, VIP/media/sponsor allocation, and an alerts panel.

## 4. Notifications (email)
For each workflow event (submitted, approved, declined, issued, missing-data alert) give: trigger, recipient(s), subject line, and a short body outline. Note email is the default channel; Slack/Google Chat optional later.

## 5. Navigation & information architecture by role
A short table: role → which screens/menu items they see (Requester, Leadership/Admin, Box Office, PR/Media, Sponsorship, Operations).

## 6. Empty / error / edge states
List the key empty states, permission-denied behaviour, expired/invalid magic link, Airtable/Quicket unavailable, and concurrent-edit handling.

Use tables and clear headings. Keep it tight and implementation-ready.
