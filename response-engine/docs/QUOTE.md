> **⚠️ INTERNAL — DELETE THIS BOX BEFORE SENDING**
>
> Every figure marked **[confirm]** is a placeholder using typical SA-market rates. Set them to *your* numbers before this goes to the client:
> - Your build/setup fee for Phase 1
> - Your monthly licence/support fee
> - The labour-model assumptions (avg applications/campaign, minutes-per-capture, capturer hourly rate, campaigns/month) — adjust to what Samantha actually told you or what you can verify. The ROI is only as credible as these inputs, so don't overstate them.
> - Confirm the IP/licence agreement is signed before any build starts.

---

# Proposal & Quote — Recruitment Response Handling Automation

**Prepared for:** H&S Labour Brokers
**Prepared by:** Alec Somers, Firewire IT
**Date:** 8 July 2026

---

## 1. The problem we're solving

Right now, every application that arrives by email is captured **by hand** into an Excel sheet and filed manually — a slow, people-heavy process running against a strict 3-business-day SLA. In your own words on the call:

> *"It's like we are an OCR machine, but we are human beings."*

That manual process carries real, recurring costs:

- **Labour** — a team spends most of its time data-capturing and QC'ing, application by application, campaign after campaign.
- **Time pressure** — everything must be done inside 3 business days or you risk an SLA breach: penalties, blacklisting, or non-payment.
- **Human error** — manual capture means mistakes, which means more QC, which means more hours.
- **Wasted effort on edge cases** — e.g. the Z83 fillable-form issue that cost roughly **R5,000 in printing and a full extra day** on one campaign before it was spotted.

## 2. What the Response Engine does instead

An application lands in the mailbox → within **minutes**, its data is extracted, validated, and written to your Excel sheet, with all documents filed into the client's SharePoint folder and every email logged for reconciliation. Your team moves from *doing the capture* to *checking the exceptions*.

| | **How it works now (manual)** | **With the Response Engine** |
|---|---|---|
| Capture | Staff read each CV/Z83 and type fields into Excel | Extracted automatically on arrival |
| Speed | Hours to days, against the SLA clock | Minutes per application |
| Consolidation | Manually matched when documents trickle in | Auto-merged on ID number |
| Missing info | Spotted (or missed) by a person | Flagged automatically; optional auto-reply to the candidate |
| Spam / accountability | Manual eyeballing | Full log: every email in, processed vs. spam |
| POPIA isolation | Relies on people following the rules | Ring-fenced per campaign by design; auto-cleared with a deletion certificate |
| Z83 form-bleed | Cost R5k + a lost day once | Forms flattened automatically before extraction |
| Cost driver | Scales with **people** | Scales with **cheap compute** |

## 3. The business case — labour & cost savings

*Illustrative model. All inputs are adjustable — see assumptions below.*

**Assumptions [confirm]:**
- Typical campaign: **2,000 applications**
- Manual capture + QC: **~10 minutes per application**
- Data-capturer cost: **R45 / hour** (loaded temp rate)
- Campaigns per month: **4**

**Per campaign of 2,000 applications:**

| | Manual (today) | Response Engine |
|---|---|---|
| Capture + QC time | 2,000 × 10 min ≈ **333 hours** | Exceptions only (~10% × 3 min) ≈ **10 hours** |
| Labour cost | 333 hrs × R45 ≈ **R15,000** | 10 hrs × R45 ≈ **R450** |
| Processing / AI cost | — | ≈ **R400** |
| **Total per campaign** | **≈ R15,000** | **≈ R850** |
| Turnaround | Most of the 3-day SLA | Minutes per application |

**Saving of roughly R14,000 in labour per campaign** — before you count the QC oversight, the SLA-breach risk that disappears, and one-offs like the R5,000 Z83 printing incident.

**Scaled up [confirm]:** at 4 campaigns/month, that's **~R56,000/month** (≈ R672,000/year) of labour currently spent on manual capture — freed up. Your people move onto higher-value recruiting work instead of typing.

**Two things that don't show up in the table but matter:**
- **SLA protection** — consistently hitting the 3-day deadline turns a compliance risk into a selling point ("results within 3 days, guaranteed").
- **New revenue angle** — the reconciliation log and per-CV counts give your clients transparency they can't get elsewhere, and give you clean evidence for your per-CV billing.

## 4. What you're buying, and how it's priced

This is delivered as an ongoing service, not a once-off project — a system we build together in phases, that Firewire IT hosts, maintains and improves over time.

**Phase 1 — Capture Engine** *(the priority you flagged)*
Automatic capture from email → Excel + SharePoint, ID-number consolidation, missing-info handling, reconciliation log, and a dashboard to run a campaign. Piloted alongside your team so we prove it against your QC before you rely on it.

| Item | Fee [confirm] |
|---|---|
| Phase 1 setup & build (one-time) | **R [ _____ ]** |
| Monthly licence, hosting, support & maintenance | **R [ _____ ] / month** |
| Estimated Phase 1 timeline | ~4–8 weeks |

*Monthly fee includes hosting, security, updates and support for up to [ _X_ ] campaigns/month; unusually high volumes are quoted separately or on a small per-CV basis that mirrors how you bill your own clients.*

**Later phases** (scoped and quoted separately as we go):
- **Phase 2** — Validated online application form for private clients (kills incomplete/79-page submissions).
- **Phase 3** — Automatic shortlisting against client criteria (SA citizenship, province, competencies, experience) + client stats pack + cover-sheet generation.
- **Phase 4** — Rollout/scaling as you take on more volume, reducing reliance on temporary capture staff.

## 5. Why this approach

- **Standalone & POPIA-safe by design** — this system is deliberately built separate from any shared candidate database, so you never face the cross-contamination risk that catches out agencies using shared platforms for this.
- **Your data stays yours** — candidate files live in *your* Microsoft 365 / SharePoint; we handle the automation, not custody of your clients' data.
- **A partnership, not a hand-off** — we build in phases, keep improving it, and I stay involved for support and the next thing you need. The goal is to automate as much as sensibly possible, then maintain and extend it.

## 6. Next step

Send through the Excel template and a couple of sample applications, and let's book the short screen-share. From there I'll confirm the Phase 1 figures above and we can get started.

---
*Quote valid for 30 days. Figures subject to confirmation after the Phase 0 review.*
