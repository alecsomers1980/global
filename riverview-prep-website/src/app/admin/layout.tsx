'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Homepage', href: '/admin/homepage', icon: '🏠' },
  { name: 'Events', href: '/admin/events', icon: '🎭' },
  { name: 'Calendar', href: '/admin/calendar', icon: '📅' },
  { name: 'Newsletters', href: '/admin/newsletters', icon: '📰' },
  { name: 'Gallery', href: '/admin/gallery', icon: '🖼️' },
  { name: 'Staff', href: '/admin/staff', icon: '👥' },
  { name: 'Admissions', href: '/admin/admissions', icon: '🎓' },
  { name: 'Alumni', href: '/admin/alumni', icon: '🎓' },
];

const secondaryItems = [
  { name: 'Announcements', href: '/admin/announcements', icon: '📢' },
  { name: 'Contact Inbox', href: '/admin/contact', icon: '✉️' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="admin-shell">
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #f4f7f5;
          font-family: 'Inter', sans-serif;
          color: #1a2e1d;
        }

        /* ── Sidebar ─────────────────────────────── */
        .admin-sidebar {
          width: 260px;
          background: #ffffff;
          border-right: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 40;
          transition: transform 0.3s ease;
          box-shadow: 4px 0 24px rgba(0,0,0,0.02);
        }

        @media (max-width: 1024px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(4px);
            z-index: 35;
          }
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #1a2e1d;
        }

        .sidebar-brand-text {
          display: flex;
          flex-direction: column;
        }

        .sidebar-brand-name {
          font-weight: 700;
          font-size: 16px;
          line-height: 1.2;
        }

        .sidebar-brand-label {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #c4a459;
          font-weight: 700;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
        }

        .nav-section-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(0,0,0,0.3);
          padding: 16px 12px 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          margin-bottom: 2px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(0,0,0,0.5);
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .nav-item:hover {
          background: #f8fafc;
          color: #164e24;
        }

        .nav-item.active {
          background: rgba(22,78,36,0.06);
          color: #164e24;
          font-weight: 600;
          border: 1px solid rgba(22,78,36,0.08);
        }

        .nav-item-icon {
          font-size: 16px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid rgba(0,0,0,0.04);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(0,0,0,0.4);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          text-align: left;
        }

        .logout-btn:hover {
          background: rgba(239,68,68,0.05);
          color: #ef4444;
        }

        /* ── Main Content ────────────────────────── */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        @media (max-width: 1024px) {
          .admin-main { margin-left: 0; }
        }

        .admin-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #1a2e1d;
          font-size: 22px;
          cursor: pointer;
          padding: 4px;
        }

        @media (max-width: 1024px) {
          .mobile-menu-btn { display: block; }
        }

        .topbar-page-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a2e1d;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .topbar-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(0,0,0,0.3);
          font-weight: 500;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
        }

        .topbar-avatar {
          width: 32px;
          height: 32px;
          background: rgba(196,164,89,0.1);
          border: 1px solid rgba(196,164,89,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #c4a459;
        }

        .admin-content {
          flex: 1;
          padding: 32px;
        }

        @media (max-width: 768px) {
          .admin-content { padding: 20px 16px; }
          .admin-topbar { padding: 12px 16px; }
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-brand" onClick={() => setSidebarOpen(false)}>
            <Image
              src="/images/logo_t.png"
              alt="Riverview Prep"
              width={36}
              height={36}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Riverview</span>
              <span className="sidebar-brand-label">Admin Portal</span>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Content</div>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}

          <div className="nav-section-label">System</div>
          {secondaryItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-item-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <h1 className="topbar-page-title">
              {navItems.find(i => isActive(i.href))?.name
                || secondaryItems.find(i => isActive(i.href))?.name
                || 'Dashboard'}
            </h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-status">
              <span className="status-dot" />
              System Online
            </div>
            <Link href="/" target="_blank" style={{ color: 'rgba(0,0,0,0.4)', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>
              View Site ↗
            </Link>
            <div className="topbar-avatar">RP</div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
