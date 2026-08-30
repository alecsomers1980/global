/**
 * Seed the Rehoboth catalogue: 9 products, 21 variants.
 * Data lives in src/lib/catalog-data.ts.
 *
 * Run: npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "../src/lib/catalog-data.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  let products = 0;
  let variants = 0;

  for (const p of PRODUCTS) {
    const { variants: vs, ...row } = p;
    const { data, error } = await db
      .from("products")
      .upsert(row, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw new Error(`product ${p.slug}: ${error.message}`);
    products++;

    for (const v of vs) {
      const { error: ve } = await db
        .from("product_variants")
        .upsert(
          { product_id: data.id, ...v },
          { onConflict: "product_id,format,size_label" }
        );
      if (ve) throw new Error(`variant ${p.slug}/${v.size_label}: ${ve.message}`);
      variants++;
    }
  }

  console.log(`seeded ${products} products, ${variants} variants`);
  if (variants !== 24) {
    console.error(`expected 24 variants, wrote ${variants}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
