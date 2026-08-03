# Barnard Mohair — SEO & GEO Audit
**Date:** June 2026  
**Site:** https://barnardmohair.com  
**Platform:** WordPress 7.0 + WooCommerce 10.8.1 + Elementor 4.1.3

---

## Executive Summary

Barnard Mohair has a well-presented e-commerce site with strong product photography and a genuine brand story. However, the site is largely invisible to search engines and AI platforms due to missing structured data, a weak content strategy, incorrect geo-targeting, and an unoptimised page title/description setup. The Phase 1 and Phase 2 work plan below addresses each gap systematically.

---

## 1. Current State Assessment

### 1.1 Page Title & Meta Description

| Page | Current Title | Issue |
|---|---|---|
| Homepage | `Barnard Mohair – High quality Mohair product ` | Trailing space; missing geo-terms (South Africa, Eastern Cape); no product keywords |
| Homepage OG title | `Home: slideshow and banners` | **Critical** — this is what social media and some crawlers read. Completely generic |
| About page | `Our Story – Barnard Mohair` | Fine, but the page content lacks any structured story keywords |
| Product pages | Not audited (follow WooCommerce default) | Likely `[Product Name] – Barnard Mohair` with no enrichment |

**Recommended homepage title:** `Barnard Mohair – Handcrafted Mohair Blankets & Jackets, South Africa`  
**Recommended meta description:** `Family-made mohair blankets, jackets and scarves from the Eastern Cape since 1967. Locally sourced, eco-sensitive production. Ships worldwide.`

---

### 1.2 Language & Geo Targeting

| Setting | Current | Should Be |
|---|---|---|
| HTML `lang` attribute | `en-US` | `en-ZA` |
| OG locale | Not set (defaults to `en_US`) | `en_ZA` |
| GEO meta tags | **Missing** | `geo.region=ZA-EC`, `geo.placename=Alicedale`, `geo.position` |
| hreflang | **Missing** | `<link rel="alternate" hreflang="en-ZA" href="https://barnardmohair.com/" />` |

Google uses the `lang` attribute and GEO meta tags to determine relevance for localised queries. With `en-US` and no GEO signals, the site competes globally without signalling its South African origin — hurting local rankings and confusing international discovery for "South Africa" searches.

---

### 1.3 Structured Data (JSON-LD)

**Current state:** No structured data detected on any page.

**Impact:** 
- Google cannot surface rich results (product cards, FAQs, breadcrumbs)
- AI platforms (ChatGPT, Perplexity, Claude, Google AI Overviews) cannot reliably extract brand facts
- WooCommerce products are invisible to Google Shopping without Product schema

**Missing schema types:**

| Schema Type | Priority | Benefit |
|---|---|---|
| `OnlineStore` + `LocalBusiness` + `ClothingStore` | Critical | Tells Google what the business is |
| `Product` (on product pages) | Critical | Rich results, Google Shopping eligibility |
| `FAQPage` | High | People Also Ask panels; AI answer extractions |
| `BreadcrumbList` | High | Breadcrumb display in SERPs |
| `Article` | High | Journal/blog post rich results |
| `Speakable` | Medium | Voice search and AI summaries |
| `Organization` | Medium | Knowledge panel signals |

---

### 1.4 AI & GEO Readiness (GEO = Generative Engine Optimisation)

**Current state:** The site has no `/llms.txt`, no AI-specific robots.txt allowlist, and no structured content that AI crawlers can easily parse.

**What this means:** When users ask ChatGPT, Perplexity, Claude or Google AI "where can I buy mohair blankets in South Africa" or "best mohair products South Africa", Barnard Mohair will not appear because:
1. No LLM-readable content index (`/llms.txt`)
2. No FAQ or structured content for AI to extract
3. No clear entity definition (what the business is, where it is, what it sells)

**GEO Fixes needed:**
- Add `/llms.txt` endpoint with brand facts, product catalogue summary, story, contact details
- Update `robots.txt` to explicitly allow major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended etc.)
- Add structured data so AI can extract factual answers
- Create a Journal/Media section with evergreen content that AI can cite

---

### 1.5 Technical Performance

| Issue | Finding | Fix |
|---|---|---|
| Slider Revolution | Loaded on every page (not just homepage) | Disable on non-slider pages |
| Elementor | `google_font-enabled` visible in generator tag | Self-host fonts or disable Google Fonts |
| Font Display | `font_display-swap` set correctly | ✓ Good |
| CSS Print Method | `css_print_method-external` | ✓ Good (external CSS files, not inline) |
| Image Optimization | Elementor thumbs visible as SVG placeholders | Ensure WebP conversion is active |
| Viewport | `maximum-scale=1, user-scalable=0` | Consider accessibility implications |
| WooCommerce | Scripts loaded site-wide by default | Limit WC scripts to shop/product pages |

---

### 1.6 Sitemap & Indexation

**Current state:** Google Site Verification tag is present (`jbeZ_4ZoDq9RGJKX-JTRj2vkF6TcGuNqDI9dQfZJRmc`), confirming GSC is connected. However:
- Sitemap submission status unknown — verify in GSC that `sitemap_index.xml` has been submitted and all pages are indexed
- No evidence of sitemap linked in robots.txt (the virtual WP robots.txt doesn't include it)

---

### 1.7 Content Gaps

The site currently has:
- Thin About Us page (good story, but very brief — no keywords, no sub-sections)
- No Blog/Journal section
- No FAQ page
- No dedicated Sustainability page
- Care Guide page exists (good!) — needs enriched content and schema
- Product descriptions appear minimal (common with Elementor/WooCommerce stores)

---

## 2. Priority Action Plan

### Phase 1 — Foundation (Weeks 1–2)

#### 2.1 Child Theme Code Additions
The `barnard-child` theme provides all of the following automatically once installed:

- [x] GEO meta tags injected in `<head>` (ZA-EC, Alicedale coords)
- [x] HTML lang set to `en-ZA`
- [x] OG locale forced to `en_ZA`
- [x] GA4 snippet (paste Measurement ID into `functions.php`)
- [x] Emoji + oEmbed cleanup (page weight reduction)
- [x] AI-aware `robots.txt` with explicit AI bot allowlist
- [x] Virtual `/llms.txt` endpoint with brand index
- [x] JSON-LD structured data: LocalBusiness, ClothingStore, FAQ, Breadcrumb, Speakable, Article (on posts)
- [x] Media/Journal page filter script
- [x] Email obfuscation

#### 2.2 Yoast SEO Configuration (Manual — WP Admin)

1. **SEO → Settings → Site Representation:**  
   - Type: Organization  
   - Name: Barnard Mohair  
   - Alternate name: Barnard Mohair Eastern Cape  
   - Logo: upload logo

2. **SEO → Search Appearance → General:**  
   - Title separator: `–`  
   - Site name: `Barnard Mohair`

3. **Fix Homepage OG Title:**  
   Edit the home page → Yoast sidebar → set SEO title to:  
   `Barnard Mohair – Handcrafted Mohair Blankets & Jackets`  
   Set meta description to:  
   `Family-made mohair blankets, jackets and scarves from the Eastern Cape since 1967. Locally sourced, eco-sensitive. Ships worldwide.`

4. **About Us page:**  
   Yoast title: `Our Story – Barnard Mohair | Since 1967, Alicedale`  
   Meta description: `The Barnard family has been crafting mohair products in Alicedale, Eastern Cape since 1967. Meet the second-generation family behind the brand.`

5. **Enable breadcrumbs** in Yoast → Advanced → Breadcrumbs → Enable

#### 2.3 Google Search Console

- Submit `sitemap_index.xml` if not already done
- Request indexing of homepage, About, all product category pages
- Monitor coverage report for crawl errors

#### 2.4 Google Analytics 4

- Add GA4 Measurement ID to `functions.php`: `define( 'BARNARD_GA4_ID', 'G-XXXXXXXXXX' );`
- Set up conversion events: `purchase`, `add_to_cart`, `begin_checkout`, `contact_form_submit`
- Link GA4 to GSC via GA4 Admin → Search Console Linking

---

### Phase 2 — Content & Authority (Months 1–3)

#### 2.5 Media / Journal Section

Create WordPress page:
- **Slug:** `/journal/`
- **Nav label:** Journal  
- **Purpose:** Houses all blog posts, press coverage, editorial features

**Post Categories to create:**

| Category | Slug | Description |
|---|---|---|
| The Story of Mohair | story-of-mohair | History, origin, Angora goats |
| Craft & Process | craft-and-process | Weaving, production, artisans |
| Sustainability | sustainability | Eco-practices, sourcing, ethics |
| Product Education | product-education | Care guides, usage tips, fabric education |
| Press & Editorial | press | Media features, editorial coverage |
| Collections | collections | New arrivals, lookbooks |

#### 2.6 Foundational Articles (Phase 2 Content)

| # | Title | Category | Target Keyword |
|---|---|---|---|
| 1 | Woven from the Land: Mohair Sourcing and Sustainability at Barnard Mohair | Sustainability | mohair sustainability South Africa |
| 2 | The Complete Guide to Caring for Your Mohair | Product Education | how to care for mohair blanket |
| 3 | The Story of Mohair: From Angora Goat to Heirloom Blanket | Story of Mohair | what is mohair fabric |
| 4 | Inside Our Workshop: How a Barnard Mohair Blanket is Made | Craft & Process | handmade mohair blanket South Africa |
| 5 | Kid Mohair vs Brushed Mohair: What's the Difference? | Product Education | kid mohair vs brushed mohair |
| 6 | Why Mohair is the Ultimate Sustainable Luxury Fibre | Sustainability | sustainable mohair alternative to synthetic |

#### 2.7 Internal Linking Strategy

- All journal articles must link to at least one product category page
- Care Guide page → link to blankets and scarves category
- About Us page → link to Journal and Care Guide
- Product pages → link to relevant journal articles (e.g., blanket product → care guide article)
- Homepage → link to Journal section once 3+ posts are live

---

## 3. Keyword Targets

### Primary (South Africa market)
- `mohair blankets South Africa`
- `mohair jackets South Africa`
- `buy mohair online South Africa`
- `Barnard Mohair`
- `mohair blanket Eastern Cape`

### International / Luxury
- `South African mohair blanket`
- `ethical mohair products`
- `handmade mohair blanket`
- `luxury mohair throw`
- `mohair scarf South Africa`

### Long-tail / Content
- `how to care for mohair blanket`
- `what is kid mohair`
- `mohair vs cashmere`
- `sustainable mohair brand`
- `where to buy mohair in South Africa`
- `mohair factory Eastern Cape`

### GEO / AI Queries
- `best mohair blankets South Africa`
- `where to buy mohair online South Africa`
- `mohair products Alicedale`
- `South African luxury textile brands`

---

## 4. Competitor Gap Analysis

### Key Competitors
1. **Mohair South Africa (mohair.co.za)** — Industry body, not a retailer; strong domain authority. Opportunity: link from them (trade/wholesale section).
2. **Bruntálka / international mohair brands** — Strong on content marketing. Gap: Barnard has better provenance story.
3. **Trenery / Woolworths SA** — Mass market, no artisan angle. Barnard differentiates on heritage + handcraft.

### Differentiation Angles (for content)
- Only Alicedale-based mohair producer with direct-to-consumer sales
- 57-year heritage (1967–2024)
- Second-generation family continuity story
- Women artisans of Alicedale as craftsmakers
- Factory visits as an experience product (unique)
- International Aramex delivery — true global reach

---

## 5. Quick Wins Summary

| Action | Effort | Impact |
|---|---|---|
| Fix homepage title + OG title in Yoast | 5 min | High |
| Install barnard-child theme (GEO + schema + AI) | 30 min | Very High |
| Submit sitemap to GSC | 5 min | High |
| Link GA4 account | 15 min | High |
| Create Journal page + 6 post categories | 20 min | Medium (now) / High (later) |
| Upload 2 articles with proper meta | 30 min | Medium |
| Add About Us page keywords | 20 min | Medium |
| Enable Yoast breadcrumbs | 5 min | Medium |
| Product page descriptions enrichment | 2–3 hrs | High |
| Enable WebP image serving (via plugin) | 10 min | Medium (performance) |
