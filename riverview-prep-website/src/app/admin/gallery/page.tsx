'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  album_count?: number;
}

interface Album {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string;
  created_at: string;
  image_count?: number;
  category_name?: string;
}

export default function GalleryAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState<'album' | 'category' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<'albums' | 'categories'>('albums');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [albumData, setAlbumData] = useState({
    name: '', description: '', cover_image_url: '', category_id: '', slug: ''
  });

  const [categoryData, setCategoryData] = useState({
    name: '', description: '', slug: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Fetch Categories
    const { data: cats, error: catErr } = await supabase.from('gallery_categories').select('*').order('sort_order', { ascending: true });
    if (catErr) { setError(catErr.message); setLoading(false); return; }
    setCategories(cats || []);

    // Fetch Albums with Category names
    const { data: albs, error: albErr } = await supabase
      .from('gallery_albums')
      .select(`*, gallery_categories(name)`)
      .order('created_at', { ascending: false });
    
    if (albErr) setError(albErr.message);
    else { 
      setAlbums((albs || []).map((a: any) => ({
        ...a,
        category_name: a.gallery_categories?.name
      }))); 
      setError(null); 
    }
    
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSaveAlbum(e: React.FormEvent) {
    e.preventDefault();
    const slug = albumData.slug || albumData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data = { ...albumData, slug };

    if (editingId) {
      await supabase.from('gallery_albums').update(data).eq('id', editingId);
    } else {
      await supabase.from('gallery_albums').insert([data]);
    }
    setShowForm(null); setEditingId(null);
    setAlbumData({ name: '', description: '', cover_image_url: '', category_id: '', slug: '' });
    fetchData();
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data = { ...categoryData, slug };

    if (editingId) {
      await supabase.from('gallery_categories').update(data).eq('id', editingId);
    } else {
      await supabase.from('gallery_categories').insert([data]);
    }
    setShowForm(null); setEditingId(null);
    setCategoryData({ name: '', description: '', slug: '' });
    fetchData();
  }

  function startEditAlbum(album: Album) {
    setAlbumData({ 
      name: album.name, 
      description: album.description || '', 
      cover_image_url: album.cover_image_url || '',
      category_id: album.category_id || '',
      slug: album.slug || ''
    });
    setEditingId(album.id);
    setShowForm('album');
  }

  function startEditCategory(cat: Category) {
    setCategoryData({ name: cat.name, description: cat.description || '', slug: cat.slug || '' });
    setEditingId(cat.id);
    setShowForm('category');
  }

  async function handleDeleteAlbum(id: string) {
    if (!confirm('Delete this album and all its images?')) return;
    await supabase.from('gallery_albums').delete().eq('id', id);
    fetchData();
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Delete this category? Albums inside will be orphaned or deleted based on DB rules.')) return;
    await supabase.from('gallery_categories').delete().eq('id', id);
    fetchData();
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
        <div className="flex flex-col gap-1">
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Media Gallery</h2>
          <div className="flex gap-4 border-b border-black/5 mt-4">
            <button className={`pb-2 px-1 text-sm font-bold transition-all ${view === 'albums' ? 'text-brand-green border-b-2 border-brand-green' : 'text-black/30'}`} onClick={() => setView('albums')}>Albums</button>
            <button className={`pb-2 px-1 text-sm font-bold transition-all ${view === 'categories' ? 'text-brand-green border-b-2 border-brand-green' : 'text-black/30'}`} onClick={() => setView('categories')}>Categories</button>
          </div>
        </div>
        <div className="flex gap-3">
          {view === 'categories' ? (
             <button className="btn-primary" onClick={() => { setShowForm('category'); setEditingId(null); setCategoryData({ name: '', description: '', slug: '' }); }}>
               + New Category
             </button>
          ) : (
            <button className="btn-primary" onClick={() => { setShowForm('album'); setEditingId(null); setAlbumData({ name: '', description: '', cover_image_url: '', category_id: '', slug: '' }); }}>
               + Create Album
             </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="error-state"><p style={{ fontWeight: 700 }}>Database Sync Error</p><p style={{ fontSize: 13, marginTop: 8 }}>{error}</p></div>
      ) : loading ? (
        <div className="empty-state">Loading gallery data...</div>
      ) : view === 'categories' ? (
        <div className="albums-grid">
          {categories.map(cat => (
            <div key={cat.id} className="album-card">
              <div className="album-info">
                <div className="flex justify-between items-start">
                  <div className="album-name">{cat.name}</div>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{cat.slug}</span>
                </div>
                <div className="album-desc">{cat.description || 'No description'}</div>
                <div className="album-actions">
                  <button className="btn-sm" onClick={() => startEditCategory(cat)}>Edit</button>
                  <button className="btn-sm del" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No albums yet</p>
          <p style={{ fontSize: 14 }}>Organize your photos by creating an album first.</p>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map(album => (
            <div key={album.id} className="album-card">
              <div className="album-cover">
                {album.cover_image_url ? (
                  <Image src={album.cover_image_url} alt={album.name} fill style={{ objectFit: 'cover' }} />
                ) : '🖼️'}
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[9px] font-bold uppercase tracking-wider text-brand-green shadow-sm">{album.category_name || 'Uncategorized'}</div>
              </div>
              <div className="album-info">
                <div className="album-name">{album.name}</div>
                <div className="album-desc">{album.description || 'No description'}</div>
                <div className="album-actions">
                  <Link href={`/admin/gallery/albums/${album.id}`} className="btn-sm" style={{ background: '#164e24', color: '#fff', border: 'none' }}>Manage Photos</Link>
                  <button className="btn-sm" onClick={() => startEditAlbum(album)}>Edit</button>
                  <button className="btn-sm del" onClick={() => handleDeleteAlbum(album.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm === 'album' && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(null); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit Album' : 'Create Album'}</h3>
            <form onSubmit={handleSaveAlbum}>
              <div className="fg">
                <label>Album Name</label>
                <input required value={albumData.name} onChange={e => setAlbumData({ ...albumData, name: e.target.value })} placeholder="e.g. Sports Day 2026" />
              </div>
              <div className="fg">
                <label>Category</label>
                <select required value={albumData.category_id} onChange={e => setAlbumData({ ...albumData, category_id: e.target.value })} style={{ width: '100%', padding: '11px', background: '#f8fafc', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px' }}>
                  <option value="">Select a category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="fg"><label>Description</label><textarea rows={3} value={albumData.description} onChange={e => setAlbumData({ ...albumData, description: e.target.value })} /></div>
              <div className="fg"><label>Cover Image URL (Optional)</label><input value={albumData.cover_image_url} onChange={e => setAlbumData({ ...albumData, cover_image_url: e.target.value })} placeholder="Will use first image if empty" /></div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(null)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Create Album'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm === 'category' && (
        <div className="form-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(null); }}>
          <div className="form-modal">
            <h3>{editingId ? 'Edit Category' : 'Create Category'}</h3>
            <form onSubmit={handleSaveCategory}>
              <div className="fg"><label>Category Name</label><input required value={categoryData.name} onChange={e => setCategoryData({ ...categoryData, name: e.target.value })} placeholder="e.g. Sport" /></div>
              <div className="fg"><label>Description</label><textarea rows={3} value={categoryData.description} onChange={e => setCategoryData({ ...categoryData, description: e.target.value })} /></div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(null)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
