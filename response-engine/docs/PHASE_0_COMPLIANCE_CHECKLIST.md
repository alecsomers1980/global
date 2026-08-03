# Phase 0 — POPIA Compliance Checklist & Client Questions

*Response Engine. Work through this before quoting/building Phase 1. Detail & section references live in [POPIA_RESEARCH.md](./POPIA_RESEARCH.md). Not legal advice — items marked **(Advisor)** need H&S's POPIA advisor / attorney to confirm.*

**Owners:** **FW** = Firewire (us) · **HS** = H&S Labour · **ADV** = H&S's POPIA advisor/attorney
**Blocks build?** 🔴 = must be resolved before Phase 1 build · 🟡 = must be resolved before go-live · 🟢 = design-in, no gate

---

## Part 1 — Compliance checklist

### Contracts & roles (§20–21)
- [ ] 🔴 **HS/ADV** — Confirm H&S's contracts with its clients (esp. government) **permit a third-party sub-processor** (us) and don't ban offshore processing. *If any client contract forbids it, that overrides our architecture.*
- [ ] 🔴 **FW/HS** — Put a **written operator agreement (DPA)** in place between H&S (responsible party) and Firewire (operator): §19 security measures, confidentiality, immediate breach notice (§21(2)), sub-processor terms, deletion on termination.
- [ ] 🟡 **HS/ADV** — Confirm H&S has **operator agreements with its own clients** covering this processing.
- [ ] 🟢 **FW** — Map the role chain in writing (client = responsible party → H&S = operator → Firewire = sub-operator) and record it in the project docs.

### Information Officer & accountability (§8, §55–56)
- [ ] 🟡 **HS** — Confirm H&S has a **registered Information Officer** with the Information Regulator. *(Flagged as still-open on the H&S website project.)*
- [ ] 🟡 **HS/ADV** — Confirm H&S's **PAIA manual** is in place.
- [ ] 🟢 **FW** — Firewire's own IO registered (for our company as a responsible party of our business data).

### Cross-border & AI (§72, §26/27, §71)
- [ ] 🔴 **ADV** — Get the ruling on the core fork: **de-identified data + signed DPA acceptable**, or **strictly in-country only**? (Decides the whole AI stack — see [POPIA_RESEARCH.md](./POPIA_RESEARCH.md) §1–5.)
- [ ] 🔴 **FW** — Design the pipeline split: **capture/OCR in-region or local**; **reasoning only on pseudonymised data with special info stripped**.
- [ ] 🟡 **FW** — Sign DPAs with any AI/cloud processor used (Microsoft/AWS/Anthropic as applicable).
- [ ] 🟢 **FW** — Build **special-information stripping** (race, health, disability, biometric, criminal) before any model call (§26).
- [ ] 🟢 **FW** — Build **ID-number pseudonymisation** with the mapping table kept in SA.
- [ ] 🟢 **FW** — **Human-in-the-loop** on any shortlisting/ranking; keep an explainable audit trail (§71).

### Data residency / infrastructure
- [ ] 🔴 **HS/FW** — Confirm **where the H&S Microsoft 365 tenant stores data** (must be SA region for the "files stay in their SharePoint = in SA" story to hold).
- [ ] 🟡 **FW** — Confirm hosting/DB region (Supabase/worker) and note any transfer; prefer SA/África region or DPA-covered.

### Notices, consent & data-subject rights (§11, §18, §23–25)
- [ ] 🟢 **FW/HS** — Add a **§18 privacy/collection notice** to the application form **and** the email channel (job ad / auto-acknowledgement): what's collected, purpose, voluntary/mandatory, recipients, **cross-border transfer + protection level**, access/correction/objection rights, right to complain to the Regulator.
- [ ] 🟡 **ADV** — For **private clients**, confirm the **consent wording** (cross-border, special info, automated processing) is valid.
- [ ] 🔴 **ADV** — For the **government channel**, confirm the **lawful basis without consent** (client's statutory mandate) — consent generally can't be relied on for mandatory applications.
- [ ] 🟢 **FW** — Build a **data-subject request** capability: locate/export/delete one person's data across campaigns (§23–25).

### Data minimisation, retention & deletion (§10, §12, §13–14, §15)
- [ ] 🟢 **FW** — Field picker enforces **minimality** — collect only what the campaign needs.
- [ ] 🟢 **FW** — **Per-campaign isolation**; no cross-campaign search/matching without consent (§15).
- [ ] 🟢 **FW** — **Retention timers on every store** (DB, Excel, SharePoint files, saved emails, reconciliation log) → automated purge → **dated deletion certificate**.

### Security & breach (§19, §22)
- [ ] 🟡 **FW** — Implement §19 measures: encryption at rest/in transit, access control, least privilege, audit logging, backups.
- [ ] 🟡 **FW/HS** — Agree a **breach-response process**: FW→HS immediate notice (§21(2)); HS→Regulator + affected candidates (§22). Document who does what.
- [ ] 🟢 **HS/ADV** — Consider **cyber-liability insurance** and clear contractual liability allocation.

---

## Part 2 — Questions for Samantha & the POPIA advisor

### For Samantha (H&S) — operational
1. What is your **Microsoft 365 email host and tenant region** — do you know if your data is stored in South Africa?
2. Do your **client contracts (especially government)** say anything about **third-party processing** or **where data may be processed/stored**? Can you share a redacted example?
3. Do you have a **registered Information Officer** and a **PAIA manual** in place?
4. Do you already have **operator/data-processing agreement templates** we should slot into?
5. For **private clients**, would you add a short **privacy + consent notice** to the application form? (We'll draft it.)
6. Roughly what **campaign volumes** and **how many concurrent campaigns** should we design retention/isolation around?

### For the POPIA advisor — the decisive ones
1. **The core fork:** Is the concern **any** AI processing, or specifically **overseas processing without a signed DPA/consent**? Would **de-identified data (name/ID tokenised, special info stripped) under a signed operator agreement** be acceptable?
2. **ID numbers:** confirmed as personal information to protect — pseudonymise for the AI step, mapping kept in SA. Agreed?
3. **Government channel:** since candidate **consent** generally can't be relied on for mandatory applications, what is the **lawful basis** we build against (the client public body's statutory mandate as responsible party)?
4. **Special information (§26):** confirm we should **strip race/health/disability/biometric/criminal data** before any AI processing, and where any is needed, only under a §27 exception.
5. **Automated decisions (§71):** confirm **human-in-the-loop** shortlisting with an explainability trail satisfies the requirement.
6. **Cross-border storage:** if the M365 tenant or any processor stores data outside SA, what basis do you want relied on (DPA under §72(1)(a), or must it be strictly in-country)?

---

## Decision log (fill in as answers come back)
| # | Question | Answer | Date | Impact on build |
|---|---|---|---|---|
| 1 | Any-AI vs overseas-without-DPA | | | |
| 2 | De-identified + DPA acceptable? | | | |
| 3 | Gov lawful basis | | | |
| 4 | M365 tenant region | | | |
| 5 | Client contracts allow sub-processor / offshore | | | |
| 6 | Information Officer registered | | | |
