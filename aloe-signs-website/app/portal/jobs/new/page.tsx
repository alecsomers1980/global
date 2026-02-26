'use client';
import { useState, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FileEntry { id: string; file: File | null; description: string; width: string; height: string; unit: string; quantity: string; }
function createEntry(): FileEntry { return { id: Math.random().toString(36).slice(2), file: null, description: '', width: '', height: '', unit: 'mm', quantity: '1' }; }

export default function NewJobPage() {
  const router = useRouter();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [entries, setEntries] = useState<FileEntry[]>([createEntry()]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  function updateEntry(id: string, field: keyof FileEntry, value: string | File | null) { setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e)); }
  function addEntry() { setEntries(prev => [...prev, createEntry()]); }
  function removeEntry(id: string) { if (entries.length <= 1) return; setEntries(prev => prev.filter(e => e.id !== id)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entries.every(en => en.file)) { setError('Please select a file for each entry.'); return; }
    setUploading(true); setError(''); setProgress(0);
    const supabase = createClientSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/portal/login'); return; }
    try {
      const uploaded: Array<{ storagePath: string; originalName: string; description: string; width: number; height: number; unit: string; quantity: number }> = [];
      for (let i = 0; i < entries.length; i++) {
        const en = entries[i]; if (!en.file) continue;
        const safeName = en.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${user.id}/${Date.now()}_${safeName}`;
        const { error: err } = await supabase.storage.from('client-uploads').upload(path, en.file, { upsert: false });
        if (err) throw err;
        uploaded.push({ storagePath: path, originalName: en.file.name, description: en.description, width: parseFloat(en.width) || 0, height: parseFloat(en.height) || 0, unit: en.unit, quantity: parseInt(en.quantity) || 1 });
        setProgress(Math.round(((i + 1) / entries.length) * 80));
      }
      const res = await fetch('/api/portal/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: uploaded }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setProgress(100); setTimeout(() => router.push('/portal/'), 500);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Upload failed.'); setUploading(false); }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' as const, outline: 'none', background: '#fff' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#2d2d2d', padding: '20px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} style={{ objectFit: 'contain' }} />
            <span style={{ color: '#9ca3af', fontSize: '13px', borderLeft: '1px solid #4b5563', paddingLeft: '16px' }}>New Print Job</span>
          </div>
          <button onClick={() => router.push('/portal/')} style={{ background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
        </div>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, color: '#2d2d2d' }}>Submit a New Print Job</h1>
        <p style={{ margin: '0 0 28px 0', color: '#6b7280', fontSize: '14px' }}>Add your artwork files below with description, dimensions and quantity.</p>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#dc2626', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {entries.map((en, idx) => (
            <div key={en.id} style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>File {idx + 1}</h3>
                {entries.length > 1 && <button type="button" onClick={() => removeEntry(en.id)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Remove</button>}
              </div>
              <div onClick={() => fileRefs.current[en.id]?.click()} style={{ border: `2px dashed ${en.file ? '#84cc16' : '#d1d5db'}`, borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: en.file ? '#f0fce4' : '#fafafa', marginBottom: '16px' }}>
                {en.file ? <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{en.file.name} ({(en.file.size / 1024 / 1024).toFixed(1)} MB)</p> : <p style={{ margin: 0, color: '#6b7280' }}>Click to select file</p>}
                <input ref={el => { fileRefs.current[en.id] = el; }} type="file" onChange={e => updateEntry(en.id, 'file', e.target.files?.[0] || null)} accept=".pdf,.ai,.eps,.tiff,.tif,.png,.jpg,.jpeg,.svg,.zip,.psd" style={{ display: 'none' }} />
              </div>
              <div style={{ marginBottom: '12px' }}><label style={lbl}>Description</label><input type="text" value={en.description} onChange={e => updateEntry(en.id, 'description', e.target.value)} style={inp} placeholder="e.g. Main banner" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px', gap: '12px' }}>
                <div><label style={lbl}>Width</label><input type="number" value={en.width} onChange={e => updateEntry(en.id, 'width', e.target.value)} style={inp} min="0" step="any" /></div>
                <div><label style={lbl}>Height</label><input type="number" value={en.height} onChange={e => updateEntry(en.id, 'height', e.target.value)} style={inp} min="0" step="any" /></div>
                <div><label style={lbl}>Unit</label><select value={en.unit} onChange={e => updateEntry(en.id, 'unit', e.target.value)} style={inp}><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option><option value="inch">inch</option></select></div>
                <div><label style={lbl}>Qty</label><input type="number" value={en.quantity} onChange={e => updateEntry(en.id, 'quantity', e.target.value)} style={inp} min="1" /></div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addEntry} style={{ width: '100%', padding: '14px', background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#6b7280', marginBottom: '24px' }}>+ Add Another File</button>
          {uploading && <div style={{ marginBottom: '20px' }}><div style={{ background: '#e5e7eb', borderRadius: '99px', height: '8px', overflow: 'hidden' }}><div style={{ width: `${progress}%`, height: '100%', background: '#84cc16', borderRadius: '99px', transition: 'width 0.3s' }} /></div><p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>{progress}%</p></div>}
          <button type="submit" disabled={uploading} style={{ width: '100%', padding: '16px', background: uploading ? '#a3d65a' : '#84cc16', color: '#1a1a1a', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '10px', cursor: uploading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(132,204,22,0.3)' }}>{uploading ? `Uploading ${progress}%` : 'Submit Job'}</button>
        </form>
      </div>
    </div>
  );
}
