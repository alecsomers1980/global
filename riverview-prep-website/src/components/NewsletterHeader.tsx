import React from "react";
import Image from "next/image";

interface NewsletterHeaderProps {
  issue?: string;
  date: string;
  category: string;
  title: string;
  highlights?: string[];
  term?: string;
  compact?: boolean;
}

export default function NewsletterHeader({
  issue,
  date,
  category,
  term,
  title,
  highlights = [],
  compact = false,
}: NewsletterHeaderProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-white border border-brand-green/10 ${
        compact ? "h-64" : "h-72"
      } flex`}
    >
      {/* 1. Left Section: Logo (White Background) */}
      <div className="w-1/4 h-full flex items-center justify-center p-6 bg-white z-10">
        <div className="relative w-full h-full max-h-32">
          <Image
            src="/images/logo.png"
            alt="Riverview Prep Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* 2. Middle Section: Geometric "N" Stripes */}
      <div className="relative w-1/4 h-full overflow-hidden bg-brand-green">
        {/* Middle diagonal of the N */}
        <div 
          className="absolute inset-0 bg-[#A4C639] skew-x-[-25deg] transform origin-top h-[150%] -translate-y-[10%] translate-x-[20%] w-[40%] z-10 shadow-2xl"
        />
        {/* Accent stripe */}
        <div 
          className="absolute inset-0 bg-[#C8A84E] skew-x-[-25deg] transform origin-top h-[150%] -translate-y-[10%] translate-x-[-10%] w-[10%]"
        />
      </div>

      {/* 3. Right Section: Content (White Background) */}
      <div className="flex-1 h-full bg-white flex flex-col justify-center p-8 z-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">
            Newsletter
          </h2>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold uppercase tracking-widest text-brand-green/60">
            {term && <span>{term}</span>}
            {issue && <span>{issue}</span>}
            <span>{date}</span>
          </div>

          <div className="pt-4 space-y-3">
            <h3 className="text-lg font-bold text-brand-green leading-snug line-clamp-2">
              {title}
            </h3>
            
            {highlights.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">Highlights</p>
                <div className="flex flex-wrap gap-2">
                  {highlights.map((h, i) => (
                    <span key={i} className="text-[11px] font-medium text-brand-green/80 flex items-center gap-1">
                      <span className="w-1 h-1 bg-brand-gold rounded-full" /> {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Finishing "N" - Background white overlap on the right of the stripes */}
      <div className="absolute top-0 right-[50%] bottom-0 w-[5%] bg-white skew-x-[-20deg] transform translate-x-[-100%]" />
    </div>
  );
}
