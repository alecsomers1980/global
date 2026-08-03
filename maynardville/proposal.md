# Proposal: Integrated Digital Management Platform  
## For the Maynardville Open-Air Festival – 70th Anniversary Season (2026)

**Prepared for** Maynardville Theatre NPC / VR Theatrical  
**Contact** Jaco van Rensburg, Wessel Odendaal  
**Prepared by** [Your name / studio]
**Date** 15 June 2026

---

## 1. Executive Summary

We propose a custom-branded web application, built on **Next.js**, that places **Maynardville’s own Airtable base** at the centre of all operations—exactly as the brief requires—while delivering a polished, mobile-friendly experience that mirrors the festival’s distinctive look and feel. The application reads and writes to Airtable via the Web API, so Maynardville retains **complete ownership** of the database, all data, and every API key. Quicket integration runs on the application’s own secure server (no middleware), covering scheduled data syncs and live purchase webhooks. Role-based access and tokenised magic links give requesters, box office, leadership and each department exactly the view and controls they need, with far stronger security than unguessable form links alone. The priority pilot—the **Complimentary Ticket Request workflow**—can be operational in a matter of weeks, and the modular architecture ensures guest lists, sponsorship tracking, school bookings and deeper reporting can be layered on seamlessly. Everything is hosted on Maynardville-controlled accounts, and because the data lives in your own Airtable base you can open and export it directly at any time. The result is a single, elegant platform that looks like the Maynardville website, feels like a premium festival tool, and keeps the data where it belongs: in your hands.

---

## 2. Our Understanding of Your Needs

Maynardville is approaching its 70th season, a remarkable milestone for South Africa’s most beloved open-air summer theatre. The festival’s operations have grown in complexity, and the current patchwork of spreadsheets, shared inboxes and manual Quicket work is no longer sustainable. You envision a connected system where:

- A single source of truth (an Airtable base) governs complimentary tickets, guest lists, sponsorship allocations, school bookings and related data.
- Department heads see **only what is relevant** to their function—Box Office, PR/Media, Sponsorship, Operations and Leadership each have their own focused dashboard.
- The **Complimentary Ticket Request** process becomes a controlled, auditable workflow: requesters submit via a form → Jaco or Wessel approve → Box Office issues on Quicket and records seat numbers → the completed allocation locks into a protected master list.
- Tight integration with **Quicket** eliminates double-capture, while the festival retains full ownership of all system components—no critical pieces controlled by a vendor.
- The platform must look and feel like Maynardville, not a generic software tool.

Your brief asks for a solution “built on Airtable,” with the account and all data under Maynardville’s control. You also explicitly raise valid concerns about vendor lock-in, middleware dependency, permission granularity, and real-world Quicket limitations. We have absorbed every one of these points, and our proposal is designed to exceed the brief by delivering a far richer user experience while honouring every constraint.

---

## 3. Recommended Solution & Architecture

### 3.1 A Branded Web Application with Airtable as the System-of-Record

We will build a progressive web application using **Next.js**, themed entirely to the Maynardville identity—deep navy (`#060A3C`), royal blue (`#0F3193`), mint (`#62DAA9`), cream (`#FFFADB`) and the Montserrat typeface. The application will feel like a natural, private extension of the festival’s public website.

**Airtable remains the database.** The application reads and writes exclusively through the Airtable Web API. This satisfies the requirement to be “built on Airtable” in the most literal sense: the Airtable base is the system-of-record for every ticket request, approval, guest list entry and report. Critically, Maynardville owns the Airtable account and pays for it directly. The application connects with a **single service token** to **one Maynardville-owned Airtable account**; because every user signs in to the app rather than to Airtable, all role-based permissions are enforced in the application and only a single Airtable seat is required. All records live in your base, so you can open and export your data directly at any time—a transparency no closed system offers.

**No middleware. No lock-in.** Quicket integration (event data, guest lists, purchase webhooks) is handled entirely within the Next.js application’s own server environment, hosted on **Vercel** under a Maynardville-owned account. There is no Zapier, Make or equivalent dependency to own, configure, or pay for separately. The code repository, hosting project, authentication project, and all API keys live in accounts fully controlled by Maynardville Theatre NPC.

### 3.2 Access & Permissions

Requesters (e.g., media, sponsors, company members) do not need to create accounts. They receive **secure, tokenised magic links** via email that grant access only to their own request forms and status views. These tokens expire and are single-use or time-limited, making the approach significantly more secure than sharing an unguessable Airtable form link.

Staff members (Jaco, Wessel, Jeff, Sascha, Kerry, Alyssa, etc.) sign in through **email-based passwordless authentication or Google sign-in**. Every data operation is guarded by role-based permissions enforced server-side, not just hidden in the user interface. This means:

- Jeff sees only the “To Issue” queue and the fields he is authorised to edit (seat numbers, Quicket reference).
- Sascha sees only media-related comps and guest lists.
- Kerry sees sponsor allocations and fulfilment statuses.
- Leadership sees a holistic view but cannot inadvertently alter low-level data without intent.

The application also logs all sensitive actions for audit, giving you full traceability.

### 3.3 Broad Compatibility & Future Modules

The architecture treats every functional area—comp tickets, guest lists, sponsorship tracking, school bookings, marketing dashboards—as a **module**. Module 1 (the Complimentary Ticket pilot) builds the authentication layer, Airtable API bridge, Quicket sync engine, and dashboard framework. Future modules plug into the same foundation, keeping the total cost of ownership low and the user experience consistent.

---

## 4. The Complimentary Ticket Workflow (Pilot Module)

The pilot module turns the existing comp ticket process into a structured, role-driven pipeline. Below is the end-to-end flow, which will be fully functional within the first delivery window.

1. **Request submission**  
   A requester clicks their personalised magic link and fills in a branded, on-brand web form. They select the production, performance date, ticket type, number of tickets, and provide a brief motivation. The request is saved to Airtable with status `REQUEST` and an auto-generated reference number.

2. **Approval**  
   Jaco van Rensburg and Wessel Odendaal each see an “Approvals” queue in their dashboard. They can approve or decline with an optional note. An approved request moves to status `TO ISSUE` and becomes visible to the Box Office.

3. **Issue by Box Office**  
   Jeff Brooker’s dashboard shows a clear “Ready to Issue” list. He issues the tickets directly in Quicket (a manual, authoritative step). Back in the application, he records the Quicket ticket reference number, seat numbers, and any notes. On save, the status automatically advances to `ISSUED`.

4. **Protected Master List**  
   Once `ISSUED`, the record joins the **Full Comps List** and becomes read-only for most roles. Only Leadership retains the ability to correct or revoke an issued comp in exceptional cases, and such changes are logged.

5. **Requester visibility**  
   The requester can re-use their magic link to check the status of their request and view their issued seat details—no need to call the box office.

6. **Reconciliation with Quicket**  
   A nightly (or on-demand) sync pulls the latest Quicket guest list for each scheduled performance and cross-references issued comps. Discrepancies (e.g., a ticket voided outside the system) are flagged in the Box Office dashboard.

7. **Season rollover**  
   A clear “new season” runbook will allow you to duplicate the base structure and archive old data while preserving the same workflow for Season 71 and beyond.

---

## 5. Departmental Dashboards

Each dashboard is essentially a filtered, pre-configured view of the underlying Airtable data, wrapped in the Maynardville brand. A one-line summary per department:

- **Leadership (Jaco & Wessel):** High-level comp allocation summary, real-time sales snapshot, attendance trends, and a consolidated “everything” view for oversight.
- **Box Office (Jeff):** Task-focused “To Issue” list, daily comp manifest, seating annotation tools, and a reconciliation panel for Quicket guest-list matches.
- **PR/Media (Sascha Polkey):** Filtered view of media comps issued, grouped by outlet/journalist, with RSVP status and any special access notes.
- **Sponsorship (Kerry Burns):** Sponsor comp allocation vs. contractual entitlement, fulfilment tracker, and a sponsor-specific guest list export.
- **Operations (Alyssa van der Schyff):** House capacity overview per performance, comp seat utilisation, and a run-of-show checklist derived from issued tickets.

All dashboards respect the role-based permissions, so no department sees data beyond its remit.

---

## 6. Quicket Integration Approach & Honest Limitations

### 6.1 What the Integration Does

The application will use the **Quicket REST API** (`api.quicket.co.za`) with a Maynardville-issued API key and user token. It will:

- Fetch the list of events, ticket types, and **schedules** (each schedule maps directly to a specific performance date) so that request forms and dashboards always show up-to-date performance options.
- Listen for **purchase webhooks** — Quicket provides hooks for checkout started, cancelled, EFT-pending and completed — to capture general ticket-sales data for leadership dashboards and sales-versus-comp reporting.
- Periodically pull **guest lists** for each scheduled performance, enabling the reconciliation engine to confirm that issued comps have actually appeared in Quicket.

### 6.2 Honest Boundaries

We believe in upfront clarity:

- **Comp issuance remains a manual Quicket step.** The application will not push comp tickets into Quicket via API; it would be technically possible in some configurations, but the Box Office’s manual issuance is the safest, most auditable method and aligns with how you already work.
- **Seat numbers.** Quicket’s API does not expose seat-level detail. Our application therefore captures seat numbers manually when Jeff issues the tickets. This is consistent with your current process.
- **Webhook scope.** Quicket offers webhooks for general purchase events, but not for every back-office action. Therefore, a comp ticket drawn directly in Quicket will not automatically trigger a status update. Our **scheduled guest-list sync** resolves this: if a request shows as “To Issue” and the guest list later includes the relevant name and ticket, the system suggests a match. Conversely, if an issued comp ticket is voided outside the application, the next sync will flag it.
- **Availability and rate limits.** The Quicket API has usage limits; our sync frequency will be set appropriately. The application will never rely on real-time Quicket data for critical workflows—Airtable is always the primary source.

The net result is a **trusted, double-entry system**: the application manages the request and approval lifecycle, Airtable holds the audit trail, and Quicket remains the ticketing engine of record. You get full data integrity without fragile automation.

---

## 7. Responses to Your Vendor Questions

The following table addresses each of the 13 specific questions raised in Section 17 of the brief.

| # | Question | Our Response |
|---|----------|---------------|
| 1 | Which Airtable plan do you recommend and why? | The **Airtable Team plan** ($20 per seat/month, billed annually) includes the Web API, 50,000 records per base and revision history. Because all users access the system through the web application (not Airtable directly), Maynardville needs only **a single Airtable seat** to hold the service connection — not one per staff member. The **Free** plan's 1,000-record / 1,000-API-call limits are too tight once Quicket sales sync in, so Team is the safe baseline. A seat is only added if a staff member also wants to edit raw data inside Airtable. |
| 2 | Describe the overall data architecture and system design. | A Next.js web application hosted on Vercel, communicating securely with a Maynardville-owned Airtable base via the Web API. All business logic, permissions and Quicket API calls run on the server. There is no intermediary service. Quicket data is cached minimally for performance, but Airtable is the system-of-record. |
| 3 | How will permissions and role-based access be enforced? | All permissions are enforced in the application’s API layer on every request, against a single Maynardville-owned Airtable service token. A user’s role (from the Users table) is determined at sign-in; the server rejects any read or write outside their allowed scope. Because end-users never have Airtable logins, the application is the sole gatekeeper — authorisation is enforced strictly server-side, and every privileged action is written to an Approval Log for per-user audit. |
| 4 | Will requesters use native Airtable forms? | No. All forms are custom-branded web forms inside the Maynardville application. This gives us field validation, conditional logic, and a seamless look-and-feel that Airtable’s stock forms cannot achieve, while still writing directly into your Airtable base. |
| 5 | How is Jeff Brooker restricted to editing only the necessary fields? | In the application, Jeff’s role “Box Office” grants write access exclusively to the `seat_numbers` and `quicket_reference` fields for records in `TO ISSUE` status. He cannot alter the request itself, change the status arbitrarily, or view sponsorship data. These restrictions are enforced server-side, not just hidden in the UI. |
| 6 | What method will you use to integrate with Quicket? | The application will use the Quicket REST API via a server-to-server connection. We will pull events, schedules and guest lists on a schedule, and listen for real-time purchase webhooks. No middleware (Zapier, Make) is used. |
| 7 | What are the known limitations of the Quicket integration? | As detailed in Section 6, comp tickets issued manually in Quicket will not automatically update the app; reconciliation relies on scheduled guest-list syncing. Seat-level detail is not available via the API, so seat numbers are recorded in-app. We’ve designed the workflow around these realities. |
| 8 | Is any third-party middleware required? | None. The integration runs in the application’s own server code. Maynardville will not need to own, maintain, or pay for any middleware service. |
| 9 | What is the estimated project timeline, and can the comps pilot be delivered sooner? | The full project (all modules in scope for this phase) is estimated at **12 weeks**; the comp-ticket pilot module can be operational within **6–8 weeks** from kick-off, with internal testing beginning earlier. See Phase Plan below. |
| 10 | What are the costs: one-off build and ongoing running costs? | **One-off build fee:** **[BUILD FEE — to be confirmed]** (proposed payment: 40% deposit, 30% on pilot acceptance, 30% on final handover). **Monthly running costs** are detailed in Section 9; they total approximately **R740/month** and are paid directly to Airtable and Vercel by Maynardville. |
| 11 | What does ongoing support and maintenance look like? | We provide thorough documentation and a training session so your team is self-sufficient for day-to-day operations. A post-handover support retainer can be arranged for enhancements, Quicket API changes, and season rollover assistance. Because all data lives in your own Airtable base, you are never locked out of your information, which reduces reliance on external support. |
| 12 | What are the key risks and how are they mitigated? | (a) Quicket API downtime → Airtable remains the independent source of truth; box office can continue. (b) Data sync lag → scheduled syncs plus on-demand manual refresh keep latency predictable. (c) Staff turnover → role-based console is intuitive, and documentation captures all procedures. (d) Scope creep → modular architecture means new requests can be added as discrete modules without destabilising the pilot. |
| 13 | How will the project be phased and rolled out? | Five tightly scoped phases: Discovery, Pilot module, Quicket integration, Dashboards, and Testing/Handover. The pilot is accepted before we proceed to full delivery. Full rollout detail follows in Section 8. |

---

## 8. Phased Delivery Plan

| Phase | Activity | Approx. Duration |
|-------|----------|------------------|
| **1. Discovery & Architecture** | Joint workshop to finalise base schema, field list, permission matrix and Quicket API credential setup. Deliver signed-off architecture document and Airtable base map. | 1–1.5 weeks |
| **2. Comp-Ticket Pilot** | Build and deploy the branded web application shell, authentication, magic-link request flow, approval queue, and Box Office issue screen. Internal end-to-end testing with real data. Pilot accepted before Phase 3 begins. | 4–5 weeks |
| **3. Quicket Integration** | Connect Quicket API for event/schedule sync, purchase webhooks, and guest-list reconciliation engine. Embed these feeds into the pilot workflows so comps reconcile automatically. | 2–3 weeks |
| **4. Departmental Dashboards** | Build the five role-specific dashboards with proper permission filtering. Add data exports as required. | 2–3 weeks |
| **5. Testing, Training & Handover** | Full UAT, training session with key users, documentation handover (base map, field dictionary, runbooks). Final sign-off and deployment to production vercel domain. | 1.5–2 weeks |

*Phases overlap slightly in agile delivery. The Comp-Ticket pilot is demonstrable and usable in advance of the final deadline, giving the festival early value.*

---

## 9. Investment

### 9.1 Monthly Running Costs (Paid Directly to Providers by Maynardville)

All services are billed on Maynardville-owned accounts. The following table reflects the expected steady-state costs at launch, using an indicative exchange rate of R18.50 = $1 USD.

| Service | Plan | Monthly Cost (USD) | Approx. Monthly Cost (ZAR) | Notes |
|---------|------|-------------------|----------------------------|-------|
| Airtable | Team plan (1 seat) | $20 | ~R370 | One seat holds the service connection; all users access via the app, so no per-staff seats. |
| Vercel | Pro plan | $20 | ~R370 | Sufficient for the expected traffic; generous free tier may cover early usage. |
| Authentication | Supabase/Auth0 free tier | $0 | R0 | Well within free-tier limits for this user base. |
| **Total** | | **~$40** | **~R740** | |

*Exchange rate fluctuations may alter the rand equivalent. Maynardville will hold the subscriptions directly, ensuring full control and no markup.*

### 9.2 Once-off Build Fee

The professional services fee for design, development, integration, documentation and training is:

> **[BUILD FEE — to be confirmed]**

A three-stage payment structure is proposed:

- **40%** deposit on signature, to commence Phase 1
- **30%** upon formal acceptance of the Comp-Ticket Pilot (end of Phase 2)
- **30%** on final handover and sign-off (end of Phase 5)

All intellectual property in the code and configuration is transferred to Maynardville Theatre NPC upon final payment.

---

## 10. Data Protection & Ownership (POPIA)

Maynardville is the **responsible party** for all personal data processed through the platform. Our solution reinforces that status:

- **Data residency:** All request data lives in Maynardville’s own Airtable base; the Vercel-hosted application holds only ephemeral session tokens, not a second copy of personal data. Airtable is SOC 2 Type II compliant. Note that in-region (e.g. EU) data residency is an Airtable Enterprise-tier feature — on the Team/Business plan data is hosted in the United States. During Discovery we will confirm this is acceptable for your POPIA assessment, or scope an Enterprise upgrade if local residency is required.
- **Access control:** Role-based permissions restrict who sees personal information (names, email addresses, seat assignments) to the minimum necessary.
- **Retention & deletion:** Airtable records can be archived or deleted at the end of each season according to Maynardville’s internal policy. The application includes a data-export function, and any individual’s data can be removed on request.
- **No vendor lock-in:** Because the base is standard Airtable and the code is well-documented Next.js, you can extract a full CSV/JSON dump at any time without our involvement.
- **Integrity:** The application never stores a copy of personal data that is not already in the Airtable base; it acts as a stateless interface.

We will provide a brief data-flow diagram and POPIA checklist as part of the Discovery phase to ensure full alignment with your compliance obligations.

---

## 11. Documentation & Handover

A successful handover is as important as the build. You will receive:

1. **Airtable Base Map** – a visual/table detailing every table, field, linked record, and formula, together with the rationale for each.
2. **Field Dictionary** – plain-English description of every field, allowable values, and which role can read/write.
3. **Role & Permission Guide** – a matrix of roles vs. actions, including how to add or revoke a user.
4. **Season Runbook** – step-by-step instructions for:
   - Adding a new production or performance date
   - Onboarding a new batch of requesters and issuing magic-link invites
   - Rolling the base over to a new season while archiving the previous season’s data
5. **Platform Admin Guide** – covering Vercel deployment, environment variable management, and how to update Airtable API keys.
6. **One interactive training session** (remote) with key users, recorded for future onboarding.

After handover, your team will be equipped to run the platform independently. An optional post-handover support agreement can be discussed for ongoing enhancements.

---

## 12. Next Steps

We are excited about the potential of this platform to give the Maynardville team a beautifully simple, fully owned operating backbone for the 70th season and beyond. To move forward:

1. **Arrange a brief call** to align on any outstanding questions and schedule the Discovery workshop.
2. **Enable Quicket API access** on your Quicket account (we can supply the exact steps) so that we can begin testing against your live event structure during Phase 1.
3. Confirm the **Airtable Team plan subscription** (or trial) so that we can begin base design in the workshop itself.

We look forward to helping Maynardville write its next chapter with the seamless, secure, and unmistakably Maynardville digital experience it deserves.

---

*Thank you for the opportunity to propose this partnership.*