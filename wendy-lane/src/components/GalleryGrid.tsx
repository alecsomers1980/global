"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export type GalleryItem = {
  src: string;
  caption: string;
  group: string;
};

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const show = useCallback(
    (dir: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + dir + items.length) % items.length,
      ),
    [items.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(1);
      if (e.key === "ArrowLeft") show(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, show]);

  const active = openIndex === null ? null : items[openIndex];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-card bg-gray-100 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={`View larger: ${item.caption}`}
          >
            <Image
              src={item.src}
              alt={item.caption}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-10">
              <span className="block font-semibold text-white">
                {item.caption}
              </span>
              <span className="text-xs text-white/70">{item.group}</span>
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={active.caption}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); show(-1); }}
            className="absolute left-2 sm:left-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Previous"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <figure
            className="relative max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={active.src}
                alt={active.caption}
                fill
                className="rounded-card object-contain"
                sizes="90vw"
              />
            </div>
            <figcaption className="mt-3 text-center text-white">
              <span className="font-semibold">{active.caption}</span>
              <span className="ml-2 text-white/60">· {active.group}</span>
            </figcaption>
          </figure>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); show(1); }}
            className="absolute right-2 sm:right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Next"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
