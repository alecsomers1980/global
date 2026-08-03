Output ONLY one file block in EXACTLY this format (no prose, no outer fences):

===FILE: scripts/create-airtable-base.mjs===
<full file contents>
===END===

Write a Node ESM script (.mjs, Node 18+, uses global fetch — no dependencies) that creates the Maynardville base structure via the Airtable Meta API. Requirements:

ENV: load AIRTABLE_API_KEY and AIRTABLE_BASE_ID. First try process.env; if missing, minimally parse a sibling `.env.local` (read file, split lines on newline, ignore blanks/#, split each on the first "="), then read again. Exit with a clear message if either is missing. The token must be a Personal Access Token with scopes data.records:read, data.records:write, schema.bases:read, schema.bases:write.

API: base URL https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables , Authorization: Bearer ${KEY}, Content-Type application/json. Helper to GET existing tables, POST a new table, and POST a field to a table (POST .../tables/${tableId}/fields). Always check res.ok and print the error body on failure (don't crash silently). Be idempotent: skip creating a table whose name already exists; skip creating a field whose name already exists on that table.

PASS 1 — create these 8 tables. Each table's FIRST field is its primary field. Use Airtable Meta field types: singleLineText, multilineText, email, number (options {precision:0} or {precision:2}), checkbox (options {icon:"check",color:"greenBright"}), singleSelect (options {choices:[{name:"..."}]}), date (options {dateFormat:{name:"iso"}}), dateTime (options {dateFormat:{name:"iso"},timeFormat:{name:"24hour"},timeZone:"Africa/Johannesburg"}).

1. Categories — primary "Category Name" (singleLineText); Description (multilineText); Active (checkbox).
2. Users — primary "Name" (singleLineText); Email (email); Role (singleSelect: Admin, Box Office, PR & Media, Sponsorships, Operations); Department (singleLineText); "Can Approve" (checkbox); Active (checkbox).
3. Performances — primary "Production/Event" (singleLineText); Date (date); Time (singleLineText); Venue (singleLineText); Capacity (number precision 0); Season (singleSelect: 2025, 2026, 2027); "Quicket Event ID" (number precision 0); "Quicket Schedule ID" (number precision 0); "Performance Type" (singleSelect: Public, School, SASL-interpreted, VIP); Active (checkbox).
4. Requesters — primary "Name" (singleLineText); Email (email); Role (singleSelect: Festival Organiser, PR & Media, Box Office, Sponsorships, Operations); "Magic Link Token" (singleLineText); "Token Active" (checkbox); Active (checkbox).
5. Guests — primary "Full Name" (singleLineText); Email (email); Organisation (singleLineText).
6. "Comp Requests" — primary "Guest Name" (singleLineText); "Guest Surname" (singleLineText); "Guest Email" (email); "House Seats" (checkbox); Notes (multilineText); "Total Seats Requested" (number precision 0); "Ticket Status" (singleSelect: REQUEST, TO APPROVE, APPROVED, TO ISSUE, ISSUED, DECLINED, CANCELLED, "DUPLICATE/ERROR"); "Seat Numbers" (singleLineText); "Ticket Reference" (singleLineText); "Approved At" (dateTime).
7. "Quicket Sales" — primary "Ticket Type Name" (singleLineText); "Quicket Ticket Type ID" (number precision 0); Price (number precision 2); "Quantity Sold" (number precision 0); "Synced At" (dateTime).
8. "Approval Log" — primary "Summary" (singleLineText); Action (singleSelect: Submitted, Approved, Declined, Issued, Status Override, Edited, Cancelled); Timestamp (dateTime); "From Status" (singleLineText); "To Status" (singleLineText); Note (multilineText).

After creating tables, build a map of table name → table id (from the create responses and/or a fresh GET).

PASS 2 — add multipleRecordLinks fields (options {linkedTableId: <id>}) now that ids are known:
- Requesters: "Allowed Categories" → Categories
- Comp Requests: "Performance" → Performances; "Category" → Categories; "Requester" → Requesters; "Guest" → Guests; "Approved By" → Users
- Quicket Sales: "Performance" → Performances
- Approval Log: "Related Comp Request" → Comp Requests; "Performed By" → Users

FINALLY — print a clear "MANUAL FIELDS TO ADD IN THE AIRTABLE UI" checklist (these are computed fields the Meta API handles poorly, so do NOT create them in code, just list them):
- Comp Requests: "Submitted At" (Created time), "Request Reference" (Autonumber or formula "REQ-"&id), "Missing Issue Data" (formula: ISSUED with blank Seat Numbers or Ticket Reference), "Season" (Lookup from Performance)
- Performances: "Performance Label" (formula), "Comp Seats Requested" (Rollup), "Comp Seats Issued" (Rollup)
- Quicket Sales: "Gross" (formula Price×Quantity Sold)
- Guests: "Events Attended" (Rollup)

Log progress to console (created/skipped per table and field) and end with a success summary. Wrap the main flow in an async function with try/catch.
