'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface JobFile { id: string; original_name: string; description: string; width: number; height: number; unit: string; quantity: number; storage_path: string; }
interface Job { id: string; status: string; print_job_files: JobFile[]; }
interface NewFileEntry { tempId: string; file: File | null; description: string; width: string; height: string; unit: string; quantity: string; }

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const replaceRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [editedFiles, setEditedFiles] = useState<Record<string, Partial<JobFile>>>({});
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
    const [replacements, setReplacements] = useState<Record<string, File>>({});
    const [newEntries, setNewEntries] = useState<NewFileEntry[]>([]);

    const loadJob = useCallback(async () => {
        try { const res = await fetch(`/api/portal/jobs/${jobId}`); const data = await res.json(); if (data.job) setJob(data.job); } catch (e) { console.error(e); setError('Failed to load job'); } finally { setLoading(false); }
    }, [jobId]);
    useEffect(() => { loadJob(); }, [loadJob]);

    function updateFileField(fileId: string, field: keyof JobFile, value: string | number) { setEditedFiles(prev => ({ ...prev, [fileId]: { ...prev[fileId], [field]: value } })); }
    function markForDeletion(fileId: string) { setFilesToDelete(prev => [...prev, fileId]); }
    function undoDeletion(fileId: string) { setFilesToDelete(prev => prev.filter(id => id !== fileId)); }
    function handleReplacement(fileId: string, file: File) { setReplacements(prev => ({ ...prev, [fileId]: file })); }
    function addNewEntry() { setNewEntries(prev => [...prev, { tempId: Math.random().toString(36).slice(2), file: null, description: '', width: '', height: '', unit: 'mm', quantity: '1' }]); }
    function updateNewEntry(tempId: string, field: keyof NewFileEntry, value: string | File | null) { setNewEntries(prev => prev.map(e => e.tempId === tempId ? { ...e, [field]: value } : e)); }
    function removeNewEntry(tempId: string) { setNewEntries(prev => prev.filter(e => e.tempId !== tempId)); }

    async function handleSave() {
        setSaving(true); setError('');
        const supabase = createClientSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/portal/login'); return; }
        try {
            for (const fileId of filesToDelete) { await fetch(`/api/portal/jobs/${jobId}?fileId=${fileId}`, { method: 'DELETE' }); }
            for (const [fileId, file] of Object.entries(replacements)) {
                if (filesToDelete.includes(fileId)) continue;
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const path = `${user.id}/${Date.now()}_${safeName}`;
                const { error: uploadError } = await supabase.storage.from('client-uploads').upload(path, file, { upsert: false });
                if (uploadError) throw uploadError;
                const existingFile = job?.print_job_files.find(f => f.id === fileId);
                if (existingFile) await supabase.storage.from('client-uploads').remove([existingFile.storage_path]);
                await fetch(`/api/portal/jobs/${jobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId, updates: { storage_path: path, original_name: file.name } }) });
            }
            for (const [fileId, edits] of Object.entries(editedFiles)) {
                if (filesToDelete.includes(fileId) || Object.keys(edits).length === 0) continue;
                await fetch(`/api/portal/jobs/${jobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId, updates: edits }) });
            }
            if (newEntries.length > 0) {
                const newFiles = [];
                for (const entry of newEntries) {
                    if (!entry.file) continue;
                    const safeName = entry.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                    const path = `${user.id}/${Date.now()}_${safeName}`;
                    const { error: uploadError } = await supabase.storage.from('client-uploads').upload(path, entry.file, { upsert: false });
                    if (uploadError) throw uploadError;
                    newFiles.push({ storagePath: path, originalName: entry.file.name, description: entry.description, width: parseFloat(entry.width) || 0, height: parseFloat(entry.height) || 0, unit: entry.unit, quantity: parseInt(entry.quantity) || 1 });
                }
                if (newFiles.length > 0) await fetch(`/api/portal/jobs/${jobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newFiles }) });
            }
            router.push('/portal/');
        } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Save failed.'); } finally { setSaving(false); }
    }

    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' as const, outline: 'none', background: '#fff' };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' };

    if (loading) return <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#9ca3af' }}>Loading job...</p></div>;
    if (!job) return <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#dc2626' }}>Job not found</p></div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            <div style={{ background: '#2d2d2d', padding: '20px 0' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} style={{ objectFit: 'contain' }} />
                        <span style={{ color: '#9ca3af', fontSize: '13px', borderLeft: '1px solid #4b5563', paddingLeft: '16px' }}>Edit Job</span>
                    </div>
                    <button onClick={() => router.push('/portal/')} style={{ background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
                </div>
            </div>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
                <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, color: '#2d2d2d' }}>Edit Print Job</h1>
                <p style={{ margin: '0 0 28px 0', color: '#6b7280', fontSize: '14px' }}>Update files, replace artwork, or modify metadata.</p>
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#dc2626', fontSize: '14px' }}>⚠️ {error}</div>}
                {job.print_job_files.map((file, idx) => {
                    const isDeleted = filesToDelete.includes(file.id);
                    const replacement = replacements[file.id];
                    const edits = editedFiles[file.id] || {};
                    return (
                        <div key={file.id} style={{ background: isDeleted ? '#fef2f2' : '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${isDeleted ? '#fecaca' : '#e5e7eb'}`, opacity: isDeleted ? 0.6 : 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#2d2d2d' }}>File {idx + 1} — {replacement ? replacement.name : file.original_name}</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {!isDeleted && (<>
                                        <button type="button" onClick={() => replaceRefs.current[file.id]?.click()} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>🔄 Replace</button>
                                        <input ref={el => { replaceRefs.current[file.id] = el; }} type="file" onChange={e => e.target.files?.[0] && handleReplacement(file.id, e.target.files[0])} accept=".pdf,.ai,.eps,.tiff,.tif,.png,.jpg,.jpeg,.svg,.zip,.psd" style={{ display: 'none' }} />
                                        <button type="button" onClick={() => markForDeletion(file.id)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>🗑️ Delete</button>
                                    </>)}
                                    {isDeleted && <button type="button" onClick={() => undoDeletion(file.id)} style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>↩️ Undo</button>}
                                </div>
                            </div>
                            {!isDeleted && (<>
                                {replacement && <div style={{ background: '#f0fce4', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', color: '#065f46' }}>✅ Replacing with: {replacement.name}</div>}
                                <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Description</label><input type="text" value={edits.description !== undefined ? edits.description : file.description} onChange={e => updateFileField(file.id, 'description', e.target.value)} style={inputStyle} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px', gap: '12px' }}>
                                    <div><label style={labelStyle}>Width</label><input type="number" value={edits.width !== undefined ? edits.width : file.width} onChange={e => updateFileField(file.id, 'width', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Height</label><input type="number" value={edits.height !== undefined ? edits.height : file.height} onChange={e => updateFileField(file.id, 'height', parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Unit</label><select value={edits.unit !== undefined ? edits.unit : file.unit} onChange={e => updateFileField(file.id, 'unit', e.target.value)} style={inputStyle}><option value="mm">mm</option><option value="cm">cm</option><option value="m">metres</option><option value="inch">inch</option></select></div>
                                    <div><label style={labelStyle}>Qty</label><input type="number" value={edits.quantity !== undefined ? edits.quantity : file.quantity} onChange={e => updateFileField(file.id, 'quantity', parseInt(e.target.value) || 1)} style={inputStyle} /></div>
                                </div>
                            </>)}
                        </div>
                    );
                })}
                {newEntries.map((entry, idx) => (
                    <div key={entry.tempId} style={{ background: '#f0fce4', borderRadius: '12px', padding: '24px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#065f46' }}>➕ New File {idx + 1}</h3>
                            <button type="button" onClick={() => removeNewEntry(entry.tempId)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>✕ Remove</button>
                        </div>
                        <div onClick={() => fileRefs.current[entry.tempId]?.click()} style={{ border: `2px dashed ${entry.file ? '#84cc16' : '#d1d5db'}`, borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: entry.file ? '#fff' : '#fafafa', marginBottom: '12px' }}>
                            {entry.file ? <p style={{ margin: 0, fontWeight: 600, color: '#2d2d2d', fontSize: '14px' }}>📄 {entry.file.name}</p> : <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Click to select file</p>}
                            <input ref={el => { fileRefs.current[entry.tempId] = el; }} type="file" onChange={e => updateNewEntry(entry.tempId, 'file', e.target.files?.[0] || null)} accept=".pdf,.ai,.eps,.tiff,.tif,.png,.jpg,.jpeg,.svg,.zip,.psd" style={{ display: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Description</label><input type="text" value={entry.description} onChange={e => updateNewEntry(entry.tempId, 'description', e.target.value)} style={inputStyle} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px', gap: '12px' }}>
                            <div><label style={labelStyle}>Width</label><input type="number" value={entry.width} onChange={e => updateNewEntry(entry.tempId, 'width', e.target.value)} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Height</label><input type="number" value={entry.height} onChange={e => updateNewEntry(entry.tempId, 'height', e.target.value)} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Unit</label><select value={entry.unit} onChange={e => updateNewEntry(entry.tempId, 'unit', e.target.value)} style={inputStyle}><option value="mm">mm</option><option value="cm">cm</option><option value="m">metres</option><option value="inch">inch</option></select></div>
                            <div><label style={labelStyle}>Qty</label><input type="number" value={entry.quantity} onChange={e => updateNewEntry(entry.tempId, 'quantity', e.target.value)} style={inputStyle} /></div>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addNewEntry} style={{ width: '100%', padding: '14px', background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#6b7280', marginBottom: '24px' }}>＋ Add Another File</button>
                <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '16px', background: saving ? '#a3d65a' : '#84cc16', color: '#1a1a1a', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(132,204,22,0.3)' }}>
                    {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
            </div>
        </div>
    );
}
