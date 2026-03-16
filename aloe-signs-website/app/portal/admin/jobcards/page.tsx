'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Quoted': { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' },
    'Approved': { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    'In Production': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    'On Hold': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    'Completed': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
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
        <div className="min-h-[100dvh] bg-[#f3f4f6] font-outfit">
            {/* Header */}
            <div className="bg-[#2d2d2d] py-5">
                <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} className="object-contain" />
                        <span className="text-amber-500 text-[13px] font-bold border-l border-gray-600 pl-4">⚙️ Admin Portal</span>
                        <Link href="/portal/admin" className="text-gray-400 text-[13px] ml-4 hover:text-white transition-colors">← Back to Hub</Link>
                    </div>
                    <button onClick={handleSignOut} className="bg-transparent border border-gray-500 text-gray-400 py-2 px-4 rounded-md cursor-pointer text-[13px] hover:text-white hover:border-white transition-colors">
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-5 py-8">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d2d2d] m-0">Production Jobcards</h1>
                        <p className="text-gray-500 mt-1">Manage physical workflows and production stages.</p>
                    </div>
                    <button onClick={createNewJobcard} className="bg-[#1a1a1a] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-black transition-colors">
                        ＋ New Jobcard
                    </button>
                </div>

                {/* Search & Tabs */}
                <div className="flex flex-wrap gap-4 mb-8 justify-between items-center">
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'active' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Active Jobs
                        </button>
                        <button 
                            onClick={() => setViewMode('completed')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${viewMode === 'completed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Completed Jobs
                        </button>
                    </div>

                    <div className="relative w-full md:w-80">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search company, name, order..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-aloe-green/50"
                        />
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading Jobcards...</div>
                ) : filteredJobcards.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-gray-800 font-bold mb-2">No jobcards found</h3>
                        <p className="text-sm">Create a new jobcard to start tracking production.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredJobcards.map(jc => {
                            const sc = STATUS_COLORS[jc.status] || STATUS_COLORS['Quoted'];
                            return (
                                <Link href={`/portal/admin/jobcards/${jc.id}`} key={jc.id} className="block group bg-white rounded-xl border border-gray-200 p-5 hover:border-aloe-green/50 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-6 flex-wrap flex-1">
                                            <span 
                                                className="px-4 py-1.5 rounded-full text-xs font-bold w-32 text-center"
                                                style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                                            >
                                                {jc.status}
                                            </span>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 m-0 group-hover:text-aloe-green transition-colors">
                                                    {jc.company || jc.contact_name || 'Unnamed Jobcard'}
                                                </h3>
                                                <p className="text-xs text-gray-500 m-0 mt-1 flex gap-3">
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
