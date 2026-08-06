'use client';

import { useEffect, useRef } from 'react';
import { getGSAP, prefersReducedMotion } from '@/lib/motion/gsap';

interface ColourSweepProps {
  colours: { name: string; hex: string }[];
}

export default function ColourSweep({ colours }: ColourSweepProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion()) return;

    const { gsap } = getGSAP();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop and up: pin the section and drive the strip horizontally.
      mm.add('(min-width: 768px)', () => {
        const distance = track.scrollWidth - section.clientWidth;
        if (distance <= 0) return;

        const tween = gsap.to(track, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance}`,
            scrub: 1,
            pin: true,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
      // Below 768px: no ScrollTrigger at all -- the track is a plain
      // overflow-x-auto strip (see JSX), so it's swipeable natively.
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative overflow-hidden bg-surface py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Every colour</p>
        <h2 className="display mt-2 text-4xl md:text-5xl text-text">Six colours. One boot.</h2>
      </div>
      <div
        ref={trackRef}
        className="flex gap-6 px-4 md:px-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 [scrollbar-width:thin]"
      >
        {colours.map((colour) => (
          <div
            key={colour.name}
            className="shrink-0 w-56 md:w-72 flex flex-col items-center gap-4"
          >
            <div
              className="w-full aspect-square rounded-full border border-text/20"
              style={{ backgroundColor: colour.hex }}
              aria-hidden="true"
            />
            <span className="text-sm uppercase tracking-[0.2em] text-text">
              {colour.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
