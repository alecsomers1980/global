import json, random, string

_used = set()
def nid():
    while True:
        i = ''.join(random.choices(string.hexdigits.lower()[:16], k=7))
        if i not in _used:
            _used.add(i); return i

def el(elType, settings=None, elements=None, widgetType=None, isInner=False):
    e = {"id": nid(), "elType": elType, "settings": settings or {}, "elements": elements or []}
    if widgetType:
        e["widgetType"] = widgetType
    if elType == "section" and isInner:
        e["settings"]["isInner"] = True
    return e

def heading(text, size="h2", align="center", extra=None):
    s = {"title": text, "header_size": size, "align": align}
    if extra: s.update(extra)
    return el("widget", s, widgetType="heading")

def textw(html):
    return el("widget", {"editor": html}, widgetType="text-editor")

def button(text, url, align="left"):
    return el("widget", {
        "text": text, "align": align,
        "link": {"url": url, "is_external": "on", "nofollow": "nofollow",
                 "custom_attributes": ""},
    }, widgetType="button")

PAD = lambda t,b,l,r: {"unit":"px","top":str(t),"bottom":str(b),"left":str(l),"right":str(r),"isLinked":False}

# ---- card = one column ----
def card(title, overview, url, link_label="Read Article"):
    col_settings = {
        "_column_size": 33, "_inline_size": None,
        "padding": PAD(28,28,28,28),
        "border_border": "solid",
        "border_width": {"unit":"px","top":"1","right":"1","bottom":"1","left":"1","isLinked":True},
        "border_color": "#E6E0D6",
        "border_radius": {"unit":"px","top":"4","right":"4","bottom":"4","left":"4","isLinked":True},
    }
    kids = [
        heading(title, size="h3", align="left"),
        textw(f"<p>{overview}</p>"),
    ]
    if url:
        kids.append(button(link_label, url))
    return el("column", col_settings, kids)

# group cards into rows of 3 inner-sections
def card_rows(cards):
    rows = []
    for i in range(0, len(cards), 3):
        chunk = cards[i:i+3]
        # pad to keep widths consistent if last row has <3? leave as-is (Elementor handles)
        inner = el("section", {
            "isInner": True,
            "gap": "extended",
            "margin": PAD(0,30,0,0),
        }, chunk, isInner=True)
        rows.append(inner)
    return rows

def category_section(title, intro, cards):
    col_children = [heading(title, size="h2", align="center")]
    if intro:
        col_children.append(textw(f"<p style='text-align:center'>{intro}</p>"))
    col_children.extend(card_rows(cards))
    col = el("column", {"_column_size":100, "_inline_size":None}, col_children)
    return el("section", {
        "padding": PAD(50,30,0,0),
        "content_width": {"unit":"px","size":1140},
    }, [col])

# =========================================================
#  MEDIA PAGE
# =========================================================
def media_template():
    content = []

    # Hero
    hero_col = el("column", {"_column_size":100}, [
        heading("Media", size="h1", align="center"),
        textw("<p style='text-align:center'>Press features, reviews, interviews and recognition for Beyond at Buitenverwachting.</p>"),
    ])
    content.append(el("section", {"padding": PAD(80,50,0,0)}, [hero_col]))

    reviews = [
        card("Beyond, Constantia — Winemag",
             "Winemag's Daisy Jones reviews Beyond in its opening months, praising the historic thatched setting on Buitenverwachting with floor-to-ceiling vineyard views, the commitment to affordability, and standout dishes such as ostrich tataki elevated by creative condiments and impeccable service.",
             "https://winemag.co.za/food/restaurant-review/beyond-constantia/"),
        card("A Place Where Local Produce Is Celebrated — Eat Out",
             "Eat Out's review highlights how Beyond places provenance and seasonal local produce at the heart of every dish, celebrating the Western Cape's growers and producers in an elegant yet unpretentious setting.",
             "https://www.eatout.co.za/article/review-beyond-place-local-produce-ingredients-celebrated/"),
        card("Review: Beyond at Buitenverwachting — Wanted",
             "Wanted explores how Peter Tempelhoff's team balances the estate's centuries of heritage with a fresh, ingredient-led menu and exceptional value, in a glass-clad room amid the vines.",
             "https://www.wantedonline.co.za/food-and-drink/2022-08-26-review-beyond-at-buitenverwachting/"),
        card("Beyond at Buitenverwachting — Fodor's Travel",
             "Fodor's Travel features Beyond in its Cape Town dining guide, describing the glass-clad dining room amid the vineyards and the refined, produce-driven cooking that has made it a destination restaurant.",
             "https://www.fodors.com/world/africa-and-middle-east/south-africa/cape-town-and-peninsula/restaurants/reviews/buitenverwachting-36135"),
        card("It's Beyond Magnificent — Eating Covent Garden",
             "A UK food writer's account of a meal at Beyond, calling the experience 'beyond magnificent' and detailing the standout courses, the vineyard setting and the warm, attentive service.",
             "https://eatingcoventgarden.com/beyond-at-buitenverwachting/"),
        card("Beyond Restaurant — Lavender and Lime",
             "A detailed first-hand review from Tandy Sinclair documenting the tasting menu, the wine pairings and the relaxed-yet-refined atmosphere of the Beyond dining room.",
             "https://tandysinclair.com/beyond-restaurant/"),
    ]
    content.append(category_section("Reviews", "What the critics and food writers are saying.", reviews))

    press = [
        card("Buitenverwachting's New 'Beyond' Defines Its Name — Daily Maverick",
             "Daily Maverick covers the launch of Beyond, explaining how the restaurant takes its name from Buitenverwachting ('beyond expectations') and channels simplicity and provenance to let quality ingredients speak for themselves.",
             "https://www.dailymaverick.co.za/article/2020-12-11-buitenverwachtings-new-beyond-defines-its-name/"),
        card("Chef Peter Tempelhoff Launches New Restaurant — IOL",
             "IOL reports on Peter Tempelhoff's move to open Beyond on the historic Buitenverwachting estate, following the success of FYN and Greenhouse, with a hyper focus on the best local seasonal produce.",
             "https://www.iol.co.za/lifestyle/food-drink/restaurants/cape-town/chef-peter-tempelhoff-launches-new-restaurant-at-buitenverwachting-wine-farm-93f290b3-69a9-4924-8104-4223a32839b4"),
        card("New Restaurant Opens at Buitenverwachting — Inside Guide",
             "Inside Guide introduces Beyond to Cape Town diners, outlining the concept, the team and what to expect from the menu and the storied estate setting.",
             "https://insideguide.co.za/cape-town/restaurants/beyond-buitenverwachting/"),
        card("Tempelhoff Goes Beyond FYN — Chris von Ulmenstein",
             "A feature on how Peter Tempelhoff expanded beyond FYN to launch Beyond at Buitenverwachting, with background on the team and the culinary philosophy that drives the kitchen.",
             "https://www.chrisvonulmenstein.com/blog/cape-town/chef-peter-tempelhoff-goes-beyond-fyn-to-launch-beyond-restaurant-at-buitenverwachting/"),
    ]
    content.append(category_section("Press Features", "Beyond in the headlines.", press))

    interviews = [
        card("Peter Tempelhoff on The John Maytham Show — CapeTalk",
             "Peter Tempelhoff joins John Maytham on CapeTalk to talk through the vision for Beyond, the estate's history and his focus on the very best local, seasonal ingredients. (Audio interview.)",
             "https://www.capetalk.co.za/podcasts/144/the-john-maytham-show/386615/peter-tempelhoffs-new-restaurant-beyond-at-buitenverwachting", "Listen"),
    ]
    content.append(category_section("Interviews", "In conversation with the team behind Beyond.", interviews))

    awards = [
        card("Two Eat Out Stars — 2025 Awards",
             "Beyond was awarded Two Stars at the 2025 Eat Out Woolworths Restaurant Awards, cementing its place among South Africa's very best restaurants.",
             "https://winemag.co.za/food/news/eat-out-woolworths-restaurant-awards-2025/"),
        card("One Star — 2025 Luxe Restaurant Awards",
             "Beyond by Peter Tempelhoff was recognised as a One-Star restaurant at the 2025 Luxe Restaurant Awards.",
             "https://www.bizcommunity.com/article/all-the-2025-luxe-restaurant-awards-winners-921404a"),
        card("Listed on The World's 50 Best Discovery",
             "Beyond is featured on The World's 50 Best Discovery, the global directory curated by the academy behind The World's 50 Best Restaurants.",
             "https://www.theworlds50best.com/discovery/Establishments/South-Africa/Cape-Town/Beyond.html"),
        card("Creating 25 New Jobs at Buitenverwachting — Eat Out",
             "Eat Out reports on the announcement of Beyond's opening at Buitenverwachting and the 25 new jobs the restaurant created in Constantia.",
             "https://www.eatout.co.za/article/peter-tempelhoff-open-new-restaurant-buitenverwachting-creating-25-new-jobs/"),
    ]
    content.append(category_section("Awards & Recognition", "Stars, plates and global listings.", awards))

    events = [
        card("A Memorable Night with Jameson Stocks — EatPlayDrink",
             "EatPlayDrink recounts a memorable collaboration dinner at Beyond featuring guest chef Jameson Stocks alongside Peter Tempelhoff — a showcase of the restaurant's appetite for special one-night events.",
             "https://www.eatplaydrink.capetown/eat/a-memorable-night-at-beyond-with-jameson-stocks-and-peter-tempelhoff/"),
    ]
    content.append(category_section("Events & Collaborations", "Guest chefs, special dinners and partnerships.", events))

    bts = [
        card("Inside Beyond",
             "Coming soon: a closer look at the Beyond kitchen, our indigenous garden, foraging along the coast, and the team who bring each plate to life. Follow along for the latest.",
             "https://www.instagram.com/restaurantbeyond/", "Follow on Instagram"),
    ]
    content.append(category_section("Behind the Scenes", "The people, produce and process behind every plate.", bts))

    news = [
        card("Latest from Beyond",
             "Stay tuned for the latest announcements from Beyond, including seasonal menu launches, special evenings and estate news. For current opening details, please get in touch.",
             "https://beyondrestaurant.co.za/contact/", "Contact Us"),
    ]
    content.append(category_section("News", "Announcements and updates.", news))

    # trailing spacer
    content.append(el("section", {"padding": PAD(0,60,0,0)}, [el("column", {"_column_size":100}, [])]))

    return {
        "version": "0.4",
        "title": "Beyond — Media",
        "type": "page",
        "page_settings": [],
        "content": content,
    }

# =========================================================
#  ABOUT US PAGE
# =========================================================
def about_template():
    content = []

    # Hero
    content.append(el("section", {"padding": PAD(80,40,0,0)}, [
        el("column", {"_column_size":100}, [
            heading("About Beyond", size="h1", align="center"),
            textw("<p style='text-align:center'>Provenance, seasonality and a deep connection to place — on Buitenverwachting Wine Estate, Constantia.</p>"),
        ])
    ]))

    # Intro body
    body = (
        "<p>Located on Buitenverwachting Wine Estate in Constantia, Beyond is a sophisticated "
        "restaurant where provenance, seasonality, and the origins of flavour are the foundation. "
        "The kitchen is led by Executive Chef Sebastian Stehr with guidance from FYN Group's chefs "
        "Peter Tempelhoff and Ashley Moss. The menu honours ingredients native to the Western Cape "
        "— sourced from the restaurant's indigenous garden, foraged from the nearby coast, and "
        "supplied by local producers — drawing on ancient ingredients, age-old traditions, and a "
        "deep connection to place and flavour.</p>"
        "<p>The beverage programme follows the same philosophy. Wines from Buitenverwachting express "
        "the character of the estate's soils and vineyards, while the cocktail and non-alcoholic "
        "pairings incorporate indigenous ingredients alongside garden-grown herbs, house-made "
        "infusions, fermentations, and tinctures. The programme is led by FYN Group Sommelier and "
        "Beverage Director, Jennifer Hugé, recipient of the Eat Out Guide Patron Mixology Award.</p>"
        "<p>The dining room looks out over the rolling vineyards through floor-to-ceiling windows, "
        "with the warmth of a fireplace lending an elegant yet relaxed atmosphere. Guests are also "
        "welcome to enjoy cocktails in the lounge area of the restaurant.</p>"
    )
    content.append(el("section", {"padding": PAD(40,20,0,0), "content_width":{"unit":"px","size":900}}, [
        el("column", {"_column_size":100}, [textw(body)])
    ]))

    # Accolades
    content.append(el("section", {"padding": PAD(20,20,0,0), "content_width":{"unit":"px","size":900}}, [
        el("column", {"_column_size":100}, [
            heading("Recognition", size="h2", align="center"),
            textw("<p style='text-align:center'>Beyond currently holds <strong>two Eat Out stars</strong>, "
                  "<strong>two JHP Gourmet Guide plates</strong>, and is listed on "
                  "<strong>The World's 50 Best Discovery</strong>.</p>")
        ])
    ]))

    # Visit / details — two columns
    hours_col = el("column", {"_column_size":50, "padding": PAD(10,10,20,20)}, [
        heading("Hours", size="h3", align="left"),
        textw("<p><strong>Lunch:</strong> 12:00 – 14:30 &nbsp;|&nbsp; Tuesday – Sunday<br>"
              "<strong>Dinner:</strong> 18:00 – 20:30 &nbsp;|&nbsp; Tuesday – Saturday</p>")
    ])
    contact_col = el("column", {"_column_size":50, "padding": PAD(10,10,20,20)}, [
        heading("Find Us", size="h3", align="left"),
        textw("<p>37 Klein Constantia Rd, Nova Constantia, Cape Town, 7806<br>"
              "+27 (0)21 794 0306<br>+27 (0)72 103 3343<br>"
              "<a href='mailto:info@beyondrestaurant.co.za'>info@beyondrestaurant.co.za</a></p>")
    ])
    content.append(el("section", {"padding": PAD(30,20,0,0), "content_width":{"unit":"px","size":900}},
                      [hours_col, contact_col]))

    # Booking CTA
    content.append(el("section", {"padding": PAD(10,30,0,0)}, [
        el("column", {"_column_size":100}, [
            el("widget", {"text":"Make a Booking", "align":"center",
                          "link":{"url":"https://beyondrestaurant.co.za/make-a-booking/","is_external":"","nofollow":""}},
               widgetType="button")
        ])
    ]))

    # Good to know
    content.append(el("section", {"padding": PAD(20,60,0,0), "content_width":{"unit":"px","size":900}}, [
        el("column", {"_column_size":100}, [
            heading("Good to Know", size="h3", align="center"),
            textw("<p style='text-align:center'>Children aged 8 and older are welcome. We can accommodate "
                  "most dietary needs or allergies with prior notice, unless severe or potentially fatal.</p>")
        ])
    ]))

    return {
        "version": "0.4",
        "title": "Beyond — About Us",
        "type": "page",
        "page_settings": [],
        "content": content,
    }

with open("beyond-media.json","w",encoding="utf-8") as f:
    json.dump(media_template(), f, ensure_ascii=False, indent=2)
with open("beyond-about-us.json","w",encoding="utf-8") as f:
    json.dump(about_template(), f, ensure_ascii=False, indent=2)
print("written: beyond-media.json, beyond-about-us.json")
