'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openIndex, close, prev, next]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {images.map((url, i) => (
          <button
            key={url + i}
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 focus:outline-none focus:ring-2 focus:ring-aloe-green"
          >
            <img
              src={url}
              alt={`${title} — image ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Previous"
                className="absolute left-3 md:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Next"
                className="absolute right-3 md:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <img
            src={images[openIndex]}
            alt={`${title} — image ${openIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl"
          />

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {openIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
