"use client";

import { useReducedMotion } from "framer-motion";

type Props = {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle?: string;
  video?: string;
};

export default function PageBanner({
  eyebrow,
  title,
  accent,
  subtitle,
  video = "/videos/lavender-banner.mp4",
}: Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative min-h-[260px] md:min-h-[320px] flex items-end">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={video}
          muted
          loop
          playsInline
          autoPlay={!prefersReducedMotion}
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/85 via-forest/55 to-forest/20" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 pt-20">
          <div className="max-w-2xl">
          <p className="tracking-[0.3em] text-[11px] font-medium text-aurora-gold">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl text-white">
            {title}
            {accent ? (
              <>
                {" "}
                <em className="italic text-aurora-gold">{accent}</em>
              </>
            ) : null}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed">
              {subtitle}
            </p>
          ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
