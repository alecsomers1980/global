'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface CalendarEntry {
  id: string;
  date: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export default function CalendarAdminPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: '', date: '', location: '', type: 'Academic', description: '',
  });

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calendar_entries')
      .select('*')
      .order('date', { ascending: true });
    if (error) setError(error.message);
    else { setEntries(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('calendar_entries').update(formData).eq('id', editingId);
    } else {
      await supabase.from('calendar_entries').insert([formData]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', date: '', location: '', type: 'Academic', description: '' });
    fetchEntries();
  }

  function startEdit(entry: CalendarEntry) {
    setFormData({ title: entry.title, date: entry.date, location: entry.location || '', type: entry.type || 'Academic', description: entry.description || '' });
    setEditingId(entry.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this calendar entry?')) return;
    await supabase.from('calendar_entries').delete().eq('id', id);
    fetchEntries();
  }

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; transform: translateY(-1px); }
        .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 14px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(0,0,0,0.35); border-bottom: 1px solid rgba(0,0,0,0.04); text-align: left; }
        td { padding: 14px 20px; font-size: 14px; color: rgba(0,0,0,0.65); border-bottom: 1px solid rgba(0,0,0,0.04); }
        tr:last-child td { border-bottom: none; }
        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .form-modal { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 36px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .form-modal h3 { font-size: 20px; font-weight: 800; color: #1a2e1d; margin-bottom: 28px; }
        .fg { margin-bottom: 18px; }
        .fg label { display: block; font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .fg input, .fg select, .fg textarea { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #1a2e1d; font-size: 14px; outline: none; }
        .fg input:focus, .fg select:focus, .fg textarea:focus { border-color: #c4a459; background: #fff; }
        .form-actions { display: flex; gap: 12px; margin-top: 28px; }
        .btn-cancel { padding: 10px 20px; background: #f1f5f9; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; color: rgba(0,0,0,0.5); cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-save { padding: 10px 20px; background: #c4a459; border: none; border-radius: 10px; color: #0c1a0f; cursor: pointer; font-weight: 700; font-size: 13px; flex: 1; }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 14px; color: rgba(0,0,0,0.25); transition: color 0.2s; }
        .btn-icon:hover { color: #164e24; }
        .type-badge { display: inline-block; padding: 3px 10px; border-radius: 50px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: rgba(0,0,0,0.04); color: rgba(0,0,0,0.4); }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Calendar</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ title: '', date: '', location: '', type: 'Academic', description: '' }); }}>
          + Add Entry
        </button>
      </div>

      {error ? (
        <div className="error-state">
          <p style={{ fontWeight: 700 }}>Table not found</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Run the SQL script in Supabase to create the calendar_entries table.</p>
        </div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="card"><div className="empty-state">No calendar entries yet. Click &quot;+ Add Entry&quot; to start.</div></div>
      ) : (
        <div className="card">
          <table>
            <thead><tr><th>Date</th><th>Title</th><th>Location</th><th>Type</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td style={{ fontWeight: 600, color: '#1a2e1d' }}>{entry.title}</td>
                  <td>{entry.location || '—'}</td>
                  <td><span className="type-badge">{entry.type}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => startEdit(entry)} title="Edit">✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(entry.id)} title="Delete" style={{ marginLeft: 8 }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit Entry' : 'New Calendar Entry'}</h3>
            <form onSubmit={handleSave}>
              <div className="fg"><label>Title</label><input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="fg"><label>Date</label><input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
                <div className="fg"><label>Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option>Academic</option><option>Sports</option><option>Culture</option><option>Community</option><option>Holiday</option>
                  </select>
                </div>
              </div>
              <div className="fg"><label>Location</label><input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
              <div className="fg"><label>Description</label><textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Add Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
