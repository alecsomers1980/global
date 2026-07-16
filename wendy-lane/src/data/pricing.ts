/**
 * Wendy Lane — price data.
 *
 * Source: the client's own published price lists at wozawendylane.co.za/downloads/
 * (Wendy-House.pdf dated May 2026, Frame-Built.pdf, Wendy-House-large-layout.pdf).
 *
 * All published prices INCLUDE VAT @ 15%. Do not add VAT on top.
 *
 * A `null` price means the figure is not confirmed. Render those as "POA" and exclude
 * them from any total — never substitute an estimate. See docs/PROJECT_PLAN.md §8.
 */

export const VAT_RATE = 0.15;

/** Prices last confirmed from the client's published list. */
export const PRICE_LIST_DATE = "May 2026";

export type WindowType = "ND1" | "ND2";

export type WendySize = {
  code: string;
  /** Front width in metres. */
  front: number;
  /** Side depth in metres. */
  side: number;
  /** Door, no window. */
  priceNoWindow: number;
  /** Window fitted when the one-window option is taken. */
  windowType: WindowType;
  priceOneWindow: number;
};

/** Wendy-House.pdf — "PRODUCT PRICE LIST". Verified. */
export const WENDY_SIZES: WendySize[] = [
  { code: "W1515", front: 1.5, side: 1.36, priceNoWindow: 7300, windowType: "ND1", priceOneWindow: 8100 },
  { code: "W1818", front: 1.8, side: 1.66, priceNoWindow: 8720, windowType: "ND1", priceOneWindow: 9600 },
  { code: "W1824", front: 2.4, side: 1.66, priceNoWindow: 9720, windowType: "ND1", priceOneWindow: 10600 },
  { code: "W2424", front: 2.4, side: 2.26, priceNoWindow: 11320, windowType: "ND1", priceOneWindow: 12200 },
  { code: "W2430", front: 3.0, side: 2.26, priceNoWindow: 14820, windowType: "ND1", priceOneWindow: 15700 },
  { code: "W3030", front: 3.0, side: 2.86, priceNoWindow: 15320, windowType: "ND1", priceOneWindow: 16200 },
  { code: "W3042", front: 4.2, side: 2.86, priceNoWindow: 19620, windowType: "ND1", priceOneWindow: 20500 },
  { code: "W3642", front: 4.2, side: 3.46, priceNoWindow: 22050, windowType: "ND2", priceOneWindow: 23700 },
  { code: "W3648", front: 4.8, side: 3.46, priceNoWindow: 24150, windowType: "ND2", priceOneWindow: 25800 },
  { code: "W3060", front: 6.0, side: 2.86, priceNoWindow: 25950, windowType: "ND2", priceOneWindow: 27600 },
  { code: "W3660", front: 6.0, side: 3.46, priceNoWindow: 29950, windowType: "ND2", priceOneWindow: 31600 },
];

export type Veranda = {
  code: string;
  front: number;
  side: number;
  price: number;
};

/** Wendy-House.pdf — "VERANDAS". All 1.2m deep. Verified. */
export const VERANDAS: Veranda[] = [
  { code: "V15", front: 1.5, side: 1.2, price: 3200 },
  { code: "V18", front: 1.8, side: 1.2, price: 3600 },
  { code: "V24", front: 2.4, side: 1.2, price: 4500 },
  { code: "V30", front: 3.0, side: 1.2, price: 5300 },
  { code: "V42", front: 4.2, side: 1.2, price: 7500 },
  { code: "V48", front: 4.8, side: 1.2, price: 9100 },
  { code: "V60", front: 6.0, side: 1.2, price: 11100 },
];

export type Extra = {
  id: string;
  label: string;
  /** null = price not confirmed; show as POA and exclude from totals. */
  price: number | null;
  note?: string;
};

/**
 * Wendy-House.pdf — "EXTRAS & OPTIONS".
 * Read directly off the rendered price-list artwork (the PDF has no text layer).
 */
export const EXTRAS: Extra[] = [
  { id: "window-nd1", label: "ND1 pine window", price: 880, note: "568w × 808h" },
  { id: "window-nd2", label: "ND2 pine window", price: 1650, note: "1112w × 808h" },
  { id: "burglar-bars", label: "Burglar bars for ND windows", price: 430, note: "Per opening" },
  { id: "extra-door", label: "Additional Wendy-style door in panel", price: 490 },
  { id: "stable-door", label: "Convert Wendy-style door to a stable door", price: 300 },
  {
    id: "serving-flap",
    label: "Serving flap",
    price: 770,
    note: "Wendy front with flap opening as a serving counter",
  },
];

/**
 * Included in every Wendy House — these are selling points, not paid extras.
 * (Termite poison sits in the price list's feature band, not the options table.)
 */
export const STANDARD_FEATURES: string[] = [
  "All prices include VAT @ 15%",
  "Termite poison applied under the Wendy at time of construction",
  "Outside walls coated with wood sealant",
];

/** Stated on the price list — worth being upfront about. */
export const MAINTENANCE_NOTE = "Annual re-coating required.";

/** Delivery is quoted per site. Never estimate it. */
export const DELIVERY_NOTE = "Delivery fee is quoted according to your area.";

export type FrameBuiltModel = {
  slug: string;
  size: string;
  /** Square metres. */
  area: number;
  bedrooms: number;
  /** Log home with knotty-pine internal wall lining. */
  log: number | null;
  /** Chromadek cladding with dry walling. */
  chromadek: number | null;
  /** Nutec cladding with dry walling. */
  nutec: number | null;
  /** As named on the PDF, e.g. "One Bedroom Chalet". */
  name: string;
  /** Floor-plan drawing, rendered from the source PDF. */
  plan: string;
  /** Room breakdown printed on the plan. */
  rooms: string[];
};

/**
 * Frame-Built.pdf (dated 01/02/2026). Prices include VAT @ 15% and construction;
 * delivery quoted by site. Building only — electrics and plumbing excluded.
 * Every figure and room breakdown read off the rendered PDF pages.
 */
export const FRAME_BUILT: FrameBuiltModel[] = [
  {
    slug: "6x6-one-bedroom", name: "One Bedroom Chalet", size: "6 × 6 m", area: 36, bedrooms: 1,
    log: 168668, chromadek: 183286, nutec: 209899,
    plan: "/images/plans/frame-6x6-one-bedroom.png",
    rooms: ["Kitchen 8m²", "Living 7.5m²", "Bedroom 12m²", "Bathroom 4m²", "Covered veranda 4.5m²"],
  },
  {
    slug: "6x7-2-one-bedroom", name: "One Bedroom Chalet", size: "6 × 7.2 m", area: 43.2, bedrooms: 1,
    log: 201355, chromadek: 219560, nutec: 251601,
    plan: "/images/plans/frame-6x7-2-one-bedroom.png",
    rooms: ["Kitchen 7.2m²", "Living 14.76m²", "Bedroom 12.6m²", "Bathroom 5.28m²", "Covered veranda 5.76m²"],
  },
  {
    slug: "6x9-two-bedroom", name: "Two Bedroom Chalet", size: "6 × 9 m", area: 54, bedrooms: 2,
    log: 243870, chromadek: 265525, nutec: 301930,
    plan: "/images/plans/frame-6x9-two-bedroom.png",
    rooms: ["Kitchen 7.28m²", "Living 17.36m²", "2 × Bedroom 10.2m²", "Bathroom 5.04m²", "Covered veranda 3.92m²"],
  },
  {
    slug: "7-6x7-6-two-bedroom", name: "Two Bedroom Chalet", size: "7.6 × 7.6 m", area: 57.76, bedrooms: 2,
    log: 253873, chromadek: 276698, nutec: 315170,
    plan: "/images/plans/frame-7-6x7-6-two-bedroom.png",
    rooms: ["Kitchen 10.64m²", "Living 12.62m²", "Bedroom 11.4m²", "Bedroom 10.64m²", "Bathroom 4.86m²", "Covered veranda 7.6m²"],
  },
  {
    slug: "6x12-three-bedroom", name: "Three Bedroom Chalet", size: "6 × 12 m", area: 72, bedrooms: 3,
    log: 313480, chromadek: 341950, nutec: 388455,
    plan: "/images/plans/frame-6x12-three-bedroom.png",
    rooms: ["Living 12.62m²", "2 × Bedroom 9m²", "Bedroom 14m²", "Bathroom 4.8m²", "Covered veranda 3m²"],
  },
  {
    slug: "7-6x12-three-bedroom", name: "Three Bedroom Chalet", size: "7.6 × 12 m", area: 91.2, bedrooms: 3,
    log: 386979, chromadek: 422767, nutec: 479037,
    plan: "/images/plans/frame-7-6x12-three-bedroom.png",
    rooms: ["Kitchen & dining 20.88m²", "Living 18m²", "Bedroom 14m²", "2 × Bedroom 11.4m²", "2 × Bathroom", "Dressing area 3.6m²", "Covered veranda 4m²"],
  },
];

/** Frame-Built.pdf — standard inclusions, shared across every model. */
export const FRAME_BUILT_INCLUSIONS: string[] = [
  "Post and bearer base to a max of 1m off ground, with one set of steps",
  "38/114 timber floor joists",
  "22mm tongue & groove pine floor inside, 22mm decking on veranda",
  "2.7m high timber frame walls, optional exterior cladding, dry wall or knotty pine interior lining",
  "30mm white Isoboard ceiling, flat under roof trusses",
  "0.4 heavy duty galvanised corrugated roof sheeting",
  "Barge boards on gable ends",
  "Aluminium framed windows",
];

export const FRAME_BUILT_EXCLUSIONS: string[] = [
  "Electrics and plumbing are excluded",
  "Furniture, fittings and sanitary ware are illustrative only and not included",
  "Delivery is quoted according to site location",
];

/**
 * Wendy-House-large-layout.pdf — three build tiers across four layouts.
 *
 * The tier specs come from the PDF's text layer. The layout names, sizes and the
 * size↔price mapping were read off the four floor-plan drawings, each of which sits
 * directly above its own price row in the PDF's 2×2 grid:
 *   top-left  Open work space / classroom  ·  top-right One bedroom unit
 *   bottom-left Two bedroom unit           ·  bottom-right Three bedroom unit
 */
export type LargeLayoutTier = {
  id: "standard" | "signature" | "premium";
  name: string;
  spec: string[];
};

export const LARGE_LAYOUT_TIERS: LargeLayoutTier[] = [
  {
    id: "standard",
    name: "Standard Range",
    spec: [
      "Post & bearer base to a max of 1.0m off ground, one set of steps",
      "22mm tongue & groove flooring",
      "2.1m high walls, knotty pine fixed vertically to horizontal timber beams",
      "Wendy-style doors",
      "Cottage-pane pine framed windows",
      "Heavy duty galvanised corrugated roof sheeting",
    ],
  },
  {
    id: "signature",
    name: "Signature Range",
    spec: [
      "Post & bearer base to a max of 1.0m off ground, one set of steps",
      "22mm tongue & groove flooring",
      "2.4m high walls, knotty pine fixed vertically to horizontal timber beams",
      "Wendy-style doors",
      "Cottage-pane pine framed windows",
      "Ceiling following the roof line",
      "Heavy duty galvanised corrugated roof sheeting",
    ],
  },
  {
    id: "premium",
    name: "Premium Range",
    spec: [
      "Post & bearer base to a max of 1.0m off ground, one set of steps",
      "Knotty pine tongue & groove flooring",
      "2.4m high DOUBLE SKIN walls, knotty pine fixed vertically to horizontal timber beams",
      "Hollow-core cottage internal doors",
      "1.8m aluminium sliding door",
      "Aluminium framed top-hung windows",
      "Ceiling following the roof line",
      "Heavy duty galvanised corrugated roof sheeting",
      "Barge boards to gable ends",
    ],
  },
];

export type LargeLayout = {
  slug: string;
  name: string;
  /** e.g. "6 x 6m" */
  size: string;
  /** Square metres. */
  area: number;
  /** Floor-plan drawing extracted from the source PDF. */
  plan: string;
  /** Notable features called out on the plan. */
  features: string[];
  prices: { standard: number; signature: number; premium: number };
};

/** Wendy-House-large-layout.pdf — the four layouts, each priced across all three tiers. */
export const LARGE_LAYOUTS: LargeLayout[] = [
  {
    slug: "open-workspace-classroom",
    name: "Open work space / classroom",
    size: "6 x 6m",
    area: 36,
    plan: "/images/plans/open-workspace-classroom.png",
    features: ["Single open span", "Roof gable support", "Double door", "3 × ND2 windows"],
    prices: { standard: 64610, signature: 89810, premium: 120240 },
  },
  {
    slug: "one-bedroom-unit",
    name: "One bedroom unit",
    size: "6 x 6m",
    area: 36,
    plan: "/images/plans/one-bedroom-unit.png",
    features: ["One bedroom", "Covered veranda (3.0 × 1.86m)", "Wendy-style internal doors"],
    prices: { standard: 71440, signature: 95640, premium: 135180 },
  },
  {
    slug: "two-bedroom-unit",
    name: "Two bedroom unit",
    size: "6 x 8m",
    area: 48,
    plan: "/images/plans/two-bedroom-unit.png",
    features: ["Two bedrooms", "Covered veranda (3.0 × 1.5m)", "Open living area"],
    prices: { standard: 98805, signature: 131685, premium: 185350 },
  },
  {
    slug: "three-bedroom-unit",
    name: "Three bedroom unit",
    size: "6 x 10m",
    area: 60,
    plan: "/images/plans/three-bedroom-unit.png",
    features: ["Three bedrooms", "Covered veranda", "Open living area"],
    prices: { standard: 124065, signature: 164625, premium: 224290 },
  },
];

/** Format a rand amount the way the client's own price lists do. */
export function formatRand(amount: number): string {
  return `R${amount.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

/** Display helper: a confirmed price, or POA when the figure isn't verified. */
export function priceOrPOA(amount: number | null): string {
  return amount === null ? "POA" : formatRand(amount);
}
