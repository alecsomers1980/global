import json, random, string

_used=set()
def nid():
    while True:
        i=''.join(random.choices('0123456789abcdef',k=7))
        if i not in _used:
            _used.add(i); return i

def el(t,s=None,e=None,w=None,inner=False):
    o={"id":nid(),"elType":t,"settings":s or {},"elements":e or []}
    if w: o["widgetType"]=w
    if t=="section" and inner: o["settings"]["isInner"]=True
    return o

PAD=lambda a,b,c,d:{"unit":"px","top":str(a),"right":str(b),"bottom":str(c),"left":str(d),"isLinked":False}

# --- pill buttons (no colours/fonts set -> inherit Beyond global styles) ---
CATS=[("All","all"),("Press Features","press-features"),("Reviews","reviews"),
      ("Interviews","interviews"),("Awards & Recognition","awards-recognition"),
      ("Events & Collaborations","events-collaborations"),
      ("Behind the Scenes","behind-the-scenes"),("News","news")]

def pill(label,slug,active=False):
    return el("widget",{
        "text":label,
        "link":{"url":f"#filter-{slug}","is_external":"","nofollow":""},
        "size":"sm",
        "_css_classes":"bg-cat-pill is-active" if active else "bg-cat-pill",
    },w="button")

content=[]

# Hero (inherits theme styles)
content.append(el("section",{"padding":PAD(80,24,30,24)},[
    el("column",{"_column_size":100,"align":"center"},[
        el("widget",{"title":"Media & Press","header_size":"h1","align":"center"},w="heading"),
        el("widget",{"align":"center",
            "editor":"<p>Reviews, interviews, awards and news — a curated archive of press about Beyond at Buitenverwachting.</p>"},
           w="text-editor"),
    ])
]))

# Filter pills row
pills=[pill(l,s,active=(s=="all")) for l,s in CATS]
pill_inner=el("section",{"isInner":True,"_css_classes":"bg-cat-pills"},[
    el("column",{"_column_size":100,"_inline_size":100},pills)
],inner=True)
content.append(el("section",{"padding":PAD(10,24,10,24),"content_width":{"unit":"px","size":1100}},[
    el("column",{"_column_size":100,"align":"center"},[pill_inner])
]))

# Dynamic Posts grid (Pro Elements 'posts' widget). No colour/typography -> inherits theme.
posts_widget=el("widget",{
    "_skin":"classic",
    "posts_post_type":"post",
    "posts_posts_per_page":50,
    "classic_columns":3,
    "classic_columns_tablet":2,
    "classic_columns_mobile":1,
    "classic_row_gap":{"unit":"px","size":36},
    "classic_show_excerpt":"yes",
    "classic_excerpt_length":24,
    "classic_meta_data":["date"],
    "classic_read_more_text":"Read article →",
    "classic_show_read_more":"yes",
    "pagination_type":"",
    "_css_classes":"bg-media-grid",
},w="posts")

content.append(el("section",{"padding":PAD(30,24,90,24),"content_width":{"unit":"px","size":1100}},[
    el("column",{"_column_size":100},[posts_widget])
]))

tpl={"version":"0.4","title":"Beyond — Media (Dynamic)","type":"page","page_settings":[],"content":content}
with open("beyond-media-dynamic.json","w",encoding="utf-8") as f:
    json.dump(tpl,f,ensure_ascii=False,indent=2)
import xml.etree.ElementTree  # noop
print("OK beyond-media-dynamic.json :",len(content),"sections,",len(pills),"pills")
