import { createClient } from "@/lib/supabase/server";
import SpecialForm from "@/components/admin/SpecialForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditSpecialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: special, error } = await supabase
    .from("specials")
    .select("id, name, starts_on, ends_on, note, created_at")
    .eq("id", id)
    .single();

  if (error || !special) {
    notFound();
  }

  const { data: items } = await supabase
    .from("special_items")
    .select("variant_id, special_price")
    .eq("special_id", id);

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
      <h1 className="text-xl font-semibold text-ink">Edit special</h1>
      <SpecialForm
        mode="edit"
        special={{
          id: special.id,
          name: special.name,
          starts_on: special.starts_on,
          ends_on: special.ends_on,
          note: special.note,
        }}
        initialItems={
          items?.map((item) => ({
            variant_id: item.variant_id,
            special_price: item.special_price,
          })) ?? []
        }
        products={variantOptions}
      />
    </div>
  );
}
