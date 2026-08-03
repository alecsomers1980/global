# GO-LIVE / DEPLOYMENT CHECKLIST

> **OWNERSHIP**: Every account, key, secret, and token below is owned exclusively by **Maynardville**. The vendor retains nothing.

---

## 1 — Accounts to create (all owned by Maynardville)

- [ ] **Airtable** – Create an account and an empty base.  
  Note the **Base ID** from the URL (starts with `app...`).
- [ ] **Airtable Personal Access Token** – Scoped to the base above with these scopes:
  - `data.records:read`
  - `data.records:write`
  - `schema.bases:read`
  - `schema.bases:write`
- [ ] **Quicket** – API access enabled at [developer.quicket.co.za](https://developer.quicket.co.za) (API key).  
  Also get the **account user-token** from the Quicket account → API keys.
- [ ] **Vercel** – Account to host the app; connect the Git repository.
- [ ] **Resend** – Account and a verified sending domain (e.g. `maynardville.co.za`).  
  ⚠️ If `RESEND_API_KEY` is missing, emails will only log to the server console (dev/fallback mode).

---

## 2 — Generate secrets

Generate each secret with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

- [ ] `AUTH_SECRET`
- [ ] `CRON_SECRET`
- [ ] `QUICKET_WEBHOOK_SECRET`

Keep these safe; they belong to Maynardville.

---

## 3 — Environment variables

Set these in `web/.env.local` for local testing **and** in Vercel Project Settings → Environment Variables for production.

| Variable | Where it comes from |
|----------|---------------------|
| `AIRTABLE_API_KEY` | Airtable Personal Access Token (Section 1) |
| `AIRTABLE_BASE_ID` | Airtable Base ID from URL (Section 1) |
| `CURRENT_SEASON` | e.g. `2026` |
| `AUTH_SECRET` | Generated in Section 2 |
| `RESEND_API_KEY` | Resend API key (optional; omit to use console fallback) |
| `EMAIL_FROM` | e.g. `"Maynardville <noreply@maynardville.co.za>"` |
| `QUICKET_API_KEY` | Quicket API key (Section 1) |
| `QUICKET_USER_TOKEN` | Quicket account user-token (Section 1) |
| `QUICKET_EVENT_ID` | Numeric ID from the Quicket event URL |
| `CRON_SECRET` | Generated in Section 2 |
| `QUICKET_WEBHOOK_SECRET` | Generated in Section 2 |
| `APP_BASE_URL` | Deployed URL, e.g. `https://ops.maynardville.co.za` |
| `NOTIFY_APPROVERS` | Comma‑separated fallback emails (optional) |
| `NOTIFY_BOXOFFICE` | Comma‑separated fallback emails (optional) |

---

## 4 — Create the Airtable base structure

- [ ] From the `web/` folder, with `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` set, run:
  ```
  cd web
  npm install
  node scripts/create-airtable-base.mjs
  ```
  This creates the 8 tables: **Categories**, **Users**, **Performances**, **Requesters**, **Guests**, **Comp Requests**, **Quicket Sales**, **Approval Log** — with their fields and links.

- [ ] (Optional, in the Airtable UI) Add computed/helper fields mentioned at the end of the script:
  - **Comp Requests**: `Submitted At` (Created time), `Request Reference` (Autonumber), `Missing Issue Data` (formula), `Season` (Lookup)
  - **Performances**: `Performance Label` (formula), `Comp Seats Requested` & `Comp Seats Issued` (Rollups)
  - **Quicket Sales**: `Gross` (formula)
  - **Guests**: `Events Attended` (Rollup)

  > The app works without these (it falls back), but they improve Airtable‑native views.

---

## 5 — Seed the controlled data (in Airtable)

- [ ] **Categories table** — add rows:
  - Competition Winners
  - Cast / Crew / Team Comp
  - VIP
  - Media
  - Partner / Sponsor
  - Friends / Family
  - Box-Office

- [ ] **Users table** — add staff members (these emails are who can sign in + receive notifications):
  | Email | Role | Can Approve | Active |
  |-------|------|-------------|--------|
  | Jaco’s email | Admin | ✅ | ✅ |
  | Wessel’s email | Admin | ✅ | ✅ |
  | Jeff’s email | Box Office | ❌ | ✅ |
  | Sascha’s email | PR & Media | ❌ | ✅ |
  | Kerry’s email | Sponsorships | ❌ | ✅ |
  | Alyssa’s email | Operations | ❌ | ✅ |

  *Set “Can Approve” only for Jaco & Wessel; all must have Active ticked.*

- [ ] **Requesters table** — add each requester:
  - **Name**, **Email**, **Role**
  - Link their **Allowed Categories**
  - Set a **long random `Magic Link Token`** (e.g. generate with the same `crypto.randomBytes` command, or choose a secure string)
  - Tick **Token Active** and **Active**
  
  Their personal form will be at: `https://<APP_BASE_URL>/request/<token>`

---

## 6 — Quicket configuration

- [ ] Set `QUICKET_EVENT_ID` to the numeric event ID from Quicket.
- [ ] Register the webhook in Quicket:  
  Go to event → Settings → Integrations → Webhooks, set “Checkout completed” listening URL to:
  ```
  https://<APP_BASE_URL>/api/quicket/webhook?token=<QUICKET_WEBHOOK_SECRET>
  ```
- [ ] Confirm with Quicket (Phase‑1 question) how comps are drawn and whether the guest‑list endpoint is available, so sold‑count reconciliation can be finalised.

---

## 7 — Deploy to Vercel

- [ ] Import the Git repo into Vercel; if the repository root differs from the app code, set the project root/output directory to `web/`.
- [ ] Add **all** environment variables from Section 3 (Production) in Vercel Project Settings → Environment Variables.
- [ ] Deploy. The crons defined in `vercel.json` run automatically:
  - `/api/quicket/sync` at 03:00 UTC
  - `/api/notifications/missing-data` at 06:00 UTC  
  (Vercel authorises crons using the `CRON_SECRET` bearer token, no extra setup required.)
- [ ] Point the custom domain (e.g. `ops.maynardville.co.za`) to the Vercel project and set `APP_BASE_URL` to match (including `https://`).

---

## 8 — Smoke test (end to end)

- [ ] Visit `https://<APP_BASE_URL>/staff-login` → sign in.  
  Magic link should arrive by email (or in Vercel/server console logs if Resend key is absent).
- [ ] Trigger the Quicket performance sync manually:
  ```
  curl -H "Authorization: Bearer <CRON_SECRET>" "https://<APP_BASE_URL>/api/quicket/sync"
  ```
  Confirm **Performances** appear in Airtable; set each performance’s **Capacity** manually.
- [ ] Open a requester link `https://<APP_BASE_URL>/request/<token>`; submit a test request.  
  Verify it appears in Airtable as **REQUEST** and approvers receive an email.
- [ ] As an Admin, go to `/approvals` → approve it → status **TO ISSUE**, Box Office notified.
- [ ] As Box Office, go to `/box-office` → enter seat numbers + ticket reference → Issue → status **ISSUED**, requester notified, and the record moves to the locked **Full Comps** list.
- [ ] Visit `/leadership` and `/reports` → confirm the request shows in the breakdowns and the sales‑vs‑comp table.
- [ ] (Optional) Make a real Quicket purchase to confirm the webhook records a **Quicket Sales** row.

---

## 9 — Handover & ownership

- [ ] Confirm that the **Airtable account, Vercel project, Git repository, Resend account, Quicket API credentials, and all secrets** are owned by Maynardville — the vendor retains nothing.
- [ ] Hand over:
  - This checklist
  - The data‑model documentation
  - The `QUICKET.md` note
  - Runbooks: add a performance, add/remove a requester, roll to a new season
- [ ] Schedule the short training session.

---

## 10 — Quick troubleshooting

| Symptom | Likely cause / fix |
|---------|-------------------|
| Magic‑link email not arriving | `RESEND_API_KEY` missing or sending domain not verified; otherwise check server logs. Ensure `EMAIL_FROM` uses a verified domain. |
| 401 on `/api/quicket/sync` | `CRON_SECRET` mismatch between the environment variable and the `Authorization: Bearer` token sent. |
| Webhook not recording | The webhook URL token (`?token=...`) doesn’t match `QUICKET_WEBHOOK_SECRET`, or the “Checkout completed” webhook is not enabled. |
| `AIRTABLE_API_KEY missing` error | The environment variable is not set. Check both local `.env.local` and Vercel production settings. |
| Sales‑vs‑comp table empty | No sales synced yet (run manual sync or wait for cron), or **Capacity** not set for performances. |

---

**Once Section 8 passes, the comp-ticket pilot is live.**