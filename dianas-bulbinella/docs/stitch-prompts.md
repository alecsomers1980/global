# Stitch prompts — design directions for dianas.co.za

**Correction (2026-07-14 later):** generation DOES work via MCP — the call times out
at the transport but the job registers server-side and renders 10min–hours later.
Fire once, then poll `list_screens`. Never retry the generate call (creates duplicates).
Project: **"Dianas Bulbinella — Design Directions"** (id 11385241282696384227).
Rendered screenshots saved in `docs/stitch-screens/`; gallery artifact:
https://claude.ai/code/artifact/1d16c323-68bd-4e7c-b35a-05f3847a1fe0

## Round 2 (2026-07-14) — user brief: white product backgrounds, modern animated feel
Reference sites the user likes: shoez.webflow.io, ego-flavoury-tmpl.webflow.io,
aurae-temlis.webflow.io → white bg, huge type (56–72px), one strong accent,
rounded cards, marquee strips, hover-lift/scroll-reveal motion.
Three prompts fired (Gemini 3.1 Pro, DESKTOP), awaiting render:
1. **Pure Vitality** — Ritual-like clean science-wellness; white, green accent #2E7D4F, sage tint blocks, marquee strip, white product cards.
2. **Fresh Energy** — FLAVOURY-like vibrant commerce; white + coral #E8622C CTAs + pastel color-block category panels, ticker marquee, quick-add.
3. **Aurae Glow** — Aurae-like premium modern; white with aurora gradient glows, glassmorphism cards, italic serif accent word, gold-green gradients.
(Full prompt text lives in the conversation; regenerate variants via `generate_variants` on the rendered screens.)

## Round 1 prompts (all rendered)

These mirror the three Claude-designed mockups:
https://claude.ai/code/artifact/9ed608e5-9ce2-4ff8-9605-e6cd497b97f1

---

## 1 · Herbarium (warm botanical apothecary)

E-commerce homepage for "Diana's Bulbinella", a South African natural skincare and wellness brand (handmade creams, serums, soaps, weight-loss and health products). Design direction: "Herbarium" — warm botanical apothecary. Cream paper background (#F5F2E9), deep forest green (#1C3D2B), amber accent (#C0842A), elegant serif headlines, clean sans body. Sections: top nav with italic serif logo "Diana's BULBINELLA" and links Shop, Concerns, Ranges, Specials, Our Story, basket icon; hero with eyebrow "HANDMADE IN WHITE RIVER · SINCE 2012", headline "The quiet power of South African botanicals.", two pill buttons (dark green primary "Shop the range", outlined "Our story"), botanical illustration of an aloe-like plant with amber flower spike on the right; a thin stats band (250+ natural products, dealers nationwide, cruelty-free, 14 years of craft); "Shop by concern" grid of 6 cards (Problem Skin, Anti-Ageing, Weight & Metabolism, Digestion & Detox, Baby & Family, Men's Care); bestsellers row of 4 product cards with cream jars/amber bottles, prices in Rand (R390, R80 on sale from R110, R900, R40); founder quote section on dark green with italic serif quote from Diana Herbst. Calm, editorial, premium heritage feel. No stock-photo people.

## 2 · Vital (fresh modern wellness commerce)

E-commerce homepage for "Diana's Bulbinella", a South African natural skincare and wellness online shop (366 handmade products: creams, serums, soaps, weight-loss, health). Design direction: "Vital" — fresh modern wellness commerce. White background, soft sage green (#E8F0E4) surfaces, energetic coral (#E86A4C) CTAs, deep green text (#17301F), bold geometric sans typography, very rounded corners (24px+), pill-shaped chips. Sections: slim dark-green promo bar "JULY SPECIALS ARE LIVE — save up to 30%"; nav with bold logo "Diana's.", large rounded search bar "Search 366 natural products…", Account and Basket links; horizontal scrollable category chips (On sale, Skin concerns, Anti-ageing, Weight & metabolism, Soaps, Serums, Baby & family, Men); big rounded hero card with sage-to-cream gradient, pill badge "New: July specials just dropped", headline "Feel good in your skin, naturally.", coral button "Shop bestsellers", link "Take the skin quiz", product jar photo on a peach circular blob with floating rating badge "4.9 stars, 1200+ customers"; trust row with checkmarks (Handmade in SA, Cruelty-free, Dealers nationwide); "Bestsellers this week" grid of 4 product cards with star ratings, Rand prices (R80 sale from R110, R900, R140, R1050) and round + quick-add buttons; dark green banner "Never run out of your favourites" about replenishment reminder emails with coral button. Friendly, fast, conversion-focused health store.

## 3 · Veld Luxe (dark premium heritage)

E-commerce homepage for "Diana's Bulbinella", a South African botanical skincare brand. Design direction: "Veld Luxe" — dark premium heritage luxury. Near-black green background (#0D1611), champagne gold accents (#D4AF6A), ivory text (#EFEAD8), high-fashion serif (Didot/Bodoni style) with italic emphasis, uppercase letter-spaced sans labels, thin gold rules, generous symmetric spacing. Sections: thin centered top line "EST. 2012 · WHITE RIVER · MPUMALANGA" in gold letterspaced caps; symmetric nav with links left (SHOP, RANGES, CONCERNS), centered stacked logo "DIANA'S / BULBINELLA", links right (STORY, DEALERS, BASKET); centered hero with gold eyebrow "SOUTH AFRICAN BOTANICAL CRAFT", huge serif headline "Where the veld meets the vanity table." with italic gold phrase, supporting paragraph, two buttons (solid gold "DISCOVER THE RANGE", outlined gold "OUR HERITAGE"); "The Edit — This season's essentials" three product cards on very dark green panels with thin gold borders, amber serum bottles and cream jars lit dramatically like perfume adverts, gold Rand prices (R900, R390, R1050); heritage stats row (2012 founded, 250+ products, 9+ provinces) in gold serif numerals; centered italic pull quote from founder Diana Herbst with gold letterspaced attribution. Moody, luxurious, editorial — Chanel of botanicals.
