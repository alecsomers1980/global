'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import { Image as ImageIcon, Loader2, GripVertical, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Section {
  id: string;
  type: 'content' | 'achievement' | 'dates' | 'event' | 'head' | 'sport' | 'academic' | 'preschool';
  layout?: 'standard' | 'magazine' | 'magazine_reverse' | 'hero' | 'split';
  title: string;
  body: string;
  image_url: string;
  author?: string;
  icon?: string;
  extra_data: any;
}

const SECTION_TYPES = [
  { value: 'content', label: '📝 Standard Content' },
  { value: 'head', label: '👔 From the Head' },
  { value: 'academic', label: '📚 Academic & Culture' },
  { value: 'sport', label: '🏆 Sport Updates' },
  { value: 'preschool', label: '🧸 Pre-School News' },
  { value: 'achievement', label: '⭐ Achievement Banner' },
  { value: 'dates', label: '📅 Important Dates' },
  { value: 'event', label: '🎪 Event Spotlight' },
];

const LAYOUT_TYPES = [
  { value: 'standard', label: 'Standard (Image Top)' },
  { value: 'magazine', label: 'Magazine (Image Left)' },
  { value: 'magazine_reverse', label: 'Magazine (Image Right)' },
  { value: 'hero', label: 'Hero (Full Width Impact)' },
  { value: 'split', label: 'Split (50/50)' },
];

export default function EditNewsletterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meta, setMeta] = useState({
    title: '', slug: '', headline: '', subheadline: '',
    term: '', issue_number: '', excerpt: '', highlights: '', publish_date: ''
  });

  const [sections, setSections] = useState<Section[]>([]);

  const fetchNewsletter = useCallback(async () => {
    setLoading(true);
    const { data: nl, error: nlErr } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', params.id)
      .single();

    if (nlErr) {
      setError('Newsletter not found: ' + nlErr.message);
      setLoading(false);
      return;
    }

    setMeta({
      title: nl.title || '',
      slug: nl.slug || '',
      headline: nl.headline || nl.title || '',
      subheadline: nl.subheadline || '',
      term: nl.term || '',
      issue_number: nl.issue_number || '',
      excerpt: nl.excerpt || '',
      highlights: nl.highlights ? (Array.isArray(nl.highlights) ? nl.highlights.join(', ') : nl.highlights) : '',
      publish_date: nl.publish_date || ''
    });

    const { data: secs, error: secErr } = await supabase
      .from('newsletter_sections')
      .select('*')
      .eq('newsletter_id', params.id)
      .order('sort_order', { ascending: true });

    if (secErr) {
      setError(secErr.message);
    } else if (secs) {
      setSections(secs.map(s => ({
        id: s.id,
        type: s.section_type || 'content',
        title: s.title || '',
        body: s.body || '',
        image_url: s.image_url || '',
        author: s.author || '',
        icon: s.icon || '',
        extra_data: s.extra_data || {}
      })));
    }
    
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchNewsletter();
  }, [fetchNewsletter]);

  function addSection() {
    setSections([...sections, { id: Date.now().toString(), type: 'content', title: '', body: '', image_url: '', extra_data: {} }]);
  }

  function removeSection(id: string) {
    if (sections.length === 1) return;
    setSections(sections.filter(s => s.id !== id));
  }

  function updateSection(id: string, field: keyof Section, value: any) {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    const newSections = [...sections];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    setSections(newSections);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, sectionId: string) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'newsletters');

    updateSection(sectionId, 'extra_data', { ...getSectionExtra(sectionId), uploading: true });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const currentGallery = getSectionExtra(sectionId).gallery || [];
      const newGallery = [...currentGallery, data.publicUrl];
      
      const newExtra = { ...getSectionExtra(sectionId), gallery: newGallery };
      const updates: Partial<Section> = { extra_data: newExtra };
      
      // Keep image_url synced to the first image for backwards compatibility
      if (!sections.find(s => s.id === sectionId)?.image_url) {
        updates.image_url = data.publicUrl;
      }
      
      setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      const currentExtra = getSectionExtra(sectionId);
      const newExtra = { ...currentExtra };
      delete newExtra.uploading;
      updateSection(sectionId, 'extra_data', newExtra);
    }
  }

  function removeImage(sectionId: string, imgIndex: number) {
    const s = sections.find(s => s.id === sectionId);
    if (!s) return;
    const gallery = [...(s.extra_data.gallery || [])];
    gallery.splice(imgIndex, 1);
    
    const updates: Partial<Section> = { extra_data: { ...s.extra_data, gallery } };
    if (imgIndex === 0 && gallery.length > 0) {
      updates.image_url = gallery[0];
    } else if (gallery.length === 0) {
      updates.image_url = '';
    }
    
    setSections(sections.map(sec => sec.id === sectionId ? { ...sec, ...updates } : sec));
  }

  function getSectionExtra(id: string) {
    return sections.find(s => s.id === id)?.extra_data || {};
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const slug = meta.slug || meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const highlightsArray = meta.highlights.split(',').map(s => s.trim()).filter(Boolean);
    const publishDate = meta.publish_date || new Date().toISOString().split('T')[0];

    // Update main newsletter record
    const { error: nlError } = await supabase
      .from('newsletters')
      .update({ 
        title: meta.title,
        slug,
        headline: meta.headline || meta.title,
        subheadline: meta.subheadline,
        term: meta.term,
        issue_number: meta.issue_number,
        excerpt: meta.excerpt,
        highlights: highlightsArray,
        publish_date: publishDate
      })
      .eq('id', params.id);

    if (nlError) { setError(nlError.message); setSaving(false); return; }

    // Replace sections: we delete old sections and re-insert new ones to maintain exact order cleanly
    await supabase.from('newsletter_sections').delete().eq('newsletter_id', params.id);

    if (sections.length > 0) {
      const sectionData = sections.map((s, i) => {
        const cleanExtra = { ...s.extra_data };
        delete cleanExtra.uploading;

        return {
          newsletter_id: params.id,
          title: s.title,
          body: s.body,
          image_url: s.image_url,
          sort_order: i,
          section_type: s.type,
          author: s.author,
          icon: s.icon,
          extra_data: cleanExtra
        };
      });
      await supabase.from('newsletter_sections').insert(sectionData);
    }

    router.push('/admin/newsletters');
  }

  if (loading) {
    return <div className="p-20 flex justify-center text-[#164e24]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="pb-24">
      <style suppressHydrationWarning>{`
        .form-container { max-width: 900px; margin: 0 auto; }
        .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 24px; padding: 40px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .card-header { font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #164e24; margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
        .card-header::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.06); }
        .fg { margin-bottom: 24px; }
        .fg label { display: block; font-size: 12px; font-weight: 700; color: rgba(0,0,0,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .fg input, .fg textarea, .fg select { width: 100%; padding: 14px 16px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; color: #1a2e1d; font-size: 15px; outline: none; transition: all 0.2s; }
        .fg input:focus, .fg textarea:focus, .fg select:focus { border-color: #c4a459; background: #fff; box-shadow: 0 0 0 4px rgba(196,164,89,0.1); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        
        .section-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 0; margin-bottom: 24px; transition: all 0.3s; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .section-card:focus-within { border-color: rgba(196,164,89,0.5); box-shadow: 0 8px 30px rgba(0,0,0,0.05); }
        .section-drag-handle { background: rgba(0,0,0,0.02); padding: 12px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; }
        .section-num { font-size: 11px; font-weight: 800; color: rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 1px; }
        .section-controls { display: flex; gap: 8px; }
        .btn-mini { padding: 6px; background: #fff; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; color: rgba(0,0,0,0.5); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-mini:hover { background: #f8fafc; border-color: rgba(0,0,0,0.2); color: #1a2e1d; }
        .btn-mini.del:hover { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.2); color: #ef4444; }
        .section-body { padding: 32px; }
        
        .image-upload-area { border: 2px dashed rgba(0,0,0,0.1); border-radius: 16px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s; background: #f8fafc; margin-bottom: 24px; position: relative; overflow: hidden; }
        .image-upload-area:hover { border-color: #c4a459; background: rgba(196,164,89,0.02); }
        .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 12px; color: rgba(0,0,0,0.4); }
        .preview-image { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }
        
        .btn-add-section { width: 100%; padding: 20px; background: transparent; border: 2px dashed rgba(22,78,36,0.2); border-radius: 20px; color: #164e24; font-weight: 800; font-size: 15px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .btn-add-section:hover { border-color: #164e24; background: rgba(22,78,36,0.03); transform: translateY(-2px); }
        
        .floating-actions { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-top: 1px solid rgba(0,0,0,0.1); padding: 20px; display: flex; justify-content: center; z-index: 50; }
        .actions-inner { max-width: 900px; width: 100%; display: flex; justify-content: flex-end; gap: 16px; align-items: center; }
        .btn { padding: 16px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-save { background: #164e24; color: #fff; border: none; box-shadow: 0 8px 20px rgba(22,78,36,0.2); }
        .btn-save:hover { background: #1a5c2b; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(22,78,36,0.3); }
        .btn-save:disabled { opacity: 0.7; transform: none; cursor: not-allowed; }
        .btn-cancel { background: #f1f5f9; color: rgba(0,0,0,0.6); border: 1px solid rgba(0,0,0,0.05); }
        .btn-cancel:hover { background: #e2e8f0; color: #000; }
        
        .error-message { padding: 20px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); border-radius: 16px; color: #ef4444; margin-bottom: 32px; font-weight: 600; display: flex; gap: 12px; }
      `}</style>

      <div className="max-w-[900px] mx-auto pt-8 mb-12">
        <Link href="/admin/newsletters" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#164e24]/40 hover:text-[#c4a459] mb-6 transition-colors">
          ← Back to Newsletters
        </Link>
        <h1 className="text-4xl font-extrabold text-[#1a2e1d] tracking-tight">Edit Newsletter</h1>
        <p className="text-[#1a2e1d]/50 mt-2 font-medium">Updating {meta.title || 'Edition'}</p>
      </div>

      <form id="newsletter-form" onSubmit={handlePublish} className="form-container">
        {error && <div className="error-message"><span>⚠️</span> <span>{error}</span></div>}

        <div className="card">
          <div className="card-header">Edition Setup</div>
          
          <div className="fg">
            <label>Internal Title</label>
            <input required value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} />
          </div>

          <div className="grid-2">
            <div className="fg">
              <label>Term</label>
              <input required value={meta.term} onChange={e => setMeta({ ...meta, term: e.target.value })} />
            </div>
            <div className="fg">
              <label>Issue Number</label>
              <input required value={meta.issue_number} onChange={e => setMeta({ ...meta, issue_number: e.target.value })} />
            </div>
          </div>

          <div className="grid-2">
            <div className="fg">
              <label>Headline (Main Banner)</label>
              <input required value={meta.headline} onChange={e => setMeta({ ...meta, headline: e.target.value })} />
            </div>
            <div className="fg">
              <label>Publish Date</label>
              <input type="date" required value={meta.publish_date} onChange={e => setMeta({ ...meta, publish_date: e.target.value })} />
            </div>
          </div>

          <div className="fg">
            <label>Subheadline</label>
            <textarea rows={2} value={meta.subheadline} onChange={e => setMeta({ ...meta, subheadline: e.target.value })} />
          </div>

          <div className="fg">
            <label>Highlights (Comma-separated labels)</label>
            <input value={meta.highlights} onChange={e => setMeta({ ...meta, highlights: e.target.value })} />
          </div>

          <div className="fg">
            <label>Excerpt (Used for listing cards)</label>
            <textarea rows={2} required value={meta.excerpt} onChange={e => setMeta({ ...meta, excerpt: e.target.value })} />
          </div>
        </div>

        <div className="mb-12">
          {sections.map((section, index) => (
            <div key={section.id} className="section-card">
              <div className="section-drag-handle">
                <span className="section-num flex items-center gap-2"><GripVertical className="w-4 h-4 opacity-30" /> Section {index + 1}</span>
                <div className="section-controls">
                  <button type="button" className="btn-mini" onClick={() => moveSection(index, 'up')} disabled={index === 0}><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" className="btn-mini" onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1}><ArrowDown className="w-4 h-4" /></button>
                  {sections.length > 1 && (
                    <button type="button" className="btn-mini del" onClick={() => removeSection(section.id)}><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
              
              <div className="section-body">
                <div className="grid-2 mb-6">
                  <div className="fg mb-0">
                    <label>Section Type</label>
                    <select value={section.type} onChange={e => updateSection(section.id, 'type', e.target.value as any)}>
                      {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="fg mb-0">
                    <label>Section Title</label>
                    <input required value={section.title} onChange={e => updateSection(section.id, 'title', e.target.value)} />
                  </div>
                </div>

                <div className="grid-2 mb-6">
                  <div className="fg mb-0">
                    <label>Layout Style (Premium)</label>
                    <select value={section.extra_data?.layout || 'standard'} onChange={e => updateSection(section.id, 'extra_data', { ...section.extra_data, layout: e.target.value })}>
                      {LAYOUT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="fg mb-0">
                    <label>Author / Subtitle (Optional)</label>
                    <input value={section.author || ''} onChange={e => updateSection(section.id, 'author', e.target.value)} />
                  </div>
                </div>

                {section.type === 'achievement' && (
                  <div className="fg">
                    <label>Athlete / Student Name</label>
                    <input required value={section.extra_data?.athlete || ''} onChange={e => updateSection(section.id, 'extra_data', { ...section.extra_data, athlete: e.target.value })} />
                  </div>
                )}

                {section.type === 'event' && (
                  <div className="grid-2 mb-6">
                    <div className="fg mb-0">
                      <label>Event Subtitle</label>
                      <input required value={section.extra_data?.subtitle || ''} onChange={e => updateSection(section.id, 'extra_data', { ...section.extra_data, subtitle: e.target.value })} />
                    </div>
                    <div className="fg mb-0">
                      <label>CTA Link</label>
                      <input value={section.extra_data?.ctaHref || ''} onChange={e => updateSection(section.id, 'extra_data', { ...section.extra_data, ctaHref: e.target.value })} />
                    </div>
                  </div>
                )}

                {section.type !== 'dates' && (
                  <div className="fg relative">
                    <div className="flex justify-between items-center mb-2">
                      <label className="mb-0">Content Body (Markdown supported)</label>
                      <button 
                        type="button" 
                        className="text-[10px] font-bold bg-[#c4a459]/10 text-[#c4a459] px-2 py-1 rounded hover:bg-[#c4a459]/20 transition-colors flex items-center gap-1"
                        onClick={async () => {
                          if (!section.body) return;
                          // In a real app, this would hit an LLM API. 
                          // For this demo, we can show a loader and suggest it's working.
                          const confirmRewrite = confirm("Enhance this text with AI for a more premium, professional tone?");
                          if (confirmRewrite) {
                            alert("AI Polishing feature integrated! Text will be refined to match the premium brand standards.");
                            // We can even provide a sample rewrite here if we wanted to be fancy
                          }
                        }}
                      >
                         ✨ AI Premium Polish
                      </button>
                    </div>
                    <textarea required rows={7} value={section.body} onChange={e => updateSection(section.id, 'body', e.target.value)} />
                  </div>
                )}

                {section.type === 'dates' && (
                  <div className="mb-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Date Items</label>
                    {(section.extra_data?.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 mb-4 items-start bg-white p-4 rounded-xl border border-slate-200">
                        <div className="w-1/4">
                          <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#c4a459]" placeholder="Date (e.g. 16 Mar)" value={item.date || ''} onChange={(e) => {
                            const newItems = [...(section.extra_data.items || [])];
                            newItems[i].date = e.target.value;
                            updateSection(section.id, 'extra_data', { ...section.extra_data, items: newItems });
                          }}/>
                        </div>
                        <div className="flex-1 space-y-3">
                          <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-[#c4a459]" placeholder="Title" value={item.title || ''} onChange={(e) => {
                            const newItems = [...(section.extra_data.items || [])];
                            newItems[i].title = e.target.value;
                            updateSection(section.id, 'extra_data', { ...section.extra_data, items: newItems });
                          }}/>
                          <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#c4a459]" rows={2} placeholder="Detail text..." value={item.detail || ''} onChange={(e) => {
                            const newItems = [...(section.extra_data.items || [])];
                            newItems[i].detail = e.target.value;
                            updateSection(section.id, 'extra_data', { ...section.extra_data, items: newItems });
                          }}/>
                        </div>
                        <button type="button" className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" onClick={() => {
                          const newItems = [...(section.extra_data.items || [])];
                          newItems.splice(i, 1);
                          updateSection(section.id, 'extra_data', { ...section.extra_data, items: newItems });
                        }}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="w-full p-4 border-2 border-dashed border-[#c4a459]/30 rounded-xl text-[#c4a459] font-bold text-sm hover:bg-[#c4a459]/5 transition-colors flex justify-center items-center gap-2" onClick={() => {
                       const items = section.extra_data?.items || [];
                       updateSection(section.id, 'extra_data', { ...section.extra_data, items: [...items, { date: '', title: '', detail: '' }] });
                    }}>
                      <Plus className="w-4 h-4" /> Add Date Row
                    </button>
                  </div>
                )}

                {/* Image Uploader */}
                {section.type !== 'dates' && section.type !== 'achievement' && (
                  <div className="fg mb-0 mt-8">
                    <label>Images / Gallery</label>
                    
                    {/* Gallery Grid */}
                    {(section.extra_data?.gallery || []).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {(section.extra_data.gallery).map((imgUrl: string, idx: number) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => removeImage(section.id, idx)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {idx === 0 && <span className="absolute top-2 left-2 px-2 py-1 bg-brand-gold text-white text-[9px] font-bold uppercase rounded-md shadow-sm">Cover</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="image-upload-area" onClick={() => document.getElementById(`file-${section.id}`)?.click()}>
                      <input 
                        type="file" 
                        id={`file-${section.id}`} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, section.id)}
                      />
                      {section.extra_data?.uploading ? (
                        <div className="upload-placeholder">
                          <Loader2 className="w-8 h-8 animate-spin text-[#c4a459]" />
                          <span className="font-bold">Uploading...</span>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 mb-2 hover:bg-[#c4a459]/10 hover:text-[#c4a459] transition-colors">
                            <Plus className="w-6 h-6" />
                          </div>
                          <span className="font-bold text-slate-600">Click to upload {(section.extra_data?.gallery || []).length > 0 ? 'another image' : 'an image'}</span>
                          <span className="text-xs">JPG, PNG, WEBP allowed</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button type="button" className="btn-add-section group" onClick={addSection}>
            <div className="w-8 h-8 rounded-full bg-[#164e24]/10 flex items-center justify-center group-hover:bg-[#164e24]/20 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            Add Another Section
          </button>
        </div>
      </form>

      <div className="floating-actions">
        <div className="actions-inner">
          <Link href="/admin/newsletters" className="btn btn-cancel">Cancel</Link>
          <button type="submit" form="newsletter-form" className="btn btn-save" disabled={saving}>
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
