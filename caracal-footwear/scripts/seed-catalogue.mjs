import { createClient } from '@supabase/supabase-js';

// Read environment variables
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  const missing = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  console.error(`Missing environment variable(s): ${missing.join(', ')}`);
  process.exit(1);
}

// Apply flag check
const apply = process.argv.includes('--apply');

// Colour hex map
const COLOUR_HEX = {
  'White': '#F2EFE9',
  'Red': '#A32E2B',
  'Navy': '#1F2A40',
  'Tan': '#B5763A',
  'Olive Green': '#5A5F3D',
  'Black': '#14110F',
  'Khaki': '#C2A06B',
  'Brown': '#6B4423',
  'Cognac': '#A8542A',
  'Lion': '#A8542A',
  'Leopard': '#C89660',
  'Buffalo Sunset': '#8A3B1E',
  'Zebra': '#F5F0E8',
  'Leopard Hide': '#B5763A',
  'Protea': '#9B5566',
  'Succulent': '#4A6B4F',
};

// Descriptions
const CORE_DESC = 'Handmade in South Africa from genuine leather, on a non-slip TPR sole. Made to order in 5 working days.';
const SIG_DESC = 'A Caracal Signature. Handmade in South Africa from genuine leather with a decorated panel, on a non-slip TPR sole. Made to order in 5 working days.';

// Core products
const coreProducts = [
  { slug: 'classic-chukka', style_no: '420', name: 'Classic Chukka', category: 'chukka', colours: ['White', 'Red', 'Navy', 'Tan', 'Olive Green', 'Black'] },
  { slug: 'veld-chelsea', style_no: '402', name: 'Veld Chelsea', category: 'chelsea', colours: ['Khaki', 'Tan', 'Brown'] },
  { slug: 'ranger-hiker', style_no: '403', name: 'Ranger Hiker', category: 'hiker', colours: ['Cognac', 'Brown', 'Olive Green'] },
  { slug: 'kalahari-low-cut', style_no: null, name: 'Kalahari Low-Cut', category: 'low_cut', colours: ['Tan', 'Black'] },
];

// Signature products
const sigProducts = [
  { slug: 'lion', name: 'Lion', category: 'low_cut', signature_type: 'wildlife', colour: 'Lion' },
  { slug: 'leopard', name: 'Leopard', category: 'low_cut', signature_type: 'wildlife', colour: 'Leopard' },
  { slug: 'buffalo-sunset', name: 'Buffalo Sunset', category: 'chukka', signature_type: 'wildlife', colour: 'Buffalo Sunset' },
  { slug: 'zebra-hide', name: 'Zebra Hide', category: 'low_cut', signature_type: 'hide', colour: 'Zebra' },
  { slug: 'leopard-hide', name: 'Leopard Hide', category: 'low_cut', signature_type: 'hide', colour: 'Leopard Hide' },
  { slug: 'protea', name: 'Protea', category: 'chukka', signature_type: 'floral', colour: 'Protea' },
  { slug: 'succulent', name: 'Succulent', category: 'chukka', signature_type: 'floral', colour: 'Succulent' },
];

// Build the list of products to insert and slugs
const allSlugs = [];
const productsToInsert = [];

coreProducts.forEach(c => {
  allSlugs.push(c.slug);
  const product = {
    slug: c.slug,
    name: c.name,
    description: CORE_DESC,
    category: c.category,
    is_signature: false,
    base_price: 55000,
    featured: false,
    active: true,
  };
  if (c.style_no) product.style_no = c.style_no;
  // signature_type intentionally omitted for non-signature products
  productsToInsert.push(product);
});

sigProducts.forEach(s => {
  allSlugs.push(s.slug);
  productsToInsert.push({
    slug: s.slug,
    name: s.name,
    description: SIG_DESC,
    category: s.category,
    is_signature: true,
    signature_type: s.signature_type,
    base_price: 55000,
    featured: false,
    active: true,
    // style_no omitted (null)
  });
});

const totalColourLines = coreProducts.reduce((sum, c) => sum + c.colours.length, 0) + sigProducts.length;
const totalVariants = totalColourLines * 12;

if (!apply) {
  console.log(`Would seed ${productsToInsert.length} products, ${totalVariants} variants across ${totalColourLines} colour lines.`);
  process.exit(0);
}

// --apply mode: connect, delete, seed
const supabase = createClient(url, key);

try {
  // Idempotent deletion of existing products by slug
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .in('slug', allSlugs);
  if (deleteError) throw deleteError;

  // Insert products and retrieve ids
  const { data: insertedProducts, error: insertError } = await supabase
    .from('products')
    .insert(productsToInsert)
    .select('id, slug');
  if (insertError) throw insertError;

  // Map slug -> id
  const slugToId = {};
  for (const p of insertedProducts) {
    slugToId[p.slug] = p.id;
  }

  const SIZES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const allVariants = [];

  // Helper to produce SKU prefix
  const getPrefix = (def) => {
    if (def.style_no) return def.style_no;
    // No style_no: use slug uppercased, hyphens removed
    return def.slug.toUpperCase().replace(/-/g, '');
  };

  // Core product variants
  for (const c of coreProducts) {
    const productId = slugToId[c.slug];
    const prefix = getPrefix(c);
    for (const colour of c.colours) {
      const colourClean = colour.toUpperCase().replace(/[\s-]/g, '');
      for (const size of SIZES) {
        const sku = `${prefix}-${colourClean}-${size}`;
        allVariants.push({
          product_id: productId,
          colour_name: colour,
          colour_hex: COLOUR_HEX[colour],
          size,
          sku,
          stock_qty: 0,
          price_override: null,
          active: true,
        });
      }
    }
  }

  // Signature product variants
  for (const s of sigProducts) {
    const productId = slugToId[s.slug];
    const prefix = getPrefix(s); // signature products have no style_no, so slug-based
    const colourClean = s.colour.toUpperCase().replace(/[\s-]/g, '');
    for (const size of SIZES) {
      const sku = `${prefix}-${colourClean}-${size}`;
      allVariants.push({
        product_id: productId,
        colour_name: s.colour,
        colour_hex: COLOUR_HEX[s.colour],
        size,
        sku,
        stock_qty: 0,
        price_override: null,
        active: true,
      });
    }
  }

  // Insert variants in batches of 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < allVariants.length; i += BATCH_SIZE) {
    const batch = allVariants.slice(i, i + BATCH_SIZE);
    const { error: variantError } = await supabase
      .from('product_variants')
      .insert(batch);
    if (variantError) throw variantError;
  }

  // Final summary
  console.log(`products=${insertedProducts.length} variants=${allVariants.length}`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}