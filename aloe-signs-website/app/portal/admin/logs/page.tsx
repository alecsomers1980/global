'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuditRow {
  id: number;
  created_at: string;
  actor_email: string | null;
  actor_code: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string | null;
}

interface SalesRow {
  when: string;
  who: string | null;
  ref: string | null;
  amount: number | null;
  source: string;
  status: string | null;
}

export default function AdminLogsPage() {
  const [tab, setTab] = useState<string>('all');
  const [rows, setRows] = useState<AuditRow[] | SalesRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/portal/admin/logs?tab=${tab}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) {
          setRows(data.rows || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setRows([]);
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'jobcards', label: 'Jobcards' },
    { key: 'site', label: 'Site changes' },
    { key: 'sales', label: 'Sales' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href="/portal/admin"
          className="text-[#84cc16] hover:underline text-sm mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-8">Activity Logs</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                tab === t.key
                  ? 'bg-[#84cc16]/20 text-[#84cc16] border-b-2 border-[#84cc16]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-400">No activity found.</p>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded">
            {tab === 'sales' ? (
              <table className="w-full text-sm">
                <thead className="text-gray-400 uppercase text-xs bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left">When</th>
                    <th className="px-4 py-3 text-left">Who</th>
                    <th className="px-4 py-3 text-left">Ref</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(rows as SalesRow[]).map((row, i) => (
                    <tr key={i} className="odd:bg-white/[0.02]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.when ? new Date(row.when).toLocaleString('en-ZA') : '—'}
                      </td>
                      <td className="px-4 py-3">{row.who || '—'}</td>
                      <td className="px-4 py-3">{row.ref || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.amount != null ? `R ${Number(row.amount).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            row.source === 'shop'
                              ? 'bg-lime-500/20 text-lime-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {row.source || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{row.status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-400 uppercase text-xs bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left">When</th>
                    <th className="px-4 py-3 text-left">Who</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Entity</th>
                    <th className="px-4 py-3 text-left">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {(rows as AuditRow[]).map((row) => (
                    <tr key={row.id} className="odd:bg-white/[0.02]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString('en-ZA')}
                      </td>
                      <td className="px-4 py-3">
                        {row.actor_code || row.actor_email || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">
                          {row.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[150px] truncate">
                        {row.entity_type}
                        {row.entity_id ? ` #${row.entity_id}` : ''}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[250px]">
                        {row.summary || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
