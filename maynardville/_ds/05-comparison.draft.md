# DECISION COMPARISON  
**Option A – Airtable-native** vs **Option B – Next.js + Airtable backend**  
Prepared for Maynardville leadership and our delivery team

## 1. TL;DR verdict table

| Dimension | Airtable-native (A) | Next.js + Airtable (B) | Winner |
|-----------|----------------------|--------------------------|--------|
| **1. Build cost & time-to-launch** | Days–2 weeks configuration; very low build fee | 6–8 weeks pilot, ~12 weeks full; significant once-off build cost | **A** |
| **2. Monthly running cost** | ~R1,110–R2,220 (3–6 billable editor seats) | ~R740 (1 seat + Vercel + auth) | **B** |
| **3. Look & feel / brand** | Logo + single accent colour; no Montserrat or design system | Full Maynardville brand, custom design system | **B (decisive)** |
| **4. Runtime speed & UX polish** | Generic Airtable Interfaces; can lag with large data sets | Tuned, cached, custom interactions; network hop but cacheable | **B** |
| **5. Security** | Proven Airtable permissions; unauthenticated requester links | Strong tokenised magic links/SSO, but single god-token + custom RBAC | **Tie (nuanced)** |
| **6. User-level management** | Admin-friendly Airtable UI; each editor costs a seat | Custom Users/Requesters tables + admin screen; no per-seat cost; flexible magic links | **Tie (mixed)** |
| **7. Maintenance & ownership** | Near-zero maintenance, platform maintained by Airtable | Regular dependency/security updates, hosting upkeep; data ownership equal | **A** |
| **8. Quicket integration robustness** | Airtable scripting + webhook; works but limited transformation & error-handling | Full server-side control, robust handling | **B** |
| **9. Reporting & dashboards** | Built-in chart elements, fast to stand up | Higher quality and flexibility, custom visuals | **B** (A faster to deploy) |
| **10. Mobile experience** | Generic Airtable mobile/web interfaces | Bespoke responsive/PWA, optimised UX | **B** |
| **11. Scalability to future modules** | Cheap to extend functionally, but hits a UX ceiling | Capability/UX ceiling much higher; built for platform growth | **B** |
| **12. Delivery risk** | Proven platform, low technical risk | Custom-code, single-token, and auth risks | **A** |

## 2. Cost view

| Cost item | Option A | Option B |
|-----------|----------|----------|
| **Build (once-off)** | Minimal configuration fee (days–2 weeks work) | Substantial build fee (6–12 weeks development) |
| **Monthly running (ZAR)** | ~R1,110–R2,220 (3–6 editor seats at ~R370/seat) | ~R740 ($20 Airtable seat + ~$20 Vercel + auth free tier; ~$40/mo) |
| **1–3 year total cost of ownership** | A is **cheaper short-to-medium term** because the low build fee dominates; B’s higher build cost takes ~2 years to offset by lower monthly run rate. | |

> Note: All monetary figures use an exchange rate of ~R18.5 = $1. Only costs explicitly provided are included; no additional figures have been invented. Option B’s single-seat, single-token model keeps the monthly run rate remarkably low while retaining full data ownership in Maynardville’s Airtable account.

## 3. Dimension-by-dimension

### 3.1 Build cost & time-to-launch
- **A:** Entirely configuration-based. Can be delivered in days to a maximum of two weeks, with minimal professional services cost.
- **B:** Requires custom software development (6–8 weeks to a working pilot, ~12 weeks for a complete first version), incurring a substantially larger once-off build fee.
- **Winner:** **A**

### 3.2 Monthly running cost
- **A:** Requires 3–6 billable editor seats (anyone with editing rights). At the Team plan rate of ~R370/seat/month, the monthly cost ranges from ~R1,110 to ~R2,220.
- **B:** Only one billable Airtable seat ($20), plus Vercel hosting (~$20) and an authentication free tier, totalling about $40/month (~R740/month).
- **Winner:** **B**, though the total cost advantage only materialises after the build premium is recovered (typically 1–2 years).

### 3.3 Look & feel / brand
- **A:** Airtable Interfaces allow a logo and a single accent colour, plus light/dark modes. Custom fonts (Montserrat) and a full design system cannot be applied. The result will always look like Airtable, not like the Maynardville website.
- **B:** A fully custom Next.js front-end can implement the complete Maynardville brand, including design system, Montserrat typography, and visual continuity with the main website.
- **Winner:** **B (decisive)**

### 3.4 Runtime speed & UX polish
- **A:** Interfaces are functional but can feel generic and may exhibit lag when working with larger record sets. Interaction patterns are limited to what Airtable’s layout elements offer.
- **B:** Custom code allows tuned performance, caching strategies, and bespoke interaction design. Although both read from the same Airtable API, B can add a caching layer that hides latency.
- **Winner:** **B**

### 3.5 Security
- **A:** Leans on Airtable’s mature, thoroughly tested permission system. Low surface for custom code bugs. However, requester “forms” are unguessable share links with no authentication, which may be a concern for sensitive operations.
- **B:** Uses tokenised, expiring magic links and real staff sign-in, giving strong authentication for all users. But all authorisation logic is custom code, backed by a single privileged service token. A bug in the RBAC layer could expose data more broadly than intended.
- **Winner:** **Tie (nuanced trade-off)**

### 3.6 User-level management
- **A:** Manage collaborators, field permissions, and interface visibility directly in Airtable’s admin UI—no code required and very admin-friendly. The trade-off is that every editor occupies a paid seat.
- **B:** User management runs through custom Users/Requesters tables and a small admin screen. No per-seat cost, magic links can be issued flexibly, and you can model finer roles. The cost is that this admin screen must be built and maintained.
- **Winner:** **Tie (mixed)** — A is simpler operationally; B is more flexible and cost-efficient.

### 3.7 Maintenance & ownership
- **A:** Virtually zero technical maintenance; Airtable handles security, uptime, and feature updates. Data remains in the Maynardville-owned base, fully exportable. Long-term ownership risk is minimal.
- **B:** Requires ongoing dependency updates, hosting maintenance, and adaptation if Quicket changes its API. Data portability is identical (still an Airtable base), but the custom app layer adds a maintenance burden.
- **Winner:** **A**

### 3.8 Quicket integration robustness
- **A:** Can connect to Quicket’s REST API and webhooks through Airtable scripting automations. Works for straightforward flows, but transformation logic is constrained, error-handling is basic, and automation run limits may throttle high-volume use.
- **B:** Handles Quicket interactions in dedicated server-side code. This allows full error-handling, retry logic, data transformation, and no dependency on Airtable’s automation run limits.
- **Winner:** **B**

### 3.9 Reporting & dashboards
- **A:** Airtable Interfaces include built-in chart elements (bar, line, pie, etc.) that can be assembled quickly to give a live view of data. Sufficient for basic operational dashboards.
- **B:** Custom dashboards can be designed to exact specifications with rich visualisation libraries. More effort to build, but far greater quality and flexibility.
- **Winner:** **B** (though A is faster to stand up)

### 3.10 Mobile experience
- **A:** Airtable’s mobile interfaces are generic and not optimised for the specific workflow. Navigation can be clunky on small screens and the visual treatment cannot be tailored.
- **B:** A custom Next.js front-end can be built as a responsive web app or PWA, delivering a polished, fast mobile experience that matches the desktop UI.
- **Winner:** **B**

### 3.11 Scalability to future modules (guest lists, sponsorship, schools, marketing)
- **A:** Adding a new module is as simple as adding tables, fields, and a new Interface page—quick and low cost. However, the user experience will remain bound by Airtable’s Interface capabilities, which may feel disjointed from the main website as the platform grows.
- **B:** Significantly higher ceiling for both capability and user experience. New modules can be built as integrated parts of the same branded application, sharing authentication, navigation, and design language.
- **Winner:** **B** for long-term capability and UX ceiling; A is cheaper to extend functionally.

### 3.12 Delivery risk
- **A:** Low technical risk. Airtable as a platform is proven; the project is a configuration exercise with straightforward integrations. The outcome is highly predictable.
- **B:** Carries custom software risk—authentication logic, single service-token exposure, integration edge-cases, and longer delivery timeline. The risk of a serious bug or delay is higher.
- **Winner:** **A**

## 4. When to choose which

**Choose Airtable-native if:**
- Budget and timeline are the dominant constraints.
- The functional brief alone matters, and it’s acceptable that the tool doesn’t mirror the public website’s look-and-feel.
- The team is comfortable managing permissions and user roles directly in Airtable.
- Low maintenance overhead is a top priority, and the Quicket integration can remain simple.

**Choose Next.js + Airtable if:**
- Full Maynardville brand alignment and a seamless user experience are non-negotiable.
- The comp-ticket module is seen as module one of a broader, integrated festival platform (guest lists, sponsorship, schools, marketing).
- You are willing to invest a larger up-front build and accept the associated delivery risk in exchange for a system that can grow without a UX ceiling.
- You prefer no per-editor seat cost and a more flexible, custom RBAC model, even if it means owning the code that enforces it.

## 5. Recommendation for Maynardville

Both options would satisfy the functional brief and keep all data inside the festival’s own Airtable account. Option A would do so faster, with less risk, and at a lower initial cost—if speed and budget were the only drivers, A would be the clear winner.

However, Maynardville has explicitly stated that it wants the platform experience to match the look-and-feel of the public website, and it views the comp-ticket workflow as the first module of a broader digital platform. That ambition points decisively toward **Option B (Next.js + Airtable)**.

The single-account Airtable model in Option B keeps the monthly running cost remarkably low (~R740/month) and preserves the full data ownership requirement. The higher build cost and longer timeline are real trade-offs, but they are justified by the long-term brand, UX, and scalability gains. We therefore recommend proceeding with Option B, with an honest acknowledgment that Option A remains a reliable fallback if constraints shift.