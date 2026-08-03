# Maynardville Airtable System — Planning & Vendor Response

Prepared 2026-06-15. Grounded in live Airtable + Quicket documentation (see sources at end).
Scope: response to the *Technical Brief: Maynardville Airtable Database, Forms, Dashboards and Quicket Integration*, plus answers to the Section 17 vendor questions.

---

## ★ SELECTED DIRECTION (2026-06-15): Full Next.js platform over an Airtable backend
*This supersedes the Option-A recommendation in §0 below. §0 is kept for the reasoning/record.*

Decision: build a **custom branded Next.js application** — the comp-ticket workflow is module 1 of a broader **Maynardville festival operations platform** (guest lists, sponsorship, schools, marketing, media, reporting to follow).

**Architecture:**
- **Front-end:** Next.js (App Router) + Tailwind, themed to the captured design system (navy `#060A3C`, royal blue `#0F3193`, mint `#62DAA9`, cream `#FFFADB`, Montserrat). Full website look-and-feel — the reason for going custom.
- **Backend / system-of-record:** **Airtable stays** (honors the brief's "built on Airtable" + Maynardville ownership + no-code staff editing). Next.js reads/writes via the Airtable Web API. Airtable Interfaces are *not* the UI; staff use the branded app.
- **Integration layer:** Quicket sync moves into the **Next.js server** (Route Handlers + a scheduled job/cron) and a webhook endpoint — replaces Airtable scripts/Make. Cleaner, fully owned, testable.
- **Auth & RBAC:** an auth layer in the app (staff sign-in + tokenised per-requester links). Role logic lives in app code, not Airtable interface permissions. This is more capable than the brief's link-obscurity model and satisfies "users only see/edit what their role allows."

**What this changes vs the pure-Airtable plan below:**
- Permissions/forms/dashboards are **built in code**, not Airtable Interfaces (so §3, §4 build mechanics, and the dashboards in §5 are delivered as app screens).
- **Middleware:** none — the Next.js server *is* the integration layer (Q17 #8).
- **Airtable plan (Q17 #1):** still needed as the datastore; **Team** is the likely fit (Web API + 50k records/base). It's now an API datastore, not the staff UI.
- **Cost & timeline go up** (custom app vs configuration): expect roughly **2–3× the build effort** of the Airtable-native route, plus app **hosting** (Vercel/Netlify) and an **auth provider**, all under Maynardville-owned accounts. Running infra ≈ low (Vercel Pro ~$20/mo + Airtable seats + auth free tier) but non-zero and ongoing.
- **Ownership/handover:** the **repo, hosting account, auth project, and all API keys/secrets must sit in Maynardville-owned accounts** — otherwise it breaks the brief's "no critical component under vendor control." Build this in from day one.

**Tension to manage with the client:** the brief's authors may expect literal Airtable Interfaces. Position the proposal as *"Airtable as the mandated, client-owned backend; a branded Next.js front-end on top"* so it reads as exceeding the brief, not departing from it. Confirm they accept a hosted front-end component.

**Confirmed decisions (2026-06-15):**
- **Data layer:** Airtable backend (Next.js ↔ Airtable Web API) via a **single Maynardville-owned service token**. End-users have no Airtable logins; **one Airtable seat suffices** (add a seat only if a staffer needs raw direct access).
- **Permissions:** enforced 100% **server-side in the app** (the single token is privileged, so Airtable is not a secondary lock); per-user audit via the Approval Log table.
- **Auth:** requesters use tokenised, no-account **magic links**; staff (Jaco, Wessel, Jeff, dept users) **sign in via email magic links** (chosen 2026-06-15 over Google/password); RBAC enforced in app code on every read/write.

**Resulting stack:** Next.js (App Router) + Tailwind (brand theme) · custom stateless magic-link auth (HMAC-signed sessions via Node crypto, Airtable Users table, no extra DB) · Airtable Web API (datastore) · email via Resend (console fallback in dev) · Quicket REST + webhook handled in Next.js Route Handlers + a scheduled job · hosted on Vercel — **all accounts/keys owned by Maynardville**.

**Code generation:** per standing workflow, Claude architects; implementation is delegated to the code-gen model (GLM-5.1 / DeepSeek). See [[feedback_glm_delegation]] / [[feedback_deepseek_delegation]].

---

## 0. The one decision that changes everything: Airtable-native vs Next.js

The brief is explicit and repeated: **"The system must be built on Airtable"** and **"Maynardville must be the account owner… no system-critical data or workflow should sit inside an account owned by the vendor."**

Two messages ago we were scoping a **Next.js** front-end matching the website's look and feel. **The client brief never asks for that** — it asks for Airtable. These are different architectures:

| | A. Pure Airtable (matches brief) | B. Airtable + Next.js front-end | C. Hybrid |
|---|---|---|---|
| Forms & dashboards | Airtable Interfaces | Custom Next.js UI on Airtable API | Internal = Interfaces; public requester forms = Next.js |
| Brand match to website | ❌ logo + one accent colour only | ✅ full design system | ✅ on the public forms only |
| Permissions | ✅ native (interface-only, field-level) | ⚠️ you re-build auth in app code | mixed |
| Ownership (brief requirement) | ✅ 100% in Maynardville's Airtable | ⚠️ app must be hosted somewhere they own | ⚠️ partial |
| Build cost / time | Low | High | Medium |
| Ongoing maintenance | Near-zero | Hosting + code upkeep | Some |

**Recommendation: Option A (pure Airtable) for the pilot and almost certainly the whole system.** Airtable Interfaces deliver the forms, dashboards, role-based views and field-level editing the brief needs, natively, inside the account Maynardville owns. A Next.js layer re-implements security we'd otherwise get for free and adds a hosted component that cuts against the ownership requirement.

⚠️ **Branding caveat to set with the client:** Airtable Interfaces support a logo + a single accent colour and light/dark — **not** custom fonts (Montserrat) or the full navy/mint design system. If on-brand requester-facing forms genuinely matter, the cleanest add-on is **Option C**: a thin branded Next.js form that writes to Airtable via API, while all internal dashboards stay native. Treat that as a priced optional extra, not core.

---

## 1. Recommended Airtable plan

**Verified facts (Airtable pricing + docs, June 2026):**
- **Interface-only collaborators** (users invited to an interface but *not* the base) — available on **all paid plans** (Team+). This is the backbone of the permission model.
- **Field & table editing permissions** (lock who can edit a specific field) — **Team, Business, Enterprise**. Per-field "View-only / Editable" inside an interface record layout is standard Interface Designer (all plans).
- **Form submissions and read-only collaborators are FREE** — never billed a seat.
- Billable seats = users with **edit** rights to at least one base, plus interface-only **editors**.

| Plan | Price (annual) | Records/base | Automation runs/mo | Web API |
|---|---|---|---|---|
| Free | $0 | 1,000 | 100 | 1,000 calls/mo |
| **Team** | **$20/seat/mo** | 50,000 | 25,000 | included |
| Business | $45/seat/mo | 125,000 | 100,000 | 100,000 calls/mo |
| Enterprise | custom | 500,000 | 500,000 | unlimited |

**Recommendation: start on Team for the pilot (Module 1).** Team already includes Interface Designer, interface-only collaborators, field/table editing permissions, automations, and the Web API — everything the comp-ticket module requires.

**Move to Business when** any of these become true: they want the **Admin panel + SSO** for governance (the brief stresses ownership/control), **user groups** and **granular interface permissions** to manage many departmental users cleanly, two-way external sync, or they outgrow Team's automation-run / API caps. For a 7–8-person internal team this is a "phase 2" upgrade, not day one.

**Billable seats (estimate):** Jaco + Wessel (Creators) + Jeff (interface-only editor) = **3 paid seats** minimum. Sascha, Kerry, Alyssa are **free** if view-only; +1 seat each only if they need edit rights. Requesters submit via free form links → **R0**.
- Team, 3 seats ≈ **$60/mo (~R1,100/mo)**; 6 seats ≈ $120/mo.
- Business, 3 seats ≈ $135/mo; 6 seats ≈ $270/mo.

---

## 2. Proposed base structure

Single base, Maynardville-owned. Tables:

1. **Performances** — one row per dated performance. Fields: Production/Event, Date, Time, Venue, Capacity, `Quicket Event ID`, `Quicket Schedule ID`, Public-show/School/SASL flags. Source of the form "Performance" dropdown.
2. **Comp Requests** — the heart of the system. Fields per brief §7 (Guest Name, Surname, Performance [link→Performances], Category [link→Categories], Guest Email, House Seats, Notes, Seats Requested, **Ticket Status** [single select], Seat Numbers, Ticket Reference, **Requester** [link→Requesters], Submitted At, Approved By, Approved At). Plus rollups/formulas for reporting and missing-data flags.
3. **Requesters** — approved requesters, role, and **Allowed Categories** (link→Categories). Drives per-person forms and category restriction.
4. **Categories** — controlled list: Competition Winners, Cast/Crew/Team Comp, VIP, Media, Partner/Sponsor, Friends/Family, Box-Office.
5. **Guests / Contacts** — optional dedupe of guests + attendance history (POPIA-relevant; see §10).
6. **Quicket Sales** — synced/imported ticketing rows (per performance / ticket type / sales count) for sales-vs-comp reporting.
7. **Approval Log** — append-only audit of approvals, declines, status overrides, issuer edits (who/what/when).
8. **Users / Roles** — internal users ↔ Airtable accounts ↔ role, for the "current user" interface filters.

Designed to roll forward season to season: a new year = new Performances rows (+ archive/`Season` field on Comp Requests), not a rebuild.

---

## 3. Permission architecture (how each brief rule is met)

The model is **Interfaces + interface-only access + a `Requester`/`User` field + field-level editable settings** — no external code required.

- **Requesters** never get base access. Each submits through a **form** (free). The form **pre-fills + hides** their Requester via the share link's prefilled-field parameter, and shows **only their allowed categories** (a dedicated form per requester, or a single form with conditional category logic). They cannot see the base or other submissions, and Ticket Status / Seat Numbers / Ticket Reference are simply not on the form.
- **Jaco & Wessel** = base **Creators** (full edit, approve, override, edit the locked Full Comps list).
- **Jeff** = **interface-only editor** on the Box Office interface. In the record-detail layout, only **Seat Numbers, Ticket Reference, Ticket Status** are set **Editable**; everything else **View-only**. Because he has no base access, he can't reach the data any other way. (Belt-and-braces: also set base **field editing permissions** so those are the only fields he could ever edit.)
- **Sascha / Kerry / Alyssa** = interface-only viewers (free) on their department interface, filtered to their categories. Grant interface-only **editor** + a "Notes (PR)" type editable field only if they need to annotate.
- **Record-level scoping** uses interface "Filter by → specific records" on Category (e.g., PR interface shows only Media/VIP). "Viewer's records" (current-user) filtering is available if we want each requester to see their own history later.

---

## 4. Complimentary-ticket workflow & statuses

**Statuses (proposed):** `REQUEST` → `TO ISSUE` → `ISSUED`, plus `DECLINED`, `CANCELLED`, and `DUPLICATE/ERROR`. (Internal `TO APPROVE`/`APPROVED` collapsed into the REQUEST→TO ISSUE transition to keep it simple, per brief §9.)

1. **Submit** → form creates a Comp Request, Status defaults `REQUEST` (requester can't edit it).
2. **Notify** Jaco & Wessel (automation; full detail + deep link to the approval interface).
3. **Approve** (either one) on the Leadership interface → Status `TO ISSUE`; capture Approved By + timestamp; write to Approval Log.
4. **Box Office queue** — TO ISSUE records appear in Jeff's **TO ISSUE** panel (interface view filtered to Status = TO ISSUE).
5. **Issue** — Jeff draws the comp in Quicket, enters Seat Numbers + Ticket Reference, sets Status `ISSUED`.
6. **Move** — record leaves TO ISSUE and lands in **FULL COMPS LIST** (view filtered to Status = ISSUED).
7. **Lock** — Full Comps List is read-only to everyone except Jaco/Wessel (field/table editing permissions + interface view-only).

**Automations (Airtable-native):** new request → notify; approved → notify Box Office; declined → notify requester/internal; issued → (status drives the view move automatically); **missing-data alert** → flag/notify where Status=ISSUED but Seat Numbers or Reference blank; optional daily/weekly comp summary by performance/category/requester. Channel: **email to start** (zero setup); Slack/Google Chat easily added if they have a workspace.

---

## 5. Quicket integration — what's actually possible

**Verified:** Quicket has a **full REST API** (`https://api.quicket.co.za/api`) **and** webhooks. This is much stronger than "exports only."

- **Auth:** `api_key` (query string, from developer.quicket.co.za) + **`usertoken` header** for private resources (guest lists, etc.).
- **Events endpoint** returns: event name/description/venue/organiser, **`tickets[]`** (id, name, price, soldOut, salesStart/End, donation flag), and **`schedules[]`** (id, name, startDate, endDate) — **`schedules` maps directly to Maynardville's individual performances.** Supports `lastModified` for incremental syncs.
- **Guest list** is accessible with the usertoken (intro explicitly cites "retrieving the guest list for your event").
- **Webhooks:** four hooks — `checkout_started`, `checkout_cancelled`, `eft_pending`, `checkout_completed` — POST JSON incl. reference, event_id, event_name, amount, email, event_date, and `tickets[]` (id, attendee_name, attendee_email, ticket_type, price, barcode). Official **Zapier** integration also exists.

**Recommended method (no external middleware needed for the pilot):**
- **Scheduled pull:** an Airtable **automation "Run a script" action** calls the Quicket API daily to upsert Performances (from `schedules`) and Quicket Sales (ticket types + sold counts). Incremental via `lastModified`.
- **Real-time sales (optional):** point a Quicket webhook at an Airtable **"When webhook received"** automation trigger → append to Quicket Sales. No server to host.
- Add **Make.com** only if we need richer transformation, retries, or to keep API keys out of Airtable scripts. Keeps everything Maynardville-owned.

**Limitations / unknowns to flag (see §6).**

---

## 6. Risks, limitations & open questions

1. **Branding ≠ website** in Airtable Interfaces (logo + accent only). Decision needed (see §0).
2. **Comp issuance may not fire a webhook.** Webhooks are checkout-driven. If Jeff "draws" comps via the Quicket organiser back-end rather than a R0 checkout, no `checkout_completed` event fires. **Mitigation:** Jeff already enters the Quicket reference manually (brief §8 step 5), and a scheduled **guest-list API pull** can reconcile issued comps. We confirm exact behaviour in Phase 1 with Maynardville's real Quicket account.
3. **Seat numbers likely don't exist in Quicket** (general-admission/barcode model). The brief already has Jeff entering seat numbers manually — consistent. Confirm whether Maynardville uses allocated seating at all.
4. **Capacity/attendance** isn't a clean single API field (only ticket `soldOut` + sold counts). Capacity probably entered manually per performance; attendance derived from sold/scanned counts. Confirm.
5. **Quicket API rate limits / token scope** aren't publicly documented. Validate quotas and that the usertoken exposes guest lists at the needed granularity in Phase 1. **We need API access enabled on Maynardville's Quicket account** (developer.quicket.co.za) early.
6. **POPIA:** pulling purchaser names/emails into Airtable is processing personal data. Need lawful basis, access control (covered by the permission model), retention limits, and an export/delete process. See §10.
7. **Interface-permission edge cases** (e.g., user *groups* and "granular interface permissions" are Business-tier). If departmental user management gets heavy, that's the trigger to move to Business. Verify the exact Team-vs-Business interface-permission boundary during a Phase-1 trial before committing seats.
8. **"Unique link per requester" is obscurity, not authentication.** Form links are unguessable but not logged-in. Acceptable for comp requests (low-risk, internal-ish); note it so no one assumes it's hard auth. True per-user login would require interface access (a billable seat) or Portals (add-on).

---

## 7. Phased plan & indicative timeline

| Phase | Work | Est. |
|---|---|---|
| **1. Discovery & architecture** | Confirm plan (Team), get Quicket API access, validate webhook/guest-list behaviour, finalise base map & roles, confirm branding decision | ~1 week |
| **2. Comp-ticket pilot (priority)** | Build tables, per-requester forms, approval workflow, Box Office interface (TO ISSUE → FULL COMPS LIST), automations/notifications, test data | ~1.5–2 weeks |
| **3. Quicket integration** | Scheduled API sync (Performances + Sales), optional webhook, sales-vs-comp views | ~1 week |
| **4. Departmental dashboards** | Leadership, Box Office, PR/Media, Sponsorship, Operations interfaces | ~1–1.5 weeks |
| **5. Test, train, handover** | UAT, permission testing, docs (§15), training session, handover to Maynardville-owned account | ~1 week |

Total ≈ **5–6 weeks** part-time, with the **pilot usable by end of Phase 2**.

---

## 8. Section 17 — answers (full)

1. **Recommended Airtable plan:** **Team** for the pilot (supports interfaces, interface-only collaborators, field/table editing permissions, automations, Web API). Upgrade to **Business** for admin panel/SSO governance, user groups, granular interface permissions, or higher automation/API limits as usage grows.
2. **Base structure:** 8 tables — Performances, Comp Requests, Requesters, Categories, Guests/Contacts, Quicket Sales, Approval Log, Users/Roles (see §2).
3. **Permission architecture:** Interfaces + interface-only access + field-level editable settings + record filters; Creators (Jaco/Wessel), interface-only editor (Jeff), interface-only viewers (depts), free form links (requesters). (see §3).
4. **Can all requester-specific forms be native?** **Yes.** Native Airtable forms with prefilled+hidden Requester and per-requester category options (separate form per requester, or one form with conditional fields). No code.
5. **Can Jeff's limited field-editing be native?** **Yes.** Interface-only access + only Seat Numbers/Ticket Reference/Ticket Status set Editable in the interface, reinforced by base field-editing permissions. No workaround needed.
6. **Quicket integration method:** REST API (scheduled "Run a script" sync of events→schedules/performances + sales) + optional webhook into an Airtable webhook-trigger automation. (see §5).
7. **Quicket API/webhook limitations:** webhooks are checkout-driven (manual comp draws may not fire one); capacity/attendance/seat-numbers not cleanly exposed; rate limits/token scope undocumented — validate in Phase 1. (see §6).
8. **Is middleware required?** **No for the pilot** — Airtable native automations (scripting + webhook trigger) suffice. Add **Make.com** optionally for richer transformation/retries; avoid Zapier-as-dependency to keep ownership clean.
9. **Timeline:** ~5–6 weeks total, pilot live after Phase 2 (~2.5–3 weeks in). (see §7).
10. **Cost estimate:** Once-off build (quote by phase). Running cost = Airtable seats only: **Team ≈ $60–120/mo (~R1,100–2,200)** for 3–6 edit users; requesters/viewers free. +Make.com (~$0–9/mo) only if used. (Convert to ZAR + your build fee for the actual quote.)
11. **Support & maintenance:** offer (a) handover + docs + training only, or (b) a monthly retainer for season setup (rolling performances forward, adding/removing requesters, monitoring syncs, tweaks). Recommend (b) across the festival run.
12. **Risks & limitations:** see §6 — branding gap, comp-webhook uncertainty, seat/capacity data gaps, POPIA, Team/Business interface-permission boundary, link-obscurity vs auth.
13. **Recommended phased rollout:** as the brief's Phases 1–5; **comp-ticket module first as the pilot** (§7).

---

## 9. Documentation & handover (brief §15) — committed deliverables
Base map, table/field dictionary, role & permission guide, form-link register, dashboard guide, automation list, Quicket integration notes, troubleshooting guide, and runbooks for *add a performance*, *add/remove a requester*, and *roll forward to a new season* — plus one live training session.

## 10. POPIA / data-ownership notes
All data, base, automations, API keys and Quicket credentials live in **Maynardville's** Airtable + Quicket accounts; vendor holds no exclusive control. Personal data (guest names/emails, purchaser data) is access-controlled by the permission model, retained per a defined policy (e.g., purge purchaser PII N months post-season), and exportable/deletable on request. Recommend a short data-handling note in the handover pack.

---

### Sources
- Airtable pricing — airtable.com/pricing (plans, limits, billing rules).
- Airtable Interface Designer permissions — support.airtable.com/docs/interface-designer-permissions (interface-only users = paid; per-field editable; current-user filters).
- Airtable field & table editing permissions — support.airtable.com/docs/using-field-and-table-editing-permissions (Team/Business/Enterprise; applies to API too).
- Quicket API — docs.quicket.com (REST, api_key + usertoken, Events with tickets[]/schedules[], guest list).
- Quicket webhooks — help.quicket.com/portal/en/kb/articles/using-webhooks (4 hooks, JSON payload, Zapier).
