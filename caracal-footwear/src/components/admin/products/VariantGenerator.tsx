'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_SIZES } from '@/lib/supabase/types';

interface VariantGeneratorProps {
  productId: string;
  existingColours: string[];
}

interface ColourRow {
  name: string;
  hex: string;
}

const DEFAULT_HEX = '#C25A1E'; // Design token accent

export default function VariantGenerator({ productId, existingColours }: VariantGeneratorProps) {
  const router = useRouter();
  const [colours, setColours] = useState<ColourRow[]>([{ name: '', hex: DEFAULT_HEX }]);
  const [selectedSizes, setSelectedSizes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (index: number, field: keyof ColourRow, value: string) => {
    setColours(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const removeRow = (index: number) => {
    if (colours.length <= 1) return;
    setColours(prev => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setColours(prev => [...prev, { name: '', hex: DEFAULT_HEX }]);
  };

  const toggleSize = (size: number) => {
    setSelectedSizes(prev => {
      const next = new Set(prev);
      if (next.has(size)) {
        next.delete(size);
      } else {
        next.add(size);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const validColours = colours.filter(c => c.name.trim() !== '');
    const sizes = Array.from(selectedSizes);
    if (validColours.length === 0 || sizes.length === 0) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colours: validColours, sizes }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Failed to generate variants');
      }

      const json = await res.json();
      const created = json.created ?? json.attempted;
      setMessage(`Generated ${created} new variant(s).`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = colours.some(c => c.name.trim() !== '') && selectedSizes.size > 0 && !loading;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {colours.map((row, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Colour name"
              value={row.name}
              onChange={e => updateRow(idx, 'name', e.target.value)}
              className="border border-text/20 bg-canvas text-text rounded px-3 py-2 flex-1"
            />
            <input
              type="color"
              value={row.hex}
              onChange={e => updateRow(idx, 'hex', e.target.value)}
              className="w-10 h-10 rounded border border-text/20 p-0.5 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => removeRow(idx)}
              disabled={colours.length <= 1}
              className="text-muted hover:text-text disabled:opacity-30 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="text-sm text-accent hover:text-accent-hi underline"
        >
          Add colour
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_SIZES.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              selectedSizes.has(size)
                ? 'bg-accent text-canvas'
                : 'border border-text/20 text-text hover:border-text/50'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="px-5 py-2.5 rounded bg-accent text-canvas hover:bg-accent-hi disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Generating...' : 'Generate variants'}
      </button>

      {error && <p className="text-sm text-accent">{error}</p>}
      {message && <p className="text-sm text-text">{message}</p>}
    </div>
  );
}