'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Allowance {
    date: string;
    startTime: string;
    endTime: string;
}

interface JobFile {
    id: string;
    original_name: string;
    display_name: string | null;
    description: string;
    storage_path: string;
}

interface ProofComment {
    id: string;
    comment: string;
    is_admin: boolean;
    created_at: string;
    user_id: string;
}

interface Proof {
    id: string;
    original_name: string;
    status: string;
    storage_path: string;
    created_at: string;
    proof_comments: ProofComment[];
}

interface Profile {
    full_name: string;
    email: string;
    company: string | null;
    contact_number: string | null;
}

interface Job {
    id: string;
    user_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    material: string | null;
    delivery_type: string | null;
    delivery_address: string | null;
    ground_clearance: string | null;
    water_electricity_notes: string | null;
    safety_file_required: boolean;
    site_contact_person: string | null;
    site_contact_number: string | null;
    access_contact_person: string | null;
    access_contact_number: string | null;
    completion_target: string | null;
    setup_allowance: Allowance[] | null;
    strike_allowance: Allowance[] | null;
    storage_required: boolean;
    storage_time_estimate: string | null;
    profiles: Profile;
    print_job_files: JobFile[];
    proofs: Proof[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Uploaded': { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    'Processing': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    'Awaiting Proof Signoff': { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
    'Completed': { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
};

const PROOF_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    'Pending': { bg: '#fef3c7', text: '#92400e' },
    'Edit Required': { bg: '#fee2e2', text: '#991b1b' },
    'Approved': { bg: '#d1fae5', text: '#065f46' },
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
        } catch (e) {
            console.error('Failed to load jobs:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    async function handleSignOut() {
        const supabase = createClientSupabase();
        await supabase.auth.signOut();
        router.push('/portal/login');
    }

    async function getSignedUrl(storagePath: string): Promise<string> {
        const supabase = createClientSupabase();
        const { data } = await supabase.storage
            .from('client-uploads')
            .createSignedUrl(storagePath, 3600);
        return data?.signedUrl || '';
    }

    async function downloadAdminFile(storagePath: string, originalName: string) {
        const url = await getSignedUrl(storagePath);
        if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = originalName;
            a.target = '_blank';
            a.click();
        }
    }

    async function changeStatus(jobId: string, newStatus: string) {
        setStatusUpdating(jobId);
        try {
            await fetch(`/api/portal/admin/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, notifyClient: true }),
            });
            await loadJobs();
        } catch (e) {
            console.error('Failed to update status:', e);
        } finally {
            setStatusUpdating(null);
        }
    }

    async function uploadProof(jobId: string, file: File) {
        setProofUploading(jobId);
        try {
            const supabase = createClientSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const path = `proofs/${jobId}/${Date.now()}_${safeName}`;

            const { error: uploadError } = await supabase.storage
                .from('client-uploads')
                .upload(path, file, { upsert: false });

            if (uploadError) throw uploadError;

            await fetch(`/api/portal/admin/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proofStoragePath: path,
                    proofOriginalName: file.name,
                }),
            });

            await loadJobs();
        } catch (e) {
            console.error('Failed to upload proof:', e);
        } finally {
            setProofUploading(null);
        }
    }

    const filteredByStatus = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);
    const filteredJobs = filteredByStatus.filter(job => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const profile = job.profiles || {} as Profile;

        return (
            (profile.full_name || '').toLowerCase().includes(q) ||
            (profile.company || '').toLowerCase().includes(q) ||
            (profile.email || '').toLowerCase().includes(q) ||
            job.print_job_files?.some(f => (f.display_name || f.original_name).toLowerCase().includes(q))
        );
    });

    const statCounts: Record<string, number> = {
        all: jobs.length,
        ...Object.fromEntries(ALL_STATUSES.map(s => [s, jobs.filter(j => j.status === s).length])),
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            {/* Header */}
            <div style={{ background: '#2d2d2d', padding: '20px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} style={{ objectFit: 'contain' }} />
                        <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700, borderLeft: '1px solid #4b5563', paddingLeft: '16px' }}>⚙️ Admin Portal</span>
                    </div>
                    <button onClick={handleSignOut}
                        style={{ background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        Sign Out
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
                <h1 style={{ margin: '0 0 24px 0', fontSize: '26px', fontWeight: 700, color: '#2d2d2d' }}>All Print Jobs</h1>

                {/* Status Filter and Search Bar */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['all', ...ALL_STATUSES].map(status => {
                            const isActive = filter === status;
                            const sc = status === 'all'
                                ? { bg: isActive ? '#2d2d2d' : '#f3f4f6', text: isActive ? '#fff' : '#6b7280', border: '#d1d5db' }
                                : STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
                            return (
                                <button key={status} onClick={() => setFilter(status)}
                                    style={{
                                        background: isActive ? sc.bg : '#fff',
                                        color: isActive ? sc.text : '#6b7280',
                                        border: `1px solid ${isActive ? (sc as { border?: string }).border || sc.bg : '#d1d5db'}`,
                                        padding: '8px 18px', borderRadius: '99px', cursor: 'pointer',
                                        fontSize: '13px', fontWeight: isActive ? 700 : 500,
                                        transition: 'all 0.2s',
                                    }}>
                                    {status === 'all' ? 'All' : status} ({statCounts[status] || 0})
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ flex: '1 1 250px', maxWidth: '400px' }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search client, company, email, or file..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px 10px 36px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Jobs List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>Loading…</div>
                ) : filteredJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>No jobs found.</div>
                ) : (
                    filteredJobs.map(job => {
                        const isExpanded = expandedJob === job.id;
                        const sc = STATUS_COLORS[job.status] || STATUS_COLORS['Uploaded'];
                        const profile = job.profiles || {} as Profile;

                        return (
                            <div key={job.id} style={{
                                background: '#fff', borderRadius: '12px', marginBottom: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb',
                                overflow: 'hidden',
                            }}>
                                {/* Summary Row */}
                                <div onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                                    style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
                                        <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: '4px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700 }}>
                                            {job.status}
                                        </span>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#2d2d2d' }}>
                                                {profile.full_name || 'Unknown Client'}
                                                {profile.company && <span style={{ color: '#9ca3af', fontWeight: 400 }}> — {profile.company}</span>}
                                            </p>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                                                {profile.email} · {profile.contact_number || 'No phone'} · {job.print_job_files?.length || 0} file(s) · {new Date(job.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span style={{ color: '#9ca3af', fontSize: '20px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{ padding: '24px', background: '#f9fafb', borderTop: '1px solid #eee' }}>
                                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Client Details</h4>
                                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                                            <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Name</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{profile.full_name || 'Unknown'}</p></div>
                                            <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Company</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{profile.company || '—'}</p></div>
                                            <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Email</p><a href={`mailto:${profile.email}`} style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#84cc16', textDecoration: 'none' }}>{profile.email}</a></div>
                                            <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Contact Number</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{profile.contact_number || '—'}</p></div>
                                        </div>

                                        {(!job.material && !job.delivery_type && (!job.setup_allowance || job.setup_allowance.length === 0)) ? null : (
                                            <>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Fulfillment Details</h4>
                                                        <table style={{ width: '100%', fontSize: '13px', color: '#4b5563' }}>
                                                            <tbody>
                                                                <tr><td style={{ padding: '4px 0', fontWeight: 600, width: '120px' }}>Material</td><td>{job.material || '—'}</td></tr>
                                                                <tr><td style={{ padding: '4px 0', fontWeight: 600 }}>Delivery Type</td><td style={{ textTransform: 'capitalize' }}>{job.delivery_type}</td></tr>
                                                                {job.delivery_address && <tr><td style={{ padding: '4px 0', fontWeight: 600 }}>Address</td><td>{job.delivery_address}</td></tr>}
                                                                <tr><td style={{ padding: '4px 0', fontWeight: 600 }}>Ground Clearance</td><td>{job.ground_clearance || '—'}</td></tr>
                                                                <tr><td style={{ padding: '4px 0', fontWeight: 600 }}>Safety File?</td><td>{job.safety_file_required ? '✅ YES' : '❌ NO'}</td></tr>
                                                                <tr><td style={{ padding: '4px 0', fontWeight: 600 }}>Target Date</td><td>{job.completion_target || '—'}</td></tr>
                                                                {job.storage_required && <tr><td style={{ padding: '4px 0', fontWeight: 600 }}>Storage</td><td>YES ({job.storage_time_estimate})</td></tr>}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Information</h4>
                                                        <table style={{ width: '100%', fontSize: '13px', color: '#4b5563' }}>
                                                            <tbody>
                                                                <tr><td style={{ padding: '4px 0', fontWeight: 600, width: '120px' }}>Site Contact</td><td>{job.site_contact_person || '—'} {job.site_contact_number ? `(${job.site_contact_number})` : ''}</td></tr>
                                                                <tr><td style={{ padding: '4px 0', fontWeight: 600 }}>Access Contact</td><td>{job.access_contact_person || '—'} {job.access_contact_number ? `(${job.access_contact_number})` : ''}</td></tr>
                                                                <tr><td style={{ padding: '4px 0', fontWeight: 600 }}>Notes (H2O/Elec)</td><td>{job.water_electricity_notes || '—'}</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Setup Allowance</h4>
                                                        <div style={{ fontSize: '13px', color: '#4b5563' }}>
                                                            {!job.setup_allowance || job.setup_allowance.length === 0 ? 'None scheduled' : job.setup_allowance.map((a, i) => (
                                                                <div key={i} style={{ padding: '4px 8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '4px' }}>
                                                                    <strong>{a.date}</strong>: {a.startTime} – {a.endTime}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Strike Allowance</h4>
                                                        <div style={{ fontSize: '13px', color: '#4b5563' }}>
                                                            {!job.strike_allowance || job.strike_allowance.length === 0 ? 'None scheduled' : job.strike_allowance.map((a, i) => (
                                                                <div key={i} style={{ padding: '4px 8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '4px' }}>
                                                                    <strong>{a.date}</strong>: {a.startTime} – {a.endTime}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Status Change */}
                                        <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Change Status:</label>
                                            <select
                                                value={job.status}
                                                onChange={e => changeStatus(job.id, e.target.value)}
                                                disabled={statusUpdating === job.id}
                                                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
                                            >
                                                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {statusUpdating === job.id && <span style={{ color: '#9ca3af', fontSize: '13px' }}>Updating…</span>}
                                        </div>

                                        {/* Files */}
                                        <h4 style={{ margin: '24px 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Uploaded Artwork ({job.print_job_files?.length || 0})</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                            {job.print_job_files?.map(f => (
                                                <div key={f.id} style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '20px' }}>🎨</span>
                                                            <div>
                                                                <h5 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#1f2937', wordBreak: 'break-word' }}>{f.display_name || f.original_name}</h5>
                                                                {f.display_name && <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>({f.original_name})</p>}
                                                            </div>
                                                        </div>
                                                        {f.description && (
                                                            <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.5', background: '#f9fafb', padding: '10px', borderRadius: '6px' }}>
                                                                {f.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button onClick={() => downloadAdminFile(f.storage_path, f.original_name)} style={{ background: '#1a1a1a', color: '#fff', fontWeight: 700, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'background 0.2s', marginTop: 'auto' }} onMouseEnter={e => e.currentTarget.style.background = '#000'} onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}>
                                                        ⬇️ Download File
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Proofs */}
                                        <h4 style={{ margin: '20px 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Proofs ({job.proofs?.length || 0})</h4>
                                        {job.proofs?.map(p => {
                                            const ps = PROOF_STATUS_COLORS[p.status] || PROOF_STATUS_COLORS['Pending'];
                                            return (
                                                <div key={p.id} style={{ background: '#f9fafb', padding: '12px 16px', borderRadius: '8px', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>🎨 {p.original_name}</span>
                                                        <span style={{ background: ps.bg, color: ps.text, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{p.status}</span>
                                                        <button onClick={async () => {
                                                            const url = await getSignedUrl(p.storage_path);
                                                            if (url) setLightboxUrl(url);
                                                        }} style={{ background: 'none', border: 'none', color: '#84cc16', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>View</button>
                                                    </div>
                                                    {p.proof_comments?.map(c => (
                                                        <div key={c.id} style={{ fontSize: '12px', color: '#4b5563', padding: '4px 0' }}>
                                                            <strong style={{ color: c.is_admin ? '#84cc16' : '#6b7280' }}>{c.is_admin ? 'Admin' : 'Client'}:</strong> {c.comment}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}

                                        {/* Upload Proof */}
                                        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <button onClick={() => proofFileRefs.current[job.id]?.click()}
                                                disabled={proofUploading === job.id}
                                                style={{ background: '#1a1a1a', color: '#fff', fontWeight: 700, padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                                {proofUploading === job.id ? 'Uploading…' : '🎨 Upload Proof'}
                                            </button>
                                            <input
                                                ref={el => { proofFileRefs.current[job.id] = el; }}
                                                type="file"
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) uploadProof(job.id, file);
                                                    e.target.value = '';
                                                }}
                                                accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.svg"
                                                style={{ display: 'none' }}
                                            />
                                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Uploads proof and emails the client automatically</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Lightbox */}
            {lightboxUrl && (
                <div onClick={() => setLightboxUrl(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer', padding: '20px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                        <button onClick={() => setLightboxUrl(null)}
                            style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>✕</button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lightboxUrl} alt="Proof" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
