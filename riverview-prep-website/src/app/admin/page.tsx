import React from 'react';

const quickStats = [
  { label: 'Upcoming Events', value: '5', icon: '🎭', trend: '+2 this week', color: 'rgba(196,164,89,0.12)', border: 'rgba(196,164,89,0.2)' },
  { label: 'Newsletters', value: '12', icon: '📰', trend: 'Latest: 12 Mar', color: 'rgba(22,78,36,0.12)', border: 'rgba(22,78,36,0.2)' },
  { label: 'Gallery Images', value: '248', icon: '🖼️', trend: '3 pending review', color: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  { label: 'Alumni Registered', value: '67', icon: '🎓', trend: '+4 this month', color: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
];

const recentActivity = [
  { action: 'Newsletter published', detail: 'Issue 05 — 12 March 2026', time: '2 hours ago', icon: '📰' },
  { action: 'Event created', detail: 'Oliver with a Twist', time: '1 day ago', icon: '🎭' },
  { action: 'Gallery updated', detail: '12 photos added to Sports Day', time: '2 days ago', icon: '🖼️' },
  { action: 'Alumni registered', detail: 'John Doe — Class of 2012', time: '3 days ago', icon: '🎓' },
  { action: 'Staff updated', detail: 'Mrs Lezanne Nel profile edited', time: '5 days ago', icon: '👥' },
];

export default function AdminDashboard() {
  return (
    <div>
      <style>{`
        .dash-welcome {
          margin-bottom: 32px;
        }

        .dash-greeting {
          font-size: 28px;
          font-weight: 800;
          color: #1a2e1d;
          margin-bottom: 4px;
        }

        .dash-sub {
          font-size: 14px;
          color: rgba(0,0,0,0.45);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .stat-card {
          padding: 24px;
          border-radius: 16px;
          border: 1px solid;
          transition: all 0.25s;
          cursor: default;
          background: #fff;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.05);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-icon {
          font-size: 24px;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(0,0,0,0.35);
        }

        .stat-value {
          font-size: 36px;
          font-weight: 800;
          color: #1a2e1d;
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-trend {
          font-size: 12px;
          color: #c4a459;
          font-weight: 600;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
        }

        .panel {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.01);
        }

        .panel-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(0,0,0,0.3);
          margin-bottom: 20px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }

        .activity-item:last-child { border-bottom: none; }

        .activity-icon {
          font-size: 18px;
          width: 36px;
          height: 36px;
          background: rgba(0,0,0,0.02);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-action {
          font-size: 14px;
          font-weight: 600;
          color: #1a2e1d;
          margin-bottom: 2px;
        }

        .activity-detail {
          font-size: 12px;
          color: rgba(0,0,0,0.45);
        }

        .activity-time {
          font-size: 11px;
          color: rgba(0,0,0,0.25);
          margin-left: auto;
          white-space: nowrap;
          padding-top: 2px;
        }

        .quick-action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 24px 16px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          color: rgba(0,0,0,0.5);
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
          text-align: center;
        }

        .quick-action:hover {
          background: rgba(22,78,36,0.04);
          border-color: rgba(22,78,36,0.1);
          color: #164e24;
          transform: translateY(-1px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.04);
        }

        .quick-action-icon { font-size: 24px; }
      `}</style>

      <div className="dash-welcome">
        <h2 className="dash-greeting">Good evening 👋</h2>
        <p className="dash-sub">Here&apos;s what&apos;s happening at Riverview Prep today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {quickStats.map(stat => (
          <div
            key={stat.label}
            className="stat-card"
            style={{ background: stat.color, borderColor: stat.border }}
          >
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-trend">{stat.trend}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Activity */}
        <div className="panel">
          <h3 className="panel-title">Recent Activity</h3>
          {recentActivity.map((item, i) => (
            <div key={i} className="activity-item">
              <div className="activity-icon">{item.icon}</div>
              <div>
                <div className="activity-action">{item.action}</div>
                <div className="activity-detail">{item.detail}</div>
              </div>
              <span className="activity-time">{item.time}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="panel">
          <h3 className="panel-title">Quick Actions</h3>
          <div className="quick-action-grid">
            <a href="/admin/events" className="quick-action">
              <span className="quick-action-icon">🎭</span>
              Create Event
            </a>
            <a href="/admin/newsletters" className="quick-action">
              <span className="quick-action-icon">📰</span>
              New Newsletter
            </a>
            <a href="/admin/gallery" className="quick-action">
              <span className="quick-action-icon">🖼️</span>
              Upload Photos
            </a>
            <a href="/admin/staff" className="quick-action">
              <span className="quick-action-icon">👥</span>
              Manage Staff
            </a>
            <a href="/admin/calendar" className="quick-action">
              <span className="quick-action-icon">📅</span>
              Add Calendar Entry
            </a>
            <a href="/admin/alumni" className="quick-action">
              <span className="quick-action-icon">📧</span>
              Email Alumni
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
