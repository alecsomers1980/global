"use client";

import { useState } from 'react';
import Image from 'next/image';
import HeroHeader from "@/components/HeroHeader";

const allImages = [
  "IMG_8185.jpg", "IMG_8186.jpg", "IMG_8187.jpg", "IMG_8188.jpg", "IMG_8191.jpg", "IMG_8193.jpg", "IMG_8195.jpg", "IMG_8197.jpg",
  "IMG_8198.jpg", "IMG_8200.jpg", "IMG_8203.jpg", "IMG_8205.jpg", "IMG_8206.jpg", "IMG_8208.jpg", "IMG_8210.jpg", "IMG_8212.jpg",
  "IMG_8214.jpg", "IMG_8217.jpg", "IMG_8219.jpg", "IMG_8222.jpg", "IMG_8225.jpg", "IMG_8231.jpg", "IMG_8232.jpg",
  "IMG_8234.jpg", "IMG_8236.jpg", "IMG_8239.jpg", "IMG_8241.jpg", "IMG_8243.jpg", "IMG_8244.jpg", "IMG_8246.jpg",
  "IMG_8249.jpg", "IMG_8252.jpg", "IMG_8253.jpg", "IMG_8255.jpg", "IMG_8257.jpg", "IMG_8261.jpg", "IMG_8263.jpg",
  "IMG_8267.jpg", "IMG_8270.jpg", "IMG_8272.jpg", "IMG_8275.jpg", "IMG_8278.jpg", "IMG_8279.jpg", "IMG_8281.jpg",
  "IMG_8283.jpg", "IMG_8287.jpg", "IMG_8288.jpg", "IMG_8290.jpg", "IMG_8292.jpg", "IMG_8293.jpg", "IMG_8294.jpg"
].map(f => `/images/accommodation/${f}`);

export default function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="bg-linen min-h-screen pb-20">
      <HeroHeader
        eyebrow="Visual Journey"
        title="Photo Gallery"
        description="Take a look at the serene beauty and accommodations at Mountain Creek Lodge."
      />

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-16">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {allImages.map((src, index) => (
            <div 
              key={index}
              className="relative overflow-hidden group cursor-pointer break-inside-avoid bg-primary/5 rounded-sm"
              onClick={() => openLightbox(index)}
            >
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-[5] pointer-events-none flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>

              <Image
                src={src}
                alt={`Mountain Creek Lodge Gallery Image ${index + 1}`}
                width={800}
                height={600}
                quality={90}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[110]"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 z-[110]"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image Container */}
          <div className="relative w-full max-w-7xl h-[85vh] mx-4 md:mx-24" onClick={(e) => e.stopPropagation()}>
            <Image
              src={allImages[lightboxIndex]}
              alt={`Fullscreen image ${lightboxIndex + 1}`}
              fill
              quality={95}
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 z-[110]"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 font-sans tracking-widest text-sm z-[110]">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </main>
  );
}
