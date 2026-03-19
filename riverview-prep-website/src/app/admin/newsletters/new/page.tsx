'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

interface Section {
  id: string;
  title: string;
  body: string;
  image_url: string;
}

export default function NewNewsletterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meta, setMeta] = useState({
    title: '', slug: '', term: '', issue_number: '', excerpt: '', hero_image: '',
  });

  const [sections, setSections] = useState<Section[]>([
    { id: '1', title: '', body: '', image_url: '' },
  ]);

  function addSection() {
    setSections([...sections, { id: Date.now().toString(), title: '', body: '', image_url: '' }]);
  }

  function removeSection(id: string) {
    setSections(sections.filter(s => s.id !== id));
  }

  function updateSection(id: string, field: keyof Section, value: string) {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    const newSections = [...sections];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    setSections(newSections);
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const slug = meta.slug || meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data: newsletter, error: nlError } = await supabase
      .from('newsletters')
      .insert([{ ...meta, slug, publish_date: new Date().toISOString().split('T')[0] }])
      .select()
      .single();

    if (nlError) { setError(nlError.message); setLoading(false); return; }

    if (sections.length > 0 && newsletter) {
      const sectionData = sections.map((s, i) => ({
        newsletter_id: newsletter.id,
        title: s.title,
        body: s.body,
        image_url: s.image_url,
        sort_order: i,
      }));
      await supabase.from('newsletter_sections').insert(sectionData);
    }

    router.push('/admin/newsletters');
  }

  return (
    <div>
      <style suppressHydrationWarning>{`
        .form-container { max-width: 800px; }
        .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; padding: 36px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #c4a459; margin-bottom: 24px; }
        .fg { margin-bottom: 18px; }
        .fg label { display: block; font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .fg input, .fg textarea { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #1a2e1d; font-size: 14px; outline: none; }
        .fg input:focus, .fg textarea:focus { border-color: #c4a459; background: #fff; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .section-card { background: #fcfdfe; border: 1px solid rgba(0,0,0,0.05); border-radius: 16px; padding: 28px; margin-bottom: 16px; position: relative; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-num { font-size: 11px; font-weight: 700; color: rgba(196,164,89,0.7); text-transform: uppercase; letter-spacing: 1px; }
        .section-controls { display: flex; gap: 6px; }
        .btn-mini { padding: 4px 8px; background: none; border: 1px solid rgba(0,0,0,0.08); border-radius: 4px; color: rgba(0,0,0,0.3); cursor: pointer; font-size: 12px; transition: all 0.15s; }
        .btn-mini:hover { border-color: rgba(0,0,0,0.2); color: #1a2e1d; }
        .btn-mini.del:hover { border-color: rgba(239,68,68,0.4); color: #ef4444; }
        .btn-add-section { width: 100%; padding: 16px; background: #fcfdfe; border: 2px dashed rgba(0,0,0,0.08); border-radius: 14px; color: rgba(0,0,0,0.3); font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .btn-add-section:hover { border-color: rgba(196,164,89,0.3); color: #c4a459; background: rgba(196,164,89,0.04); }
        .actions { display: flex; gap: 16px; margin-top: 32px; }
        .btn { padding: 14px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; text-decoration: none; text-align: center; }
        .btn-save { background: #c4a459; color: #0c1a0f; border: none; flex: 1; }
        .btn-save:hover { background: #d4b469; }
        .btn-cancel { background: #f1f5f9; color: rgba(0,0,0,0.5); border: 1px solid rgba(0,0,0,0.05); }
        .error-message { padding: 16px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 10px; color: #ef4444; margin-bottom: 24px; font-size: 13px; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <Link href="/admin/newsletters" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.35)', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
          ← Back to Newsletters
        </Link>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Create Newsletter</h2>
      </div>

      <form onSubmit={handlePublish} className="form-container">
        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="card">
          <h3 className="section-title">Newsletter Details</h3>
          <div className="fg"><label>Title</label><input required value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} placeholder="e.g. The Riverview Reel — Issue 06" /></div>
          <div className="grid-2">
            <div className="fg"><label>Term</label><input value={meta.term} onChange={e => setMeta({ ...meta, term: e.target.value })} placeholder="e.g. Term 1" /></div>
            <div className="fg"><label>Issue Number</label><input value={meta.issue_number} onChange={e => setMeta({ ...meta, issue_number: e.target.value })} placeholder="e.g. 06" /></div>
          </div>
          <div className="fg"><label>Excerpt / Summary</label><textarea rows={2} value={meta.excerpt} onChange={e => setMeta({ ...meta, excerpt: e.target.value })} placeholder="Brief summary for the news listing..." /></div>
          <div className="fg"><label>Hero Image URL</label><input value={meta.hero_image} onChange={e => setMeta({ ...meta, hero_image: e.target.value })} placeholder="Optional — main header image URL" /></div>
        </div>

        <h3 className="section-title" style={{ marginTop: 40, marginBottom: 20 }}>Sections</h3>

        {sections.map((section, index) => (
          <div key={section.id} className="section-card">
            <div className="section-header">
              <span className="section-num">Section {index + 1}</span>
              <div className="section-controls">
                <button type="button" className="btn-mini" onClick={() => moveSection(index, 'up')} title="Move up">↑</button>
                <button type="button" className="btn-mini" onClick={() => moveSection(index, 'down')} title="Move down">↓</button>
                {sections.length > 1 && (
                  <button type="button" className="btn-mini del" onClick={() => removeSection(section.id)} title="Remove">✕</button>
                )}
              </div>
            </div>
            <div className="fg"><label>Section Title</label><input value={section.title} onChange={e => updateSection(section.id, 'title', e.target.value)} placeholder="e.g. From the Principal's Desk" /></div>
            <div className="fg"><label>Content</label><textarea rows={5} value={section.body} onChange={e => updateSection(section.id, 'body', e.target.value)} placeholder="Write the section content here..." /></div>
            <div className="fg"><label>Image URL (optional)</label><input value={section.image_url} onChange={e => updateSection(section.id, 'image_url', e.target.value)} /></div>
          </div>
        ))}

        <button type="button" className="btn-add-section" onClick={addSection}>+ Add Section</button>

        <div className="actions">
          <Link href="/admin/newsletters" className="btn btn-cancel">Cancel</Link>
          <button type="submit" className="btn btn-save" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Newsletter'}
          </button>
        </div>
      </form>
    </div>
  );
}
