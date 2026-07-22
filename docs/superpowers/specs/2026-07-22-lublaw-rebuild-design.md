# Lublaw (B Lubbe & Associates Attorneys) — Next.js Rebuild

**Status:** Approved
**Date:** 2026-07-22
**Source site:** https://lublaw.co.za/ (WordPress)

## Purpose

Rebuild the B Lubbe & Associates Attorneys website in Next.js, preserving the existing look and feel (gold/maroon palette, section structure, content) while modernizing the execution — responsive layout, cleaner nav, no dated WordPress-theme feel. Add an admin area so staff can manage blog posts without touching code.

## Firm context (from source site)

- B Lubbe & Associates Attorneys, founded 1998, Table View / Bloubergsands, Cape Town.
- Practice groups: Wills & Estates, Property Law, Litigation, Law of Contract, plus standalone Notary and Blog.
- ~26 practice-area pages total (see Content Inventory below).
- Active blog: ~17 listing pages, ~150+ posts, roughly monthly cadence since at least 2021.
- Brand colors: primary/accent `#B0A46E` (gold), secondary `#8D2B2E` (maroon), background white, body text `#666666`.
- Contact: 021 554 4882, info@lublaw.co.za, 9E Sandown Road, Bloubergsands, 7441.

## Stack

Matches the established pattern from Dianas Bulbinella, Aloe Signs, and HSLabour:

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** — Postgres (blog posts), Auth (admin login), Storage (blog images)
- **Resend** — contact form email delivery
- **Vercel** — hosting, git-push auto-deploy

## Content architecture

Two content types, handled differently based on how often they change:

### 1. Practice-area pages (static, ~26 pages)

Legal service descriptions that rarely change. No CMS needed — over-engineering to put these in a database.

- Each page's real text is crawled from the live site (not rewritten) for content parity, then stored as a structured TypeScript data object (title, slug, group, body sections, related-page links).
- Rendered through one shared `PracticeAreaTemplate` component, keeping ~26 near-identical page components from being hand-written.
- Content inventory (grouped, matching the source nav):
  - **Wills & Estates:** Administration of Deceased Estates, Drafting of Wills, Setting up Trusts / Appointment of Trustees, Estate Planning, Contingency Plans for SMEs, Estate & Wills Related Litigation
  - **Property Law:** Conveyancing, Property Transfer Cost Calculator, Contracts, Lease Agreements, Sureties, Power of Attorney, Property Dispute Litigation
  - **Litigation:** Divorces, Property Disputes, Evictions, Debt Collection, Consumer Protection Act, Personal Injuries, High Court Applications
  - **Law of Contract:** Antenuptial (PreNup) Contracts, Service Level Agreements, Cohabitation Agreements, Partnership Agreements
  - **Standalone:** Notary, Intellectual Property
  - **Legal/compliance:** Cookies Disclaimer, POPIA Privacy Notice (real pages, not a popup), PAIA Manual (linked document)

### 2. Blog (dynamic, admin-authored)

Supabase-backed so non-technical staff can publish without a deploy.

- `posts` table: `id`, `title`, `slug`, `excerpt`, `content` (rich text/markdown), `featured_image` (Supabase Storage URL), `status` (`draft` | `published`), `published_at`, `created_at`, `updated_at`.
- Supabase Storage bucket for post images.
- `/admin/blog`: list, create, edit, delete, publish/unpublish. Single admin account.
- Public `/blog` (paginated list) and `/blog/[slug]` (post detail), matching the old site's URL-friendly structure.

## Blog migration (one-time)

The existing blog has real SEO value (~150+ posts) and must not be lost:

1. Crawl all ~17 listing pages (`/blog-2/`, `/blog-2/page/2/` … `/page/17/`) to collect every post URL.
2. Scrape each post page for title, publish date, body content, and featured image.
3. Download each featured image and upload it to the Supabase Storage bucket (so the new site never depends on the old WordPress host staying online).
4. Bulk-insert all posts into `posts` with `status = published` and the original `published_at` dates preserved (so chronological order and any date-based SEO signals survive).
5. **Verification:** scraped-post count must match inserted-row count; spot-check at least 5 posts (including the oldest and newest) against the live site for title/date/content/image accuracy before considering migration done.

DeepSeek (`ds-agent.js`) writes the migration script; Claude reviews the script and verifies the results.

## Design modernization

Keep: gold/maroon palette, logo, overall section order (Hero → "Where people matter" intro → Why Us → Vision/Values → Specialisms grid → About Berna Lubbe → Contact form → Footer with address/POPIA links).

Change: mobile-first responsive layout, modern dropdown mega-menu for the 4 practice groups (replacing the old flyout nav), real CSS Grid/Flexbox cards instead of the old slider/table-based layout, cleaner typography scale, subtle motion on scroll/hover. No content invented — copy comes from the crawled source.

## Admin & auth

- Single Supabase Auth account (email/password) — no multi-user roles needed for a one-person admin workflow.
- Per standing project rule, the login ships from the first pass with: forgot-password flow, show-password toggle, and keep-me-signed-in — not retrofitted later.
- `/admin` is the only authenticated area; practice-area pages are not admin-editable (see Content Architecture above).

## Contact form

- Homepage form (Name, Email, Message) POSTs to a Next.js API route.
- API route sends via Resend to `info@lublaw.co.za`.
- Requires a Resend API key + verified sending domain, which is not yet available. The form and API route are built now; if the key is missing at runtime, the route returns a clear error rather than failing silently, and this is flagged as an explicit pre-launch TODO.

## Deployment

Vercel, git-push auto-deploy from `main`, matching the majority of sibling projects (not the execair/ember-social manual-CLI exceptions).

## Delegation

Claude acts as architect: designs data model, template structure, and reviews output. DeepSeek (`ds-agent.js` via the local `localhost:8082` proxy) writes the bulk of component code, the practice-area template, admin CRUD screens, and the migration script, to minimize Claude token usage per user's standing instruction.

## Out of scope (not requested)

- AI-generated blog content (this is a manual admin CMS, not an auto-generator like HSLabour/Everest's news generators).
- Multi-user roles/permissions for the admin (single account only).
- Redesigning the practice-area page copy (content is carried over as-is, not rewritten).
- Live re-hosting/proxying of the old WordPress site during migration (this is a one-time crawl, not an ongoing sync).

## Success criteria

1. All ~26 practice-area pages render with real crawled content, correct nav grouping, and pass a manual content spot-check against the live site.
2. Homepage renders all original sections, is responsive at mobile/tablet/desktop widths, and visually reads as a modernized version of the same brand (gold/maroon retained).
3. Contact form submits successfully in dev with a test Resend key, or fails with a clear, visible error if no key is configured.
4. Admin login works end-to-end including forgot-password, show/hide password, and keep-me-signed-in.
5. Admin can create, edit, publish, unpublish, and delete a blog post, and it appears/disappears correctly on the public `/blog`.
6. Blog migration: scraped-post count matches `posts` row count; 5+ spot-checked posts (including oldest/newest) match the source site's title, date, content, and image.
7. Site deploys to Vercel via git push and the live URL loads without build errors.
