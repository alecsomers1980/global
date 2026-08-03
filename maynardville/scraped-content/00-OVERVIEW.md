# Maynardville Open-Air Festival — Site Research Overview

Research captured from https://maynardville.co.za via Firecrawl on 2026-06-15.
Source site: WordPress 6.9.4 + Divi 4.27.5 theme. Tickets via **Quicket** (organiser 56357). Auditions via **Airtable**. Several forms via **Google Forms**.

## What this organisation is
- **Maynardville Open-Air Festival** — Cape Town's open-air summer theatre festival in Maynardville Park, Wynberg. Running annually **since 1956**; **70th anniversary in 2026**.
- Programme: annual **Shakespeare** production plus ballet, opera, orchestral/classical concerts, jazz, blues, swing, show tunes.
- **Legal entity:** Maynardville Theatre NPC (reg 2023/722430/08, VAT 4200317545).
- **Governance:** Maynardville Theatre Trust (est. 1999).
- **Producer:** VR Theatrical (since 2023).
- **Venue:** ~600–700 seat wooded amphitheatre (figure inconsistent across pages — confirm).

## Key people / contacts
| Function | Contact |
| --- | --- |
| Box Office / Ticketing | boxoffice@maynardville.co.za · +27 69 792 6020 |
| General | info@maynardville.co.za · +27 68 217 8141 |
| Sponsorship | sponsorship@maynardville.co.za / office@maynardville.co.za · 082 773 5397 |
| Accounts/Finance | accounts@maynardville.co.za (Wessel Odendaal) |
| Schools | schools@maynardville.co.za |
| Food Market partnerships | sivu.mlatha@maynardville.co.za (Sivu Mlatha) |
| Production Office | Alyssa van der Schyff (GM, VR Theatrical) |
| Lead Producer | Jaco van Rensburg (Founder, VR Theatrical) |

## Pages captured (in this folder)
| File | Page |
| --- | --- |
| 01-home.md | Home |
| 02-about-us.md | About Us |
| 03-past-productions.md | Past Productions (full 1956–2026 list) |
| 04-festival-programme.md | Festival Programme (between-seasons placeholder) |
| 05-twelfth-night-2026.md | Twelfth Night 2026 — cast & creative team |
| 06-food-market.md | Food Market + 2025 partners + vendor info |
| 07-parking.md | Parking |
| 08-vip-bookings.md | VIP Bookings |
| 09-deaf-hearing-impaired.md | Accessibility / SASL performances |
| 10-sponsors-and-partners.md | Governance, producer, sponsors |
| 11-schools.md | School bookings + pricing |
| 12-professional-development.md | Crew / interns / directors programmes |
| 13-contact-and-faq.md | Contact details + full FAQ/policies |
| 14-invoice-procedure.md | NPC billing / supplier invoicing |

## Data domains for a back-end system (candidate entities)
Based on the content, a "background system" would likely manage:
1. **Productions / Events** — title, year, director, dates, running time, suitability, synopsis, poster, Quicket event link.
2. **Cast & Creative Team** — people with roles per production + bios (reusable People table; many recur across years).
3. **Performances / Schedule** — dates, times (19:45), performance type (public / schools / SASL-interpreted / VIP).
4. **Bookings** — public (Quicket), school groups (tiered pricing + deposits + Learner Guides), VIP, accessibility (direct, non-Quicket), group discounts.
5. **Food Market** — vendors & tiered partners (Innovation/Green/Food/Wine/Design/etc.).
6. **Sponsors & Partners** — trustees, producer, sponsors, partner tiers, logos, links.
7. **Programmes / Applications** — Professional Development cohorts, Directors' internship, Interns, Schools (currently Google Forms/Airtable).
8. **Suppliers / Finance** — NPC invoicing, POPs, 30-day terms, accountant.
9. **CMS content** — News/announcements, FAQ, policies (privacy, terms), weather updates.
10. **Notifications** — weather/cancellation alerts (currently via Facebook/Instagram).

## Pages NOT yet scraped (available on request)
Lower-priority / archival: /terms-conditions, /privacy-policy, /weather, /competitions, /latest-news (+individual news posts), /vip-getaway, /valentines-2026, /romeo-juliet, /internship-applications-2026, /intern-application, and various 2023–2025 archive/news pages. Say the word and I'll pull any of these.

## Open questions to confirm with the client
1. Exact seating capacity (600 vs 700 stated).
2. What "background system" means precisely — admin/CMS to replace WordPress, an internal ops/box-office tool, a bookings/CRM layer over Quicket, or a finance/supplier system?
3. Should it integrate with Quicket / Airtable / Google Forms, or replace them?
