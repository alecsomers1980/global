Produce a clear, ordered GO-LIVE / DEPLOYMENT CHECKLIST in clean Markdown (no preamble, no outer code fences). Audience: the implementer deploying the Maynardville Festival Ops app (Next.js + Airtable). Use checkbox list items (`- [ ]`) for actionable steps, tables where listing env vars, and fenced code blocks for commands. Practical and precise — use ONLY the concrete facts below; do not invent extra services. Emphasise that EVERY account, key and secret belongs to Maynardville (the vendor retains nothing).

THE STACK (context): Next.js app in the `web/` folder, deployed on Vercel; Airtable is the single backend (one service token); email via Resend (or console fallback in dev); Quicket integration via REST sync + a webhook; daily Vercel crons. Staff sign in with email magic links; requesters use tokenised links.

SECTION 1 — Accounts to create (all owned by Maynardville)
- [ ] Airtable account + an empty base (note the base ID from the URL, starts with "app...").
- [ ] Airtable Personal Access Token with scopes: data.records:read, data.records:write, schema.bases:read, schema.bases:write (scoped to the base).
- [ ] Quicket account with API access enabled at developer.quicket.co.za (API key) + the account user-token (from quicket.co.za account → API keys).
- [ ] Vercel account (to host) + connect the Git repository.
- [ ] Resend account + verified sending domain (e.g. maynardville.co.za) OR note that without RESEND_API_KEY emails only log to the server console.

SECTION 2 — Generate secrets
- [ ] AUTH_SECRET, CRON_SECRET, QUICKET_WEBHOOK_SECRET — each a long random string. Show the command:
```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

SECTION 3 — Environment variables (set locally in web/.env.local for testing AND in Vercel Project Settings → Environment Variables for production). Render as a table: Variable | Where it comes from. Include exactly these:
AIRTABLE_API_KEY, AIRTABLE_BASE_ID, CURRENT_SEASON (e.g. 2026), AUTH_SECRET, RESEND_API_KEY (optional), EMAIL_FROM (e.g. "Maynardville <noreply@maynardville.co.za>"), QUICKET_API_KEY, QUICKET_USER_TOKEN, QUICKET_EVENT_ID (numeric, from the Quicket event URL), CRON_SECRET, QUICKET_WEBHOOK_SECRET, APP_BASE_URL (the deployed URL, e.g. https://ops.maynardville.co.za), NOTIFY_APPROVERS (comma list, optional fallback), NOTIFY_BOXOFFICE (comma list, optional fallback).

SECTION 4 — Create the Airtable base structure
- [ ] From the web/ folder, with AIRTABLE_API_KEY + AIRTABLE_BASE_ID set, run:
```
cd web
npm install
node scripts/create-airtable-base.mjs
```
This creates 8 tables (Categories, Users, Performances, Requesters, Guests, Comp Requests, Quicket Sales, Approval Log) with their fields and links.
- [ ] (Optional, in the Airtable UI) add the computed/helper fields the script lists at the end: Comp Requests → "Submitted At" (Created time), "Request Reference" (Autonumber), "Missing Issue Data" (formula), "Season" (Lookup); Performances → "Performance Label" (formula), "Comp Seats Requested"/"Comp Seats Issued" (Rollups); Quicket Sales → "Gross" (formula); Guests → "Events Attended" (Rollup). NOTE: the app works without these (it falls back), so they are nice-to-have for Airtable-native views.

SECTION 5 — Seed the controlled data (in Airtable)
- [ ] Categories table — add rows: Competition Winners, Cast / Crew / Team Comp, VIP, Media, Partner / Sponsor, Friends / Family, Box-Office.
- [ ] Users table — add each staff member with Email, Role (Admin for Jaco & Wessel; Box Office for Jeff; PR & Media for Sascha; Sponsorships for Kerry; Operations for Alyssa), tick "Can Approve" for the approvers (Jaco, Wessel), tick Active. (These emails are who can sign in + who gets notifications.)
- [ ] Requesters table — add each requester with Name, Email, Role, link their Allowed Categories, set a long random "Magic Link Token", tick Token Active + Active. Their personal form is then `${APP_BASE_URL}/request/<that token>`.

SECTION 6 — Quicket configuration
- [ ] Put the Quicket event's numeric ID in QUICKET_EVENT_ID.
- [ ] Register the webhook: in Quicket → your event → Settings → Integrations → Webhooks, set the "Checkout completed" listening URL to:
```
https://<APP_BASE_URL>/api/quicket/webhook?token=<QUICKET_WEBHOOK_SECRET>
```
- [ ] Confirm (a Phase-1 question for Quicket) how comps are drawn and whether the guest-list endpoint is available, so sold-count reconciliation can be finalised.

SECTION 7 — Deploy to Vercel
- [ ] Import the repo; set the project root/output to the web/ folder if the repo root differs.
- [ ] Add ALL environment variables from Section 3 (Production).
- [ ] Deploy. The crons in vercel.json run automatically: /api/quicket/sync at 03:00 UTC and /api/notifications/missing-data at 06:00 UTC. Vercel authorises crons with the CRON_SECRET bearer token, so no extra setup.
- [ ] Point the custom domain (e.g. ops.maynardville.co.za) at the Vercel project and set APP_BASE_URL to match.

SECTION 8 — Smoke test (end to end)
- [ ] Visit APP_BASE_URL/staff-login → sign in (magic link arrives by email, or appears in server logs if no Resend key).
- [ ] Trigger the Quicket performance sync manually:
```
curl -H "Authorization: Bearer <CRON_SECRET>" "https://<APP_BASE_URL>/api/quicket/sync"
```
Confirm Performances appear in Airtable; set each performance's Capacity manually.
- [ ] Open a requester link `${APP_BASE_URL}/request/<token>`; submit a test request → it appears in Airtable as REQUEST and the approvers get an email.
- [ ] As an Admin, open /approvals → approve it → status TO ISSUE, Box Office notified.
- [ ] As Box Office, open /box-office → enter seat numbers + ticket reference → Issue → status ISSUED, requester notified, record moves to the locked Full Comps list.
- [ ] Open /leadership and /reports → confirm the request shows in the breakdowns and the sales-vs-comp table.
- [ ] (Optional) Make a real Quicket purchase to confirm the webhook records a Quicket Sales row.

SECTION 9 — Handover & ownership
- [ ] Confirm the Airtable account, Vercel project, Git repo, Resend account, Quicket API credentials and all secrets are owned by Maynardville.
- [ ] Hand over: this checklist, the data-model doc, the QUICKET.md note, and the runbooks (add a performance, add/remove a requester, roll to a new season).
- [ ] Schedule the short training session.

SECTION 10 — Quick troubleshooting
- A short table: symptom → likely cause/fix. Include: magic-link email not arriving (RESEND_API_KEY/EMAIL_FROM domain) ; 401 on /api/quicket/sync (CRON_SECRET mismatch) ; webhook not recording (token in URL / "Checkout completed" hook enabled) ; "AIRTABLE_API_KEY missing" (env not set) ; sales-vs-comp empty (no sales synced yet / Capacity not set).

End with one line: "Once Section 8 passes, the comp-ticket pilot is live."
