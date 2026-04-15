'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2, CalendarDays, MapPin } from 'lucide-react';

interface CalendarEntry {
  id: string;
  date: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

const EVENT_TYPES = ['Academic', 'Sports', 'Culture', 'Community', 'Holiday'];

const TYPE_COLOURS: Record<string, string> = {
  Academic:  { dot: '#164e24', badge: '#e6f0e7', text: '#164e24' } as any,
  Sports:    { dot: '#c4a459', badge: '#fdf6e3', text: '#92751f' } as any,
  Culture:   { dot: '#e11d48', badge: '#fde8ec', text: '#be123c' } as any,
  Community: { dot: '#7c3aed', badge: '#ede9fe', text: '#5b21b6' } as any,
  Holiday:   { dot: '#0891b2', badge: '#e0f2fe', text: '#0e7490' } as any,
};

function getDotColour(type: string): string {
  return (TYPE_COLOURS[type] as any)?.dot ?? '#164e24';
}
function getBadgeBg(type: string): string {
  return (TYPE_COLOURS[type] as any)?.badge ?? '#e6f0e7';
}
function getBadgeText(type: string): string {
  return (TYPE_COLOURS[type] as any)?.text ?? '#164e24';
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  // Monday = 0 … Sunday = 6
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function CalendarAdminPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected day panel
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', location: '', type: 'Academic', description: '',
  });

  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const startDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
    const endDay = getDaysInMonth(viewYear, viewMonth);
    const endDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('calendar_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) setError(error.message);
    else { setEntries(data || []); setError(null); }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewYear, viewMonth]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  }

  function openDay(dateKey: string) {
    setSelectedDate(dateKey);
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', location: '', type: 'Academic', description: '' });
  }

  function startAdd() {
    setEditingId(null);
    setFormData({ title: '', location: '', type: 'Academic', description: '' });
    setShowForm(true);
  }

  function startEdit(entry: CalendarEntry) {
    setEditingId(entry.id);
    setFormData({ title: entry.title, location: entry.location || '', type: entry.type || 'Academic', description: entry.description || '' });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) return;
    setSaving(true);
    const payload = { ...formData, date: selectedDate };
    if (editingId) {
      await supabase.from('calendar_entries').update(payload).eq('id', editingId);
    } else {
      await supabase.from('calendar_entries').insert([payload]);
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', location: '', type: 'Academic', description: '' });
    fetchEntries();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return;
    await supabase.from('calendar_entries').delete().eq('id', id);
    fetchEntries();
  }

  // Build a map: dateKey → entries[]
  const entryMap: Record<string, CalendarEntry[]> = {};
  entries.forEach(e => {
    if (!entryMap[e.date]) entryMap[e.date] = [];
    entryMap[e.date].push(e);
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfWeek(viewYear, viewMonth);
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedEntries = selectedDate ? (entryMap[selectedDate] || []) : [];

  // Parse selected date label
  let selectedLabel = '';
  if (selectedDate) {
    const d = new Date(selectedDate + 'T00:00:00');
    selectedLabel = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a2e1d', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CalendarDays size={24} color="#c4a459" />
          School Calendar
        </h2>
      </div>

      {error && (
        <div style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, color: '#ef4444', marginBottom: 24 }}>
          <strong>Error:</strong> {error}. Make sure the <code>calendar_entries</code> table exists in Supabase.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 360px' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Calendar Grid ── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

          {/* Month Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: '#164e24' }}>
            <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.01em' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            {DAYS_OF_WEEK.map(d => (
              <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.3)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'rgba(0,0,0,0.25)', fontSize: 14 }}>Loading calendar…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {/* Empty offset cells */}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: 90, borderRight: '1px solid rgba(0,0,0,0.04)', borderBottom: '1px solid rgba(0,0,0,0.04)', background: '#fafafa' }} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = formatDateKey(viewYear, viewMonth, day);
                const dayEntries = entryMap[dateKey] || [];
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDate;
                const col = (firstDayOffset + i) % 7;
                const isWeekend = col === 5 || col === 6;

                return (
                  <div
                    key={day}
                    onClick={() => openDay(dateKey)}
                    style={{
                      minHeight: 90,
                      padding: '10px 10px 8px',
                      borderRight: '1px solid rgba(0,0,0,0.04)',
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      background: isSelected ? '#e8f0e9' : isToday ? '#f6f9f0' : isWeekend ? '#fafafa' : '#fff',
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#f0f7f1'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isSelected ? '#e8f0e9' : isToday ? '#f6f9f0' : isWeekend ? '#fafafa' : '#fff'; }}
                  >
                    {/* Day number */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isToday ? '#164e24' : 'transparent',
                      color: isToday ? '#fff' : 'rgba(0,0,0,0.6)',
                      fontWeight: isToday ? 800 : 500,
                      fontSize: 13,
                      marginBottom: 6,
                    }}>
                      {day}
                    </div>

                    {/* Entry dots / labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dayEntries.slice(0, 3).map(entry => (
                        <div key={entry.id} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 10, fontWeight: 600, color: getBadgeText(entry.type),
                          background: getBadgeBg(entry.type),
                          borderRadius: 4, padding: '1px 5px',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: getDotColour(entry.type), flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</span>
                        </div>
                      ))}
                      {dayEntries.length > 3 && (
                        <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.35)', fontWeight: 600, paddingLeft: 2 }}>
                          +{dayEntries.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Day Panel ── */}
        {selectedDate && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', overflow: 'hidden', position: 'sticky', top: 24 }}>

            {/* Panel Header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', background: '#164e24' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Selected Day</p>
                <p style={{ fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1.3 }}>{selectedLabel}</p>
              </div>
              <button onClick={() => setSelectedDate(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <X size={14} />
              </button>
            </div>

            {/* Entries List */}
            <div style={{ padding: '16px 20px', maxHeight: 380, overflowY: 'auto' }}>
              {selectedEntries.length === 0 ? (
                <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.3)', textAlign: 'center', padding: '24px 0' }}>No entries for this day.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedEntries.map(entry => (
                    <div key={entry.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 50, background: getBadgeBg(entry.type), color: getBadgeText(entry.type) }}>
                              {entry.type}
                            </span>
                          </div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: '#1a2e1d', marginBottom: 2 }}>{entry.title}</p>
                          {entry.location && (
                            <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <MapPin size={10} color="#c4a459" /> {entry.location}
                            </p>
                          )}
                          {entry.description && (
                            <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', marginTop: 4 }}>{entry.description}</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button onClick={() => startEdit(entry)} title="Edit"
                            style={{ background: 'rgba(22,78,36,0.07)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#164e24' }}>
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDelete(entry.id)} title="Delete"
                            style={{ background: 'rgba(239,68,68,0.07)', border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Button or Form */}
            <div style={{ padding: '0 20px 20px' }}>
              {!showForm ? (
                <button onClick={startAdd}
                  style={{ width: '100%', padding: '11px', background: '#c4a459', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#0c1a0f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#d4b469')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#c4a459')}>
                  <Plus size={16} /> Add Entry
                </button>
              ) : (
                <form onSubmit={handleSave} style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 16 }}>
                  <p style={{ fontWeight: 800, fontSize: 13, color: '#1a2e1d', marginBottom: 14 }}>{editingId ? 'Edit Entry' : 'New Entry'}</p>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Title *</label>
                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, color: '#1a2e1d', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Type</label>
                      <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, color: '#1a2e1d', background: '#f8fafc', outline: 'none' }}>
                        {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Location</label>
                      <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, color: '#1a2e1d', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Description</label>
                    <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid rgba(0,0,0,0.1)', fontSize: 13, color: '#1a2e1d', background: '#f8fafc', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                      style={{ padding: '9px 14px', background: '#f1f5f9', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 9, fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      style={{ flex: 1, padding: '9px', background: '#164e24', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                      {saving ? 'Saving…' : editingId ? 'Update' : 'Add Entry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
