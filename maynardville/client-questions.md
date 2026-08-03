# Maynardville — Open Questions for the Client (working notes)

Running list to confirm with Maynardville. Not yet client-formatted — we'll turn the agreed set into a send-doc later.
Legend: **(Rec: …)** = our recommendation if they have no preference.

---

## 1. Authentication — how should staff sign in?
- [ ] **Staff login method:** email **magic links**, Google sign-in, or username/password? **(Rec: email magic links** — no passwords to store, no Google account needed, one model for everyone, reuses the email we already send for notifications.)
  - If **Google**: do you use Google Workspace, and should we restrict sign-in to `@maynardville.co.za` accounts only?
- [ ] Requesters use no-account, expiring **magic links** (no password) — confirm that's acceptable.

## 2. Accounts & access we'll need (to build, deploy, and hand over to you)
- [ ] **Airtable:** confirm Maynardville will own the account; provide a Personal Access Token (scopes: data read/write + schema read/write) and the base ID. *(System is built; we just need this to stand it up.)*
- [ ] **Quicket:** please enable API access at developer.quicket.co.za and provide the API key + account **user-token**. Confirm we may pull guest lists.
- [ ] **Hosting/domain:** preferred URL for the tool (e.g. `ops.maynardville.co.za`)? Who owns the Vercel account (should be Maynardville)?
- [ ] **Sending email:** can we send from a Maynardville address (e.g. `noreply@maynardville.co.za`)? Do you use Google Workspace? *(Needed for magic links + notifications.)*

## 3. Quicket integration specifics
- [ ] How are **complimentary tickets currently drawn** in Quicket — via the organiser back-end, or a R0 checkout? *(Determines whether comp issuance triggers a webhook or needs guest-list reconciliation.)*
- [ ] Is the season **one Quicket event with multiple schedules** (performances), or several separate events?
- [ ] Does Quicket hold **allocated seat numbers**, or is seating general admission? *(If GA, seat numbers are entered in-app — which is how we've built it.)*
- [ ] Do you want **purchaser/customer data** (paying buyers' names/emails) pulled into the system, or only **sales totals** per performance? *(Affects POPIA scope.)*

## 4. Comp-ticket workflow & business rules
- [ ] Confirm the status flow: **REQUEST → TO ISSUE → ISSUED**, plus DECLINED / CANCELLED / DUPLICATE-ERROR. Do you need the internal **TO APPROVE / APPROVED** steps, or is the simpler flow fine? **(Rec: simpler flow.)**
- [ ] Either **Jaco or Wessel** can approve — correct? Any **limits** to enforce (max comps per requester, per performance, or house-seat caps)?
- [ ] Confirm the **requester list and allowed categories** are current and complete (Jaco, Wessel, Rauen Venter, Sascha, Jeff, Kerry, Alyssa). Anyone to add/remove?
- [ ] **Decline reasons** — fixed list (e.g. Sold out / Not eligible / Duplicate) or free text? **(Rec: short fixed list + optional note.)**
- [ ] Should requesters be able to **check their own request status** via their link? **(Rec: yes — reduces box-office calls.)**

## 5. Users, dashboards & permissions
- [ ] Please confirm the **named people and their emails** for each role (Leadership, Box Office, PR/Media, Sponsorship, Operations) — for the Users table and dashboards.
- [ ] **Edit rights** for Sascha (PR), Kerry (Sponsorship), Alyssa (Ops) — view-only, or able to add requests / edit notes? *(Brief left this "to be proposed.")* **(Rec: view their slice + add requests in their categories; no editing of issued comps.)**
- [ ] Does anyone need to **edit raw data directly in Airtable** (each such person needs a paid seat), or is the app enough for everyone? **(Rec: app only → a single Airtable seat.)**
- [ ] **Notifications:** email is the default. Do you also want **Slack / Google Chat / WhatsApp** for internal alerts? Confirm which events notify whom.

## 6. Branding & assets
- [ ] The only logo we found is the **cream wordmark** (for dark backgrounds). Do you have a **vector (SVG/AI)** and a **dark/navy version** for light screens?
- [ ] Confirm brand colours and font are current: navy `#060A3C`, royal blue `#0F3193`, mint `#62DAA9`, cream `#FFFADB`, **Montserrat**.

## 7. Data, privacy & retention (POPIA)
- [ ] How long should we **retain guest names/emails** after a season — and should purchaser data be purged on a schedule?
- [ ] Is there **existing data to import** (past comps, requester lists, current-season performances)?

## 8. Scope, timeline & sign-off
- [ ] When does the system need to be **operational** (festival dates / first performance)?
- [ ] Beyond the comp-ticket pilot, which **modules are in scope first** (guest lists, sponsorship, schools, marketing, media, reporting)?
- [ ] Who is our **main point of contact**, and who **signs off** the pilot?
- [ ] Confirm the **build fee and payment terms** (proposed 40% / 30% / 30%).
