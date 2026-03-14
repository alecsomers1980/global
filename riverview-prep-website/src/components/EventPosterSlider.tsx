"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const eventBanners = [
  {
    id: 1,
    src: "/images/oliver-with-a-twist.jpg",
    title: "Oliver with a Twist",
    subtitle: "Annual Grade 4-7 High School Play",
    tag: "Cultural Highlight",
    href: "/news/12-march-2026", // Example link mapped to news
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=1200&auto=format&fit=crop",
    title: "Annual Golf Day 2026",
    subtitle: "Join us at Malelane Golf Club for our fundraiser.",
    tag: "Fundraiser",
    href: "/calendar",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1501555088652-02191be7164b?q=80&w=1200&auto=format&fit=crop",
    title: "Kruger National Park Camp",
    subtitle: "Grade 6 & 7 wildlife and team building retreat.",
    tag: "Academic",
    href: "/calendar",
  },
];

export default function EventPosterSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (eventBanners.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % eventBanners.length);
        setIsTransitioning(false);
      }, 500); // Wait for fade out to complete before changing src info
    }, 6000); // 6 Secs cycle

    return () => clearInterval(interval);
  }, []);

  const activeBanner = eventBanners[currentIndex];

  return (
    <div className="relative aspect-[3/4.2] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group">
      
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

      {/* Decorative dots / indicators */}
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
        
        <h3 className="text-3xl font-bold mb-2 leading-tight tracking-tight">
          {activeBanner.title}
        </h3>
        
        <p className="text-white/80 text-xs mb-5 max-w-sm">
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
