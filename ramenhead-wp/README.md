# Ramenhead — WordPress Import Package

A complete, opinionated import package that recreates `ramenhead.co.za` on a fresh WordPress install using **Hello Elementor** + **Elementor (free)** + **Yoast SEO (free)** + the **Header Footer Elementor** plugin.

---

## What's in this package

```
ramenhead-wp/
├── README.md                     ← This file
├── PERFORMANCE.md                ← Post-install perf + AI discoverability checklist
├── SEO-CHECKLIST.md              ← What's done / what's left for SEO (read after install)
├── yoast/
│   ├── yoast-settings.ini        ← Yoast import file: SEO → Tools → Import & Export
│   └── yoast-setup.php           ← PHP fallback that sets the same options via update_option()
├── ramenhead-import.xml          ← WXR file: 3 pages, header, footer, primary menu, all Yoast meta
├── ramenhead-child.zip           ← Hello Elementor child theme (install via Appearance → Themes)
├── ramenhead-child/              ← Unzipped source of the child theme
│   ├── style.css                 ← Theme header + self-hosted Poppins @font-face + brand CSS
│   ├── functions.php             ← Enqueue, font preload, Elementor Google-Fonts override, GEO meta
│   ├── theme.json                ← Block editor palette + font registration
│   ├── fonts/                    ← poppins-300/400/500/600/700.woff2 (latin subset, ~40 KB)
│   └── inc/
│       ├── schema.php            ← Restaurant + Menu + FAQ + Breadcrumb + Speakable JSON-LD
│       ├── shortcodes.php        ← [ramenhead_book_now], [ramenhead_hours], etc.
│       ├── ai-discovery.php      ← Virtual /robots.txt + /llms.txt routes
│       └── llms.txt              ← LLM-friendly site summary (edit to update)
├── elementor-templates/          ← Individual Elementor JSONs (fallback / re-import)
│   ├── 01-header.json
│   ├── 02-footer.json
│   ├── 03-home.json
│   ├── 04-menu.json
│   ├── 05-about.json
│   ├── 06-media.json             ← Media/press landing page (search + category pills + posts grid)
│   ├── 07-archive.json           ← Theme Builder: dark category-archive template
│   ├── 08-search.json            ← Theme Builder: dark search-results template
│   ├── 09-single-post.json       ← Theme Builder: single post (sticky featured-image hero)
│   └── 10-drinks.json            ← Drinks menu page (cocktails, sake, wine, beer)
├── public-root/                  ← Optional physical files for web root (override the virtual ones)
│   ├── robots.txt
│   └── llms.txt
├── snippets/
│   └── restaurant-schema.html    ← Standalone schema (only needed if not using child theme)
├── images/                       ← Upload these to /wp-content/uploads/ramenhead/
│   ├── logo.svg / logo.png
│   ├── RAMENHEAD-WS-PIC-01.jpg … 17.jpg
│   └── (drop your menu.pdf & menu_drinks.pdf here too)
└── build_wxr.py                  ← Regenerate ramenhead-import.xml after edits
```

---

## Required plugins (all free)

Install + activate before running the import:

| Plugin | Purpose |
| ------ | ------- |
| **Elementor** | Page builder |
| **Pro Elements** *(or Elementor Pro)* | Provides the **Gallery** widget with masonry + lightbox the home page uses. Without it the home gallery widget will render as a broken/missing widget |
| **Header Footer Elementor** (by Brainstorm Force) | Lets the free Elementor build a custom site-wide header/footer |
| **Yoast SEO** | The Yoast meta in the WXR will only apply if Yoast is installed before import |
| **Safe SVG** *(optional)* | If you want to upload the `.svg` logo |

Theme: **Hello Elementor**.

---

## Setup order (one-time, ~15 minutes)

### 1. Fresh WordPress install

Standard install, set the site title to **Ramenhead**, tagline *"Authentic Japanese ramen in Cape Town."*

Permalinks → set to **Post name** (`Settings → Permalinks → Post name`). The import expects pretty URLs (`/menu/`, `/about/`).

### 2. Install Hello Elementor + the Ramenhead child theme

1. `Appearance → Themes → Add New Theme` → search **Hello Elementor** → Install (don't activate yet).
2. `Appearance → Themes → Add New Theme → Upload Theme` → choose **`ramenhead-child.zip`** from this package → Install → **Activate**.

The child theme automatically:
- Emits **Restaurant + LocalBusiness JSON-LD** on every page (survives template deletions).
- Emits **Menu JSON-LD** on `/menu/` with every dish + ZAR price for rich-result eligibility.
- Emits **FAQ JSON-LD** on home / about / menu (10 questions covering hours, location, reservations, vegan options, payment, prices, allergies, kids, ownership).
- Emits **BreadcrumbList** + **Speakable** schema (Google Assistant / Siri).
- Self-hosts **Poppins** (woff2, latin subset, 5 weights, ~40 KB) and preloads weights 400/600 for fast LCP.
- Disables Elementor's separate Google Fonts request (saves ~150–250 ms render-block).
- Sets `<html lang="en-ZA">` and adds GEO meta tags (`geo.region=ZA-WC`, `geo.placename=Cape Town`, `geo.position`, `ICBM`).
- Applies brand colours (`#000`, `#ebe3d7`, `#EE3526`) as CSS variables + `theme.json` palette.
- Serves a virtual **`/robots.txt`** with AI-aware allow-list (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, Applebot, Bytespider, CCBot and 11 others).
- Serves a virtual **`/llms.txt`** at the site root — a structured site summary for LLM crawlers, reading from `inc/llms.txt` (edit that file to update).
- Disables WordPress emoji scripts.
- Registers `[ramenhead_book_now]`, `[ramenhead_hours]`, `[ramenhead_locations]`, `[ramenhead_contact]` shortcodes.
- Filters Yoast's schema to remove its duplicate `Organization` entity so search engines see a single canonical Restaurant graph.

See **[PERFORMANCE.md](PERFORMANCE.md)** for the rest of the post-install perf + AI discoverability checklist (WebP conversion, caching plugin, Elementor experiments).

Install the remaining plugins (Elementor, Header Footer Elementor, Yoast SEO, optionally Safe SVG).

### 3. Upload the image bundle

This is the **most important step** — the Elementor templates reference images at `/wp-content/uploads/ramenhead/…`, so put them at that exact path.

Two options:

**Option A — FTP/cPanel (recommended, preserves URLs):**
1. Connect to your host (FTP or cPanel File Manager).
2. Create `/wp-content/uploads/ramenhead/`.
3. Upload everything from this package's `images/` folder into that directory.
4. Also drop `menu.pdf` and `menu_drinks.pdf` (export them from the existing Next.js site at `ramenhead/public/downloads/`) into the same folder.

**Option B — Media Library (recommended for client editability):**
1. WP Admin → Media → Add New → upload all the images.
2. Then on the Home page → Edit with Elementor → click the Gallery widget → **Add Images** → multi-select all the images from the Media Library → Insert.
3. This gives each image a proper WordPress attachment ID, which lets clients drag-and-drop reorder, delete, and add photos through Elementor's UI later.

Option A gets the site looking right immediately (the gallery shows the photos via URL); Option B is the proper client-editable setup. **You can also do Option A first and then convert to Option B later** — just re-add the gallery images through Elementor once they're in the Media Library.

### 4. Set the site URL in the templates

The Elementor templates use the placeholder `[SITE_URL]` so they're portable. Before importing, **find-and-replace** that placeholder with the live domain.

From the `ramenhead-wp/` folder, run **one** of these:

PowerShell:

```powershell
$url = "https://www.ramenhead.co.za"   # ← change for staging if needed
Get-ChildItem -Path .\elementor-templates -Recurse -Filter *.json | ForEach-Object {
    (Get-Content $_.FullName -Raw).Replace("[SITE_URL]", $url) | Set-Content $_.FullName -Encoding UTF8
}
Get-ChildItem -Path . -Filter *.xml | ForEach-Object {
    (Get-Content $_.FullName -Raw).Replace("[SITE_URL]", $url) | Set-Content $_.FullName -Encoding UTF8
}
```

Bash:

```bash
URL="https://www.ramenhead.co.za"   # ← change for staging if needed
find elementor-templates -name '*.json' -print0 | xargs -0 sed -i "s|\[SITE_URL\]|$URL|g"
sed -i "s|\[SITE_URL\]|$URL|g" ramenhead-import.xml
```

If you ever change domain, run the replace again on a fresh copy.

> Alternatively use the **Better Search Replace** plugin in WP Admin after import.

### 5. Run the WordPress import

`WP Admin → Tools → Import → WordPress → Run Importer → Choose File → ramenhead-import.xml → Upload file and import`.

- Assign all content to your admin user (or the existing **Ramenhead** user).
- **Do NOT** tick "Download and import file attachments" (we placed them manually in step 3).

After import, you should have:
- **Pages**: Home, Menu, Drinks, About Us, Media
- **Posts**: 19 curated press articles across 7 categories (Press Features, Reviews, Interviews, Awards & Recognition, Events & Collaborations, Behind the Scenes, News)
- **Categories**: the 7 above (visible under Posts → Categories)
- **Templates → Theme Builder** (or **Appearance → Header Footer Builder** depending on HFE version): *Ramenhead Header* and *Ramenhead Footer*, both targeted at *Entire Website*
- **Appearance → Menus**: a menu called *Primary Navigation* with Home / Menu / About Us

### 6. Wire the menu into the header

1. **Appearance → Menus** → select *Primary Navigation* → tick **"Display location: Primary Menu"** (or whatever HFE's location is called for your version) → Save.
2. Open the *Ramenhead Header* template in Elementor → click the Nav Menu widget → confirm it's pointing at *Primary Navigation*.

### 6b. Media / Press page (Posts widget + featured images)

The **Media** page uses Elementor's **Posts** widget (Pro Elements) to list the 19 imported press articles in a grid, with a search box and category "pill" links.

- **Featured images** rely on `_thumbnail_id` pointing at the imported image attachments. For these to resolve, tick **"Download and import file attachments"** on the WordPress importer screen *for this import* — WP will fetch each image from `…/uploads/ramenhead/` and register it. The site/images must be reachable at the URL when you import. If they aren't yet, the posts still import fine (no thumbnail) and you can set featured images later per post.
- **Each post** is a curated link card: an SEO-optimised summary, source credit, and a "Read the full article →" button to the original publication. The dates are approximate — correct any under **Posts → Quick Edit**.
- **Search**: the page's search widget and WordPress's native search (`/?s=ramen`) both query these posts.
- **Category navigation**: the pills link to `/category/<slug>/` archives, which WordPress generates automatically.

### 6c. Dark archive + search templates (on-brand category & search pages)

By default the `/category/<slug>/` archive pages and search-results pages render in Hello Elementor's plain light layout. Two Elementor Theme Builder templates make them match the rest of the site. **These are imported through the Theme Builder UI (not the WXR), because Theme Builder display conditions are most reliable when set in the UI.**

**Archive template** ([07-archive.json](elementor-templates/07-archive.json)):
1. `WP Admin → Templates → Theme Builder → Add New → Archive`
2. In the Elementor editor, skip the library popup → folder icon (My Templates) → **Import Templates** → upload `07-archive.json` → Insert.
3. Click **Publish** → **Add Condition** → set to **Archives → Categories → All Categories** (or restrict to the 7 press categories) → Save & Close.

**Search Results template** ([08-search.json](elementor-templates/08-search.json)):
1. `Templates → Theme Builder → Add New → Search Results`
2. Import `08-search.json` → Insert.
3. **Publish** → **Add Condition** → **Search Results → All** → Save & Close.

Both use Elementor's dynamic **Archive Posts** widget (auto-renders the current category or search query) on a black background, with the same cream/red/Poppins styling as the Media grid. The Archive template's title is dynamic — it prints "Reviews", "Interviews", etc. automatically per category.

> These require **Pro Elements / Elementor Pro** (Theme Builder + `archive-posts` / `archive-title` widgets). They don't use the `[SITE_URL]` placeholder, so no find-and-replace is needed — import as-is.

### 7. Set the front page

`Settings → Reading → Your homepage displays → A static page → Homepage: Home`.

### 8. Yoast post-import settings

`SEO → Settings → Site basics`:

- **Site name**: Ramenhead
- **Tagline**: Authentic Japanese ramen in Cape Town
- **Default OG image**: upload `RAMENHEAD-WS-PIC-02.jpg`
- **Site representation**: Organization → **Ramenhead** → upload `logo.png` as the org logo

`SEO → Settings → Site features`:

- **XML sitemaps**: ON (verify at `/sitemap_index.xml`)
- **Schema – Organization**: ON

The free Yoast `LocalBusiness` block is **paid-only**. The **Ramenhead child theme** ([ramenhead-child/inc/schema.php](ramenhead-child/inc/schema.php)) emits a full **Restaurant + LocalBusiness JSON-LD schema** (both locations, GEO coordinates, hours, cuisine, price range, payment accepted) on every page automatically — and a **Menu schema** with every dish + price on `/menu/` — so you get correct local SEO markup and rich-result eligibility without paying for Yoast Local SEO.

The same schema is also baked into the Elementor footer template as a fallback, but the child theme is the canonical source. If you ever want to tweak hours or add Google Maps coordinates, edit `inc/schema.php` (one place, applies everywhere). The output is filterable: `add_filter( 'ramenhead_restaurant_schema', … )` lets a child plugin override any field without touching the theme.

> Validate at https://search.google.com/test/rich-results — paste the live URL after launch.

### 9. Submit to Google

1. `SEO → Tools → Google Search Console verification` → verify the new site.
2. Submit `https://www.ramenhead.co.za/sitemap_index.xml`.
3. Update your **Google Business Profile** (Speaker's Corner + Time Out Market) with the new site URL.

---

## SEO + GEO summary

Every page ships with:

- **Title tag** (Yoast `_yoast_wpseo_title`)
- **Meta description** (Yoast `_yoast_wpseo_metadesc`)
- **Focus keyphrase** (Yoast `_yoast_wpseo_focuskw`)
- **Canonical URL** (`_yoast_wpseo_canonical`)
- **Open Graph + Twitter Card** title/description/image
- **Restaurant + LocalBusiness JSON-LD** (in footer, so it appears on every page)
- **Hidden H1 + intro paragraph** on the home page (the image gallery would otherwise leave no crawlable text)
- **Image `alt` text** on every gallery photo

GEO targeting handled by:

- `addressCountry: ZA`, `addressRegion: Western Cape`, `addressLocality: Cape Town` in schema
- `geo.latitude/longitude` for both locations
- Two `department` entries for the Time Out Market location nested under the main Restaurant entity
- `language: en-ZA` in the WXR
- Plain-text mentions of *Cape Town*, *Speaker's Corner*, *Parliament Street*, *V&A Waterfront*, *Time Out Market*, *South Africa*, *Karoo* and *Cape Wagyu* across page copy

---

## Editing later

| Want to change… | Edit… |
| --------------- | ----- |
| Menu prices / dish names | `WP Admin → Pages → Menu → Edit with Elementor` → click any Price List widget → in the right panel, click an item → edit Title / Description / Price. Click "+ Add Item" to add dishes, drag the handle to reorder, trash icon to delete |
| About copy | `WP Admin → Pages → About Us → Edit with Elementor` |
| **Gallery photos** (recommended) | `WP Admin → Pages → Home → Edit with Elementor → click the Gallery widget → "Add Images" or click an image to remove/replace`. Drag to reorder. Requires images to be in the Media Library |
| Gallery photos (file-replace fallback) | Overwrite the file at `/wp-content/uploads/ramenhead/RAMENHEAD-WS-PIC-XX.jpg` keeping the same filename |
| Hours / location / contact | `Templates → Ramenhead Footer → Edit with Elementor` |
| Schema (open hours etc.) | Same footer template — bottom HTML widget |
| Nav links | `Appearance → Menus → Primary Navigation` |

---

## Troubleshooting

**Header/footer don't appear.** HFE may not be installed/activated, or its display rule wasn't imported. Open each template → *Display Settings* → set **Display On: Entire Website**.

**Menu widget in header is empty.** Edit the header in Elementor → click the Nav Menu widget → "Menu" dropdown → pick *Primary Navigation* → Update.

**Gallery images broken.** Either step 3 wasn't done, or `[SITE_URL]` placeholders were not replaced. Run *Better Search Replace* plugin: search `[SITE_URL]` → replace `https://www.ramenhead.co.za` → tick *Replace GUIDs* OFF, all tables ON, *Dry run* first.

**Yoast meta empty after import.** Yoast must be installed *and activated* **before** the WXR import. Reinstall Yoast, then re-run the importer (it'll skip existing posts but reapply meta).

**Re-importing.** Delete the three pages + the two header/footer templates first, otherwise the importer skips them.

**Want to tweak before importing?** Edit the JSON files in `elementor-templates/`, then run `python build_wxr.py` to regenerate the WXR.

---

## Optional: bypass the WXR and import templates individually

If the WXR import goes sideways for any reason, you can still get everything live:

1. Create three pages in WP Admin (Home, Menu, About Us). Set each to *Elementor Canvas* page template.
2. Edit each in Elementor → top bar **folder icon (My Templates) → Import Templates** → upload the matching JSON from `elementor-templates/`.
3. For header/footer: WP Admin → *Appearance → Header Footer Builder → Add New* → Type = Header (or Footer) → Display = Entire Website → Edit with Elementor → Import the matching JSON.

The page Yoast meta will need to be entered manually in that case (one screen per page in *Edit → Yoast SEO sidebar*).
