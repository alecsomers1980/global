"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// Horizontally-scrolling photo strip with prev/next arrows + a page-dot
// indicator, matching the reference room page's image carousel — square
// corners, no card/overlay, 3-up on desktop.
export default function RoomGallery({ images, alt }: { images: string[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pageCount = Math.max(1, Math.ceil(images.length / perPage));

  const scrollToPage = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(pageCount - 1, next));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setPage(clamped);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setPage(Math.round(track.scrollLeft / track.clientWidth));
  };

  if (images.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Array.from({ length: pageCount }).map((_, p) => (
          <div key={p} className="flex w-full shrink-0 snap-start gap-3">
            {images.slice(p * perPage, p * perPage + perPage).map((src, i) => (
              <div key={src} className="relative h-64 sm:h-80 flex-1 overflow-hidden bg-sand/40">
                <Image
                  src={src}
                  alt={`${alt} photo ${p * perPage + i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={p === 0 && i === 0}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photos"
            onClick={() => scrollToPage(page - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-line flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronIcon className="w-4 h-4 -scale-x-100" />
          </button>
          <button
            type="button"
            aria-label="Next photos"
            onClick={() => scrollToPage(page + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-line flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {Array.from({ length: pageCount }).map((_, p) => (
              <button
                key={p}
                type="button"
                aria-label={`Go to page ${p + 1}`}
                onClick={() => scrollToPage(p)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${p === page ? "bg-terracotta" : "bg-line"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
