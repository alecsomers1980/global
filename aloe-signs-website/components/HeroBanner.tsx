'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
    {
        id: 1,
        seoH1: 'Branding, Printing & Signage Company in South Africa',
        title: 'BIG. BOLD. UNMISSABLE BRANDING.',
        description: 'From billboards to banners — we put your brand everywhere.',
        primaryCTA: { text: 'Get a Quote', href: '/get-quote' },
        secondaryCTA: { text: 'View Our Work', href: '#work' },
        location: 'High-impact visual branding built to be seen.'
    }
];

export default function HeroBanner() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/images?folder=banner')
            .then(res => res.json())
            .then(data => {
                if (data.images && data.images.length > 0) {
                    setImages(data.images);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // Removed auto-play logic to keep static bold hero

    const activeSlide = slides[currentSlide];

    // Get a random image for the slide if available, otherwise fallback
    // Use modulo to cycle through images based on slide ID to keep it consistent per session?
    // Or just random? Consistent is better.
    const bgImage = images.length > 0
        ? images[currentSlide % images.length]
        : '/images/hero-banner.jpg';

    return (
        <section className="relative h-[65vh] md:h-[70vh] bg-charcoal flex items-center overflow-hidden">
            {/* Left Side Background - Hexagon Honeycomb Collage */}
            <div className="absolute inset-0 w-full md:w-[60%] h-full z-0 overflow-visible opacity-30 md:opacity-100 flex items-center justify-center -translate-x-[5%] pointer-events-none md:pointer-events-auto">
                <div className="relative pointer-events-auto">

                    {/* Center Hexagon */}
                    <div
                        className="absolute top-1/2 left-1/2 w-[220px] md:w-[320px] aspect-[0.866] bg-cover bg-center transition-transform hover:scale-[1.03] duration-500 z-20 shadow-[0_0_30px_rgba(0,0,0,0.4)]"
                        style={{ transform: "translate(-50%, -50%)", backgroundImage: `url('/images/portfolio/billboards-main.jpg')`, clipPath: "polygon(50% 2%, 98% 25%, 98% 75%, 50% 98%, 2% 75%, 2% 25%)" }}
                    />

                    {/* Top Right Hexagon */}
                    <div
                        className="absolute top-1/2 left-1/2 w-[220px] md:w-[320px] aspect-[0.866] bg-cover bg-center transition-transform hover:scale-[1.03] hover:z-30 duration-500 z-10"
                        style={{ transform: "translate(0%, -125%)", backgroundImage: `url('/images/portfolio/vehicle-rapping-main.jpg')`, clipPath: "polygon(50% 2%, 98% 25%, 98% 75%, 50% 98%, 2% 75%, 2% 25%)" }}
                    />

                    {/* Top Left Hexagon */}
                    <div
                        className="absolute top-1/2 left-1/2 w-[220px] md:w-[320px] aspect-[0.866] bg-cover bg-center transition-transform hover:scale-[1.03] hover:z-30 duration-500 z-10"
                        style={{ transform: "translate(-100%, -125%)", backgroundImage: `url('/images/portfolio/shop-front-main.jpg')`, clipPath: "polygon(50% 2%, 98% 25%, 98% 75%, 50% 98%, 2% 75%, 2% 25%)" }}
                    />

                    {/* Bottom Right Hexagon - Image */}
                    <div
                        className="absolute top-1/2 left-1/2 w-[220px] md:w-[320px] aspect-[0.866] bg-cover bg-center transition-transform hover:scale-[1.03] hover:z-30 duration-500 z-10"
                        style={{ transform: "translate(0%, 25%)", backgroundImage: `url('/images/portfolio/set-building-main.jpg')`, clipPath: "polygon(50% 2%, 98% 25%, 98% 75%, 50% 98%, 2% 75%, 2% 25%)" }}
                    />

                    {/* Bottom Left Hexagon */}
                    <div
                        className="absolute top-1/2 left-1/2 w-[220px] md:w-[320px] aspect-[0.866] bg-cover bg-center transition-transform hover:scale-[1.03] hover:z-30 duration-500 z-10"
                        style={{ transform: "translate(-100%, 25%)", backgroundImage: `url('/images/portfolio/large-format-print-main.jpg')`, clipPath: "polygon(50% 2%, 98% 25%, 98% 75%, 50% 98%, 2% 75%, 2% 25%)" }}
                    />

                    {/* Far Left Middle Hexagon */}
                    <div
                        className="absolute top-1/2 left-1/2 w-[220px] md:w-[320px] aspect-[0.866] bg-cover bg-center transition-transform hover:scale-[1.03] hover:z-30 duration-500 z-0"
                        style={{ transform: "translate(-150%, -50%)", backgroundImage: `url('/images/portfolio/building-signage-main.jpg')`, clipPath: "polygon(50% 2%, 98% 25%, 98% 75%, 50% 98%, 2% 75%, 2% 25%)" }}
                    />
                </div>
            </div>

            {/* Dark Overlay - Protects text readability ONLY on the right side */}
            <div className="absolute inset-0 bg-charcoal/80 md:bg-transparent md:bg-gradient-to-l md:from-charcoal md:via-charcoal/95 md:to-transparent md:w-[50%] md:left-auto md:right-0 z-10" />



            {/* Content - Right Aligned on Desktop */}
            <div className="relative h-full w-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center items-center md:items-end z-20">
                <div className="max-w-2xl text-center md:text-right flex flex-col items-center md:items-end">
                    <div
                        key={activeSlide.id}
                        className="animate-fadeIn w-full flex flex-col items-center md:items-end"
                    >
                        {/* SEO H1 Tag */}
                        <h1 className="text-aloe-green font-bold tracking-widest uppercase text-sm md:text-md mb-4 flex items-center justify-center md:justify-end gap-3 w-full">
                            <span className="md:hidden w-8 h-1 bg-aloe-green block"></span>
                            {activeSlide.seoH1}
                            <span className="hidden md:block w-8 h-1 bg-aloe-green"></span>
                        </h1>

                        {/* Main Big, Loud Title */}
                        <h2 className="text-3xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 uppercase leading-none tracking-tight">
                            {activeSlide.title}
                        </h2>

                        {/* Power Sub-line */}
                        <p className="text-2xl md:text-3xl font-medium text-white/90 mb-10 max-w-xl">
                            {activeSlide.description}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-8 w-full">
                            <Link
                                href={activeSlide.primaryCTA.href}
                                className="px-10 py-5 bg-aloe-green text-charcoal font-black rounded uppercase tracking-wider hover:bg-white transition-colors text-lg md:text-xl shadow-[0_0_20px_rgba(202,238,166,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.7)]"
                            >
                                {activeSlide.primaryCTA.text}
                            </Link>
                        </div>

                        <p className="text-white/50 font-semibold uppercase tracking-widest text-sm text-center md:text-right w-full">
                            {activeSlide.location}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
