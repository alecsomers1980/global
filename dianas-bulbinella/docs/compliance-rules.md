# Compliance copy rules — Diana's Bulbinella

**Purpose:** make every product page legal to publish in South Africa before we migrate it.
**Status:** ruleset drafted from the real catalogue (2026-07-09). Product *renames* need Diana's sign-off.
**Not legal advice** — for the highest-risk items (cancer, asthma) confirm with a regulatory consultant before relaunch.

---

## 1. Why this matters (evidence from the actual data)

Scan of all 480 products found flagged medical-claim language in **101 products (21%)**, **284 total hits**:

| Claim term | Hits | | Claim term | Hits |
|---|---|---|---|---|
| cancer | 43 | | diabetes | 11 |
| eczema | 31 | | anti-inflammatory | 10 |
| psoriasis | 22 | | bacteria / antibacterial | 9 |
| cholesterol | 19 | | ulcer | 9 |
| treats / treatment | 22 | | menopause | 7 |
| prevents | 11 | | thyroid | 7 |
| cures / heals | 11 | | asthma, arthritis, hypertension | 5 ea |

Worst example, live right now (Mastic Gum capsules):
> *"Stomach cancer. Colon cancer. Peptic ulcers… High Cholesterol. Crohn's disease. Diabetes. Hypertension. Kills 'Helicobacter Pylori bacteria'… and more!"*

**31 products are named after a disease** (e.g. *Anti-Cancer Serum*, *Herbal Skin Cancer Cream*, *Asthma Serum*, *Menopause Serum*) — the claim is in the title, slug and category, not just the description.

### The legal exposure
- **Medicines & Related Substances Act 101 of 1965 + SAHPRA** — a product that claims to treat/prevent/cure a disease is a *medicine*. Unless registered, selling it is illegal and SAHPRA can order takedown/recall.
- **Foodstuffs, Cosmetics & Disinfectants Act 54 of 1972** — a cosmetic may only make *cosmetic* claims (cleanse, moisturise, soften, perfume, protect). Disease/therapeutic claims are prohibited for cosmetics.
- **Advertising Regulatory Board (ARB) Code** — bans misleading and unsubstantiated health claims.
- **Consumer Protection Act 68 of 2008** — false/misleading representations.
- **Cannabis** — the "CANNAB!S" range (30 products) must avoid both the obfuscated spelling *and* medical claims; CBD claims are tightly restricted.

This is also **SEO-toxic**: Google treats health content as "Your Money or Your Life" and suppresses sites making unbacked cure claims. Fixing this is a ranking *gain*, not just risk reduction.

---

## 2. The rules

### ❌ Never use
- Any **disease or condition name** as a claim: cancer, diabetes, HIV/AIDS, Crohn's, ulcer, hypertension/high blood pressure, cholesterol, arthritis, asthma, psoriasis, eczema, menopause, andropause, thyroid, epilepsy, depression, anxiety (as a condition), stroke, COVID.
- **Action verbs implying treatment:** cure, cures, heal, heals, treat, treats, prevent, prevents, kills, eliminates, reverses.
- **Pharma-style claims:** "antibacterial", "antiviral", "antifungal", "anti-inflammatory", "kills bacteria", "clinically proven" (unless you hold the study), "medicinal".
- Naming a pathogen ("Helicobacter Pylori"), "detoxes the [organ]", "boosts immune system".

### ✅ Allowed instead
- **Cosmetic function** (always safe for topicals): *cleanses, moisturises, softens, soothes, conditions, nourishes, protects, refreshes, reduces the appearance of, leaves skin feeling…*
- **Traditional-use framing** (for herbal/ingested): *"Traditionally used in South Africa to support…"*, *"has a long history of traditional use for…"* — describes heritage, not efficacy.
- **Sensory / lifestyle:** *"a calming ritual", "for a restful evening", "a warming massage"*.
- Structure/function only where genuinely defensible and soft: *"supports skin comfort"* — never *"treats eczema"*.

### 📋 Mandatory on every product page
1. **Disclaimer block:**
   > *"This product is a natural cosmetic / complementary product. It is not intended to diagnose, treat, cure or prevent any disease. Information reflects traditional use and is not a substitute for professional medical advice. Consult a healthcare practitioner before use, especially if pregnant, nursing, or on medication."*
2. **Ingredient list** (INCI where possible) — builds trust + E-E-A-T.
3. No disease name in **title, slug, category, image alt text, or meta description**.

---

## 3. Rewrite examples (real products)

**Mastic Gum Capsules**
- ❌ *"Stomach cancer. Colon cancer. Peptic ulcers… Diabetes. Hypertension. Kills Helicobacter Pylori… and more!"*
- ✅ *"Mastic gum is a natural tree resin from the Greek island of Chios, traditionally used to support digestive comfort. Our vegan capsules deliver 600 mg of pure mastic gum. Traditionally taken as part of a daily wellness routine."* + disclaimer.

**Ocotea Weight Loss Drops**
- ❌ *"Appetite suppressant. Anti-cancer. Diabetes. Menopause… Treats foot fungus. Cures candida."*
- ✅ *"A botanical drop blend traditionally used to support a healthy metabolism and everyday wellness as part of a balanced lifestyle."* + disclaimer. (Keep "weight" only as lifestyle-support framing, not a guaranteed outcome.)

**Herbal Skin Cancer Cream → reposition**
- ❌ Title *"Herbal Skin Cancer Cream"*; body *"Skin Cancer • Eczema • Psoriasis • Shingles."*
- ✅ Rename **"Herbal Skin Repair Balm"**; body *"A rich botanical balm with beeswax and herbal extracts to soothe, protect and comfort dry, rough or irritated skin."* + disclaimer. **All cancer references removed.**

---

## 4. Product rename list (needs Diana's sign-off)

The 31 disease-named products must be renamed. Suggested compliant names below — Diana confirms the real intended use, since some may need repositioning rather than a wording swap. Old→new slugs feed [`redirects.csv`](redirects.csv).

| Old name | Suggested name | Risk note |
|---|---|---|
| Herbal Skin Cancer Cream (4 sizes) | Herbal Skin Repair Balm | ⚠ Remove ALL cancer wording |
| Canna-Argan Skin Cancer Cream (4) | Canna-Argan Skin Repair Cream | ⚠ high |
| Canna-BEE Royale Skin Cancer Cream (4) | Canna-BEE Royale Repair Cream | ⚠ high |
| Canna Skin Cancer Serum (2) | Canna Skin Comfort Serum | ⚠ high |
| Anti-Cancer Serum (2) | Botanical Skin-Support Serum | ⚠ reposition; drop "anti-cancer" |
| Asthma Serum (2) | Breathe-Easy Chest Rub (aromatherapy) | ⚠ highest — consider discontinuing; no topical legally treats asthma |
| Arthritis Serum (2) | Joint & Muscle Warming Serum | soft structure/function only |
| Eczema Serum / Soap (3) | Soothing Serum / Soap for Dry, Irritated Skin | cosmetic framing |
| Menopause Serum / Soap (3) | Meno-Balance Body Serum / Soap | ⚠ confirm framing |
| Andropause Serum / Soap (3) | Men's Vitality Serum / Soap | ⚠ confirm framing |
| Anxiety-Stress Combo 1 & 2 | Calm & Unwind Combo 1 & 2 | wellness/aromatherapy framing |

Also rename category **"CANNAB!S Skin Care" → "Hemp Botanical Skincare"** (drop the obfuscated spelling; no medical claims).

---

## 5. How we execute (cheap + safe)

1. **Bulk pass (DeepSeek):** feed each flagged description + these rules to DeepSeek to produce a compliant rewrite. Covers the ~101 products fast.
2. **High-risk review (Claude + human):** the 31 renamed / cancer / asthma items get manual review — wording here carries real legal weight.
3. **Diana sign-off:** final names + any discontinuations.
4. **Apply during migration** — compliant copy is what gets loaded into the new store; the old claims never move across.

Reference data: [`compliance-hits.csv`](compliance-hits.csv) (every flagged snippet), [`catalogue-inventory.csv`](catalogue-inventory.csv).
