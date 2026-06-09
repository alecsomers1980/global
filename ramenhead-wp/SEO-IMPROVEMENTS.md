# Ramenhead — SEO Audit Improvements

Mapping every recommendation from the Our Legacy audit (overall **B+**) to a concrete fix. Three buckets: ✅ done in code, 🛠 needs you to take action in WordPress/DNS/external accounts, 📊 currently optimal — leave as is.

---

## 🎯 Overall scorecard from the audit

| Category | Grade | Status |
| --- | --- | --- |
| On-Page SEO | A | Strong — small content + alt fix nudges to A+ |
| GEO (Generative Engine Optimization) | A+ | Already optimal. Ramenhead is **ranking #1 for "ramen bowls restaurant" with an AI Overview citation** — exactly what the schema + llms.txt were built for |
| Links | C+ | 256 backlinks / 110 referring domains — already strong (CN Traveler, Time Out, Robb Report, Infatuation, Times Live, World's 50 Best all link to you). Mostly an "outreach more" task |
| Usability | A | Strong — one small fix (clear-text email) |
| Performance | B− | Images uncompressed at 1.2 MB is the only real issue |

You're ranking **#1 for "ramenhead" (~1,642 monthly searches), #2 for "ramen cape town" and "ramen in cape town", #1 for "ramen bowls restaurant"**. Most of the audit recommendations are polish, not problems.

---

## ✅ Fixed in code (re-import WXR / re-upload theme to apply)

### 1. Title tag length (49 → 60 chars)

The audit flagged the home title at 49 chars; the sweet spot is 50–60.

Updated in [build_wxr.py](build_wxr.py):
- **Before:** `Ramenhead | Authentic Japanese Ramen in Cape Town` (49 chars)
- **After:** `Ramenhead | Authentic Japanese Ramen Restaurant Cape Town` (57 chars)

Apply by: re-importing the WXR, OR in `WP Admin → SEO → Settings → Site basics / Site representation`, OR `WP Admin → Pages → Home → Yoast panel → SEO title`.

### 2. Image alt attributes (1 of 5 missing)

The header logo had `alt="logo"`. Updated in [01-header.json](elementor-templates/01-header.json):
- Logo image alt: `Ramenhead — Authentic Japanese ramen in Cape Town`

Apply by: re-importing the header template, OR `Theme Builder → Ramenhead Header → Edit with Elementor → click logo → Image → Alt Text`.

### 3. Increase page text content (270 → ~530 words)

Home page had a beautiful gallery but only ~270 words of crawlable text. Search engines were calling this "thin content".

Added a visible **"Every noodle is made by hand"** section below the gallery in [03-home.json](elementor-templates/03-home.json):
- Red eyebrow: "Cape Town • Authentic Japanese Ramen"
- H2 + red accent divider
- 3 paragraphs (~265 words) covering the Yamato machine, the chefs / FYN Group connection, hours / happy hour / live music
- Two CTA buttons (round-corner brand style): "EXPLORE THE MENU" and "BOOK A TABLE"

Net effect: +1 H2, +~265 visible words, +2 internal links to Menu and the Dineplan booking flow.

### 4. Clear-text email addresses (Usability)

The `info@ramenhead.co.za` in the footer was a scraper magnet. Added an automatic filter in [functions.php](ramenhead-child/functions.php):

```php
add_filter( 'the_content', 'ramenhead_obfuscate_emails' );
add_filter( 'widget_text', 'ramenhead_obfuscate_emails' );
add_filter( 'elementor/widget/render_content', 'ramenhead_obfuscate_emails', 20 );
```

Uses WordPress's built-in `antispambot()` which encodes the email as HTML entities. Browsers and mail clients still resolve it normally; basic scrapers fail. No editorial change needed — the filter runs automatically on every rendered email address site-wide.

### 5. Google Analytics 4 scaffolding (On-Page SEO)

Added a one-line config switch in [functions.php](ramenhead-child/functions.php):

```php
define( 'RAMENHEAD_GA4_ID', 'G-XXXXXXXXXX' );  // ← replace with your real ID
```

The snippet is *off* by default (skips emission if the placeholder is still in place). Replace the placeholder with your real `G-` Measurement ID and gtag.js loads automatically site-wide with IP anonymisation. Get your ID at https://analytics.google.com → Admin → Data Streams → your stream → Measurement ID.

---

## 🛠 You need to do (outside the WordPress admin / external accounts)

### 6. Site load speed — images uncompressed (Performance, Medium priority)

> Audit shows 1.20 MB of images at **0% compression**. This is the single biggest performance lever.

**Install [Converter for Media](https://wordpress.org/plugins/webp-converter-for-media/) (free):**
1. Plugins → Add New → search "Converter for Media" → Install + Activate.
2. Tools → Converter for Media → "Bulk optimization" → click Start.
3. Plugin generates WebP versions of every image and serves them via `.htaccess` rewrite to compatible browsers (everything modern). Original `.jpg` URLs stay the same — zero code changes needed.

Expected result: 1.2 MB images → 300–500 KB, load time 14.7s → 5–7s.

### 7. Inline styles (Performance, Low)

Audit shows Elementor outputting inline styles. Mitigations:

`WP Admin → Elementor → Settings → Experiments`:
- **Improved CSS Loading** → Active
- **Optimized DOM Output** → Active
- **Inline Font Icons** → Active

Already documented in [PERFORMANCE.md](PERFORMANCE.md). Won't eliminate inline styles entirely (Elementor's architecture), but cuts them significantly.

### 8. DMARC mail record (Other, Low)

Audit flagged no DMARC record. Your SPF is fine (`v=spf1 include:spf.protection.outlook.com -all`), but DMARC strengthens deliverability and combats spoofing — important for the `info@ramenhead.co.za` outbound emails.

**Add this TXT record to your `ramenhead.co.za` DNS** (via your domain registrar — your nameservers point at Microsoft, so likely Microsoft 365 admin):

| Type | Host | Value |
| --- | --- | --- |
| TXT | `_dmarc.ramenhead.co.za` | `v=DMARC1; p=quarantine; rua=mailto:info@ramenhead.co.za; ruf=mailto:info@ramenhead.co.za; fo=1; adkim=r; aspf=r; pct=100` |

`p=quarantine` is the safe starting policy. After a month with no issues, tighten to `p=reject`. Verify at https://mxtoolbox.com/dmarc.aspx.

### 9. Social profiles missing — X / YouTube / LinkedIn (Other, Low — three rows)

Audit found Facebook + Instagram linked (good), but no X, YouTube or LinkedIn. For a restaurant, **LinkedIn is probably useful (B2B / press); YouTube is high-value if you have any short food clips; X is optional**.

When you create any of these, add the URLs in two places:

(a) **Yoast SEO** — `SEO → Settings → Site basics → Site representation → Other profiles`. Paste the URLs.

(b) **Restaurant schema `sameAs` array** — edit [ramenhead-child/inc/schema.php](ramenhead-child/inc/schema.php), find the `sameAs` array, add the URLs:

```php
'sameAs' => array(
    'https://www.instagram.com/ramenhead.za/',
    'https://www.facebook.com/ramenhead.za',
    'https://www.linkedin.com/company/ramenhead',  // add when ready
    'https://www.youtube.com/@ramenhead',          // add when ready
    'https://twitter.com/ramenhead',               // add when ready
),
```

Then re-zip the child theme. The schema picks them up automatically and Google links your business profile across platforms.

### 10. Facebook Pixel (Other, Low — only if you'll run Meta ads)

Skip unless you're planning paid Facebook/Instagram campaigns. If yes, easiest path: install **PixelYourSite** (free plugin) and paste the Pixel ID.

### 11. Google Analytics 4 — the actual activation

The PHP scaffolding is in place (item #5 above). To turn it on:

1. Sign in at https://analytics.google.com
2. Admin → **Create property** → Ramenhead → Cape Town → ZAR → Restaurant industry.
3. Set up a Web data stream → URL = `https://www.ramenhead.co.za` → Stream name = "Ramenhead website".
4. Copy the **Measurement ID** (looks like `G-ABC1234XYZ`).
5. Edit `wp-content/themes/ramenhead-child/functions.php` → find `RAMENHEAD_GA4_ID` → paste your ID in place of `G-XXXXXXXXXX`. Save.
6. Verify in GA4 → Reports → Realtime — load the site in another tab, you should see yourself.

Also link GA4 to **Google Search Console** in GA4 admin (one click) — gives you the keyword data the audit shows (3.9K organic / month) inside GA4 dashboards.

---

## 📊 Already optimal (no action — audit confirms)

These came out clean in the audit and don't need work:

- ✅ Meta description length (140 chars — perfect)
- ✅ Canonical tag
- ✅ Noindex / robots — not blocking anything
- ✅ SSL + HTTPS redirect
- ✅ HTTP/2
- ✅ Compression (gzip/brotli) on HTML/CSS/JS at 80%+
- ✅ Robots.txt + sitemap discoverable
- ✅ JSON-LD / Microdata schema (Restaurant identified, Local Business identified, FAQPage identified)
- ✅ Mobile viewport configured
- ✅ Favicon present
- ✅ No deprecated HTML, no Flash, no iFrames, no JS errors
- ✅ Friendly URLs
- ✅ H1 + H2/H3/H4/H5 hierarchy
- ✅ Keyword consistency across title + meta + headings
- ✅ Hreflang — declined to add (single-language site)
- ✅ AMP — declined (Elementor + custom design is incompatible; Google deprioritised AMP anyway)
- ✅ llms.txt at `/llms.txt`
- ✅ Google Business Profile claimed (4.4 stars / 490 reviews — keep replying within 48h)
- ✅ Facebook + Instagram linked in `sameAs` + as profile URLs
- ✅ Backlinks moderate (256 from 110 domains, Domain Strength 44, top backlinks include CN Traveler, Time Out, Robb Report, Theinfatuation, Times Live, World's 50 Best — all DR 88+)

---

## 🚀 Priority order

If you do these four in order, the audit score should move from B+ to A or A+:

1. **Re-import the WXR + re-upload the child theme zip** (5 min — fixes #1, #2, #3, #4, #5 above all at once)
2. **Install Converter for Media** + run bulk WebP conversion (10 min — fixes the Performance score)
3. **Set the GA4 Measurement ID** in functions.php (5 min once you've created the GA4 property)
4. **Add the DMARC DNS record** (5 min if you have DNS access)

Everything else (X / YouTube / LinkedIn / Facebook Pixel) is optional polish based on what you actually use.

---

## Re-run the audit after

Test from the same tool, or any of these for independent verification:

- https://pagespeed.web.dev/?url=https://www.ramenhead.co.za — Core Web Vitals
- https://search.google.com/test/rich-results — verifies Restaurant + FAQ + Menu schema
- https://www.opengraph.xyz/?url=https://www.ramenhead.co.za — Open Graph preview
- https://mxtoolbox.com/dmarc.aspx?domain=ramenhead.co.za — DMARC verification (after item #8)
- https://www.seoptimer.com/ramenhead.co.za — full audit re-run (same tool family as Our Legacy used)

Expected post-fix grades: On-Page **A+**, GEO **A+**, Links **C+** (won't move without external outreach), Usability **A+**, Performance **A** (after WebP).
