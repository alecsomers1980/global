# Implementation Plan: Bushbuckridge Directory

An offline sales model business directory and journal hub featuring public search/filtering and an internal admin approval workflow.

## Proposed Changes

### 1. Database & Backend (Supabase)
We will establish the following core tables:
*   `businesses`: `id`, `name`, `sector_id`, `area_id`, `phone`, `whatsapp`, `email`, `description`, `status` (pending/active), `package_tier`, `is_featured`, `is_verified`, `created_at`.
*   `sectors` & `areas`: Taxonomy tables (`id`, `name`, `slug`).
*   `posts` (Spotlight): `id`, `title`, `slug`, `content`, `image_url`, `business_id`, `created_at`.
*   `events`: `id`, `title`, `date`, `venue`, `contact_info`, `is_featured`, `created_at`.
*   `opportunities`: `id`, `title`, `category_id`, `deadline`, `contact_info`, `created_at`.
*   `jobs`: `id`, `title`, `description`, `created_at`.
*   `sponsorships`: Tracking which business holds which sponsor slot (Hero, Sector, etc.).
*   `enquiries`: Form submissions for lead tracking (`id`, `type`, `business_name`, `contact_person`, `phone`, `email`, `details`, `created_at`).

### 2. Admin Portal Component
*   Dedicated `/admin` route protected by Supabase Auth (Row Level Security).
*   **Business Review Queue:** UI to view pending business listings submitted via the "Buy your spot" form, update payment status, and publish.
*   **Sponsor Management:** UI to set and expire sponsor slots.
*   **Content CMS:** Simple forms for creating Spotlights, Events, Opportunities, and Jobs.

### 3. Public Frontend Structure (Next.js + React + Tailwind CSS)
*   #### [NEW] `app/page.tsx`
    Home/Hub with Hero, global search, quick tiles, latest feeds, sponsor strips.
*   #### [NEW] `app/find-a-service/page.tsx`
    Service-oriented filtered view.
*   #### [NEW] `app/directory/page.tsx`
    Full directory with complex filters (sector, area, verified) and sorting logic (Featured -> Premium -> Enhanced -> Standard -> Alphabetical).
*   #### [NEW] `app/directory/[sector]/page.tsx`
    Dynamic route for specific sectors, including sponsored slots.
*   #### [NEW] `app/spotlight/page.tsx` & `app/spotlight/[slug]/page.tsx`
    Spotlight blog archive and single post view.
*   #### [NEW] `app/events/page.tsx`, `app/opportunities/page.tsx`, `app/jobs/page.tsx`
    Listing pages for these respective content types.
*   #### [NEW] `app/buy-your-spot/page.tsx`
    Lead capture form for offline sales. Saves to `enquiries` table and/or `businesses` table with `status = pending`.
*   #### [NEW] `app/enquiries/page.tsx`
    General contact form. Saves to `enquiries` table.

### 4. Utilities & Integrations
*   **WhatsApp Normalizer:** Utility function `normalizeWhatsAppNumber(number)` to convert ZA numbers (`073...`) to `+2773...` format for `https://wa.me/` links.
*   **File Uploads:** Storage buckets via Supabase for business logos and the Annual Journal PDF.

## Verification Plan
### Automated Tests
*   **Unit Tests:** Ensure the WhatsApp normalizer successfully converts edge-case phone numbers (e.g., handles spaces, existing country codes, local formats).
*   **Integration Tests:** Test search filter states (e.g., filtering by Sector AND Area) against a seeded Supabase local database.

### Manual Verification
*   Complete the "Buy your spot" workflow on the public frontend to ensure the lead appears in the Admin Portal as "Pending".
*   As an Admin, approve the lead and verify the listing becomes visible on the public `/directory` route.
*   Verify layout responsiveness on mobile devices (critical for local users in Bushbuckridge).
