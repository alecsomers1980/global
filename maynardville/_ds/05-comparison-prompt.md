Produce a balanced DECISION COMPARISON document in clean Markdown (no preamble). Audience: Maynardville leadership + our team. Compare two ways to deliver the brief:
- **Option A — Airtable-native:** build entirely in Airtable using Interfaces (dashboards), Airtable Forms, interface-only collaborators, field/table editing permissions, and Airtable automations. No custom app.
- **Option B — Next.js app + Airtable backend:** a custom-branded Next.js web app over a single Maynardville-owned Airtable account (one service token; all role permissions enforced in the app). This is the chosen direction.

Use the VERIFIED FACTS and the PER-DIMENSION VERDICTS below. Do not invent figures beyond these. Use ZAR with ~R18.5=$1. Be genuinely balanced — Option A has real advantages; say so.

VERIFIED FACTS:
- Airtable Interfaces branding = logo + a single accent colour + light/dark only; NO custom fonts (Montserrat) and NO full design system. Option B = full Maynardville brand.
- Airtable billing: only users with EDIT rights are billable seats; form submitters and read-only viewers are free. Interface-only editors ARE billable. Field/table editing permissions are available on Team plan and up. Team = $20/seat/mo (50k records/base, 25k automation runs, Web API). Business = $45/seat/mo (adds SSO, admin panel, user groups).
- Option A seats: realistically 3–6 editor seats (Jaco, Wessel, Jeff, and any dept head who edits) → ~R1,110–R2,220/month.
- Option B: ONE Airtable seat ($20) + Vercel (~$20) + auth free tier ≈ $40/mo ≈ ~R740/month.
- Build effort: Option A ≈ days to ~2 weeks (configuration). Option B ≈ 6–8 weeks to pilot, ~12 weeks full (custom build) → a much larger once-off build fee.
- Quicket: full REST API + webhooks. Option A integrates via Airtable scripting automations + webhook trigger (works, but limited transformation/error-handling, bound by automation-run limits). Option B handles Quicket in its own server code (full control, robust).
- Both options keep all data in the Maynardville-owned Airtable base (portable, no lock-in either way).
- Option A requester "forms" are unguessable share links (not authenticated). Option B uses tokenised, expiring magic links + real staff sign-in.
- Option B security model: one privileged service token; ALL authorisation is custom app code (a bug = exposure); per-user audit via an Approval Log table. Option A leans on Airtable's proven, native permission model.

PER-DIMENSION VERDICTS (present each with a short paragraph for A, for B, and a "Winner"):
1. Build cost & time-to-launch → Winner: A (days–2 wks, low fee vs 6–12 wks, high fee).
2. Monthly running cost → Winner: B (~R740 vs ~R1,110–2,220) — BUT note Option A's low build means A is usually cheaper in total for the first 1–2 years; the build fee dominates total cost.
3. Look & feel / brand → Winner: B (decisive — A cannot match the website; logo+accent only).
4. Runtime speed & UX polish → Winner: B (tuned, cached, custom interactions; A interfaces can feel generic and lag with large data). Note both ultimately read from Airtable; B adds a network hop but can cache.
5. Security → Nuanced/Tie: A = safer by default (Airtable's proven permissions, little custom code, but requester links aren't authenticated); B = stronger auth (magic links/SSO) but a single god-token and all RBAC in custom code shifts responsibility to us.
6. User-level management → Mixed: A = manage collaborators + field/interface perms in Airtable's UI (no code, admin-friendly) but each editor costs a seat; B = manage via Users/Requesters tables + a small admin screen, no per-seat cost, issue magic links, fully flexible.
7. Maintenance & ownership → Winner: A (near-zero maintenance, Airtable maintains the platform; B needs hosting, dependency upkeep, Quicket-change handling). Data portability is equal.
8. Quicket integration robustness → Winner: B (full server-side control vs Airtable scripting limits).
9. Reporting & dashboards → Winner: B for quality/flexibility; A is faster to stand up with built-in chart elements.
10. Mobile experience → Winner: B (bespoke responsive/PWA vs generic Airtable mobile/interfaces).
11. Scalability to future modules (guest lists, sponsorship, schools, marketing) → Winner: B for capability/UX ceiling; A is cheap to extend functionally but hits a UX ceiling.
12. Delivery risk → Winner: A (proven platform, low technical risk; B carries custom-code, auth, and single-token risks).

STRUCTURE THE DOC:
## 1. TL;DR verdict table — columns: Dimension | Airtable-native (A) | Next.js + Airtable (B) | Winner. One concise line per cell for all 12 dimensions.
## 2. Cost view — a small table: Build (once-off), Monthly running (ZAR), and a note on 1–3 year total cost of ownership (build fee dominates; A cheaper short/medium term, B cheaper monthly).
## 3. Dimension-by-dimension — the 12 sections above, each with A / B / Winner.
## 4. When to choose which — two short bullet lists ("Choose Airtable-native if…", "Choose Next.js + Airtable if…").
## 5. Recommendation for Maynardville — conclude that, because the festival explicitly wants the website look-and-feel and treats comp-tickets as module 1 of a broader platform, **Option B (Next.js + Airtable)** is the right fit, while being honest that Option A would satisfy the functional brief at lower cost, lower risk, and faster — so if budget/speed were the only drivers, A would win. Note the single-account model keeps B's running cost low and the brief's ownership requirement intact.

Keep it tight, balanced, and decision-useful. Tables + short paragraphs.
