'use client';

import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
  children: React.ReactNode;
  ariaLabel: string;
  pages?: number;
};

export function Carousel({ children, ariaLabel, pages = 3 }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentPage(page);
  }, []);

  const scrollBy = (direction: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const delta = direction === 'next' ? el.clientWidth : -el.clientWidth;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Scrollable track */}
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Chevron buttons (lg+) */}
      <button
        onClick={() => scrollBy('prev')}
        aria-label="Previous"
        className="absolute top-1/2 -translate-y-1/2 -left-10 hidden lg:flex items-center justify-center p-2 text-ink/50 hover:text-ink transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => scrollBy('next')}
        aria-label="Next"
        className="absolute top-1/2 -translate-y-1/2 -right-10 hidden lg:flex items-center justify-center p-2 text-ink/50 hover:text-ink transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: pages }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === currentPage ? 'bg-amber' : 'bg-ink/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
