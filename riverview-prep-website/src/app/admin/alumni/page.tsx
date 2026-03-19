'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface AlumniRecord {
  id: string;
  full_name: string;
  email: string;
  graduation_year: number;
  current_location: string;
  memories: string;
  created_at: string;
}

export default function AlumniAdminPage() {
  const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const [formData, setFormData] = useState({
    full_name: '', email: '', graduation_year: 2020, current_location: '', memories: '',
  });

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('alumni').select('*').order('graduation_year', { ascending: false });
    if (error) setError(error.message);
    else { setAlumni(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAlumni(); }, [fetchAlumni]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('alumni').update(formData).eq('id', editingId);
    } else {
      await supabase.from('alumni').insert([formData]);
    }
    setShowForm(false); setEditingId(null);
    setFormData({ full_name: '', email: '', graduation_year: 2020, current_location: '', memories: '' });
    fetchAlumni();
  }

  function startEdit(record: AlumniRecord) {
    setFormData({ full_name: record.full_name, email: record.email, graduation_year: record.graduation_year || 2020, current_location: record.current_location || '', memories: record.memories || '' });
    setEditingId(record.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this alumni record?')) return;
    await supabase.from('alumni').delete().eq('id', id);
    fetchAlumni();
  }

  const filteredAlumni = alumni.filter(a =>
    a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(a.graduation_year).includes(searchQuery)
  );

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; }
        .search-bar { padding: 10px 16px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #1a2e1d; font-size: 14px; width: 240px; outline: none; }
        .search-bar:focus { border-color: #c4a459; background: #fff; }
        .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 14px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(0,0,0,0.4); border-bottom: 2px solid #f8fafc; text-align: left; background: #fcfdfe; }
        td { padding: 14px 20px; font-size: 14px; color: #1a2e1d; border-bottom: 1px solid rgba(0,0,0,0.04); }
        tr:last-child td { border-bottom: none; }
        .year-badge { display: inline-block; padding: 3px 10px; border-radius: 50px; font-size: 10px; font-weight: 700; background: rgba(168,85,247,0.08); color: #7c3aed; }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0.4; transition: opacity 0.2s; }
        .btn-icon:hover { opacity: 1; }
        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .form-modal { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 36px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .form-modal h3 { font-size: 20px; font-weight: 800; color: #1a2e1d; margin-bottom: 28px; }
        .fg { margin-bottom: 18px; }
        .fg label { display: block; font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .fg input, .fg textarea { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #1a2e1d; font-size: 14px; outline: none; }
        .fg input:focus, .fg textarea:focus { border-color: #c4a459; background: #fff; }
        .form-actions { display: flex; gap: 12px; margin-top: 28px; }
        .btn-cancel { padding: 10px 20px; background: #f1f5f9; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; color: rgba(0,0,0,0.5); cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-save { padding: 10px 20px; background: #c4a459; border: none; border-radius: 10px; color: #0c1a0f; cursor: pointer; font-weight: 700; font-size: 13px; flex: 1; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
        .stats-row { display: flex; gap: 16px; margin-bottom: 24px; }
        .stat-mini { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; padding: 16px 20px; flex: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.01); }
        .stat-mini-value { font-size: 24px; font-weight: 800; color: #1a2e1d; }
        .stat-mini-label { font-size: 11px; color: rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Alumni Database</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <input className="search-bar" placeholder="Search alumni..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ full_name: '', email: '', graduation_year: 2020, current_location: '', memories: '' }); }}>
            + Add Alumni
          </button>
        </div>
      </div>

      {!error && !loading && (
        <div className="stats-row">
          <div className="stat-mini"><div className="stat-mini-value">{alumni.length}</div><div className="stat-mini-label">Total Alumni</div></div>
          <div className="stat-mini"><div className="stat-mini-value">{new Set(alumni.map(a => a.graduation_year)).size}</div><div className="stat-mini-label">Years Represented</div></div>
        </div>
      )}

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Table not found</p><p style={{ fontSize: 13, marginTop: 8 }}>Run the SQL script to create the alumni table.</p></div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : filteredAlumni.length === 0 ? (
        <div className="card"><div className="empty-state">{searchQuery ? 'No results found.' : 'No alumni records yet.'}</div></div>
      ) : (
        <div className="card">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Year</th><th>Location</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {filteredAlumni.map(record => (
                <tr key={record.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{record.full_name}</td>
                  <td>{record.email}</td>
                  <td><span className="year-badge">Class of {record.graduation_year}</span></td>
                  <td>{record.current_location || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => startEdit(record)} title="Edit">✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(record.id)} title="Delete" style={{ marginLeft: 8 }}>🗑️</button>
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
            <h3>{editingId ? 'Edit Alumni Record' : 'Add Alumni'}</h3>
            <form onSubmit={handleSave}>
              <div className="fg"><label>Full Name</label><input required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} /></div>
              <div className="fg"><label>Email</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="fg"><label>Graduation Year</label><input type="number" value={formData.graduation_year} onChange={e => setFormData({ ...formData, graduation_year: parseInt(e.target.value) || 2020 })} /></div>
                <div className="fg"><label>Current Location</label><input value={formData.current_location} onChange={e => setFormData({ ...formData, current_location: e.target.value })} /></div>
              </div>
              <div className="fg"><label>Memories / Notes</label><textarea rows={3} value={formData.memories} onChange={e => setFormData({ ...formData, memories: e.target.value })} /></div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Add Alumni'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
