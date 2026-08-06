'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductVariant } from '@/lib/supabase/types';

interface StockGridProps {
  productId: string;
  variants: ProductVariant[];
}

interface EditedState {
  stock_qty: number;
  active: boolean;
}

export default function StockGrid({ productId, variants }: StockGridProps) {
  const router = useRouter();

  // Derive distinct colours and sizes
  const colourNames = Array.from(new Set(variants.map((v) => v.colour_name)));
  const sizeList = Array.from(new Set(variants.map((v) => v.size))).sort((a, b) => a - b);

  // Lookup map
  const variantMap = new Map<string, ProductVariant>(variants.map((v) => [`${v.colour_name}|${v.size}`, v]));

  // Local edits only, keyed by variant id. Deliberately NOT seeded from
  // `variants` on mount -- a useState initializer runs once, but `variants`
  // changes on every router.refresh() (e.g. right after generating a new
  // batch of variants), and a Map seeded only at mount would have no entry
  // for a variant that didn't exist yet then. Every read below falls back to
  // the variant's own prop values when no local edit exists, so a stale or
  // missing map entry can never crash the render.
  const [edits, setEdits] = useState<Map<string, EditedState>>(new Map());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateFor = (variant: ProductVariant): EditedState =>
    edits.get(variant.id) ?? { stock_qty: variant.stock_qty, active: variant.active };

  const applyStockQty = (variant: ProductVariant, qty: number) => {
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(variant.id, { ...stateFor(variant), stock_qty: qty });
      return next;
    });
  };

  const applyActive = (variant: ProductVariant, active: boolean) => {
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(variant.id, { ...stateFor(variant), active });
      return next;
    });
  };

  const handleSave = async () => {
    // Every variant currently on screen, with its edited value if any,
    // otherwise its unchanged prop value -- not just the ones touched.
    const variantsPayload = variants.map((v) => {
      const state = stateFor(v);
      return { id: v.id, stock_qty: state.stock_qty, active: state.active };
    });

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: variantsPayload }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Failed to update variants');
      }

      setEdits(new Map());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (variants.length === 0) {
    return <p className="text-sm text-muted">No variants yet — generate some above first.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border border-text/10 text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left px-3 py-2 text-muted font-medium">Colour</th>
              {sizeList.map((size) => (
                <th key={size} className="px-3 py-2 text-muted font-medium text-center">
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colourNames.map((colour) => (
              <tr key={colour} className="border-t border-text/10">
                <td className="px-3 py-2 text-text font-medium">{colour}</td>
                {sizeList.map((size) => {
                  const variant = variantMap.get(`${colour}|${size}`);
                  if (!variant) {
                    return (
                      <td key={size} className="px-3 py-2 text-center text-muted">
                        —
                      </td>
                    );
                  }

                  const state = stateFor(variant);
                  const qtyClass =
                    state.stock_qty === 0
                      ? 'text-muted'
                      : state.stock_qty >= 1 && state.stock_qty <= 3
                        ? 'text-accent'
                        : 'text-text';

                  return (
                    <td key={size} className="px-3 py-2">
                      <div className="flex items-center gap-2 justify-center">
                        <input
                          type="number"
                          min="0"
                          value={state.stock_qty}
                          onChange={(e) => applyStockQty(variant, Math.max(0, parseInt(e.target.value) || 0))}
                          className={`w-16 px-1 py-0.5 border border-text/20 bg-canvas text-center rounded ${qtyClass}`}
                        />
                        <input
                          type="checkbox"
                          checked={state.active}
                          onChange={(e) => applyActive(variant, e.target.checked)}
                          className="size-4 accent-current cursor-pointer"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 rounded bg-accent text-canvas hover:bg-accent-hi disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : 'Save stock'}
        </button>
        {error && <p className="text-sm text-accent">{error}</p>}
      </div>
    </div>
  );
}
