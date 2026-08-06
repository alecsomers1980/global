'use client';

import { useEffect, useState, type FormEvent } from 'react';

const SETTING_KEYS = [
  'delivery_free_threshold',
  'delivery_fee',
  'lead_time',
  'contact_phone',
  'contact_email',
  'whatsapp_number',
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

type SettingsMap = Record<string, string>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields (Rand-denominated strings for money, plain text for others)
  const [freeThresholdRand, setFreeThresholdRand] = useState('');
  const [deliveryFeeRand, setDeliveryFeeRand] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Helper to safely convert cents string (or empty) to Rand display string
  const centsToRandDisplay = (centsStr: string | undefined): string => {
    if (!centsStr) return '0.00';
    const num = Number(centsStr);
    if (Number.isNaN(num)) return '0.00';
    return (num / 100).toFixed(2);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) {
          let msg = 'Failed to load settings';
          try {
            const data = await res.json();
            msg = data.error || msg;
          } catch {}
          throw new Error(msg);
        }
        const data = await res.json();
        const newSettings: SettingsMap = {};
        if (Array.isArray(data.settings)) {
          for (const s of data.settings) {
            newSettings[s.key] = s.value;
          }
        }
        if (!cancelled) {
          setSettings(newSettings);
          // Populate form fields
          setFreeThresholdRand(centsToRandDisplay(newSettings.delivery_free_threshold));
          setDeliveryFeeRand(centsToRandDisplay(newSettings.delivery_fee));
          setLeadTime(newSettings.lead_time || '');
          setContactPhone(newSettings.contact_phone || '');
          setContactEmail(newSettings.contact_email || '');
          setWhatsappNumber(newSettings.whatsapp_number || '');
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load settings');
          setLoading(false);
        }
      }
    };
    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const randToCents = (val: string): string => {
      const parsed = parseFloat(val);
      if (Number.isNaN(parsed)) return '0';
      return String(Math.round(parsed * 100));
    };

    const payload: Record<SettingKey, string> = {
      delivery_free_threshold: randToCents(freeThresholdRand),
      delivery_fee: randToCents(deliveryFeeRand),
      lead_time: leadTime,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      whatsapp_number: whatsappNumber,
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = 'Failed to save settings';
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        throw new Error(msg);
      }

      setMessage('Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="display text-3xl text-text mb-6">SETTINGS</h1>
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="display text-3xl text-text mb-6">SETTINGS</h1>
      <div className="bg-surface rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Free delivery threshold */}
          <div>
            <label htmlFor="freeThreshold" className="block text-sm text-text mb-1">
              Free delivery threshold (R)
            </label>
            <input
              id="freeThreshold"
              type="number"
              step="0.01"
              min="0"
              value={freeThresholdRand}
              onChange={(e) => setFreeThresholdRand(e.target.value)}
              className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text"
            />
          </div>

          {/* Delivery fee */}
          <div>
            <label htmlFor="deliveryFee" className="block text-sm text-text mb-1">
              Delivery fee (R)
            </label>
            <input
              id="deliveryFee"
              type="number"
              step="0.01"
              min="0"
              value={deliveryFeeRand}
              onChange={(e) => setDeliveryFeeRand(e.target.value)}
              className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text"
            />
          </div>

          {/* Lead time */}
          <div>
            <label htmlFor="leadTime" className="block text-sm text-text mb-1">
              Lead time
            </label>
            <input
              id="leadTime"
              type="text"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text"
            />
          </div>

          {/* Contact phone */}
          <div>
            <label htmlFor="contactPhone" className="block text-sm text-text mb-1">
              Contact phone
            </label>
            <input
              id="contactPhone"
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text"
            />
          </div>

          {/* Contact email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm text-text mb-1">
              Contact email
            </label>
            <input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text"
            />
          </div>

          {/* WhatsApp number */}
          <div>
            <label htmlFor="whatsappNumber" className="block text-sm text-text mb-1">
              WhatsApp number
            </label>
            <input
              id="whatsappNumber"
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text"
            />
          </div>

          {/* Error / Message display */}
          {error && <p className="text-sm text-accent">{error}</p>}
          {message && <p className="text-sm text-text">{message}</p>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-canvas px-5 py-2 rounded hover:bg-accent-hi disabled:opacity-50 text-sm font-medium"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}