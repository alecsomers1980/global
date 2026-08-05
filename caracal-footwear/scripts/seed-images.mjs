/**
 * Attaches the prepared photos in public/products to the catalogue.
 *
 * Run scripts/prepare-images.mjs first -- this only writes rows, it does not
 * touch files. Idempotent: it deletes every image row for the products it
 * knows about before inserting, so re-running never duplicates.
 *
 * Run: node --env-file=.env.local scripts/seed-images.mjs --apply
 *
 * Images are attached to a COLOUR rather than left shared (colour_name null).
 * A shared image shows on every colour tab of the PDP, so a tan photo would
 * appear while the shopper has White selected. Only genuinely colour-agnostic
 * shots should ever be null here.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  const missing = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  console.error(`Missing environment variable(s): ${missing.join(', ')}`);
  process.exit(1);
}

const apply = process.argv.includes('--apply');

/**
 * sort_order 0 is the card thumbnail: ProductCard falls back to the first
 * image when there is no shared one, and the query orders images by sort_order.
 * So the lead shot of each product must sit at 0.
 *
 * Colours with no entry here (Navy and Olive Green on the Chukka, Khaki on the
 * Chelsea, Cognac on the Hiker, and all of Kalahari Low-Cut and Leopard Hide)
 * fall through to the gallery's empty state until Donald shoots them.
 */
const images = {
  'classic-chukka': [
    ['Tan', 'classic-chukka-tan.webp', 'Classic Chukka vellie in tan leather, side view'],
    ['Tan', 'classic-chukka-tan-2.webp', 'Classic Chukka vellie in tan leather, three-quarter view'],
    ['Tan', 'classic-chukka-tan-3.webp', 'Classic Chukka vellie in tan leather on a lugged sole'],
    ['White', 'classic-chukka-white.webp', 'Classic Chukka vellie in white leather'],
    ['Red', 'classic-chukka-red.webp', 'A pair of Classic Chukka vellies in red leather'],
    ['Black', 'classic-chukka-black.webp', 'Classic Chukka vellie in black nubuck with red laces'],
  ],
  'veld-chelsea': [
    ['Brown', 'veld-chelsea-brown.webp', 'A pair of Veld Chelsea vellies in brown leather'],
    ['Tan', 'veld-chelsea-tan.webp', 'Veld Chelsea vellie in tan leather, worn'],
  ],
  'ranger-hiker': [
    ['Brown', 'ranger-hiker-brown.webp', 'Ranger Hiker vellie in brown leather, side view'],
    ['Olive Green', 'ranger-hiker-olive.webp', 'Ranger Hiker vellie in olive green leather'],
  ],
  lion: [['Lion', 'signature-lion.webp', 'Lion Signature low-cut vellie in tan leather with a painted lion panel']],
  leopard: [['Leopard', 'signature-leopard.webp', 'Leopard Signature vellie in suede with a painted leopard and sunset panel']],
  'buffalo-sunset': [['Buffalo Sunset', 'signature-buffalo.webp', 'Buffalo Sunset Signature vellie in black suede with a painted buffalo panel']],
  'zebra-hide': [['Zebra', 'signature-zebra.webp', 'Zebra Hide Signature low-cut vellie in tan leather with a zebra hide panel']],
  protea: [['Protea', 'signature-protea.webp', 'Protea Signature vellie in brown leather with a printed protea panel']],
  succulent: [['Succulent', 'signature-succulent.webp', 'Succulent Signature vellie in navy leather with a printed succulent panel']],
};

const slugs = Object.keys(images);
const rowCount = Object.values(images).reduce((n, list) => n + list.length, 0);

if (!apply) {
  console.log(`Would attach ${rowCount} images across ${slugs.length} products.`);
  process.exit(0);
}

const supabase = createClient(url, key);

const { data: products, error: fetchError } = await supabase
  .from('products')
  .select('id, slug')
  .in('slug', slugs);
if (fetchError) {
  console.error(fetchError.message);
  process.exit(1);
}

const missing = slugs.filter((s) => !products.some((p) => p.slug === s));
if (missing.length > 0) {
  console.error(`No such product(s): ${missing.join(', ')}. Run seed-catalogue first.`);
  process.exit(1);
}

const ids = products.map((p) => p.id);
const { error: deleteError } = await supabase
  .from('product_images')
  .delete()
  .in('product_id', ids);
if (deleteError) {
  console.error(deleteError.message);
  process.exit(1);
}

const rows = [];
for (const product of products) {
  images[product.slug].forEach(([colour, file, alt], i) => {
    rows.push({
      product_id: product.id,
      colour_name: colour,
      url: `/products/${file}`,
      alt,
      sort_order: i,
    });
  });
}

const { error: insertError } = await supabase.from('product_images').insert(rows);
if (insertError) {
  console.error(insertError.message);
  process.exit(1);
}

console.log(`images=${rows.length} products=${products.length}`);
