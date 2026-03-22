'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface JobFile { id: string; original_name: string; display_name: string | null; description: string; width: number; height: number; unit: string; quantity: number; storage_path: string; }
interface ProofComment { id: string; comment: string; is_admin: boolean; created_at: string; }
interface Proof { id: string; original_name: string; status: string; storage_path: string; created_at: string; proof_comments: ProofComment[]; }
interface Job { id: string; status: string; created_at: string; updated_at: string; print_job_files: JobFile[]; proofs: Proof[]; }

const SC: Record<string, { bg: string; text: string; border: string }> = {
    'Uploaded': { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
    'Processing': { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
    'Awaiting Proof Signoff': { bg: 'rgba(236,72,153,0.1)', text: '#f472b6', border: 'rgba(236,72,153,0.2)' },
    'Completed': { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.2)' },
};
const PS: Record<string, { bg: string; text: string }> = { 
    'Pending': { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24' }, 
    'Edit Required': { bg: 'rgba(239,68,68,0.2)', text: '#f87171' }, 
    'Approved': { bg: 'rgba(16,185,129,0.2)', text: '#34d399' } 
};

export default function PortalDashboard() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [respondingProof, setRespondingProof] = useState<string | null>(null);
    const [proofComment, setProofComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userName, setUserName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const loadJobs = useCallback(async () => {
        try { const res = await fetch('/api/portal/jobs'); const data = await res.json(); if (data.jobs) setJobs(data.jobs); } catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadJobs(); createClientSupabase().auth.getUser().then(({ data: { user } }) => { if (user) setUserName(user.user_metadata?.full_name || user.email || ''); }); }, [loadJobs]);

    async function handleSignOut() { await createClientSupabase().auth.signOut(); router.push('/portal/login'); }
    async function getSignedUrl(p: string) { const { data } = await createClientSupabase().storage.from('client-uploads').createSignedUrl(p, 3600); return data?.signedUrl || ''; }
    async function openLightbox(p: string) { const url = await getSignedUrl(p); if (url) setLightboxUrl(url); }
    async function downloadFile(p: string, n: string) { const url = await getSignedUrl(p); if (url) { const a = document.createElement('a'); a.href = url; a.download = n; a.target = '_blank'; a.click(); } }

    async function respondToProof(proofId: string, action: 'Approved' | 'Edit Required') {
        setSubmitting(true);
        try { await fetch(`/api/portal/proofs/${proofId}/respond`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, comment: proofComment }) }); setProofComment(''); setRespondingProof(null); await loadJobs(); } catch (e) { console.error(e); } finally { setSubmitting(false); }
    }

    const proofJobs = jobs.filter(j => j.status === 'Awaiting Proof Signoff' && j.proofs.some(p => p.status === 'Pending'));
    const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '28px', marginBottom: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(132,204,22,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };

    return (
        <div style={{ minHeight: '100vh', background: 'transparent' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px 0', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        <span style={{ color: '#84cc16', fontSize: '13px', borderLeft: '1px solid rgba(255,b,c, 0.15)', paddingLeft: '16px', fontWeight: 600 }}>Client Portal</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>{userName}</span>
                        <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid rgba(132,204,22,0.3)', color: '#84cc16', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Sign Out</button>
                    </div>
                </div>
            </div>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Welcome{userName ? `, ${userName.split(' ')[0]}` : ''} 👋</h1>
                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Manage your print jobs and review proofs</p>
                    </div>
                    <Link href="/portal/upload/artwork" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#84cc16', color: '#0a0a0a', fontWeight: 700, padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', boxShadow: '0 4px 24px rgba(132,204,22,0.3)' }}>＋ Upload Artwork</Link>
                </div>

                {proofJobs.length > 0 && (
                    <div style={{ marginBottom: '36px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🎨 Proofs Awaiting Your Signoff <span style={{ background: 'rgba(132,204,22,0.2)', color: '#84cc16', border: '1px solid rgba(132,204,22,0.3)', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px' }}>{proofJobs.length}</span></h2>
                        {proofJobs.map(job => job.proofs.filter(p => p.status === 'Pending').map(proof => (
                            <div key={proof.id} style={{ ...card, borderLeft: '4px solid #84cc16' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#fff', fontSize: '16px' }}>🎨 {proof.original_name}</p>
                                        <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>Uploaded {new Date(proof.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => openLightbox(proof.storage_path)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>👁️ View</button>
                                        <button onClick={() => downloadFile(proof.storage_path, proof.original_name)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>⬇️ Download</button>
                                    </div>
                                </div>
                                {proof.proof_comments?.length > 0 && <div style={{ marginBottom: '12px' }}>{proof.proof_comments.map(c => (<div key={c.id} style={{ background: c.is_admin ? '#f0fce4' : '#f3f4f6', padding: '10px 14px', borderRadius: '8px', marginBottom: '6px', fontSize: '13px' }}><strong style={{ color: c.is_admin ? '#84cc16' : '#6b7280' }}>{c.is_admin ? 'Admin' : 'You'}:</strong> {c.comment}</div>))}</div>}
                                {respondingProof === proof.id ? (
                                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
                                        <textarea value={proofComment} onChange={e => setProofComment(e.target.value)} placeholder="Leave a comment (required for edit request)..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', resize: 'vertical', height: '80px', boxSizing: 'border-box', outline: 'none', marginBottom: '12px' }} />
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button onClick={() => respondToProof(proof.id, 'Approved')} disabled={submitting} style={{ background: '#1a1a1a', color: '#fff', fontWeight: 700, padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>✅ Approve</button>
                                            <button onClick={() => { if (!proofComment.trim()) { alert('Please add a comment.'); return; } respondToProof(proof.id, 'Edit Required'); }} disabled={submitting} style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700, padding: '10px 24px', border: '1px solid #fcd34d', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>✏️ Request Edit</button>
                                            <button onClick={() => { setRespondingProof(null); setProofComment(''); }} style={{ background: '#f3f4f6', color: '#6b7280', padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (<button onClick={() => setRespondingProof(proof.id)} style={{ background: '#1a1a1a', color: '#fff', fontWeight: 700, padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}>Respond to Proof</button>)}
                            </div>
                        )))}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>📋 Artwork Uploaded</h2>
                    <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by file name or description..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 16px 8px 36px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.04)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (<div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>Loading…</div>)
                    : jobs.length === 0 ? (
                        <div style={card}><div style={{ textAlign: 'center', padding: '40px 20px' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div><h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>No artwork yet</h3><p style={{ color: '#9ca3af', marginBottom: '24px' }}>Upload your first artwork.</p><Link href="/portal/upload/artwork" style={{ background: '#84cc16', color: '#0a0a0a', fontWeight: 700, padding: '12px 28px', borderRadius: '8px', textDecoration: 'none' }}>＋ Upload Artwork</Link></div></div>
                    ) : (() => {
                        const filteredJobs = jobs.filter(job => {
                            if (!searchQuery) return true;
                            const q = searchQuery.toLowerCase();
                            return job.print_job_files?.some(f =>
                                (f.display_name || '').toLowerCase().includes(q) ||
                                (f.original_name || '').toLowerCase().includes(q) ||
                                (f.description || '').toLowerCase().includes(q)
                            );
                        });

                        if (filteredJobs.length === 0) {
                            return <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>No results match your search.</div>;
                        }

                        return filteredJobs.map(job => {
                            const sc = SC[job.status] || SC['Uploaded'];
                            return (
                                <div key={job.id} style={{ ...card, padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>

                                        {/* Left Side: Status & Date */}
                                        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, display: 'inline-block', textAlign: 'center' }}>
                                                {job.status}
                                            </span>
                                            <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 500 }}>
                                                {new Date(job.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Right Side: Artwork List */}
                                        <div style={{ flex: '1 1 0%', minWidth: '200px' }}>
                                            {job.print_job_files?.map((f, idx) => (
                                                <div key={f.id} style={{
                                                    padding: '12px',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.04)',
                                                    marginBottom: idx !== job.print_job_files.length - 1 ? '8px' : '0'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '16px' }}>🎨</span>
                                                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{f.display_name || f.original_name}</span>
                                                    </div>
                                                    {f.description && (
                                                        <p style={{ margin: '0 0 0 24px', color: '#9ca3af', fontSize: '13px', lineHeight: '1.4' }}>
                                                            {f.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Show simple view for pending proofs if any exist */}
                                            {job.proofs?.map(p => {
                                                const ps = PS[p.status] || PS['Pending'];
                                                return (
                                                    <div key={p.id} style={{ marginTop: '12px', padding: '12px', background: 'rgba(132,204,22,0.05)', borderRadius: '8px', border: '1px solid rgba(132,204,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '16px' }}>👁️</span>
                                                            <span style={{ fontWeight: 600, color: '#84cc16', fontSize: '13px' }}>Proof: {p.original_name}</span>
                                                            <span style={{ background: ps.bg, color: ps.text, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{p.status}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => openLightbox(p.storage_path)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>View</button>
                                                            <button onClick={() => downloadFile(p.storage_path, p.original_name)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Download</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    })()}
            </div>
            {lightboxUrl && (
                <div onClick={() => setLightboxUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer', padding: '20px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                        <button onClick={() => setLightboxUrl(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>✕</button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lightboxUrl} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
