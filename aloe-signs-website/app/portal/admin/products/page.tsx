'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert('Failed to delete product: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-white/60">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/portal/admin"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back to Admin</span>
            </Link>
            <h1 className="text-2xl font-semibold">Shop Products</h1>
          </div>
          <Link
            href="/portal/admin/products/new"
            className="flex items-center gap-2 bg-[#84cc16] text-black font-medium px-4 py-2 rounded-xl hover:bg-[#a3e635] transition-colors"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No products yet.</p>
          </div>
        )}

        {/* Product list */}
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {/* Image */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.png';
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.name}</h3>
                <p className="text-white/60 text-sm capitalize">{product.category}</p>
                <p className="text-white font-semibold mt-1">R {product.price.toFixed(2)}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                    product.inStock
                      ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                      : 'bg-red-400/10 text-red-400 border border-red-400/20'
                  }`}
                >
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 sm:self-center">
                <Link
                  href={`/portal/admin/products/${product.id}`}
                  className="text-white/60 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Pencil size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}