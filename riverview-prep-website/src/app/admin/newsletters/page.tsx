'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

interface Newsletter {
  id: string;
  slug: string;
  title: string;
  issue_number: string;
  term: string;
  publish_date: string;
  excerpt: string;
}

export default function NewslettersAdminPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchNewsletters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('publish_date', { ascending: false });
    if (error) setError(error.message);
    else { setNewsletters(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchNewsletters(); }, [fetchNewsletters]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this newsletter? This will also delete all its sections.')) return;
    await supabase.from('newsletters').delete().eq('id', id);
    fetchNewsletters();
  }

  async function handleCopyEmailHtml(slug: string) {
    try {
      const res = await fetch(`/api/newsletter/${slug}/email`);
      if (!res.ok) throw new Error('Failed to generate email');
      const html = await res.text();
      await navigator.clipboard.writeText(html);
      alert('Email HTML copied to clipboard! You can now paste it into your mailer.');
    } catch (err) {
      alert('Error copying email HTML: ' + err);
    }
  }

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; transform: translateY(-1px); }
        .newsletter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
        .nl-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 28px; transition: all 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .nl-card:hover { border-color: rgba(22,78,36,0.15); transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.04); }
        .nl-meta { display: flex; gap: 12px; margin-bottom: 12px; }
        .nl-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; background: rgba(0,0,0,0.04); color: rgba(0,0,0,0.4); }
        .nl-title { font-size: 18px; font-weight: 700; color: #1a2e1d; margin-bottom: 8px; }
        .nl-excerpt { font-size: 13px; color: rgba(0,0,0,0.45); line-height: 1.5; margin-bottom: 20px; }
        .nl-actions { display: flex; gap: 12px; }
        .nl-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .nl-btn-edit { background: #f8fafc; border: 1px solid rgba(0,0,0,0.06); color: rgba(0,0,0,0.5); }
        .nl-btn-edit:hover { background: rgba(22,78,36,0.04); color: #164e24; border-color: rgba(22,78,36,0.1); }
        .nl-btn-copy { background: none; border: 1px solid rgba(196,164,89,0.3); color: #c4a459; }
        .nl-btn-copy:hover { background: rgba(196,164,89,0.05); }
        .nl-btn-del { background: none; border: 1px solid rgba(239,68,68,0.15); color: rgba(239,68,68,0.5); }
        .nl-btn-del:hover { background: rgba(239,68,68,0.05); color: #ef4444; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Newsletters</h2>
        <Link href="/admin/newsletters/new" className="btn-primary">+ New Newsletter</Link>
      </div>

      {error ? (
        <div className="error-state">
          <p style={{ fontWeight: 700 }}>Table not found</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Run the SQL script in Supabase to create the newsletters table.</p>
        </div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : newsletters.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No newsletters yet</p>
          <p style={{ fontSize: 14 }}>Create your first newsletter to get started.</p>
        </div>
      ) : (
        <div className="newsletter-grid">
          {newsletters.map(nl => (
            <div key={nl.id} className="nl-card">
              <div className="nl-meta">
                {nl.term && <span className="nl-badge">{nl.term}</span>}
                {nl.issue_number && <span className="nl-badge">Issue {nl.issue_number}</span>}
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.25)', marginLeft: 'auto' }}>{nl.publish_date}</span>
              </div>
              <h3 className="nl-title">{nl.title}</h3>
              <p className="nl-excerpt">{nl.excerpt || 'No excerpt provided.'}</p>
              <div className="nl-actions">
                <Link href={`/admin/newsletters/edit/${nl.id}`} className="nl-btn nl-btn-edit">Edit</Link>
                <button onClick={() => handleCopyEmailHtml(nl.slug)} className="nl-btn nl-btn-copy" title="Copy table-based HTML to clipboard for use in an email client">Email HTML</button>
                <button onClick={() => handleDelete(nl.id)} className="nl-btn nl-btn-del">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
