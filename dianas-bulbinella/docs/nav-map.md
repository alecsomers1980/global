# Navigation & category map — Diana's Bulbinella

**From:** 31 flat WooCommerce categories (all parent=0), with big vague "OTHER" buckets.
**To:** a two-axis system customers can actually navigate — **Shop by Concern** + **Shop by Range** — plus format filters and dynamic collections.
Source data: [`categories.csv`](categories.csv), [`catalogue-inventory.csv`](catalogue-inventory.csv). Old category counts in (brackets).

---

## The problem with today's categories
- The three biggest "categories" are catch-alls: **OTHER SOAP BARS (86)**, **OTHER NATURAL PRODUCTS (72)**, **HEALTH SERUMS (72)** — they describe *format*, not what the customer wants.
- 15 of the 31 are single-ingredient marketing ranges (Myrrh, Neroli, Argan…) — good for brand storytelling, useless as primary navigation.
- No hierarchy, no "shop by concern", and products already sit in multiple categories (e.g. African Black Soap → Acne + Charcoal + Soap), so we're reorganising *presentation*, not re-tagging from scratch.

---

## New IA

### Axis 1 — Shop by Concern  *(primary menu)*
| New concern hub | URL | Pulls from (old categories) |
|---|---|---|
| Problem & Sensitive Skin | `/shop/problem-skin` | ACNE CONTROL (16), Eczema products, African Black Soap |
| Anti-Ageing | `/shop/anti-ageing` | ABSOLUTE, MYRRH, NEROLI, LOTUS, COLLAGEN, SAFFRON, VITAMIN-E, HONEY-BEE, SPEKBOOM, BEE-Flawless, BEE-Pink |
| Weight & Metabolism | `/shop/weight-metabolism` | WEIGHT LOSS (26), Ocotea drops/slimming |
| Cellulite & Body | `/shop/cellulite-body` | CELLULITE (16) |
| Stress, Sleep & Hormones | `/shop/stress-hormones` | CORTISOL REDUCING (9) + Calm/Meno/Men's items |
| Digestion & Detox | `/shop/detox-digestion` | HEALTH & DETOX (50), MASTIC GUM (15), Myrrh detox |
| Baby & Family | `/shop/baby-family` | Bulbi BABY (9) |
| Hair, Nails & Lashes | `/shop/hair-nails` | lash / nail / cuticle products (from OTHER NATURAL) |
| Men's Care | `/shop/mens` | Beard oil, Men's Vitality (ex-Andropause) |

### Axis 2 — Shop by Range / Ingredient  *(secondary menu, brand storytelling)*
`/range/<slug>` for each hero line — **Bulbinella**, **Mastic Gum**, **Argan**, **Collagen**, **Myrrh**, **Neroli**, **Lotus**, **Saffron**, **Royal Jelly**, **Vitamin-E**, **Charcoal**, **Coffee**, **Shilajit**, **Spekboom**, **Honey-Bee**, **Bee-Pink**, **Bee-Flawless**, **Hemp Botanical Skincare** (ex-"CANNAB!S").

### Format = filter facets, not categories
Retire OTHER SOAP BARS / HEALTH SERUMS as *categories*; expose as **filters** on any listing page: **Soaps · Serums · Creams · Balms · Capsules · Oils · Drops · Masques**. (Also filter by size 10ml/100ml/50g→500g and price.)

### Dynamic collections (auto, no manual upkeep)
- **New In** `/new` — auto-populated by product date (replaces the manual "NEW Products" (14) category).
- **Specials** `/specials` — driven by the Specials Scheduler (replaces the manual "CLEARANCE SALE" (11) category).

---

## Disposition of all 31 old categories
| Old category (count) | New home |
|---|---|
| BULBINELLA (17) | `/range/bulbinella` (+ hero on home) |
| MASTIC GUM (15) | `/range/mastic-gum` → also under Digestion |
| HEALTH & DETOX (50) | `/shop/detox-digestion` |
| HEALTH SERUMS (72) | **retire** → "Serums" filter + spread to concerns |
| OTHER SOAP BARS (86) | **retire** → "Soaps" filter + spread to concerns |
| OTHER NATURAL PRODUCTS (72) | **retire** → spread to concerns / hair-nails |
| ACNE CONTROL (16) | `/shop/problem-skin` |
| WEIGHT LOSS (26) | `/shop/weight-metabolism` |
| CELLULITE (16) | `/shop/cellulite-body` |
| CORTISOL REDUCING C.R. (9) | `/shop/stress-hormones` |
| Bulbi BABY (9) | `/shop/baby-family` |
| ABSOLUTE / MYRRH / NEROLI / LOTUS / COLLAGEN / SAFFRON / VITAMIN-E / HONEY-BEE / SPEKBOOM / BEE-Flawless / BEE-Pink (Anti-Ageing lines) | `/shop/anti-ageing` (concern) + own `/range/<x>` page |
| ARGAN OIL (18), CHARCOAL (15), COFFEE (6), ROYAL JELLY (8), SHILAJIT (7) | `/range/<x>` + relevant concern |
| CANNAB!S Skin Care (30) | `/range/hemp-skincare` (**renamed**, no medical claims) |
| CLEARANCE SALE (11) | `/specials` (dynamic) |
| NEW Products (14) | `/new` (dynamic) |
| Uncategorized (0) | drop |

---

## Homepage structure (replaces the 4-slider mess)
1. Hero — Diana's founder story + Bulbinella (E-E-A-T).
2. **Shop by Concern** tiles (the 9 hubs above).
3. **This Month's Specials** — auto from the scheduler.
4. Hero ranges — Bulbinella, Mastic Gum, Hemp.
5. Reviews / testimonials (once collected).
6. Find-a-dealer map teaser + newsletter.

Redirects for every URL change are in [`redirects.csv`](redirects.csv).
