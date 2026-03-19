'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface Announcement {
  id: string;
  message: string;
  urgency: string;
  is_active: boolean;
  link_url: string;
  link_text: string;
  created_at: string;
}

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    message: '', urgency: 'info', is_active: true, link_url: '', link_text: '',
  });

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else { setAnnouncements(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('announcements').update(formData).eq('id', editingId);
    } else {
      await supabase.from('announcements').insert([formData]);
    }
    setShowForm(false); setEditingId(null);
    setFormData({ message: '', urgency: 'info', is_active: true, link_url: '', link_text: '' });
    fetchAnnouncements();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('announcements').update({ is_active: !current }).eq('id', id);
    fetchAnnouncements();
  }

  function startEdit(a: Announcement) {
    setFormData({ message: a.message, urgency: a.urgency, is_active: a.is_active, link_url: a.link_url || '', link_text: a.link_text || '' });
    setEditingId(a.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetchAnnouncements();
  }

  const urgencyColors: Record<string, { bg: string; border: string; color: string; label: string }> = {
    info: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', color: '#60a5fa', label: 'ℹ️ Info' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24', label: '⚠️ Warning' },
    urgent: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#f87171', label: '🚨 Urgent' },
  };

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; }
        .info-banner { background: rgba(59,130,246,0.04); border: 1px solid rgba(59,130,246,0.1); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; color: #1e40af; font-size: 13px; line-height: 1.6; }
        .ann-list { display: flex; flex-direction: column; gap: 12px; }
        .ann-card { border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; gap: 20px; transition: all 0.2s; background: #ffffff; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .ann-toggle { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: all 0.25s; flex-shrink: 0; }
        .ann-toggle.on { background: #22c55e; }
        .ann-toggle.off { background: rgba(0,0,0,0.08); }
        .ann-toggle::after { content: ''; position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: all 0.25s; }
        .ann-toggle.on::after { left: 23px; }
        .ann-toggle.off::after { left: 3px; }
        .ann-content { flex: 1; }
        .ann-message { font-size: 15px; font-weight: 600; color: #1a2e1d; margin-bottom: 4px; }
        .ann-meta { display: flex; gap: 12px; align-items: center; }
        .ann-urgency { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; }
        .ann-date { font-size: 11px; color: rgba(0,0,0,0.3); }
        .ann-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .btn-sm { padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; color: rgba(0,0,0,0.5); }
        .btn-sm:hover { background: rgba(22,78,36,0.04); color: #164e24; border-color: rgba(22,78,36,0.1); }
        .btn-sm.del { border-color: rgba(239,68,68,0.15); color: rgba(239,68,68,0.5); }
        .btn-sm.del:hover { background: rgba(239,68,68,0.05); color: #ef4444; }
        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .form-modal { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 36px; width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
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
        .preview-bar { border-radius: 12px; padding: 12px 20px; text-align: center; font-size: 14px; font-weight: 700; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Announcements</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ message: '', urgency: 'info', is_active: true, link_url: '', link_text: '' }); }}>
          + New Announcement
        </button>
      </div>

      <div className="info-banner">
        💡 <strong>How it works:</strong> Active announcements appear as a banner at the top of every page on the public website. Toggle announcements on/off instantly. Only <strong>one</strong> should be active at a time for best results.
      </div>

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Table not found</p><p style={{ fontSize: 13, marginTop: 8 }}>Run the Phase 9 SQL script to create the announcements table.</p></div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : announcements.length === 0 ? (
        <div className="empty-state"><p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No announcements yet</p><p style={{ fontSize: 14 }}>Create one to display a banner on the website.</p></div>
      ) : (
        <>
          {/* Live Preview */}
          {announcements.filter(a => a.is_active).length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Live Preview</p>
              {announcements.filter(a => a.is_active).map(a => {
                const u = urgencyColors[a.urgency] || urgencyColors.info;
                return (
                  <div key={a.id} className="preview-bar" style={{ background: u.bg, border: `1px solid ${u.border}`, color: u.color }}>
                    {a.message} {a.link_text && <span style={{ textDecoration: 'underline', marginLeft: 8 }}>{a.link_text} →</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="ann-list">
            {announcements.map(a => {
              const u = urgencyColors[a.urgency] || urgencyColors.info;
              return (
                <div key={a.id} className="ann-card" style={{ background: a.is_active ? u.bg : 'rgba(255,255,255,0.015)', border: `1px solid ${a.is_active ? u.border : 'rgba(255,255,255,0.06)'}` }}>
                  <button className={`ann-toggle ${a.is_active ? 'on' : 'off'}`} onClick={() => toggleActive(a.id, a.is_active)} title={a.is_active ? 'Deactivate' : 'Activate'} />
                  <div className="ann-content">
                    <div className="ann-message" style={{ opacity: a.is_active ? 1 : 0.4 }}>{a.message}</div>
                    <div className="ann-meta">
                      <span className="ann-urgency" style={{ background: u.bg, color: u.color, border: `1px solid ${u.border}` }}>{u.label}</span>
                      <span className="ann-date">{new Date(a.created_at).toLocaleDateString()}</span>
                      {a.link_url && <span className="ann-date">🔗 Has link</span>}
                    </div>
                  </div>
                  <div className="ann-actions">
                    <button className="btn-sm" onClick={() => startEdit(a)}>Edit</button>
                    <button className="btn-sm del" onClick={() => handleDelete(a.id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showForm && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
            <form onSubmit={handleSave}>
              <div className="fg"><label>Message</label><textarea rows={3} required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="e.g. School closed Monday 24 March — Public Holiday" /></div>
              <div className="fg"><label>Urgency Level</label>
                <select value={formData.urgency} onChange={e => setFormData({ ...formData, urgency: e.target.value })}>
                  <option value="info">ℹ️ Info — General notice</option>
                  <option value="warning">⚠️ Warning — Important notice</option>
                  <option value="urgent">🚨 Urgent — Critical alert</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="fg"><label>Link URL (optional)</label><input value={formData.link_url} onChange={e => setFormData({ ...formData, link_url: e.target.value })} placeholder="https://..." /></div>
                <div className="fg"><label>Link Text</label><input value={formData.link_text} onChange={e => setFormData({ ...formData, link_text: e.target.value })} placeholder="e.g. View Details" /></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
