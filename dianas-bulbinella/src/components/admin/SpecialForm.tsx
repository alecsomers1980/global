"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatZAR } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

type VariantOption = {
  id: string; // variant_id (product_variants.id)
  productTitle: string;
  size: string;
  price: number;
  image: string;
  format: string | null;
};

type Special = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  note: string | null;
};

type SpecialItem = {
  variant_id: string;
  special_price: number;
};

type Props =
  | {
      mode: "create";
      products: VariantOption[];
      special?: undefined;
      initialItems?: undefined;
    }
  | {
      mode: "edit";
      special: Special;
      initialItems: SpecialItem[];
      products: VariantOption[];
    };

export default function SpecialForm(props: Props) {
  const { mode, products } = props;
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(props.mode === "edit" ? props.special.name : "");
  const [startsOn, setStartsOn] = useState(props.mode === "edit" ? props.special.starts_on : "");
  const [endsOn, setEndsOn] = useState(props.mode === "edit" ? props.special.ends_on : "");
  const [note, setNote] = useState(props.mode === "edit" ? props.special.note ?? "" : "");

  const variantMap = useMemo(() => {
    const map = new Map<string, VariantOption>();
    products.forEach((v) => map.set(v.id, v));
    return map;
  }, [products]);

  const initialMap = useMemo(() => {
    const map = new Map<string, string>();
    if (props.mode === "edit" && props.initialItems) {
      props.initialItems.forEach((item) => {
        map.set(item.variant_id, item.special_price.toString());
      });
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode === "edit" ? (props as any).initialItems : []]);

  const [selected, setSelected] = useState<Map<string, string>>(initialMap);
  const [search, setSearch] = useState("");
  const [bulkPct, setBulkPct] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const filteredVariants = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products
      .filter((v) => v.productTitle.toLowerCase().includes(q) && !selected.has(v.id))
      .slice(0, 40);
  }, [products, search, selected]);

  function addVariant(variant: VariantOption) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(variant.id, variant.price.toString());
      return next;
    });
  }

  function updateSpecialPrice(variantId: string, value: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(variantId, value);
      return next;
    });
  }

  function removeVariant(variantId: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      next.delete(variantId);
      return next;
    });
  }

  function applyBulkDiscount() {
    const pct = parseFloat(bulkPct);
    if (isNaN(pct) || pct <= 0 || pct >= 100) return;
    setSelected((prev) => {
      const next = new Map(prev);
      prev.forEach((val, variantId) => {
        const variant = variantMap.get(variantId);
        if (!variant) return;
        const discount = Math.round(variant.price * (1 - pct / 100) * 100) / 100;
        next.set(variantId, discount.toString());
      });
      return next;
    });
  }

  async function handleSave() {
    const validationErrors: string[] = [];

    if (!name.trim()) validationErrors.push("Promo name is required.");
    if (!startsOn) validationErrors.push("Start date is required.");
    if (!endsOn) validationErrors.push("End date is required.");
    if (startsOn && endsOn && new Date(endsOn) < new Date(startsOn)) {
      validationErrors.push("End date must be on or after start date.");
    }
    if (selected.size === 0) validationErrors.push("Select at least one product.");

    selected.forEach((val, variantId) => {
      const variant = variantMap.get(variantId);
      if (!variant) return;
      const priceNum = parseFloat(val);
      if (isNaN(priceNum) || priceNum <= 0) {
        validationErrors.push(`${variant.productTitle} — ${variant.size}: special price must be a positive number.`);
      } else if (priceNum >= variant.price) {
        validationErrors.push(
          `${variant.productTitle} — ${variant.size}: special price must be less than original price (${formatZAR(variant.price)}).`
        );
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setSaving(true);
    setSuccessMsg("");

    try {
      if (mode === "create") {
        const { data: newSpecial, error: insertError } = await supabase
          .from("specials")
          .insert({ name: name.trim(), starts_on: startsOn, ends_on: endsOn, note: note.trim() || null })
          .select("id")
          .single();

        if (insertError || !newSpecial) {
          setErrors([insertError?.message ?? "Failed to create special."]);
          setSaving(false);
          return;
        }

        const specialId = newSpecial.id;
        const itemsArray = Array.from(selected.entries()).map(([variant_id, price]) => ({
          special_id: specialId,
          variant_id,
          special_price: parseFloat(price),
        }));

        const { error: itemsError } = await supabase.from("special_items").insert(itemsArray);

        if (itemsError) {
          setErrors([itemsError.message]);
          setSaving(false);
          return;
        }
      } else {
        const specialId = props.special.id;
        const { error: updateError } = await supabase
          .from("specials")
          .update({ name: name.trim(), starts_on: startsOn, ends_on: endsOn, note: note.trim() || null })
          .eq("id", specialId);

        if (updateError) {
          setErrors([updateError.message]);
          setSaving(false);
          return;
        }

        const { error: deleteError } = await supabase.from("special_items").delete().eq("special_id", specialId);

        if (deleteError) {
          setErrors([deleteError.message]);
          setSaving(false);
          return;
        }

        const itemsArray = Array.from(selected.entries()).map(([variant_id, price]) => ({
          special_id: specialId,
          variant_id,
          special_price: parseFloat(price),
        }));

        if (itemsArray.length > 0) {
          const { error: insertError } = await supabase.from("special_items").insert(itemsArray);

          if (insertError) {
            setErrors([insertError.message]);
            setSaving(false);
            return;
          }
        }
      }

      setSuccessMsg("Special saved successfully.");
      router.push("/admin/specials");
      router.refresh();
    } catch (e: any) {
      setErrors([e.message ?? "Something went wrong."]);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit") return;
    setSaving(true);
    setErrors([]);
    try {
      const { error } = await supabase.from("specials").delete().eq("id", props.special.id);
      if (error) {
        setErrors([error.message]);
        setSaving(false);
        return;
      }
      router.push("/admin/specials");
      router.refresh();
    } catch (e: any) {
      setErrors([e.message ?? "Deletion failed."]);
      setSaving(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-base font-medium text-ink">Promo details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Promo name</label>
              <input
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-forest"
                placeholder='e.g. "August Specials"'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Start date</label>
              <input
                type="date"
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-forest"
                value={startsOn}
                onChange={(e) => setStartsOn(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">End date</label>
              <input
                type="date"
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-forest"
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted">
                Tip: set the start date in the future to schedule ahead — it goes live automatically.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Note <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-forest"
                placeholder="Internal note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-base font-medium text-ink">Products</h2>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search products by name…"
              className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-forest"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mt-3 space-y-2">
            {search.trim() === "" ? (
              <p className="text-sm text-muted">Search for a product to add.</p>
            ) : filteredVariants.length === 0 ? (
              <p className="text-sm text-muted">No matching products.</p>
            ) : (
              filteredVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center gap-3 rounded-xl border border-line p-3"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface">
                    <Image
                      src={variant.image}
                      alt={`${variant.productTitle} ${variant.size}`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {variant.productTitle} — {variant.size}
                    </p>
                    <p className="text-xs text-muted">{variant.format || ""}</p>
                  </div>
                  <p className="text-sm font-medium text-ink">{formatZAR(variant.price)}</p>
                  <button
                    onClick={() => addVariant(variant)}
                    className="rounded-full bg-forest px-4 py-1.5 text-xs font-semibold text-white hover:bg-moss transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-medium text-ink">
              Selected products ({selected.size})
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="% off"
                className="w-18 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest"
                value={bulkPct}
                onChange={(e) => setBulkPct(e.target.value)}
                min={1}
                max={99}
              />
              <button
                type="button"
                onClick={applyBulkDiscount}
                className="rounded-full border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-surface transition-colors"
              >
                Apply to all
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {Array.from(selected.entries()).map(([variantId, priceStr]) => {
              const variant = variantMap.get(variantId);
              if (!variant) return null;
              const originalPrice = variant.price;
              const specialPrice = parseFloat(priceStr);
              const discountPct =
                !isNaN(specialPrice) && originalPrice > 0
                  ? Math.round((1 - specialPrice / originalPrice) * 100)
                  : null;

              return (
                <div
                  key={variantId}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-line p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface">
                      <Image
                        src={variant.image}
                        alt={`${variant.productTitle} ${variant.size}`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {variant.productTitle} — {variant.size}
                      </p>
                      <p className="text-xs text-muted line-through">
                        {formatZAR(originalPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-ink">Special price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-24 rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest"
                      value={priceStr}
                      onChange={(e) => updateSpecialPrice(variantId, e.target.value)}
                    />
                    {discountPct !== null && discountPct > 0 && (
                      <span className="text-xs font-medium text-moss">{discountPct}% off</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(variantId)}
                    className="ml-auto text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <ul className="list-disc pl-4 space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {successMsg && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-moss transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save special"}
          </button>
          <Link
            href="/admin/specials"
            className="text-sm text-ink underline-offset-2 hover:underline"
          >
            Cancel
          </Link>
        </div>
        {mode === "edit" && !deleteConfirm && (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="text-sm text-red-600 underline-offset-2 hover:underline"
          >
            Delete this special
          </button>
        )}
        {mode === "edit" && deleteConfirm && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink">Delete this special?</span>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(false)}
              className="text-xs text-ink underline-offset-2 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
