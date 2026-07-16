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
  /** null = price not yet confirmed by the client; show as POA. */
  price: number | null;
  note?: string;
};

/**
 * Wendy-House.pdf — "EXTRAS & OPTIONS".
 * The option names are confirmed; the price column did not survive PDF extraction.
 * Every price is intentionally null pending confirmation from Linda (083 647 0473).
 */
export const EXTRAS: Extra[] = [
  { id: "termite", label: "Termite poison applied under the Wendy at construction", price: null },
  { id: "window-nd2", label: "Additional ND2 pine window (1112w × 808h)", price: null },
  { id: "burglar-bars", label: "Burglar bars for ND windows", price: null, note: "Per opening" },
  { id: "extra-door", label: "Additional Wendy-style door in panel", price: null },
  { id: "serving-flap", label: "Serving flap — front panel opens to a serving counter", price: null },
  { id: "stable-door", label: "Convert Wendy-style door to a stable door", price: null },
];

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
};

/**
 * Frame-Built.pdf. Prices include VAT @ 15% and construction; delivery quoted by site.
 * Building only — electrics and plumbing excluded.
 *
 * Two rows have gaps the source PDF did not render cleanly. Left null deliberately.
 */
export const FRAME_BUILT: FrameBuiltModel[] = [
  { slug: "6x6-one-bedroom", size: "6 × 6 m", area: 36, bedrooms: 1, log: 168668, chromadek: 183286, nutec: 209899 },
  { slug: "6x7-2-one-bedroom", size: "6 × 7.2 m", area: 43.2, bedrooms: 1, log: 201355, chromadek: 219560, nutec: 251601 },
  { slug: "6x9-two-bedroom", size: "6 × 9 m", area: 54, bedrooms: 2, log: 243870, chromadek: 265525, nutec: 301930 },
  { slug: "7-6x7-6-two-bedroom", size: "7.6 × 7.6 m", area: 57.76, bedrooms: 2, log: 253873, chromadek: 276698, nutec: 315170 },
  { slug: "6x12-three-bedroom", size: "6 × 12 m", area: 72, bedrooms: 3, log: 313480, chromadek: null, nutec: 388455 },
  { slug: "7-6x12-three-bedroom", size: "7.6 × 12 m", area: 91.2, bedrooms: 3, log: null, chromadek: 422767, nutec: null },
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
 * Wendy-House-large-layout.pdf — the three build tiers.
 *
 * ⚠ Prices are withheld on purpose. The source PDF's table lost the size↔price mapping,
 * so the four recovered price sets cannot be safely attributed to sizes:
 *   64610/89810/120240 · 71440/95640/135180 · 98805/131685/185350 · 124065/164625/224290
 * Publishing a guess here would misquote a customer. Confirm with the client, then add sizes.
 * See docs/PROJECT_PLAN.md §4e.
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

/** Format a rand amount the way the client's own price lists do. */
export function formatRand(amount: number): string {
  return `R${amount.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

/** Display helper: a confirmed price, or POA when the figure isn't verified. */
export function priceOrPOA(amount: number | null): string {
  return amount === null ? "POA" : formatRand(amount);
}
