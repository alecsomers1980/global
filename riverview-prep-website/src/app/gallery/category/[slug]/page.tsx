'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react';

interface Album {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string;
  event_date: string;
  image_count: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch category
      const { data: cat } = await supabase.from('gallery_categories').select('*').eq('slug', params.slug).single();
      if (!cat) { setLoading(false); return; }
      setCategory(cat);

      // Fetch albums
      const { data: albs } = await supabase
        .from('gallery_albums')
        .select(`*, gallery_images(count)`)
        .eq('category_id', cat.id)
        .order('event_date', { ascending: false });

      if (albs) {
        setAlbums(albs.map((a: any) => ({
          ...a,
          image_count: a.gallery_images?.[0]?.count || 0
        })));
      }
      setLoading(false);
    }
    fetchData();
  }, [params.slug, supabase]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div></div>;
  if (!category) return <div className="min-h-screen flex items-center justify-center text-brand-green font-bold">Category not found</div>;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Category Header */}
      <section className="bg-brand-green px-6 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <Image src="/images/logo.png" alt="Logo" fill className="object-contain translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-brand-gold/60 hover:text-brand-gold text-xs font-black uppercase tracking-widest mb-8 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Gallery
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="w-12 h-[2px] bg-brand-gold"></span>
            <span className="text-brand-gold font-black uppercase tracking-[0.2em] text-sm italic">Collection Index</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">{category.name}</h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed font-medium italic">{category.description}</p>
        </div>
      </section>

      {/* Albums Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        {albums.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-24 text-center shadow-2xl border border-brand-green/5">
            <ImageIcon className="w-16 h-16 text-brand-gold/20 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-brand-green">No albums in this category yet.</h2>
            <p className="text-brand-green/40 mt-2">Check back soon for new photo collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {albums.map((album, idx) => (
              <Link 
                key={album.id} 
                href={`/gallery/album/${album.slug}`}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image 
                    src={album.cover_image_url || '/images/hero-bg.jpg'} 
                    alt={album.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 bg-brand-gold text-brand-green px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg transform translate-x-4 group-hover:translate-x-0 transition-transform">
                    <ImageIcon className="w-3 h-3" /> {album.image_count} Photos
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3 text-brand-gold">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {album.event_date ? new Date(album.event_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recent Event'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-brand-green tracking-tight mb-3">
                    {album.name}
                  </h3>
                  <p className="text-brand-green/50 text-sm line-clamp-2 leading-relaxed">
                    {album.description || 'View the highlights and moments from this event.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
