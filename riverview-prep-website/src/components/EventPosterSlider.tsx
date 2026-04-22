"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

interface EventBanner {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
}

export default function EventPosterSlider() {
  const [eventBanners, setEventBanners] = useState<EventBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  async function fetchFeaturedEvents() {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const today = new Date(todayStr);

      // Fetch all featured events that are not drafts
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_featured', true)
        .neq('status', 'draft')
        .order('created_at', { ascending: false });

      if (data) {
        // Filter in JS to handle NULL dates and various statuses correctly
        const filteredData = data.filter((event: any) => {
          const displayStart = event.display_start_date ? new Date(event.display_start_date) : null;
          const displayEnd = event.display_end_date ? new Date(event.display_end_date) : null;
          const eventDate = event.event_date ? new Date(event.event_date) : null;

          // 1. If we have explicit display dates, respect them
          if (displayStart && displayEnd) {
            return new Date(todayStr) >= displayStart && new Date(todayStr) <= displayEnd;
          }

          // 2. If no display dates but we have an event date, show it if it's in the future (or today)
          if (eventDate) {
            return eventDate >= today;
          }

          // 3. Fallback: just show it if it's featured and not a draft
          return true;
        });

        const banners: EventBanner[] = filteredData.map((event: any) => {
          const primaryImage = event.images?.find((img: any) => img.is_primary)?.url || 
                              event.images?.[0]?.url || 
                              "/images/placeholder-event.jpg";
          
          return {
            id: event.id,
            src: primaryImage,
            title: event.title,
            subtitle: event.description?.substring(0, 80) + "...",
            tag: event.category || "Event",
            href: `/events/${event.slug || event.id}`,
          };
        });
        setEventBanners(banners);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (eventBanners.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % eventBanners.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, [eventBanners]);

  if (loading) {
    return (
      <div className="relative aspect-[3/4.2] rounded-tr-[5rem] rounded-bl-[5rem] overflow-hidden shadow-2xl border-4 border-white bg-brand-cream/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold opacity-20" />
      </div>
    );
  }

  if (eventBanners.length === 0) {
    return (
      <div className="relative aspect-[3/4.2] rounded-tr-[5rem] rounded-bl-[5rem] overflow-hidden shadow-2xl border-4 border-white bg-brand-green/5 flex items-center justify-center p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-brand-gold -rotate-45" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/40">Upcoming Events</p>
          <p className="text-xs font-bold text-brand-green/30 italic">Check back soon for new events and cultural highlights.</p>
        </div>
      </div>
    );
  }

  const activeBanner = eventBanners[currentIndex];

  return (
    <div className="relative aspect-[3/4.2] rounded-tr-[5rem] rounded-bl-[5rem] overflow-hidden shadow-2xl border-4 border-white group">
      
      {/* Absolute image layers for fade effect */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}>
        <Image
          src={activeBanner.src}
          alt={activeBanner.title}
          fill
          className="object-cover object-top hover:scale-105 transition-transform duration-1000"
          priority={currentIndex === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-green/95 via-brand-green/40 to-transparent" />
      </div>

      {/* Indicators */}
      {eventBanners.length > 1 && (
        <div className="absolute top-6 right-8 flex gap-2 z-20">
          {eventBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === i ? 'bg-brand-gold w-5' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Poster Content */}
      <div className={`absolute bottom-10 left-8 right-8 text-white z-10 flex flex-col items-start transition-all duration-700 ${isTransitioning ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-brand-gold text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
            {activeBanner.tag}
          </span>
        </div>
        
        <h3 className="text-3xl font-bold mb-2 leading-tight tracking-tight drop-shadow-lg">
          {activeBanner.title}
        </h3>
        
        <p className="text-white/80 text-xs mb-5 max-w-sm drop-shadow-md">
          {activeBanner.subtitle}
        </p>

        <a 
          href={activeBanner.href}
          className="px-6 py-2.5 bg-white text-brand-green rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all duration-300 flex items-center gap-2 shadow-md group/btn"
        >
          Find out more
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}
