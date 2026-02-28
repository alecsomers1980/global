'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroBanner() {
    return (
        <section className="relative h-screen w-full bg-black flex items-center overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/cinematic-hero.png"
                    alt="Aloe Signs Cinematic Workshop"
                    fill
                    className="object-cover opacity-60 scale-110 animate-[pulse-slow_20s_infinite]"
                    priority
                />
                {/* Cinematic Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E0D] via-transparent to-black/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E0D] via-transparent to-transparent z-10" />
            </div>

            {/* Content Container */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-20">
                <div className="max-w-4xl">
                    {/* Floating Accent Tag */}
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8 animate-fadeIn">
                        <span className="w-2 h-2 rounded-full bg-vibrant-emerald animate-pulse"></span>
                        <span className="text-[10px] md:text-xs font-black tracking-[0.3em] text-white/60 uppercase">
                            South Africa's Premier Branding Partner
                        </span>
                    </div>

                    {/* Main High-Impact Heading */}
                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter mb-8 animate-fadeIn">
                        BIG. BOLD.<br />
                        <span className="text-vibrant-emerald">UNMISSABLE.</span>
                    </h1>

                    {/* Cinematic Description */}
                    <p className="text-xl md:text-3xl font-medium text-white/80 mb-12 max-w-2xl leading-relaxed animate-fadeIn">
                        From massive billboards to custom vehicle wraps — we build branding that demands attention and drives growth.
                    </p>

                    {/* High-Action CTAs */}
                    <div className="flex flex-wrap gap-6 animate-fadeIn">
                        <Link
                            href="/get-quote"
                            className="group relative px-10 py-5 bg-vibrant-emerald text-black font-black rounded-full text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(74,222,128,0.3)] hover:shadow-[0_0_50px_rgba(74,222,128,0.5)]"
                        >
                            <span className="relative z-10">GET A FREE QUOTE</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </Link>

                        <Link
                            href="/portfolio"
                            className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-full text-xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
                        >
                            VIEW PORTFOLIO
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1">
                    <div className="w-1 h-2 bg-vibrant-emerald rounded-full"></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1.1); }
                    50% { transform: scale(1.15); }
                }
                .animate-fadeIn {
                    animation: fadeIn 1s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}

