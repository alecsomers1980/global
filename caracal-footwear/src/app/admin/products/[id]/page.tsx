import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ProductForm from '@/components/admin/products/ProductForm';
import ImageManager from '@/components/admin/products/ImageManager';
import VariantGenerator from '@/components/admin/products/VariantGenerator';
import StockGrid from '@/components/admin/products/StockGrid';
import type { ProductWithVariants } from '@/lib/supabase/types';

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('*, variants:product_variants(*), images:product_images(*)')
    .eq('id', id)
    .single<ProductWithVariants>();

  if (!product) notFound();

  const colours = [...new Set(product.variants.map((v) => v.colour_name))];

  return (
    <div className="space-y-10">
      <h1 className="display text-3xl text-text">{product.name}</h1>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Details</h2>
        <ProductForm product={product} />
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Colours &amp; sizes</h2>
        <VariantGenerator productId={product.id} existingColours={colours} />
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Stock</h2>
        <StockGrid productId={product.id} variants={product.variants} />
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Photos</h2>
        <ImageManager productId={product.id} colours={colours} images={product.images} />
      </section>
    </div>
  );
}
