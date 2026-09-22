'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function NewPermissionSlipPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ title: '', description: '', event_date: '', due_date: '', status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { error: insertErr } = await supabase.from('permission_slips').insert({
      title: form.title,
      description: form.description,
      event_date: form.event_date || null,
      due_date: form.due_date || null,
      status: form.status,
    });

    if (insertErr) {
      setError(insertErr.message);
      setSaving(false);
    } else {
      router.push('/admin/permission-slips');
    }
  }

  return (
    <div>
      <style>{`
        .form-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 32px; max-width: 640px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: rgba(0,0,0,0.5); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .form-input { width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; font-size: 14px; color: #1a2e1d; background: #f8fafc; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .form-input:focus { border-color: #c4a459; background: #fff; }
        textarea.form-input { resize: vertical; min-height: 100px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
        .form-select { width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; font-size: 14px; color: #1a2e1d; background: #f8fafc; outline: none; font-family: inherit; }
        .form-select:focus { border-color: #c4a459; background: #fff; }
        .btn-save { background: #c4a459; color: #0c1a0f; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-save:hover { background: #d4b469; transform: translateY(-1px); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-cancel { background: none; border: 1px solid rgba(0,0,0,0.08); color: rgba(0,0,0,0.4); padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
        .btn-cancel:hover { background: #f8fafc; }
        .error-msg { padding: 12px 16px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 8px; color: #ef4444; font-size: 13px; margin-bottom: 16px; }
        .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .back-link { color: rgba(0,0,0,0.4); text-decoration: none; font-size: 14px; font-weight: 600; }
        .back-link:hover { color: #164e24; }
      `}</style>

      <div className="page-header">
        <Link href="/admin/permission-slips" className="back-link">← Back</Link>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>New Permission Slip</h2>
      </div>

      <div className="form-card">
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text" required
              className="form-input"
              placeholder="e.g., Grade 7 Camp Consent Form"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              className="form-input"
              placeholder="Provide details about the event, what parents are consenting to, and any important information..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input
                type="date"
                className="form-input"
                value={form.event_date}
                onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Response Due Date</label>
              <input
                type="date"
                className="form-input"
                value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            >
              <option value="draft">Draft — not visible to parents</option>
              <option value="active">Active — parents can respond</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Creating...' : 'Create Permission Slip'}
            </button>
            <Link href="/admin/permission-slips" className="btn-cancel">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
