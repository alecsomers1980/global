"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ken Burns parallax on the banner image
      if (bannerRef.current) {
        gsap.fromTo(
          bannerRef.current,
          { scale: 1.08, transformOrigin: "center center" },
          {
            scale: 1.0,
            duration: 12,
            ease: "none",
            repeat: -1,
            yoyo: true,
          }
        );
      }

      // Hero content stagger entrance
      gsap.from(".hero-content > *", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-green">
      {/* Ken Burns Banner Background */}
      <div ref={bannerRef} className="absolute inset-0 z-0 will-change-transform">
        {/* Try local banner.jpg first, fall back to Unsplash */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/banner.jpg'), url('https://images.unsplash.com/photo-1541339907198-e08756eaa589?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-green/75 via-brand-green/50 to-brand-green/90" />
      </div>

      {/* Noise overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
      }} />

      <div className="container mx-auto px-6 relative z-20 pt-24">
        <div className="max-w-4xl mx-auto text-center hero-content">
          <div className="inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/5 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
            <span className="telemetry-monospace text-brand-gold text-[10px]">ESTABLISHED IN 1996 · MALELANE, MPUMALANGA</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tight mb-8 leading-[0.9]">
            Heritage is the <br />
            <span className="drama-text text-brand-gold text-6xl md:text-9xl">INSPIRATION.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            Fostering cognitive, physical, emotional, and social excellence in a safe, caring, and stimulating environment.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a href="/admissions" className="magnetic-button group flex items-center gap-3">
              Enrol Your Child
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/about" className="px-8 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors text-sm">
              Discover Our Story
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 z-20">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/30 animate-pulse" />
        <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
      </div>
    </section>
  );
}
