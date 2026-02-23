# RVR Inc — Full Website Overhaul

Complete redesign of all public pages with client-provided content, updated portal branding, and contact info corrections.

---

## Proposed Changes

### Homepage

#### [MODIFY] [Hero.tsx](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/components/sections/Hero.tsx)
- Two-column layout: **Left** = RVR logo (large, centered) + `EST. 2000. PRETORIA & MARBLE HALL` + heading "PROVEN PATHS TO FAIR COMPENSATION" + description paragraph. **Right** = `header3.jpg` (hammer/gavel image)
- Bottom: "Trusted by over 2,000 clients across South Africa"

#### [NEW] [WelcomeSection.tsx](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/components/sections/WelcomeSection.tsx)
- Professional welcoming section with text about RVR's legacy and personalized legal approach.
- Include a "Secure Client Portal" teaser box with login CTA.

#### [MODIFY] [page.tsx](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/app/page.tsx)
- Re-integrate **ServiceGrid** (Our Practice Areas).
- Add the new **WelcomeSection**.
- Ensure smooth transitions and professional spacing between sections.

---

### About Us Page

#### [MODIFY] [page.tsx](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/app/about/page.tsx)
Complete rewrite with 7 sections using client's exact copy:
1. **Hero banner** — "About Roets & Van Rensburg"
2. **History** — Founded 2000, dual-office practice, Tanya's leadership timeline
3. **Vision** — "Bridge the gap between injury and justice"
4. **Mission** — Deep expertise, 4 pillars (Collaborative Excellence, Strategic Speed, Unwavering Dignity, Evolving Advocacy)
5. **Our Team** — "Driven by Results, Defined by Persistence" + intro text
6. **Meet the Director** — Tanya Louise Zandberg profile + quote + photo placeholder
7. **Office Teams** — Two-column (Pretoria / Marble Hall) with photo placeholders
8. **Why Choose RVR** — 5 reasons with icons
9. **Areas of Expertise** — RAF specialization + general litigation

---

### Contact Page

#### [MODIFY] [page.tsx](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/app/contact/page.tsx)
- Updated heading: "Take the First Step Toward Your Recovery"
- Correct phone numbers: Head Office 087 150 5683, MH 013 261 7187/8/9
- Add WhatsApp numbers: PTA 076 046 5545, MH 082 764 0218
- Add email: info@rvrinc.co.za (PTA), martie@rvrinc.co.za (MH)
- Office hours: Mon–Fri 08:00–16:00
- POPIA guarantee notice at bottom of form
- Form sends to info@rvrinc.co.za

---

### Header

#### [MODIFY] [Header.tsx](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/components/layout/Header.tsx)
- Rename "Client Portal" → **"Update on Your Case"**
- Keep: About Us, Practice Areas, Our Team, Insights, Contact
- Remove "Book Consultation" button (client didn't mention it; contact page serves this)

---

### Footer

#### [MODIFY] [Footer.tsx](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/components/layout/Footer.tsx)
- Fix "since 1995" → **"since 2000"**
- Update practice areas to RAF-specific items
- Rename "Client Portal" → **"Update on Your Case"**
- Add social media links (Facebook, LinkedIn, Instagram)
- Correct address: "Pierre van Ryneveld, Pretoria" (not Centurion)

---

### Insights Page

#### [MODIFY] [page.tsx](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/app/insights/page.tsx)
- Show "Under Construction" placeholder with professional messaging

---

### Client Portal → "Update on Your Case"

> [!IMPORTANT]
> The client wants the login to use **ID number or file reference** (KC-, KCS-, L-, or BL- number) instead of email/password. This is a significant auth change. **For this sprint**, I'll rename the branding and note this as a future phase requiring a custom auth lookup table.

#### [MODIFY] [page.tsx (portal)](file:///c:/Users/info/OneDrive/Documents/Antigravity/rvrinc/src/app/portal/page.tsx)
- Rename all "Client Portal" references → **"Update on Your Case"**
- Simplified view: Client's name, reference number, attorney name & email, update message
- No notes by clients, no registration link on website

---

## Verification Plan

### Manual Verification
- Start dev server and visually check each page matches the client brief
- Verify all contact details and content are accurate

> [!NOTE]
> **Photo placeholders**: The client mentions photos of Tanya, office teams, and group photos. I'll use placeholder styling since the actual photos aren't provided yet. They can be swapped in later.
