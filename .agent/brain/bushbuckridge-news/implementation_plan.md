# Bushbuckridge News Project Plan

## Goal Description
Build a modern, scalable news platform for Bushbuckridge News that can be easily cloned into 3 additional websites with the same functionality but distinct branding/UI. The solution will streamline content management (posting stories, selecting top stories), completely migrate existing stories from their legacy WordPress database, incorporate automated social media distribution, maximize site revenue via direct ad sales and Google AdSense, and provide a roadmap for maximizing traffic and awareness in the local news niche.

## Proposed Strategy & Architecture

### 1. System Architecture (Multi-Site Ready)
To support 4 identical but visually distinct sites efficiently:
- **Frontend (React 19, Tailwind v3.4.17, GSAP 3):** We will build a single scalable codebase strictly following the **Cinematic Landing Page Builder** guidelines. The sites will feel like premium "digital instruments" with intentional scrolling, micro-interactions (magnetic buttons), and weighted animations (using GSAP `ScrollTrigger`), eliminating generic UI patterns. We will use environment variables to load distinct "Aesthetic Presets" (e.g., Organic Tech, Midnight Luxe) tailored for each news site, utilizing a global noise overlay and smooth rounded corners throughout.
- **Backend / Headless CMS (Supabase or Payload CMS):** Instead of 4 separate messy WordPress installs, we will use a Headless CMS with a `site_id` flag to support all domains. A boolean flag `is_top_story` will allow easy curation for the hero section.

### 2. WordPress Migration (DB & Media)
- **Timeframe:** We will import stories **only from the beginning of 2025 to the present**.
- **Database Extraction:** We will export the `wp_posts` and `wp_postmeta` tables from the WordPress database, filtering by the `post_date` >= '2025-01-01'.
- **Media Migration:** We will extract the relevant images for these 2025+ posts and bulk-upload them to a modern cloud storage bucket.
- **Transformation Script:** Replace old image source URLs inside the articles with the new cloud storage links and import the formatted data straight into our new database.

### 3. Monetization (Ad Space & AdSense)
- **Google AdSense:** Integrate responsive AdSense components into standard web slots: Header Banner, In-Article, and Sidebar Sticky Slots.
- **Direct Ad Space Rental (Premium Revenue):**
    - Build an "Advertise With Us" self-serve portal.
    - Local businesses can upload their banner, pick a time-slot, and pay via **Payfast**. The site will automatically display their ad and take it down when the rental expires.
    - **Sponsored Articles:** Add a "Sponsored" category flag so businesses can pay for PR articles.

### 4. Automation (Social Media & Stories)
- **Social Media Publishing:** Social media auto-posting to platforms like Facebook, X, and Instagram will be handled exclusively by the **Ember Social Media Automation project** we are currently building. We will integrate the news platform's CMS publishing webhooks directly with Ember.
- **AI Content Assistance:** Integrate an "AI Writer Assistant" in the CMS to instantly format raw press releases into news stories and extract SEO-friendly summaries.
- **RSS Aggregation:** Auto-fetch related public news feeds into a "Drafts" folder.

### 5. Traffic & Awareness Growth
1. **WhatsApp / Telegram Channels (Crucial for Local News):** Embed a prominent "Get Breaking News on WhatsApp" widget. Distributing links directly to phones is the highest converting traffic source in regional news right now.
2. **Automated Newsletters:** Integrate a newsletter system (e.g., Resend or Mailchimp). Have an automated script scrape the "Top Stories" every Friday and email a weekly recap to subscribers.
3. **SEO Best Practices:** Implement programmatic SEO. The frontend will automatically generate `NewsArticle` schema markup, semantic URLs, and fast Core Web Vitals to boost Google News and Discover categorization.

## Verification Plan

### Automated Tests
- End-to-end tests (using Playwright or Cypress) to verify that applying a different `site_id` environment variable correctly changes the loaded CSS theme.
- Webhook testing to ensure posting a dummy story successfully triggers the social media automation JSON payload.
- Migration script local testing on a subset of 100 WordPress rows to ensure images map correctly.

### Manual Verification
- Deploying the frontend layout with dummy/placeholder data and having the client review the "White label" branding switch mechanism.
- Having the client test the CMS "Top Story" toggle and verify it immediately updates the homepage Hero section.
