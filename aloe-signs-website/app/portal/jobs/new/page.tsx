'use client';
import { useState, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FileEntry { id: string; file: File | null; name: string; description: string; }
interface AllowanceEntry { date: string; startTime: string; endTime: string; }

function createEntry(): FileEntry { return { id: Math.random().toString(36).slice(2), file: null, name: '', description: '' }; }
function createAllowance(): AllowanceEntry { return { date: '', startTime: '08:00', endTime: '17:00' }; }

export default function NewJobPage() {
  const router = useRouter();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [entries, setEntries] = useState<FileEntry[]>([createEntry()]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Job Level State
  const [material, setMaterial] = useState('');
  const [deliveryType, setDeliveryType] = useState<'installation' | 'collection' | 'delivery'>('collection');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [groundClearance, setGroundClearance] = useState('');
  const [waterElectricityNotes, setWaterElectricityNotes] = useState('');
  const [safetyFileRequired, setSafetyFileRequired] = useState(false);
  const [siteContactPerson, setSiteContactPerson] = useState('');
  const [siteContactNumber, setSiteContactNumber] = useState('');
  const [accessContactPerson, setAccessContactPerson] = useState('');
  const [accessContactNumber, setAccessContactNumber] = useState('');
  const [completionTarget, setCompletionTarget] = useState('');
  const [storageRequired, setStorageRequired] = useState(false);
  const [storageTimeEstimate, setStorageTimeEstimate] = useState('');
  const [setupAllowance, setSetupAllowance] = useState<AllowanceEntry[]>([createAllowance()]);
  const [strikeAllowance, setStrikeAllowance] = useState<AllowanceEntry[]>([createAllowance()]);

  function updateEntry(id: string, field: keyof FileEntry, value: any) { setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e)); }
  function addEntry() { setEntries(prev => [...prev, createEntry()]); }
  function removeEntry(id: string) { if (entries.length <= 1) return; setEntries(prev => prev.filter(e => e.id !== id)); }

  function addAllowance(type: 'setup' | 'strike') {
    if (type === 'setup') setSetupAllowance([...setupAllowance, createAllowance()]);
    else setStrikeAllowance([...strikeAllowance, createAllowance()]);
  }
  function updateAllowance(type: 'setup' | 'strike', index: number, field: keyof AllowanceEntry, value: string) {
    const setter = type === 'setup' ? setSetupAllowance : setStrikeAllowance;
    setter(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  }
  function removeAllowance(type: 'setup' | 'strike', index: number) {
    const setter = type === 'setup' ? setSetupAllowance : setStrikeAllowance;
    setter(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entries.every(en => en.file && en.name && en.description)) {
      setError('File Name, File Upload, and Description are compulsory for all files.');
      return;
    }
    if (entries.some(en => en.name.toLowerCase().includes('new'))) {
      setError('The word "NEW" is not allowed as part of the file name - Ha, ha.');
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
        body: JSON.stringify({
          files: uploaded,
          material,
          deliveryType,
          deliveryAddress,
          groundClearance,
          waterElectricityNotes,
          safetyFileRequired,
          siteContactPerson,
          siteContactNumber,
          accessContactPerson,
          accessContactNumber,
          completionTarget,
          setupAllowance: setupAllowance.filter(a => a.date),
          strikeAllowance: strikeAllowance.filter(a => a.date),
          storageRequired,
          storageTimeEstimate
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setProgress(100); setTimeout(() => router.push('/portal/'), 500);
    } catch (err: any) { setError(err.message || 'Upload failed.'); setUploading(false); }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' as const, outline: 'none', background: '#fff' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' };
  const card: React.CSSProperties = { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' };
  const secTitle: React.CSSProperties = { fontSize: '16px', fontWeight: 700, color: '#2d2d2d', marginBottom: '16px', borderBottom: '2px solid #84cc16', display: 'inline-block', paddingBottom: '4px' };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#2d2d2d', padding: '20px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Image src="/aloe-logo.png" alt="Aloe Signs" width={140} height={46} style={{ objectFit: 'contain' }} />
            <span style={{ color: '#9ca3af', fontSize: '13px', borderLeft: '1px solid #4b5563', paddingLeft: '16px' }}>New Job Submission</span>
          </div>
          <button onClick={() => router.push('/portal/')} style={{ background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, color: '#2d2d2d' }}>Submit a New Print Job</h1>
        <p style={{ margin: '0 0 28px 0', color: '#6b7280', fontSize: '14px' }}>Please complete all required fields below.</p>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: '#dc2626', fontSize: '14px', fontWeight: 600 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <h3 style={secTitle}>Artwork Files</h3>
          {entries.map((en, idx) => (
            <div key={en.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{idx === 0 ? 'First File' : `File ${idx + 1}`}</h3>
                {entries.length > 1 && <button type="button" onClick={() => removeEntry(en.id)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Remove</button>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={lbl}>File Name * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Give this artwork a name - the word NEW will not be allowed as part of this file name - Ha, ha.)</span></label>
                <input type="text" value={en.name} onChange={e => updateEntry(en.id, 'name', e.target.value)} style={inp} placeholder="e.g. Main Front Banner" required />
              </div>

              <div onClick={() => fileRefs.current[en.id]?.click()} style={{ border: `2px dashed ${en.file ? '#84cc16' : '#d1d5db'}`, borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: en.file ? '#f0fce4' : '#fafafa', marginBottom: '16px' }}>
                {en.file ? <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{en.file.name} ({(en.file.size / 1024 / 1024).toFixed(1)} MB)</p> : <p style={{ margin: 0, color: '#6b7280' }}>Click to select/upload file *</p>}
                <input ref={el => { fileRefs.current[en.id] = el; }} type="file" onChange={e => updateEntry(en.id, 'file', e.target.files?.[0] || null)} required style={{ display: 'none' }} />
              </div>

              <div style={{ marginBottom: '0' }}>
                <label style={lbl}>Description * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Any extra notes regarding the artwork)</span></label>
                <textarea value={en.description} onChange={e => updateEntry(en.id, 'description', e.target.value)} style={{ ...inp, minHeight: '80px', resize: 'vertical' }} placeholder="e.g. Eyelets every 500mm, double stitched edges..." required />
              </div>
            </div>
          ))}
          <button type="button" onClick={addEntry} style={{ width: '100%', padding: '14px', background: '#fff', border: '2px dashed #d1d5db', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: '#6b7280', marginBottom: '32px' }}>+ Add Another File</button>

          <h3 style={secTitle}>Job Details</h3>
          <div style={card}>
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Material</label>
              <input type="text" value={material} onChange={e => setMaterial(e.target.value)} style={inp} placeholder="Leave blank if you are unsure" />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Fulfillment Method</label>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" checked={deliveryType === 'installation'} onChange={() => setDeliveryType('installation')} /> Installation
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" checked={deliveryType === 'collection'} onChange={() => setDeliveryType('collection')} /> Package for Collection
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} /> Packages for Delivery
                </label>
              </div>
            </div>

            {(deliveryType === 'installation' || deliveryType === 'delivery') && (
              <div style={{ marginBottom: '20px' }}>
                <label style={lbl}>{deliveryType === 'installation' ? 'Installation Address' : 'Delivery Address'}</label>
                <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} style={{ ...inp, minHeight: '60px' }} placeholder="Unit number, Building name, Street, City..." />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={lbl}>Product Ground Clearance</label><input type="text" value={groundClearance} onChange={e => setGroundClearance(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Do we require safety file for installation?</label>
                <select value={safetyFileRequired ? 'yes' : 'no'} onChange={e => setSafetyFileRequired(e.target.value === 'yes')} style={inp}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Any notes regarding water or electricity</label>
              <textarea value={waterElectricityNotes} onChange={e => setWaterElectricityNotes(e.target.value)} style={{ ...inp, minHeight: '60px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={lbl}>Site Contact Person</label><input type="text" value={siteContactPerson} onChange={e => setSiteContactPerson(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Site Contact Number</label><input type="text" value={siteContactNumber} onChange={e => setSiteContactNumber(e.target.value)} style={inp} /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div><label style={lbl}>Access Contact Person</label><input type="text" value={accessContactPerson} onChange={e => setAccessContactPerson(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Access Contact Number</label><input type="text" value={accessContactNumber} onChange={e => setAccessContactNumber(e.target.value)} style={inp} /></div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Completion Target</label>
              <input type="date" value={completionTarget} onChange={e => setCompletionTarget(e.target.value)} style={inp} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Storage Required?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={storageRequired} onChange={() => setStorageRequired(!storageRequired)} /> Yes
                </label>
                {storageRequired && (
                  <input type="text" value={storageTimeEstimate} onChange={e => setStorageTimeEstimate(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Storage time estimate (e.g. 2 weeks)" />
                )}
              </div>
            </div>
          </div>

          <h3 style={secTitle}>Allowances</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={card}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Setup Allowance</h4>
              {setupAllowance.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 30px', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                  <div><label style={{ fontSize: '10px', fontWeight: 600 }}>Date</label><input type="date" value={a.date} onChange={e => updateAllowance('setup', i, 'date', e.target.value)} style={{ ...inp, padding: '6px' }} /></div>
                  <div><label style={{ fontSize: '10px', fontWeight: 600 }}>Start</label><input type="time" value={a.startTime} onChange={e => updateAllowance('setup', i, 'startTime', e.target.value)} style={{ ...inp, padding: '6px' }} /></div>
                  <div><label style={{ fontSize: '10px', fontWeight: 600 }}>End</label><input type="time" value={a.endTime} onChange={e => updateAllowance('setup', i, 'endTime', e.target.value)} style={{ ...inp, padding: '6px' }} /></div>
                  {setupAllowance.length > 1 && <button type="button" onClick={() => removeAllowance('setup', i)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', height: '32px' }}>×</button>}
                </div>
              ))}
              <button type="button" onClick={() => addAllowance('setup')} style={{ width: '100%', padding: '8px', border: '1px dashed #d1d5db', background: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}>+ Add Day</button>
            </div>

            <div style={card}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Strike Allowance</h4>
              {strikeAllowance.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 30px', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                  <div><label style={{ fontSize: '10px', fontWeight: 600 }}>Date</label><input type="date" value={a.date} onChange={e => updateAllowance('strike', i, 'date', e.target.value)} style={{ ...inp, padding: '6px' }} /></div>
                  <div><label style={{ fontSize: '10px', fontWeight: 600 }}>Start</label><input type="time" value={a.startTime} onChange={e => updateAllowance('strike', i, 'startTime', e.target.value)} style={{ ...inp, padding: '6px' }} /></div>
                  <div><label style={{ fontSize: '10px', fontWeight: 600 }}>End</label><input type="time" value={a.endTime} onChange={e => updateAllowance('strike', i, 'endTime', e.target.value)} style={{ ...inp, padding: '6px' }} /></div>
                  {strikeAllowance.length > 1 && <button type="button" onClick={() => removeAllowance('strike', i)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', height: '32px' }}>×</button>}
                </div>
              ))}
              <button type="button" onClick={() => addAllowance('strike')} style={{ width: '100%', padding: '8px', border: '1px dashed #d1d5db', background: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}>+ Add Day</button>
            </div>
          </div>

          {uploading && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ background: '#e2e8f0', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ background: '#84cc16', width: `${progress}%`, height: '100%', transition: 'width 0.3s' }} />
              </div>
              <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '8px', color: '#64748b' }}>Uploading: {progress}%</p>
            </div>
          )}

          <button type="submit" disabled={uploading} style={{ width: '100%', padding: '18px', background: uploading ? '#cbd5e1' : '#84cc16', color: '#1a1a1a', fontWeight: 700, fontSize: '18px', border: 'none', borderRadius: '12px', cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? 'Processing Submission...' : 'Submit Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
