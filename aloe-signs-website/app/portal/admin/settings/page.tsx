'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Loader2 } from 'lucide-react';

interface Material {
  name: string;
  price: number;
}

interface Pricing {
  artwork_hourly_rate: number;
  hp_latex_materials: Material[];
}

export default function AdminSettingsPage() {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to load settings');
        const data = await res.json();
        if (data?.pricing) {
          setPricing(data.pricing);
        } else {
          setError('Pricing data not found');
        }
      } catch (err: any) {
        setError(err?.message || 'Error loading settings');
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, []);

  const handleSave = async () => {
    if (!pricing) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('Saved');
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      setError(err?.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateArtworkRate = (value: number) => {
    setPricing(prev => prev ? { ...prev, artwork_hourly_rate: value } : prev);
  };

  const updateMaterial = (index: number, field: 'name' | 'price', value: string | number) => {
    setPricing(prev => {
      if (!prev) return prev;
      const newMaterials = [...prev.hp_latex_materials];
      newMaterials[index] = {
        ...newMaterials[index],
        [field]: field === 'price' ? (parseFloat(value as string) || 0) : value,
      };
      return { ...prev, hp_latex_materials: newMaterials };
    });
  };

  const addMaterial = () => {
    setPricing(prev =>
      prev
        ? {
            ...prev,
            hp_latex_materials: [...prev.hp_latex_materials, { name: '', price: 0 }],
          }
        : prev
    );
  };

  const removeMaterial = (index: number) => {
    setPricing(prev => {
      if (!prev) return prev;
      const newMaterials = prev.hp_latex_materials.filter((_, i) => i !== index);
      return { ...prev, hp_latex_materials: newMaterials };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-white/60">Loading...</p>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400 text-lg">Failed to load pricing data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Link
          href="/portal/admin"
          className="text-sm text-white/60 hover:text-white transition inline-flex items-center gap-1"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* Artwork Section */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Artwork</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <label htmlFor="hourly-rate" className="text-white/80 text-sm">
            Default hourly rate (R)
          </label>
          <input
            id="hourly-rate"
            type="number"
            step="0.01"
            min="0"
            value={pricing.artwork_hourly_rate}
            onChange={e => updateArtworkRate(parseFloat(e.target.value) || 0)}
            className="bg-black/30 border border-white/10 rounded px-3 py-2 text-white w-32"
          />
        </div>
      </section>

      {/* HP Latex Materials Section */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">HP Latex Materials</h2>
        <div className="space-y-3">
          {pricing.hp_latex_materials.length === 0 && (
            <p className="text-white/50 text-sm italic">No materials added yet.</p>
          )}
          {pricing.hp_latex_materials.map((material, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Material name"
                value={material.name}
                onChange={e => updateMaterial(idx, 'name', e.target.value)}
                className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={material.price}
                onChange={e => updateMaterial(idx, 'price', e.target.value)}
                className="w-28 bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
              />
              <button
                onClick={() => removeMaterial(idx)}
                className="text-red-400 hover:text-red-300 transition p-2"
                title="Remove material"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addMaterial}
          className="mt-4 inline-flex items-center gap-1 text-sm text-[#84cc16] hover:text-lime-400 transition"
        >
          <Plus size={16} /> Add material
        </button>
      </section>

      {/* Save button & messages */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          {message && (
            <span className="text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-md">
              {message}
            </span>
          )}
          {error && (
            <span className="text-sm text-red-400 bg-red-400/10 px-3 py-1 rounded-md">
              {error}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#84cc16] text-black rounded-lg px-5 py-2 font-medium hover:bg-lime-600 transition disabled:opacity-70 inline-flex items-center gap-2"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}