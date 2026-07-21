import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductEditForm from "@/components/admin/ProductEditForm";

type ProductVariant = {
  id: string;
  size: string;
  price: number;
  stock: "instock" | "outofstock";
  image: string;
  sku: string;
  sort_order: number;
};

type RawProduct = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  format: string;
  concerns: string[];
  ranges: string[];
  categories: string[];
  active: boolean;
  product_variants: ProductVariant[];
};

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*, product_variants(id, size, price, stock, image, sku, sort_order)")
    .eq("id", id)
    .single<RawProduct>();

  if (error || !product) {
    notFound();
  }

  if (!product.product_variants || product.product_variants.length === 0) {
    notFound();
  }

  const sortedVariants = product.product_variants.sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const { product_variants: _, ...productWithoutVariants } = product;
  const productForForm = {
    ...productWithoutVariants,
    variants: sortedVariants,
  };

  return <ProductEditForm product={productForForm} />;
}
