/** Navigation model per docs/nav-map.md — concern hubs + hero ranges. */

export type Concern = { slug: string; name: string; blurb: string };
export type Range = { slug: string; name: string };

export const CONCERNS: Concern[] = [
  { slug: "problem-skin", name: "Problem & Sensitive Skin", blurb: "Gentle botanical care for blemish-prone and reactive skin." },
  { slug: "anti-ageing", name: "Anti-Ageing", blurb: "Myrrh, neroli, collagen and saffron lines for firmer-feeling skin." },
  { slug: "weight-metabolism", name: "Weight & Metabolism", blurb: "Botanical support for a balanced, active lifestyle." },
  { slug: "cellulite-body", name: "Cellulite & Body", blurb: "Toning and smoothing body-care rituals." },
  { slug: "stress-hormones", name: "Stress, Sleep & Balance", blurb: "Calming blends for everyday wellbeing." },
  { slug: "detox-digestion", name: "Digestion & Detox", blurb: "Traditional resins and botanicals for daily wellness." },
  { slug: "baby-family", name: "Baby & Family", blurb: "Mild, kind formulations for the whole family." },
  { slug: "hair-nails", name: "Hair, Nails & Lashes", blurb: "Nourishing oils and serums from root to tip." },
  { slug: "mens", name: "Men's Care", blurb: "Beard, skin and vitality essentials for men." },
];

export const RANGES: Range[] = [
  { slug: "bulbinella", name: "Bulbinella" },
  { slug: "mastic-gum", name: "Mastic Gum" },
  { slug: "argan", name: "Argan Oil" },
  { slug: "collagen", name: "Collagen" },
  { slug: "myrrh", name: "Myrrh" },
  { slug: "neroli", name: "Neroli" },
  { slug: "lotus", name: "Lotus" },
  { slug: "saffron", name: "Saffron" },
  { slug: "royal-jelly", name: "Royal Jelly" },
  { slug: "vitamin-e", name: "Vitamin E" },
  { slug: "charcoal", name: "Charcoal" },
  { slug: "coffee", name: "Coffee" },
  { slug: "shilajit", name: "Shilajit" },
  { slug: "spekboom", name: "Spekboom" },
  { slug: "honey-bee", name: "Honey-Bee" },
  { slug: "bee-pink", name: "Bee-Pink" },
  { slug: "bee-flawless", name: "Bee-Flawless" },
  { slug: "hemp-skincare", name: "Hemp Botanicals" },
];

export function concernBySlug(slug: string): Concern | undefined {
  return CONCERNS.find((c) => c.slug === slug);
}

export function rangeBySlug(slug: string): Range | undefined {
  return RANGES.find((r) => r.slug === slug);
}

/** Shown on every product page + footer. Wording per docs/compliance-rules.md. */
export const DISCLAIMER =
  "This product is a natural cosmetic / complementary product. It is not intended to diagnose, treat, cure or prevent any disease. Information reflects traditional use and is not a substitute for professional medical advice. Consult a healthcare practitioner before use, especially if pregnant, nursing, or on medication.";
