'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  category: string;
  bio: string;
  image_url: string;
  sort_order: number;
}

export default function StaffAdminPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '', role: '', category: 'Administration', bio: '', image_url: '', sort_order: 0,
  });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff').select('*').order('sort_order', { ascending: true });
    if (error) setError(error.message);
    else { setStaff(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('staff').update(formData).eq('id', editingId);
    } else {
      await supabase.from('staff').insert([formData]);
    }
    setShowForm(false); setEditingId(null);
    setFormData({ name: '', role: '', category: 'Administration', bio: '', image_url: '', sort_order: 0 });
    fetchStaff();
  }

  function startEdit(member: StaffMember) {
    setFormData({ name: member.name, role: member.role, category: member.category || 'Administration', bio: member.bio || '', image_url: member.image_url || '', sort_order: member.sort_order || 0 });
    setEditingId(member.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this staff member?')) return;
    await supabase.from('staff').delete().eq('id', id);
    fetchStaff();
  }

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; }
        .staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .staff-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 24px; transition: all 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .staff-card:hover { border-color: rgba(22,78,36,0.15); box-shadow: 0 12px 24px rgba(0,0,0,0.04); }
        .staff-avatar { width: 48px; height: 48px; border-radius: 12px; background: rgba(196,164,89,0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; color: #c4a459; font-weight: 700; }
        .staff-name { font-size: 16px; font-weight: 700; color: #1a2e1d; margin-bottom: 4px; }
        .staff-role { font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px; }
        .staff-category { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; background: rgba(22,78,36,0.08); color: #164e24; display: inline-block; margin-bottom: 12px; }
        .staff-actions { display: flex; gap: 8px; margin-top: 12px; border-top: 1px solid rgba(0,0,0,0.04); padding-top: 12px; }
        .btn-sm { padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; color: rgba(0,0,0,0.5); }
        .btn-sm:hover { background: rgba(22,78,36,0.04); color: #164e24; border-color: rgba(22,78,36,0.1); }
        .btn-sm.del { border-color: rgba(239,68,68,0.15); color: rgba(239,68,68,0.5); }
        .btn-sm.del:hover { background: rgba(239,68,68,0.05); color: #ef4444; }
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
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Staff Directory</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', role: '', category: 'Administration', bio: '', image_url: '', sort_order: 0 }); }}>
          + Add Staff Member
        </button>
      </div>

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Table not found</p><p style={{ fontSize: 13, marginTop: 8 }}>Run the SQL script to create the staff table.</p></div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : staff.length === 0 ? (
        <div className="empty-state"><p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No staff members yet</p></div>
      ) : (
        <div className="staff-grid">
          {staff.map(member => (
            <div key={member.id} className="staff-card">
              <div className="staff-avatar">{member.name.charAt(0)}</div>
              <div className="staff-name">{member.name}</div>
              <div className="staff-role">{member.role}</div>
              <span className="staff-category">{member.category}</span>
              <div className="staff-actions">
                <button className="btn-sm" onClick={() => startEdit(member)}>Edit</button>
                <button className="btn-sm del" onClick={() => handleDelete(member.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
            <form onSubmit={handleSave}>
              <div className="fg"><label>Full Name</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="fg"><label>Role / Title</label><input required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Principal, Grade 3 Teacher" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="fg"><label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option>Administration</option><option>Pre-School</option><option>Primary</option><option>Support Staff</option>
                  </select>
                </div>
                <div className="fg"><label>Sort Order</label><input type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="fg"><label>Bio</label><textarea rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} /></div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
