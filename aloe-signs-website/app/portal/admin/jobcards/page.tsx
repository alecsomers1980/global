'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase';
import { computeDigitalCharge, computeInstallCharge } from '@/lib/jobcard-charges';
import { getSlaFlag } from '@/lib/jobcard-sla';

// Colors are picked for pairwise contrast (validated against a #0a0a0a surface,
// normal-vision + colorblind-simulated distance) rather than eyeballed — see
// dataviz skill. Ready/Completed intentionally share the green hue family
// (a two-step "success" ramp); every badge also renders its text label, so no
// status ever depends on color alone.
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Quoted': { bg: 'rgba(75,85,99,0.2)', text: '#9ca3af', border: 'rgba(75,85,99,0.3)' },
    'Captured': { bg: 'rgba(8,145,178,0.2)', text: '#0891b2', border: 'rgba(8,145,178,0.3)' },
    'Quote Sent': { bg: 'rgba(37,99,235,0.2)', text: '#2563eb', border: 'rgba(37,99,235,0.3)' },
    'Quote Approved': { bg: 'rgba(101,163,13,0.2)', text: '#65a30d', border: 'rgba(101,163,13,0.3)' },
    'Deposit Paid / PO': { bg: 'rgba(144,133,233,0.2)', text: '#9085e9', border: 'rgba(144,133,233,0.3)' },
    'Proof Sent': { bg: 'rgba(162,28,175,0.2)', text: '#a21caf', border: 'rgba(162,28,175,0.3)' },
    'Approved': { bg: 'rgba(201,133,0,0.2)', text: '#c98500', border: 'rgba(201,133,0,0.3)' },
    'In-Production': { bg: 'rgba(234,88,12,0.2)', text: '#ea580c', border: 'rgba(234,88,12,0.3)' },
    'On Hold': { bg: 'rgba(190,18,60,0.2)', text: '#be123c', border: 'rgba(190,18,60,0.3)' },
    'Ready': { bg: 'rgba(22,163,74,0.2)', text: '#16a34a', border: 'rgba(22,163,74,0.3)' },
    'Completed': { bg: 'rgba(0,131,0,0.2)', text: '#008300', border: 'rgba(0,131,0,0.3)' },
    'Cancelled': { bg: 'rgba(220,38,38,0.2)', text: '#dc2626', border: 'rgba(220,38,38,0.3)' },
};

// Sorting the Status column by workflow order reads better than alphabetical.
const STATUS_ORDER = Object.keys(STATUS_COLORS);

type SortKey = 'created_at' | 'status' | 'entry_number' | 'client';

export default function JobcardsListPage() {
    const router = useRouter();
    const [jobcards, setJobcards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'active' | 'completed' | 'cancelled'>('active');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [pricing, setPricing] = useState<any>(null);
    const [sortKey, setSortKey] = useState<SortKey>('created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const loadJobcards = useCallback(async () => {
        try {
            const res = await fetch('/api/portal/admin/jobcards');
            const data = await res.json();
            if (data.jobcards) setJobcards(data.jobcards);
        } catch (e) {
            console.error('Failed to load jobcards:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJobcards();
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                setPricing(data.pricing || {});
            })
            .catch(() => {
                setPricing({});
            });
    }, [loadJobcards]);

    async function handleSignOut() {
        const supabase = createClientSupabase();
        await supabase.auth.signOut();
        router.push('/portal/login');
    }

    async function createNewJobcard() {
        try {
            const res = await fetch('/api/portal/admin/jobcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (data.id) {
                router.push(`/portal/admin/jobcards/${data.id}`);
            }
        } catch (e) {
            console.error('Error creating jobcard', e);
        }
    }

    async function deleteJobcard(e: React.MouseEvent, id: string) {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Delete this jobcard? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/portal/admin/jobcards/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setJobcards(prev => prev.filter(jc => jc.id !== id));
            } else {
                const data = await res.json();
                alert('Failed to delete: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            console.error('Error deleting jobcard', e);
            alert('Failed to delete jobcard.');
        }
    }

    const formatMoney = (n: any) =>
        'R ' + (Number(n) || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const formatDate = (d: any) =>
        d ? new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: '2-digit' }) : '—';

    const displayEntryNo = (s: any) => {
        const v = String(s || '');
        if (!v) return '—';
        return v.replace(/^JC(\d{4}\.)?0*/, '') || v;
    };

    const itemsList = (jc: any): string[] => {
        const items = Array.isArray(jc.items_json) ? jc.items_json : [];
        return items
            .filter((it: any) => it && (it.item || '').toString().trim())
            .map((it: any) => {
                const q = (it.quantity ?? '').toString().trim();
                return (q ? q + ' × ' : '') + it.item;
            });
    };

    // Client total = client-facing pricing only: manual line items + installation, plus 15% VAT.
    // Artwork / HP Latex / Vinyl Cut are Aloe's internal costs (shown in the Digital column)
    // and are deliberately excluded from what the client pays.
    const AUTO_LINES = ['artwork', 'hp_latex', 'vinyl_cut', 'install'];
    const clientTotal = (jc: any): number => {
        const manual = (Array.isArray(jc.items_json) ? jc.items_json : [])
            .filter((it: any) => !AUTO_LINES.includes(it?._auto))
            .reduce((a: number, it: any) => a + (parseFloat(it.total) || 0), 0);
        const subtotal = manual + computeInstallCharge(jc, pricing || {});
        return subtotal * 1.15;
    };

    const toggleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const sortArrow = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : '↕');

    const sortValue = (jc: any) => {
        switch (sortKey) {
            case 'status': return STATUS_ORDER.indexOf(jc.status);
            case 'entry_number': return (jc.entry_number || '').toLowerCase();
            case 'client': return (jc.company || jc.contact_name || '').toLowerCase();
            default: return new Date(jc.created_at || 0).getTime();
        }
    };

    const filteredJobcards = jobcards.filter(jc => {
        if (statusFilter === 'all') {
            // No explicit status chosen, so the Active/Completed/Cancelled tabs decide.
            if (viewMode === 'active' && (jc.status === 'Completed' || jc.status === 'Cancelled')) return false;
            if (viewMode === 'completed' && jc.status !== 'Completed') return false;
            if (viewMode === 'cancelled' && jc.status !== 'Cancelled') return false;
        } else {
            // An explicit status overrides the tabs — otherwise picking
            // "Completed" while on "Active Jobs" would silently show nothing.
            if (jc.status !== statusFilter) return false;
        }

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (jc.company || '').toLowerCase().includes(q) ||
            (jc.contact_name || '').toLowerCase().includes(q) ||
            (jc.order_no || '').toLowerCase().includes(q) ||
            (jc.invoice || '').toLowerCase().includes(q) ||
            (jc.entry_number || '').toLowerCase().includes(q)
        );
    });

    const sortedJobcards = [...filteredJobcards].sort((a, b) => {
        const av = sortValue(a);
        const bv = sortValue(b);
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const nowMs = Date.now();

    return (
        <div className="min-h-[100dvh] bg-transparent font-inter">
            <style>{`
                .jobcards-print-header { display: none; }
                @media print {
                    @page { size: landscape; margin: 12mm 10mm; }
                    .no-print { display: none !important; }
                    html, body { background: #fff !important; }

                    .jobcards-print-header { display: flex !important; }

                    .jobcards-print-panel {
                        background: #fff !important;
                        backdrop-filter: none !important;
                        border: 1px solid #1a1a1a !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                    }
                    .jobcards-print-panel table { border-collapse: collapse; width: 100%; }
                    .jobcards-print-panel thead th {
                        color: #000 !important;
                        background: #fff !important;
                        border-bottom: 2px solid #000 !important;
                        font-size: 9px;
                    }
                    .jobcards-print-panel tbody td {
                        color: #000 !important;
                        font-size: 10px;
                    }
                    .jobcards-print-panel tbody tr { border-bottom: 1px solid #ddd !important; }
                    .jobcards-print-panel tbody tr:nth-child(even) { background: #f7f7f5; }
                }
            `}</style>
            {/* Print-only branded header */}
            <div className="jobcards-print-header items-center justify-between border-b-2 border-black pb-3 mb-4">
                <div className="flex items-center gap-3">
                    <Image src="/aloe-logo.png" alt="Aloe Signs" width={110} height={36} className="object-contain" />
                    <div>
                        <h1 className="text-xl font-extrabold text-black m-0">Production Jobcards</h1>
                        <p className="text-xs text-gray-600 m-0">
                            {viewMode === 'active' ? 'Active Jobs' : viewMode === 'completed' ? 'Completed Jobs' : 'Cancelled Jobs'}
                            {statusFilter !== 'all' ? ` · ${statusFilter}` : ''} — {sortedJobcards.length} job{sortedJobcards.length === 1 ? '' : 's'}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                    Printed {new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            </div>
            {/* Header */}
            <div className="no-print bg-black/40 backdrop-blur-md border-b border-white/5 py-5">
                <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} className="object-contain filter brightness-0 invert" />
                        <span className="text-[#84cc16] text-[13px] font-bold border-l border-white/10 pl-4">⚙️ Admin Portal</span>
                        <Link href="/portal/admin" className="text-gray-400 text-[13px] ml-4 hover:text-white transition-colors">← Back to Hub</Link>
                    </div>
                    <button onClick={handleSignOut} className="bg-transparent border border-white/20 text-gray-400 py-2 px-4 rounded-md cursor-pointer text-[13px] hover:text-white hover:border-white transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-[1700px] mx-auto px-5 py-8">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#fff] m-0 letter-spacing-[-0.5px]">Production Jobcards</h1>
                        <p className="text-gray-400 mt-1 text-sm">Manage physical workflows and production stages.</p>
                    </div>
                    <div className="no-print flex gap-3">
                        <button onClick={() => window.print()} className="bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold py-3 px-6 rounded-lg hover:bg-white/10 transition-all">
                            🖨 Print
                        </button>
                        <button onClick={createNewJobcard} className="bg-[#84cc16] text-[#0a0a0a] font-bold py-3 px-6 rounded-lg shadow-[0_4px_24px_rgba(132,204,22,0.3)] hover:bg-[#a3e635] hover:shadow-[0_4px_32px_rgba(132,204,22,0.4)] transition-all">
                            ＋ New Jobcard
                        </button>
                    </div>
                </div>

                {/* Search & Tabs */}
                <div className="no-print flex flex-wrap gap-4 mb-8 justify-between items-center">
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg backdrop-blur-md">
                        <button 
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'active' ? 'bg-[#84cc16] text-[#0a0a0a] shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Active Jobs
                        </button>
                        <button
                            onClick={() => setViewMode('completed')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'completed' ? 'bg-[#84cc16] text-[#0a0a0a] shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Completed Jobs
                        </button>
                        <button
                            onClick={() => setViewMode('cancelled')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'cancelled' ? 'bg-[#84cc16] text-[#0a0a0a] shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Cancelled
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                            <input
                                type="text"
                                placeholder="Search company, name, order..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]/50"
                            />
                        </div>
                    </div>
                </div>

                {statusFilter !== 'all' && (
                    <p className="-mt-4 mb-6 text-xs text-gray-400">
                        Showing <span className="text-[#84cc16] font-semibold">{statusFilter}</span> jobcards only — the
                        Active / Completed tabs are ignored while a status is selected.
                    </p>
                )}

                {/* List / Table */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading Jobcards...</div>
                ) : sortedJobcards.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white/3 backdrop-blur-md border border-white/10 rounded-xl">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-white font-bold mb-2">No jobcards found</h3>
                        <p className="text-sm text-gray-400">Create a new jobcard to start tracking production.</p>
                    </div>
                ) : (
                    <div className="jobcards-print-panel overflow-x-auto bg-white/3 backdrop-blur-md border border-white/5 rounded-xl">
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        <button
                                            onClick={() => toggleSort('created_at')}
                                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide hover:text-white transition-colors"
                                        >
                                            Booked
                                            <span className={`no-print ${sortKey === 'created_at' ? 'text-[#84cc16]' : 'text-gray-600'}`}>{sortArrow('created_at')}</span>
                                        </button>
                                    </th>
                                    <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        <div className="flex items-center gap-2">
                                            <span>Status</span>
                                            <div className="no-print relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={e => setStatusFilter(e.target.value)}
                                                    className={`appearance-none normal-case tracking-normal py-1 pl-2 pr-6 rounded-md border bg-white/5 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#84cc16]/50 cursor-pointer ${statusFilter === 'all' ? 'border-white/10 text-gray-300' : 'border-[#84cc16]/50 text-[#84cc16]'}`}
                                                >
                                                    <option value="all" className="bg-[#1a1a1a] text-white">
                                                        All ({jobcards.length})
                                                    </option>
                                                    {STATUS_ORDER.map(s => (
                                                        <option key={s} value={s} className="bg-[#1a1a1a] text-white">
                                                            {s} ({jobcards.filter(jc => jc.status === s).length})
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-[9px]">▼</span>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        Approved
                                    </th>
                                    <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        <button
                                            onClick={() => toggleSort('entry_number')}
                                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide hover:text-white transition-colors"
                                        >
                                            JC
                                            <span className={`no-print ${sortKey === 'entry_number' ? 'text-[#84cc16]' : 'text-gray-600'}`}>{sortArrow('entry_number')}</span>
                                        </button>
                                    </th>
                                    <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        <button
                                            onClick={() => toggleSort('client')}
                                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide hover:text-white transition-colors"
                                        >
                                            Client
                                            <span className={`no-print ${sortKey === 'client' ? 'text-[#84cc16]' : 'text-gray-600'}`}>{sortArrow('client')}</span>
                                        </button>
                                    </th>
                                    <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        Description
                                    </th>
                                    <th className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        Digital
                                    </th>
                                    <th className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        Material
                                    </th>
                                    <th className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        Install
                                    </th>
                                    <th className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10">
                                        Total
                                    </th>
                                    <th className="no-print text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-b border-white/10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedJobcards.map(jc => {
                                    const sc = STATUS_COLORS[jc.status] || STATUS_COLORS['Quoted'];
                                    const flag = getSlaFlag(jc, nowMs);
                                    return (
                                        <tr
                                            key={jc.id}
                                            onClick={() => router.push(`/portal/admin/jobcards/${jc.id}`)}
                                            className={`border-b border-white/5 cursor-pointer transition-colors ${flag?.color === 'red' ? 'hover:bg-[#d03b3b]/25' : 'hover:bg-white/5'}`}
                                            style={flag?.color === 'red' ? { backgroundColor: 'rgba(208,59,59,0.15)' } : undefined}
                                        >
                                            <td className="px-3 py-2.5 text-gray-200 whitespace-nowrap align-top">
                                                {jc.installation_date && (
                                                    <div className="leading-tight">
                                                        <div className="text-[10px] uppercase text-gray-400">Installation</div>
                                                        <div>{formatDate(jc.installation_date)}</div>
                                                    </div>
                                                )}
                                                {jc.collection_date && (
                                                    <div className="leading-tight">
                                                        <div className="text-[10px] uppercase text-gray-400">Collection</div>
                                                        <div>{formatDate(jc.collection_date)}</div>
                                                    </div>
                                                )}
                                                {jc.delivery_date && (
                                                    <div className="leading-tight">
                                                        <div className="text-[10px] uppercase text-gray-400">Delivery</div>
                                                        <div>{formatDate(jc.delivery_date)}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-200 whitespace-nowrap">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                                                    style={{
                                                        backgroundColor: sc.bg,
                                                        color: sc.text,
                                                        border: `1px solid ${sc.border}`,
                                                    }}
                                                    title={flag?.reason}
                                                >
                                                    {flag && (
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full shrink-0"
                                                            style={{ backgroundColor: flag.color === 'red' ? '#d03b3b' : '#0ca30c' }}
                                                        />
                                                    )}
                                                    {jc.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-200 whitespace-nowrap">
                                                {formatDate(jc.approved_at)}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-100 font-mono whitespace-nowrap">
                                                {displayEntryNo(jc.entry_number)}
                                            </td>
                                            <td className="px-3 py-2.5 text-white font-semibold whitespace-nowrap">
                                                {jc.company || jc.contact_name || '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-300 align-top max-w-[260px]">
                                                {itemsList(jc).length === 0 ? '—' : (
                                                    <div className="flex flex-col gap-0.5">
                                                        {itemsList(jc).map((line, i) => (
                                                            <span key={i} className="leading-tight">{line}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-200 text-right whitespace-nowrap">
                                                {formatMoney(computeDigitalCharge(jc, pricing || {}))}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-500 text-right whitespace-nowrap">
                                                —
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-200 text-right whitespace-nowrap">
                                                {formatMoney(computeInstallCharge(jc, pricing || {}))}
                                            </td>
                                            <td className="px-3 py-2.5 text-[#84cc16] font-bold text-right whitespace-nowrap">
                                                {formatMoney(clientTotal(jc))}
                                            </td>
                                            <td className="no-print px-3 py-2.5 text-gray-200 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => deleteJobcard(e, jc.id)}
                                                    className="text-red-400 hover:text-red-600 text-xs"
                                                    title="Delete"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
