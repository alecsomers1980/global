"use client";

import { useReducedMotion } from "framer-motion";

/**
 * The one dark moment on the page — the client's own farm footage.
 *
 * Clip is muted, looped and 8s. Under prefers-reduced-motion the poster frame
 * is shown instead, so the section still reads without any movement.
 */
export function VideoBand() {
  const reduced = useReducedMotion();

  return (
    <section className="relative h-[420px] overflow-hidden bg-dark-band md:h-[560px]">
      {reduced ? (
        <img
          src="/video/hero-field.jpg"
          alt="Rehoboth farm workers harvesting artemisia"
          className="h-full w-full object-cover opacity-70"
        />
      ) : (
        <video
          className="h-full w-full object-cover opacity-70"
          src="/video/hero-field.mp4"
          poster="/video/hero-field.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Rehoboth farm workers harvesting artemisia"
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,32,28,0.52) 0%, rgba(16,32,28,0.82) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6 text-center">
        <span className="text-xs uppercase tracking-[0.24em] text-[#9CCBBA]">
          Low&rsquo;s Creek, Mpumalanga
        </span>
        <h2 className="max-w-[840px] font-display text-3xl leading-tight text-brand-ink md:text-[56px]">
          Grown, dried and packed
          <br />
          on one farm in Mpumalanga.
        </h2>
      </div>
    </section>
  );
}
