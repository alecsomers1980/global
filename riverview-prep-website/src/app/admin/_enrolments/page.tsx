'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface Application {
  id: string;
  student_first_name: string;
  student_last_name: string;
  grade_applying: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  previous_school: string;
  status: string;
  created_at: string;
}

export default function EnrolmentsAdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [filter, setFilter] = useState('all');
  const supabase = createClient();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('enrolment_applications').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else { setApplications(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('enrolment_applications').update({ status }).eq('id', id);
    fetchApplications();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  }

  const filtered = applications.filter(a => filter === 'all' || a.status === filter);
  const counts = { all: applications.length, pending: applications.filter(a => a.status === 'pending').length, under_review: applications.filter(a => a.status === 'under_review').length, accepted: applications.filter(a => a.status === 'accepted').length };

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .stats-row { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .stat-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; padding: 16px 20px; min-width: 100px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .stat-num { font-size: 28px; font-weight: 800; color: #1a2e1d; }
        .stat-label { font-size: 10px; color: #c4a459; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
        .filter-row { display: flex; gap: 6px; margin-bottom: 20px; }
        .filter-btn { padding: 6px 16px; border-radius: 6px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; background: transparent; color: rgba(0,0,0,0.4); transition: all 0.15s; }
        .filter-btn.active { background: rgba(196,164,89,0.12); color: #c4a459; }
        .app-table { width: 100%; background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .app-table th { text-align: left; padding: 14px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #c4a459; border-bottom: 1px solid rgba(0,0,0,0.04); background: #fcfdfe; }
        .app-table td { padding: 12px 16px; font-size: 13px; color: rgba(0,0,0,0.6); border-bottom: 1px solid rgba(0,0,0,0.03); }
        .app-table tr:hover td { background: rgba(22,78,36,0.01); cursor: pointer; }
        .badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; }
        .badge-pending { background: rgba(245,158,11,0.1); color: #b45309; }
        .badge-under_review { background: rgba(59,130,246,0.1); color: #1d4ed8; }
        .badge-accepted { background: rgba(34,197,94,0.1); color: #059669; }
        .badge-waitlisted { background: rgba(139,92,246,0.1); color: #6d28d9; }
        .badge-declined { background: rgba(239,68,68,0.08); color: #ef4444; }
        .action-btn { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; color: rgba(0,0,0,0.5); margin-right: 4px; transition: all 0.2s; }
        .action-btn:hover { background: rgba(22,78,36,0.04); color: #164e24; }
        .action-btn.accept { border-color: rgba(34,197,94,0.3); color: #059669; }
        .action-btn.accept:hover { background: rgba(34,197,94,0.08); }
        .detail-panel { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 28px; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.03); font-size: 13px; }
        .detail-label { color: rgba(0,0,0,0.4); font-weight: 600; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Enrolment Applications</h2>
      </div>

      <div className="stats-row">
        {Object.entries(counts).map(([key, count]) => (
          <div key={key} className="stat-card">
            <div className="stat-num">{count}</div>
            <div className="stat-label">{key.replace('_', ' ')}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="empty-state">Table not found — run gold_features_migration.sql in Supabase.</div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No applications yet</p>
          <p style={{ fontSize: 14 }}>Applications submitted via the online enrolment form will appear here.</p>
        </div>
      ) : (
        <>
          <div className="filter-row">
            {['all', 'pending', 'under_review', 'accepted'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? `All (${counts.all})` : `${f.replace('_', ' ')} (${counts[f as keyof typeof counts] || 0})`}
              </button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Parent</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} onClick={() => setSelected(a)}>
                    <td style={{ fontWeight: 600, color: '#1a2e1d' }}>{a.student_first_name} {a.student_last_name}</td>
                    <td>{a.grade_applying}</td>
                    <td>{a.parent_first_name} {a.parent_last_name}</td>
                    <td style={{ fontSize: 12 }}>{a.parent_email}<br />{a.parent_phone}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: 11 }}>{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="detail-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800, color: '#1a2e1d', fontSize: 20 }}>{selected.student_first_name} {selected.student_last_name}</h3>
                <span className={`badge badge-${selected.status}`}>{selected.status.replace('_', ' ')}</span>
              </div>
              <div className="detail-row"><span className="detail-label">Grade</span><span style={{ fontWeight: 600 }}>{selected.grade_applying}</span></div>
              <div className="detail-row"><span className="detail-label">Parent</span><span>{selected.parent_first_name} {selected.parent_last_name}</span></div>
              <div className="detail-row"><span className="detail-label">Email</span><span>{selected.parent_email}</span></div>
              <div className="detail-row"><span className="detail-label">Phone</span><span>{selected.parent_phone}</span></div>
              {selected.previous_school && <div className="detail-row"><span className="detail-label">Previous School</span><span>{selected.previous_school}</span></div>}
              <div className="detail-row"><span className="detail-label">Submitted</span><span>{new Date(selected.created_at).toLocaleString()}</span></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <button onClick={() => updateStatus(selected.id, 'under_review')} className="action-btn">📋 Under Review</button>
                <button onClick={() => updateStatus(selected.id, 'accepted')} className="action-btn accept">✅ Accept</button>
                <button onClick={() => updateStatus(selected.id, 'waitlisted')} className="action-btn">📝 Waitlist</button>
                <button onClick={() => updateStatus(selected.id, 'declined')} className="action-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>✗ Decline</button>
                <a href={`mailto:${selected.parent_email}?subject=Riverview%20Prep%20Application%20-%20${selected.student_first_name}%20${selected.student_last_name}`} className="action-btn" style={{ textDecoration: 'none' }}>✉️ Email Parent</a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
