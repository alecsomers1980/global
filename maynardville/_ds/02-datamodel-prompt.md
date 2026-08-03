You are a senior data architect. Produce a DETAILED DATA MODEL specification in clean Markdown for an Airtable base that is the backend/system-of-record for the "Maynardville Festival Operations Platform" (a Next.js app reads/writes it via the Airtable Web API). Output Markdown only, no preamble. Be precise and implementation-ready. This is an internal technical spec (engineers + the festival admin will read it).

CONTEXT: Module 1 is the Complimentary (comp) Ticket Request workflow. The base must also be scalable for future modules (guest lists, sponsorship, schools, marketing, reporting) and roll forward each festival season without a rebuild (use a Season field; don't hard-code 2026).

PRODUCE THESE SECTIONS:

## 1. Overview & entity-relationship summary
- List the 8 tables and how they relate. Include a simple Mermaid ER diagram (erDiagram) showing relationships.

## 2. Table-by-table field dictionary
For EACH table below, give a Markdown table with columns: Field | Type (Airtable field type) | Required | Notes/validation. Use correct Airtable field types (Single line text, Long text, Email, Number, Checkbox, Single select, Date, Created time, Last modified time, Linked record, Lookup, Rollup, Formula, Created by, Collaborator, Autonumber). Note default values and which fields are computed.

Tables:
1. **Performances** — one row per dated performance. Include: Performance Name/label (formula or text), Production/Event (text or link), Date, Time, Venue, Capacity (number), Season (single select or link), Quicket Event ID (number/text), Quicket Schedule ID (number/text), Performance Type (single select: Public / School / SASL-interpreted / VIP), Active (checkbox), and rollups of comp seats requested/issued for this performance.
2. **Comp Requests** — the core table. Fields per the brief: Guest Name (req), Guest Surname (req), Performance (linked→Performances, req), Category (linked→Categories, req), Guest Email (Email, req), House Seats (checkbox), Notes (long text), Total Seats Requested (number, req), Ticket Status (single select, default REQUEST — NOT editable by requester), Seat Numbers (text — box office only), Ticket Reference (text — box office only), Requester (linked→Requesters — auto-set from the magic-link token, hidden from requester), Submitted At (created time), Approved By (collaborator or link→Users), Approved At (date/time), Season (lookup from Performance). Add computed/formula fields: a unique request reference (Autonumber or formula), "Missing Issue Data" (formula: TRUE when Status=ISSUED and Seat Numbers or Ticket Reference is blank), and any useful rollups.
3. **Requesters** — approved requesters. Fields: Name, Email, Role (single select: Festival Organiser / PR & Media / Box Office / Sponsorships / Operations), Allowed Categories (linked→Categories, multiple), Magic-link token / status, Active (checkbox), link to their Comp Requests.
4. **Categories** — controlled list. Rows: Competition Winners, Cast / Crew / Team Comp, VIP, Media, Partner / Sponsor, Friends / Family, Box-Office. Fields: Category Name, Description, Active.
5. **Guests / Contacts** — optional dedupe of guests. Fields: Full Name, Email, Organisation, link to Comp Requests, attendance history rollups. Note POPIA relevance.
6. **Quicket Sales** — synced ticketing data. Fields: Performance (link), Ticket Type, Price, Quantity Sold, Gross, Last Synced (date/time), Quicket references. Note this is populated by the app's Quicket sync, not entered by hand.
7. **Approval Log** — append-only audit. Fields: Related Comp Request (link), Action (single select: Submitted / Approved / Declined / Issued / Status Override / Edited / Cancelled), Performed By, Timestamp, From Status, To Status, Note.
8. **Users / Roles** — internal staff ↔ app/Airtable accounts. Fields: Name, Email, Role, Department, Can Approve (checkbox), Active.

## 3. Ticket status lifecycle
- State machine: REQUEST → TO ISSUE → ISSUED, plus DECLINED, CANCELLED, DUPLICATE/ERROR. Note optional internal TO APPROVE / APPROVED. Show allowed transitions and who can perform each. A simple Mermaid stateDiagram-v2 is ideal.

## 4. Requester → allowed-category matrix
Render this exact mapping as a table (✓/blank), columns = categories, rows = requesters:
- Jaco van Rensburg (Festival Organiser): Competition Winners, Cast/Crew/Team Comp, VIP, Media, Partner/Sponsor, Friends/Family
- Wessel Odendaal (Festival Organiser): Competition Winners, Cast/Crew/Team Comp, VIP, Media, Friends/Family
- Rauen Venter (Festival Organiser): Competition Winners, Cast/Crew/Team Comp, VIP, Media, Friends/Family, Partner/Sponsor
- Sascha Polkey (PR & Media): Media, VIP
- Jeff Brooker (Box Office): Box-Office
- Kerry Burns (Sponsorships): Competition Winners, Partner/Sponsor
- Alyssa van der Schyff (Operations): Competition Winners, Cast/Crew/Team Comp, VIP, Media, Partner/Sponsor
Explain that the app reads each requester's Allowed Categories to render only their permitted options on their form.

## 5. Permission matrix (role × capability)
Table summarising read/write per role across the key tables/fields. Key rules: requesters submit only (no read of others); Jaco & Wessel full edit + approve + edit locked Full Comps List; Jeff edits ONLY Seat Numbers, Ticket Reference, Ticket Status on TO ISSUE records; PR/Sponsorship/Operations see only their category slices (view, optional notes). Note these are enforced server-side in the Next.js app, with Airtable field/table editing permissions as a secondary lock.

## 6. Quicket field mapping
Table mapping Quicket API fields → Airtable fields: event id→Performances.Quicket Event ID; schedule (id, name, startDate)→a Performance row; ticket types & sold counts→Quicket Sales; guest list→reconciliation against Comp Requests. Note seat numbers and true capacity are NOT in Quicket and are entered/maintained in-app.

## 7. Season rollover
Short runbook: how the Season field + archiving lets the same base serve future seasons without a rebuild.

Keep it tight, accurate, and ready to build from. Use tables and Mermaid where specified.
