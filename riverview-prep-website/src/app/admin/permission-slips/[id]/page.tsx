'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

interface Response {
  id: string;
  parent_name: string;
  parent_email: string;
  student_name: string;
  consent_given: boolean;
  notes: string;
  submitted_at: string;
}

interface Slip {
  id: string;
  title: string;
  description: string;
  event_date: string;
  due_date: string;
  status: string;
  token: string;
}

export default function PermissionSlipDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [slip, setSlip] = useState<Slip | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: slipData, error: slipErr } = await supabase
      .from('permission_slips').select('*').eq('id', id).single();

    if (slipErr) { setError(slipErr.message); setLoading(false); return; }
    setSlip(slipData);

    const { data: respData } = await supabase
      .from('permission_slip_responses')
      .select('*')
      .eq('slip_id', id)
      .order('submitted_at', { ascending: false });

    setResponses(respData || []);
    setError(null);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const responseLink = slip ? `${window.location.origin}/permission-slip/${slip.token}` : '';

  return (
    <div>
      <style>{`
        .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .back-link { color: rgba(0,0,0,0.4); text-decoration: none; font-size: 14px; font-weight: 600; }
        .back-link:hover { color: #164e24; }
        .detail-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 28px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .detail-title { font-size: 24px; font-weight: 800; color: #1a2e1d; margin-bottom: 8px; }
        .detail-desc { font-size: 14px; color: rgba(0,0,0,0.55); line-height: 1.7; margin-bottom: 16px; white-space: pre-wrap; }
        .detail-meta { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; }
        .meta-item { font-size: 12px; }
        .meta-label { font-weight: 700; color: #c4a459; text-transform: uppercase; letter-spacing: 1px; font-size: 10px; }
        .meta-value { color: rgba(0,0,0,0.5); margin-top: 2px; }
        .badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; }
        .badge-draft { background: rgba(0,0,0,0.04); color: rgba(0,0,0,0.4); }
        .badge-active { background: rgba(34,197,94,0.1); color: #059669; }
        .badge-closed { background: rgba(239,68,68,0.08); color: #ef4444; }
        .link-box { background: #f8fafc; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #3b82f6; word-break: break-all; display: flex; align-items: center; gap: 12px; margin-top: 16px; }
        .copy-btn { padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #164e24; color: #fff; border: none; white-space: nowrap; }
        .copy-btn:hover { background: #1a5c2b; }
        .resp-table { width: 100%; background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .resp-table th { text-align: left; padding: 14px 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #c4a459; border-bottom: 1px solid rgba(0,0,0,0.04); background: #fcfdfe; }
        .resp-table td { padding: 14px 20px; font-size: 13px; color: rgba(0,0,0,0.6); border-bottom: 1px solid rgba(0,0,0,0.03); }
        .resp-table tr:last-child td { border-bottom: none; }
        .consent-yes { color: #059669; font-weight: 700; }
        .consent-no { color: #ef4444; font-weight: 700; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); }
        .section-title { font-size: 16px; font-weight: 700; color: #1a2e1d; margin-bottom: 16px; }
      `}</style>

      <div className="page-header">
        <Link href="/admin/permission-slips" className="back-link">← Back</Link>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Permission Slip Detail</h2>
      </div>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : error ? (
        <div className="empty-state">Error: {error}</div>
      ) : slip ? (
        <>
          <div className="detail-card">
            <h1 className="detail-title">{slip.title}</h1>
            {slip.description && <p className="detail-desc">{slip.description}</p>}
            <div className="detail-meta">
              <div className="meta-item">
                <div className="meta-label">Status</div>
                <div className="meta-value"><span className={`badge badge-${slip.status}`}>{slip.status}</span></div>
              </div>
              {slip.event_date && (
                <div className="meta-item">
                  <div className="meta-label">Event Date</div>
                  <div className="meta-value">{slip.event_date}</div>
                </div>
              )}
              {slip.due_date && (
                <div className="meta-item">
                  <div className="meta-label">Due Date</div>
                  <div className="meta-value">{slip.due_date}</div>
                </div>
              )}
              <div className="meta-item">
                <div className="meta-label">Responses</div>
                <div className="meta-value" style={{ fontWeight: 700, color: '#164e24' }}>{responses.length}</div>
              </div>
            </div>
            <div className="link-box">
              <span style={{ flex: 1 }}>{responseLink}</span>
              <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(responseLink); alert('Link copied!'); }}>Copy Link</button>
            </div>
          </div>

          <h3 className="section-title">Responses ({responses.length})</h3>
          {responses.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: 14 }}>No responses yet. Share the link above with parents.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="resp-table">
                <thead>
                  <tr>
                    <th>Parent</th>
                    <th>Email</th>
                    <th>Student</th>
                    <th>Consent</th>
                    <th>Notes</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, color: '#1a2e1d' }}>{r.parent_name}</td>
                      <td>{r.parent_email}</td>
                      <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                      <td className={r.consent_given ? 'consent-yes' : 'consent-no'}>
                        {r.consent_given ? '✓ Granted' : '✗ Denied'}
                      </td>
                      <td style={{ fontSize: 12 }}>{r.notes || '—'}</td>
                      <td style={{ fontSize: 11 }}>{new Date(r.submitted_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
