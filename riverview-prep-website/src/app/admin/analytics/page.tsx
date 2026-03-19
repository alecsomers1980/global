'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface TableCount { table: string; label: string; icon: string; color: string; }

const trackedTables: TableCount[] = [
  { table: 'events', label: 'Total Events', icon: '🎭', color: 'rgba(196,164,89,0.12)' },
  { table: 'newsletters', label: 'Newsletters', icon: '📰', color: 'rgba(34,197,94,0.12)' },
  { table: 'staff', label: 'Staff Members', icon: '👥', color: 'rgba(59,130,246,0.12)' },
  { table: 'alumni', label: 'Alumni Records', icon: '🎓', color: 'rgba(168,85,247,0.12)' },
  { table: 'gallery_albums', label: 'Gallery Albums', icon: '🖼️', color: 'rgba(225,29,72,0.12)' },
  { table: 'calendar_entries', label: 'Calendar Entries', icon: '📅', color: 'rgba(245,158,11,0.12)' },
  { table: 'contact_submissions', label: 'Contact Messages', icon: '✉️', color: 'rgba(14,165,233,0.12)' },
  { table: 'school_documents', label: 'Documents', icon: '📄', color: 'rgba(132,204,22,0.12)' },
];

interface StatData { table: string; count: number; }

export default function AnalyticsDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extra insights
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [featuredEvents, setFeaturedEvents] = useState(0);
  const [newMessages, setNewMessages] = useState(0);
  const [activeAnnouncements, setActiveAnnouncements] = useState(0);
  const [recentAlumni, setRecentAlumni] = useState(0);
  const [alumniYears, setAlumniYears] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Count all tables
      const results = await Promise.all(
        trackedTables.map(async (t) => {
          const { count, error } = await supabase.from(t.table).select('*', { count: 'exact', head: true });
          return { table: t.table, count: error ? -1 : (count || 0) };
        })
      );
      setStats(results);

      // Extra insights
      const today = new Date().toISOString().split('T')[0];

      const [upRes, featRes, msgRes, annRes, alumRes] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', today),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('alumni').select('graduation_year'),
      ]);

      setUpcomingEvents(upRes.count || 0);
      setFeaturedEvents(featRes.count || 0);
      setNewMessages(msgRes.count || 0);
      setActiveAnnouncements(annRes.count || 0);

      if (alumRes.data) {
        const recent = alumRes.data.filter(a => a.graduation_year >= new Date().getFullYear() - 3).length;
        const years = new Set(alumRes.data.map(a => a.graduation_year)).size;
        setRecentAlumni(recent);
        setAlumniYears(years);
      }

      setError(null);
    } catch {
      setError('Some tables may not exist yet.');
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getCount = (table: string) => {
    const s = stats.find(s => s.table === table);
    return s ? (s.count === -1 ? '—' : s.count) : '...';
  };

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-refresh { padding: 10px 20px; background: #f1f5f9; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; color: rgba(0,0,0,0.5); cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s; }
        .btn-refresh:hover { background: rgba(22,78,36,0.04); color: #164e24; border-color: rgba(22,78,36,0.1); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 24px; transition: all 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .stat-card:hover { border-color: #c4a459; transform: translateY(-2px); }
        .stat-icon { font-size: 24px; margin-bottom: 12px; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-value { font-size: 28px; font-weight: 800; color: #1a2e1d; margin-bottom: 2px; }
        .stat-label { font-size: 11px; color: rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .insights-section { margin-top: 8px; }
        .section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #c4a459; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(196,164,89,0.12); }
        .insights-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .insight-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .insight-title { font-size: 13px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 16px; }
        .insight-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.03); }
        .insight-row:last-child { border-bottom: none; }
        .insight-label { font-size: 13px; color: rgba(0,0,0,0.5); }
        .insight-value { font-size: 16px; font-weight: 700; color: #1a2e1d; }
        .insight-value.gold { color: #c4a459; }
        .insight-value.green { color: #059669; }
        .insight-value.blue { color: #2563eb; }
        .insight-value.red { color: #dc2626; }
        .bar-chart { margin-top: 20px; }
        .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .bar-label { font-size: 12px; color: rgba(0,0,0,0.4); width: 120px; flex-shrink: 0; text-align: right; }
        .bar-track { flex: 1; height: 8px; background: rgba(0,0,0,0.04); border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
        .bar-count { font-size: 12px; font-weight: 700; color: rgba(0,0,0,0.6); width: 40px; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Analytics & Reports</h2>
        <button className="btn-refresh" onClick={fetchAll}>🔄 Refresh Data</button>
      </div>

      {error && <div className="error-state" style={{ marginBottom: 24 }}><p style={{ fontSize: 13 }}>{error}</p></div>}

      {loading ? (
        <div className="empty-state">Loading analytics...</div>
      ) : (
        <>
          {/* ── Content Counts Grid ─── */}
          <div className="stats-grid">
            {trackedTables.map(t => (
              <div key={t.table} className="stat-card">
                <div className="stat-icon" style={{ background: t.color }}>{t.icon}</div>
                <div className="stat-value">{getCount(t.table)}</div>
                <div className="stat-label">{t.label}</div>
              </div>
            ))}
          </div>

          {/* ── Quick Insights ─── */}
          <div className="insights-section">
            <h3 className="section-title">Quick Insights</h3>
            <div className="insights-grid">
              {/* Events Insights */}
              <div className="insight-card">
                <div className="insight-title">🎭 Events Overview</div>
                <div className="insight-row">
                  <span className="insight-label">Upcoming Events</span>
                  <span className="insight-value green">{upcomingEvents}</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Featured on Homepage</span>
                  <span className="insight-value gold">{featuredEvents}</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Total Events</span>
                  <span className="insight-value">{getCount('events')}</span>
                </div>
              </div>

              {/* Communications */}
              <div className="insight-card">
                <div className="insight-title">✉️ Communications</div>
                <div className="insight-row">
                  <span className="insight-label">Unread Messages</span>
                  <span className="insight-value red">{newMessages}</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Active Announcements</span>
                  <span className="insight-value gold">{activeAnnouncements}</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Newsletters Published</span>
                  <span className="insight-value">{getCount('newsletters')}</span>
                </div>
              </div>

              {/* Alumni */}
              <div className="insight-card">
                <div className="insight-title">🎓 Alumni</div>
                <div className="insight-row">
                  <span className="insight-label">Total Alumni</span>
                  <span className="insight-value">{getCount('alumni')}</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Recent Graduates (3yr)</span>
                  <span className="insight-value blue">{recentAlumni}</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Years Represented</span>
                  <span className="insight-value gold">{alumniYears}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Content Distribution Chart ─── */}
          <div className="insights-section">
            <h3 className="section-title">Content Distribution</h3>
            <div className="insight-card">
              <div className="bar-chart">
                {trackedTables.map(t => {
                  const count = typeof getCount(t.table) === 'number' ? getCount(t.table) as number : 0;
                  const maxCount = Math.max(...stats.map(s => s.count > 0 ? s.count : 0), 1);
                  const barColors: Record<string, string> = {
                    events: '#c4a459', newsletters: '#22c55e', staff: '#3b82f6',
                    alumni: '#a78bfa', gallery_albums: '#fb7185', calendar_entries: '#f59e0b',
                    contact_submissions: '#0ea5e9', school_documents: '#84cc16',
                  };
                  return (
                    <div key={t.table} className="bar-row">
                      <span className="bar-label">{t.label}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${(count / maxCount) * 100}%`, background: barColors[t.table] || '#c4a459' }}
                        />
                      </div>
                      <span className="bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
