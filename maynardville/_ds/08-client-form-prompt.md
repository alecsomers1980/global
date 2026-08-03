Output a polished, CLIENT-FACING, FILLABLE questionnaire in clean Markdown (no preamble, no outer code fences). Audience: the Maynardville Open-Air Festival team. Tone: warm, professional, concise, South African English. The reader fills in answers INLINE (this will be shared as a Google Doc / Word doc), so every question must have a fill-in field. Do NOT mention internal tooling or vendors.

FORMATTING RULES:
- Title + a short 3–4 sentence intro: thank them, explain the build is already under way, and that their answers here let us finalise and stand the system up; ask them to type answers in the blank fields and tick the relevant boxes.
- A small respondent header block to fill: "Completed by: __________  Role: __________  Date: __________".
- Group into the 8 sections below with clear headings.
- For CHOICE questions, list each option on its own line prefixed with "☐ " so they can tick one; bold our suggestion and append " — *(our suggestion)*".
- For OPEN questions, put the question in bold, then a new line "Answer: ________________________________________".
- Mark questions that block us from starting with a leading "⏳ " and group those visually (or tag them); everything else is "when convenient".
- Keep each question to one clear sentence. Phrase recommendations gently ("unless you prefer otherwise").
- End with a short thank-you line and "Please return this to us and we'll confirm next steps."

USE EXACTLY THESE QUESTIONS (reformat into fillable fields; keep the meaning):

SECTION 1 — Signing in
- (choice) How would you like your team to sign in? Options: "Email magic links (a one-time link, no password)" [bold, our suggestion]; "Google sign-in"; "Username & password". If Google: do you use Google Workspace, and should we limit sign-in to @maynardville.co.za addresses? (open)
- (choice) Requesters receive a private, no-password link that expires — is that acceptable? Options: "Yes"; "No / let's discuss".

SECTION 2 — Accounts & access we'll need (⏳ these let us begin)
- ⏳ (open) Airtable: please confirm you'll own the account, and share a personal access token (data + schema permissions) and the base ID.
- ⏳ (open) Quicket: please enable API access (developer.quicket.co.za) and share the API key and account user-token; confirm we may access guest lists.
- (open) Preferred web address for the tool (e.g. ops.maynardville.co.za)? Who should own the hosting account?
- (open) May we send system emails from a Maynardville address (e.g. noreply@maynardville.co.za)? Do you use Google Workspace?

SECTION 3 — Quicket details
- ⏳ (open) How are complimentary tickets currently drawn in Quicket — through the organiser back-end, or as a R0 checkout?
- (open) Is the season one Quicket event with multiple performance dates, or several separate events?
- (choice) Does Quicket hold specific seat numbers, or is seating general admission? Options: "General admission"; "Allocated seats"; "Not sure".
- (choice) Should we pull paying-customer details into the system, or only sales totals per performance? Options: "Sales totals only" [bold, our suggestion]; "Customer details too"; "Let's discuss".

SECTION 4 — Complimentary-ticket process
- (choice) Status flow REQUEST → TO ISSUE → ISSUED (plus Declined / Cancelled). Options: "Yes, keep it simple" [bold, our suggestion]; "Add extra approval steps".
- (open) Any limits to enforce (max comps per requester, per performance, or house-seat caps)?
- (open) Please confirm the requester list and the categories each may request (Jaco, Wessel, Rauen Venter, Sascha, Jeff, Kerry, Alyssa) — anyone to add or remove?
- (choice) Decline reasons: Options: "Short pick-list + optional note" [bold, our suggestion]; "Free text only".
- (choice) Should requesters be able to check their own request status via their link? Options: "Yes" [bold, our suggestion]; "No".

SECTION 5 — People, dashboards & alerts
- ⏳ (open) Please list the people and email addresses for each role: Leadership, Box Office, PR/Media, Sponsorship, Operations.
- (open) Edit rights for PR (Sascha), Sponsorship (Kerry) and Operations (Alyssa) — view-only, or also able to add requests / edit notes? (Our suggestion: view their area + add requests in their categories.)
- (choice) Does anyone need to work directly inside Airtable as well as the app? Options: "App only is fine" [bold, our suggestion]; "Yes, some staff need direct access".
- (open) Besides email, do you want internal alerts via Slack, Google Chat or WhatsApp? If so, which events and who?

SECTION 6 — Branding
- (open) Do you have a vector logo (SVG/AI) and a dark/navy version for light screens? (We currently only have the cream wordmark.)
- (choice) Confirm brand colours and font — navy #060A3C, royal blue #0F3193, mint #62DAA9, cream #FFFADB, Montserrat. Options: "Correct"; "Changes needed (note below)". Then an Answer line.

SECTION 7 — Data & privacy
- (open) How long should we keep guest names and emails after a season, and should we purge them on a schedule?
- (open) Is there existing data to import (past comps, requester lists, current-season performances)?

SECTION 8 — Scope, timing & sign-off
- ⏳ (open) When does the system need to be live (festival dates / first performance)?
- (open) After the complimentary-ticket pilot, which area should we build next (guest lists, sponsorship, schools, marketing, media, reporting)?
- (open) Who is our main contact, and who signs off the pilot?
- (open) Please confirm the build fee and payment terms (proposed 40% / 30% / 30%).
