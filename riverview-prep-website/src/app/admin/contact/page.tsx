'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function ContactFormAdminPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const supabase = createClient();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else { setSubmissions(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('contact_submissions').update({ status }).eq('id', id);
    fetchSubmissions();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this submission?')) return;
    await supabase.from('contact_submissions').delete().eq('id', id);
    if (selectedId === id) setSelectedId(null);
    fetchSubmissions();
  }

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);
  const selected = submissions.find(s => s.id === selectedId);
  const unreadCount = submissions.filter(s => s.status === 'new').length;

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .inbox-layout { display: grid; grid-template-columns: 380px 1fr; gap: 20px; min-height: 500px; }
        @media (max-width: 900px) { .inbox-layout { grid-template-columns: 1fr; } }
        .inbox-list { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .inbox-filters { display: flex; gap: 4px; padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); background: #fcfdfe; }
        .filter-btn { padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; background: transparent; color: rgba(0,0,0,0.4); transition: all 0.15s; }
        .filter-btn.active { background: rgba(196,164,89,0.12); color: #c4a459; }
        .filter-btn:hover { color: rgba(0,0,0,0.6); }
        .inbox-items { flex: 1; overflow-y: auto; }
        .inbox-item { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.04); cursor: pointer; transition: all 0.15s; }
        .inbox-item:hover { background: #f8fafc; }
        .inbox-item.active { background: rgba(196,164,89,0.06); border-left: 3px solid #c4a459; }
        .inbox-item.unread { border-left: 3px solid #3b82f6; }
        .inbox-sender { font-weight: 700; color: #1a2e1d; font-size: 14px; margin-bottom: 2px; }
        .inbox-subject { font-size: 13px; color: rgba(0,0,0,0.45); margin-bottom: 4px; }
        .inbox-preview { font-size: 12px; color: rgba(0,0,0,0.25); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .inbox-time { font-size: 10px; color: rgba(0,0,0,0.2); float: right; }
        .detail-panel { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .detail-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(0,0,0,0.2); font-size: 14px; }
        .detail-header { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .detail-sender { font-size: 22px; font-weight: 800; color: #1a2e1d; margin-bottom: 4px; }
        .detail-email { font-size: 13px; color: rgba(0,0,0,0.45); }
        .detail-phone { font-size: 13px; color: rgba(0,0,0,0.45); margin-top: 2px; }
        .detail-subject { font-size: 16px; font-weight: 700; color: #c4a459; margin-bottom: 16px; }
        .detail-body { font-size: 14px; color: #1a2e1d; line-height: 1.8; white-space: pre-wrap; opacity: 0.85; }
        .detail-actions { display: flex; gap: 8px; margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05); }
        .btn-action { padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; color: rgba(0,0,0,0.5); }
        .btn-action:hover { background: rgba(22,78,36,0.04); color: #164e24; border-color: rgba(22,78,36,0.1); }
        .btn-action.replied { border-color: rgba(34,197,94,0.3); color: #059669; }
        .btn-action.replied:hover { background: rgba(34,197,94,0.08); }
        .btn-action.del { border-color: rgba(239,68,68,0.15); color: rgba(239,68,68,0.5); }
        .btn-action.del:hover { background: rgba(239,68,68,0.05); color: #ef4444; }
        .unread-badge { background: #3b82f6; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 50px; margin-left: 8px; }
        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
        .status-dot.new { background: #3b82f6; }
        .status-dot.read { background: rgba(0,0,0,0.1); }
        .status-dot.replied { background: #22c55e; }
        .status-dot.archived { background: rgba(0,0,0,0.05); }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
      `}</style>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Contact Inbox</h2>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount} new</span>}
        </div>
      </div>

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Table not found</p><p style={{ fontSize: 13, marginTop: 8 }}>Run the Phase 9 SQL script to create the contact_submissions table.</p></div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="empty-state"><p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No submissions yet</p><p style={{ fontSize: 14 }}>Submissions from the website contact form will appear here.</p></div>
      ) : (
        <div className="inbox-layout">
          <div className="inbox-list">
            <div className="inbox-filters">
              {['all', 'new', 'read', 'replied', 'archived'].map(f => (
                <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? `All (${submissions.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${submissions.filter(s => s.status === f).length})`}
                </button>
              ))}
            </div>
            <div className="inbox-items">
              {filtered.map(s => (
                <div key={s.id} className={`inbox-item ${selectedId === s.id ? 'active' : ''} ${s.status === 'new' ? 'unread' : ''}`} onClick={() => { setSelectedId(s.id); if (s.status === 'new') updateStatus(s.id, 'read'); }}>
                  <span className="inbox-time">{new Date(s.created_at).toLocaleDateString()}</span>
                  <div className="inbox-sender"><span className={`status-dot ${s.status}`} />{s.name}</div>
                  <div className="inbox-subject">{s.subject || 'No subject'}</div>
                  <div className="inbox-preview">{s.message}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-panel">
            {selected ? (
              <>
                <div className="detail-header">
                  <div className="detail-sender">{selected.name}</div>
                  <div className="detail-email">📧 {selected.email}</div>
                  {selected.phone && <div className="detail-phone">📞 {selected.phone}</div>}
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 8 }}>
                    Received: {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                {selected.subject && <div className="detail-subject">{selected.subject}</div>}
                <div className="detail-body">{selected.message}</div>
                <div className="detail-actions">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your enquiry'}`} className="btn-action replied" style={{ textDecoration: 'none' }}>✉️ Reply via Email</a>
                  <button className="btn-action" onClick={() => updateStatus(selected.id, 'replied')}>✅ Mark Replied</button>
                  <button className="btn-action" onClick={() => updateStatus(selected.id, 'archived')}>📦 Archive</button>
                  <button className="btn-action del" onClick={() => handleDelete(selected.id)}>🗑️ Delete</button>
                </div>
              </>
            ) : (
              <div className="detail-empty">Select a message to view</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
