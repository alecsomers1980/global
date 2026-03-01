'use client';
import { useState, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface UploadForm {
    projectName: string;
    quantity: string;
    sizeWidth: string;
    sizeHeight: string;
    sizeUnit: string;
    comments: string;
    deliveryDate: string;
    files: File[];
}

export default function UploadPage() {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState<UploadForm>({
        projectName: '',
        quantity: '',
        sizeWidth: '',
        sizeHeight: '',
        sizeUnit: 'mm',
        comments: '',
        deliveryDate: '',
        files: [],
    });
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    function set(field: keyof UploadForm, value: string) {
        setForm(f => ({ ...f, [field]: value }));
    }

    function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(f => ({ ...f, files: Array.from(e.target.files || []) }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (form.files.length === 0) { setError('Please select at least one file to upload.'); return; }
        setUploading(true);
        setError('');
        setProgress(0);

        const supabase = createClientSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/portal/login'); return; }

        try {
            const uploadedPaths: string[] = [];
            for (let i = 0; i < form.files.length; i++) {
                const file = form.files[i];
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const path = `${user.id}/${Date.now()}_${safeName}`;
                const { error: uploadError } = await supabase.storage
                    .from('client-uploads')
                    .upload(path, file, { upsert: false });
                if (uploadError) throw uploadError;
                uploadedPaths.push(path);
                setProgress(Math.round(((i + 1) / form.files.length) * 80));
            }

            // Trigger internal notification
            const res = await fetch('/api/portal/notify-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientEmail: user.email,
                    clientName: user.user_metadata?.full_name || user.email,
                    projectName: form.projectName,
                    quantity: form.quantity,
                    size: `${form.sizeWidth} x ${form.sizeHeight} ${form.sizeUnit}`,
                    comments: form.comments,
                    deliveryDate: form.deliveryDate,
                    fileNames: form.files.map(f => f.name),
                }),
            });

            if (!res.ok) console.error('Notification email failed (upload still succeeded)');

            setProgress(100);
            setSuccess(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
            setError(msg);
        } finally {
            setUploading(false);
        }
    }

    if (success) {
        return (
            <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ maxWidth: '480px', width: '100%', background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ color: '#2d2d2d', margin: '0 0 12px 0', fontSize: '24px' }}>Files Uploaded Successfully!</h2>
                    <p style={{ color: '#6b7280', marginBottom: '12px' }}>Our team has been notified and will get back to you with a quote or update.</p>
                    <p style={{ color: '#84cc16', fontWeight: 600, marginBottom: '28px' }}>Estimated delivery: <strong style={{ color: '#2d2d2d' }}>{form.deliveryDate}</strong></p>
                    <button onClick={() => { setSuccess(false); setForm({ projectName: '', quantity: '', sizeWidth: '', sizeHeight: '', sizeUnit: 'mm', comments: '', deliveryDate: '', files: [] }); setProgress(0); if (fileRef.current) fileRef.current.value = ''; }}
                        style={{ background: '#84cc16', color: '#2d2d2d', fontWeight: 700, padding: '12px 28px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' }}>
                        Upload Another Job
                    </button>
                </div>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #d1d5db',
        fontSize: '15px', boxSizing: 'border-box', outline: 'none', background: '#fff',
        color: '#1a202c'
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px',
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '20px' }}>
            {/* Header */}
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <div style={{ background: '#2d2d2d', borderRadius: '12px 12px 0 0', padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#84cc16', letterSpacing: '2px' }}>ALOE SIGNS</div>
                        <p style={{ color: '#9ca3af', margin: '4px 0 0 0', fontSize: '13px' }}>Client Upload Portal</p>
                    </div>
                    <button onClick={async () => { const s = createClientSupabase(); await s.auth.signOut(); router.push('/portal/login'); }}
                        style={{ background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        Sign Out
                    </button>
                </div>

                {/* Form */}
                <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                    <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700, color: '#2d2d2d' }}>Submit a New Print Job</h1>
                    <p style={{ margin: '0 0 32px 0', color: '#6b7280', fontSize: '14px' }}>Fill in your job requirements and upload your artwork files below.</p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#dc2626', fontSize: '14px' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Project Name */}
                        <label style={labelStyle}>Project / Job Name</label>
                        <input type="text" required value={form.projectName} onChange={e => set('projectName', e.target.value)}
                            placeholder="e.g. Main Entrance Banner" style={{ ...inputStyle, marginBottom: '20px' }} />

                        {/* Size + Quantity Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>Width</label>
                                <input type="number" required value={form.sizeWidth} onChange={e => set('sizeWidth', e.target.value)}
                                    placeholder="1200" style={inputStyle} min="1" />
                            </div>
                            <div>
                                <label style={labelStyle}>Height</label>
                                <input type="number" required value={form.sizeHeight} onChange={e => set('sizeHeight', e.target.value)}
                                    placeholder="600" style={inputStyle} min="1" />
                            </div>
                            <div>
                                <label style={labelStyle}>Unit</label>
                                <select value={form.sizeUnit} onChange={e => set('sizeUnit', e.target.value)} style={inputStyle}>
                                    <option value="mm">mm</option>
                                    <option value="cm">cm</option>
                                    <option value="m">metres</option>
                                    <option value="inch">inch</option>
                                </select>
                            </div>
                        </div>

                        {/* Quantity */}
                        <label style={labelStyle}>Quantity</label>
                        <input type="number" required value={form.quantity} onChange={e => set('quantity', e.target.value)}
                            placeholder="e.g. 5" min="1" style={{ ...inputStyle, marginBottom: '20px' }} />

                        {/* Delivery Date */}
                        <label style={labelStyle}>Required Delivery Date</label>
                        <input type="date" required value={form.deliveryDate} onChange={e => set('deliveryDate', e.target.value)}
                            style={{ ...inputStyle, marginBottom: '20px' }} min={new Date().toISOString().split('T')[0]} />

                        {/* Comments */}
                        <label style={labelStyle}>Special Requirements / Comments</label>
                        <textarea value={form.comments} onChange={e => set('comments', e.target.value)}
                            placeholder="Lamination type, material, colour references, finishing notes…"
                            style={{ ...inputStyle, height: '100px', resize: 'vertical', marginBottom: '24px' }} />

                        {/* File Upload */}
                        <label style={labelStyle}>Artwork Files</label>
                        <div onClick={() => fileRef.current?.click()}
                            style={{ border: '2px dashed #84cc16', borderRadius: '10px', padding: '28px', textAlign: 'center', cursor: 'pointer', background: form.files.length ? '#f0fce4' : '#fafafa', marginBottom: '8px', transition: 'background 0.2s' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#2d2d2d', fontSize: '15px' }}>
                                {form.files.length ? `${form.files.length} file(s) selected` : 'Click to select files'}
                            </p>
                            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>PDF, AI, EPS, TIFF, PNG, ZIP accepted · No size limit</p>
                            <input ref={fileRef} type="file" multiple onChange={handleFiles} accept=".pdf,.ai,.eps,.tiff,.tif,.png,.jpg,.jpeg,.svg,.zip,.psd" style={{ display: 'none' }} />
                        </div>
                        {form.files.length > 0 && (
                            <ul style={{ margin: '0 0 24px 0', padding: '0', listStyle: 'none' }}>
                                {form.files.map(f => (
                                    <li key={f.name} style={{ fontSize: '13px', color: '#4b5563', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        📄 {f.name} <span style={{ color: '#9ca3af' }}>({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Progress Bar */}
                        {uploading && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ background: '#e5e7eb', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: '#84cc16', borderRadius: '99px', transition: 'width 0.3s ease' }} />
                                </div>
                                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>{progress}% uploaded…</p>
                            </div>
                        )}

                        <button type="submit" disabled={uploading}
                            style={{ width: '100%', padding: '15px', background: uploading ? '#a3d65a' : '#84cc16', color: '#1a1a1a', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.3px' }}>
                            {uploading ? `Uploading… ${progress}%` : '🚀 Submit Job'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
