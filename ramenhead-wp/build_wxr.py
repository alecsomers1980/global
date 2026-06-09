"""Build the WordPress WXR import file for Ramenhead.

Reads the Elementor template JSON files, extracts the `content` arrays,
and embeds them as `_elementor_data` post meta inside a single .xml import.
Also adds Yoast SEO meta and a primary navigation menu.

Run:  python build_wxr.py
Output: ramenhead-import.xml
"""

from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).parent
TPL = ROOT / "elementor-templates"
OUT = ROOT / "ramenhead-import.xml"

SITE_URL = "https://www.ramenhead.co.za"  # change to your install URL before/after import
NOW = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
NOW_GMT = NOW
PUB_DATE = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")


def load_content(name: str) -> str:
    """Read template JSON and return its `content` array, JSON-stringified."""
    data = json.loads((TPL / name).read_text(encoding="utf-8"))
    return json.dumps(data["content"], ensure_ascii=False)


def cdata(text: str) -> str:
    """Wrap a string in CDATA, escaping any embedded ]]>."""
    return "<![CDATA[" + text.replace("]]>", "]]]]><![CDATA[>") + "]]>"


PAGES = [
    {
        "id": 101,
        "title": "Home",
        "slug": "home",
        "template": "03-home.json",
        "yoast_title": "Ramenhead | Authentic Japanese Ramen Restaurant Cape Town",
        "yoast_desc": (
            "Authentic Japanese ramen in Cape Town. Freshly made noodles and 48-hour "
            "broths at Speaker's Corner, 37 Parliament St. Book your slurp today."
        ),
        "yoast_focus": "ramen Cape Town",
        "yoast_og_image": f"{SITE_URL}/wp-content/uploads/ramenhead/RAMENHEAD-WS-PIC-02.jpg",
    },
    {
        "id": 102,
        "title": "Menu",
        "slug": "menu",
        "template": "04-menu.json",
        "yoast_title": "Menu | Ramenhead Cape Town — Tonkotsu, Tori Paitan, Wagyu Ramen",
        "yoast_desc": (
            "Explore the Ramenhead menu: 48-hour Tonkotsu, Tori Paitan, Karoo lamb "
            "tantanmen, Cape Wagyu MS9+ ramen, gyoza, sake and small plates."
        ),
        "yoast_focus": "ramen menu Cape Town",
        "yoast_og_image": f"{SITE_URL}/wp-content/uploads/ramenhead/RAMENHEAD-WS-PIC-04.jpg",
    },
    {
        "id": 103,
        "title": "About Us",
        "slug": "about",
        "template": "05-about.json",
        "yoast_title": "About Ramenhead | Japanese Ramen Restaurant in Cape Town",
        "yoast_desc": (
            "The story behind Ramenhead — noodles made in-house on the only Yamato "
            "machine in Africa, 48-hour broths, and Chef Julia du Toit. Cape Town."
        ),
        "yoast_focus": "about Ramenhead Cape Town",
        "yoast_og_image": f"{SITE_URL}/wp-content/uploads/ramenhead/RAMENHEAD-WS-PIC-07.jpg",
    },
    {
        "id": 105,
        "title": "Drinks",
        "slug": "drinks",
        "template": "10-drinks.json",
        "yoast_title": "Drinks | Ramenhead Cape Town — Cocktails, Sake, Wine & Beer",
        "yoast_desc": (
            "Ramenhead's drinks menu — Japanese-inspired cocktails, sake from masu "
            "cups, South African wines and beers from Japan. Cape Town."
        ),
        "yoast_focus": "Ramenhead drinks Cape Town",
        "yoast_og_image": f"{SITE_URL}/wp-content/uploads/ramenhead/RAMENHEAD-WS-PIC-08.jpg",
    },
    {
        "id": 104,
        "title": "Media",
        "slug": "media",
        "template": "06-media.json",
        "yoast_title": "Media & Press | Ramenhead Cape Town in the News",
        "yoast_desc": (
            "Ramenhead in the press — reviews, interviews, awards and news about "
            "Cape Town's home of authentic ramen. Read the full coverage."
        ),
        "yoast_focus": "Ramenhead press",
        "yoast_og_image": f"{SITE_URL}/wp-content/uploads/ramenhead/RAMENHEAD-WS-PIC-13.jpg",
    },
]

HF_TEMPLATES = [
    {
        "id": 201,
        "title": "Ramenhead Header",
        "slug": "ramenhead-header",
        "template": "01-header.json",
        "elementor_template_type": "header",
    },
    {
        "id": 202,
        "title": "Ramenhead Footer",
        "slug": "ramenhead-footer",
        "template": "02-footer.json",
        "elementor_template_type": "footer",
    },
]


def render_postmeta(key: str, value: str) -> str:
    return (
        "\t\t<wp:postmeta>\n"
        f"\t\t\t<wp:meta_key>{cdata(key)}</wp:meta_key>\n"
        f"\t\t\t<wp:meta_value>{cdata(value)}</wp:meta_value>\n"
        "\t\t</wp:postmeta>\n"
    )


def php_serialize(value) -> str:
    """Minimal PHP-serialize encoder. Supports str / bool / int / float / dict / list.

    Elementor expects some post meta (e.g. `_elementor_page_settings`,
    `ehf_target_include_locations`) as PHP-serialized arrays rather than
    JSON. PHP's unserialize() rejects JSON, which is what crashed
    `Page\\Manager::get_saved_settings()` on our first round of imports.
    """
    if isinstance(value, bool):
        return f'b:{1 if value else 0};'
    if isinstance(value, int):
        return f'i:{value};'
    if isinstance(value, float):
        return f'd:{value};'
    if isinstance(value, str):
        # PHP counts BYTES, not characters
        n = len(value.encode('utf-8'))
        return f's:{n}:"{value}";'
    if isinstance(value, dict):
        parts = [f'a:{len(value)}:{{']
        for k, v in value.items():
            parts.append(php_serialize(k))
            parts.append(php_serialize(v))
        parts.append('}')
        return ''.join(parts)
    if isinstance(value, list):
        parts = [f'a:{len(value)}:{{']
        for i, v in enumerate(value):
            parts.append(f'i:{i};')
            parts.append(php_serialize(v))
        parts.append('}')
        return ''.join(parts)
    raise TypeError(f'php_serialize: unsupported type {type(value)}')


def render_page(p: dict) -> str:
    el_content = load_content(p["template"])
    canonical = f"{SITE_URL}/" if p["slug"] == "home" else f"{SITE_URL}/{p['slug']}/"
    meta = [
        ("_elementor_edit_mode", "builder"),
        ("_elementor_template_type", "wp-page"),
        ("_elementor_version", "3.21.0"),
        ("_elementor_data", el_content),
        # Elementor expects this meta to be a PHP-serialized array (not JSON).
        # Storing it as JSON crashes Page\\Manager::get_saved_settings().
        ("_elementor_page_settings", php_serialize({
            "background_background": "classic",
            "background_color": "#000000",
            "hide_title": "yes",
        })),
        ("_wp_page_template", "elementor_canvas"),
        ("_yoast_wpseo_title", p["yoast_title"] + " %%sep%% %%sitename%%"),
        ("_yoast_wpseo_metadesc", p["yoast_desc"]),
        ("_yoast_wpseo_focuskw", p["yoast_focus"]),
        ("_yoast_wpseo_canonical", canonical),
        ("_yoast_wpseo_opengraph-title", p["yoast_title"]),
        ("_yoast_wpseo_opengraph-description", p["yoast_desc"]),
        ("_yoast_wpseo_opengraph-image", p["yoast_og_image"]),
        ("_yoast_wpseo_twitter-title", p["yoast_title"]),
        ("_yoast_wpseo_twitter-description", p["yoast_desc"]),
        ("_yoast_wpseo_twitter-image", p["yoast_og_image"]),
        ("_yoast_wpseo_meta-robots-noindex", "0"),
        ("_yoast_wpseo_meta-robots-nofollow", "0"),
    ]
    metas = "".join(render_postmeta(k, v) for k, v in meta)
    return (
        "\t<item>\n"
        f"\t\t<title>{escape(p['title'])}</title>\n"
        f"\t\t<link>{SITE_URL}/{'' if p['slug']=='home' else p['slug'] + '/'}</link>\n"
        f"\t\t<pubDate>{PUB_DATE}</pubDate>\n"
        "\t\t<dc:creator><![CDATA[admin]]></dc:creator>\n"
        f"\t\t<guid isPermaLink=\"false\">{SITE_URL}/?page_id={p['id']}</guid>\n"
        "\t\t<description></description>\n"
        f"\t\t<content:encoded>{cdata('')}</content:encoded>\n"
        f"\t\t<excerpt:encoded>{cdata('')}</excerpt:encoded>\n"
        f"\t\t<wp:post_id>{p['id']}</wp:post_id>\n"
        f"\t\t<wp:post_date><![CDATA[{NOW}]]></wp:post_date>\n"
        f"\t\t<wp:post_date_gmt><![CDATA[{NOW_GMT}]]></wp:post_date_gmt>\n"
        f"\t\t<wp:comment_status><![CDATA[closed]]></wp:comment_status>\n"
        f"\t\t<wp:ping_status><![CDATA[closed]]></wp:ping_status>\n"
        f"\t\t<wp:post_name><![CDATA[{p['slug']}]]></wp:post_name>\n"
        "\t\t<wp:status><![CDATA[publish]]></wp:status>\n"
        "\t\t<wp:post_parent>0</wp:post_parent>\n"
        "\t\t<wp:menu_order>0</wp:menu_order>\n"
        "\t\t<wp:post_type><![CDATA[page]]></wp:post_type>\n"
        "\t\t<wp:post_password><![CDATA[]]></wp:post_password>\n"
        "\t\t<wp:is_sticky>0</wp:is_sticky>\n"
        f"{metas}"
        "\t</item>\n"
    )


def render_hf_template(t: dict) -> str:
    el_content = load_content(t["template"])
    meta = [
        ("_elementor_edit_mode", "builder"),
        ("_elementor_template_type", t["elementor_template_type"]),
        ("_elementor_version", "3.21.0"),
        ("_elementor_data", el_content),
        # Header Footer Elementor (HFE) plugin meta — display on entire site
        ("ehf_target_include_locations", 'a:1:{i:0;s:8:"entire";}'),
    ]
    metas = "".join(render_postmeta(k, v) for k, v in meta)
    return (
        "\t<item>\n"
        f"\t\t<title>{escape(t['title'])}</title>\n"
        f"\t\t<link>{SITE_URL}/elementor-hf/{t['slug']}/</link>\n"
        f"\t\t<pubDate>{PUB_DATE}</pubDate>\n"
        "\t\t<dc:creator><![CDATA[admin]]></dc:creator>\n"
        f"\t\t<guid isPermaLink=\"false\">{SITE_URL}/?post_type=elementor-hf&amp;p={t['id']}</guid>\n"
        "\t\t<description></description>\n"
        f"\t\t<content:encoded>{cdata('')}</content:encoded>\n"
        f"\t\t<excerpt:encoded>{cdata('')}</excerpt:encoded>\n"
        f"\t\t<wp:post_id>{t['id']}</wp:post_id>\n"
        f"\t\t<wp:post_date><![CDATA[{NOW}]]></wp:post_date>\n"
        f"\t\t<wp:post_date_gmt><![CDATA[{NOW_GMT}]]></wp:post_date_gmt>\n"
        f"\t\t<wp:comment_status><![CDATA[closed]]></wp:comment_status>\n"
        f"\t\t<wp:ping_status><![CDATA[closed]]></wp:ping_status>\n"
        f"\t\t<wp:post_name><![CDATA[{t['slug']}]]></wp:post_name>\n"
        "\t\t<wp:status><![CDATA[publish]]></wp:status>\n"
        "\t\t<wp:post_parent>0</wp:post_parent>\n"
        "\t\t<wp:menu_order>0</wp:menu_order>\n"
        "\t\t<wp:post_type><![CDATA[elementor-hf]]></wp:post_type>\n"
        "\t\t<wp:post_password><![CDATA[]]></wp:post_password>\n"
        "\t\t<wp:is_sticky>0</wp:is_sticky>\n"
        f"\t\t<category domain=\"elementor_library_type\" nicename=\"{t['elementor_template_type']}\"><![CDATA[{t['elementor_template_type']}]]></category>\n"
        f"{metas}"
        "\t</item>\n"
    )


def render_nav_menu_term() -> str:
    return (
        "\t<wp:term>\n"
        "\t\t<wp:term_id>301</wp:term_id>\n"
        "\t\t<wp:term_taxonomy><![CDATA[nav_menu]]></wp:term_taxonomy>\n"
        "\t\t<wp:term_slug><![CDATA[primary-nav]]></wp:term_slug>\n"
        "\t\t<wp:term_name><![CDATA[Primary Navigation]]></wp:term_name>\n"
        "\t</wp:term>\n"
    )


def render_nav_item(item_id: int, title: str, slug: str, page_id: int, order: int) -> str:
    is_home = slug == "home"
    url = f"{SITE_URL}/" if is_home else f"{SITE_URL}/{slug}/"
    meta = [
        ("_menu_item_type", "post_type"),
        ("_menu_item_menu_item_parent", "0"),
        ("_menu_item_object_id", str(page_id)),
        ("_menu_item_object", "page"),
        ("_menu_item_target", ""),
        ("_menu_item_classes", 'a:1:{i:0;s:0:"";}'),
        ("_menu_item_xfn", ""),
        ("_menu_item_url", ""),
    ]
    metas = "".join(render_postmeta(k, v) for k, v in meta)
    return (
        "\t<item>\n"
        f"\t\t<title>{escape(title)}</title>\n"
        f"\t\t<link>{url}</link>\n"
        f"\t\t<pubDate>{PUB_DATE}</pubDate>\n"
        "\t\t<dc:creator><![CDATA[admin]]></dc:creator>\n"
        f"\t\t<guid isPermaLink=\"false\">{SITE_URL}/?p={item_id}</guid>\n"
        "\t\t<description></description>\n"
        f"\t\t<content:encoded>{cdata('')}</content:encoded>\n"
        f"\t\t<excerpt:encoded>{cdata('')}</excerpt:encoded>\n"
        f"\t\t<wp:post_id>{item_id}</wp:post_id>\n"
        f"\t\t<wp:post_date><![CDATA[{NOW}]]></wp:post_date>\n"
        f"\t\t<wp:post_date_gmt><![CDATA[{NOW_GMT}]]></wp:post_date_gmt>\n"
        f"\t\t<wp:comment_status><![CDATA[closed]]></wp:comment_status>\n"
        f"\t\t<wp:ping_status><![CDATA[closed]]></wp:ping_status>\n"
        f"\t\t<wp:post_name><![CDATA[nav-{slug}]]></wp:post_name>\n"
        "\t\t<wp:status><![CDATA[publish]]></wp:status>\n"
        "\t\t<wp:post_parent>0</wp:post_parent>\n"
        f"\t\t<wp:menu_order>{order}</wp:menu_order>\n"
        "\t\t<wp:post_type><![CDATA[nav_menu_item]]></wp:post_type>\n"
        "\t\t<wp:post_password><![CDATA[]]></wp:post_password>\n"
        "\t\t<wp:is_sticky>0</wp:is_sticky>\n"
        "\t\t<category domain=\"nav_menu\" nicename=\"primary-nav\"><![CDATA[Primary Navigation]]></category>\n"
        f"{metas}"
        "\t</item>\n"
    )


# ---------------------------------------------------------------------------
# Media / Press: categories + curated article posts + featured-image attachments
# ---------------------------------------------------------------------------

CATEGORIES = [
    {"id": 511, "slug": "press-features", "name": "Press Features",
     "desc": "Feature coverage of Ramenhead in South African and international media."},
    {"id": 512, "slug": "reviews", "name": "Reviews",
     "desc": "Restaurant reviews and first-taste verdicts on Ramenhead's ramen."},
    {"id": 513, "slug": "interviews", "name": "Interviews",
     "desc": "Interviews with the Ramenhead team and chef Peter Tempelhoff."},
    {"id": 514, "slug": "awards-recognition", "name": "Awards & Recognition",
     "desc": "Awards, best-of lists and recognition earned by Ramenhead."},
    {"id": 515, "slug": "events-collaborations", "name": "Events & Collaborations",
     "desc": "Ramenhead events, specials and collaborations."},
    {"id": 516, "slug": "behind-the-scenes", "name": "Behind the Scenes",
     "desc": "The story, people and craft behind Ramenhead."},
    {"id": 517, "slug": "news", "name": "News",
     "desc": "The latest Ramenhead news and announcements."},
]

# Each post: a curated press card. `summary` is original SEO copy; the post links
# out to the original article. `image` is reused as the featured image (declared
# as an attachment further below). Dates are approximate — verify in WP admin.
POSTS = [
    # ---- PRESS FEATURES ----
    {"id": 601, "cat": "press-features", "date": "2022-11-15", "image": "RAMENHEAD-WS-PIC-02.jpg",
     "source": "Eat Out", "url": "https://www.eatout.co.za/article/fyn-team-open-casual-fast-paced-fun-ramen-house-cape-town/",
     "title": "Eat Out: FYN's Team to Open a Casual Ramen House in Cape Town",
     "summary": "South Africa's leading restaurant publication, Eat Out, was first to break the story that the team behind award-winning FYN — chefs Peter Tempelhoff and Ashley Moss — were preparing to launch Ramenhead, a casual, fast-paced ramen house in the heart of Cape Town. The feature introduced what would become Cape Town's home of authentic Japanese ramen: silky, freshly-made noodles, slow-simmered broths and izakaya-style small plates served in a buzzing, walk-in-friendly setting at Speaker's Corner.\n\nThe Eat Out piece set expectations early. Ramenhead would carry the same uncompromising kitchen standards as its acclaimed sibling FYN — celebrated among The World's 50 Best Restaurants — but in a relaxed, after-work format. Readers got a first look at a noodle bar built around real Japanese technique, plated with the precision of a fine-dining team. For Cape Town's food scene, the announcement signalled the arrival of a serious new ramen destination rather than just another casual opening."},
    {"id": 602, "cat": "press-features", "date": "2022-12-01", "image": "RAMENHEAD-WS-PIC-03.jpg",
     "source": "Getaway", "url": "https://www.getaway.co.za/food/eating-out/ramenhead-the-launch-of-cape-towns-new-japanese-inspired-restaurant/",
     "title": "Getaway: The Launch of Cape Town's New Japanese-Inspired Restaurant",
     "summary": "Travel and lifestyle magazine Getaway covered the launch of Ramenhead, spotlighting Cape Town's newest destination for authentic Japanese ramen. The article framed the opening as one of the most-anticipated additions to the city's dining scene, walking visitors through what to expect: hand-made noodles produced on-site, deeply savoury tonkotsu and chicken broths simmered for many hours, and a menu of Japanese street food and small plates designed to be shared before the main bowl.\n\nGetaway positioned Ramenhead as a must-visit for both locals and travellers hunting the best ramen in the Mother City. The piece highlighted the restaurant's relationship to the FYN group, the lively buzz at Speaker's Corner, and the focus on craft — particularly the noodle-making and broth programmes that would set Ramenhead apart from anything else in Cape Town. It made the case for adding Ramenhead to any Cape Town itinerary, ramen-curious or otherwise."},
    {"id": 603, "cat": "press-features", "date": "2022-12-05", "image": "RAMENHEAD-WS-PIC-05.jpg",
     "source": "Crush Magazine", "url": "https://crushmag-online.com/peter-tempelhoff-team-launch-ramenhead/",
     "title": "Crush Magazine: Peter Tempelhoff & Team Launch Ramenhead",
     "summary": "Food and drink title Crush Magazine profiled the launch of Ramenhead, the casual ramen concept from the FYN restaurant group. The editorial team explored how chefs Peter Tempelhoff and Ashley Moss were translating their fine-dining pedigree into a relaxed, bowl-driven menu where freshly-made noodles, layered broths and a sake-led bar sit at the heart of the experience.\n\nThe Crush feature unpacked the thinking behind Ramenhead — a restaurant designed to celebrate the craft of real Japanese ramen rather than fusion or compromise. From the long-simmered tonkotsu to the chicken paitan and the soupless abura soba, every dish would be built around technique. The piece also touched on Ramenhead's Japanese small plates, including okonomiyaki fries and chicken karaage, and the carefully-curated cocktail and sake programme — calling out Ramenhead as one of Cape Town's most exciting new openings."},
    # ---- REVIEWS ----
    {"id": 604, "cat": "reviews", "date": "2022-12-09", "image": "RAMENHEAD-WS-PIC-04.jpg",
     "source": "Daily Maverick", "url": "https://www.dailymaverick.co.za/article/2022-12-09-ramenhead-petes-burgeoning-empire-takes-a-new-turn/",
     "title": "Daily Maverick: Ramenhead — Pete's Burgeoning Empire Takes a New Turn",
     "summary": "In this Daily Maverick review, the publication's food desk explored Ramenhead as the next chapter in chef Peter Tempelhoff's expanding Cape Town restaurant group. The piece praised the authenticity of the ramen, the quality of the house-made noodles and the energy of the room, framing Ramenhead as a serious, craft-driven addition to the city's dining scene rather than a casual side project from the FYN team.\n\nThe review walked readers bowl by bowl through Ramenhead's menu: the rich tonkotsu, the soupless abura soba, the deep chicken paitan and the wagyu-driven specials. Daily Maverick singled out the noodles — silky, springy and unmistakably fresh — as the dish that anchored the restaurant's identity. The verdict positioned Ramenhead as essential reading for Cape Town's ramen-curious diners, and a clear signal that authentic Japanese ramen had finally arrived in the city in earnest."},
    {"id": 605, "cat": "reviews", "date": "2022-12-08", "image": "RAMENHEAD-WS-PIC-06.jpg",
     "source": "Wanted Online", "url": "https://www.wantedonline.co.za/food-and-drink/2022-12-08-first-taste-ramenhead/",
     "title": "Wanted Online: First Taste of Ramenhead",
     "summary": "Wanted Online's 'First Taste' review gave an early verdict on Ramenhead, capturing the buzz around Cape Town's new ramen specialist. The reviewer highlighted the silky, freshly-made noodles, the depth of the slow-simmered broths and the convivial counter seating where guests could watch the kitchen at work — concluding that Ramenhead was already delivering genuine Japanese flavour with FYN-level attention to detail.\n\nThe piece for Wanted's discerning audience went into the texture of the noodles, the balance of the tonkotsu and chicken broths, and the cohesion of the small plates designed to precede the main bowl. It set the tone for the press response that would follow — that this was not a casual rebrand of an existing concept, but a serious Japanese-style ramen-ya brought to South Africa by chefs who understood the craft. For ramen lovers in Cape Town, Wanted made it clear: Ramenhead was the new benchmark."},
    {"id": 606, "cat": "reviews", "date": "2024-06-01", "image": "RAMENHEAD-WS-PIC-07.jpg",
     "source": "Food & Home", "url": "https://www.foodandhome.co.za/features/ramen-sake-and-that-moving-plate-of-fries-ramenhead-proves-why-its-still-cape-towns-top-ramen-spot",
     "title": "Food & Home: Ramenhead Proves Why It's Still Cape Town's Top Ramen Spot",
     "summary": "Food & Home Magazine revisited Ramenhead in 2024 and reaffirmed its standing as Cape Town's leading ramen destination. The feature celebrated the restaurant's signature bowls, the theatrical moving plate of fries, the sake and cocktail programme, and the consistently high quality of the noodles and broth — making the case that Ramenhead had held its crown well beyond the initial launch hype.\n\nThe piece dug into why Ramenhead remained the best ramen spot in Cape Town years after opening: the obsession with house-made noodles, the depth of the long-cooked broths, the rotation of seasonal specials and the way the bar pulls the whole experience together. Food & Home positioned Ramenhead as a restaurant that had matured into a Cape Town institution — not just a destination for ramen lovers, but for anyone who values craft, atmosphere and a kitchen that refuses to coast on its early reputation."},
    {"id": 607, "cat": "reviews", "date": "2023-03-01", "image": "RAMENHEAD-WS-PIC-08.jpg",
     "source": "Inside Guide", "url": "https://insideguide.co.za/cape-town/restaurants/ramenhead/",
     "title": "Inside Guide: Ramenhead — A Japanese Ramen Restaurant in Cape Town",
     "summary": "Cape Town city guide Inside Guide profiled Ramenhead in depth, detailing its dark, moody Japanese-inspired interior, open kitchen and counter seating where chefs assemble each bowl and make the noodles from scratch. The review guided readers through the menu of tonkotsu, chicken and vegetarian ramen, gyoza and small plates, recommending Ramenhead as one of the best authentic ramen experiences in the city.\n\nThe Inside Guide team paid special attention to the craft on display: the freshly-made noodles produced in-house every day, the broths simmered through the night, and the way the open pass turns the dining room into a kind of theatre. The review also covered Ramenhead's drinks programme — sake served from traditional masu cups, Japanese-leaning cocktails and a tight beer list — and its happy-hour offer. The recommendation was unequivocal: Ramenhead delivers the city's most authentic bowl of ramen."},
    # ---- INTERVIEWS ----
    {"id": 608, "cat": "interviews", "date": "2022-12-10", "image": "RAMENHEAD-WS-PIC-09.jpg",
     "source": "Restaurant & Bar", "url": "https://rbmag.co.za/ramenhead-tempelhoff-moss-and-huge-give-the-low-down-on-their-latest-venture/",
     "title": "Restaurant & Bar Mag: Tempelhoff, Moss & Hugé on Ramenhead",
     "summary": "In this Restaurant & Bar interview, Ramenhead's founding team — Peter Tempelhoff, Ashley Moss and Jennifer Hugé — gave the inside story on their new venture. The conversation covered the inspiration behind the concept, the obsession with authentic noodle-making and broth technique, and their ambition to bring a genuine Japanese ramen-shop experience to Cape Town in a fun, accessible format.\n\nThe interview offered rare insight into how a fine-dining team approaches a casual restaurant: every detail, from the noodle hydration to the broth simmer times, was treated with the same rigour as a tasting-menu plate. Tempelhoff, Moss and Hugé spoke about studying ramen in Japan, sourcing ingredients carefully, and building a small-plates menu that pays tribute to Japanese street food. For anyone curious about the craft behind Ramenhead's bowls, the Restaurant & Bar interview is essential reading."},
    {"id": 609, "cat": "interviews", "date": "2022-12-15", "image": "RAMENHEAD-WS-PIC-10.jpg",
     "source": "The Citizen", "url": "https://www.citizen.co.za/lifestyle/food-and-drink/ramenhead-restaurant-cape-town-interview/",
     "title": "The Citizen: Cape Town Lining Up for FYN's 'Cool Little Brother'",
     "summary": "The Citizen sat down with the Ramenhead team to unpack why Capetonians were already queuing for the city's newest ramen house. The interview explored Ramenhead's relationship to its acclaimed sibling FYN, the decision to go casual and walk-in friendly, and the craft behind the freshly-made noodles and slow-cooked broths that define every bowl.\n\nThe piece dug into the philosophy of Ramenhead as the 'cool little brother' to FYN: same kitchen DNA, very different room. Tempelhoff and team spoke about the importance of authentic technique — milling noodles to the right thickness for each broth, balancing fat and salt across the bowl, treating the small plates with as much care as the main event. The article gave Citizen readers a clear picture of what makes Ramenhead a serious contender for Cape Town's best ramen, and why it was already drawing crowds in its opening weeks."},
    {"id": 610, "cat": "interviews", "date": "2023-05-01", "image": "RAMENHEAD-WS-PIC-11.jpg",
     "source": "New Worlder", "url": "https://newworlder.substack.com/p/episode-118-peter-tempelhoff",
     "title": "New Worlder Podcast: Peter Tempelhoff (Episode 118)",
     "summary": "On the New Worlder podcast, chef Peter Tempelhoff joined writer Nicholas Gill for a wide-ranging conversation on South African fine dining, the global rise of FYN and the thinking behind Ramenhead. The episode is a long-form, behind-the-mic look at Tempelhoff's culinary philosophy and how an authentic ramen concept fits into one of Africa's most celebrated restaurant groups.\n\nOver the course of the conversation, Tempelhoff traces his path from kitchen apprenticeships to running an internationally acclaimed restaurant, and explains why Ramenhead matters as much to him as the fine-dining work. He talks about the importance of doing ramen properly — the noodle craft, the broth time, the discipline of a Japanese kitchen — and how the FYN group thinks about creativity, hospitality and feeding the city. Listeners come away with a deeper understanding of the Cape Town restaurant scene Ramenhead is part of."},
    {"id": 611, "cat": "interviews", "date": "2025-12-15", "image": "RAMENHEAD-WS-PIC-12.jpg",
     "source": "EWN", "url": "https://www.ewn.co.za/2025/12/15/how-peter-tempelhoff-turned-passion-into-a-globally-recognised-culinary-business",
     "title": "EWN: How Peter Tempelhoff Built a Globally Recognised Culinary Business",
     "summary": "Eyewitness News profiled chef Peter Tempelhoff's journey from passionate cook to the head of a globally recognised culinary business spanning FYN, Ramenhead and beyond. The feature traced the milestones behind his international acclaim and positioned Ramenhead as a key part of a restaurant group that has put Cape Town firmly on the world dining map.\n\nThe EWN piece detailed Tempelhoff's recognition by The World's 50 Best Restaurants and the Best Chef Awards, and explored how that fine-dining success is funding investment in concepts like Ramenhead — restaurants designed to broaden access to seriously crafted food. It framed Ramenhead as evidence that authentic Japanese ramen, made with the only Yamato noodle machine in Africa, has become a destination for both locals and visiting industry. For South Africans following the country's most exciting culinary stories, the feature offered a clear view of the bigger picture behind every bowl."},
    # ---- AWARDS & RECOGNITION ----
    {"id": 612, "cat": "awards-recognition", "date": "2024-01-15", "image": "RAMENHEAD-WS-PIC-13.jpg",
     "source": "Time Out", "url": "https://www.timeout.com/cape-town/restaurants/the-best-spots-for-ramen-in-cape-town",
     "title": "Time Out: The Best Spots for Ramen in Cape Town",
     "summary": "Time Out named Ramenhead among the very best places to eat ramen in Cape Town. The roundup recognised the restaurant's commitment to freshly-made noodles, authentic broths and an atmospheric, Japan-inspired setting — cementing Ramenhead's reputation as a standout in the city's increasingly competitive ramen scene.\n\nFor Time Out's audience of in-the-know city diners and travellers, the inclusion is a meaningful endorsement: the publication's restaurant lists are tightly curated and Cape Town has no shortage of bowls on offer. The piece called out Ramenhead's house-made noodles, its dedication to traditional ramen styles and its lively after-work atmosphere as the reasons it sits at the top. The recognition has helped establish Ramenhead as the default answer to 'where's the best ramen in Cape Town?' across both local and international guides."},
    {"id": 613, "cat": "awards-recognition", "date": "2024-02-01", "image": "RAMENHEAD-WS-PIC-14.jpg",
     "source": "Inside Guide", "url": "https://insideguide.co.za/cape-town/ramen/",
     "title": "Inside Guide: The 10 Best Ramen Restaurants in Cape Town",
     "summary": "Ramenhead earned a place on Inside Guide's list of the 10 Best Ramen Restaurants in Cape Town. The guide highlighted Ramenhead's house-made noodles, deeply flavoured broths and signature bowls as the reasons it consistently ranks among the top ramen destinations in the city — a position it has held since opening.\n\nInside Guide's roundup paid particular attention to the technical craft behind each bowl: the freshly-milled noodles produced on-site, the long-simmered tonkotsu broth, the spicy Karoo lamb tantanmen, the rich tori paitan and the wagyu specials. It also noted Ramenhead's complete experience — the Japanese small plates, the curated sake list and the room itself — as factors that elevate it above more casual ramen spots. For diners building a ramen tour of Cape Town, Ramenhead remains the essential stop."},
    # ---- EVENTS & COLLABORATIONS ----
    {"id": 614, "cat": "events-collaborations", "date": "2023-08-01", "image": "RAMENHEAD-WS-PIC-15.jpg",
     "source": "Inside Guide", "url": "https://insideguide.co.za/cape-town/specials/ramenhead/",
     "title": "Ramenhead: A Three-Bowl Ramen Tasting Tour",
     "summary": "Inside Guide spotlighted a special Ramenhead experience — a three-bowl ramen tasting tour offering guests a guided journey through the restaurant's signature broths and noodle styles. The feature showcased how Ramenhead turns a casual meal into an event, perfect for ramen lovers wanting to explore the full range of flavours in a single sitting.\n\nThe tasting concept lets diners try smaller versions of three different bowls — typically across tonkotsu, chicken paitan and a soupless or specialty option — so they can compare broths, noodle styles and toppings side by side. Inside Guide framed it as both an introduction for newcomers and a deeper dive for seasoned ramen fans. The piece positioned Ramenhead as a restaurant that doesn't just feed you a bowl, but invites you into the craft behind it — a hallmark of how the kitchen thinks about hospitality."},
    {"id": 615, "cat": "events-collaborations", "date": "2024-09-01", "image": "RAMENHEAD-WS-PIC-16.jpg",
     "source": "Restaurant Week", "url": "https://restaurantweek.co.za/en/restaurants/1395-ramenhead-cape-town",
     "title": "Ramenhead Joins Cape Town Restaurant Week",
     "summary": "Ramenhead featured as part of Cape Town Restaurant Week, the celebrated dining event that brings the city's best restaurants to a wider audience with specially curated menus. The listing invited food lovers to experience Ramenhead's authentic Japanese ramen, freshly-made noodles and Japanese small plates as part of one of South Africa's most anticipated culinary calendars.\n\nRestaurant Week is a high-visibility moment for Cape Town's dining scene, and Ramenhead's participation signals where the city's serious ramen credentials sit. The curated Restaurant Week menu was designed to highlight the restaurant's signatures — the long-simmered tonkotsu, the gyoza, the small plates — at a guest-friendly format that makes the full Ramenhead experience accessible to a new audience. For ramen lovers and event-driven diners alike, it was one of the most-booked listings of the season."},
    # ---- BEHIND THE SCENES ----
    {"id": 616, "cat": "behind-the-scenes", "date": "2022-11-20", "image": "RAMENHEAD-WS-PIC-17.jpg",
     "source": "Your Luxury Africa", "url": "https://yourluxury.africa/lifestyle/chef-peter-tempelhoffs-new-venture-turns-heads/",
     "title": "Your Luxury Africa: Chef Peter Tempelhoff's New Venture Turns Heads",
     "summary": "Your Luxury Africa took readers behind the scenes of Ramenhead before opening, exploring chef Peter Tempelhoff's vision for an authentic yet accessible ramen house in Cape Town. The feature revealed the thinking behind the concept, the design of the space and the craft of noodle-making that would set Ramenhead apart in the city's dining landscape.\n\nThe piece detailed how Ramenhead was being built around real Japanese technique — from the noodle dough hydration to the long broth simmer times — and how the team approached the room's design: dark, moody, with counter seating that puts the kitchen on display. It also positioned Ramenhead as a deliberate move by the FYN group to broaden their footprint beyond fine dining, bringing the same uncompromising standards to a casual ramen format. For readers of luxury and lifestyle media, the article framed Ramenhead as one of Cape Town's most considered restaurant openings."},
    {"id": 617, "cat": "behind-the-scenes", "date": "2022-10-15", "image": "RAMENHEAD-WS-PIC-01.jpg",
     "source": "WhaleTales Blog", "url": "https://www.chrisvonulmenstein.com/blog/cape-town/chef-peter-tempelhoff-to-open-ramenhead-street-food-restaurant-shortly/",
     "title": "WhaleTales: Peter Tempelhoff to Open Ramenhead Street Food Restaurant",
     "summary": "Food and travel blogger Chris von Ulmenstein offered an early behind-the-scenes look at Ramenhead ahead of its launch, reporting on chef Peter Tempelhoff's plans for a Japanese street-food and ramen concept below FYN. The post captured the anticipation around the opening and the team's commitment to authentic, made-from-scratch ramen produced in-house every day.\n\nWritten in WhaleTales' signature insider tone, the post outlined what Cape Town's restaurant industry could expect: a casual room with serious technical chops, hand-made noodles, slow-cooked broths and a small-plates menu inspired by Japanese street food. It was one of the first pieces to flag Ramenhead as a major upcoming opening, and signalled to industry watchers that the team behind FYN was about to add a very different — and equally ambitious — restaurant to its growing portfolio."},
    # ---- NEWS ----
    {"id": 618, "cat": "news", "date": "2023-02-10", "image": "RAMENHEAD-WS-PIC-02.jpg",
     "source": "Mzansi Life & Style", "url": "https://mzansilifeandstyle.com/2023/02/10/ramenhead-opens-in-cape-town/",
     "title": "Mzansi Life & Style: Ramenhead Opens in Cape Town",
     "summary": "Lifestyle title Mzansi Life & Style announced the official opening of Ramenhead, welcoming Cape Town's newest authentic Japanese ramen restaurant. The article introduced the menu of hand-made noodles, slow-simmered broths and Japanese small plates, and the relaxed, walk-in-friendly atmosphere that makes Ramenhead a standout new opening in the Mother City.\n\nThe piece walked readers through what to expect at Ramenhead — the freshly-made noodles produced on-site, the deep tonkotsu and chicken broths, and the cocktail and sake programme that rounds out the experience. It also highlighted the team behind the project, drawing the line between Ramenhead and its acclaimed FYN sibling. For Mzansi Life & Style's Cape Town audience, the opening was framed as essential news: a serious new ramen destination had finally arrived in the city, and it was already drawing crowds."},
    {"id": 619, "cat": "news", "date": "2022-12-20", "image": "RAMENHEAD-WS-PIC-03.jpg",
     "source": "Restaurants.co.za", "url": "https://www.restaurants.co.za/news/ramenhead-fyns-cool-new-cousin-enters-the-cape-town-dining-scene",
     "title": "Ramenhead: FYN's Cool New Cousin Enters the Cape Town Dining Scene",
     "summary": "Restaurants.co.za reported on the arrival of Ramenhead, describing it as the cool new cousin of award-winning FYN. The news feature covered the restaurant's authentic Japanese ramen, its freshly-made noodles and rich broths, and the buzz it generated as one of the most talked-about new openings in Cape Town's dining scene.\n\nThe piece set Ramenhead in context for the South African restaurant industry: a casual ramen-ya from one of the country's most decorated kitchen teams, designed to make serious Japanese craft accessible. It detailed Ramenhead's location at Speaker's Corner, its noodle and broth programmes, its small-plates menu and the relaxed approach to bookings and walk-ins. For restaurant industry readers and food-curious Capetonians alike, it was an early signal that Ramenhead would become a fixture of the city's dining conversation."},
]

# Map category slug -> category dict for quick lookup
CAT_BY_SLUG = {c["slug"]: c for c in CATEGORIES}

# Unique featured images -> attachment id (700-block). Built from POSTS.
def build_attachment_map():
    amap, items, next_id = {}, [], 701
    for p in POSTS:
        if p["image"] not in amap:
            amap[p["image"]] = next_id
            items.append({"id": next_id, "file": p["image"]})
            next_id += 1
    return amap, items

ATTACH_MAP, ATTACHMENTS = build_attachment_map()


def render_category(c: dict) -> str:
    return (
        "\t<wp:category>\n"
        f"\t\t<wp:term_id>{c['id']}</wp:term_id>\n"
        f"\t\t<wp:category_nicename>{c['slug']}</wp:category_nicename>\n"
        "\t\t<wp:category_parent></wp:category_parent>\n"
        f"\t\t<wp:cat_name>{cdata(c['name'])}</wp:cat_name>\n"
        f"\t\t<wp:category_description>{cdata(c['desc'])}</wp:category_description>\n"
        "\t</wp:category>\n"
    )


def render_attachment(att: dict) -> str:
    url = f"{SITE_URL}/wp-content/uploads/ramenhead/{att['file']}"
    title = att['file'].rsplit('.', 1)[0]
    meta = [
        ("_wp_attached_file", f"ramenhead/{att['file']}"),
    ]
    metas = "".join(render_postmeta(k, v) for k, v in meta)
    return (
        "\t<item>\n"
        f"\t\t<title>{escape(title)}</title>\n"
        f"\t\t<link>{url}</link>\n"
        f"\t\t<pubDate>{PUB_DATE}</pubDate>\n"
        "\t\t<dc:creator><![CDATA[admin]]></dc:creator>\n"
        f"\t\t<guid isPermaLink=\"false\">{url}</guid>\n"
        "\t\t<description></description>\n"
        f"\t\t<content:encoded>{cdata('')}</content:encoded>\n"
        f"\t\t<excerpt:encoded>{cdata('')}</excerpt:encoded>\n"
        f"\t\t<wp:post_id>{att['id']}</wp:post_id>\n"
        f"\t\t<wp:post_date><![CDATA[{NOW}]]></wp:post_date>\n"
        f"\t\t<wp:post_date_gmt><![CDATA[{NOW_GMT}]]></wp:post_date_gmt>\n"
        "\t\t<wp:comment_status><![CDATA[closed]]></wp:comment_status>\n"
        "\t\t<wp:ping_status><![CDATA[closed]]></wp:ping_status>\n"
        f"\t\t<wp:post_name><![CDATA[{title.lower()}]]></wp:post_name>\n"
        "\t\t<wp:status><![CDATA[inherit]]></wp:status>\n"
        "\t\t<wp:post_parent>0</wp:post_parent>\n"
        "\t\t<wp:menu_order>0</wp:menu_order>\n"
        "\t\t<wp:post_type><![CDATA[attachment]]></wp:post_type>\n"
        "\t\t<wp:post_password><![CDATA[]]></wp:post_password>\n"
        "\t\t<wp:is_sticky>0</wp:is_sticky>\n"
        f"\t\t<wp:attachment_url>{cdata(url)}</wp:attachment_url>\n"
        f"{metas}"
        "\t</item>\n"
    )


def render_post(p: dict) -> str:
    cat = CAT_BY_SLUG[p["cat"]]
    thumb_id = ATTACH_MAP[p["image"]]
    slug = p["url"].rstrip("/").rsplit("/", 1)[-1][:60] or f"post-{p['id']}"
    post_dt = f"{p['date']} 09:00:00"
    paragraphs = [para.strip() for para in p["summary"].split("\n\n") if para.strip()]
    body_paras = "\n".join(f"<p>{para}</p>" for para in paragraphs)
    body = (
        f"{body_paras}\n"
        f"<p style=\"margin-top:32px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a6a39f;\">"
        f"Source: {escape(p['source'])}</p>\n"
        f"<p style=\"margin-top:24px;\">"
        f"<a class=\"rh-btn\" href=\"{escape(p['url'])}\" target=\"_blank\" rel=\"noopener nofollow\">"
        f"Read the full article on {escape(p['source'])} &rarr;</a></p>"
    )
    first_para = paragraphs[0] if paragraphs else ""
    excerpt = first_para[:200]
    yoast_desc = first_para[:150].rsplit(" ", 1)[0] + "…"
    meta = [
        ("_thumbnail_id", str(thumb_id)),
        ("_yoast_wpseo_title", p["title"] + " %%sep%% %%sitename%%"),
        ("_yoast_wpseo_metadesc", yoast_desc),
        ("_yoast_wpseo_focuskw", "Ramenhead"),
        ("_yoast_wpseo_meta-robots-noindex", "0"),
    ]
    metas = "".join(render_postmeta(k, v) for k, v in meta)
    return (
        "\t<item>\n"
        f"\t\t<title>{escape(p['title'])}</title>\n"
        f"\t\t<link>{SITE_URL}/{slug}/</link>\n"
        f"\t\t<pubDate>{PUB_DATE}</pubDate>\n"
        "\t\t<dc:creator><![CDATA[admin]]></dc:creator>\n"
        f"\t\t<guid isPermaLink=\"false\">{SITE_URL}/?p={p['id']}</guid>\n"
        f"\t\t<description></description>\n"
        f"\t\t<content:encoded>{cdata(body)}</content:encoded>\n"
        f"\t\t<excerpt:encoded>{cdata(excerpt)}</excerpt:encoded>\n"
        f"\t\t<wp:post_id>{p['id']}</wp:post_id>\n"
        f"\t\t<wp:post_date>{cdata(post_dt)}</wp:post_date>\n"
        f"\t\t<wp:post_date_gmt>{cdata(post_dt)}</wp:post_date_gmt>\n"
        "\t\t<wp:comment_status><![CDATA[closed]]></wp:comment_status>\n"
        "\t\t<wp:ping_status><![CDATA[closed]]></wp:ping_status>\n"
        f"\t\t<wp:post_name>{cdata(slug)}</wp:post_name>\n"
        "\t\t<wp:status><![CDATA[publish]]></wp:status>\n"
        "\t\t<wp:post_parent>0</wp:post_parent>\n"
        "\t\t<wp:menu_order>0</wp:menu_order>\n"
        "\t\t<wp:post_type><![CDATA[post]]></wp:post_type>\n"
        "\t\t<wp:post_password><![CDATA[]]></wp:post_password>\n"
        "\t\t<wp:is_sticky>0</wp:is_sticky>\n"
        f"\t\t<category domain=\"category\" nicename=\"{cat['slug']}\">{cdata(cat['name'])}</category>\n"
        f"{metas}"
        "\t</item>\n"
    )


def main() -> None:
    page_items = "".join(render_page(p) for p in PAGES)
    hf_items = "".join(render_hf_template(t) for t in HF_TEMPLATES)
    category_terms = "".join(render_category(c) for c in CATEGORIES)
    attachment_items = "".join(render_attachment(a) for a in ATTACHMENTS)
    post_items = "".join(render_post(p) for p in POSTS)
    nav_items = "".join([
        render_nav_item(401, "Home", "home", 101, 1),
        render_nav_item(402, "Menu", "menu", 102, 2),
        render_nav_item(405, "Drinks", "drinks", 105, 3),
        render_nav_item(403, "About Us", "about", 103, 4),
        render_nav_item(404, "Media", "media", 104, 5),
    ])

    xml = f"""<?xml version="1.0" encoding="UTF-8" ?>
<!--
  Ramenhead WordPress import.
  Import via: WP Admin > Tools > Import > WordPress > Run Importer.
  Choose "Download and import file attachments" when uploading the bundled images via Media Library first.
  See README.md for the full setup order.
-->
<rss version="2.0"
    xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:wp="http://wordpress.org/export/1.2/">

<channel>
    <title>Ramenhead</title>
    <link>{SITE_URL}</link>
    <description>Authentic Japanese ramen in Cape Town.</description>
    <pubDate>{PUB_DATE}</pubDate>
    <language>en-ZA</language>
    <wp:wxr_version>1.2</wp:wxr_version>
    <wp:base_site_url>{SITE_URL}</wp:base_site_url>
    <wp:base_blog_url>{SITE_URL}</wp:base_blog_url>

    <wp:author>
        <wp:author_id>1</wp:author_id>
        <wp:author_login><![CDATA[admin]]></wp:author_login>
        <wp:author_email><![CDATA[info@ramenhead.co.za]]></wp:author_email>
        <wp:author_display_name><![CDATA[Ramenhead]]></wp:author_display_name>
        <wp:author_first_name><![CDATA[]]></wp:author_first_name>
        <wp:author_last_name><![CDATA[]]></wp:author_last_name>
    </wp:author>

{render_nav_menu_term()}
{category_terms}
{page_items}
{hf_items}
{attachment_items}
{post_items}
{nav_items}
</channel>
</rss>
"""
    OUT.write_text(xml, encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
