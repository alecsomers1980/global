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

export type VariantFormat =
  | "powder" | "capsules" | "bulk" | "ointment" | "oil" | "bar" | "tincture" | "balm";

export type SeedVariant = {
  format: VariantFormat;
  size_label: string;
  price_retail: number;
  price_trade: number;
  barcode: string | null;
  sort_order: number;
  /** Stem of a repo photo (/products/<name>); optional. */
  image_url?: string;
  /** Per-size wording; omitted means inherit the product's. */
  summary?: string;
  traditional_use?: string;
};

export type SeedProduct = {
  slug: string;
  name: string;
  botanical_name: string | null;
  accent_hex: string;
  sort_order: number;
  summary: string;
  traditional_use: string | null;
  ingredients: string;
  directions: string;
  storage: string;
  variants: SeedVariant[];
};


const STORAGE = "Store in a cool dry place in an airtight container.";
const CAPS_DIRECTIONS = "Take 2–3 capsules daily.";

export const PRODUCTS: SeedProduct[] = [
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
      { format: "powder",   size_label: "150 g",  price_retail: 217, price_trade: 167, barcode: "6006010100017", sort_order: 1, image_url: "/products/powder-a3" },
      { format: "capsules", size_label: "90",     price_retail: 279, price_trade: 215, barcode: "6006010100024", sort_order: 2, image_url: "/products/capsules-a3" },
      { format: "bulk",     size_label: "1 kg",   price_retail: 984, price_trade: 757, barcode: "6006010100031", sort_order: 3 },
      { format: "ointment", size_label: "50 ml",  price_retail: 260, price_trade: 200, barcode: "6006010100048", sort_order: 4, image_url: "/products/ointment-artemisia" },
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
      { format: "powder",   size_label: "150 g", price_retail: 177, price_trade: 136, barcode: "6006010200014", sort_order: 1, image_url: "/products/powder-afra" },
      { format: "capsules", size_label: "90",    price_retail: 242, price_trade: 186, barcode: "6006010200021", sort_order: 2, image_url: "/products/capsules-afra" },
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
      { format: "powder",   size_label: "150 g", price_retail: 136, price_trade: 105, barcode: "6006010300011", sort_order: 1, image_url: "/products/powder-moringa" },
      { format: "capsules", size_label: "90",    price_retail: 130, price_trade: 100, barcode: "6006010300028", sort_order: 2, image_url: "/products/capsules-moringa" },
      { format: "bulk",     size_label: "1 kg",  price_retail: 615, price_trade: 473, barcode: "6006010300035", sort_order: 3 },
      { format: "ointment", size_label: "50 ml", price_retail: 260, price_trade: 200, barcode: "6006010300042", sort_order: 4, image_url: "/products/ointment-moringa" },
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
      { format: "powder",   size_label: "150 g", price_retail: 182, price_trade: 140, barcode: "6006010400018", sort_order: 1, image_url: "/products/powder-turmeric" },
      { format: "capsules", size_label: "90",    price_retail: 195, price_trade: 150, barcode: "6006010400025", sort_order: 2, image_url: "/products/capsules-turmeric" },
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
      { format: "powder",   size_label: "150 g", price_retail: 208, price_trade: 160, barcode: "6006010500015", sort_order: 1, image_url: "/products/powder-rosemary" },
      { format: "capsules", size_label: "90",    price_retail: 221, price_trade: 170, barcode: "6006010500022", sort_order: 2, image_url: "/products/capsules-rosemary" },
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
      { format: "ointment", size_label: "50 g", price_retail: 260, price_trade: 200, barcode: "6006010700019", sort_order: 1, image_url: "/products/ointment-neem" },
    ],
  },
  {
    slug: "lip-balm",
    name: "Lip Balm",
    botanical_name: null,
    accent_hex: "#6C8781",
    sort_order: 7,
    summary: "A simple 10 g balm that softens and conditions the lips — marula or spearmint.",
    traditional_use: null,
    ingredients: "[INGREDIENT LIST — from label artwork, pending]",
    directions: "Apply to the lips as often as needed.",
    storage: STORAGE,
    // Marula and Spearmint are both photographed in the client's own product
    // shots. Only one Lip Balm barcode exists (6006010600012) — see open
    // question in docs: does each scent need its own?
    variants: [
      { format: "balm", size_label: "Marula · 10 g",    price_retail: 52, price_trade: 40, barcode: null, sort_order: 1, image_url: "/products/lip-balm-marula",
        summary: "Handmade lip balm infused with Amarula fruit, known for its rich natural oils. Moisturises and protects dry or chapped lips, with natural antioxidants and vitamins from the fruit, for softness, elasticity and long-lasting hydration." },
      { format: "balm", size_label: "Spearmint · 10 g", price_retail: 52, price_trade: 40, barcode: null,            sort_order: 2, image_url: "/products/lip-balm-spearmint",
        summary: "Handmade lip balm infused with cooling spearmint. Moisturises and protects dry or chapped lips, with a refreshing sensation from natural spearmint oil and long-lasting hydration for soft, smooth lips." },
    ],
  },
  {
    slug: "boerseep",
    name: "Boerseep",
    botanical_name: null,
    accent_hex: "#6C8781",
    sort_order: 8,
    summary: "Traditional South African farm soap, cut into 150–170 g bars — in twelve scents and blends.",
    traditional_use:
      "Boerseep is the plain, hard-milled farm soap of South African tradition — made simply, and used for everything.",
    ingredients: "[INGREDIENT LIST — from label artwork, pending]",
    directions: "For external use. Cleanses the skin.",
    storage: "Keep dry between uses.",
    // Twelve varieties, from the client's own list and renders. Only one Boerseep
    // barcode exists (6006010800016) and which variety it belongs to is an open
    // question for the client — left unassigned rather than guessed.
    variants: [
      { format: "bar", size_label: "Artemisia · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 1,
        image_url: "/products/boerseep-artemisia",
        summary: "Natural herbal soap made with Artemisia afra (African wormwood), with a fresh, earthy fragrance. Gentle enough for daily use on skin and hands.",
        traditional_use: "Artemisia afra is a traditional African herb long valued for its soothing, aromatic character." },
      { format: "bar", size_label: "Rosemary · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 2,
        image_url: "/products/boerseep-rosemary",
        summary: "Natural herbal soap infused with Rosmarinus officinalis (rosemary): a crisp, refreshing aroma and a gentle cleanse.",
        traditional_use: "Rosemary is traditionally appreciated for its clean, stimulating scent." },
      { format: "bar", size_label: "Lavender · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 3,
        image_url: "/products/boerseep-lavender",
        summary: "Handcrafted with Lavandula angustifolia (lavender): a soft floral fragrance and a gentle cleansing touch.",
        traditional_use: "Lavender is traditionally valued for its calming scent and gentle character." },
      { format: "bar", size_label: "Moringa · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 4,
        image_url: "/products/boerseep-moringa",
        summary: "Made with Moringa oleifera for a gentle cleanse and a subtle, earthy fragrance. A daily companion that leaves skin feeling fresh and soft.",
        traditional_use: "Moringa is traditionally treasured as a nutrient-dense plant." },
      { format: "bar", size_label: "Moerkoffie · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 5,
        image_url: "/products/boerseep-moerkoffie",
        summary: "Infused with the deep, comforting aroma of traditional South African moerkoffie. A warm, earthy bar with rustic charm.",
        traditional_use: "Moerkoffie is traditionally appreciated for its energising aroma and gentle exfoliating texture." },
      { format: "bar", size_label: "Charcoal · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 6,
        image_url: "/products/boerseep-charcoal",
        summary: "Handmade with activated charcoal: a bold, earthy bar that cleanses gently and leaves skin feeling fresh and smooth.",
        traditional_use: "Charcoal is traditionally valued for its absorbing, clarifying character." },
      { format: "bar", size_label: "Turmeric · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 7,
        image_url: "/products/boerseep-turmeric",
        summary: "Handmade with Curcuma longa (turmeric): a warm, earthy fragrance and a rich golden colour.",
        traditional_use: "Turmeric is traditionally valued in herbal skin care for its golden colour and warmth." },
      { format: "bar", size_label: "Cinnamon · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 8,
        image_url: "/products/boerseep-cinnamon",
        summary: "Handmade with Cinnamomum verum (cinnamon): a sweet-spicy fragrance that uplifts the senses while cleansing gently.",
        traditional_use: "Cinnamon is traditionally valued for its warming, invigorating aroma." },
      { format: "bar", size_label: "Natural Plain · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 9,
        image_url: "/products/boerseep-natural-plain",
        summary: "Made in the timeless tradition of boerseep: a plain, unscented bar with no added fragrance or herbs. Suited to all skin types, including sensitive skin.",
        traditional_use: "Plain boerseep is traditionally valued for its mild, versatile cleansing and everyday household use." },
      { format: "bar", size_label: "African Sunset · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 10,
        image_url: "/products/boerseep-african-sunset",
        summary: "Handmade with turmeric and activated charcoal: two natural ingredients in one earthy, characterful bar.",
        traditional_use: "Turmeric and charcoal are each traditionally valued in herbal soapmaking for their colour and clarifying character." },
      { format: "bar", size_label: "Salty Rocks · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 11,
        image_url: "/products/boerseep-salty-rocks",
        summary: "Activated charcoal and natural salt in one handcrafted bar: a bold, invigorating cleanse with a subtle freshness.",
        traditional_use: "Charcoal and salt are traditionally valued for their clarifying, mineral character." },
      { format: "bar", size_label: "Cedar Glow · 150–170 g", price_retail: 60, price_trade: 46, barcode: null, sort_order: 12,
        image_url: "/products/boerseep-cedar-glow",
        summary: "Handmade with rooibos (Aspalathus linearis) and the warm, woody fragrance of cedarwood: a distinctly South African bar.",
        traditional_use: "Rooibos and cedarwood are traditionally valued for their comforting, grounding aroma." },
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
      { format: "tincture", size_label: "30 ml", price_retail: 150, price_trade: 135, barcode: null, sort_order: 1, image_url: "/products/tincture-artemisia" },
    ],
  },
];
