'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface SettingsProps {
  settings: {
    id: number;
    set_price_cents: number;
    bagtag_price_cents: number;
    collect_price_cents: number;
    pudo_price_cents: number;
    courier_price_cents: number;
  };
}

const centsToRands = (cents: number): string => (cents / 100).toFixed(2);

export default function SettingsForm({ settings }: SettingsProps) {
  const [prices, setPrices] = useState({
    setPrice: centsToRands(settings.set_price_cents),
    bagtagPrice: centsToRands(settings.bagtag_price_cents),
    collectPrice: centsToRands(settings.collect_price_cents),
    pudoPrice: centsToRands(settings.pudo_price_cents),
    courierPrice: centsToRands(settings.courier_price_cents),
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field: keyof typeof prices, value: string) => {
    // Allow any input while editing; validation happens on save
    setPrices((prev) => ({ ...prev, [field]: value }));
    if (status !== 'idle') {
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const validateAndParse = () => {
    const fields: (keyof typeof prices)[] = ['setPrice', 'bagtagPrice', 'collectPrice', 'pudoPrice', 'courierPrice'];
    const result: Record<string, number> = {};
    for (const field of fields) {
      const num = parseFloat(prices[field]);
      if (isNaN(num) || num < 0) {
        setErrorMsg(`Please enter a valid non-negative number for ${field.replace('Price', '').replace('set', 'label set')}.`);
        return null;
      }
      result[`${field.replace('Price', '_price_cents').replace('set_price_cents', 'set_price_cents').replace('bagtag_price_cents', 'bagtag_price_cents').replace('collect_price_cents', 'collect_price_cents').replace('pudo_price_cents', 'pudo_price_cents').replace('courier_price_cents', 'courier_price_cents')}`] = Math.round(num * 100);
    }
    return {
      set_price_cents: Math.round(parseFloat(prices.setPrice) * 100),
      bagtag_price_cents: Math.round(parseFloat(prices.bagtagPrice) * 100),
      collect_price_cents: Math.round(parseFloat(prices.collectPrice) * 100),
      pudo_price_cents: Math.round(parseFloat(prices.pudoPrice) * 100),
      courier_price_cents: Math.round(parseFloat(prices.courierPrice) * 100),
    };
  };

  const handleSave = async () => {
    const body = validateAndParse();
    if (!body) {
      setStatus('error');
      return;
    }
    setSaving(true);
    setStatus('idle');
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save settings');
      }

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (field: keyof typeof prices, label: string) => (
    <label className="block" key={field}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
          R
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={prices[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full pl-7 pr-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-brand-teal outline-none transition text-sm"
          placeholder="0.00"
        />
      </div>
    </label>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderInput('setPrice', 'Label set price')}
        {renderInput('bagtagPrice', 'Bag tag price')}
        {renderInput('collectPrice', 'Collection price')}
        {renderInput('pudoPrice', 'Pudo locker price')}
        {renderInput('courierPrice', 'Courier Guy price')}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-brand-pink hover:bg-pink-600 text-white font-medium py-2 px-5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save prices'}
        </button>
        {status === 'success' && (
          <span className="text-green-600 text-sm font-medium">Saved</span>
        )}
        {status === 'error' && (
          <span className="text-red-600 text-sm font-medium">{errorMsg}</span>
        )}
      </div>
    </div>
  );
}