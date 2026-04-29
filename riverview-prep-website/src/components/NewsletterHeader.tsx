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
  excerpt?: string;
  fullHeight?: boolean;
}

export default function NewsletterHeader({
  issue,
  date,
  term,
  title,
  highlights = [],
  compact = false,
  excerpt,
  fullHeight = false,
}: NewsletterHeaderProps) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-gray-50 border border-brand-green/10 ${
        fullHeight ? "h-full min-h-[16rem]" : compact ? "min-h-[10rem]" : "min-h-[14rem]"
      } flex items-stretch`}
    >
      {/* 1. Left Section: Content & Logo watermark */}
      <div className={`w-full ${compact ? 'md:w-[70%]' : 'md:w-[60%]'} h-full flex flex-col justify-center p-6 lg:p-8 z-10 relative overflow-hidden`}>
        
        {/* Background Logo Watermark */}
        <div className="absolute inset-y-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-start -translate-x-12">
           <Image
              src="/images/logo.png"
              alt="Riverview Prep Logo Watermark"
              width={350}
              height={350}
              className="object-contain"
            />
        </div>

        <div className="flex flex-col h-full justify-between z-10 relative">
          
          <div className={`flex items-center gap-3 ${compact ? 'mb-1' : 'mb-3'}`}>
             <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-8 h-[2px] bg-brand-gold"></span>
                  <h2 className={`font-black uppercase tracking-[0.3em] text-brand-green leading-none ${compact ? 'text-xs' : 'text-sm'}`}>
                    The Riverview Reporter
                  </h2>
                </div>
                <div className={`flex flex-wrap gap-x-4 gap-y-1 font-bold uppercase tracking-widest text-brand-green/40 ${compact ? 'text-[8px]' : 'text-[10px]'} mt-1`}>
                  {term && <span className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-gold rounded-full"></span> {term}</span>}
                  {issue && <span className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-gold rounded-full"></span> {issue}</span>}
                  <span className="flex items-center gap-2"><span className="w-1 h-1 bg-brand-gold rounded-full"></span> {date}</span>
                </div>
             </div>
          </div>

          <div className={`${compact ? 'pt-1 space-y-1' : 'pt-2 space-y-3'} z-10 max-w-xl`}>
            <h3 className={`font-serif font-black text-brand-green leading-tight pr-8 ${compact ? 'text-lg' : 'text-4xl'}`}>
              {title}
            </h3>
            
            {!compact && highlights.length > 0 && (
              <div className="space-y-1 pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A84E]">Highlights</p>
                <div className="flex flex-wrap gap-2">
                  {highlights.map((h, i) => (
                    <span key={i} className="text-[11px] font-medium text-gray-600 flex items-center gap-1.5 bg-white py-1 px-2 rounded-md shadow-sm border border-gray-100">
                      <span className="w-1.5 h-1.5 bg-[#1B5E20] rounded-sm transform rotate-45" /> {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!compact && excerpt && (
              <p className="text-sm text-gray-600 leading-relaxed pt-2 max-w-xl line-clamp-2 md:line-clamp-3">
                {excerpt}
              </p>
            )}
          </div>
          
        </div>
      </div>

      {/* 2. Right Section: Overlapping Chevron Graphics */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[55%] h-full pointer-events-none">
        
        {/* Layer 1: Background Light Accent (Lime) */}
        <div 
          className="absolute inset-y-0 right-0 w-[120%] bg-[#A4C639]/20 transform translate-x-[20%]"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)' }}
        />

        {/* Layer 2: White Outline Stripe */}
        <div 
          className="absolute inset-y-0 right-0 w-[120%] bg-white transform translate-x-[27%]"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)' }}
        />

        {/* Layer 3: Main Forest Green Chevron */}
        <div 
          className="absolute inset-y-0 right-0 w-[120%] bg-[#1B5E20] transform translate-x-[29%]"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)' }}
        />

        {/* Layer 4: Dark green overlapping inner chevron */}
        <div 
          className="absolute inset-y-0 right-0 w-[120%] bg-[#124216] transform translate-x-[55%]"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)' }}
        />
        
        {/* Subtle accent line on the dark chevron */}
        <div 
          className="absolute inset-y-0 right-0 w-[120%] bg-[#C8A84E]/20 transform translate-x-[57%]"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)' }}
        />

      </div>
    </div>
  );
}
