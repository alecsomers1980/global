'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCategory, SignatureType, ALL_CATEGORIES, CATEGORY_LABELS } from '@/lib/supabase/types';

interface ProductFormProps {
  product?: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: ProductCategory;
    style_no: string | null;
    is_signature: boolean;
    signature_type: SignatureType | null;
    base_price: number; // integer cents
    featured: boolean;
    active: boolean;
  };
}

const SIGNATURE_TYPES: SignatureType[] = ['wildlife', 'hide', 'floral'];
const SIGNATURE_TYPE_LABELS: Record<SignatureType, string> = {
  wildlife: 'Wildlife',
  hide: 'Hide',
  floral: 'Floral',
};

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(product);

  // Seeded state
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? ALL_CATEGORIES[0]);
  const [styleNo, setStyleNo] = useState(product?.style_no ?? '');
  const [isSignature, setIsSignature] = useState(product?.is_signature ?? false);
  const [signatureType, setSignatureType] = useState<SignatureType | null>(product?.signature_type ?? null);
  const [priceRand, setPriceRand] = useState<string>(
    product ? (product.base_price / 100).toFixed(2) : ''
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    // Convert Rand string to integer cents
    const basePriceCents = Math.round((parseFloat(priceRand) || 0) * 100);

    // Build payload
    const payload = {
      slug: slug.trim() || '',
      name: name.trim(),
      description,
      category,
      style_no: styleNo.trim() || null,
      is_signature: isSignature,
      signature_type: isSignature ? signatureType : null,
      base_price: basePriceCents,
      featured,
      active,
    };

    try {
      const url = isEditing
        ? `/api/admin/products/${product!.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Something went wrong');
      }

      const json = await res.json();

      if (isEditing) {
        router.refresh();
      } else {
        router.push(`/admin/products/${json.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic fields */}
      <div>
        <label className="block text-sm text-muted mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full p-2 rounded bg-surface border border-text/20 text-text focus:outline-none focus:border-accent"
          placeholder="product-slug"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded bg-surface border border-text/20 text-text focus:outline-none focus:border-accent"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded bg-surface border border-text/20 text-text focus:outline-none focus:border-accent"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          className="w-full p-2 rounded bg-surface border border-text/20 text-text focus:outline-none focus:border-accent"
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Style number (optional)</label>
        <input
          type="text"
          value={styleNo}
          onChange={(e) => setStyleNo(e.target.value)}
          className="w-full p-2 rounded bg-surface border border-text/20 text-text focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1">Base price (R)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={priceRand}
          onChange={(e) => setPriceRand(e.target.value)}
          className="w-full p-2 rounded bg-surface border border-text/20 text-text focus:outline-none focus:border-accent"
          required
        />
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={isSignature}
            onChange={(e) => setIsSignature(e.target.checked)}
            className="rounded border-text/20 bg-surface accent-accent"
          />
          Signature product
        </label>

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-text/20 bg-surface accent-accent"
          />
          Featured
        </label>

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-text/20 bg-surface accent-accent"
          />
          Active
        </label>
      </div>

      {/* Signature type selector (conditionally rendered) */}
      {isSignature && (
        <div>
          <label className="block text-sm text-muted mb-1">Signature type</label>
          <select
            value={signatureType ?? ''}
            onChange={(e) =>
              setSignatureType(e.target.value ? (e.target.value as SignatureType) : null)
            }
            required
            className="w-full p-2 rounded bg-surface border border-text/20 text-text focus:outline-none focus:border-accent"
          >
            <option value="" disabled>
              Select…
            </option>
            {SIGNATURE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SIGNATURE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error message */}
      {error && <div className="text-accent text-sm mt-2">{error}</div>}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="inline-block bg-accent text-canvas px-6 py-2 rounded hover:bg-accent-hi disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}