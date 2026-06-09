'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

interface PermissionSlip {
  id: string;
  title: string;
  event_date: string;
  due_date: string;
  status: string;
  token: string;
  created_at: string;
  response_count: number;
}

export default function PermissionSlipsAdminPage() {
  const [slips, setSlips] = useState<PermissionSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSlips = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('permission_slips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { setError(error.message); setLoading(false); return; }

    // Get response counts for each slip
    const slipsWithCounts = await Promise.all(
      (data || []).map(async (slip) => {
        const { count } = await supabase
          .from('permission_slip_responses')
          .select('id', { count: 'exact', head: true })
          .eq('slip_id', slip.id);
        return { ...slip, response_count: count || 0 };
      })
    );

    setSlips(slipsWithCounts);
    setError(null);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchSlips(); }, [fetchSlips]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this permission slip? All responses will also be deleted.')) return;
    setDeleting(id);
    await supabase.from('permission_slips').delete().eq('id', id);
    setDeleting(null);
    fetchSlips();
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await supabase.from('permission_slips').update({ status: newStatus }).eq('id', id);
    fetchSlips();
  }

  function copyLink(token: string) {
    const link = `${window.location.origin}/permission-slip/${token}`;
    navigator.clipboard.writeText(link);
    alert('Response link copied to clipboard! Share this with parents.');
  }

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; transition: all 0.2s; border: none; cursor: pointer; }
        .btn-primary:hover { background: #d4b469; transform: translateY(-1px); }
        .slips-table { width: 100%; background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .slips-table th { text-align: left; padding: 16px 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #c4a459; border-bottom: 1px solid rgba(0,0,0,0.04); background: #fcfdfe; }
        .slips-table td { padding: 16px 20px; font-size: 13px; color: rgba(0,0,0,0.6); border-bottom: 1px solid rgba(0,0,0,0.03); }
        .slips-table tr:last-child td { border-bottom: none; }
        .slips-table tr:hover td { background: rgba(22,78,36,0.01); }
        .badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; display: inline-block; }
        .badge-draft { background: rgba(0,0,0,0.04); color: rgba(0,0,0,0.4); }
        .badge-active { background: rgba(34,197,94,0.1); color: #059669; }
        .badge-closed { background: rgba(239,68,68,0.08); color: #ef4444; }
        .action-btn { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; color: rgba(0,0,0,0.5); margin-right: 6px; }
        .action-btn:hover { background: rgba(22,78,36,0.04); color: #164e24; border-color: rgba(22,78,36,0.1); }
        .action-btn.danger { border-color: rgba(239,68,68,0.15); color: rgba(239,68,68,0.5); }
        .action-btn.danger:hover { background: rgba(239,68,68,0.05); color: #ef4444; }
        .action-btn.copy { border-color: rgba(59,130,246,0.3); color: #3b82f6; }
        .action-btn.copy:hover { background: rgba(59,130,246,0.05); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
        @media (max-width: 768px) { .slips-table { font-size: 11px; } .slips-table th, .slips-table td { padding: 12px 10px; } }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Permission Slips</h2>
        <Link href="/admin/permission-slips/new" className="btn-primary">+ New Permission Slip</Link>
      </div>

      {error ? (
        <div className="error-state">
          <p style={{ fontWeight: 700 }}>Table not found</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Run the permission_slips_migration.sql script in your Supabase SQL Editor.</p>
        </div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : slips.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No permission slips yet</p>
          <p style={{ fontSize: 14 }}>Create your first digital permission slip to start collecting parent consent.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="slips-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Event Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Responses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slips.map(slip => (
                <tr key={slip.id}>
                  <td style={{ fontWeight: 600, color: '#1a2e1d' }}>{slip.title}</td>
                  <td>{slip.event_date || '—'}</td>
                  <td>{slip.due_date || '—'}</td>
                  <td>
                    <span className={`badge badge-${slip.status}`}>{slip.status}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#164e24' }}>{slip.response_count}</td>
                  <td>
                    <Link href={`/admin/permission-slips/${slip.id}`} className="action-btn">View</Link>
                    <Link href={`/admin/permission-slips/${slip.id}/edit`} className="action-btn">Edit</Link>
                    <button onClick={() => copyLink(slip.token)} className="action-btn copy" title="Copy parent response link">Link</button>
                    <button onClick={() => handleToggleStatus(slip.id, slip.status)} className="action-btn">
                      {slip.status === 'active' ? 'Close' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(slip.id)} className="action-btn danger" disabled={deleting === slip.id}>
                      {deleting === slip.id ? '...' : 'Del'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
