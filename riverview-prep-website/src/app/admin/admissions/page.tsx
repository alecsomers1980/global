'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';

interface Document {
  id: string;
  name: string;
  file_url: string;
  category: string;
}

export default function AdmissionsAdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '', file_url: '', category: 'Admissions',
  });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('school_documents').select('*').order('category');
    if (error) setError(error.message);
    else { setDocuments(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('school_documents').update(formData).eq('id', editingId);
    } else {
      await supabase.from('school_documents').insert([formData]);
    }
    setShowForm(false); setEditingId(null);
    setFormData({ name: '', file_url: '', category: 'Admissions' });
    fetchDocuments();
  }

  function startEdit(doc: Document) {
    setFormData({ name: doc.name, file_url: doc.file_url, category: doc.category || 'Admissions' });
    setEditingId(doc.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return;
    await supabase.from('school_documents').delete().eq('id', id);
    fetchDocuments();
  }

  const grouped = documents.reduce((acc, doc) => {
    const cat = doc.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; }
        .doc-section { margin-bottom: 32px; }
        .doc-section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #c4a459; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(196,164,89,0.15); }
        .doc-list { display: flex; flex-direction: column; gap: 8px; }
        .doc-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; transition: all 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.01); }
        .doc-item:hover { border-color: rgba(22,78,36,0.15); transform: translateX(4px); box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .doc-name { font-weight: 600; color: #1a2e1d; font-size: 14px; }
        .doc-url { font-size: 11px; color: rgba(0,0,0,0.3); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .doc-actions { display: flex; gap: 8px; }
        .btn-sm { padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; color: rgba(0,0,0,0.5); }
        .btn-sm:hover { background: rgba(22,78,36,0.04); color: #164e24; border-color: rgba(22,78,36,0.1); }
        .btn-sm.del { border-color: rgba(239,68,68,0.15); color: rgba(239,68,68,0.5); }
        .btn-sm.del:hover { background: rgba(239,68,68,0.05); color: #ef4444; }
        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .form-modal { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 36px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .form-modal h3 { font-size: 20px; font-weight: 800; color: #1a2e1d; margin-bottom: 28px; }
        .fg { margin-bottom: 18px; }
        .fg label { display: block; font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .fg input, .fg select { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #1a2e1d; font-size: 14px; outline: none; }
        .fg input:focus, .fg select:focus { border-color: #c4a459; background: #fff; }
        .form-actions { display: flex; gap: 12px; margin-top: 28px; }
        .btn-cancel { padding: 10px 20px; background: #f1f5f9; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; color: rgba(0,0,0,0.5); cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-save { padding: 10px 20px; background: #c4a459; border: none; border-radius: 10px; color: #0c1a0f; cursor: pointer; font-weight: 700; font-size: 13px; flex: 1; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Admissions & Documents</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', file_url: '', category: 'Admissions' }); }}>
          + Add Document
        </button>
      </div>

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Table not found</p><p style={{ fontSize: 13, marginTop: 8 }}>Run the SQL script to create the school_documents table.</p></div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="empty-state"><p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No documents yet</p></div>
      ) : (
        Object.entries(grouped).map(([category, docs]) => (
          <div key={category} className="doc-section">
            <h3 className="doc-section-title">{category}</h3>
            <div className="doc-list">
              {docs.map(doc => (
                <div key={doc.id} className="doc-item">
                  <div>
                    <div className="doc-name">📄 {doc.name}</div>
                    <div className="doc-url">{doc.file_url}</div>
                  </div>
                  <div className="doc-actions">
                    <button className="btn-sm" onClick={() => startEdit(doc)}>Edit</button>
                    <button className="btn-sm del" onClick={() => handleDelete(doc.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit Document' : 'Add Document'}</h3>
            <form onSubmit={handleSave}>
              <div className="fg"><label>Document Name</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Application Form 2026" /></div>
              <div className="fg"><label>File URL</label><input required value={formData.file_url} onChange={e => setFormData({ ...formData, file_url: e.target.value })} placeholder="URL to the document/PDF" /></div>
              <div className="fg"><label>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option>Admissions</option><option>Policies</option><option>Term Calendar</option><option>Forms</option><option>Financial</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Add Document'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
