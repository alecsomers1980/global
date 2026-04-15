'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Maximize2, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
}

interface Album {
  id: string;
  name: string;
  description: string;
  event_date: string;
  category_id: string;
  gallery_categories?: { name: string; slug: string };
}

export default function AlbumPage({ params }: { params: { slug: string } }) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch album
      const { data: alb } = await supabase
        .from('gallery_albums')
        .select('*, gallery_categories(name, slug)')
        .eq('slug', params.slug)
        .single();
      
      if (!alb) { setLoading(false); return; }
      setAlbum(alb);

      // Fetch images
      const { data: imgs } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('album_id', alb.id)
        .order('sort_order', { ascending: true });

      if (imgs) setImages(imgs);
      setLoading(false);
    }
    fetchData();
  }, [params.slug, supabase]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  const prevImage = () => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div></div>;
  if (!album) return <div className="min-h-screen flex items-center justify-center text-brand-green font-bold">Album not found</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Album Header */}
      <section className="bg-brand-cream/50 pt-32 pb-20 px-6 border-b border-brand-green/5">
        <div className="max-w-7xl mx-auto">
          <Link 
            href={album.gallery_categories ? `/gallery/category/${album.gallery_categories.slug}` : '/gallery'} 
            className="inline-flex items-center gap-2 text-brand-green/40 hover:text-brand-green text-xs font-black uppercase tracking-widest mb-10 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to {album.gallery_categories?.name || 'Category'}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-[2px] bg-brand-gold"></span>
                <span className="text-brand-gold font-black uppercase tracking-[0.2em] text-sm">{album.gallery_categories?.name || 'Album'}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-brand-green tracking-tighter mb-6">{album.name}</h1>
              <p className="text-lg text-brand-green/60 leading-relaxed font-medium italic">{album.description}</p>
            </div>
            <div className="flex items-center gap-6 pb-2">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/30 mb-1">Date</p>
                <p className="font-serif font-bold text-brand-green text-lg">
                  {album.event_date ? new Date(album.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                </p>
              </div>
              <div className="w-[1px] h-10 bg-brand-green/10"></div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/30 mb-1">Photos</p>
                <p className="font-serif font-bold text-brand-green text-lg">{images.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Images Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {images.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">This album is currently empty.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {images.map((img, idx) => (
              <div 
                key={img.id} 
                className="relative group rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 break-inside-avoid animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => openLightbox(idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt={img.caption} className="w-full h-auto group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-brand-green/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                  <Maximize2 className="absolute top-6 right-6 w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                  {img.caption && (
                    <p className="text-white font-bold text-lg tracking-tight leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Premium Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-brand-green/98 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-between items-center p-6 md:p-10">
            <div className="flex flex-col">
              <span className="text-brand-gold font-bold uppercase tracking-widest text-[10px] mb-1">
                {lightboxIndex + 1} / {images.length}
              </span>
              <p className="text-white font-bold text-sm tracking-tight">{album.name}</p>
            </div>
            <button 
              onClick={closeLightbox}
              className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-brand-green transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-4">
            {/* Nav Btns */}
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-10 z-10 w-14 h-14 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-white hover:text-brand-green transition-all"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-10 z-10 w-14 h-14 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-white hover:text-brand-green transition-all"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="relative w-full h-full flex flex-col items-center justify-center py-10 px-10 md:px-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={images[lightboxIndex].image_url} 
                alt="Lightbox View" 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500" 
              />
              {images[lightboxIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 py-10 px-4 text-center">
                  <p className="text-white text-xl md:text-2xl font-black tracking-tight drop-shadow-lg">
                    {images[lightboxIndex].caption}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-10 flex justify-center gap-6">
            <a 
              href={images[lightboxIndex].image_url} 
              download 
              className="flex items-center gap-2 text-white/40 hover:text-brand-gold font-black uppercase tracking-widest text-[10px] transition-colors"
            >
              <Download className="w-4 h-4" /> Download Original
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
