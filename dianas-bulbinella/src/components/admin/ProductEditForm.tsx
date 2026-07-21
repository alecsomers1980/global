"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CONCERNS, RANGES } from "@/lib/nav";
import Link from "next/link";
import Image from "next/image";

type Variant = {
  id: string;
  size: string;
  price: number;
  stock: "instock" | "outofstock";
  image: string;
  sku: string;
  sort_order: number;
};

type ProductFull = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  format: string;
  concerns: string[];
  ranges: string[];
  categories: string[];
  active: boolean;
  variants: Variant[];
};

export default function ProductEditForm({
  product,
}: {
  product: ProductFull;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(product.title);
  const [format, setFormat] = useState(product.format ?? "");
  const [excerpt, setExcerpt] = useState(product.excerpt ?? "");
  const [active, setActive] = useState(product.active);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    product.concerns ?? []
  );
  const [selectedRanges, setSelectedRanges] = useState<string[]>(
    product.ranges ?? []
  );
  const [variants, setVariants] = useState<Variant[]>(product.variants);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleToggle = (
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    slug: string
  ) => {
    setter((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? ({ ...v, [field]: value } as Variant) : v
      )
    );
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIdx(index);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      handleVariantChange(index, "image", json.url);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleAddVariant = () => {
    const tempId = `temp-${crypto.randomUUID()}`;
    setVariants((prev) => [
      ...prev,
      {
        id: tempId,
        size: "",
        price: 0,
        stock: "instock",
        image: "",
        sku: "",
        sort_order: prev.length,
      },
    ]);
  };

  const validateVariants = (): string | null => {
    if (variants.length === 0) return "You must have at least one size variant.";
    const errors: string[] = [];
    variants.forEach((v, i) => {
      if (!v.size.trim()) errors.push(`Variant ${i + 1}: size is required.`);
      if (v.price <= 0) errors.push(`Variant ${i + 1}: price must be greater than 0.`);
    });
    return errors.length ? errors.join(" ") : null;
  };

  const handleSave = async () => {
    const validationError = validateVariants();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    setMessage(null);

    const supabase = createClient();

    // Update product row
    const { error: productError } = await supabase
      .from("products")
      .update({
        title,
        format: format || null,
        excerpt: excerpt || null,
        active,
        concerns: selectedConcerns,
        ranges: selectedRanges,
      })
      .eq("id", product.id);

    if (productError) {
      setMessage({ type: "error", text: productError.message });
      setSaving(false);
      return;
    }

    // Reconcile variants
    const originalIds = product.variants.map((v) => v.id);
    const currentIds = variants.map((v) => v.id);
    const idsToDelete = originalIds.filter((id) => !currentIds.includes(id));

    try {
      // Delete removed variants
      if (idsToDelete.length) {
        const { error: deleteError } = await supabase
          .from("product_variants")
          .delete()
          .in("id", idsToDelete);
        if (deleteError) throw deleteError;
      }

      // Update existing variants (non-temp)
      for (const variant of variants) {
        if (!variant.id.startsWith("temp-")) {
          const { error: updateError } = await supabase
            .from("product_variants")
            .update({
              size: variant.size,
              price: variant.price,
              stock: variant.stock,
              image: variant.image || null,
              sku: variant.sku || null,
              sort_order: variants.indexOf(variant),
            })
            .eq("id", variant.id);
          if (updateError) throw updateError;
        }
      }

      // Insert new variants (temp-)
      for (const variant of variants) {
        if (variant.id.startsWith("temp-")) {
          const { error: insertError } = await supabase
            .from("product_variants")
            .insert({
              product_id: product.id,
              size: variant.size,
              price: variant.price,
              stock: variant.stock,
              image: variant.image || null,
              sku: variant.sku || null,
              sort_order: variants.indexOf(variant),
            });
          if (insertError) throw insertError;
        }
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save variants" });
      setSaving(false);
      return;
    }

    setMessage({ type: "success", text: "Saved" });
    setSaving(false);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Edit product</h1>
        <Link href="/admin/products" className="text-sm text-muted hover:text-ink underline-offset-2 hover:underline">
          Back to products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Title</label>
            <input type="text" className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Format</label>
            <input type="text" className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest" value={format} onChange={(e) => setFormat(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Excerpt</label>
            <textarea rows={3} className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest resize-y" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-line text-forest focus:ring-forest" />
            <label htmlFor="active" className="text-sm text-ink">Active</label>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-ink mb-2">Concerns</p>
            <div className="grid grid-cols-2 gap-1">
              {CONCERNS.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={selectedConcerns.includes(c.slug)} onChange={() => handleToggle(selectedConcerns, setSelectedConcerns, c.slug)} className="h-4 w-4 rounded border-line text-forest focus:ring-forest" />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-2">Ranges</p>
            <div className="grid grid-cols-2 gap-1">
              {RANGES.map((r) => (
                <label key={r.slug} className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={selectedRanges.includes(r.slug)} onChange={() => handleToggle(selectedRanges, setSelectedRanges, r.slug)} className="h-4 w-4 rounded border-line text-forest focus:ring-forest" />
                  {r.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div className="mt-6 rounded-2xl border border-line p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ink">Size Variants</h2>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-sm font-medium text-forest hover:text-moss underline-offset-2 hover:underline"
          >
            + Add size
          </button>
        </div>

        {variants.length === 0 && (
          <p className="text-sm text-muted">No variants added yet. Click “Add size” to start.</p>
        )}

        <div className="space-y-4">
          {variants.map((variant, idx) => (
            <div
              key={variant.id}
              className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border-b border-line pb-4 last:border-b-0"
            >
              <div>
                <label className="block text-xs text-muted mb-1">Size *</label>
                <input
                  type="text"
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                  placeholder="e.g. 100 ml"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Price *</label>
                <input
                  type="number"
                  step="any"
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                  value={variant.price}
                  onChange={(e) => handleVariantChange(idx, "price", Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Stock</label>
                <select
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                >
                  <option value="instock">In stock</option>
                  <option value="outofstock">Out of stock</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-muted mb-1">Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm flex-1 outline-none focus:border-forest"
                    value={variant.image}
                    onChange={(e) => handleVariantChange(idx, "image", e.target.value)}
                    placeholder="/images/products/... or upload"
                  />
                  <label className="shrink-0 cursor-pointer rounded-xl border border-line bg-white px-3 py-2.5 text-xs font-medium text-ink hover:bg-surface-2 transition-colors">
                    {uploadingIdx === idx ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingIdx !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(idx, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {variant.image.trim() ? (
                    <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden border border-line">
                      <Image
                        src={variant.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1">SKU</label>
                  <input
                    type="text"
                    className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="shrink-0 text-red-500 hover:text-red-700 text-sm font-medium mt-5"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button type="button" onClick={handleSave} disabled={saving} className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {message && (
          <span className={`text-sm ${message.type === "success" ? "text-forest" : "text-red-600"}`}>{message.text}</span>
        )}
      </div>
    </div>
  );
}
