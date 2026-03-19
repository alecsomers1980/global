'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import Image from 'next/image';

interface Album {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  created_at: string;
  image_count?: number;
}

export default function GalleryAdminPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '', description: '', cover_image: '',
  });

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else { setAlbums(data || []); setError(null); }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await supabase.from('gallery_albums').update(formData).eq('id', editingId);
    } else {
      await supabase.from('gallery_albums').insert([formData]);
    }
    setShowForm(false); setEditingId(null);
    setFormData({ name: '', description: '', cover_image: '' });
    fetchAlbums();
  }

  function startEdit(album: Album) {
    setFormData({ name: album.name, description: album.description || '', cover_image: album.cover_image || '' });
    setEditingId(album.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this album and all its images?')) return;
    await supabase.from('gallery_albums').delete().eq('id', id);
    fetchAlbums();
  }

  return (
    <div>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .btn-primary { background: #c4a459; color: #0c1a0f; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #d4b469; }
        .albums-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .album-card { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .album-card:hover { border-color: rgba(22,78,36,0.15); transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.04); }
        .album-cover { width: 100%; height: 160px; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 40px; color: rgba(0,0,0,0.1); position: relative; overflow: hidden; }
        .album-cover img { width: 100%; height: 100%; object-fit: cover; }
        .album-info { padding: 20px; }
        .album-name { font-size: 16px; font-weight: 700; color: #1a2e1d; margin-bottom: 4px; }
        .album-desc { font-size: 12px; color: rgba(0,0,0,0.45); margin-bottom: 12px; line-height: 1.5; }
        .album-actions { display: flex; gap: 8px; border-top: 1px solid rgba(0,0,0,0.04); padding-top: 12px; }
        .btn-sm { padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; color: rgba(0,0,0,0.5); }
        .btn-sm:hover { background: rgba(22,78,36,0.04); color: #164e24; border-color: rgba(22,78,36,0.1); }
        .btn-sm.del { border-color: rgba(239,68,68,0.15); color: rgba(239,68,68,0.5); }
        .btn-sm.del:hover { background: rgba(239,68,68,0.05); color: #ef4444; }
        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .form-modal { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; padding: 36px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .form-modal h3 { font-size: 20px; font-weight: 800; color: #1a2e1d; margin-bottom: 28px; }
        .fg { margin-bottom: 18px; }
        .fg label { display: block; font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.4); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .fg input, .fg textarea { width: 100%; padding: 11px 14px; background: #f8fafc; border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; color: #1a2e1d; font-size: 14px; outline: none; }
        .fg input:focus, .fg textarea:focus { border-color: #c4a459; background: #fff; }
        .form-actions { display: flex; gap: 12px; margin-top: 28px; }
        .btn-cancel { padding: 10px 20px; background: #f1f5f9; border: 1px solid rgba(0,0,0,0.05); border-radius: 10px; color: rgba(0,0,0,0.5); cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-save { padding: 10px 20px; background: #c4a459; border: none; border-radius: 10px; color: #0c1a0f; cursor: pointer; font-weight: 700; font-size: 13px; flex: 1; }
        .empty-state { padding: 60px; text-align: center; color: rgba(0,0,0,0.3); background: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
        .error-state { padding: 32px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); border-radius: 12px; color: #ef4444; }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Gallery</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', description: '', cover_image: '' }); }}>
          + Create Album
        </button>
      </div>

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Table not found</p><p style={{ fontSize: 13, marginTop: 8 }}>Run the SQL script to create the gallery_albums table.</p></div>
      ) : loading ? (
        <div className="empty-state">Loading...</div>
      ) : albums.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No albums yet</p>
          <p style={{ fontSize: 14 }}>Create your first album to start organizing photos.</p>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map(album => (
            <div key={album.id} className="album-card">
              <div className="album-cover">
                {album.cover_image ? (
                  <Image src={album.cover_image} alt={album.name} fill style={{ objectFit: 'cover' }} />
                ) : '🖼️'}
              </div>
              <div className="album-info">
                <div className="album-name">{album.name}</div>
                <div className="album-desc">{album.description || 'No description'}</div>
                <div className="album-actions">
                  <button className="btn-sm" onClick={() => startEdit(album)}>Edit</button>
                  <button className="btn-sm del" onClick={() => handleDelete(album.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit Album' : 'Create Album'}</h3>
            <form onSubmit={handleSave}>
              <div className="fg"><label>Album Name</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sports Day 2026" /></div>
              <div className="fg"><label>Description</label><textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="fg"><label>Cover Image URL</label><input value={formData.cover_image} onChange={e => setFormData({ ...formData, cover_image: e.target.value })} placeholder="Optional — paste an image URL" /></div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Create Album'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
