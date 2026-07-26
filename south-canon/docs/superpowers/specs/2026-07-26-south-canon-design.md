# South Canon — Theatrical Licensing Platform

**Date:** 2026-07-26
**Status:** Approved design, ready for implementation planning
**Architect:** Claude · **Implementation:** DeepSeek

---

## 1. Context

South Canon is a new theatrical licensing agency positioning itself as the leading rights
organisation on the African continent, and a premium rights organisation for the global South.

The opening catalogue is Paul Slabolepszy — 39 plays available, launching with the most famous
7 or 8. Mike van Graan and Napo Masheane are in active discussion. The catalogue is expected to
grow rapidly.

### The incumbent

DALRO (dalro.co.za) was the South African gold standard until roughly 2010 and has since
declined to the point where respected South African writers no longer want their work
administered there.

Its current state, verified 2026-07-26:

- WordPress 6.8 + Elementor + WooCommerce marketing site
- Catalogue on a separate subdomain (catalogue.dalro.co.za), Contentful-backed
- Homepage renders empty `DALRO in a nutshell` and `TESTIMONIALS` headings with no content
- 156,000 claimed works, but the catalogue is browse-only: no availability status, no pricing,
  no author pages, no production history
- Every path dead-ends at a generic "Get Permission" form

**The strategic reading:** DALRO did not lose writers because of its website. It lost them
because administration rotted — slow permissions, opaque royalties, writers not knowing what
they had earned or when they would be paid. The website is therefore not the product. The
rights-holder portal is. It is the wound DALRO left, no competitor on the reference list does
it well, and it is a demo that can be put in front of a writer in a meeting.

### Competitor patterns (researched 2026-07-26)

| Site | Stack | Shape |
|---|---|---|
| MTI (mtishows.com) | Drupal 11 + Commerce | Faceted catalogue (style/theme/type/setting/cast) → show page with Request Perusal + Request License, synopsis, cast breakdown, song list, cost estimator, upcoming-productions map, per-show Q&A, media gallery, resources marketplace |
| Concord (concordtheatricals.com) | Custom + Algolia | Split routes: `/p/` perform (license), `/s/` shop (script). Detail page carries cast size (`1w, 2m`), performing groups, time period, setting, cautions, press quotes, photos, public minimum fee ("$120 per performance"), author profile pages |
| TRW (theatricalrights.com) | WordPress + WooCommerce | `/shows/` → `/show/<slug>/` → `/author/<slug>/`. Simplest of the three |

All three monetise three lines: performance royalty, materials (perusal / script / score), and
add-ons (logo packs, ticketing, accompaniment tracks). South Canon v1 addresses the first two.

---

## 2. Decisions taken

| Decision | Choice | Reasoning |
|---|---|---|
| Transaction depth | Enquiry → human-issued licence | With 7–8 titles, human approval is fast enough and reads as premium/curated. No payments on site in v1. |
| Writer portal | v1, full-featured | The signing asset. Read-only reporting plus writer submissions, editable profile, statement export. |
| Licensee segments | All four: schools/universities, community/amateur, professional SA+Africa, international | Requires the full tier system and territory-scoped rights from day one. |
| Script delivery | Gated watermarked PDF on approval | Protects the work, records who read what, no shop needed. |
| Pricing display | Indicative minimum + estimator | Biggest UX gap in DALRO; pre-qualifies enquiries. Non-binding. |
| Catalogue editing | Client, via bespoke admin | Rights and royalty data does not belong in a generic CMS; one system beats two in sync. |
| Design tone | Editorial & literary | Signals custodianship of the work — the pitch to writers. |
| Launch | 7–8 titles, design-led | Content (photo/video) is the bottleneck; design must not depend on it. |

### Explicitly out of scope for v1

- Card payments, checkout, invoicing
- Printed or digital script *sales* (as distinct from gated perusal copies)
- Ticketing, accompaniment tracks, logo packs and other MTI-style add-ons
- Per-show public Q&A
- Multi-currency pricing (fees are quoted in ZAR; international applicants are quoted manually)
- Algolia or any external search vendor

---

## 3. Architecture

**Stack:** Next.js 15 (App Router) + Supabase (Postgres, Auth, Storage) + Tailwind, on Vercel.
Chosen to match the existing project portfolio so implementation can follow established patterns.

**Four surfaces, one codebase, one database:**

| Surface | Audience | Rendering | Auth |
|---|---|---|---|
| Public catalogue | Anyone | Static / ISR | None |
| Producer account | Licence applicants | Server-rendered | Supabase Auth, role `producer` |
| Writer portal | Rights holders | Server-rendered | Supabase Auth, role `writer` |
| Admin back-office | South Canon staff | Server-rendered | Supabase Auth, role `admin` |

Roles are stored in Supabase `app_metadata` and enforced with row-level security. There is no
separate users table — `applicant_user_id` and `playwright.user_id` reference `auth.users`.

**Producers must create an account before applying for a licence or requesting a perusal copy.**
The account is required regardless, in order to deliver the gated PDF to a named person and to
let the applicant track status. Browsing the catalogue never requires login.

**Search:** Postgres full-text search plus `pg_trgm` fuzzy matching across title, playwright
name, and synopsis. Handles tens of thousands of rows without an external vendor.

---

## 4. Domain model

```
playwrights           id, user_id (nullable, → auth.users), name, slug, bio,
                      portrait_url, country, honours[], represented_since, status

plays                 id, title, slug, logline, synopsis_short, synopsis_full,
                      genres[], year_written, duration_min, acts, languages[],
                      setting, time_period, content_warnings[], themes[],
                      is_musical, target_audience, status (draft|published)

play_playwrights      play_id, playwright_id, role (book|music|lyrics|translation|adaptation)

play_roles            play_id, name, gender, age_range, description, is_ensemble, sort
                      -- aggregates to the "3m, 2f + ensemble" summary

play_media            play_id, type (photo|video), url, caption, credit, sort

play_press            play_id, quote, source, published_at

play_productions      play_id, company, venue, city, country, starts_on, ends_on,
                      director, notes, is_premiere, is_upcoming

rights_availability   play_id, territory, tier_id,
                      status (available|restricted|unavailable),
                      restriction_note, valid_from, valid_to

licence_tiers         id, name (amateur|educational|community|professional|international),
                      min_fee, royalty_pct, notes

licence_applications  id, play_id, applicant_user_id, org_name, contact,
                      territory, venue, seat_count, ticket_price, first_performance,
                      performance_count, tier_id, notes,
                      status (submitted|reviewing|quoted|approved|declined|licensed),
                      quoted_amount, decided_at

perusal_requests      id, play_id, applicant_user_id, status, granted_at,
                      expires_at, download_token, downloaded_at

royalty_statements    id, playwright_id, period_start, period_end,
                      status (draft|issued|paid), issued_at, paid_at, payment_ref

royalty_lines         statement_id, production_id, gross, royalty_due,
                      writer_share, agency_share

writer_submissions    id, playwright_id, title, synopsis, script_url,
                      status (submitted|reviewing|accepted|declined), notes
```

**Two tables make this a rights organisation rather than a brochure:**
`rights_availability` (a title can be available in South Africa, restricted in the UK, and
unavailable entirely while a professional run is on) and `royalty_statements`.

`play_productions` does double duty — it is the public "Upcoming productions" feature *and* the
source record for what a writer is owed.

**Retrofit risk avoided:** territory-scoped rights and licence tiers are both cheap now and
expensive later. They are in the model from day one even though v1 may only populate
"Southern Africa" and "Worldwide".

---

## 5. The Play Detail template

Repeatable for every title. Every block degrades to nothing when its data is empty, so a
sparsely-documented title still renders as deliberate rather than broken.

1. **Hero** — title, playwright(s), logline, one large production still, availability badge
2. **Primary actions** — `Request perusal script` · `Apply for licence`
3. **At-a-glance strip** — cast size · duration · acts · genre · language · audience ·
   content warnings
4. **Synopsis** — short, expandable to full
5. **Characters** — role-by-role breakdown with gender, age range, description
6. **Setting & period**
7. **Production history** — premiere first, then notable revivals
8. **Press** — pull-quotes with attribution
9. **Media** — photo gallery and video, when present
10. **Licensing** — tier table showing "from R___ per performance", plus the estimator
    (tier, seats, ticket price, performance count → indicative range, clearly non-binding)
11. **Rights & availability** — by territory, with restriction notes
12. **The playwright** — bio card linking to full profile
13. **Related plays** — same playwright, genre, or comparable cast size
14. **Structured data** — `CreativeWork` + `Person` schema.org markup

Catalogue index filters: **title, playwright, genre** as briefed, plus **cast size**,
**duration**, and **availability in my territory**.

---

## 6. Design system

Editorial and literary. Must read premium on typography alone, before any video exists.

- **Type** — serif display face for titles and play names; clean grotesque for UI and body.
  Large scale: play titles set like a title page, not a product card.
- **Palette** — ink near-black on warm off-white, one saturated accent for actions.
  Deliberately restrained so production photography carries the colour. Availability states
  get their own small semantic set that never competes with the accent.
- **Layout** — wide margins, asymmetric grid, full-bleed imagery in hero and gallery only.
  Catalogue cards are typographic (title, playwright, genre, cast size) with imagery as quiet
  support. This is what stops a thin catalogue looking empty.
- **Motion** — minimal and slow. Fades and small translations on scroll-in. Nothing bouncy.
- **Mobile** — the catalogue is the mobile-critical surface: sticky filter sheet, single-column
  typographic cards, and the two play-page CTAs pinned to a bottom bar.
- **Logo** — wordmark, not a symbol. "SOUTH CANON" in the display serif with tight
  letterspacing, so it sits naturally beside writer names and reads as an imprint. Three
  directions produced in Milestone 1 for the client.

---

## 7. Standards applied

Carried over from established project rules rather than re-derived:

- Honeypot + submission-timing anti-bot on every form that emails or writes to the database.
  No CAPTCHA, no extra infrastructure.
- Both logins ship with forgot-password, show-password toggle, and keep-me-signed-in in the
  first pass — not retrofitted.
- Supabase keep-alive GitHub Action (cron insert into a `keep_alive` table, Mon/Thu) so the
  Free-plan database never pauses.
- POPIA: privacy notice, explicit consent on applications, and a stated retention position for
  applicant data.
- Perusal PDFs are watermarked with the requester's name and organisation, served through a
  time-limited signed URL, and never exposed as a public storage path.

---

## 8. Delivery milestones

Each milestone is independently shippable.

**M1 · Public catalogue** — the pitch asset.
Schema and admin for plays and playwrights, catalogue index with search and filters, full Play
Detail template, playwright profiles, about and contact pages, SEO and structured data, logo
directions.

**M2 · Licence pipeline.**
Application form capturing tier, territory, venue, seats, ticket price and dates; the
estimator; perusal request and gated watermarked PDF with expiry; producer account; admin queue
for reviewing → quoting → issuing; email notifications.

**M3 · Writer portal.**
Writer login, their titles, production log, royalty statements with PDF export, payment status,
editable bio and photo, new-work submission with moderation.

Content loading for the opening 7–8 Slabolepszy titles happens across M1 and M2 as it is
gathered.

---

## 9. Success criteria

**M1** — a producer can find a play by title, by genre, and by playwright; every published
title renders a complete Play Detail page with no empty-block artefacts; the catalogue is
indexed with valid `CreativeWork` structured data; the client can add a new play and playwright
end-to-end through the admin without developer involvement.

**M2** — a producer can submit a licence application and receive an indicative estimate before
submitting; a perusal request can be approved in admin and produces a watermarked,
time-limited PDF for exactly that requester; every application state change notifies both
parties by email.

**M3** — a writer can log in and see every production of every title they have with South
Canon, the royalty attributable to each, and its payment status; they can export a statement as
PDF; they can submit a new work for consideration.

---

## 10. Open items for the client

Not blockers for implementation — these are data inputs, entered through the admin once known.

- Actual minimum fees and royalty percentages per licence tier
- Confirmed territory definitions for the rights model (proposed default: South Africa,
  Rest of Africa, United Kingdom, North America, Rest of World)
- The writer/agency royalty split used in statements
- Photo, video and press material per title
- Registered company details, address and Information Officer for the POPIA and legal pages
