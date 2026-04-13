'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryLightboxProps {
  images: string[]
  businessName: string
}

export default function GalleryLightbox({ images, businessName }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const lightboxRef = useRef<HTMLDivElement>(null)

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }, [])

  const goToPrev = useCallback(() => {
    setIsTransitioning(true)
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 300)
  }, [images.length])

  const goToNext = useCallback(() => {
    setIsTransitioning(true)
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsTransitioning(false), 300)
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, closeLightbox, goToPrev, goToNext])

  const handleLightboxBackdropClick = (e: React.MouseEvent) => {
    if (e.target === lightboxRef.current) {
      closeLightbox()
    }
  }

  if (!images || images.length === 0) return null

  return (
    <div className="w-full">
      {/* Featured Image */}
      <div
        className="relative h-80 w-full cursor-pointer overflow-hidden rounded-[2rem] group border-2 border-primary/5 shadow-lg"
        onClick={() => openLightbox(activeIndex)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex]}
          alt={`${businessName} - Image ${activeIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
        <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold text-gray-800 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 shadow-lg">
          🔍 View full size
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((src, index) => (
            <button
              key={`thumb-${index}`}
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ease-out ${
                activeIndex === index
                  ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-lg'
                  : 'ring-1 ring-gray-200 opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${businessName} - Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          ref={lightboxRef}
          onClick={handleLightboxBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2.5 text-white transition-all duration-200 hover:bg-white/25 hover:rotate-90 hover:scale-110"
            aria-label="Close lightbox"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          {/* Previous Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrev()
            }}
            className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-all duration-200 hover:bg-white/25 hover:scale-110 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>

          {/* Next Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-all duration-200 hover:bg-white/25 hover:scale-110 backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight size={28} strokeWidth={2.5} />
          </button>

          {/* Main Lightbox Image */}
          <div
            className={`relative transition-all duration-300 ease-out ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeIndex]}
              alt={`${businessName} - Image ${activeIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
