'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'cancelled';
    paymentStatus: 'pending' | 'completed' | 'failed';
    createdAt: string;
    items: Array<{ name: string; quantity: number; price: number }>;
}

const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: 'rgba(234,179,8,0.12)', text: '#fbbf24', border: 'rgba(234,179,8,0.3)', dot: '#fbbf24' },
    paid: { label: 'Paid', bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)', dot: '#60a5fa' },
    processing: { label: 'Processing', bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)', dot: '#a78bfa' },
    shipped: { label: 'Shipped', bg: 'rgba(132,204,22,0.12)', text: '#84cc16', border: 'rgba(132,204,22,0.3)', dot: '#84cc16' },
    cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)', dot: '#f87171' },
};

const PAYMENT_CONFIG = {
    completed: { text: '#84cc16', label: 'Paid' },
    failed: { text: '#f87171', label: 'Failed' },
    pending: { text: '#fbbf24', label: 'Pending' },
};

export default function AdminDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = async () => {
        try {
            const response = await fetch('/api/admin/orders');
            const data = await response.json();
            if (data.orders) {
                setOrders(data.orders.sort((a: Order, b: Order) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ));
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try { await fetch('/api/admin/logout', { method: 'POST' }); } catch { }
        router.push('/admin/login');
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Delete this order? This cannot be undone.')) return;
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
            if (response.ok) setOrders(prev => prev.filter(o => o.id !== orderId));
            else alert('Failed to delete order');
        } catch { alert('An error occurred'); }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        revenue: orders.filter(o => o.paymentStatus === 'completed').reduce((s, o) => s + o.total, 0),
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Inter', sans-serif; background: #080808; color: #fff; }

                .admin-wrap { min-height: 100vh; background: #080808; }

                /* TOPBAR */
                .topbar {
                    background: rgba(10,10,10,0.95);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    padding: 0 32px;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    backdrop-filter: blur(20px);
                }

                .topbar-left { display: flex; align-items: center; gap: 20px; }

                .admin-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(132,204,22,0.1);
                    border: 1px solid rgba(132,204,22,0.2);
                    color: #84cc16;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    padding: 5px 12px;
                    border-radius: 50px;
                }

                .topbar-right { display: flex; align-items: center; gap: 12px; }

                .btn-ghost {
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #9ca3af;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-family: 'Inter', sans-serif;
                    font-weight: 500;
                    transition: all 0.2s;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .btn-ghost:hover { background: rgba(255,255,255,0.06); color: #fff; border-color: rgba(255,255,255,0.2); }

                .btn-danger-ghost {
                    background: transparent;
                    border: 1px solid rgba(239,68,68,0.2);
                    color: #f87171;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-family: 'Inter', sans-serif;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .btn-danger-ghost:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.4); }

                /* MAIN */
                .main-content { max-width: 1400px; margin: 0 auto; padding: 32px; }

                .page-header { margin-bottom: 32px; }
                .page-title { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
                .page-subtitle { font-size: 14px; color: #4b5563; }

                /* STATS GRID */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .stat-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    padding: 20px;
                    transition: all 0.2s;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }

                .stat-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
                .stat-card.active { background: rgba(132,204,22,0.04); }

                .stat-label { font-size: 12px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
                .stat-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
                .stat-sub { font-size: 11px; color: #374151; margin-top: 4px; }

                /* REVENUE CARD */
                .revenue-card {
                    background: linear-gradient(135deg, rgba(132,204,22,0.1), rgba(132,204,22,0.03));
                    border: 1px solid rgba(132,204,22,0.2);
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    position: relative;
                    overflow: hidden;
                }

                .revenue-card::after {
                    content: '💰';
                    position: absolute;
                    right: 24px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 48px;
                    opacity: 0.08;
                }

                .revenue-label { font-size: 13px; font-weight: 600; color: #84cc16; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
                .revenue-value { font-size: 36px; font-weight: 800; color: #84cc16; letter-spacing: -1.5px; }
                .revenue-sub { font-size: 13px; color: #4b5563; margin-top: 2px; }

                /* FILTER TABS */
                .filter-bar {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 8px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-bottom: 24px;
                }

                .filter-btn {
                    padding: 8px 18px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: #6b7280;
                    font-size: 13px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-btn:hover { background: rgba(255,255,255,0.05); color: #d1d5db; }

                .filter-btn.active {
                    background: rgba(132,204,22,0.12);
                    color: #84cc16;
                }

                /* TABLE */
                .table-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .table-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .table-title { font-size: 15px; font-weight: 700; color: #fff; }
                .table-count { font-size: 13px; color: #4b5563; }

                .data-table { width: 100%; border-collapse: collapse; }

                .data-table th {
                    padding: 12px 20px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: 700;
                    color: #374151;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background: rgba(255,255,255,0.015);
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    white-space: nowrap;
                }

                .data-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    vertical-align: middle;
                }

                .data-table tbody tr { transition: background 0.15s; }
                .data-table tbody tr:hover { background: rgba(255,255,255,0.025); }
                .data-table tbody tr:last-child td { border-bottom: none; }

                .order-num { font-size: 13px; font-weight: 700; color: #84cc16; font-family: 'Courier New', monospace; letter-spacing: 0.5px; }

                .customer-name { font-size: 14px; font-weight: 600; color: #e5e7eb; }
                .customer-email { font-size: 12px; color: #4b5563; margin-top: 2px; }

                .item-count { font-size: 13px; color: #6b7280; background: rgba(255,255,255,0.04); padding: 3px 8px; border-radius: 4px; display: inline-block; }

                .amount { font-size: 14px; font-weight: 700; color: #fff; }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-size: 12px;
                    font-weight: 700;
                    border: 1px solid;
                    white-space: nowrap;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .date-text { font-size: 12px; color: #4b5563; white-space: nowrap; }

                .action-view {
                    color: #84cc16;
                    font-size: 12px;
                    font-weight: 700;
                    text-decoration: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: 1px solid rgba(132,204,22,0.2);
                    background: rgba(132,204,22,0.06);
                    transition: all 0.2s;
                    display: inline-block;
                }
                .action-view:hover { background: rgba(132,204,22,0.15); border-color: rgba(132,204,22,0.4); }

                .action-delete {
                    color: #ef4444;
                    font-size: 12px;
                    font-weight: 600;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 6px 8px;
                    border-radius: 6px;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.2s;
                }
                .action-delete:hover { background: rgba(239,68,68,0.1); }

                .empty-state { text-align: center; padding: 60px 20px; color: #374151; }
                .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }
                .empty-text { font-size: 15px; font-weight: 500; }

                /* LOADING */
                .loading-screen {
                    min-height: 60vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    color: #4b5563;
                }

                .loading-ring {
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(132,204,22,0.15);
                    border-top-color: #84cc16;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .main-content { padding: 16px; }
                    .topbar { padding: 0 16px; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .data-table td, .data-table th { padding: 12px; }
                }
            `}</style>

            <div className="admin-wrap">
                {/* Top Bar */}
                <div className="topbar">
                    <div className="topbar-left">
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={120} height={40}
                            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        <div className="admin-badge">⚡ Orders Admin</div>
                    </div>
                    <div className="topbar-right">
                        <Link href="/" className="btn-ghost">↗ Website</Link>
                        <button onClick={handleLogout} className="btn-danger-ghost">Sign Out</button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-screen">
                        <div className="loading-ring" />
                        <span>Loading orders…</span>
                    </div>
                ) : (
                    <div className="main-content">
                        <div className="page-header">
                            <h1 className="page-title">Orders Dashboard</h1>
                            <p className="page-subtitle">Manage all customer orders and track fulfilment</p>
                        </div>

                        {/* Revenue Banner */}
                        <div className="revenue-card">
                            <div>
                                <div className="revenue-label">Total Revenue</div>
                                <div className="revenue-value">R {formatPrice(stats.revenue)}</div>
                                <div className="revenue-sub">{orders.filter(o => o.paymentStatus === 'completed').length} completed orders</div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="stats-grid">
                            {[
                                { key: 'all', label: 'All Orders', value: stats.total, accent: '#9ca3af', accentText: '#fff' },
                                { key: 'pending', label: 'Pending', value: stats.pending, accent: '#fbbf24', accentText: '#fbbf24' },
                                { key: 'paid', label: 'Paid', value: stats.paid, accent: '#60a5fa', accentText: '#60a5fa' },
                                { key: 'processing', label: 'In Production', value: stats.processing, accent: '#a78bfa', accentText: '#a78bfa' },
                                { key: 'shipped', label: 'Shipped', value: stats.shipped, accent: '#84cc16', accentText: '#84cc16' },
                                { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, accent: '#f87171', accentText: '#f87171' },
                            ].map(s => (
                                <div
                                    key={s.key}
                                    className={`stat-card${filter === s.key ? ' active' : ''}`}
                                    style={{
                                        borderTop: `3px solid ${s.accent}`,
                                        borderColor: filter === s.key ? s.accent : undefined,
                                    }}
                                    onClick={() => setFilter(s.key)}
                                >
                                    <div className="stat-label">{s.label}</div>
                                    <div className="stat-value" style={{ color: s.accentText }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Filter Bar */}
                        <div className="filter-bar">
                            {[
                                { key: 'all', label: `All (${stats.total})` },
                                { key: 'pending', label: `Pending (${stats.pending})` },
                                { key: 'paid', label: `Paid (${stats.paid})` },
                                { key: 'processing', label: `Processing (${stats.processing})` },
                                { key: 'shipped', label: `Shipped (${stats.shipped})` },
                                { key: 'cancelled', label: `Cancelled (${stats.cancelled})` },
                            ].map(f => (
                                <button
                                    key={f.key}
                                    className={`filter-btn${filter === f.key ? ' active' : ''}`}
                                    onClick={() => setFilter(f.key)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="table-card">
                            <div className="table-header">
                                <span className="table-title">Orders</span>
                                <span className="table-count">{filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={8}>
                                                    <div className="empty-state">
                                                        <div className="empty-icon">📋</div>
                                                        <div className="empty-text">No orders found</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredOrders.map(order => {
                                            const sc = STATUS_CONFIG[order.status];
                                            const pc = PAYMENT_CONFIG[order.paymentStatus];
                                            return (
                                                <tr key={order.id}>
                                                    <td><div className="order-num">{order.orderNumber}</div></td>
                                                    <td>
                                                        <div className="customer-name">{order.customerName}</div>
                                                        <div className="customer-email">{order.customerEmail}</div>
                                                    </td>
                                                    <td>
                                                        <span className="item-count">
                                                            {order.items.reduce((s, i) => s + i.quantity, 0)} items
                                                        </span>
                                                    </td>
                                                    <td><div className="amount">R{formatPrice(order.total)}</div></td>
                                                    <td>
                                                        <span className="status-pill" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                                                            <span className="status-dot" style={{ background: sc.dot }} />
                                                            {sc.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: '13px', fontWeight: 600, color: pc.text }}>
                                                            {pc.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="date-text">{new Date(order.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <Link href={`/admin/orders/${order.id}`} className="action-view">View →</Link>
                                                            <button className="action-delete" onClick={() => handleDeleteOrder(order.id)}>✕</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
