'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Quoted': { bg: 'rgba(75,85,99,0.2)', text: '#9ca3af', border: 'rgba(75,85,99,0.3)' },
    'Approved': { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    'In Production': { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    'On Hold': { bg: 'rgba(239,68,68,0.2)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
    'Completed': { bg: 'rgba(16,185,129,0.2)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
};

export default function JobcardsListPage() {
    const router = useRouter();
    const [jobcards, setJobcards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'active' | 'completed'>('active');

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

    const filteredJobcards = jobcards.filter(jc => {
        if (viewMode === 'active' && jc.status === 'Completed') return false;
        if (viewMode === 'completed' && jc.status !== 'Completed') return false;

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (jc.company || '').toLowerCase().includes(q) ||
            (jc.contact_name || '').toLowerCase().includes(q) ||
            (jc.order_no || '').toLowerCase().includes(q) ||
            (jc.invoice || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-[100dvh] bg-transparent font-inter">
            {/* Header */}
            <div className="bg-black/40 backdrop-blur-md border-b border-white/5 py-5">
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

            <div className="max-w-[1200px] mx-auto px-5 py-8">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#fff] m-0 letter-spacing-[-0.5px]">Production Jobcards</h1>
                        <p className="text-gray-400 mt-1 text-sm">Manage physical workflows and production stages.</p>
                    </div>
                    <button onClick={createNewJobcard} className="bg-[#84cc16] text-[#0a0a0a] font-bold py-3 px-6 rounded-lg shadow-[0_4px_24px_rgba(132,204,22,0.3)] hover:bg-[#a3e635] hover:shadow-[0_4px_32px_rgba(132,204,22,0.4)] transition-all">
                        ＋ New Jobcard
                    </button>
                </div>

                {/* Search & Tabs */}
                <div className="flex flex-wrap gap-4 mb-8 justify-between items-center">
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
                    </div>

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

                {/* List */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading Jobcards...</div>
                ) : filteredJobcards.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white/3 backdrop-blur-md border border-white/10 rounded-xl">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-white font-bold mb-2">No jobcards found</h3>
                        <p className="text-sm text-gray-400">Create a new jobcard to start tracking production.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredJobcards.map(jc => {
                            const sc = STATUS_COLORS[jc.status] || STATUS_COLORS['Quoted'];
                            return (
                                <Link href={`/portal/admin/jobcards/${jc.id}`} key={jc.id} className="block group bg-white/3 backdrop-blur-md border border-white/5 rounded-xl p-5 hover:border-[#84cc16]/40 hover:bg-white/5 shadow-lg transition-all">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-6 flex-wrap flex-1">
                                            <span 
                                                className="px-4 py-1.5 rounded-full text-xs font-bold w-32 text-center"
                                                style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                                            >
                                                {jc.status}
                                            </span>
                                            <div>
                                                <h3 className="text-lg font-bold text-white m-0 group-hover:text-[#84cc16] transition-colors">
                                                    {jc.company || jc.contact_name || 'Unnamed Jobcard'}
                                                </h3>
                                                <p className="text-xs text-gray-400 m-0 mt-1 flex gap-3">
                                                    <span>📅 {new Date(jc.created_at).toLocaleDateString('en-ZA')}</span>
                                                    {jc.order_no && <span>🏷️ Order #{jc.order_no}</span>}
                                                    <span>👤 {jc.contact_name || 'No contact'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => deleteJobcard(e, jc.id)}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                🗑 Delete
                                            </button>
                                            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">➔ Edit</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
