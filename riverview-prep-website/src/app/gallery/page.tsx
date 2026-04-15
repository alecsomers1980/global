'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Camera } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  album_count: number;
  featured_image?: string;
}

export default function GalleryLandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: cats } = await supabase.from('gallery_categories').select('*').order('sort_order', { ascending: true });
      
      if (cats) {
        const enrichedCats = await Promise.all(cats.map(async (cat) => {
          // Get album count
          const { count } = await supabase.from('gallery_albums').select('*', { count: 'exact', head: true }).eq('category_id', cat.id);
          // Get latest album cover for featured image
          const { data: latestAlbum } = await supabase
            .from('gallery_albums')
            .select('cover_image_url')
            .eq('category_id', cat.id)
            .not('cover_image_url', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...cat,
            album_count: count || 0,
            featured_image: latestAlbum?.cover_image_url || '/images/hero-bg.jpg' // Fallback
          };
        }));
        setCategories(enrichedCats);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-brand-green">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/hero-bg.jpg" alt="Background" fill className="object-cover" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Our Gallery
          </h1>
          <p className="text-brand-gold font-bold uppercase tracking-[0.3em] text-sm md:text-base animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Capturing Moments • Creating Memories
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, idx) => (
              <Link 
                key={cat.id} 
                href={`/gallery/category/${cat.slug}`}
                className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-in fade-in zoom-in-95"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Background Image */}
                <Image 
                  src={cat.featured_image || '/images/hero-bg.jpg'} 
                  alt={cat.name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-green via-brand-green/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Content */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-[2px] bg-brand-gold"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">
                      {cat.album_count} {cat.album_count === 1 ? 'Album' : 'Albums'}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-white/60 text-xs line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 transition-transform">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-green scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats/Feature section */}
      <section className="bg-brand-cream/30 py-24 border-y border-brand-green/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Camera className="w-12 h-12 text-brand-gold mx-auto mb-8" />
          <h2 className="text-4xl font-black text-brand-green tracking-tight mb-6">A Window into Riverview Life</h2>
          <p className="text-lg text-brand-green/70 leading-relaxed font-medium">
            From the roaring cheers on the sports field to the quiet focus of the classroom, 
            our gallery captures the vibrant spirit of our students and the values that inspire them.
          </p>
        </div>
      </section>
    </div>
  );
}
