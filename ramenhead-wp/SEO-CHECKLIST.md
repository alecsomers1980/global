# Ramenhead — SEO Checklist

Everything that's pre-built into this package vs. what still needs you to log into WordPress / Google / Bing to finish.

---

## ✅ Pre-built (no work needed beyond importing the package)

These are all set up by the WXR import + child theme activation.

### On-page SEO
- ✅ Per-page **Yoast title** on Home, Menu, Drinks, About, Media
- ✅ Per-page **Yoast meta description** (48-hour, Speaker's Corner, single location — all consistent)
- ✅ Per-page **Yoast focus keyphrase**
- ✅ Per-page **canonical URL**
- ✅ Per-page **Open Graph + Twitter card** title / description / image
- ✅ Per-post Yoast title + description for all 19 press articles
- ✅ Exactly one `<h1>` on every page; clean `h2` / `h3` hierarchy
- ✅ Image `alt` text on every gallery photo and the two About images
- ✅ `<html lang="en-ZA">` set by the child theme

### Structured data (JSON-LD)
- ✅ **Restaurant + LocalBusiness** schema on every page (name, address, GPS, phone, email, hours, cuisine, price range, payment, reservations, Instagram + Facebook sameAs)
- ✅ **Menu** schema on `/menu/` with every dish, description and ZAR price (rich-result eligible)
- ✅ **FAQ** schema on home / about / menu — 10 questions covering hours, location, reservations, vegan options, payment, prices, allergies, kids, live music, ownership
- ✅ **BreadcrumbList** schema on every non-home page
- ✅ **Speakable** schema on the home page (Google Assistant, Siri)
- ✅ Yoast's duplicate `Organization` graph piece filtered out so the canonical entity is the single Restaurant

### Local / GEO
- ✅ Address consistent everywhere: 37 Parliament Street, Speaker's Corner, Cape Town, 8001
- ✅ GEO meta tags: `geo.region=ZA-WC`, `geo.placename=Cape Town`, `geo.position=-33.9249;18.4192`, `ICBM`
- ✅ `addressCountry: ZA`, `addressRegion: Western Cape` in schema

### AI / Generative search
- ✅ `/llms.txt` served at site root (structured site summary for GPTBot, ClaudeBot, PerplexityBot, etc.)
- ✅ `/robots.txt` explicitly allows GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, Claude-Web, PerplexityBot, Google-Extended, Applebot, Applebot-Extended, Bytespider, CCBot, cohere-ai, Meta-ExternalAgent, DuckAssistBot, YouBot, Diffbot
- ✅ Sitemap referenced in robots.txt

### Performance (impacts ranking)
- ✅ Self-hosted Poppins (no Google CDN round-trip) — ~40 KB woff2, latin subset
- ✅ Preload of weights 400 + 600 for fast LCP
- ✅ Elementor's separate Google Fonts request disabled (~150–250 ms saved)
- ✅ WordPress emoji scripts disabled
- ✅ Lazy-loading on gallery (eager on first 2, lazy on the rest)

---

## ⚠️ You still need to do

In rough order of importance.

### 1. Apply Yoast global settings (5 min)

Two paths, pick one:

**(a) Import the settings file** — fastest if Yoast accepts it:
1. `WP Admin → SEO → Tools → Import & Export → Import settings`
2. Open [yoast/yoast-settings.ini](yoast/yoast-settings.ini), paste the entire contents into the textarea (or upload as a file), click **Import**.
3. Verify in `SEO → Settings`.

**(b) PHP fallback** — bulletproof, use if (a) errors:
1. Install the free **Code Snippets** plugin.
2. Add New Snippet → paste the contents of [yoast/yoast-setup.php](yoast/yoast-setup.php) (everything after the opening `<?php` tag).
3. Set to "Only run once" → Save & activate.
4. Visit the admin dashboard once — a green notice confirms it ran. Delete the snippet after.

Either path sets: site representation (Organization = Ramenhead), title templates, breadcrumbs, indexing rules, default OG image, social profiles, Twitter card type.

### 2. Run Yoast's First-Time Configuration wizard

Even after (1), Yoast wants you to walk through its wizard once to mark "configured":

`WP Admin → SEO → General → First-time configuration`

The wizard will mostly re-confirm what you already set:
- Site representation: **Organization → Ramenhead**
- Logo: confirm/upload `logo.png`
- Social profiles: Facebook + Instagram URLs
- Help us improve Yoast SEO: your choice
- You don't need to claim site name (you've set it)

### 3. Verify Google Search Console

1. Go to https://search.google.com/search-console
2. Add property → **Domain property** (preferred) or URL prefix `https://www.ramenhead.co.za`
3. Verify ownership — easiest method is the **HTML tag** route: copy the meta tag → paste into `WP Admin → SEO → Settings → Webmaster Tools → Google verification code`
4. Submit sitemap: paste `sitemap_index.xml` into the Sitemaps section
5. Use the **URL Inspection** tool to request indexing for `/`, `/menu/`, `/drinks/`, `/about/`, `/media/`

### 4. Verify Bing Webmaster Tools

1. https://www.bing.com/webmasters
2. Import from Google Search Console (one-click after step 3) — fastest path
3. Submit sitemap there too

### 5. Google Business Profile (HUGE for local SEO)

This is the single highest-leverage SEO action for a Cape Town restaurant. Free, do not skip.

1. Sign in at https://business.google.com
2. Add / claim **Ramenhead** at 37 Parliament Street, Cape Town
3. Verify (postcard or phone — they choose)
4. Fill in *everything*:
   - **Hours**: Tue–Sat 5:00 PM – 10:00 PM, closed Sun/Mon
   - **Phone**: +27 67 312 8061 (WhatsApp)
   - **Website**: https://www.ramenhead.co.za
   - **Menu URL**: https://www.ramenhead.co.za/menu/
   - **Reservations**: https://www.dineplan.com/restaurants/ramenhead
   - **Category**: Ramen restaurant (primary) + Japanese restaurant (secondary)
   - **Attributes**: serves vegan, serves vegetarian, accepts credit cards, no cash, walk-ins welcome, family-friendly, dinner only, outdoor seating, live music
   - **Photos**: upload the same gallery shots from `/uploads/ramenhead/` (food, interior, exterior, team)
   - **Services**: list signature dishes
   - **Products / Menu**: ramen bowls, small plates, gyoza, sake
5. Reply to *every* review within 48 hours (Google rewards this)

### 6. Set the home page

`Settings → Reading → Your homepage displays → A static page → Homepage: Home → Save`

### 7. Submit `llms.txt` for AI discovery

Already served at `https://www.ramenhead.co.za/llms.txt` by the child theme. To accelerate discovery by AI crawlers, list the site on:
- https://llmstxt.org/ (community directory)
- https://directory.llmstxt.cloud (if available)

Add a tiny link in your site footer: `<a href="/llms.txt">llms.txt</a>` (optional, doesn't hurt).

### 8. Image SEO maintenance going forward

When uploading NEW photos via Media Library:
- Always set a descriptive **Alt text** including "Ramenhead" + what the photo shows (e.g. "Tonkotsu ramen bowl at Ramenhead Cape Town")
- Set the **Title** the same
- Pre-resize to ~1800px on the long edge before upload (don't upload 4000px straight from camera — slows the site)
- Save as WebP if possible, JPG otherwise

### 9. Internal linking pass (10 min)

Edit pages in Elementor and add contextual internal links:
- About page → link "menu" in the body to `/menu/`
- Menu page → link "drinks menu" footer note to `/drinks/`
- Media page → link "Ramenhead's bowls" copy back to `/menu/`
- Home/About → link "press coverage" back to `/media/`

WordPress's auto-generated `category-X` archive pages already cross-link the press posts. The Media page's category pills are also internal links.

### 10. Get listed on third-party sites with consistent NAP

NAP = Name, Address, Phone. Use **exactly the same wording** everywhere:

> Ramenhead, 37 Parliament Street, Cape Town, 8001, +27 67 312 8061

Sites to claim/update:
- **TripAdvisor** — Ramenhead listing exists (we found it in the press research). Claim it, set hours to Tue–Sat, update menu link
- **Eat Out** (eatout.co.za) — restaurant directory
- **Dineplan** — already listed (reservations engine)
- **Time Out Cape Town** — currently lists Ramenhead in their "best ramen" piece; reach out to update if needed
- **Restaurants.co.za**
- **Zomato** (still active in some regions)
- **Apple Maps** (apple.com/maps), **OpenStreetMap**

Consistent NAP across these sites is the #2 local-SEO ranking factor after Google Business Profile.

### 11. Reach back to publishers for backlinks

The press section now lists 19 publications that have covered Ramenhead. **Backlinks from those same publications** to your new media page would be a huge SEO boost.

A one-line follow-up email to each: *"Hi — Ramenhead's site has been refreshed and we're now featuring your piece on our press page at /media/ — happy to send any new imagery or updates if you'd like to refresh the article and add a link back."*

Target each of the 19 sources for a backlink to either `https://www.ramenhead.co.za/` or `https://www.ramenhead.co.za/media/`.

### 12. Generate fresh editorial

Now that you have a press section that's easy to maintain, give publications new things to write about:
- New seasonal bowl launches (each = a press release + a new Behind-the-Scenes post)
- Wine/sake pairings
- Chef's table events
- Live music Thursday line-ups (one post per featured artist)

Each = a new post under the right category → a new URL → more indexed pages.

### 13. Verify everything with these tools (run after launch)

| What | Where |
| ---- | ----- |
| Core Web Vitals | https://pagespeed.web.dev/?url=https://www.ramenhead.co.za |
| Restaurant + LocalBusiness schema | https://search.google.com/test/rich-results |
| Menu schema rich result | Same — test `/menu/` URL |
| FAQ schema rich result | Same — test `/` URL |
| Mobile-friendly | https://search.google.com/test/mobile-friendly |
| Open Graph card preview | https://www.opengraph.xyz/ |
| robots.txt | https://www.ramenhead.co.za/robots.txt — verify AI bots listed |
| llms.txt | https://www.ramenhead.co.za/llms.txt — verify content loads |
| Sitemap | https://www.ramenhead.co.za/sitemap_index.xml |
| SSL / HTTPS | https://www.ssllabs.com/ssltest/ |

### 14. Recurring (monthly)

- Check Google Search Console for crawl errors, indexed pages, top queries
- Reply to new Google reviews within 48h
- Publish at least 1 new press post or news item (keeps the site "fresh" in Google's eyes)
- Re-check Core Web Vitals after any major content changes

---

## TL;DR — minimum viable launch SEO

If you can only do four things before going live, do these:

1. **Apply the Yoast settings** (5 min — [yoast/yoast-setup.php](yoast/yoast-setup.php))
2. **Verify Google Search Console + submit sitemap** (10 min)
3. **Claim & fully fill in Google Business Profile** (30 min — *the big one*)
4. **Apply for backlinks from the 19 publications already in the press section** (rolling, do over a week)

Everything else compounds over the months that follow.
