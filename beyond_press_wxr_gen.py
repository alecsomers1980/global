import xml.sax.saxutils as su
from datetime import datetime, timezone

SITE = "https://beyondrestaurant.co.za"
AUTHOR = "admin"  # change to your WP username if different

# (category_name, category_slug)
CATEGORIES = [
    ("Press Features", "press-features"),
    ("Reviews", "reviews"),
    ("Interviews", "interviews"),
    ("Awards & Recognition", "awards-recognition"),
    ("Events & Collaborations", "events-collaborations"),
    ("Behind the Scenes", "behind-the-scenes"),
    ("News", "news"),
]

# (cat_slug, cat_name, title, outlet, overview, url, date 'YYYY-MM-DD')
POSTS = [
    # ---- Reviews ----
    ("reviews","Reviews","Beyond, Constantia — Winemag","Winemag",
     "Winemag's Daisy Jones reviews Beyond in its opening months, praising the historic thatched setting on Buitenverwachting with floor-to-ceiling vineyard views, the commitment to affordability, and standout dishes such as ostrich tataki elevated by creative condiments and impeccable service.",
     "https://winemag.co.za/food/restaurant-review/beyond-constantia/","2021-01-19"),
    ("reviews","Reviews","A Place Where Local Produce Is Celebrated — Eat Out","Eat Out",
     "Eat Out's review highlights how Beyond places provenance and seasonal local produce at the heart of every dish, celebrating the Western Cape's growers and producers in an elegant yet unpretentious setting.",
     "https://www.eatout.co.za/article/review-beyond-place-local-produce-ingredients-celebrated/","2021-03-01"),
    ("reviews","Reviews","Review: Beyond at Buitenverwachting — Wanted","Wanted",
     "Wanted explores how Peter Tempelhoff's team balances the estate's centuries of heritage with a fresh, ingredient-led menu and exceptional value, in a glass-clad room amid the vines.",
     "https://www.wantedonline.co.za/food-and-drink/2022-08-26-review-beyond-at-buitenverwachting/","2022-08-26"),
    ("reviews","Reviews","Beyond at Buitenverwachting — Fodor's Travel","Fodor's Travel",
     "Fodor's Travel features Beyond in its Cape Town dining guide, describing the glass-clad dining room amid the vineyards and the refined, produce-driven cooking that has made it a destination restaurant.",
     "https://www.fodors.com/world/africa-and-middle-east/south-africa/cape-town-and-peninsula/restaurants/reviews/buitenverwachting-36135","2022-01-01"),
    ("reviews","Reviews","It's Beyond Magnificent — Eating Covent Garden","Eating Covent Garden",
     "A UK food writer's account of a meal at Beyond, calling the experience 'beyond magnificent' and detailing the standout courses, the vineyard setting and the warm, attentive service.",
     "https://eatingcoventgarden.com/beyond-at-buitenverwachting/","2023-02-01"),
    ("reviews","Reviews","Beyond Restaurant — Lavender and Lime","Lavender and Lime",
     "A detailed first-hand review from Tandy Sinclair documenting the tasting menu, the wine pairings and the relaxed-yet-refined atmosphere of the Beyond dining room.",
     "https://tandysinclair.com/beyond-restaurant/","2022-06-01"),
    # ---- Press Features ----
    ("press-features","Press Features","Buitenverwachting's New 'Beyond' Defines Its Name — Daily Maverick","Daily Maverick",
     "Daily Maverick covers the launch of Beyond, explaining how the restaurant takes its name from Buitenverwachting ('beyond expectations') and channels simplicity and provenance to let quality ingredients speak for themselves.",
     "https://www.dailymaverick.co.za/article/2020-12-11-buitenverwachtings-new-beyond-defines-its-name/","2020-12-11"),
    ("press-features","Press Features","Chef Peter Tempelhoff Launches New Restaurant — IOL","IOL",
     "IOL reports on Peter Tempelhoff's move to open Beyond on the historic Buitenverwachting estate, following the success of FYN and Greenhouse, with a hyper focus on the best local seasonal produce.",
     "https://www.iol.co.za/lifestyle/food-drink/restaurants/cape-town/chef-peter-tempelhoff-launches-new-restaurant-at-buitenverwachting-wine-farm-93f290b3-69a9-4924-8104-4223a32839b4","2020-11-01"),
    ("press-features","Press Features","New Restaurant Opens at Buitenverwachting — Inside Guide","Inside Guide",
     "Inside Guide introduces Beyond to Cape Town diners, outlining the concept, the team and what to expect from the menu and the storied estate setting.",
     "https://insideguide.co.za/cape-town/restaurants/beyond-buitenverwachting/","2021-01-01"),
    ("press-features","Press Features","Tempelhoff Goes Beyond FYN — Chris von Ulmenstein","Chris von Ulmenstein",
     "A feature on how Peter Tempelhoff expanded beyond FYN to launch Beyond at Buitenverwachting, with background on the team and the culinary philosophy that drives the kitchen.",
     "https://www.chrisvonulmenstein.com/blog/cape-town/chef-peter-tempelhoff-goes-beyond-fyn-to-launch-beyond-restaurant-at-buitenverwachting/","2020-12-01"),
    # ---- Interviews ----
    ("interviews","Interviews","Peter Tempelhoff on The John Maytham Show — CapeTalk","CapeTalk",
     "Peter Tempelhoff joins John Maytham on CapeTalk to talk through the vision for Beyond, the estate's history and his focus on the very best local, seasonal ingredients. (Audio interview.)",
     "https://www.capetalk.co.za/podcasts/144/the-john-maytham-show/386615/peter-tempelhoffs-new-restaurant-beyond-at-buitenverwachting","2020-11-15"),
    # ---- Awards & Recognition ----
    ("awards-recognition","Awards & Recognition","Two Eat Out Stars — 2025 Awards","Eat Out",
     "Beyond was awarded Two Stars at the 2025 Eat Out Woolworths Restaurant Awards, cementing its place among South Africa's very best restaurants.",
     "https://winemag.co.za/food/news/eat-out-woolworths-restaurant-awards-2025/","2025-03-31"),
    ("awards-recognition","Awards & Recognition","One Star — 2025 Luxe Restaurant Awards","Bizcommunity",
     "Beyond by Peter Tempelhoff was recognised as a One-Star restaurant at the 2025 Luxe Restaurant Awards.",
     "https://www.bizcommunity.com/article/all-the-2025-luxe-restaurant-awards-winners-921404a","2025-01-01"),
    ("awards-recognition","Awards & Recognition","Listed on The World's 50 Best Discovery","The World's 50 Best",
     "Beyond is featured on The World's 50 Best Discovery, the global directory curated by the academy behind The World's 50 Best Restaurants.",
     "https://www.theworlds50best.com/discovery/Establishments/South-Africa/Cape-Town/Beyond.html","2022-01-01"),
    ("awards-recognition","Awards & Recognition","Creating 25 New Jobs at Buitenverwachting — Eat Out","Eat Out",
     "Eat Out reports on the announcement of Beyond's opening at Buitenverwachting and the 25 new jobs the restaurant created in Constantia.",
     "https://www.eatout.co.za/article/peter-tempelhoff-open-new-restaurant-buitenverwachting-creating-25-new-jobs/","2020-10-01"),
    # ---- Events & Collaborations ----
    ("events-collaborations","Events & Collaborations","A Memorable Night with Jameson Stocks — EatPlayDrink","EatPlayDrink",
     "EatPlayDrink recounts a memorable collaboration dinner at Beyond featuring guest chef Jameson Stocks alongside Peter Tempelhoff — a showcase of the restaurant's appetite for special one-night events.",
     "https://www.eatplaydrink.capetown/eat/a-memorable-night-at-beyond-with-jameson-stocks-and-peter-tempelhoff/","2023-01-01"),
]

def cd(s):  # CDATA wrap
    return f"<![CDATA[{s}]]>"

def rss_date(d):
    dt = datetime.strptime(d, "%Y-%m-%d").replace(hour=10, tzinfo=timezone.utc)
    return dt.strftime("%a, %d %b %Y %H:%M:%S +0000")

def slugify(t):
    out = "".join(c.lower() if c.isalnum() else "-" for c in t)
    while "--" in out: out = out.replace("--","-")
    return out.strip("-")[:60]

parts = []
parts.append('<?xml version="1.0" encoding="UTF-8"?>')
parts.append('<rss version="2.0" '
    'xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" '
    'xmlns:content="http://purl.org/rss/1.0/modules/content/" '
    'xmlns:wfw="http://wellformedweb.org/CommentAPI/" '
    'xmlns:dc="http://purl.org/dc/elements/1.1/" '
    'xmlns:wp="http://wordpress.org/export/1.2/">')
parts.append("<channel>")
parts.append(f"<title>Beyond — Press &amp; Media</title>")
parts.append(f"<link>{SITE}</link>")
parts.append("<description>Press, reviews and recognition for Beyond Restaurant</description>")
parts.append(f"<pubDate>{rss_date('2026-06-03')}</pubDate>")
parts.append("<language>en-US</language>")
parts.append("<wp:wxr_version>1.2</wp:wxr_version>")
parts.append(f"<wp:base_site_url>{SITE}</wp:base_site_url>")
parts.append(f"<wp:base_blog_url>{SITE}</wp:base_blog_url>")
parts.append(f"<wp:author><wp:author_id>1</wp:author_id><wp:author_login>{cd(AUTHOR)}</wp:author_login>"
             f"<wp:author_email>{cd('info@beyondrestaurant.co.za')}</wp:author_email>"
             f"<wp:author_display_name>{cd('Beyond')}</wp:author_display_name>"
             f"<wp:author_first_name>{cd('')}</wp:author_first_name>"
             f"<wp:author_last_name>{cd('')}</wp:author_last_name></wp:author>")

for i,(name,slug) in enumerate(CATEGORIES, start=101):
    parts.append("<wp:category>"
        f"<wp:term_id>{i}</wp:term_id>"
        f"<wp:category_nicename>{cd(slug)}</wp:category_nicename>"
        f"<wp:category_parent>{cd('')}</wp:category_parent>"
        f"<wp:cat_name>{cd(name)}</wp:cat_name></wp:category>")

pid = 2001
for cat_slug,cat_name,title,outlet,overview,url,date in POSTS:
    safe_url = su.escape(url)
    body = (f"<p>{su.escape(overview)}</p>\n"
            f'<p><a href="{safe_url}" target="_blank" rel="noopener noreferrer">'
            f"<strong>Read the full article on {su.escape(outlet)} &rarr;</strong></a></p>")
    pdate = f"{date} 10:00:00"
    parts.append("<item>")
    parts.append(f"<title>{su.escape(title)}</title>")
    parts.append(f"<link>{SITE}/{slugify(title)}/</link>")
    parts.append(f"<pubDate>{rss_date(date)}</pubDate>")
    parts.append(f"<dc:creator>{cd(AUTHOR)}</dc:creator>")
    parts.append(f'<guid isPermaLink="false">{SITE}/?p={pid}</guid>')
    parts.append("<description></description>")
    parts.append(f"<content:encoded>{cd(body)}</content:encoded>")
    parts.append(f"<excerpt:encoded>{cd(overview)}</excerpt:encoded>")
    parts.append(f"<wp:post_id>{pid}</wp:post_id>")
    parts.append(f"<wp:post_date>{cd(pdate)}</wp:post_date>")
    parts.append(f"<wp:post_date_gmt>{cd(pdate)}</wp:post_date_gmt>")
    parts.append(f"<wp:comment_status>{cd('closed')}</wp:comment_status>")
    parts.append(f"<wp:ping_status>{cd('closed')}</wp:ping_status>")
    parts.append(f"<wp:post_name>{cd(slugify(title))}</wp:post_name>")
    parts.append(f"<wp:status>{cd('publish')}</wp:status>")
    parts.append("<wp:post_parent>0</wp:post_parent>")
    parts.append("<wp:menu_order>0</wp:menu_order>")
    parts.append(f"<wp:post_type>{cd('post')}</wp:post_type>")
    parts.append(f"<wp:post_password>{cd('')}</wp:post_password>")
    parts.append("<wp:is_sticky>0</wp:is_sticky>")
    parts.append(f'<category domain="category" nicename="{cat_slug}">{cd(cat_name)}</category>')
    parts.append("</item>")
    pid += 1

parts.append("</channel>")
parts.append("</rss>")

xml = "\n".join(parts)
with open("beyond-press-posts.xml","w",encoding="utf-8") as f:
    f.write(xml)

# validate well-formedness
import xml.etree.ElementTree as ET
ET.fromstring(xml)
print(f"OK: beyond-press-posts.xml written, {len(POSTS)} posts, {len(CATEGORIES)} categories")
