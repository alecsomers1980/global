'use client';
import { useState, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FileEntry { id: string; file: File | null; name: string; description: string; }

function createEntry(): FileEntry { return { id: Math.random().toString(36).slice(2), file: null, name: '', description: '' }; }

export default function ArtworkUploadPage() {
    const router = useRouter();
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const [entries, setEntries] = useState<FileEntry[]>([createEntry()]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    function updateEntry(id: string, field: keyof FileEntry, value: any) { setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e)); }
    function addEntry() { setEntries(prev => [...prev, createEntry()]); }
    function removeEntry(id: string) { if (entries.length <= 1) return; setEntries(prev => prev.filter(e => e.id !== id)); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!entries.every(en => en.file && en.name && en.description)) {
            setError('File Name, File Upload, and Description are compulsory for all files.');
            return;
        }

        setUploading(true); setError(''); setProgress(0);
        const supabase = createClientSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/portal/login'); return; }

        try {
            const uploaded: any[] = [];
            for (let i = 0; i < entries.length; i++) {
                const en = entries[i]; if (!en.file) continue;
                const safeName = en.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const path = `${user.id}/${Date.now()}_${safeName}`;
                const { error: err } = await supabase.storage.from('client-uploads').upload(path, en.file, { upsert: false });
                if (err) throw err;
                uploaded.push({
                    storagePath: path,
                    originalName: en.file.name,
                    displayName: en.name.trim(),
                    description: en.description
                });
                setProgress(Math.round(((i + 1) / entries.length) * 80));
            }

            const res = await fetch('/api/portal/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: uploaded })
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
            setProgress(100); setTimeout(() => router.push('/portal/'), 500);
        } catch (err: any) { setError(err.message || 'Upload failed.'); setUploading(false); }
    }

    const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '14px', boxSizing: 'border-box' as const, outline: 'none', background: 'rgba(255,b,c, 0.04)', color: '#fff', transition: 'all 0.2s' };
    const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' };
    const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid rgba(132,204,22,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
    const secTitle: React.CSSProperties = { fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', borderBottom: '2px solid #84cc16', display: 'inline-block', paddingBottom: '4px' };

    return (
        <div style={{ minHeight: '100vh', background: 'transparent' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 0' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        <span style={{ color: '#84cc16', fontSize: '13px', borderLeft: '1px solid rgba(255,b,c, 0.15)', paddingLeft: '16px', fontWeight: 600 }}>Artwork Upload</span>
                    </div>
                    <button onClick={() => router.push('/portal/')} style={{ background: 'transparent', border: '1px solid rgba(132,204,22,0.3)', color: '#84cc16', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>← Back</button>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
                <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Upload Artwork</h1>
                <p style={{ margin: '0 0 28px 0', color: '#9ca3af', fontSize: '14px' }}>Please provide a name and description for each file you upload.</p>

                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#fca5a5', fontSize: '14px', fontWeight: 600 }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {entries.map((en, idx) => (
                        <div key={en.id} style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>{idx === 0 ? 'First File' : `File ${idx + 1}`}</h3>
                                {entries.length > 1 && <button type="button" onClick={() => removeEntry(en.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Remove</button>}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={lbl}>File Name *</label>
                                <input type="text" value={en.name} onChange={e => updateEntry(en.id, 'name', e.target.value)} style={inp} placeholder="e.g. Main Front Banner" required />
                            </div>

                            <div onClick={() => fileRefs.current[en.id]?.click()} style={{ border: `2px dashed ${en.file ? 'rgba(132,204,22,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: en.file ? 'rgba(132,204,22,0.05)' : 'rgba(255,255,255,0.02)', marginBottom: '16px', transition: 'all 0.2s' }}>
                                {en.file ? <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#fff' }}>{en.file.name} ({(en.file.size / 1024 / 1024).toFixed(1)} MB)</p> : <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Click to select/upload file *</p>}
                                <input ref={el => { fileRefs.current[en.id] = el; }} type="file" onChange={e => updateEntry(en.id, 'file', e.target.files?.[0] || null)} required style={{ display: 'none' }} />
                            </div>

                            <div style={{ marginBottom: '0' }}>
                                <label style={lbl}>Description *</label>
                                <textarea value={en.description} onChange={e => updateEntry(en.id, 'description', e.target.value)} style={{ ...inp, minHeight: '80px', resize: 'vertical' }} placeholder="e.g. Please use the high-res version of the logo..." required />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addEntry} style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '32px', transition: 'all 0.2s' }}>+ Add Another File</button>

                    {uploading && (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ background: 'rgba(255,b,c, 0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ background: '#84cc16', width: `${progress}%`, height: '100%', transition: 'width 0.3s' }} />
                            </div>
                            <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px', color: '#9ca3af' }}>Uploading: {progress}%</p>
                        </div>
                    )}

                    <button type="submit" disabled={uploading} style={{ width: '100%', padding: '18px', background: uploading ? '#84cc16/60' : '#84cc16', color: '#0a0a0a', fontWeight: 800, fontSize: '18px', border: 'none', borderRadius: '12px', cursor: uploading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 24px rgba(132,204,22,0.3)', letterSpacing: '0.3px' }}>
                        {uploading ? 'Processing Upload...' : 'Upload Artwork'}
                    </button>
                </form>
            </div>
        </div>
    );
}
