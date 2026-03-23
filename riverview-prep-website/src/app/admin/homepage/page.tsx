'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

/* ── Types ──────────────────────────────────────────── */
interface Testimonial { id: string; quote: string; name: string; role: string; initials: string; sort_order: number; }

export default function HomepageManagerPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('homepage_testimonials').select('*').order('sort_order');
      if (error) throw error;
      setTestimonials(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) await supabase.from('homepage_testimonials').update(formData).eq('id', editingId);
    else await supabase.from('homepage_testimonials').insert([formData]);
    setShowModal(false); setEditingId(null); fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    await supabase.from('homepage_testimonials').delete().eq('id', id);
    fetchData();
  }

  function openCreate() { 
    setFormData({ quote: '', name: '', role: '', initials: '', sort_order: 0 }); 
    setEditingId(null); 
    setShowModal(true); 
  }
  
  function openEdit(id: string, data: any) { 
    setFormData(data); 
    setEditingId(id); 
    setShowModal(true); 
  }

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .btn-primary { background: #c4a459; color: #1a2e1d; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; }
        .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 14px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(0,0,0,0.4); border-bottom: 2px solid #f8fafc; text-align: left; background: #fcfdfe; }
        td { padding: 14px 20px; font-size: 14px; color: #1a2e1d; border-bottom: 1px solid rgba(0,0,0,0.04); }
        tr:last-child td { border-bottom: none; }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0.4; transition: opacity 0.2s; }
        .btn-icon:hover { opacity: 1; }
        .btn-icon.del:hover { color: #ef4444; }
        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .form-modal { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 36px; width: 100%; max-width: 560px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .form-modal h3 { font-size: 20px; font-weight: 800; color: #1a2e1d; margin-bottom: 28px; }
        .fg { margin-bottom: 16px; }
        .fg label { display: block; font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .fg input, .fg textarea { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #1a2e1d; font-size: 14px; outline: none; }
        .fg input:focus, .fg textarea:focus { border-color: #c4a459; background: #fff; }
        .form-actions { display: flex; gap: 12px; margin-top: 24px; }
        .btn-cancel { padding: 10px 20px; background: #f1f5f9; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; color: rgba(0,0,0,0.5); cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-save { padding: 10px 20px; background: #c4a459; border: none; border-radius: 10px; color: #1a2e1d; cursor: pointer; font-weight: 700; font-size: 13px; flex: 1; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .empty-state { padding: 50px; text-align: center; color: rgba(0,0,0,0.3); }
        .info-banner { background: rgba(196,164,89,0.04); border: 1px solid rgba(196,164,89,0.1); border-radius: 12px; padding: 14px 20px; margin-bottom: 20px; color: #c4a459; font-size: 12px; line-height: 1.6; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Homepage Manager</h2>
        <button className="btn-primary" onClick={openCreate}>+ Add Testimonial</button>
      </div>

      <div className="info-banner">
        💬 <strong>Testimonials Manager</strong> — Edit the testimonials that appear on the public homepage. 
        Note: Core values and Associations are now static, and Events are managed in the main Events section.
      </div>

      {error ? (
        <div className="empty-state">Error: {error}</div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : (
        <div className="card">
          {testimonials.length === 0 ? <div className="empty-state">No testimonials. Add one above.</div> : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Quote</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map(t => (
                  <tr key={t.id}>
                    <td>{t.sort_order}</td>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>{t.role}</td>
                    <td style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      &ldquo;{t.quote}&rdquo;
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon" onClick={() => openEdit(t.id, t)}>✏️</button>
                      <button className="btn-icon del" onClick={() => handleDelete(t.id)} style={{ marginLeft: 8 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Modal Form ─── */}
      {showModal && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit' : 'Add'} Testimonial</h3>
            <form onSubmit={handleSave}>
              <div className="fg">
                <label>Quote</label>
                <textarea rows={3} required value={formData.quote || ''} onChange={e => setFormData({ ...formData, quote: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="fg">
                  <label>Name</label>
                  <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="fg">
                  <label>Initials</label>
                  <input value={formData.initials || ''} onChange={e => setFormData({ ...formData, initials: e.target.value })} placeholder="e.g. SF" />
                </div>
              </div>
              <div className="grid-2">
                <div className="fg">
                  <label>Role</label>
                  <input value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Parent — Grade 4" />
                </div>
                <div className="fg">
                  <label>Sort Order</label>
                  <input type="number" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
