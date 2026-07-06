'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  size: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  features: string[];
  inStock: boolean;
  pricingTiers?: { quantity: number; singlePrice: number; doublePrice: number }[];
  variants?: { name: string; price: number }[];
  artworkFee?: number;
}

const CATEGORIES = [
  { value: 'billboards', label: 'Billboards' },
  { value: 'estate-boards', label: 'Estate Boards' },
  { value: 'safety-signs', label: 'Safety Signs' },
  { value: 'parking-signs', label: 'Parking Signs' },
  { value: 'property-signs', label: 'Property Signs' },
];

export default function ProductFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';
  const [product, setProduct] = useState<Product | null>(isNew ? getDefaultProduct() : null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  function getDefaultProduct(): Product {
    return {
      id: '',
      name: '',
      category: 'estate-boards',
      description: '',
      size: '',
      price: 0,
      image: '',
      features: [],
      inStock: true,
    };
  }

  useEffect(() => {
    if (!isNew) {
      (async () => {
        try {
          const res = await fetch('/api/products/' + id);
          if (res.ok) {
            const data = await res.json();
            setProduct(data.product);
          } else {
            alert('Failed to load product');
            router.push('/portal/admin/products');
          }
        } catch (err) {
          alert('Error loading product');
          router.push('/portal/admin/products');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isNew, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const updateField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setProduct((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleNumberChange =
    (key: 'price' | 'originalPrice' | 'discount' | 'artworkFee') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '') {
        if (key === 'price') {
          updateField('price', 0);
        } else {
          setProduct((prev) => (prev ? { ...prev, [key]: undefined } : prev));
        }
      } else {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          updateField(key as any, num);
        }
      }
    };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('inStock', e.target.checked);
  };

  // Features
  const handleFeatureChange = (index: number, value: string) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setProduct((prev) =>
      prev ? { ...prev, features: [...prev.features, ''] } : prev
    );
  };

  const removeFeature = (index: number) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const features = prev.features.filter((_, i) => i !== index);
      return { ...prev, features };
    });
  };

  // Pricing Tiers
  const handleTierChange = (
    index: number,
    field: 'quantity' | 'singlePrice' | 'doublePrice',
    value: string
  ) => {
    setProduct((prev) => {
      if (!prev || !prev.pricingTiers) return prev;
      const tiers = [...prev.pricingTiers];
      const numVal = value === '' ? 0 : parseFloat(value);
      tiers[index] = { ...tiers[index], [field]: isNaN(numVal) ? 0 : numVal };
      return { ...prev, pricingTiers: tiers };
    });
  };

  const addTier = () => {
    setProduct((prev) => {
      const tiers = prev?.pricingTiers ? [...prev.pricingTiers] : [];
      tiers.push({ quantity: 0, singlePrice: 0, doublePrice: 0 });
      return prev ? { ...prev, pricingTiers: tiers } : prev;
    });
  };

  const removeTier = (index: number) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const tiers = prev.pricingTiers
        ? prev.pricingTiers.filter((_, i) => i !== index)
        : [];
      return { ...prev, pricingTiers: tiers };
    });
  };

  // Variants
  const handleVariantChange = (
    index: number,
    field: 'name' | 'price',
    value: string
  ) => {
    setProduct((prev) => {
      if (!prev || !prev.variants) return prev;
      const variants = [...prev.variants];
      if (field === 'price') {
        const numVal = value === '' ? 0 : parseFloat(value);
        variants[index] = {
          ...variants[index],
          price: isNaN(numVal) ? 0 : numVal,
        };
      } else {
        variants[index] = { ...variants[index], name: value };
      }
      return { ...prev, variants };
    });
  };

  const addVariant = () => {
    setProduct((prev) => {
      const variants = prev?.variants ? [...prev.variants] : [];
      variants.push({ name: '', price: 0 });
      return prev ? { ...prev, variants } : prev;
    });
  };

  const removeVariant = (index: number) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const variants = prev.variants
        ? prev.variants.filter((_, i) => i !== index)
        : [];
      return { ...prev, variants };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = isNew ? '/api/products' : `/api/products/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        router.push('/portal/admin/products');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/portal/admin/products')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={18} /> Back to Products
          </button>
          <h1 className="text-2xl font-bold">
            {isNew ? 'New Product' : 'Edit Product'}
          </h1>
          <div /> {/* spacer */}
        </div>

        <div className="space-y-6">
          {/* ID */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Product ID
            </label>
            <input
              type="text"
              value={product.id}
              onChange={(e) => updateField('id', e.target.value)}
              disabled={!isNew}
              className={`w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white ${
                !isNew ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Name
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Category
            </label>
            <select
              value={product.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Size
            </label>
            <input
              type="text"
              value={product.size}
              onChange={(e) => updateField('size', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Image Path
            </label>
            <input
              type="text"
              value={product.image}
              onChange={(e) => updateField('image', e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Price
            </label>
            <input
              type="number"
              value={product.price}
              onChange={handleNumberChange('price')}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Original Price (optional)
            </label>
            <input
              type="number"
              value={product.originalPrice ?? ''}
              onChange={handleNumberChange('originalPrice')}
              placeholder="Leave empty for none"
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Discount % (optional)
            </label>
            <input
              type="number"
              value={product.discount ?? ''}
              onChange={handleNumberChange('discount')}
              placeholder="Leave empty for none"
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Artwork Fee */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Artwork Fee (optional)
            </label>
            <input
              type="number"
              value={product.artworkFee ?? ''}
              onChange={handleNumberChange('artworkFee')}
              placeholder="Leave empty for none"
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={product.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={product.inStock}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />
            <label className="text-xs uppercase tracking-wider text-gray-400">
              In Stock
            </label>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-gray-400">
              Features
            </label>
            {product.features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={f}
                  onChange={(e) => handleFeatureChange(i, e.target.value)}
                  className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                  placeholder="Feature text"
                />
                <button
                  onClick={() => removeFeature(i)}
                  className="p-2 text-red-400 hover:text-red-300"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addFeature}
              className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition"
              type="button"
            >
              <Plus size={16} /> Add Feature
            </button>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-gray-400">
              Pricing Tiers
            </label>
            {product.pricingTiers &&
              product.pricingTiers.map((tier, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={tier.quantity}
                    onChange={(e) => handleTierChange(i, 'quantity', e.target.value)}
                    className="w-20 bg-black/30 border border-white/10 rounded px-2 py-1 text-white"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    value={tier.singlePrice}
                    onChange={(e) => handleTierChange(i, 'singlePrice', e.target.value)}
                    className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1 text-white"
                    placeholder="Single $"
                  />
                  <input
                    type="number"
                    value={tier.doublePrice}
                    onChange={(e) => handleTierChange(i, 'doublePrice', e.target.value)}
                    className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1 text-white"
                    placeholder="Double $"
                  />
                  <button
                    onClick={() => removeTier(i)}
                    className="p-1 text-red-400 hover:text-red-300"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            <button
              onClick={addTier}
              className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition"
              type="button"
            >
              <Plus size={16} /> Add Tier
            </button>
          </div>

          {/* Variants */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-gray-400">
              Variants
            </label>
            {product.variants &&
              product.variants.map((variant, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                    className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                    placeholder="Variant name"
                  />
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                    className="w-24 bg-black/30 border border-white/10 rounded px-2 py-1 text-white"
                    placeholder="Price"
                  />
                  <button
                    onClick={() => removeVariant(i)}
                    className="p-1 text-red-400 hover:text-red-300"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            <button
              onClick={addVariant}
              className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition"
              type="button"
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold disabled:opacity-50 transition"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}