'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface Photo {
  id: string;
  submitter_name: string;
  submitter_email: string;
  event_name: string;
  description: string;
  image_url: string;
  gallery_category: string;
  status: string;
  created_at: string;
}

export default function CommunityPhotosAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('pending');
  const supabase = createClient();

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('community_photos').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else { setPhotos(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('community_photos').update({ status }).eq('id', id);
    fetchPhotos();
  }

  const filtered = photos.filter(p => filter === 'all' || p.status === filter);
  const pendingCount = photos.filter(p => p.status === 'pending').length;

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .filter-row { display: flex; gap: 6px; margin-bottom: 20px; }
        .filter-btn { padding: 6px 16px; border-radius: 6px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; background: transparent; color: rgba(0,0,0,0.4); transition: all 0.15s; }
        .filter-btn.active { background: rgba(196,164,89,0.12); color: #c4a459; }
        .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .photo-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); transition: all 0.2s; }
        .photo-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.04); }
        .photo-img { width: 100%; height: 200px; object-fit: cover; display: block; }
        .photo-info { padding: 16px; }
        .photo-submitter { font-weight: 700; color: #1a2e1d; font-size: 14px; }
        .photo-event { font-size: 12px; color: #c4a459; margin-top: 2px; }
        .photo-desc { font-size: 12px; color: rgba(0,0,0,0.45); margin-top: 4px; line-height: 1.4; }
        .photo-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid rgba(0,0,0,0.04); background: #fcfdfe; }
        .badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; }
        .badge-pending { background: rgba(245,158,11,0.1); color: #b45309; }
        .badge-approved { background: rgba(34,197,94,0.1); color: #059669; }
        .badge-declined { background: rgba(239,68,68,0.08); color: #ef4444; }
        .action-btn { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; color: rgba(0,0,0,0.5); transition: all 0.2s; }
        .action-btn:hover { color: #164e24; }
        .action-btn.approve { border-color: rgba(34,197,94,0.3); color: #059669; }
        .action-btn.approve:hover { background: rgba(34,197,94,0.08); }
        .action-btn.decline { border-color: rgba(239,68,68,0.15); color: rgba(239,68,68,0.5); }
        .action-btn.decline:hover { background: rgba(239,68,68,0.05); color: #ef4444; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .pending-dot { display: inline-block; width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; margin-right: 6px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>
          Community Photos
          {pendingCount > 0 && <span style={{ fontSize: 14, fontWeight: 500, color: '#b45309', marginLeft: 12 }}><span className="pending-dot" />{pendingCount} pending</span>}
        </h2>
      </div>

      <div className="filter-row">
        {['pending', 'all', 'approved', 'declined'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${photos.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      {error ? (
        <div className="empty-state">Table not found — run gold_features_migration.sql in Supabase.</div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No photos to review</p>
          <p style={{ fontSize: 14 }}>Photos submitted by parents will appear here for approval.</p>
        </div>
      ) : (
        <div className="photo-grid">
          {filtered.map(p => (
            <div key={p.id} className="photo-card">
              <img src={p.image_url} alt={p.event_name || 'Community photo'} className="photo-img" onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-event.jpg'; }} />
              <div className="photo-info">
                <div className="photo-submitter">{p.submitter_name}</div>
                {p.event_name && <div className="photo-event">{p.event_name}</div>}
                {p.description && <div className="photo-desc">{p.description}</div>}
                <div style={{ marginTop: 8 }}><span className={`badge badge-${p.status}`}>{p.status}</span></div>
              </div>
              {p.status === 'pending' && (
                <div className="photo-actions">
                  <button onClick={() => updateStatus(p.id, 'approved')} className="action-btn approve">✓ Approve</button>
                  <button onClick={() => updateStatus(p.id, 'declined')} className="action-btn decline">✗ Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
