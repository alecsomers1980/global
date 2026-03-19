'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

/* ── Types ──────────────────────────────────────────── */
interface HomepageEvent { id: string; date_label: string; day_label: string; title: string; type: string; location: string; sort_order: number; }
interface CoreValue { id: string; name: string; description: string; sub_values: string; icon: string; sort_order: number; }
interface Testimonial { id: string; quote: string; name: string; role: string; initials: string; sort_order: number; }
interface Association { id: string; name: string; full_name: string; image_url: string; sort_order: number; }
interface EventPoster { id: string; title: string; image_url: string; link_url: string; sort_order: number; }

type ActiveTab = 'events' | 'posters' | 'values' | 'testimonials' | 'associations';

export default function HomepageManagerPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('events');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [events, setEvents] = useState<HomepageEvent[]>([]);
  const [posters, setPosters] = useState<EventPoster[]>([]);
  const [values, setValues] = useState<CoreValue[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [evRes, posRes, valRes, tesRes, assRes] = await Promise.all([
      supabase.from('homepage_events').select('*').order('sort_order'),
      supabase.from('homepage_posters').select('*').order('sort_order'),
      supabase.from('homepage_values').select('*').order('sort_order'),
      supabase.from('homepage_testimonials').select('*').order('sort_order'),
      supabase.from('homepage_associations').select('*').order('sort_order'),
    ]);
    if (evRes.error || posRes.error || valRes.error || tesRes.error || assRes.error) {
      setError('Some tables not found. Run the SQL script for homepage manager tables.');
    } else {
      setEvents(evRes.data || []); setPosters(posRes.data || []);
      setValues(valRes.data || []); setTestimonials(tesRes.data || []);
      setAssociations(assRes.data || []); setError(null);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Generic CRUD helpers ─── */
  const tableName = (tab: ActiveTab) => {
    const map: Record<ActiveTab, string> = { events: 'homepage_events', posters: 'homepage_posters', values: 'homepage_values', testimonials: 'homepage_testimonials', associations: 'homepage_associations' };
    return map[tab];
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const table = tableName(activeTab);
    if (editingId) await supabase.from(table).update(formData).eq('id', editingId);
    else await supabase.from(table).insert([formData]);
    setShowModal(false); setEditingId(null); fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return;
    await supabase.from(tableName(activeTab)).delete().eq('id', id);
    fetchData();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openCreate(defaults: any) { setFormData(defaults); setEditingId(null); setShowModal(true); }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openEdit(id: string, data: any) { setFormData(data); setEditingId(id); setShowModal(true); }

  /* ── Tab configs ─── */
  const tabs: { key: ActiveTab; label: string; icon: string }[] = [
    { key: 'events', label: 'Events List', icon: '📅' },
    { key: 'posters', label: 'Event Posters', icon: '🖼️' },
    { key: 'values', label: 'Core Values', icon: '💎' },
    { key: 'testimonials', label: 'Testimonials', icon: '💬' },
    { key: 'associations', label: 'Associations', icon: '🏅' },
  ];

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .tab-bar { display: flex; gap: 4px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; padding: 4px; margin-bottom: 24px; overflow-x: auto; }
        .tab { padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.4); cursor: pointer; transition: all 0.15s; border: none; background: none; white-space: nowrap; }
        .tab.active { background: #ffffff; color: #c4a459; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .tab:hover { color: rgba(0,0,0,0.6); }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; }
        .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        table { width: 100%; border-collapse: collapse; }
        th { padding: 14px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: rgba(0,0,0,0.4); border-bottom: 2px solid #f8fafc; text-align: left; background: #fcfdfe; }
        td { padding: 14px 20px; font-size: 14px; color: #1a2e1d; border-bottom: 1px solid rgba(0,0,0,0.04); }
        tr:last-child td { border-bottom: none; }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0.4; transition: opacity 0.2s; }
        .btn-icon:hover { opacity: 1; }
        .btn-icon.del:hover { color: #ef4444; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 50px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: rgba(196,164,89,0.08); color: #c4a459; }
        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .form-modal { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 36px; width: 100%; max-width: 560px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .form-modal h3 { font-size: 20px; font-weight: 800; color: #1a2e1d; margin-bottom: 28px; }
        .fg { margin-bottom: 16px; }
        .fg label { display: block; font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .fg input, .fg select, .fg textarea { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #1a2e1d; font-size: 14px; outline: none; }
        .fg input:focus, .fg select:focus, .fg textarea:focus { border-color: #c4a459; background: #fff; }
        .form-actions { display: flex; gap: 12px; margin-top: 24px; }
        .btn-cancel { padding: 10px 20px; background: #f1f5f9; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; color: rgba(0,0,0,0.5); cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-save { padding: 10px 20px; background: #c4a459; border: none; border-radius: 10px; color: #0c1a0f; cursor: pointer; font-weight: 700; font-size: 13px; flex: 1; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .empty-state { padding: 50px; text-align: center; color: rgba(0,0,0,0.3); }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
        .info-banner { background: rgba(59,130,246,0.04); border: 1px solid rgba(59,130,246,0.1); border-radius: 12px; padding: 14px 20px; margin-bottom: 20px; color: #1e40af; font-size: 12px; line-height: 1.6; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Homepage Manager</h2>
        <button className="btn-primary" onClick={() => {
          const defaults: Record<ActiveTab, object> = {
            events: { date_label: '', day_label: '', title: '', type: 'Academic', location: '', sort_order: 0 },
            posters: { title: '', image_url: '', link_url: '', sort_order: 0 },
            values: { name: '', description: '', sub_values: '', icon: '❤️', sort_order: 0 },
            testimonials: { quote: '', name: '', role: '', initials: '', sort_order: 0 },
            associations: { name: '', full_name: '', image_url: '', sort_order: 0 },
          };
          openCreate(defaults[activeTab]);
        }}>+ Add Item</button>
      </div>

      <div className="info-banner">
        💡 <strong>Homepage Manager</strong> — Edit the content that appears on the public homepage. Changes here update the events list, poster slider, core values, testimonials, and association logos.
      </div>

      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Tables not found</p><p style={{ fontSize: 13, marginTop: 8 }}>Run the homepage manager SQL script in Supabase.</p></div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : (
        <div className="card">
          {/* ── Events Tab ─── */}
          {activeTab === 'events' && (events.length === 0 ? <div className="empty-state">No events. Add one above.</div> : (
            <table><thead><tr><th>#</th><th>Date</th><th>Day</th><th>Title</th><th>Type</th><th>Location</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>{events.map(e => (
              <tr key={e.id}><td>{e.sort_order}</td><td>{e.date_label}</td><td>{e.day_label}</td>
                <td style={{ fontWeight: 600, color: '#fff' }}>{e.title}</td>
                <td><span className="badge">{e.type}</span></td><td>{e.location}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => openEdit(e.id, { date_label: e.date_label, day_label: e.day_label, title: e.title, type: e.type, location: e.location, sort_order: e.sort_order })}>✏️</button>
                  <button className="btn-icon del" onClick={() => handleDelete(e.id)} style={{ marginLeft: 8 }}>🗑️</button>
                </td></tr>
            ))}</tbody></table>
          ))}

          {/* ── Posters Tab ─── */}
          {activeTab === 'posters' && (posters.length === 0 ? <div className="empty-state">No posters. Add one above.</div> : (
            <table><thead><tr><th>#</th><th>Title</th><th>Image</th><th>Link</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>{posters.map(p => (
              <tr key={p.id}><td>{p.sort_order}</td>
                <td style={{ fontWeight: 600, color: '#fff' }}>{p.title}</td>
                <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.image_url}</td>
                <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{p.link_url || '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => openEdit(p.id, { title: p.title, image_url: p.image_url, link_url: p.link_url, sort_order: p.sort_order })}>✏️</button>
                  <button className="btn-icon del" onClick={() => handleDelete(p.id)} style={{ marginLeft: 8 }}>🗑️</button>
                </td></tr>
            ))}</tbody></table>
          ))}

          {/* ── Values Tab ─── */}
          {activeTab === 'values' && (values.length === 0 ? <div className="empty-state">No values. Add one above.</div> : (
            <table><thead><tr><th>#</th><th>Icon</th><th>Value</th><th>Description</th><th>Sub-values</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>{values.map(v => (
              <tr key={v.id}><td>{v.sort_order}</td><td>{v.icon}</td>
                <td style={{ fontWeight: 600, color: '#fff' }}>{v.name}</td>
                <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.description}</td>
                <td style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{v.sub_values}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => openEdit(v.id, { name: v.name, description: v.description, sub_values: v.sub_values, icon: v.icon, sort_order: v.sort_order })}>✏️</button>
                  <button className="btn-icon del" onClick={() => handleDelete(v.id)} style={{ marginLeft: 8 }}>🗑️</button>
                </td></tr>
            ))}</tbody></table>
          ))}

          {/* ── Testimonials Tab ─── */}
          {activeTab === 'testimonials' && (testimonials.length === 0 ? <div className="empty-state">No testimonials. Add one above.</div> : (
            <table><thead><tr><th>#</th><th>Name</th><th>Role</th><th>Quote</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>{testimonials.map(t => (
              <tr key={t.id}><td>{t.sort_order}</td>
                <td style={{ fontWeight: 600, color: '#fff' }}>{t.name}</td>
                <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.role}</td>
                <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>&ldquo;{t.quote}&rdquo;</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => openEdit(t.id, { quote: t.quote, name: t.name, role: t.role, initials: t.initials, sort_order: t.sort_order })}>✏️</button>
                  <button className="btn-icon del" onClick={() => handleDelete(t.id)} style={{ marginLeft: 8 }}>🗑️</button>
                </td></tr>
            ))}</tbody></table>
          ))}

          {/* ── Associations Tab ─── */}
          {activeTab === 'associations' && (associations.length === 0 ? <div className="empty-state">No associations. Add one above.</div> : (
            <table><thead><tr><th>#</th><th>Name</th><th>Full Name</th><th>Logo</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>{associations.map(a => (
              <tr key={a.id}><td>{a.sort_order}</td>
                <td style={{ fontWeight: 600, color: '#fff' }}>{a.name}</td>
                <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{a.full_name}</td>
                <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.image_url}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => openEdit(a.id, { name: a.name, full_name: a.full_name, image_url: a.image_url, sort_order: a.sort_order })}>✏️</button>
                  <button className="btn-icon del" onClick={() => handleDelete(a.id)} style={{ marginLeft: 8 }}>🗑️</button>
                </td></tr>
            ))}</tbody></table>
          ))}
        </div>
      )}

      {/* ── Modal Form ─── */}
      {showModal && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit' : 'Add'} {tabs.find(t => t.key === activeTab)?.label.replace(/s$/, '')}</h3>
            <form onSubmit={handleSave}>
              {activeTab === 'events' && <>
                <div className="fg"><label>Title</label><input required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                <div className="grid-2">
                  <div className="fg"><label>Date Label</label><input value={formData.date_label || ''} onChange={e => setFormData({ ...formData, date_label: e.target.value })} placeholder="e.g. 14 Mar" /></div>
                  <div className="fg"><label>Day Label</label><input value={formData.day_label || ''} onChange={e => setFormData({ ...formData, day_label: e.target.value })} placeholder="e.g. FRI" /></div>
                </div>
                <div className="grid-2">
                  <div className="fg"><label>Type</label>
                    <select value={formData.type || 'Academic'} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                      <option>Academic</option><option>Sports</option><option>Culture</option><option>Community</option>
                    </select>
                  </div>
                  <div className="fg"><label>Sort Order</label><input type="number" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div className="fg"><label>Location</label><input value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
              </>}
              {activeTab === 'posters' && <>
                <div className="fg"><label>Title</label><input required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                <div className="fg"><label>Image URL</label><input required value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} /></div>
                <div className="grid-2">
                  <div className="fg"><label>Link URL</label><input value={formData.link_url || ''} onChange={e => setFormData({ ...formData, link_url: e.target.value })} /></div>
                  <div className="fg"><label>Sort Order</label><input type="number" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} /></div>
                </div>
              </>}
              {activeTab === 'values' && <>
                <div className="grid-2">
                  <div className="fg"><label>Value Name</label><input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Love" /></div>
                  <div className="fg"><label>Icon Emoji</label><input value={formData.icon || ''} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="e.g. ❤️" /></div>
                </div>
                <div className="fg"><label>Description</label><textarea rows={2} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                <div className="fg"><label>Sub-values (comma separated)</label><input value={formData.sub_values || ''} onChange={e => setFormData({ ...formData, sub_values: e.target.value })} placeholder="Self-worth, Motivation, Humour" /></div>
                <div className="fg"><label>Sort Order</label><input type="number" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </>}
              {activeTab === 'testimonials' && <>
                <div className="fg"><label>Quote</label><textarea rows={3} required value={formData.quote || ''} onChange={e => setFormData({ ...formData, quote: e.target.value })} /></div>
                <div className="grid-2">
                  <div className="fg"><label>Name</label><input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="fg"><label>Initials</label><input value={formData.initials || ''} onChange={e => setFormData({ ...formData, initials: e.target.value })} placeholder="e.g. SF" /></div>
                </div>
                <div className="grid-2">
                  <div className="fg"><label>Role</label><input value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Parent — Grade 4" /></div>
                  <div className="fg"><label>Sort Order</label><input type="number" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} /></div>
                </div>
              </>}
              {activeTab === 'associations' && <>
                <div className="grid-2">
                  <div className="fg"><label>Short Name</label><input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. ISASA" /></div>
                  <div className="fg"><label>Full Name</label><input value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} /></div>
                </div>
                <div className="fg"><label>Logo Image URL</label><input value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} /></div>
                <div className="fg"><label>Sort Order</label><input type="number" value={formData.sort_order || 0} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} /></div>
              </>}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
