# Response Engine — Project Plan

*Working name from the client meeting ("the response engine part"). POPIA-compliant recruitment response-handling automation. HS Labour is customer #1; built as a standalone, sellable product.*

**Source:** client meeting transcripts (4 parts) at `C:\Users\info\transcribe\conversation-full.txt` (2026-07-08).

---

## 1. What it is

Recruitment agencies running response handling (esp. government campaigns) receive thousands of applications by email — CVs, Z83 forms, certified documents — and manually capture them into Excel under a 3-business-day SLA. The Response Engine watches campaign mailboxes, extracts and validates the data with AI, consolidates each candidate into one record, and delivers the client's familiar outputs (Excel + SharePoint folders + a full email reconciliation log) automatically, within minutes of each email arriving.

POPIA compliance is the product's spine, not a feature: every campaign is an isolated data container owned by the end-client, deleted after the campaign with a dated deletion certificate.

## 2. Commercial model (settled 2026-07-08)

- **IP:** owned by Alec / Firewire — HS Labour **licenses/subscribes** (setup + monthly retainer). Resale to other agencies stays open.
- **To settle before quoting Phase 1:** written licence/service agreement stating IP ownership. Do not start build on a handshake.
- **Their revenue model aligns with ours:** they charge *per CV handled* — the system counts billable units (spam excluded) and produces the invoice evidence.

## 3. Architecture decision (settled 2026-07-08)

**Option C — fully standalone product.** Own repo, own infrastructure, zero shared code/data with the hslabour.co.za website. Rationale: client explicitly required standalone/modular twice (POPIA); resale requires clean IP; workload (mailbox watching, PDF flattening, LLM extraction) is background-job-shaped, not marketing-site-shaped. Full options analysis in the 2026-07-08 conversation.

**Single-tenant-lean:** `organisation_id` scoping on every table from day 1, but no tenant onboarding UI or billing until agency #2 is real.

### Components

| Component | Choice | Notes |
|---|---|---|
| Dashboard | Next.js on Vercel | Admin/staff UI: campaigns, candidates, logs, settings |
| Database | Dedicated Supabase project (Alec's account, NOT HS Labour's) | RLS, org/campaign scoping |
| Worker | Small always-on host (Railway/Fly/VPS) | Mailbox ingestion, PDF flattening, LLM extraction, Excel writes |
| Email + files | **Microsoft Graph API** into HS Labour's M365 tenant | Mail (incl. Junk folder) via change notifications/polling; SharePoint folders; Excel workbook writes |
| Text extraction | DeepSeek (cheap text) + vision model (Gemini Flash) for scans | Per-CV cost tracked per campaign |
| PDF flattening | qpdf/pikepdf in worker | Solves the Z83 fillable-form data-bleed problem |

**Key design point:** candidate files and the campaign Excel live in **HS Labour's SharePoint** (their tenant = data at rest with them, POPIA gold). Our DB holds extracted/structured data + audit log, encrypted, deleted per retention policy. Selling to agency #2 = point the engine at *their* M365 tenant.

## 4. Data model sketch

- `organisations` — agency (HS Labour = row 1)
- `campaigns` — one recruitment project/job; the **isolation + retention boundary**; status, closing date, SLA due, retention policy, client name, channel (email/form/both)
- `campaign_fields` — the custom field picker: stable core (personal, qualifications, work history) + per-campaign technical competencies & demographics; reusable field library ("system remembers fields for future")
- `candidates` — per campaign; dedupe key = **ID number**, fallback surname+first+second name; merged across multiple emails
- `intake_events` — every email (message id, from, received ts, captured ts, folder inbox/junk, spam verdict, processing outcome) → the reconciliation logbook + per-CV billing count
- `documents` — CV/Z83/certs per candidate; pointer to SharePoint path
- `extractions` — AI output + validation results (missing fields → auto-reply sent / admin flagged)
- `audit_log` — who did what when
- `deletion_certificates` — campaign purge record (what, when, confirmation)

## 5. POPIA design (selling points, build them properly)

1. Campaign = sealed container; no cross-campaign search, ever (the PNet trap the client fears)
2. Retention timer per campaign → purge job → **dated deletion certificate** (they promise this to clients today, manually)
3. Full email reconciliation: "2,000 in, 1,998 processed, 2 spam" — client-facing log
4. Received date vs captured date both recorded (their current traceability practice)
5. Copy of original email stored with the candidate (they do this manually today)
6. Encryption at rest; ID numbers app-level encrypted; access audit

## 6. Phases

### Phase 0 — Discovery & access (blocks Phase 1 quote)
1. Client sends the Excel template (dummy data) → verify: field list drafted into `campaign_fields` core set
2. Screen-share session: watch real emails arrive → verify: ingestion notes + 3+ sample shapes documented
3. Sample batch: Z83s (fillable / hand-filled scanned / photographed), CVs, application email → verify: extraction spike parses ≥1 of each
4. M365: confirm tenant, get admin consent for a Graph app registration (Mail.Read on campaign mailboxes, Sites.ReadWrite for the SharePoint site) → verify: test app reads a test mailbox incl. Junk
5. Licence/IP agreement signed → verify: document exists
6. Quote Phase 1

### Phase 1 — Capture engine (the meeting's "phase 1": capture all the data)
Email channel end-to-end for one pilot campaign:
- Mailbox watch (inbox + junk) → intake_events log
- Extraction: PDF/scan/image → structured fields; Z83 flatten-then-extract
- Candidate consolidation by ID number (fallback names)
- Campaign Excel written to SharePoint + candidate document folders + email copies
- Missing-info handling: auto-reply to candidate (per-campaign toggle) or admin flag column
- Dashboard: campaign setup, live candidate list, reconciliation log, field picker (core set)
- Verify: pilot campaign processed alongside the manual team; outputs match QC; capture latency ≤ minutes; every email accounted for

### Phase 2 — Forms channel (private clients)
- Multi-step validated public form per campaign (can't advance with required fields missing — kills the 79-page-CV problem)
- Form builder driven by `campaign_fields`
- Verify: a private-client campaign runs form-only with zero manual capture

### Phase 3 — Shortlisting & reporting (the meeting's "phase 2")
- Criteria engine over captured data (SA citizen, province/municipality, competencies, experience, demographics per client spec)
- Stats pack for the end-client (applicant counts, demographics, email totals)
- Cover sheet generator (standardized one-page CV overview → PDF; they used Power Automate for this before)
- Verify: shortlist for a past campaign matches the manual shortlist

### Phase 4 — Productization (when agency #2 appears)
- Tenant onboarding, per-tenant M365 connection, billing, white-label
- Retention automation hardening, pen-test/security review

## 7. Running costs (estimate)

| Item | Cost |
|---|---|
| Supabase | free → $25/mo |
| Worker host | ~$5–10/mo |
| Vercel | free tier likely fine |
| LLM per campaign | ~R400–R900 per 5,000 applications (DeepSeek text + vision on scans) — trivial vs per-CV revenue |
| M365 | client already pays |

## 8. Open questions for the client

1. Email host confirmed M365? Which mailboxes; dedicated mailbox per campaign possible?
2. Excel template (promised in meeting — chase)
3. Sample Z83s/CVs/emails (anonymised)
4. Screen-share session (offered in meeting — schedule)
5. Retention rules precisely: delete when, triggered by what, certificate format?
6. Day-3 deliverable spec: Excel + CV folder + email copies + logbook + cover sheets?
7. "Per CV handled" billing definition (spam excluded how?)
8. Team size, roles, who QCs, who's admin
9. Graph app admin consent — who is their M365 admin?

## 9. Known technical landmines (from the meeting)

- **Z83 fillable-form bleed:** multiple fillable PDFs in one batch leak data across forms; must flatten before extraction (cost them ~R5,000 + a day last time)
- **Z83 is legally immutable** — candidates must use the official form; we extract, never regenerate
- **Spam folder is in scope** — emails land there and must be counted (billing + fairness)
- **Government = email channel forever;** private clients = form. Both channels permanent.
- **Confidential executive applications** — access control and isolation are non-negotiable (NDA'd CEO-level candidates)
