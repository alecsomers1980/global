/**
 * Rehoboth catalogue data — the single source for both the seed and the
 * compliance scan, so copy can never be screened in one place and written
 * from another.
 *
 * Prices come from "Product Distribution Price List.pdf":
 *   price_retail = the "Possible Total Price 30%" column
 *   price_trade  = the "Distr. Shop Min of 10" column
 *
 * Barcodes are EAN-13, read from the client's barcode artwork
 * (6 + 006010 + 6 digits). Tinctures have no barcode assigned yet.
 *
 * Copy here is deliberately claim-free — see src/lib/compliance.ts and
 * docs/label-claims-note-for-client.md.
 */

const STORAGE = "Store in a cool dry place in an airtight container.";
const CAPS_DIRECTIONS = "Take 2–3 capsules daily.";

export const PRODUCTS = [
  {
    slug: "artemisia-annua-a3",
    name: "Artemisia Annua A3",
    botanical_name: "Artemisia annua (Anamed A-3)",
    accent_hex: "#517C00",
    sort_order: 1,
    summary:
      "The A-3 variety of sweet annie, grown, shade-dried and milled whole at Rehoboth Farm.",
    traditional_use:
      "Artemisia annua has a long history of traditional use as a bitter aromatic herb, most often taken as a tea or in capsule form. The A-3 selection is the variety cultivated at Low's Creek.",
    ingredients: "100% Artemisia annua (A-3) leaf. Nothing else added.",
    directions: CAPS_DIRECTIONS,
    storage: STORAGE,
    variants: [
      { format: "powder",   size_label: "150 g",  price_retail: 217, price_trade: 167, barcode: "6006010100017", sort_order: 1 },
      { format: "capsules", size_label: "90",     price_retail: 279, price_trade: 215, barcode: "6006010100024", sort_order: 2 },
      { format: "bulk",     size_label: "1 kg",   price_retail: 984, price_trade: 757, barcode: "6006010100031", sort_order: 3 },
      { format: "ointment", size_label: "50 ml",  price_retail: 260, price_trade: 200, barcode: "6006010100048", sort_order: 4 },
      { format: "oil",      size_label: "Oil",    price_retail: 260, price_trade: 200, barcode: "6006010100055", sort_order: 5 },
    ],
  },
  {
    slug: "artemisia-afra",
    name: "Artemisia Afra",
    botanical_name: "Artemisia afra",
    accent_hex: "#727A75",
    sort_order: 2,
    summary:
      "Wilde-als — one of the most widely used traditional herbs in southern Africa.",
    traditional_use:
      "Known in Afrikaans as wilde-als, Artemisia afra is among the oldest and best-known herbs in South African traditional use. It is strongly aromatic and characteristically bitter.",
    ingredients: "100% Artemisia afra leaf. Nothing else added.",
    directions: CAPS_DIRECTIONS,
    storage: STORAGE,
    variants: [
      { format: "powder",   size_label: "150 g", price_retail: 177, price_trade: 136, barcode: "6006010200014", sort_order: 1 },
      { format: "capsules", size_label: "90",    price_retail: 242, price_trade: 186, barcode: "6006010200021", sort_order: 2 },
      { format: "bulk",     size_label: "1 kg",  price_retail: 902, price_trade: 694, barcode: "6006010200038", sort_order: 3 },
    ],
  },
  {
    slug: "moringa-oleifera",
    name: "Moringa Oleifera",
    botanical_name: "Moringa oleifera",
    accent_hex: "#2B4E17",
    sort_order: 3,
    summary:
      "Moringa leaf, hand-stripped from the tree and shade-dried before milling.",
    traditional_use:
      "Moringa oleifera is grown widely across Africa and Asia and has a long history of traditional use as a food plant. The leaf is hand-stripped at Rehoboth Farm, shade-dried, then milled.",
    ingredients: "100% Moringa oleifera leaf. Nothing else added.",
    directions: CAPS_DIRECTIONS,
    storage: STORAGE,
    variants: [
      { format: "powder",   size_label: "150 g", price_retail: 136, price_trade: 105, barcode: "6006010300011", sort_order: 1 },
      { format: "capsules", size_label: "90",    price_retail: 130, price_trade: 100, barcode: "6006010300028", sort_order: 2 },
      { format: "bulk",     size_label: "1 kg",  price_retail: 615, price_trade: 473, barcode: "6006010300035", sort_order: 3 },
      { format: "ointment", size_label: "50 ml", price_retail: 260, price_trade: 200, barcode: "6006010300042", sort_order: 4 },
      { format: "oil",      size_label: "Oil",   price_retail: 260, price_trade: 200, barcode: "6006010300059", sort_order: 5 },
    ],
  },
  {
    slug: "turmeric-with-pepper",
    name: "Turmeric with Pepper",
    botanical_name: "Curcuma longa with Piper nigrum",
    accent_hex: "#E3923A",
    sort_order: 4,
    summary:
      "Turmeric root milled with black pepper — the traditional pairing, for better absorption.",
    traditional_use:
      "Turmeric has been used as a culinary and traditional herb for centuries, and is traditionally combined with black pepper.",
    ingredients: "Curcuma longa root, Piper nigrum (black pepper). Nothing else added.",
    directions: CAPS_DIRECTIONS,
    storage: STORAGE,
    variants: [
      { format: "powder",   size_label: "150 g", price_retail: 182, price_trade: 140, barcode: "6006010400018", sort_order: 1 },
      { format: "capsules", size_label: "90",    price_retail: 195, price_trade: 150, barcode: "6006010400025", sort_order: 2 },
    ],
  },
  {
    slug: "rosemary",
    name: "Rosemary",
    botanical_name: "Salvia rosmarinus",
    accent_hex: "#649D82",
    sort_order: 5,
    summary: "Aromatic rosemary leaf, grown on the farm and milled fine.",
    traditional_use:
      "Rosemary is one of the oldest culinary and aromatic herbs in continuous use, valued for its resinous scent and distinctive flavour.",
    ingredients: "100% Salvia rosmarinus leaf. Nothing else added.",
    directions: CAPS_DIRECTIONS,
    storage: STORAGE,
    variants: [
      { format: "powder",   size_label: "150 g", price_retail: 208, price_trade: 160, barcode: "6006010500015", sort_order: 1 },
      { format: "capsules", size_label: "90",    price_retail: 221, price_trade: 170, barcode: "6006010500022", sort_order: 2 },
    ],
  },
  {
    slug: "neem",
    name: "Neem Ointment",
    botanical_name: "Azadirachta indica",
    accent_hex: "#6C8781",
    sort_order: 6,
    summary: "Neem in a 50 g ointment base, for external use.",
    traditional_use:
      "Neem has a long history of traditional topical use in India and across Africa. This is a simple ointment for external use.",
    ingredients: "Azadirachta indica (neem) in an ointment base.",
    directions: "For external use. Apply a small amount to the skin as needed.",
    storage: STORAGE,
    variants: [
      { format: "ointment", size_label: "50 g", price_retail: 260, price_trade: 200, barcode: "6006010700019", sort_order: 1 },
    ],
  },
  {
    slug: "lip-balm",
    name: "Lip Balm",
    botanical_name: null,
    accent_hex: "#6C8781",
    sort_order: 7,
    summary: "A simple 10 g balm that softens and conditions the lips.",
    traditional_use: null,
    ingredients: "[INGREDIENT LIST — from label artwork, pending]",
    directions: "Apply to the lips as often as needed.",
    storage: STORAGE,
    variants: [
      { format: "balm", size_label: "10 g", price_retail: 52, price_trade: 40, barcode: "6006010600012", sort_order: 1 },
    ],
  },
  {
    slug: "boerseep",
    name: "Boerseep",
    botanical_name: null,
    accent_hex: "#6C8781",
    sort_order: 8,
    summary: "Traditional South African farm soap, cut into 150–170 g bars.",
    traditional_use:
      "Boerseep is the plain, hard-milled farm soap of South African tradition — made simply, and used for everything.",
    ingredients: "[INGREDIENT LIST — from label artwork, pending]",
    directions: "For external use. Cleanses the skin.",
    storage: "Keep dry between uses.",
    variants: [
      { format: "bar", size_label: "150–170 g", price_retail: 60, price_trade: 46, barcode: "6006010800016", sort_order: 1 },
    ],
  },
  {
    slug: "tinctures",
    name: "Tincture",
    botanical_name: null,
    accent_hex: "#6C8781",
    sort_order: 9,
    summary: "A 30 ml herbal tincture.",
    traditional_use: null,
    // Open question 7 in the spec: which botanical(s), and is a barcode coming?
    ingredients: "[BOTANICAL — client to confirm which plant(s)]",
    directions: "[DOSAGE — client to confirm]",
    storage: STORAGE,
    variants: [
      { format: "tincture", size_label: "30 ml", price_retail: 150, price_trade: 135, barcode: null, sort_order: 1 },
    ],
  },
];
