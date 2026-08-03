# Passive Income Program — Design

**Date:** 2026-07-19
**Owner:** Alec (South Africa)
**Status:** Approved direction, pending spec review

---

## Goal

Build durable, USD-denominated passive income as a side hustle alongside existing client/dev work, until it is large enough to matter on its own. "Passive" here means: **work that stops scaling linearly with income** — build once, earn repeatedly. Not zero-work.

## Constraints (fixed inputs from brainstorming)

- **Time:** 10–20 hrs/week, on top of day-job client work.
- **Capital:** Bootstrap only, under ~$100/mo, until something shows revenue. Labour + existing code assets are the capital.
- **Skills:** Working full-stack developer (Next.js, AI content pipelines, automation, scraping/syndication). This is the unfair advantage — the whole strategy is built to compound it.
- **Currency edge:** Earning USD from SA is a ~18:1 leverage on rand costs. Every lane must be USD-billable.
- **Audience:** None today (one Facebook page). No existing channel.
- **Domain knowledge:** Real, from client work — car dealerships, recruitment/POPIA, signage, SA SMB automation.

## Success criteria

- **Phase 0 done:** Weekly playlist digest runs automatically and writes scored idea notes to the vault; a merchant-of-record USD payout account exists.
- **Phase 1 done:** First digital product listed and live for sale in USD; ≥1 organic sale (proof the rail works end-to-end).
- **Phase 2 validated:** ≥3 independent car dealers paying monthly for the content engine (not just Everest).
- **Program target (12 mo):** ≥ $1,000/mo recurring USD across products, with the SaaS as the growth vector. This clears the "median profitable micro-SaaS starts around here" bar; the realistic ceiling if it works is $4k+ MRR.

## Explicitly parked: AI-influencer / AI model (Lane C)

Researched twice (market + mechanics) and deliberately **not pursued** — but with an honest picture, not a dismissal.

**Do people make money? Yes — a minority, and it's a grind, not passive.**
- **The platform reality shifted:** OnlyFans blocks AI-only personas (government-ID verification per creator). But **Fanvue is the AI-native alternative** — ~$100M ARR (Jan 2026), ~250k creators, 17M MAU, 93% using built-in AI tools, and a friendlier 85–90% creator split. This is where AI models actually operate.
- **How the money works:** subscriptions ($9.99–24.99/mo) are almost irrelevant; the real revenue is **PPV content sold inside DM conversations** + tips + custom content, with brand deals on top. A single engaged fan can spend $200+. "Almost every creator earning >$5k/mo runs 4+ revenue streams in parallel; those stuck under $1k run exactly one."
- **The honest odds:** ~49% of AI creators earn under $10k/yr; most never break $1k/mo; top operators clear $10–50k/mo. Startup cost is low (<$100/mo of tools), but the real cost is **~20 hrs/week of daily posting + persona/character consistency + heavy chat-based sales.**
- **Tightening rules:** NY synthetic-performer law (live June 9), CA metadata mandate, FTC fines ~$53k per undisclosed AI post; platforms deprioritise "AI slop" (56% of users report seeing it often).

**Why still parked for Alec specifically:** it does not use the developer edge (anyone can spin up a persona; the moat is DM sales-craft and daily content, neither of which is Alec's advantage), it's the opposite of passive (income stops the day posting/chatting stops), and it carries reputational/compliance drag. Fair for someone whose edge is content + parasocial selling; wrong fit here versus shipping software.

Kept in [[idea-backlog]] as a monitored idea; the weekly digest flags if the economics or Alec's fit change materially.

---

## Strategy: 4 phases, each independently shippable

Sequenced so each phase de-risks and funds the next. Phase B (faceless video) is demoted from a standalone bet to the **distribution arm** of the product — so content feeds the asset instead of competing for the same 15 hrs/week.

### Phase 0 — Plumbing (Week 1, ~4 hrs)

Two deliverables, both concrete and small.

**0.1 — Weekly idea-intake automation.**
Clone the existing `learning-digest` pattern (yt-dlp transcripts → vault digest) into a *second* scheduled job pointed at the passive-income playlist.

- **Playlist:** `https://www.youtube.com/playlist?list=PLaUeKsgTRgxE` — validate accessibility as the first build step (the ID looks short; confirm it resolves before wiring automation).
- **Cadence:** weekly (cron / scheduled cloud agent).
- **Behaviour:** pull only *new* videos since last run → transcribe → extract concrete, actionable monetization tactics (not summaries) → **score each tactic against the four constraints**: dev-skill fit, bootstrap-friendly, USD-billable, genuinely passive.
- **Output:** one digest note per run in the Obsidian vault (`logs/`), plus append high-scoring tactics to a running `passive-income/idea-backlog.md` so ideas compound.
- Reuse: `learning-digest` skill, existing yt-dlp setup, vault conventions.

**0.2 — USD payout rail.**
Create a merchant-of-record account (LemonSqueezy preferred, Gumroad fallback). MoR handles US sales tax/VAT and pays out to a SA account — no US entity, no upfront cost. Stripe native (SA-supported) is deferred to Phase 2 for the subscription SaaS.

### Phase 1 — First digital product: Next.js SMB starter kit (Weeks 1–4)

Package the repeatable client-site stack you've shipped 12+ times into a premium boilerplate sold to devs/agencies in USD.

- **Contents:** Next.js base + AI content-generator module (the forced-variable-SEO engine, generalised) + contact/forms + SEO/GEO scaffolding + deploy config. Documented, licensed, sold as a one-time or tiered download.
- **Channel:** LemonSqueezy listing + a landing page. First distribution: your own network, dev communities, and the short-form channel seed (Phase 3).
- **Why first:** fastest to first dollar, truly passive once listed, and it doubles as a live advertisement for your competence and for the SaaS.
- **Guardrail:** ship *one* well-scoped kit. No feature sprawl. YAGNI.

### Phase 2 — Micro-SaaS wedge: car-dealer content engine (Months 2–4)

The real asset. Turn the motoring content tooling you already built for Everest into a self-serve subscription product.

- **Product:** AI-generated vehicle descriptions + auto-built social/flyer creative + listing content, for **independent car dealers**. Reuses `flyer-OG` generator, `news-generator`, and the stock-sync scaffolding.
- **Reference client:** Everest — already live, already using the tooling. Use it as the case study and the first testimonial.
- **Billing:** Stripe (native SA support), monthly subscription, USD.
- **Validation gate (do NOT skip):** before heavy build, confirm demand — competitor scan + reach out to 5 independent dealers. **Proceed to full build only after ≥3 signal willingness to pay.** The single biggest failure mode in the research (54% of indie products earn $0) is building before validating.
- **Scope discipline:** MVP = one vertical (car dealers), one core job done extremely well (turn stock → publish-ready content). Syndication/extras are later, not v1.

### Phase 3 — Lean distribution (ongoing, starts with Phase 2)

A short-form / faceless channel whose content **demos the products** — dealer content tips, SMB SEO teardowns, build-in-public clips.

- Not a standalone monetization bet (thin moat, slow, ~12 mo to YPP). Its job is top-of-funnel for Phase 1 + 2.
- AI-assisted but **with real editorial input** to stay monetizable and avoid the 2025 inauthentic-content demonetization rules. Disclose AI use.
- Success = qualified traffic to product pages, not ad RPM.

---

## Payment & tax mechanics (SA-specific)

- **Phase 1 (digital product):** LemonSqueezy/Gumroad as merchant-of-record — they collect and remit US/EU tax; you receive net payouts. No US company needed.
- **Phase 2 (SaaS):** Stripe has full native support in South Africa — take USD cards directly, payouts to local account. Stripe Atlas ($500 + US tax filing) is overkill and deferred until scale genuinely demands a US entity.
- **Tax:** all foreign income is declarable to SARS; SARB compliance applies at higher volumes (ID, proof of address, tax number for >R1m/yr). Engage a cross-border tax professional once revenue is consistent. No secrets/keys in the vault (OneDrive-synced) — pointers only.

---

## Risks & kill criteria

- **Building before validating** → mitigated by the Phase 2 validation gate (≥3 paying-intent dealers before full build).
- **Time starvation from client work** → phases are small and independently shippable; Phase 0 + 1 are <30 hrs total. If a phase can't get airtime, it pauses without stranding the others.
- **Digital-product market too crowded** → the starter kit competes on *your* proven, opinionated stack and SA-SMB fit, not on being generic; it's a means to cashflow + audience, not the endgame.
- **SaaS wedge too narrow (SA-only dealers)** → the *tooling* is globally applicable; SA dealers are the beachhead, not the ceiling.
- **Kill signal:** if after Phase 2 validation fewer than 3 dealers show intent, do not build the SaaS — return to the idea backlog and re-pick the wedge with fresh data.

## Metrics (reviewed at each weekly digest)

- Idea backlog: # new scored tactics/week.
- Phase 1: listing live (y/n), units sold, USD net.
- Phase 2: dealer conversations, paying-intent count, then MRR + churn.
- Program: total recurring USD/mo vs the $1,000/mo 12-month target.

---

## Decomposition into buildable specs

Each phase becomes its own spec → plan → implementation cycle. **First up: Phase 0.1 (the weekly playlist automation)** — smallest, fully within existing tooling, and it starts the idea-compounding flywheel immediately. Phase 1 (starter kit) follows.
