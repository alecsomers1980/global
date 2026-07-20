"use client";

import { useReducedMotion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import Link from "next/link";

export default function VideoBanner() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="px-6 max-w-7xl mx-auto py-16">
      <Reveal>
        <div className="relative min-h-[480px] overflow-hidden rounded-[32px] flex items-center">
          <video
            src="/videos/botanical-banner.mp4"
            muted
            loop
            playsInline
            autoPlay={!prefersReduced}
            preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 object-cover w-full h-full"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-forest/85 via-forest/45 to-transparent" />

          <div className="relative z-10 p-10 md:p-16 max-w-xl">
            <p className="tracking-[0.3em] text-[11px] font-medium text-aurora-gold">
              FROM THE GARDENS OF MPUMALANGA
            </p>

            <h2 className="mt-4 text-4xl md:text-5xl text-white leading-tight">
              Grown by nature.{" "}
              <em className="italic text-aurora-gold">Made by hand.</em>
            </h2>

            <p className="mt-4 text-white/80 leading-relaxed">
              Every cream, serum and soap starts with plants we know by name — blended in small batches, never rushed, never tested on animals.
            </p>

            <Link
              href="/shop"
              className="btn-glow rounded-full px-8 py-4 text-sm font-semibold inline-block mt-7"
            >
              Explore the range
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
