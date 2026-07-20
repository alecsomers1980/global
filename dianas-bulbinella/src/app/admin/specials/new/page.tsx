import { createClient } from "@/lib/supabase/server";
import SpecialForm from "@/components/admin/SpecialForm";

export const dynamic = "force-dynamic";

export default async function NewSpecialPage() {
  const supabase = await createClient();

  const { data: productsData } = await supabase
    .from("products")
    .select("id, title, format, product_variants(id, size, price, image)")
    .eq("active", true)
    .order("title");

  const variantOptions = (productsData ?? []).flatMap((product) =>
    (product.product_variants ?? []).map((variant) => ({
      id: variant.id,
      productTitle: product.title,
      size: variant.size,
      price: variant.price,
      image: variant.image,
      format: product.format,
    }))
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Schedule a special</h1>
      <SpecialForm products={variantOptions} mode="create" />
    </div>
  );
}
