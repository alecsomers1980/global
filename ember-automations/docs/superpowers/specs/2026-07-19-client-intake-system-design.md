# Ember Automations — Client Intake System (Design Spec)

> **Date:** 2026-07-19
> **Owner:** Edward Alec Somers
> **Status:** Design approved — ready for implementation planning
> **Scope:** Intake system only (Track A vessel). Marketing site, change-requests, quotes, and client portal are later cycles.

---

## 1. Purpose

A branded web app that is the **vessel for Track A** of the existing two-track intake system
(vault `reference/client-intake-system.md`). It lets a one-person company:

1. Assemble a per-client questionnaire from a reusable **Core + Module** question bank (Alec curates; AI *may* pre-suggest a starting set).
2. Send the client an **unguessable link (no login)** with **save & resume** and file uploads.
3. Collect answers into a small **admin**, flag gaps/contradictions deterministically, and hand the submission to Claude Code (`review-intake` → `grill-me` → `to-spec`) for follow-ups and a budget-phased spec.

It replaces the current per-client hand-built HTML (the 1,490-line Tindlovu questionnaire) with one reusable, branded system — with **zero per-client hand-coding**.

### Non-goals (this build)
- Marketing pages (home/services/portfolio/contact) — later cycle.
- Change-request flow — later cycle.
- Quotes / invoicing / client portal — later cycles.
- **No LLM in the core flow.** Follow-up *drafting* stays in Claude Code (`review-intake`), which has the vault context and project-aware checks; the app's submission review is deterministic gap detection + export only. The *sole* optional, deferrable exception is admin "AI-suggest modules" at questionnaire creation (§6) — decided in/out during planning.

---

## 2. Positioning & messaging (reference for later marketing cycle)

Chosen framing: **Hybrid** — custom builds + Ember Platforms. True to the actual portfolio, keeps the ember/ignition brand story, retires the too-narrow *"Powering Local Media"* tagline.

> **Ember Automations** — *We build custom websites and systems that automate your business.*
>
> - **Bespoke builds** — a website or internal system built for exactly how a business runs.
>   *(Eastlake Drilling, HS Labour, ExecAir, Aloe Signs, Everest Motoring, Nyoni Education, Wendy Lane, RVR Inc, and more.)*
> - **Ember Platforms** — ready-to-run products operated monthly: **Ember Social** (AI social media),
>   **Ember News** (auto-publishing CMS), **Ember Directory** (regional listings).

Candidate taglines: *"Automate the work your business shouldn't do by hand"* · *"Custom systems. Fanned into flame."*
(Not built now — captured so the marketing cycle starts from a settled position.)

---

## 3. Architecture & stack

Matches every other Ember project — nothing new to maintain.

- **Next.js (App Router) + TypeScript + Tailwind**, wired to the Ember design tokens from
  `ember-automations/brand/BRAND.md` (dark-first, Ember Orange `#f97316`, Inter, glassmorphism, ember glow).
- **Supabase (Postgres)** — questionnaires + answers. **Supabase Storage** — client file uploads.
- **Resend** — transactional email (notify Alec on submit; optionally email the client a link / new round).
- **Supabase Auth** — single allowed admin email (Alec). Admin routes are not public.
- **Vercel** deploy. Lives in the `ember-automations` repo, which grows into the wider platform.
- **No AI/LLM dependency in v1.**

### Three units, each understandable and testable in isolation
| Unit | Does | Uses | Depends on |
|---|---|---|---|
| **Question bank** | Defines reusable Core + Module questions | Imported by admin + client | Versioned TS/JSON in repo (no DB) |
| **Client questionnaire** | Renders a questionnaire snapshot, collects + saves answers, uploads | `/intake/<slug>` | `questionnaires` + `answers` + Storage |
| **Admin** | Assemble questionnaire, review submissions, flag gaps, export | `/admin/*` (auth) | Supabase Auth, the other two units |

---

## 4. Question bank (seeded from vault `reference/client-intake-questions.md`)

**Common Core (~10, every project):** name/org/role · one-line goal/problem · decision-maker/sign-off ·
**budget band + comfortable monthly running cost** · deadline (hard vs flexible) ·
**"start simple & grow" vs "everything day one"** · existing tools/accounts to keep + who owns them ·
POPIA/personal-data rules · 1–2 examples they like (and why) · anything else.

**Modules (pick per project):**
- **Module A — Marketing website:** pages needed · site's #1 job · audience + areas served (local SEO) ·
  who provides content/photos · branding assets (logo/colours/fonts) · domain/hosting owned? ·
  where enquiries go · must-have extras (booking/payments/shop/maps/languages).
- **Module B — Web app / internal tool (Maynardville-shape):** end-to-end process · user roles + permissions ·
  records/data + reports + who sees them · required integrations (ticketing/payment/CRM API) ·
  how outputs reach people · user count + event/season spikes · where it lives (existing tool vs branded app).
- **Extensible:** Module C (e-commerce), Module D (booking), etc. — same Core, new module.

**MoSCoW tagging (anti-oversell, preserved):** candidate features from the chosen module are presented for
the client to tag **Must / Should / Could / Not-yet.** This is the scope/cost-honesty mechanism.

**Question schema (per item):**
`id · module · label · help · type · options? · required · critical(⏳)`
where `type ∈ { text, long, select, multiselect, url, email, number, file, moscow }`.

**Bank storage:** versioned TS/JSON file in the repo (no bank-editor UI in v1). A questionnaire stores a
**snapshot** of its chosen questions, so editing the bank never mutates an already-sent form.

---

## 5. Client experience

- Client opens `/intake/<slug-token>` (unguessable). No login.
- Sees a branded, sectioned questionnaire (the Tindlovu look, generated from the snapshot).
- Answers, uploads files, **saves & resumes** on the same link (answers persist per keystroke/section).
- Submits → confirmation screen.
- If Alec adds follow-ups, the same link reopens with a **"A few more questions"** round; the client answers and resubmits.

---

## 6. Admin experience (`/admin`, Alec only)

1. **New questionnaire** — enter client + project, pick base type (website / tool / existing-project).
   Optionally paste a one-line description + their URL → **AI-suggest** a starting module/question set
   *(assist only; see note)* → tick/untick, add custom questions → **Generate link**
   (optionally email it to the client via Resend).
2. **Submissions list** — status pipeline: `draft → sent → in_progress → submitted → follow_up → ready_to_quote`.
3. **Submission view** — all answers; **deterministic** flags:
   - blank **⏳-critical** questions,
   - contradictions (e.g. GA *and* allocated seats),
   - MoSCoW summary + any conflicts,
   - project-type technical nudges that are pure rules (e.g. comp volume >~100 → note pagination).
   Plus **"Export submission as markdown for `review-intake`."**
   *No LLM here* — this is rule-checking only.
4. **"Ready to quote"** — marks the submission as the input for Claude Code `grill-me` + `to-spec`.

> **AI-suggest note (step 1):** The only place AI *could* appear in v1 is pre-selecting modules from a
> client description. This is optional and low-risk. If it adds meaningful build cost during planning,
> defer it — Alec ticking modules by hand is already fast. Decide during the implementation plan.

---

## 7. Data model (Supabase)

Deliberately minimal — two tables + storage.

- **`questionnaires`**
  `id · slug (unguessable) · client_name · project_name · type · status ·
   question_set (JSONB: snapshot array; each question tagged with its round) · created_at · updated_at`
- **`answers`**
  `JSONB on the questionnaire, keyed by question id → { value, round, saved_at }` (supports save/resume + multi-round).
- **`uploads`**
  `id · questionnaire_id · question_id · storage_path · filename · content_type · size · uploaded_at`
  (files in Supabase Storage).
- **Follow-ups** are round-2+ entries inside `question_set` — **no separate table.**

If more structure is genuinely needed later, add it then (YAGNI).

---

## 8. How the two-track system connects

- **Track A** = this app (assemble + collect + flag + export).
- **`review-intake`** = runs in **Claude Code** on an exported/linked submission; drafts the warm,
  project-aware follow-up questions for Alec's approval. Approved questions become a new round on the
  client's link (entered via admin, or a small "add round" import).
- **Track B (`grill-me`) + `to-spec`** = run in **Claude Code** against a `ready_to_quote` submission,
  producing the budget-phased spec with the *"what we recommend you DON'T build yet"* section.
- The app **feeds** these skills; it does not try to do their judgement work.

**Harness patch (System Evolution habit):** update the `review-intake` skill's *Inputs* so it recognises
an **admin submission export** (not only a pasted Tally email) as a valid input — keeps skill and app in sync.

---

## 9. Success criteria (verify against reality, not inspection)

1. From admin, create a **Maynardville** questionnaire → get a link → open it as a client → answer,
   upload a file, save/resume across a reload, submit → answer lands in admin **and** Alec gets a Resend email.
2. Admin submission view shows correct **deterministic** flags: a blank ⏳-critical question is flagged;
   a seeded contradiction is flagged; the MoSCoW summary renders.
3. **"Export for `review-intake`"** produces clean markdown that `review-intake` ingests in Claude Code and
   drafts sensible ≤5 no-jargon follow-ups; entering an approved round reopens the client link with new questions.
4. A `ready_to_quote` submission exports cleanly as input to `grill-me` / `to-spec`.
5. Everything carries the Ember brand and required **zero per-client hand-coding**.

---

## 10. Risks & open items for the plan

- **AI-suggest in admin** — optional; confirm in/out during planning based on build cost.
- **Admin auth** — Supabase Auth single-email allow-list; confirm exact mechanism in planning.
- **Domain** — assumed `emberautomations.co.za` (or similar); confirm before deploy.
- **Repo shape** — `ember-automations/` currently holds `brand/`, `documents/`, `tindlovu-questionnaire/`.
  Planning must decide: scaffold the Next.js app at the `ember-automations/` root vs a subfolder, without
  clobbering existing brand assets. The Tindlovu HTML becomes a design reference, not part of the app.
