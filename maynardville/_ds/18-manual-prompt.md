Write a clear, friendly CLIENT USER MANUAL & SYSTEM OVERVIEW in clean Markdown (no preamble, no outer code fences) for the "Maynardville Festival Operations Platform". Audience: non-technical festival staff and leadership at the Maynardville Open-Air Festival. Tone: warm, plain-English, confident. South African English. Avoid jargon; explain any necessary term simply. ~2000–2800 words. Use headings, short paragraphs, numbered steps, and small tables where helpful. Do NOT mention internal tooling or AI.

The system is a private, branded web application (looks like the Maynardville website) for running the festival's complimentary ("comp") ticket process and related dashboards. Behind the scenes it stores everything in Maynardville's own Airtable account and connects to Quicket for ticket-sales data — but the manual should focus on how staff USE it, not the tech.

COVER THESE SECTIONS:

## 1. Welcome / What this system does
One-paragraph overview: a single place to request, approve, issue and report on complimentary tickets, with tailored dashboards per department, accessed from any device.

## 2. Who uses it (roles)
A table: Role → Who → What they can do.
- Festival Leadership / Admin (Jaco van Rensburg, Wessel Odendaal): full access; approve/decline requests; see all dashboards & reports; can correct issued records.
- Box Office (Jeff Brooker): sees approved requests to issue; records seat numbers + ticket reference; can only edit those issue fields.
- PR & Media (Sascha Polkey): sees media/VIP comps.
- Sponsorship (Kerry Burns): sees partner/sponsor & competition-winner comps.
- Operations (Alyssa van der Schyff): sees operational comps across categories.
- Requesters (the people who submit comp requests, e.g. organisers): use a private personal link; only see their own form; can choose only the categories they're allowed.

## 3. Signing in
- Staff: go to the sign-in page, enter your work email, and click the secure one-time link emailed to you (no password to remember). Sessions last about 12 hours.
- Requesters: you don't sign in — you receive a private link unique to you; open it to submit requests.
Mention links are private and shouldn't be shared.

## 4. The complimentary-ticket journey (end to end)
Walk through the lifecycle in plain steps with the statuses in caps:
1. A requester submits a request (status REQUEST). Leadership is notified by email.
2. Jaco or Wessel reviews and Approves (→ TO ISSUE) or Declines (with a reason). The requester is emailed the outcome.
3. The Box Office sees approved requests, draws the tickets in Quicket, then records the Seat Numbers and Ticket Reference and marks them ISSUED. (The system won't let them mark ISSUED without both.)
4. Issued tickets move into a protected Full Comps List that only Leadership can change. The requester is emailed that their tickets are ready.
Include a tiny status legend: REQUEST, TO ISSUE, ISSUED, DECLINED, CANCELLED.

## 5. Getting around (navigation)
Explain the top bar: the Maynardville logo (top-left) returns you to the Dashboard; the menu lets you jump between the dashboards you have access to; "Sign out" is top-right. The Dashboard hub shows cards for each area you can open.

## 6. Screen-by-screen guide
A short subsection for each, explaining purpose + what you do there:
- Requester form (personal link): fill guest name & surname, performance, category (only your allowed ones), email, seats, optional house-seats toggle and notes; submit; you'll see a confirmation.
- Dashboard hub: your launchpad.
- Approvals (Leadership): a queue of pending requests; Approve or Decline with a reason.
- Box Office: two tabs — "To Issue" (enter seat numbers + ticket reference, then Issue) and "Full Comps List" (read-only record of everything issued).
- Festival Leadership dashboard: headline numbers (requested / pending / to issue / issued / declined), house-seat usage, breakdowns by performance and requester, an "Action needed" panel (e.g. issued tickets missing seat details), and a Quicket sales summary.
- PR & Media / Sponsorship / Operations dashboards: the same style, filtered to that department's categories.
- Sales vs Comp Report: a per-performance table of capacity, tickets sold, gross, comps issued, total allocated, % of capacity and remaining — with a CSV export button.

## 7. Email notifications
A short table: Event → Who gets emailed. (New request → Leadership; Approved → Box Office + requester; Declined → requester; Issued → requester; plus a daily reminder to Leadership/Box Office if any issued tickets are missing seat numbers or references.)

## 8. Ticket sales from Quicket
Plainly: the system pulls each performance and its sales from Quicket automatically, so leadership can compare comps against sales and capacity. Note that comps drawn directly in Quicket are recorded by the Box Office in this system, and that sales figures build up as purchases come through.

## 9. Everyday admin tasks (brief)
Short how-tos / pointers (high level): adding a new performance, adding or removing a requester (and issuing their personal link), and rolling the system over to a new festival season. Note detailed step-by-step runbooks are provided separately at handover.

## 10. Your data & privacy
Reassure: all data and accounts belong to Maynardville; access is limited by role; personal details (guest names/emails) are only visible to those who need them; data can be exported or removed; the system is designed with POPIA in mind.

## 11. Getting help / support
A short closing: who to contact, and that documentation + a training session are provided.

Start with a top title "Maynardville Festival Operations Platform — User Guide" and a one-line subtitle. Keep it genuinely useful and reassuring for non-technical readers.
