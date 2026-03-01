'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Allowance { date: string; startTime: string; endTime: string; }
interface JobFile { id: string; original_name: string; display_name: string | null; description: string; storage_path: string; }
interface ProofComment { id: string; comment: string; is_admin: boolean; created_at: string; user_id: string; }
interface Proof { id: string; original_name: string; status: string; storage_path: string; created_at: string; proof_comments: ProofComment[]; }
interface Profile { full_name: string; email: string; company: string | null; contact_number: string | null; }
interface Job {
    id: string; user_id: string; status: string; created_at: string; updated_at: string;
    material: string | null; delivery_type: string | null; delivery_address: string | null;
    ground_clearance: string | null; water_electricity_notes: string | null; safety_file_required: boolean;
    site_contact_person: string | null; site_contact_number: string | null;
    access_contact_person: string | null; access_contact_number: string | null;
    completion_target: string | null; setup_allowance: Allowance[] | null;
    strike_allowance: Allowance[] | null; storage_required: boolean; storage_time_estimate: string | null;
    profiles: Profile; print_job_files: JobFile[]; proofs: Proof[];
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    'Uploaded': { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)', dot: '#60a5fa' },
    'Processing': { bg: 'rgba(234,179,8,0.12)', text: '#fbbf24', border: 'rgba(234,179,8,0.3)', dot: '#fbbf24' },
    'Awaiting Proof Signoff': { bg: 'rgba(217,70,239,0.12)', text: '#e879f9', border: 'rgba(217,70,239,0.3)', dot: '#e879f9' },
    'Completed': { bg: 'rgba(132,204,22,0.12)', text: '#84cc16', border: 'rgba(132,204,22,0.3)', dot: '#84cc16' },
};

const PROOF_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
    'Pending': { bg: 'rgba(234,179,8,0.12)', text: '#fbbf24', border: 'rgba(234,179,8,0.3)' },
    'Edit Required': { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
    'Approved': { bg: 'rgba(132,204,22,0.12)', text: '#84cc16', border: 'rgba(132,204,22,0.3)' },
};

const ALL_STATUSES = ['Uploaded', 'Processing', 'Awaiting Proof Signoff', 'Completed'];

export default function AdminPortalPage() {
    const router = useRouter();
    const proofFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedJob, setExpandedJob] = useState<string | null>(null);
    const [proofUploading, setProofUploading] = useState<string | null>(null);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadJobs = useCallback(async () => {
        try {
            const res = await fetch('/api/portal/admin/jobs');
            const data = await res.json();
            if (data.jobs) setJobs(data.jobs);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadJobs(); }, [loadJobs]);

    async function handleSignOut() {
        const supabase = createClientSupabase();
        await supabase.auth.signOut();
        router.push('/portal/login');
    }

    async function getSignedUrl(storagePath: string): Promise<string> {
        const supabase = createClientSupabase();
        const { data } = await supabase.storage.from('client-uploads').createSignedUrl(storagePath, 3600);
        return data?.signedUrl || '';
    }

    async function downloadAdminFile(storagePath: string, originalName: string) {
        const url = await getSignedUrl(storagePath);
        if (url) { const a = document.createElement('a'); a.href = url; a.download = originalName; a.target = '_blank'; a.click(); }
    }

    async function changeStatus(jobId: string, newStatus: string) {
        setStatusUpdating(jobId);
        try {
            await fetch(`/api/portal/admin/jobs/${jobId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, notifyClient: true }),
            });
            await loadJobs();
        } catch (e) { console.error(e); }
        finally { setStatusUpdating(null); }
    }

    async function uploadProof(jobId: string, file: File) {
        setProofUploading(jobId);
        try {
            const supabase = createClientSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `proofs/${jobId}/${Date.now()}_${safeName}`;
            const { error: uploadError } = await supabase.storage.from('client-uploads').upload(path, file, { upsert: false });
            if (uploadError) throw uploadError;
            await fetch(`/api/portal/admin/jobs/${jobId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proofStoragePath: path, proofOriginalName: file.name }),
            });
            await loadJobs();
        } catch (e) { console.error(e); }
        finally { setProofUploading(null); }
    }

    const filteredByStatus = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);
    const filteredJobs = filteredByStatus.filter(job => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const p = job.profiles || {} as Profile;
        return (p.full_name || '').toLowerCase().includes(q) ||
            (p.company || '').toLowerCase().includes(q) ||
            (p.email || '').toLowerCase().includes(q) ||
            job.print_job_files?.some(f => (f.display_name || f.original_name).toLowerCase().includes(q));
    });

    const statCounts: Record<string, number> = {
        all: jobs.length,
        ...Object.fromEntries(ALL_STATUSES.map(s => [s, jobs.filter(j => j.status === s).length])),
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Inter', sans-serif; background: #080808; }

                .portal-wrap { min-height: 100vh; background: #080808; color: #fff; }

                /* TOPBAR */
                .topbar {
                    position: sticky; top: 0; z-index: 100;
                    height: 64px; padding: 0 32px;
                    display: flex; align-items: center; justify-content: space-between;
                    background: rgba(8,8,8,0.95);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    backdrop-filter: blur(24px);
                }
                .topbar-left { display: flex; align-items: center; gap: 16px; }
                .admin-tag {
                    background: rgba(132,204,22,0.1); border: 1px solid rgba(132,204,22,0.2);
                    color: #84cc16; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
                    text-transform: uppercase; padding: 5px 12px; border-radius: 50px;
                    display: flex; align-items: center; gap: 6px;
                }
                .pulse { width: 6px; height: 6px; background: #84cc16; border-radius: 50%; animation: blink 1.8s ease-in-out infinite; }
                @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }

                .btn-sign-out {
                    background: transparent; border: 1px solid rgba(239,68,68,0.25); color: #f87171;
                    padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px;
                    font-family: 'Inter', sans-serif; font-weight: 600; transition: all 0.2s;
                }
                .btn-sign-out:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.5); }

                /* MAIN */
                .main { max-width: 1280px; margin: 0 auto; padding: 32px; }

                /* SEARCH + FILTER */
                .toolbar {
                    display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
                    justify-content: space-between; margin-bottom: 28px;
                }
                .filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
                .filter-btn {
                    padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);
                    background: transparent; color: #6b7280; font-size: 13px; font-weight: 600;
                    font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s; white-space: nowrap;
                }
                .filter-btn:hover { background: rgba(255,255,255,0.04); color: #d1d5db; }
                .filter-btn.active { background: rgba(132,204,22,0.1); border-color: rgba(132,204,22,0.3); color: #84cc16; }

                .search-wrap { position: relative; flex: 1; max-width: 380px; min-width: 200px; }
                .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #4b5563; font-size: 14px; pointer-events: none; }
                .search-input {
                    width: 100%; padding: 10px 14px 10px 36px;
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px; color: #fff; font-size: 14px; font-family: 'Inter', sans-serif;
                    outline: none; transition: all 0.2s;
                }
                .search-input::placeholder { color: #374151; }
                .search-input:focus { border-color: rgba(132,204,22,0.4); background: rgba(132,204,22,0.03); }

                /* JOB PAGE HEADER */
                .page-header { margin-bottom: 28px; }
                .page-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
                .page-sub { font-size: 14px; color: #374151; margin-top: 4px; }

                /* STAT MINI CARDS */
                .mini-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
                .mini-stat {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; gap: 10px;
                }
                .mini-stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .mini-stat-label { font-size: 12px; color: #4b5563; font-weight: 500; }
                .mini-stat-val { font-size: 18px; font-weight: 800; }

                /* EMPTY / LOADING */
                .empty-state { text-align: center; padding: 80px 20px; color: #374151; }
                .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.2; }
                .empty-text { font-size: 16px; font-weight: 500; color: #4b5563; }
                .loading-wrap { min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
                .ring { width: 44px; height: 44px; border: 3px solid rgba(132,204,22,0.1); border-top-color: #84cc16; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* JOB CARDS */
                .job-card {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px; margin-bottom: 10px; overflow: hidden;
                    transition: border-color 0.2s;
                }
                .job-card:hover { border-color: rgba(255,255,255,0.1); }
                .job-card.expanded { border-color: rgba(132,204,22,0.2); }

                .job-summary {
                    padding: 20px 24px; cursor: pointer;
                    display: flex; align-items: center; justify-content: space-between;
                    flex-wrap: wrap; gap: 12px;
                }
                .job-left { display: flex; align-items: center; gap: 14px; flex: 1; flex-wrap: wrap; }
                .job-info-name { font-size: 15px; font-weight: 700; color: #e5e7eb; }
                .job-info-company { color: #4b5563; font-weight: 400; }
                .job-info-meta { font-size: 12px; color: #374151; margin-top: 3px; }

                .status-pill {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 5px 12px; border-radius: 50px; font-size: 12px;
                    font-weight: 700; border: 1px solid; white-space: nowrap; flex-shrink: 0;
                }
                .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

                .chevron { color: #374151; font-size: 18px; transition: transform 0.25s; flex-shrink: 0; }
                .chevron.open { transform: rotate(180deg); }

                /* DETAIL PANEL */
                .detail-panel {
                    padding: 28px; background: rgba(0,0,0,0.3);
                    border-top: 1px solid rgba(255,255,255,0.04);
                }

                .section-title {
                    font-size: 11px; font-weight: 700; color: #84cc16;
                    text-transform: uppercase; letter-spacing: 1.5px;
                    margin: 0 0 16px; padding-bottom: 10px;
                    border-bottom: 1px solid rgba(132,204,22,0.15);
                }

                .detail-grid {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px; margin-bottom: 28px;
                }

                .detail-item { }
                .detail-label { font-size: 11px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                .detail-value { font-size: 14px; font-weight: 600; color: #e5e7eb; }
                .detail-value a { color: #84cc16; text-decoration: none; }
                .detail-value a:hover { text-decoration: underline; }

                .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
                .specs-table { width: 100%; border-collapse: collapse; }
                .specs-table tr td { padding: 8px 0; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .specs-table tr td:first-child { color: #4b5563; font-weight: 600; width: 140px; }
                .specs-table tr td:last-child { color: #d1d5db; }
                .specs-table tr:last-child td { border-bottom: none; }

                .allowance-chip {
                    display: inline-block; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 6px; padding: 5px 10px; font-size: 12px; color: #9ca3af; margin: 0 4px 4px 0;
                }

                /* STATUS SELECT */
                .status-control {
                    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
                    background: rgba(255,255,255,0.02); border-radius: 10px;
                    padding: 14px 16px; margin-bottom: 24px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .status-control-label { font-size: 13px; font-weight: 600; color: #6b7280; }
                .status-select {
                    padding: 8px 14px; border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif;
                    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
                    color: #e5e7eb; outline: none; cursor: pointer;
                }
                .status-select:focus { border-color: rgba(132,204,22,0.4); }

                /* FILE CARDS */
                .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-bottom: 28px; }
                .file-card {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 12px;
                    transition: border-color 0.2s;
                }
                .file-card:hover { border-color: rgba(255,255,255,0.1); }
                .file-icon { font-size: 22px; }
                .file-name { font-size: 14px; font-weight: 700; color: #e5e7eb; word-break: break-word; }
                .file-original { font-size: 11px; color: #374151; word-break: break-all; margin-top: 2px; }
                .file-desc { font-size: 13px; color: #6b7280; background: rgba(255,255,255,0.02); border-radius: 6px; padding: 8px 10px; line-height: 1.5; }
                .btn-download {
                    background: #84cc16; color: #080808; border: none; border-radius: 8px;
                    padding: 10px; font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif;
                    cursor: pointer; transition: all 0.2s; margin-top: auto;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    box-shadow: 0 2px 12px rgba(132,204,22,0.25);
                }
                .btn-download:hover { background: #a3e635; }

                /* PROOFS */
                .proof-card {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px; padding: 14px 16px; margin-bottom: 8px;
                }
                .proof-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
                .proof-name { font-size: 13px; font-weight: 600; color: #d1d5db; }
                .proof-status-pill {
                    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 50px; border: 1px solid;
                }
                .btn-view-proof {
                    background: none; border: 1px solid rgba(132,204,22,0.2); color: #84cc16;
                    padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
                    font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s;
                }
                .btn-view-proof:hover { background: rgba(132,204,22,0.1); }

                .comment-bubble {
                    padding: 6px 10px; border-radius: 6px; margin-bottom: 4px;
                    font-size: 12px; color: #9ca3af; display: flex; gap: 6px;
                }
                .comment-author { font-weight: 700; flex-shrink: 0; }
                .comment-author.admin { color: #84cc16; }
                .comment-author.client { color: #60a5fa; }

                .upload-proof-bar {
                    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
                    margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.02);
                    border: 1px dashed rgba(255,255,255,0.08); border-radius: 10px;
                }
                .btn-upload-proof {
                    background: rgba(132,204,22,0.1); border: 1px solid rgba(132,204,22,0.25);
                    color: #84cc16; padding: 10px 24px; border-radius: 8px; cursor: pointer;
                    font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif; transition: all 0.2s;
                }
                .btn-upload-proof:hover:not(:disabled) { background: rgba(132,204,22,0.18); }
                .btn-upload-proof:disabled { opacity: 0.5; cursor: not-allowed; }
                .upload-hint { font-size: 12px; color: #374151; }

                /* LIGHTBOX */
                .lightbox {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(0,0,0,0.92); display: flex;
                    align-items: center; justify-content: center;
                    padding: 24px; cursor: pointer; backdrop-filter: blur(8px);
                }
                .lightbox-inner { position: relative; max-width: 90vw; max-height: 90vh; cursor: default; }
                .lightbox-close {
                    position: absolute; top: -44px; right: 0; background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12); color: #fff; width: 32px; height: 32px;
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-size: 16px; transition: background 0.2s;
                }
                .lightbox-close:hover { background: rgba(255,255,255,0.15); }

                @media (max-width: 768px) {
                    .main { padding: 16px; }
                    .topbar { padding: 0 16px; }
                    .specs-grid { grid-template-columns: 1fr; }
                    .toolbar { flex-direction: column; align-items: stretch; }
                    .search-wrap { max-width: 100%; }
                }
            `}</style>

            <div className="portal-wrap">
                {/* Top Bar */}
                <div className="topbar">
                    <div className="topbar-left">
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={120} height={40}
                            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        <div className="admin-tag">
                            <span className="pulse" />
                            Client Portal Admin
                        </div>
                    </div>
                    <button onClick={handleSignOut} className="btn-sign-out">Sign Out</button>
                </div>

                {loading ? (
                    <div className="loading-wrap">
                        <div className="ring" />
                        <span style={{ color: '#4b5563', fontSize: '14px' }}>Loading jobs…</span>
                    </div>
                ) : (
                    <div className="main">
                        <div className="page-header">
                            <h1 className="page-title">Print Jobs</h1>
                            <p className="page-sub">Manage client submissions, upload proofs, and update job status</p>
                        </div>

                        {/* Mini Stats */}
                        <div className="mini-stats">
                            <div className="mini-stat">
                                <span className="mini-stat-dot" style={{ background: '#6b7280' }} />
                                <div>
                                    <div className="mini-stat-label">Total Jobs</div>
                                    <div className="mini-stat-val" style={{ color: '#fff' }}>{jobs.length}</div>
                                </div>
                            </div>
                            {ALL_STATUSES.map(s => {
                                const sc = STATUS_CONFIG[s];
                                return (
                                    <div className="mini-stat" key={s} onClick={() => setFilter(s)} style={{ cursor: 'pointer' }}>
                                        <span className="mini-stat-dot" style={{ background: sc.dot }} />
                                        <div>
                                            <div className="mini-stat-label">{s}</div>
                                            <div className="mini-stat-val" style={{ color: sc.text }}>{statCounts[s] || 0}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Toolbar */}
                        <div className="toolbar">
                            <div className="filter-group">
                                {['all', ...ALL_STATUSES].map(s => (
                                    <button key={s} className={`filter-btn${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                                        {s === 'all' ? 'All' : s} ({statCounts[s] || 0})
                                    </button>
                                ))}
                            </div>
                            <div className="search-wrap">
                                <span className="search-icon">🔍</span>
                                <input
                                    className="search-input"
                                    type="text"
                                    placeholder="Search client, company, email or file…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Jobs */}
                        {filteredJobs.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📂</div>
                                <div className="empty-text">{searchQuery ? 'No jobs match your search' : 'No jobs found'}</div>
                            </div>
                        ) : filteredJobs.map(job => {
                            const isExpanded = expandedJob === job.id;
                            const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG['Uploaded'];
                            const profile = job.profiles || {} as Profile;

                            return (
                                <div key={job.id} className={`job-card${isExpanded ? ' expanded' : ''}`}>
                                    {/* Summary Row */}
                                    <div className="job-summary" onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                                        <div className="job-left">
                                            <span className="status-pill" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                                                <span className="status-dot" style={{ background: sc.dot }} />
                                                {job.status}
                                            </span>
                                            <div>
                                                <p className="job-info-name">
                                                    {profile.full_name || 'Unknown Client'}
                                                    {profile.company && <span className="job-info-company"> — {profile.company}</span>}
                                                </p>
                                                <p className="job-info-meta">
                                                    {profile.email}
                                                    {profile.contact_number ? ` · ${profile.contact_number}` : ''}
                                                    {' · '}{job.print_job_files?.length || 0} file(s)
                                                    {' · '}{new Date(job.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`chevron${isExpanded ? ' open' : ''}`}>▾</span>
                                    </div>

                                    {/* Detail Panel */}
                                    {isExpanded && (
                                        <div className="detail-panel">
                                            {/* Client Details */}
                                            <p className="section-title">Client Profile</p>
                                            <div className="detail-grid" style={{ marginBottom: '28px' }}>
                                                <div className="detail-item">
                                                    <div className="detail-label">Name</div>
                                                    <div className="detail-value">{profile.full_name || '—'}</div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Company</div>
                                                    <div className="detail-value">{profile.company || '—'}</div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Email</div>
                                                    <div className="detail-value"><a href={`mailto:${profile.email}`}>{profile.email}</a></div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-label">Phone</div>
                                                    <div className="detail-value">{profile.contact_number || '—'}</div>
                                                </div>
                                            </div>

                                            {/* Job Specs if present */}
                                            {(job.material || job.delivery_type || job.setup_allowance?.length) && (
                                                <>
                                                    <p className="section-title">Job Specifications</p>
                                                    <div className="specs-grid" style={{ marginBottom: '28px' }}>
                                                        <div>
                                                            <table className="specs-table">
                                                                <tbody>
                                                                    <tr><td>Material</td><td>{job.material || '—'}</td></tr>
                                                                    <tr><td>Fulfillment</td><td style={{ textTransform: 'capitalize' }}>{job.delivery_type || '—'}</td></tr>
                                                                    {job.delivery_address && <tr><td>Address</td><td>{job.delivery_address}</td></tr>}
                                                                    <tr><td>Ground Clearance</td><td>{job.ground_clearance || '—'}</td></tr>
                                                                    <tr><td>Safety File</td><td>{job.safety_file_required ? '✅ Yes' : '❌ No'}</td></tr>
                                                                    <tr><td>Target Date</td><td>{job.completion_target || '—'}</td></tr>
                                                                    {job.storage_required && <tr><td>Storage</td><td>Yes — {job.storage_time_estimate}</td></tr>}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div>
                                                            <table className="specs-table">
                                                                <tbody>
                                                                    <tr><td>Site Contact</td><td>{job.site_contact_person || '—'}{job.site_contact_number ? ` (${job.site_contact_number})` : ''}</td></tr>
                                                                    <tr><td>Access Contact</td><td>{job.access_contact_person || '—'}{job.access_contact_number ? ` (${job.access_contact_number})` : ''}</td></tr>
                                                                    <tr><td>H2O / Elec Notes</td><td>{job.water_electricity_notes || '—'}</td></tr>
                                                                </tbody>
                                                            </table>
                                                            <div style={{ marginTop: '16px' }}>
                                                                <div className="detail-label" style={{ marginBottom: '6px' }}>Setup Allowance</div>
                                                                {!job.setup_allowance?.length
                                                                    ? <span style={{ fontSize: '13px', color: '#4b5563' }}>None</span>
                                                                    : job.setup_allowance.map((a, i) => <span key={i} className="allowance-chip"><strong>{a.date}</strong>: {a.startTime}–{a.endTime}</span>)
                                                                }
                                                            </div>
                                                            <div style={{ marginTop: '12px' }}>
                                                                <div className="detail-label" style={{ marginBottom: '6px' }}>Strike Allowance</div>
                                                                {!job.strike_allowance?.length
                                                                    ? <span style={{ fontSize: '13px', color: '#4b5563' }}>None</span>
                                                                    : job.strike_allowance.map((a, i) => <span key={i} className="allowance-chip"><strong>{a.date}</strong>: {a.startTime}–{a.endTime}</span>)
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Status Control */}
                                            <div className="status-control">
                                                <span className="status-control-label">Change Status:</span>
                                                <select className="status-select" value={job.status}
                                                    onChange={e => changeStatus(job.id, e.target.value)}
                                                    disabled={statusUpdating === job.id}
                                                >
                                                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                {statusUpdating === job.id && <span style={{ fontSize: '12px', color: '#4b5563' }}>Updating…</span>}
                                            </div>

                                            {/* Artwork Files */}
                                            <p className="section-title">Uploaded Artwork ({job.print_job_files?.length || 0})</p>
                                            <div className="file-grid">
                                                {job.print_job_files?.map(f => (
                                                    <div key={f.id} className="file-card">
                                                        <div>
                                                            <div className="file-icon">🎨</div>
                                                            <div className="file-name">{f.display_name || f.original_name}</div>
                                                            {f.display_name && <div className="file-original">{f.original_name}</div>}
                                                            {f.description && <div className="file-desc" style={{ marginTop: '10px' }}>{f.description}</div>}
                                                        </div>
                                                        <button className="btn-download" onClick={() => downloadAdminFile(f.storage_path, f.original_name)}>
                                                            ⬇ Download File
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Proofs */}
                                            <p className="section-title">Proofs ({job.proofs?.length || 0})</p>
                                            {job.proofs?.map(p => {
                                                const ps = PROOF_STATUS_CONFIG[p.status] || PROOF_STATUS_CONFIG['Pending'];
                                                return (
                                                    <div key={p.id} className="proof-card">
                                                        <div className="proof-header">
                                                            <span className="proof-name">🎨 {p.original_name}</span>
                                                            <span className="proof-status-pill" style={{ background: ps.bg, color: ps.text, borderColor: ps.border }}>
                                                                {p.status}
                                                            </span>
                                                            <button className="btn-view-proof" onClick={async () => {
                                                                const url = await getSignedUrl(p.storage_path);
                                                                if (url) setLightboxUrl(url);
                                                            }}>
                                                                View →
                                                            </button>
                                                        </div>
                                                        {p.proof_comments?.map(c => (
                                                            <div key={c.id} className="comment-bubble">
                                                                <span className={`comment-author${c.is_admin ? ' admin' : ' client'}`}>
                                                                    {c.is_admin ? 'Admin' : 'Client'}:
                                                                </span>
                                                                <span>{c.comment}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })}

                                            {/* Upload Proof */}
                                            <div className="upload-proof-bar">
                                                <button className="btn-upload-proof"
                                                    disabled={proofUploading === job.id}
                                                    onClick={() => proofFileRefs.current[job.id]?.click()}
                                                >
                                                    {proofUploading === job.id ? '⏳ Uploading…' : '🎨 Upload Proof'}
                                                </button>
                                                <span className="upload-hint">Uploads automatically and emails the client</span>
                                                <input
                                                    ref={el => { proofFileRefs.current[job.id] = el; }}
                                                    type="file"
                                                    accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.svg"
                                                    style={{ display: 'none' }}
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) uploadProof(job.id, file);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Lightbox */}
                {lightboxUrl && (
                    <div className="lightbox" onClick={() => setLightboxUrl(null)}>
                        <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
                            <button className="lightbox-close" onClick={() => setLightboxUrl(null)}>✕</button>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={lightboxUrl} alt="Proof" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '10px', display: 'block' }} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
