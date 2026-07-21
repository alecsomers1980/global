"""Extract customers + orders from the WooCommerce SQL dump into JSON.

    python scripts/extract_woo.py

Reads  : intake/database/dianamefwm_wpaa57.sql   (phpMyAdmin style dump)
Writes : intake/legacy/customers.json
         intake/legacy/orders.json
         intake/legacy/summary.json

Both outputs are POPIA-sensitive PII and are git-ignored. This script only
reads the dump — nothing here touches Supabase; see scripts/import-legacy.mjs.

The dump has no HPOS tables, so orders are classic WordPress:
  posts(post_type='shop_order')  +  postmeta(_billing_*, _order_total, …)
  woocommerce_order_items        +  woocommerce_order_itemmeta(_qty, _line_total)
"""

import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUMP = os.path.join(ROOT, "intake", "database", "dianamefwm_wpaa57.sql")
OUT_DIR = os.path.join(ROOT, "intake", "legacy")
PREFIX = "sdfiknw_"

INSERT_RE = re.compile(r"^INSERT INTO `([a-z0-9_]+)`\s*\(([^)]*)\)\s*VALUES", re.I)


def split_tuples(chunk):
    """Split a '(...),(...)' blob into lists of raw field strings."""
    rows, cur, field = [], [], []
    depth, in_str, esc = 0, False, False
    for ch in chunk:
        if in_str:
            if esc:
                field.append(ch); esc = False
            elif ch == "\\":
                field.append(ch); esc = True
            elif ch == "'":
                in_str = False; field.append(ch)
            else:
                field.append(ch)
            continue
        if ch == "'":
            in_str = True; field.append(ch)
        elif ch == "(":
            depth += 1
            if depth == 1:
                cur, field = [], []
            else:
                field.append(ch)
        elif ch == ")":
            depth -= 1
            if depth == 0:
                cur.append("".join(field).strip()); rows.append(cur); field = []
            else:
                field.append(ch)
        elif ch == "," and depth == 1:
            cur.append("".join(field).strip()); field = []
        else:
            if depth >= 1:
                field.append(ch)
    return rows


def unq(v):
    v = v.strip()
    if v.upper() == "NULL":
        return None
    if v.startswith("'") and v.endswith("'"):
        return (
            v[1:-1]
            .replace("\\'", "'")
            .replace('\\"', '"')
            .replace("\\n", "\n")
            .replace("\\r", "")
            .replace("\\\\", "\\")
        )
    return v


def stream(tables, handler):
    """Walk the dump, calling handler(table, cols, row) for the wanted tables."""
    table, cols = None, None
    with open(DUMP, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            m = INSERT_RE.match(line)
            if m:
                table = m.group(1)
                cols = [c.strip(" `") for c in m.group(2).split(",")]
                rest = line[m.end():].strip()
                if table in tables and rest:
                    for r in split_tuples(rest.rstrip(";")):
                        handler(table, cols, r)
                continue
            if table in tables and line.startswith("("):
                for r in split_tuples(line.strip().rstrip(";").rstrip(",")):
                    handler(table, cols, r)
            elif line.strip() == "" or line.startswith(("--", "/*", "SET", "DROP", "CREATE")):
                table = None


def num(v):
    try:
        return round(float(v or 0), 2)
    except (TypeError, ValueError):
        return 0.0


# ── Pass 1: users, user meta, orders ────────────────────────────────────────
users = {}          # wp_id -> dict
usermeta = defaultdict(dict)
orders = {}         # wc_id -> dict


def pass1(table, cols, r):
    idx = {c: i for i, c in enumerate(cols)}
    if len(r) < len(cols):
        return

    if table == PREFIX + "users":
        uid = unq(r[idx["ID"]])
        users[uid] = {
            "wp_id": uid,
            "email": (unq(r[idx["user_email"]]) or "").strip().lower(),
            "display_name": unq(r[idx["display_name"]]) or "",
            "registered": unq(r[idx["user_registered"]]),
        }

    elif table == PREFIX + "usermeta":
        uid = unq(r[idx["user_id"]])
        key = unq(r[idx["meta_key"]])
        if key in (
            "first_name", "last_name", "billing_phone", "billing_first_name",
            "billing_last_name", "billing_address_1", "billing_address_2",
            "billing_city", "billing_state", "billing_postcode",
            PREFIX + "capabilities",
        ):
            usermeta[uid][key] = unq(r[idx["meta_value"]])

    elif table == PREFIX + "posts":
        if len(r) <= idx.get("post_type", 999):
            return
        if unq(r[idx["post_type"]]) == "shop_order":
            oid = unq(r[idx["ID"]])
            orders[oid] = {
                "wc_id": oid,
                "date": unq(r[idx["post_date"]]),
                "wc_status": unq(r[idx["post_status"]]),
                "meta": {},
                "items": [],
            }


print("Pass 1/3: users + orders …", flush=True)
stream({PREFIX + "users", PREFIX + "usermeta", PREFIX + "posts"}, pass1)
print(f"  {len(users)} users, {len(orders)} orders", flush=True)


# ── Pass 2: order meta ──────────────────────────────────────────────────────
WANTED_META = {
    "_customer_user", "_billing_email", "_billing_first_name", "_billing_last_name",
    "_billing_phone", "_billing_address_1", "_billing_address_2", "_billing_city",
    "_billing_state", "_billing_postcode", "_billing_country",
    "_shipping_address_1", "_shipping_address_2", "_shipping_city",
    "_shipping_state", "_shipping_postcode",
    "_order_total", "_order_shipping", "_cart_discount", "_order_tax",
    "_payment_method_title", "_date_paid", "_paid_date", "_order_key",
}


def pass2(table, cols, r):
    idx = {c: i for i, c in enumerate(cols)}
    if len(r) < len(cols):
        return
    pid = unq(r[idx["post_id"]])
    order = orders.get(pid)
    if order is None:
        return
    key = unq(r[idx["meta_key"]])
    if key in WANTED_META:
        order["meta"][key] = unq(r[idx["meta_value"]])


print("Pass 2/3: order meta …", flush=True)
stream({PREFIX + "postmeta"}, pass2)


# ── Pass 3: line items ──────────────────────────────────────────────────────
item_order = {}     # order_item_id -> (order_id, name)
item_meta = defaultdict(dict)


def pass3(table, cols, r):
    idx = {c: i for i, c in enumerate(cols)}
    if len(r) < len(cols):
        return
    if table == PREFIX + "woocommerce_order_items":
        if unq(r[idx["order_item_type"]]) != "line_item":
            return
        item_order[unq(r[idx["order_item_id"]])] = (
            unq(r[idx["order_id"]]),
            unq(r[idx["order_item_name"]]) or "",
        )
    elif table == PREFIX + "woocommerce_order_itemmeta":
        key = unq(r[idx["meta_key"]])
        if key in ("_qty", "_line_total", "_line_subtotal", "_product_id"):
            item_meta[unq(r[idx["order_item_id"]])][key] = unq(r[idx["meta_value"]])


print("Pass 3/3: line items …", flush=True)
stream({PREFIX + "woocommerce_order_items", PREFIX + "woocommerce_order_itemmeta"}, pass3)

for item_id, (order_id, name) in item_order.items():
    order = orders.get(order_id)
    if order is None:
        continue
    meta = item_meta.get(item_id, {})
    qty = int(num(meta.get("_qty")) or 1)
    line_total = num(meta.get("_line_total") or meta.get("_line_subtotal"))
    order["items"].append({
        "title": name,
        "qty": max(qty, 1),
        "line_total": line_total,
        "unit_price": round(line_total / qty, 2) if qty else line_total,
        "wc_product_id": meta.get("_product_id"),
    })


# ── Shape the customers ─────────────────────────────────────────────────────
# WP roles live in a serialised capabilities blob: a:1:{s:8:"customer";b:1;}
ROLE_RE = re.compile(r's:\d+:"([a-z_]+)"')


def wp_role(uid):
    caps = usermeta.get(uid, {}).get(PREFIX + "capabilities") or ""
    m = ROLE_RE.search(caps)
    return m.group(1) if m else "unknown"


customers = []
skipped_roles = defaultdict(int)
for uid, u in users.items():
    role = wp_role(uid)
    # Only real customers. Diana + shop staff must NOT be imported as customers
    # (they'd land in /admin/customers and could be deleted from there).
    if role != "customer":
        skipped_roles[role] += 1
        continue
    if not u["email"]:
        skipped_roles["no-email"] += 1
        continue
    m = usermeta.get(uid, {})
    first = m.get("billing_first_name") or m.get("first_name") or ""
    last = m.get("billing_last_name") or m.get("last_name") or ""
    full_name = (f"{first} {last}").strip() or u["display_name"]
    customers.append({
        "wp_id": uid,
        "email": u["email"],
        "full_name": full_name,
        "phone": m.get("billing_phone") or "",
        "registered": u["registered"],
        "address": {
            "line1": m.get("billing_address_1") or "",
            "line2": m.get("billing_address_2") or "",
            "city": m.get("billing_city") or "",
            "province": m.get("billing_state") or "",
            "postal_code": m.get("billing_postcode") or "",
        },
    })

by_wp_id = {c["wp_id"]: c for c in customers}

# ── Shape the orders ────────────────────────────────────────────────────────
out_orders = []
for oid, o in orders.items():
    meta = o["meta"]
    total = num(meta.get("_order_total"))
    shipping = num(meta.get("_order_shipping"))
    customer_wp_id = meta.get("_customer_user")
    if customer_wp_id in ("0", "", None) or customer_wp_id not in by_wp_id:
        customer_wp_id = None  # guest order, or an order owned by a skipped admin

    first = meta.get("_billing_first_name") or ""
    last = meta.get("_billing_last_name") or ""
    out_orders.append({
        "wc_id": oid,
        "order_number": f"WC-{oid}",
        "date": o["date"],
        "wc_status": o["wc_status"],
        "customer_wp_id": customer_wp_id,
        "email": (meta.get("_billing_email") or "").strip().lower(),
        "full_name": f"{first} {last}".strip(),
        "phone": meta.get("_billing_phone") or "",
        "address": {
            "line1": meta.get("_shipping_address_1") or meta.get("_billing_address_1") or "",
            "line2": meta.get("_shipping_address_2") or meta.get("_billing_address_2") or "",
            "city": meta.get("_shipping_city") or meta.get("_billing_city") or "",
            "province": meta.get("_shipping_state") or meta.get("_billing_state") or "",
            "postal_code": meta.get("_shipping_postcode") or meta.get("_billing_postcode") or "",
        },
        "subtotal": round(total - shipping, 2),
        "shipping": shipping,
        "total": total,
        "paid_date": meta.get("_date_paid") or meta.get("_paid_date") or None,
        "payment_method": meta.get("_payment_method_title") or "",
        "items": o["items"],
    })

out_orders.sort(key=lambda x: x["date"] or "")

# ── Write ───────────────────────────────────────────────────────────────────
os.makedirs(OUT_DIR, exist_ok=True)

status_counts = defaultdict(int)
status_money = defaultdict(float)
for o in out_orders:
    status_counts[o["wc_status"]] += 1
    status_money[o["wc_status"]] += o["total"]

summary = {
    "customers": len(customers),
    "skipped_users": dict(skipped_roles),
    "orders": len(out_orders),
    "line_items": sum(len(o["items"]) for o in out_orders),
    "guest_orders": sum(1 for o in out_orders if not o["customer_wp_id"]),
    "orders_without_items": sum(1 for o in out_orders if not o["items"]),
    "date_from": out_orders[0]["date"] if out_orders else None,
    "date_to": out_orders[-1]["date"] if out_orders else None,
    "by_status": {k: {"orders": v, "value": round(status_money[k], 2)}
                  for k, v in sorted(status_counts.items(), key=lambda x: -x[1])},
    "total_value": round(sum(o["total"] for o in out_orders), 2),
}

with open(os.path.join(OUT_DIR, "customers.json"), "w", encoding="utf-8") as f:
    json.dump(customers, f, ensure_ascii=False, indent=1)
with open(os.path.join(OUT_DIR, "orders.json"), "w", encoding="utf-8") as f:
    json.dump(out_orders, f, ensure_ascii=False, indent=1)
with open(os.path.join(OUT_DIR, "summary.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

print()
print(json.dumps(summary, indent=2))
print(f"\nWrote {OUT_DIR}\\customers.json, orders.json, summary.json")
