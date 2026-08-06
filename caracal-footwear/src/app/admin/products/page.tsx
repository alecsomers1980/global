import { createAdminClient } from '@/lib/supabase/admin';
import { CATEGORY_LABELS, type ProductCategory } from '@/lib/supabase/types';
import { formatZAR } from '@/lib/money';
import Link from 'next/link';

export const metadata = {
  title: 'Products',
};

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, category, is_signature, active, base_price, variants:product_variants(id)')
    .order('name');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="display text-3xl text-text">PRODUCTS</h1>
        <Link
          href="/admin/products/new"
          className="bg-accent text-canvas px-4 py-2 rounded hover:bg-accent-hi transition-colors text-sm"
        >
          + New product
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text">
          <thead className="text-muted uppercase tracking-wider border-b border-text/20">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Signature</th>
              <th className="p-2">Price</th>
              <th className="p-2">Variants</th>
              <th className="p-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-text/20 hover:bg-surface/40 transition-colors">
                <td className="p-2">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="block text-text hover:text-accent transition-colors"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="p-2 text-muted">{CATEGORY_LABELS[p.category as ProductCategory]}</td>
                <td className="p-2">
                  {p.is_signature ? (
                    <span className="text-xs text-accent font-medium">Signature</span>
                  ) : null}
                </td>
                <td className="p-2">{formatZAR(p.base_price)}</td>
                <td className="p-2">{p.variants?.length ?? 0}</td>
                <td className="p-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      p.active ? 'bg-accent' : 'bg-muted'
                    }`}
                  />
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}