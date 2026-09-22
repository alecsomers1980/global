'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import { Sparkles, Plus, Trash2, Image as ImageIcon, Star, Loader2, X, Ticket, Calendar, Phone } from 'lucide-react';

interface TicketOption {
  type: string;
  price: string;
  priceLabel: string;
  dates: string;
  includes: string[];
  highlight: boolean;
  badge?: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    category: 'Culture',
    status: 'published',
    is_featured: false,
    event_date: '',
    display_start_date: '',
    display_end_date: '',
    base_cost: 0,
    schedules: [] as { date: string; time: string; cost?: number }[],
    images: [] as { url: string; is_primary: boolean }[],
    ticket_options: [] as TicketOption[],
    slug: '',
    booking_info: { type: 'phone', value: '+27137900000' } as { type: 'phone' | 'email' | 'url'; value: string },
  });

  async function handleRewrite() {
    if (!formData.description) return;
    setRewriting(true);
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        body: JSON.stringify({ text: formData.description, context: formData.title }),
      });
      const data = await res.json();
      if (data.rewrittenText) {
        setFormData({ ...formData, description: data.rewrittenText });
      }
    } catch (err) {
      console.error('Rewrite failed:', err);
    } finally {
      setRewriting(false);
    }
  }

  function addSchedule() {
    setFormData({
      ...formData,
      schedules: [...formData.schedules, { date: '', time: '', cost: undefined }]
    });
  }

  function updateSchedule(index: number, field: string, value: any) {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setFormData({ ...formData, schedules: newSchedules });
  }

  function removeSchedule(index: number) {
    setFormData({
      ...formData,
      schedules: formData.schedules.filter((_, i) => i !== index)
    });
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' }));
            else resolve(file);
          }, 'image/jpeg', 0.85);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setUploading(true);
    try {
      const file = await compressImage(originalFile);
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      
      if (data.publicUrl) {
        const isFirst = formData.images.length === 0;
        setFormData({
          ...formData,
          images: [...formData.images, { url: data.publicUrl, is_primary: isFirst }]
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  function setPrimaryImage(index: number) {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setFormData({ ...formData, images: newImages });
  }

  async function removeImage(index: number) {
    const imgToRemove = formData.images[index];
    if (imgToRemove && imgToRemove.url.includes('/images/')) {
      await fetch('/api/delete-image', { 
        method: 'POST', 
        body: JSON.stringify({ imageUrl: imgToRemove.url }) 
      });
    }
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  }

  function addTicketOption() {
    const newOption: TicketOption = {
      type: '',
      price: '',
      priceLabel: 'per person',
      dates: '',
      includes: [''],
      highlight: false
    };
    setFormData({ ...formData, ticket_options: [...formData.ticket_options, newOption] });
  }

  function removeTicketOption(index: number) {
    setFormData({
      ...formData,
      ticket_options: formData.ticket_options.filter((_, i) => i !== index)
    });
  }

  function updateTicketOption(index: number, updates: Partial<TicketOption>) {
    const newOptions = [...formData.ticket_options];
    newOptions[index] = { ...newOptions[index], ...updates };
    setFormData({ ...formData, ticket_options: newOptions });
  }

  function addInclusion(optionIndex: number) {
    const newOptions = [...formData.ticket_options];
    newOptions[optionIndex].includes.push('');
    setFormData({ ...formData, ticket_options: newOptions });
  }

  function removeInclusion(optionIndex: number, inclusionIndex: number) {
    const newOptions = [...formData.ticket_options];
    newOptions[optionIndex].includes = newOptions[optionIndex].includes.filter((_, i) => i !== inclusionIndex);
    setFormData({ ...formData, ticket_options: newOptions });
  }

  function updateInclusion(optionIndex: number, inclusionIndex: number, value: string) {
    const newOptions = [...formData.ticket_options];
    newOptions[optionIndex].includes[inclusionIndex] = value;
    setFormData({ ...formData, ticket_options: newOptions });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('events')
      .insert([formData]);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin/events');
    }
  }

  return (
    <div className="admin-page">
      <style>{`
        .form-container {
          max-width: 900px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 4px 30px rgba(0,0,0,0.03);
        }

        .form-section {
          margin-bottom: 40px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .form-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #c4a459;
          margin: 0;
        }

        .form-group { margin-bottom: 24px; position: relative; }
        
        label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: rgba(16, 44, 21, 0.4);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        input, select, textarea {
          width: 100%;
          padding: 14px 18px;
          background: #fcfcfc;
          border: 1px solid rgba(16, 44, 21, 0.08);
          border-radius: 12px;
          color: #102c15;
          font-size: 15px;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input:focus, select:focus, textarea:focus {
          border-color: #c4a459;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(196,164,89,0.08);
        }

        .ai-rewrite-btn {
          position: absolute;
          right: 12px;
          top: 36px;
          background: #102c15;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(16,44,21,0.2);
          z-index: 10;
        }

        .ai-rewrite-btn:hover:not(:disabled) { transform: translateY(-1px); background: #1a4521; }
        .ai-rewrite-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .schedule-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 120px 50px;
          gap: 16px;
          margin-bottom: 12px;
          align-items: flex-end;
        }

        .image-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .image-card {
          position: relative;
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.3s;
          cursor: pointer;
        }

        .image-card.is-primary { border-color: #c4a459; box-shadow: 0 0 0 4px rgba(196,164,89,0.1); }
        
        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 10px;
          opacity: 0;
          transition: 0.2s;
        }

        .image-card:hover .image-overlay { opacity: 1; }

        .image-btn {
          background: white;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #102c15;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .primary-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #c4a459;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .upload-placeholder {
          aspect-ratio: 1;
          border: 2px dashed rgba(16, 44, 21, 0.1);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.2s;
          color: rgba(16, 44, 21, 0.4);
        }

        .upload-placeholder:hover { background: #fcfcfc; border-color: #c4a459; color: #c4a459; }

        .btn-add {
          background: rgba(196,164,89,0.1);
          color: #c4a459;
          border: 1px solid rgba(196,164,89,0.2);
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add:hover { background: rgba(196,164,89,0.15); transform: translateY(-1px); }

        .actions { display: flex; gap: 20px; margin-top: 50px; }
        
        .btn-main {
          padding: 16px 32px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          text-align: center;
          flex: 1;
        }

        .btn-save { background: #c4a459; color: #102c15; }
        .btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(196,164,89,0.25); }
        .btn-cancel { background: #f8f9fa; color: rgba(16, 44, 21, 0.4); border: 1px solid rgba(16, 44, 21, 0.05); text-decoration: none; }
        .btn-cancel:hover { background: #f1f3f5; color: #102c15; }
      `}</style>

      <div className="flex justify-between items-center mb-10">
        <div>
          <Link href="/admin/events" className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 hover:text-brand-gold transition-colors block mb-2">
            ← Event Dashboard
          </Link>
          <h2 className="text-4xl font-black text-brand-green">New Event</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-8 flex items-center gap-2">⚠️ {error}</div>}

        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title">Essential Details</h3>
          </div>
          <div className="form-group">
            <label>Event Title</label>
             <input
              required
              value={formData.title}
              onChange={e => {
                const title = e.target.value;
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                setFormData({...formData, title, slug});
              }}
              placeholder="Give your event a memorable name..."
            />
          </div>
          <div className="form-group">
            <label>URL Slug (Auto-generated)</label>
            <input
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              placeholder="event-url-slug"
            />
          </div>
          <div className="form-group">
            <label>Actual Event Date</label>
            <input
              type="date"
              required
              value={formData.event_date}
              onChange={e => setFormData({...formData, event_date: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <button 
              type="button" 
              className="ai-rewrite-btn"
              onClick={handleRewrite}
              disabled={rewriting || !formData.description}
            >
              {rewriting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Magic Rewrite
            </button>
            <textarea
              rows={6}
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="What makes this event special?"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title">Event Images</h3>
            <span className="text-[10px] text-black/30 font-bold uppercase tracking-wider">Poster & Gallery</span>
          </div>
          <div className="image-gallery">
            {formData.images.map((img, i) => (
              <div key={i} className={`image-card ${img.is_primary ? 'is-primary' : ''}`} onClick={() => setPrimaryImage(i)}>
                <img src={img.url} className="w-full h-full object-cover" alt="Event" />
                {img.is_primary && <div className="primary-badge"><Star className="w-2.5 h-2.5 fill-current" /> Primary</div>}
                <div className="image-overlay">
                  <button type="button" className="image-btn" onClick={(e) => { e.stopPropagation(); removeImage(i); }} style={{ position: 'absolute', top: 10, right: 10 }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-white text-[9px] font-black uppercase tracking-widest">{img.is_primary ? 'Hero Poster' : 'Gallery Image'}</p>
                </div>
              </div>
            ))}
            <label className="upload-placeholder">
              <input type="file" hidden onChange={handleImageUpload} disabled={uploading} />
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
              <span className="text-[10px] font-black uppercase tracking-widest">Add Image</span>
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title">Schedule & Venue</h3>
            <button type="button" className="btn-add" onClick={addSchedule}>
              <Plus className="w-4 h-4" /> Add Slot
            </button>
          </div>
          
          <div className="form-group">
            <label>Standard Venue</label>
            <input 
              value={formData.venue} 
              onChange={e => setFormData({...formData, venue: e.target.value})} 
              placeholder="e.g. School Main Hall"
            />
          </div>

          {formData.schedules.length > 0 ? (
            <div className="space-y-4">
              <label>Event Occurrences</label>
              {formData.schedules.map((slot, i) => (
                <div key={i} className="schedule-grid">
                  <div>
                    <input type="date" required value={slot.date} onChange={e => updateSchedule(i, 'date', e.target.value)} />
                  </div>
                  <div>
                    <input type="text" value={slot.time} onChange={e => updateSchedule(i, 'time', e.target.value)} placeholder="e.g. 18:00 - 20:00" />
                  </div>
                  <div>
                    <input type="number" value={slot.cost || ''} onChange={e => updateSchedule(i, 'cost', parseFloat(e.target.value))} placeholder="Cost (R)" />
                  </div>
                  <button type="button" className="image-btn" style={{ background: '#fff5f5', color: '#ff6b6b' }} onClick={() => removeSchedule(i)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-black/20 italic">No specific dates added yet. Click &quot;Add Slot&quot; to define when the event happens.</p>
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Ticket className="w-4 h-4" /> Ticketing Options
            </h3>
            <button type="button" className="btn-add" onClick={addTicketOption}>
              <Plus className="w-4 h-4" /> Add Tier
            </button>
          </div>

          {formData.ticket_options.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed rgba(0,0,0,0.1)' }}>
              <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13, fontWeight: 600 }}>No ticket options yet. Click &quot;Add Tier&quot; to create blocks like Dinner Theatre.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.ticket_options.map((opt, optIndex) => (
                <div key={optIndex} style={{ padding: 24, background: '#fcfdfe', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, position: 'relative' }}>
                  <button 
                    type="button" 
                    onClick={() => removeTicketOption(optIndex)}
                    style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', opacity: 0.3, cursor: 'pointer' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="form-group mb-0">
                      <label>Ticket Type</label>
                      <input 
                        value={opt.type} 
                        onChange={e => updateTicketOption(optIndex, { type: e.target.value })} 
                        placeholder="e.g. Dinner Theatre"
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label>Price</label>
                      <input 
                        value={opt.price} 
                        onChange={e => updateTicketOption(optIndex, { price: e.target.value })} 
                        placeholder="e.g. R280"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="form-group mb-0">
                      <label>Price Label</label>
                      <input 
                        value={opt.priceLabel} 
                        onChange={e => updateTicketOption(optIndex, { priceLabel: e.target.value })} 
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label>Relevant Dates</label>
                      <input 
                        value={opt.dates} 
                        onChange={e => updateTicketOption(optIndex, { dates: e.target.value })} 
                        placeholder="e.g. 24 & 25 March"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="form-group mb-0">
                      <label>Badge (Optional)</label>
                      <input 
                        value={opt.badge || ''} 
                        onChange={e => updateTicketOption(optIndex, { badge: e.target.value })} 
                        placeholder="Popular"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                        <input 
                          type="checkbox" 
                          style={{ width: 18, height: 18 }}
                          checked={opt.highlight} 
                          onChange={e => updateTicketOption(optIndex, { highlight: e.target.checked })} 
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#102c15' }}>Highlight / Popular (Dark UI)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <label style={{ margin: 0 }}>Inclusions (Key Features)</label>
                      <button type="button" onClick={() => addInclusion(optIndex)} style={{ fontSize: 11, color: '#c4a459', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
                        + Add Feature
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {opt.includes.map((inc, incIndex) => (
                        <div key={incIndex} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.06)', padding: '6px 12px', borderRadius: 10 }}>
                          <input 
                            value={inc} 
                            onChange={e => updateInclusion(optIndex, incIndex, e.target.value)}
                            style={{ border: 'none', background: 'none', padding: 0, fontSize: 13, height: 'auto' }}
                            placeholder="e.g. Sit-down meal"
                          />
                          <button type="button" onClick={() => removeInclusion(optIndex, incIndex)} style={{ border: 'none', background: 'none', opacity: 0.3, cursor: 'pointer', padding: 0 }}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title">Extra Settings</h3>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Sports">Sports</option>
                <option value="Academic">Academic</option>
                <option value="Culture">Culture</option>
                <option value="Community">Community</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 p-6 rounded-2xl bg-brand-cream/30 border border-brand-green/5 mb-6">
            <input
              type="checkbox"
              style={{ width: 20, height: 20, cursor: 'pointer' }}
              checked={formData.is_featured}
              onChange={e => setFormData({...formData, is_featured: e.target.checked})}
            />
            <span className="text-sm font-bold text-brand-green">Show in Homepage Featured Slider</span>
          </div>

          {formData.is_featured && (
            <div className="grid-2 mt-4 p-6 rounded-2xl bg-brand-cream/10 border border-brand-green/5">
              <div className="form-group mb-0 relative z-10" style={{ zIndex: 10 }}>
                <label>Display Start Date (Slider)</label>
                <input
                  type="date"
                  required={formData.is_featured}
                  value={formData.display_start_date}
                  onChange={e => setFormData({...formData, display_start_date: e.target.value})}
                />
              </div>
              <div className="form-group mb-0 relative z-10" style={{ zIndex: 10 }}>
                <label>Display End Date (Slider)</label>
                <input
                  type="date"
                  required={formData.is_featured}
                  value={formData.display_end_date}
                  onChange={e => setFormData({...formData, display_end_date: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        {/* Booking Options */}
        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone className="w-4 h-4" /> Booking Configuration
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-cream/30 p-6 rounded-2xl border border-brand-green/5">
            <div className="form-group mb-0">
              <label>Booking Method</label>
              <select 
                className="w-full"
                value={formData.booking_info.type}
                onChange={(e) => setFormData({
                  ...formData, 
                  booking_info: { ...formData.booking_info, type: e.target.value as any }
                })}
              >
                <option value="phone">Phone Call</option>
                <option value="email">Email Enquiry</option>
                <option value="url">External Website (URL)</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label>
                {formData.booking_info.type === 'phone' ? 'Phone Number' : 
                 formData.booking_info.type === 'email' ? 'Email Address' : 'Booking URL'}
              </label>
              <input
                type="text"
                value={formData.booking_info.value}
                onChange={(e) => setFormData({
                  ...formData, 
                  booking_info: { ...formData.booking_info, value: e.target.value }
                })}
                placeholder={formData.booking_info.type === 'phone' ? '+27...' : 
                             formData.booking_info.type === 'email' ? 'enquiries@...' : 'https://...'}
              />
            </div>
          </div>
        </div>

        <div className="actions">
          <Link href="/admin/events" className="btn-main btn-cancel">Discard Changes</Link>
          <button type="submit" className="btn-main btn-save" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Publish Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
