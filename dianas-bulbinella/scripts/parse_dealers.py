"""Parse Diana's agent list into structured dealer records.

    python scripts/parse_dealers.py

Reads  seed/dealers-raw.txt   (Diana's list, lightly normalised: ► = province,
                               ## = region, • = one listing, @DEPOT@ = depot flag)
Writes seed/dealers.json

The source is organised by TOWN, so one agent can appear several times (Anne Maw
is listed under Durban North, La Lucia and Umhlanga). We merge those: one dealer
per (name + phone) per province, with every town collected into `areas`. That
way Diana edits a phone number once, and customers can still find their town.
"""

import json
import os
import re
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "seed", "dealers-raw.txt")
OUT = os.path.join(ROOT, "seed", "dealers.json")

PROVINCE_FIX = {
    "EASTERN CAPE": ("Eastern Cape", None),
    "FREE STATE": ("Free State", None),
    "GAUTENG – JOHANNESBURG": ("Gauteng", "Johannesburg"),
    "GAUTENG – PRETORIA": ("Gauteng", "Pretoria"),
    "GAUTENG - VAALDRIEHOEK": ("Gauteng", "Vaal Triangle"),
    "KWAZULU NATAL": ("KwaZulu-Natal", None),
    "LIMPOPO": ("Limpopo", None),
    "MPUMALANGA": ("Mpumalanga", None),
    "NORTHERN CAPE": ("Northern Cape", None),
    "NORTH WEST": ("North West", None),
    "WESTERN CAPE": ("Western Cape", None),
}

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
# SA numbers are 10 digits, but the source groups them inconsistently
# ('083 375 0796', '083 6611 337', '0836611337'). Match a loose run of digits
# and separators, then validate on the digit count rather than the grouping.
PHONE_RE = re.compile(r"\b0[\d\s\-]{8,13}\d\b")


def is_phone(p):
    return len(re.sub(r"\D", "", p)) == 10


def clean_phone(p):
    digits = re.sub(r"\D", "", p)
    return f"{digits[0:3]} {digits[3:6]} {digits[6:10]}"


def split_areas(text):
    """'Springs / Sundra' or 'Despatch, Uitenhage, PE' -> ['Springs','Sundra']"""
    parts = re.split(r"\s*[/;,]\s*", text)
    return [p.strip(" .") for p in parts if p.strip(" .")]


def parse():
    province = region = None
    rows = []

    with open(RAW, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line:
                continue

            if line.startswith("►"):
                key = line.lstrip("►").rstrip(":").strip()
                province, region = PROVINCE_FIX[key]
                continue

            if line.startswith("##"):
                label = line.lstrip("#").rstrip(":").strip()
                if province == "Gauteng":
                    # 'EAST RAND' under 'GAUTENG – JOHANNESBURG' -> 'Johannesburg – East Rand'
                    base = region.split(" – ")[0] if region else "Johannesburg"
                    region = f"{base} – {label.title()}"
                elif label.upper() == "CAPE TOWN":
                    region = "Cape Town"
                else:
                    region = None
                continue

            if not line.startswith("•"):
                continue

            entry = line.lstrip("•").strip()

            is_depot = "@DEPOT@" in entry
            entry = entry.replace("@DEPOT@", "").strip()

            # Pull out the emails first — they contain dots/dashes that confuse
            # the rest of the splitting.
            emails = EMAIL_RE.findall(entry)
            for e in emails:
                entry = entry.replace(e, " ")

            found = [p for p in PHONE_RE.findall(entry) if is_phone(p)]
            phones = [clean_phone(p) for p in found]
            for p in found:
                entry = entry.replace(p, " ")

            # Whatever's left: "Town / Town: Name - ( )  Landline:"
            entry = re.sub(r"\[[^\]]*\]", lambda m: m.group(0), entry)  # keep [..] for now
            bracket = re.search(r"\[([^\]]*)\]", entry)
            extra_areas = []
            if bracket and "@" not in bracket.group(1):
                extra_areas = split_areas(bracket.group(1))
                entry = entry.replace(bracket.group(0), " ")

            # Brackets left holding only punctuation once the emails/phones are
            # out — e.g. '(fenh4@… / tina@…)' becomes '( / )'.
            entry = re.sub(r"\([^A-Za-z0-9]*\)|\[[^A-Za-z0-9]*\]", " ", entry)
            entry = re.sub(r"Landline\s*:?", " ", entry, flags=re.I)
            entry = re.sub(r"\s+", " ", entry).strip(" .,-–:/")

            # Split town(s) from the agent name at the LAST colon that still has
            # text on both sides — 'East London: Gonubie: Lizette Eloff'.
            if ":" in entry:
                head, _, tail = entry.rpartition(":")
            else:
                # 'La Lucia - Anne Maw' / 'Douglasdale – Lourentia Tonkin'
                m = re.split(r"\s+[-–]\s+", entry, maxsplit=1)
                head, tail = (m[0], m[1]) if len(m) == 2 else (entry, "")

            # Don't strip parens here — the business name below needs its
            # closing bracket ('Bernadette (Gentleman's Barbershop)').
            name = tail.strip(" .,-–:")
            name = re.sub(r"\s*\(\s*", " (", name).strip()

            areas = split_areas(head) + extra_areas

            # A trailing '(Kudu Slaghuis)' style note is a business, not a name.
            business = ""
            m = re.match(r"^(.*?)\s*\(([^)]+)\)\s*$", name)
            if m and not any(ch.isdigit() for ch in m.group(2)):
                name, business = m.group(1), m.group(2).strip()

            name = name.strip(" .,-–:")

            if not name and business:
                name, business = business, ""

            rows.append({
                "province": province,
                "region": region,
                "areas": [a for a in areas if a],
                "name": name,
                "business": business,
                "phones": phones,
                "emails": emails,
                "is_depot": is_depot,
            })

    # ── Merge duplicate agents within a province ──
    merged = OrderedDict()
    for r in rows:
        key = (
            r["province"],
            (r["phones"][0] if r["phones"] else r["name"].lower()),
        )
        if key in merged:
            m = merged[key]
            for a in r["areas"]:
                if a not in m["areas"]:
                    m["areas"].append(a)
            for e in r["emails"]:
                if e not in m["emails"]:
                    m["emails"].append(e)
            for p in r["phones"]:
                if p not in m["phones"]:
                    m["phones"].append(p)
            m["is_depot"] = m["is_depot"] or r["is_depot"]
            # Prefer the longer, more complete name ('Anne Maw' over 'Anne').
            if len(r["name"]) > len(m["name"]):
                m["name"] = r["name"]
            if r["business"] and not m["business"]:
                m["business"] = r["business"]
        else:
            merged[key] = dict(r)

    out = []
    for r in merged.values():
        out.append({
            "name": r["name"],
            "business": r["business"],
            "country": "South Africa",
            "province": r["province"],
            "region": r["region"],
            "areas": r["areas"],
            "phone": r["phones"][0] if r["phones"] else "",
            "phone_alt": r["phones"][1] if len(r["phones"]) > 1 else "",
            "email": r["emails"][0] if r["emails"] else "",
            "notes": "",
            "is_depot": r["is_depot"],
        })

    out.sort(key=lambda d: (d["province"], d["region"] or "", d["areas"][0] if d["areas"] else ""))
    return rows, out


if __name__ == "__main__":
    rows, out = parse()
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    print(f"listings parsed : {len(rows)}")
    print(f"dealers (merged): {len(out)}")
    print()
    by_prov = {}
    for d in out:
        by_prov[d["province"]] = by_prov.get(d["province"], 0) + 1
    for p, n in sorted(by_prov.items()):
        print(f"  {p:16} {n}")

    missing_phone = [d["name"] for d in out if not d["phone"]]
    missing_email = [d["name"] for d in out if not d["email"]]
    print(f"\nno phone: {len(missing_phone)} {missing_phone}")
    print(f"no email: {len(missing_email)} {missing_email}")
    print(f"\nWrote {OUT}")
