"use client";

import { useState } from "react";
import Image from "next/image";
import HeroHeader from "@/components/HeroHeader";

const galleryImages = [
  "IMG-20241029-WA0008.jpg", "IMG-20241029-WA0009.jpg", "IMG-20241029-WA0010.jpg",
  "IMG-20241029-WA0011.jpg", "IMG-20241029-WA0012.jpg", "IMG-20241029-WA0013.jpg",
  "IMG-20241029-WA0014.jpg", "IMG-20241029-WA0018.jpg", "IMG-20241029-WA0019.jpg",
  "IMG-20241029-WA0020.jpg", "IMG-20241029-WA0022.jpg", "IMG-20241029-WA0023.jpg",
  "IMG-20241029-WA0024.jpg", "IMG-20241029-WA0026.jpg",
  "IMG-20241029-WA0027.jpg", "IMG-20241029-WA0028.jpg", "IMG-20241029-WA0029.jpg",
  "IMG-20241029-WA0031.jpg", "IMG-20241029-WA0032.jpg", "IMG-20241029-WA0033.jpg",
  "IMG-20241029-WA0035.jpg", "IMG-20241029-WA0036.jpg", "IMG-20241029-WA0037.jpg",
  "IMG-20241029-WA0038.jpg", "IMG-20241029-WA0039.jpg", "IMG-20241029-WA0042.jpg",
  "IMG-20241029-WA0045.jpg", "IMG-20241029-WA0046.jpg", "IMG-20241029-WA0048.jpg",
  "IMG-20241029-WA0049.jpg", "IMG-20241029-WA0050.jpg", "IMG-20241029-WA0051.jpg",
  "IMG-20241029-WA0052.jpg", "IMG-20241029-WA0053.jpg", "IMG-20241029-WA0054.jpg",
  "IMG-20241029-WA0055.jpg", "IMG-20241029-WA0056.jpg", "IMG-20241029-WA0057.jpg",
  "IMG-20241029-WA0058.jpg", "IMG-20241029-WA0059.jpg", "IMG-20241029-WA0060.jpg",
  "IMG-20241029-WA0061.jpg", "IMG-20241029-WA0062.jpg", "IMG-20241029-WA0063.jpg",
  "IMG-20241029-WA0064.jpg", "IMG-20241029-WA0065.jpg", "IMG-20241029-WA0066.jpg",
  "IMG-20241029-WA0067.jpg", "IMG-20241029-WA0068.jpg", "IMG-20241029-WA0098.jpg",
  "WhatsApp-Image-2024-10-29-at-07.52.10_4e6e14b6.jpg"
].map(f => `/images/Red Litchi/Gallery/${f}`);

export default function RedLitchiPage() {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="bg-linen min-h-screen">
      <HeroHeader
        eyebrow="Mountaincreek Lodge"
        title="Red Litchi Farm Café"
        description="An exquisite dining experience nestled within the scenic Sabie River Valley."
      >
        <div className="flex flex-col items-center gap-8 mt-8">
          <div className="relative w-40 h-40 md:w-48 md:h-48">
            <Image
              src="/images/Red Litchi/logo.png"
              alt="Red Litchi Farm Cafe Logo"
              fill
              quality={100}
              unoptimized={true}
              className="object-contain"
            />
          </div>
          <a
            href="#menu"
            className="inline-block bg-[var(--color-terracotta)] text-white px-8 py-3.5 font-semibold tracking-widest text-sm hover:opacity-90 transition-opacity"
          >
            VIEW MENU
          </a>
        </div>
      </HeroHeader>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <h2 className="font-serif text-3xl md:text-5xl text-primary mb-6">
              More than just a place to dine.
            </h2>
            <p className="font-sans text-primary/80 text-lg leading-relaxed mb-6">
              Our restaurant is an integral part of the enchanting bed and breakfast experience offered by the lodge. 
              Whether you are waking up to a fresh cup of locally roasted coffee or settling in for a hearty farm-style meal, 
              every dish is crafted with care and a touch of Lowveld hospitality.
            </p>
            <p className="font-sans text-primary/80 text-lg leading-relaxed mb-10">
              Surrounded by lush greenery and the peaceful ambiance of the estate, the Red Litchi Farm Café is the perfect 
              spot to unwind after a day of exploring the Panorama Route or the Kruger National Park.
            </p>

            <div className="flex gap-4">
              <a
                href="/contact"
                className="bg-primary text-linen px-8 py-3 font-semibold tracking-widest text-sm hover:bg-primary/90 transition-colors"
              >
                MAKE A BOOKING
              </a>
            </div>
          </div>

          {/* Trading Hours Card */}
          <div className="bg-white p-10 md:p-14 shadow-[0_8px_40px_-12px_rgba(26,47,35,0.08)] rounded-sm relative">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="font-serif text-2xl text-primary mb-2">Trading Hours</h3>
            <p className="font-sans text-primary/60 text-sm mb-8 uppercase tracking-widest">When to visit us</p>
            
            <ul className="space-y-4 font-sans text-primary/80">
              <li className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="font-semibold text-primary">Monday</span>
                <span className="text-red-500/80 font-medium">Closed</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="font-semibold text-primary">Tuesday</span>
                <span>9:00 AM – 3:30 PM</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="font-semibold text-primary">Wednesday</span>
                <span>9:00 AM – 3:30 PM</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="font-semibold text-primary">Thursday</span>
                <span>9:00 AM – 3:30 PM</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="font-semibold text-primary">Friday</span>
                <span>9:00 AM – 3:30 PM</span>
              </li>
              <li className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="font-semibold text-primary">Saturday</span>
                <span>9:00 AM – 3:30 PM</span>
              </li>
              <li className="flex justify-between items-center py-2">
                <span className="font-semibold text-primary">Sunday</span>
                <span>9:00 AM – 2:00 PM</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-white py-20 px-6 md:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto mb-14 text-center">
          <h2 className="font-serif text-4xl text-primary mb-4">A Taste of Red Litchi</h2>
          <p className="font-sans text-primary/70 text-lg max-w-2xl mx-auto">
            Take a look at some of our delicious offerings and the cozy atmosphere of the café.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {galleryImages.map((src, index) => (
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
                  alt={`Red Litchi Gallery Image ${index + 1}`}
                  width={800}
                  height={600}
                  quality={100}
                  unoptimized={true}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="bg-primary/5 py-24 text-center px-6">
        <h2 className="font-serif text-4xl text-primary mb-6">Our Menu</h2>
        <p className="font-sans text-primary/70 text-lg max-w-2xl mx-auto mb-10">
          Discover our selection of freshly brewed coffees, hearty breakfasts, and light lunches crafted with local ingredients.
        </p>
        <a 
          href="/Red%20Litchi%20Official%20Menu.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[var(--color-terracotta)] text-white px-10 py-4 font-semibold tracking-widest text-sm hover:opacity-90 transition-opacity shadow-md"
        >
          VIEW OFFICIAL MENU
        </a>
      </section>

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
              src={galleryImages[lightboxIndex]}
              alt={`Fullscreen image ${lightboxIndex + 1}`}
              fill
              quality={100}
              unoptimized={true}
              className="object-contain"
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
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

    </main>
  );
}
