# Ramenhead — Performance & Discoverability Checklist

What's already handled by this package vs. what you still need to do on the live install.

---

## ✅ Built into the package

### Performance
- **Self-hosted Poppins** in [ramenhead-child/fonts/](ramenhead-child/fonts/) — 5 weights, latin subset only, ~40 KB total. No Google CDN round-trip.
- **Font preload** of the two most-used weights (400/600) via `<link rel="preload" as="font">` for fast LCP.
- **Elementor's Google Fonts request disabled** via the `elementor/frontend/print_google_fonts` filter — saves 150–250 ms render-block.
- **WordPress emoji scripts disabled** (saves ~14 KB JS on every page).
- **Gallery lazy-loading** — images 3+ have `loading="lazy"`, first 2 are eager.
- **Hello Elementor base** — one of the lightest WordPress themes (~6 KB CSS).

### SEO
- Per-page Yoast title, meta description, focus keyphrase, canonical, OG, Twitter card.
- `<html lang="en-ZA">` + GEO meta tags (`geo.region=ZA-WC`, `geo.placename`, `geo.position`, `ICBM`).
- Restaurant + LocalBusiness JSON-LD (every page) with both locations + GPS coordinates.
- Menu JSON-LD with every dish + ZAR price on `/menu/`.
- Hidden H1 + intro paragraph on the home page (the gallery is otherwise text-less).
- Image `alt` text on every gallery photo.

### AI search / Generative Engine Optimization
- **`/llms.txt` served at the site root** via the child theme's virtual route. Reads from [ramenhead-child/inc/llms.txt](ramenhead-child/inc/llms.txt) — edit that file to update.
- **AI-aware `robots.txt`** — explicitly allows GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, Applebot, Bytespider, CCBot and 11 others. Served as a virtual route via the `robots_txt` filter.
- **FAQ schema** on home, about and menu pages — 10 questions covering hours, location, reservations, vegan options, payment, prices, allergies, kids and ownership. Pulls into Google's "People also ask" and AI-generated answers.
- **BreadcrumbList schema** on non-home pages.
- **Speakable schema** on the home page — marks the hidden H1 + intro for voice assistants (Google Assistant, Siri).
- **Sitemap reference** in robots.txt — both `/sitemap_index.xml` (Yoast) and `/llms.txt` are flagged.

---

## ⚠️ Do this after the WordPress install

### 1. Images — biggest single perf win (~5 minutes)

The 17 gallery JPGs are 200–500 KB each. Convert to WebP and you'll halve LCP on the home page.

```
Plugin: Converter for Media   (free)
Install → Activate → Settings → "Convert all" → "Start the bulk conversion"
```

The plugin keeps the original .jpg URLs in your Elementor markup; it serves .webp transparently via `.htaccess` rewrites to compatible browsers and falls back to .jpg for old ones. Zero code changes needed.

### 2. Caching plugin — required for production

Pick one based on your host:

| Host type | Plugin | Setup |
| --------- | ------ | ----- |
| LiteSpeed (most cheap hosts in ZA) | **LiteSpeed Cache** (free) | Activate → Dashboard → enable "Cache" + "Page Optimization" presets → "Advanced" |
| Apache / Nginx | **WP Super Cache** (free) | Activate → Settings → Caching On → "Recommended" preset |
| Cloudflare in front | **Cloudflare APO** (paid, $5/mo) | Or: free Cloudflare + the "Cloudflare" WP plugin |

After enabling caching, retest at https://pagespeed.web.dev/. Target LCP < 2.5s, CLS < 0.1, INP < 200ms.

### 3. Elementor's own perf toggles

`WP Admin → Elementor → Settings → Experiments`:

| Experiment | Set to |
| ---------- | ------ |
| **Optimized DOM Output** | Active |
| **Inline Font Icons** | Active |
| **Improved CSS Loading** | Active |
| **Lazy Load Background Images** | Active |
| **Element Caching** | Active |

`Elementor → Settings → Features`:

- **Disable Default Lightbox**: ON (we use our own on the home page).
- **Google Fonts Load**: leave default — our child theme filter already overrides it.

### 4. Smush / image optimization for future uploads

`Converter for Media` (step 1) handles the existing JPGs. For images uploaded *after* launch (e.g. new dish photos), add **ShortPixel** (100 free credits/month) or **Smush** (free, unlimited compressions). Both auto-process on upload.

### 5. Disable jQuery Migrate (optional, ~6 KB saved)

Add to `functions.php` of the child theme — but only if nothing breaks. Test with each plugin:

```php
add_action( 'wp_default_scripts', function ( $scripts ) {
    if ( ! is_admin() && isset( $scripts->registered['jquery'] ) ) {
        $scripts->registered['jquery']->deps = array_diff(
            $scripts->registered['jquery']->deps,
            array( 'jquery-migrate' )
        );
    }
} );
```

### 6. CDN

If traffic warrants it, put **Cloudflare** in front (free tier is fine). Especially valuable for serving the gallery images from edge caches near Cape Town visitors.

---

## Verification checklist (after launch)

| Check | Where |
| ----- | ----- |
| **Core Web Vitals** | https://pagespeed.web.dev/?url=https://www.ramenhead.co.za |
| **Restaurant schema valid** | https://search.google.com/test/rich-results |
| **Menu schema rich result** | Same URL — paste `/menu/` |
| **FAQ schema rich result** | Same URL — paste home or about page |
| **OG card preview** | https://www.opengraph.xyz/ |
| **Twitter card preview** | https://cards-dev.twitter.com/validator |
| **robots.txt** | https://www.ramenhead.co.za/robots.txt — verify AI bots listed |
| **llms.txt** | https://www.ramenhead.co.za/llms.txt — verify content loads |
| **Sitemap** | https://www.ramenhead.co.za/sitemap_index.xml |
| **Mobile-friendly** | https://search.google.com/test/mobile-friendly |
| **HTTPS / certificate** | https://www.ssllabs.com/ssltest/ |
| **Search Console verified** | https://search.google.com/search-console |
| **Bing Webmaster verified** | https://www.bing.com/webmasters — submit sitemap |
| **Google Business Profile** | Both locations updated with new site URL |

---

## Expected scores (post-optimization)

With WebP conversion + caching + Elementor experiments enabled, on a decent host:

| Metric | Mobile | Desktop |
| ------ | ------ | ------- |
| Performance score | 85+ | 95+ |
| LCP | <2.5s | <1.5s |
| CLS | <0.05 | <0.05 |
| INP | <150ms | <100ms |
| TBT | <200ms | <50ms |

Without those three steps it'll be 50/65. Don't skip them.
