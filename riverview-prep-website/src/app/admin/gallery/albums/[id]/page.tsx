'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import { Image as ImageIcon, Loader2, Plus, Trash2, ArrowLeft, Star, Grid, List } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
}

interface Album {
  id: string;
  name: string;
  category_id: string;
  cover_image_url?: string;
}

export default function AlbumEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [album, setAlbum] = useState<Album | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch Album
    const { data: alb, error: albErr } = await supabase.from('gallery_albums').select('*').eq('id', params.id).single();
    if (albErr) { setError(albErr.message); setLoading(false); return; }
    setAlbum(alb);

    // Fetch Images
    const { data: imgs, error: imgErr } = await supabase.from('gallery_images').select('*').eq('album_id', params.id).order('sort_order', { ascending: true });
    if (imgErr) setError(imgErr.message);
    else setImages(imgs || []);
    
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    const files = Array.from(e.target.files);
    const newImages: any[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `gallery/${params.id}`);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        newImages.push({
          album_id: params.id,
          image_url: data.publicUrl,
          caption: '',
          sort_order: images.length + newImages.length
        });
      } catch (err: any) {
        console.error('Upload error:', err);
      }
    }

    if (newImages.length > 0) {
      const { error: insErr } = await supabase.from('gallery_images').insert(newImages);
      if (insErr) alert(insErr.message);
      else fetchData();
    }
    setUploading(false);
  }

  async function handleDeleteImage(id: string) {
    if (!confirm('Remove this photo from the album?')) return;
    await supabase.from('gallery_images').delete().eq('id', id);
    setImages(images.filter(img => img.id !== id));
  }

  async function setAsCover(url: string) {
    const { error } = await supabase.from('gallery_albums').update({ cover_image_url: url }).eq('id', params.id);
    if (error) alert(error.message);
    else setAlbum(prev => prev ? { ...prev, cover_image_url: url } : null);
  }

  async function updateCaption(id: string, caption: string) {
    setImages(images.map(img => img.id === id ? { ...img, caption } : img));
  }

  async function saveChanges() {
    setSaving(true);
    // Batch update captions and sort orders
    const updates = images.map((img, i) => ({
      id: img.id,
      album_id: params.id,
      image_url: img.image_url,
      caption: img.caption,
      sort_order: i
    }));
    
    const { error } = await supabase.from('gallery_images').upsert(updates);
    if (error) alert(error.message);
    setSaving(false);
  }

  if (loading) return <div className="p-20 text-center text-brand-green">Loading album...</div>;
  if (!album) return <div className="p-20 text-center text-red-500">Album not found.</div>;

  return (
    <div className="pb-24">
      <style suppressHydrationWarning>{`
        .admin-container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
        .editor-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .back-link { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: rgba(0,0,0,0.4); margin-bottom: 12px; transition: color 0.2s; }
        .back-link:hover { color: #c4a459; }
        .album-title { font-size: 32px; font-weight: 800; color: #1a2e1d; }
        
        .upload-card { background: #f8fafc; border: 2px dashed rgba(22,78,36,0.1); border-radius: 20px; padding: 40px; text-align: center; margin-bottom: 40px; cursor: pointer; transition: all 0.2s; }
        .upload-card:hover { border-color: #c4a459; background: rgba(196,164,89,0.02); }
        .upload-icon { width: 48px; height: 48px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #c4a459; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 24px; }
        .img-card { background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; overflow: hidden; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.02); transition: all 0.2s; }
        .img-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.05); }
        .img-wrap { aspect-ratio: 1; overflow: hidden; background: #f1f5f9; position: relative; }
        .img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .img-info { padding: 12px; }
        .img-caption { width: 100%; border: none; background: #f8fafc; border-radius: 8px; padding: 8px; font-size: 12px; outline: none; transition: all 0.2s; }
        .img-caption:focus { background: #fff; box-shadow: 0 0 0 2px rgba(196,164,89,0.2); }
        
        .img-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 6px; opacity: 0; transition: opacity 0.2s; }
        .img-card:hover .img-actions { opacity: 1; }
        .action-btn { background: #fff; color: #1a2e1d; border: 1px solid rgba(0,0,0,0.1); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { background: #f8fafc; border-color: rgba(0,0,0,0.2); }
        .action-btn.del:hover { color: #ef4444; border-color: #ef4444; }
        .action-btn.active-star { color: #c4a459; border-color: #c4a459; background: #fffdf2; }

        .floating-bar { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #164e24; color: #fff; padding: 12px 24px; border-radius: 16px; display: flex; align-items: center; gap: 24px; box-shadow: 0 20px 40px rgba(22,78,36,0.2); z-index: 100; }
        .btn-save { background: #c4a459; border: none; padding: 10px 20px; border-radius: 8px; color: #0c1a0f; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
      `}</style>

      <div className="admin-container">
        <header className="editor-header">
          <div>
            <Link href="/admin/gallery" className="back-link"><ArrowLeft className="w-3 h-3" /> Back to Gallery</Link>
            <h1 className="album-title">{album.name}</h1>
            <p className="text-black/40 text-sm mt-1">{images.length} Photos in this album</p>
          </div>
          <button className="btn-save" onClick={saveChanges} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Captions & Order'}
          </button>
        </header>

        <label className="upload-card">
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
              <p className="font-bold text-brand-green">Uploading photos...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon"><ImageIcon className="w-6 h-6" /></div>
              <p className="font-bold text-brand-green text-lg">Add Photos</p>
              <p className="text-black/30 text-sm">Click to select multiple images or drag & drop here</p>
            </>
          )}
        </label>

        <div className="images-grid">
          {images.map((img) => (
            <div key={img.id} className="img-card">
              <div className="img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt={img.caption} />
                <div className="img-actions">
                  <button 
                    className={`action-btn ${album.cover_image_url === img.image_url ? 'active-star' : ''}`} 
                    title="Set as Album Cover"
                    onClick={() => setAsCover(img.image_url)}
                  >
                    <Star className={`w-4 h-4 ${album.cover_image_url === img.image_url ? 'fill-current' : ''}`} />
                  </button>
                  <button className="action-btn del" title="Delete Image" onClick={() => handleDeleteImage(img.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="img-info">
                <input 
                  className="img-caption" 
                  placeholder="Add a caption..." 
                  value={img.caption || ''} 
                  onChange={(e) => updateCaption(img.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 0 && (
        <div className="floating-bar">
          <span className="text-sm font-bold">{images.length} Photos</span>
          <button className="btn-save" onClick={saveChanges} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save All Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
