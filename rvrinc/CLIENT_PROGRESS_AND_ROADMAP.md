# Roets & Van Rensburg Inc.

## Website & Client Platform — Progress Report and Forward Roadmap

**Prepared:** 8 May 2026
**Project:** rvrinc (web platform, client portal, staff portal, automation)
**Status:** Production-ready core (~85% complete) with a defined roadmap for office-system automation.

---

## 1. Executive Summary

Over the past development cycle we have built RVR Inc. a **complete, secure legal-services platform** consisting of three integrated parts:

1. **A public-facing marketing website** that positions the firm against competitors such as de Broglio, Thorrington-Smith & Silver, Adams & Adams, and Shields Attorneys.
2. **A staff portal** that lets attorneys, admin staff and paralegals manage cases, clients, documents, appointments and RAF prescription deadlines from a single dashboard.
3. **A client portal** so that every client can log in to follow their matter, see status updates, book appointments, view documents and respond to requests for action — without phoning the office.

The platform is built on **Next.js 14, Supabase (PostgreSQL + Auth + Storage), Tailwind CSS** and is deployed on Vercel. It is mobile-first, fast and secure.

The next phase, described in section 5 of this document, focuses on **automation** — connecting the platform to the firm's existing **Microsoft 365 / SharePoint** environment, adding **AI-assisted document search**, and removing the most repetitive manual steps from daily practice.

---

## 2. What Has Been Delivered

### 2.1 Public Website

| Page | Status | Notes |
|------|--------|-------|
| Home (Hero, Welcome, Service Grid) | Complete | |
| About (firm history, both offices) | Complete | Pretoria & Marble Hall |
| Practice Areas (overview + 6 detail pages) | Complete | Civil Litigation, Family Law, Commercial Law, Property Law, Personal Injury (RAF), Criminal Law |
| Team (attorney profiles + individual pages) | Complete | Marius Roets, Johan van Rensburg, Sarah Nkosi |
| Contact (form + office details + map modal) | Complete | Dual-email (admin + auto-reply to client) |
| Start a Claim (5-step RAF intake wizard) | Complete | Personal → Accident → Injuries → Documents → Review |
| Book a Consultation | Complete | Logged-in clients only |
| PAIA Manual | Complete | Statutory compliance page |
| Privacy Policy | Complete | POPIA-aligned |
| Insights / Blog | **Stub — content engine pending** | 3 sample posts authored; rendering not yet wired |
| Sitemap, robots.txt | Complete | SEO ready |

### 2.2 Staff / Admin Portal

A full back-office for the firm. Role-aware: **admin**, **attorney** and **staff** see different scopes.

- **Dashboard** — live counts of cases, clients, documents and pending appointments.
- **Prescription Alerts** — every RAF case where the 3-year prescription is approaching is surfaced on the dashboard with colour-coded urgency (yellow → orange → red → expired) and a deadline countdown.
- **Cases Module** — full create / read / update workflow. **34 RAF-specific statuses** organised across **6 phases** (Intake, Claim, Litigation, Court, RAF Damages, Settlement). Each status carries a clear client-facing message and a flag for "client action required".
- **Clients Module** — directory with profile, linked cases, contact details.
- **Documents Module** — upload, list, link to case; stored privately in Supabase Storage (`case-documents` bucket).
- **Bookings Module** — accept / confirm / cancel appointments.
- **Reports Module** — pipeline by phase, case analytics (partial — see section 4).
- **Users Module** — invite clients & staff, set roles.
- **Settings Module** — system / database health checks.

### 2.3 Client Portal

Every client logs in to a private space showing **only their own matters**.

- **My Cases** — current status with a plain-language explanation, phase progress bar, and a flag when the firm needs them to act.
- **Documents** — view and download anything the firm has shared with them; upload their own (e.g. medical reports, police statements).
- **Appointments** — request and view consultations.
- **Profile & Settings** — update contact details, change password.

### 2.4 Automation Already Live

- **Email confirmations** on every contact form submission (branded HTML, both to the firm and to the client).
- **Daily prescription cron job** — runs every morning, scans every active RAF case, and emails the assigned attorney + admin at **90, 60, 30 and 0 days** before prescription, plus an "expired" alert.
- **Case-update emails** — when an attorney updates a case status, the client can be automatically notified with a link to the portal.
- **Role-based access** enforced at database level (Supabase Row-Level Security) — clients cannot see other clients' files even if they tried.
- **Email + password reset** flow with magic-link callback.

### 2.5 Security & Compliance

- HTTPS-only, Vercel edge network.
- Database-enforced row-level security on every table.
- Private storage bucket for case documents.
- POPIA-aligned privacy policy + PAIA manual published.
- Authentication via Supabase (industry standard, OAuth-ready).
- No client data ever leaves South African / EU-grade infrastructure unless the firm explicitly opts in to a third-party feature.

---

## 3. Where We Compare Well to Competitors

| Feature | RVR Platform | de Broglio | Thorrington-Smith | Shields | Adams & Adams |
|---------|:-----------:|:----------:|:----------------:|:-------:|:-------------:|
| Public marketing site | Yes | Yes | Yes | Yes | Yes |
| Online claim intake form | **Yes** | Partial | No | No | No |
| Client login portal | **Yes** | Limited (status only) | Limited | No | No |
| Live RAF status (34 stages) | **Yes** | Bi-weekly emails | No | No | No |
| Self-service appointment booking | **Yes** | No | No | No | No |
| Auto prescription-deadline alerts | **Yes** | Internal only | Internal only | Internal only | Internal only |
| Document download to client | **Yes** | Yes | Yes | No | No |

**Take-away:** RVR's platform is already **ahead of most direct competitors in client transparency**. The biggest competitor advantage we can press further is **automation behind the scenes** — getting the firm's documents, emails and matters working as one system (section 5).

---

## 4. Outstanding Items (Phase 1 Wrap-up)

These are items already scoped that we recommend completing before moving on to Phase 2 automation.

| # | Item | Effort | Why it matters |
|---|------|--------|---------------|
| 1 | Wire up the **Insights / Blog** section to render the existing posts and accept new ones via the admin panel | Small | SEO and thought-leadership; competitors all run blogs |
| 2 | Finish the **Reports** dashboard (closed-won, average matter duration, pipeline value, attorney workload) | Small–Medium | Partner-level visibility; replaces spreadsheets |
| 3 | Build the **Invite Client / Invite Staff** email backend (UI exists; sender not yet wired) | Small | Removes manual user-creation in Supabase |
| 4 | Add **search and filter** to the Cases list (by client, status, attorney, date) | Small | Productivity for attorneys with growing caseloads |
| 5 | Add a **case-status history / audit trail** table so every change is timestamped and attributed | Small | Compliance, dispute defence |
| 6 | Add **bulk actions** in admin (bulk close, bulk reassign attorney) | Small | Quality-of-life |
| 7 | Add **WhatsApp & SMS notifications** as alternatives to email (Twilio or Clickatell) | Medium | Many SA clients respond faster to WhatsApp than email |
| 8 | **Mobile responsiveness QA** on every admin screen | Small | Attorneys use phones in court |
| 9 | **Accessibility audit** (WCAG 2.1 AA) | Small | Statutory good-practice |
| 10 | **Backup & disaster-recovery runbook** | Small | Document the existing nightly backup; confirm offsite copy |

---

## 5. Phase 2 — Automation, SharePoint Integration, AI

This is where the platform stops being a website and starts running the office.

### 5.1 Microsoft 365 / SharePoint Integration

The firm currently stores most working files on **Microsoft SharePoint**. Re-keying that data into the platform is the single biggest source of friction. We propose connecting the two systems directly.

**How it works (technical, in plain language):**

- We register the RVR platform as an application inside the firm's **Microsoft Entra ID (Azure AD)** tenant.
- We use **Microsoft Graph API** — the official Microsoft interface — to talk to SharePoint on the firm's behalf.
- Staff sign in once with their Microsoft 365 account (single sign-on); the platform then has permission to read and write files in the SharePoint sites the firm chooses.

**What that gives the firm:**

| Capability | Description |
|-----------|-------------|
| **Matter-folder auto-provisioning** | When you open a new case in the platform, it creates a structured folder in SharePoint (`/Matters/2026/RAF/Case-1234 — Client Name/Pleadings`, `/Discovery`, `/Medical`, `/Correspondence`) automatically. No more manual folder-making, no more "where did Sarah save it?". |
| **Two-way file sync** | Documents uploaded to a case via the client portal land in the matching SharePoint folder; documents added in SharePoint show up against the matter in the platform. One source of truth. |
| **In-platform preview** | Attorneys can read Word, PDF and Excel files inside the case page without downloading. |
| **Permissions inherit case access** | If a client only has access to their own matter, the underlying SharePoint folder shares the same restriction. |
| **Email-to-matter** | Forward any email (from Outlook) to a special address — the platform attaches it to the right case in SharePoint. AI-assisted "this email looks like it belongs to Case 1234" suggestions. |
| **Archive on closure** | When a matter is closed, the platform tags the SharePoint folder, freezes write-access, and moves it to a long-term archive site for compliance retention. |

### 5.2 AI-Assisted Search & Knowledge

This is what modern competitors (Harvey, Spellbook, LexisNexis Protégé, Microsoft Copilot for Legal) are starting to do. We can offer the same to RVR at a fraction of the cost by combining the firm's own documents with a private AI layer.

| Capability | Real-world example |
|-----------|--------------------|
| **Natural-language document search** | "Show me every Section 17 RAF letter we sent in the last six months for child claimants." Returns matching files across SharePoint and the platform. |
| **Question-answering on a single matter** | Open a case → ask "what did the radiologist conclude in the most recent MRI?" → AI answers and cites the document and page. |
| **Precedent / template search** | "Find me a divorce settlement agreement we used where there was a trust involved." |
| **Auto-summary of new documents** | When a 200-page expert report is uploaded, the platform produces a 1-page summary inside the matter. |
| **Email triage** | Suggests which case an inbound email belongs to; suggests a draft reply based on the matter's current status. |

All AI processing can be configured to run **inside the firm's Microsoft tenant** so client data never leaves the firm's perimeter.

### 5.3 Workflow Automation (no SharePoint required)

These are smaller wins we can deliver alongside the SharePoint work.

- **Auto-generate court-ready document bundles** (combined PDF with index, page numbers, bookmarks) for any case — replaces hours of paralegal work.
- **Auto-fill RAF claim forms** from the data already captured in the platform.
- **Diary integration** — push appointments straight into each attorney's Outlook calendar; clients receive .ics invites.
- **Trust-account reminders** — flag matters where funds in trust have been there too long without a client letter.
- **Onboarding pack** — when a new client is invited, they automatically receive a welcome email, a fee mandate, a FICA-compliant document request, and a portal-login link.
- **Compliance dashboard** — single screen for partners showing FICA status, prescription risk, complaints register, files due for archive.

### 5.4 Client-side Self-Service

- **Document upload checklists** — "to progress your matter we need: ID, proof of address, accident report, medical records." The portal tracks what is in and what is missing, and prompts the client.
- **Status-change push notifications** to phone (PWA install) — no email needed.
- **Client e-signature** of mandates and consent forms (no DocuSign cost — we can use Supabase + a lightweight signing flow).
- **Client referral link** — every client gets a personal referral URL; the firm can track and reward referrals.

---

## 6. Suggested Phasing & Sequencing

| Phase | Scope | Indicative duration |
|-------|-------|---------------------|
| **1.5 — Wrap-up** | Items 1–10 from section 4 | 2–3 weeks |
| **2A — SharePoint connection** | Microsoft Entra app registration, SSO for staff, matter-folder auto-provisioning, two-way file sync | 3–4 weeks |
| **2B — Email-to-matter + Outlook calendar** | Forwarding address, AI matter-suggestion, diary push | 2 weeks |
| **2C — AI document search** | Indexing of SharePoint + platform documents, natural-language search inside cases | 3–4 weeks |
| **2D — Court-bundle generator + auto-fill RAF forms** | Document-assembly engine | 2–3 weeks |
| **3 — Client self-service polish** | Checklists, e-signature, push notifications, referral link | 2 weeks |

Phases 2A–2D can run in parallel with continued client use of the existing platform — no downtime.

---

## 7. What We Need From the Firm to Start Phase 2

1. **A Microsoft 365 Global Administrator** to authorise the platform's app registration (a 5-minute consent screen, one time).
2. **A decision on which SharePoint site(s)** are the source of truth for matters.
3. **A standard folder layout** the firm wants every new matter to follow (we will propose one).
4. **Access for one paralegal and one attorney** as design partners during the rollout — to make sure the workflow matches how the office actually runs.
5. **A list of the 5 most repetitive tasks** anyone in the office does each week — we will automate the top of that list first.

---

## 8. Closing

The website and portal you have today already give RVR Inc. a **client-experience advantage** over the established Pretoria personal-injury firms. Phase 2 turns that advantage into an **operational advantage**: less duplication, faster turn-around, fewer prescription scares, and a partner-level view of the whole firm at a glance.

We are ready to begin Phase 1.5 wrap-up immediately on sign-off.

---

*Prepared by the development team. References used in preparing this document: Microsoft Graph API documentation, SharePoint legal-DMS guidance (PageLightPrime 2026), competitive review of de Broglio Attorneys, Thorrington-Smith & Silver, Shields Attorneys, Adams & Adams.*
