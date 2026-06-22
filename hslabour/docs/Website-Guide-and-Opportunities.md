# H&S Labour Brokers — Website Guide & Growth Opportunities

*Prepared for the H&S Labour Brokers team. This document explains what the new website does (page by page), what the admin area lets you manage, and a prioritised list of where we can take it next — benchmarked against competitors, functionality nobody else is doing, and AI automation tailored to labour broking and recruitment.*

---

## 1. The website at a glance

The new site is a modern, fast, search-optimised platform built to serve **two audiences at once**:

- **Employers** who need staff — permanent, contract or temporary (TES).
- **Job seekers** who want work, plus paid tools and services to help them get hired.

It is more than a brochure site. It already includes a **job portal, an online shop, a paid e-book, an affiliate programme, a customer service portal, an AI article engine, and a full admin back office** — all under one roof, built to rank on Google and to be quoted by AI search tools (ChatGPT, Google AI Overviews, etc.).

**Foundations:** built on a modern framework (Next.js) with a Supabase database, PayFast payments, structured data for search engines, automatic sitemaps, an `llms.txt` file for AI crawlers, security hardening, and a parallax visual design.

---

## 2. Public pages — what each one does

| Page | Purpose |
|------|---------|
| **Home** | The shop window. Hero, a split for employers vs job seekers, service highlights, company stats, an e-book promotion, testimonials, accreditations and clear calls to action. |
| **About** | The H&S story, experience since 1998, values and credibility builders. |
| **Services** | Overview of all six service lines, each linking to its own detailed page. |
| **Service detail pages** (×6) | One in-depth, SEO-optimised page each for: Permanent & Contract Recruitment, Temporary Employment Services (TES), Payroll & Timesheets, Vetting & Risk Screening, HR & IR Management, and CV Response Handling. Each has its own FAQ and structured data. |
| **Location landing pages** | Automatically generated "service in city" pages (e.g. *Labour Broking in Cape Town*) covering your main cities. These capture local search traffic — a large SEO advantage. |
| **Jobs** | Live current vacancies, pulled directly from your PlacementPartner system so the list is always up to date. |
| **Submit your CV** | A dedicated page where job seekers submit their CV straight into PlacementPartner, building your talent pool. |
| **Employers (Hire Staff)** | The employer pitch — what you handle, your process, your guarantee — with a "Request Staff" enquiry form. |
| **Shop** | An online store of job-seeker products: CV templates (private & government sector), CV Revamp, Cover Letter writing, Criminal Record Checks, Qualification Verification and Umalusi Matric Certification. |
| **E-book** | Sells your job-hunting e-book with secure PayFast checkout and instant download. |
| **Affiliate Program** | Lets anyone sign up to promote the e-book and earn commission — a free, self-running referral engine. |
| **Insights** | An AI-assisted article hub (hiring, labour law, payroll, careers, employment trends) that builds authority and pulls in search and AI traffic. |
| **Contact** | Contact details, office hours, areas served, and an enquiry form (spam-protected). |
| **Legal** | Privacy Policy (POPIA), Terms & Conditions, and PAIA pages. |

**Accounts & self-service areas**

- **Login / Sign up / Forgot password** — secure accounts with email verification.
- **Affiliate Dashboard** — affiliates see their referral link, tracked sales, commission earned, and can enter their banking details for payouts.
- **Customer Order Portal** — when someone buys a "done-for-you" service (e.g. CV Revamp or a Criminal Record Check), they get a private tracking link to upload documents, book a fingerprint appointment, see their order status and SLA, download the finished file, and request a revision — no login required.

---

## 3. The admin area — what you control

The admin back office (at `/admin`, restricted to your team) is the control centre:

| Section | What you do there |
|---------|-------------------|
| **Affiliates** | Review and approve (or decline) affiliate applications and issue tracking codes. |
| **E-book** | Upload the e-book file, set its price and the affiliate commission, and see every sale plus the commission owed (mark commissions approved/paid). |
| **Shop** | Add and edit products, set prices, upload downloadable files, and control which products are visible. |
| **Service jobs** | Manage every "done-for-you" order through its pipeline — received → in progress → delivered — handle uploads, deliverables, consent, fingerprint appointments and turnaround times. |
| **Insights** | Review AI-generated article drafts, edit them, then approve/schedule, publish immediately, or discard. You can also **write an article by hand** or **generate one with AI on demand**. |

In short: **you control the catalogue, the content, the payouts and the order flow yourselves**, without needing a developer for day-to-day changes.

---

## 4. What already makes this site stand out

These are built in and worth highlighting — most competitors don't have them:

- **AI / GEO optimisation** — structured data, an `llms.txt` file, and an authority-building article engine designed so AI search tools cite H&S.
- **Local SEO at scale** — automatically generated city + service pages.
- **Multiple revenue streams** — shop, e-book and affiliate programme, not just lead generation.
- **Self-service portals** — affiliates and service customers manage themselves.
- **Compliance-aware services** — consent capture and in-person fingerprint appointment booking for vetting.

---

## 5. Growth opportunities

### A. Competitor benchmark — what others do, and what we can add

Leading South African recruitment and labour-broking sites commonly offer the following. Where H&S already matches them, it's noted; the rest are opportunities:

| Common competitor feature | H&S status | Opportunity |
|---|---|---|
| Online job listings | ✅ (via PlacementPartner) | Move to a **native, Google-indexed job board** so each vacancy ranks on Google and qualifies for **Google for Jobs** (big free-traffic win). |
| "Request staff" enquiry | ✅ | Add **lead scoring + auto-routing** so hot employer enquiries reach a consultant instantly. |
| Salary / market guides | ❌ | Add a **salary benchmarking tool or downloadable salary guide** — a strong lead magnet that earns backlinks. |
| Client/employer portal | ❌ | A **client login** to view candidates submitted, placements, timesheets and invoices. |
| Candidate talent pool | Partial (CVs into PlacementPartner) | A searchable **talent-pool profile** with skills tags and job alerts. |
| WhatsApp engagement | ❌ | **WhatsApp apply + status updates** — huge in the SA market. |
| Online timesheets (TES) | ❌ | **Digital timesheet capture & approval** for temporary-staffing clients. |
| Reviews / testimonials | ✅ (static) | Pull in **live Google reviews** for trust + local SEO. |

### B. Functionality nobody else is really doing (true differentiators)

- **AI CV review & score** — a free tool where a job seeker uploads a CV and gets instant AI feedback (and an upsell to the CV Revamp service). Lead magnet + shop conversion.
- **AI job-matching** — match candidates to live vacancies automatically and notify them.
- **AI assistant / chatbot** — answers job-seeker and employer questions 24/7, helps people apply, and books employer call-backs.
- **Interactive compliance helper** — a short quiz that tells an employer their TES/LRA obligations, capturing the lead.
- **Candidate "application tracker"** — job seekers see where their application stands (rare and very sticky).
- **Deeper monetisation** — bundle shop services, subscriptions for recurring screening, and an expanded affiliate model.

### C. AI automation opportunities (specific to labour broking & recruitment)

Your services are recruitment, TES, payroll, vetting, HR/IR and CV handling. AI automation can take cost and turnaround time out of each:

1. **AI CV screening & ranking** — automatically parse incoming CVs, match them to a job spec, and rank candidates. Cuts shortlisting time dramatically (directly supports your CV Response Handling service).
2. **AI candidate–job matching & alerts** — continuously match your talent pool to open roles and auto-notify the best fits.
3. **AI job-spec & advert writer** — turn an employer brief into a polished job description and advert in seconds.
4. **Automated vetting workflows** — orchestrate criminal, credit, qualification and Umalusi checks, with status tracking and auto-reminders (extends what the service portal already does).
5. **WhatsApp & email automation** — application confirmations, interview invites, document requests and placement updates, sent automatically.
6. **AI chatbot (dual)** — one trained for job seekers (how to apply, services, e-book) and one for employers (request staff, qualify the lead, book a consult).
7. **Compliance automation** — auto-generate TES/BCEA-compliant contracts and trigger reminders for renewals, deadlines and statutory dates.
8. **Payroll & timesheet automation** — OCR/auto-capture of timesheets, validation and payroll-ready exports.
9. **AI content engine** *(already live)* — the Insights generator; can be extended to LinkedIn posts, newsletters and case studies.
10. **Candidate re-engagement** — automatically reactivate dormant candidates when a matching role appears.
11. **Lead scoring & follow-up** — score employer enquiries and trigger the right follow-up sequence.
12. **AI interview prep** — a paid or lead-gen tool offering mock interviews and feedback (ties into the e-book audience).

---

## 6. Suggested roadmap

A practical order, balancing quick wins against bigger builds:

**Phase 1 — Quick wins (weeks)**
- Switch the jobs page to a **native, Google-for-Jobs-indexed** board.
- Add a **free AI CV review** tool (lead magnet → CV Revamp upsell).
- Turn on **WhatsApp apply + notifications**.
- Go live with the **AI Insights engine** (already built — just needs the API keys switched on).

**Phase 2 — Differentiators (1–2 months)**
- **AI CV screening & candidate matching** for your recruiters.
- **Dual AI chatbot** for the site.
- **Salary guide / benchmarking** lead magnet.

**Phase 3 — Platform (quarter)**
- **Employer client portal** (candidates, timesheets, invoices).
- **Vetting & compliance automation** workflows.
- **Payroll / timesheet automation**.

---

*Everything in Sections 2–4 is built and live (some features, such as the AI Insights engine and online payments, simply need their accounts/keys switched on to go fully live). Sections 5–6 are recommendations we can scope and quote individually.*
