'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
}

const defaultSettings = [
  { key: 'site_title', label: 'Site Title', category: 'SEO', placeholder: 'Riverview Preparatory School' },
  { key: 'site_description', label: 'Meta Description', category: 'SEO', placeholder: 'A premier private school...' },
  { key: 'og_image', label: 'OG Image URL', category: 'SEO', placeholder: 'https://...' },
  { key: 'school_phone', label: 'Phone Number', category: 'Contact', placeholder: '+27 11 xxx xxxx' },
  { key: 'school_email', label: 'Email Address', category: 'Contact', placeholder: 'info@riverviewprep.co.za' },
  { key: 'school_address', label: 'Physical Address', category: 'Contact', placeholder: '123 School Road...' },
  { key: 'facebook_url', label: 'Facebook URL', category: 'Social', placeholder: 'https://facebook.com/...' },
  { key: 'instagram_url', label: 'Instagram URL', category: 'Social', placeholder: 'https://instagram.com/...' },
  { key: 'twitter_url', label: 'Twitter/X URL', category: 'Social', placeholder: 'https://x.com/...' },
  { key: 'bank_name', label: 'Bank Name', category: 'Banking', placeholder: '' },
  { key: 'account_holder', label: 'Account Holder', category: 'Banking', placeholder: '' },
  { key: 'account_number', label: 'Account Number', category: 'Banking', placeholder: '' },
  { key: 'branch_code', label: 'Branch Code', category: 'Banking', placeholder: '' },
  { key: 'account_type', label: 'Account Type', category: 'Banking', placeholder: 'Cheque / Savings' },
];

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('*');
    if (error) setError(error.message);
    else {
      const map: Record<string, string> = {};
      (data || []).forEach((s: Setting) => { map[s.key] = s.value; });
      setSettings(map);
      setError(null);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  function updateSetting(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => {
      const category = defaultSettings.find(s => s.key === key)?.category || 'General';
      return { key, value, category };
    });

    for (const item of upserts) {
      await supabase.from('settings').upsert(item, { onConflict: 'key' });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const categories = Array.from(new Set(defaultSettings.map(s => s.category)));

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-save { background: #c4a459; color: #0c1a0f; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-save:hover { background: #d4b469; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-saved { background: #22c55e !important; }
        .settings-section { margin-bottom: 36px; }
        .settings-section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #c4a459; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(196,164,89,0.12); }
        .settings-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .setting-row { display: grid; grid-template-columns: 200px 1fr; gap: 20px; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(0,0,0,0.03); }
        .setting-row:last-child { border-bottom: none; }
        .setting-label { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.6); }
        .setting-input { width: 100%; padding: 10px 14px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; color: #1a2e1d; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .setting-input:focus { border-color: #c4a459; background: #fff; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
        @media (max-width: 768px) { .setting-row { grid-template-columns: 1fr; gap: 6px; } }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Settings</h2>
        <button
          className={`btn-save ${saved ? 'btn-saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All Changes'}
        </button>
      </div>

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Table not found</p><p style={{ fontSize: 13, marginTop: 8 }}>Run the Phase 9 SQL script to create the settings table.</p></div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : (
        <div style={{ maxWidth: 800 }}>
          {categories.map(cat => (
            <div key={cat} className="settings-section">
              <h3 className="settings-section-title">{cat}</h3>
              <div className="settings-card">
                {defaultSettings.filter(s => s.category === cat).map(s => (
                  <div key={s.key} className="setting-row">
                    <label className="setting-label">{s.label}</label>
                    <input
                      className="setting-input"
                      value={settings[s.key] || ''}
                      onChange={e => updateSetting(s.key, e.target.value)}
                      placeholder={s.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
