'use client';

import { useEffect, useRef } from 'react';
import { getGSAP, prefersReducedMotion } from '@/lib/motion/gsap';

interface ColourSweepProps {
  colours: { name: string; hex: string }[];
}

export default function ColourSweep({ colours }: ColourSweepProps) {
  const driverRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const driver = driverRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!driver || !sticky || !track || prefersReducedMotion()) return;

    const { gsap } = getGSAP();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop and up: CSS position:sticky holds the strip in place while
      // the driver wrapper below provides the extra scroll room; GSAP only
      // drives the horizontal transform via scrub -- no `pin` option. GSAP's
      // pin:true inserts a "pin-spacer" wrapper into the DOM outside React's
      // tracking, which crashes React's unmount reconciliation with a
      // `removeChild` NotFoundError the moment you navigate away while the
      // pin is engaged. Sticky avoids that entirely: it's pure CSS, GSAP
      // never restructures the DOM.
      mm.add('(min-width: 768px)', () => {
        const distance = track.scrollWidth - sticky.clientWidth;
        if (distance <= 0) return;

        driver.style.height = `${sticky.offsetHeight + distance}px`;

        const tween = gsap.to(track, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: driver,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          driver.style.height = '';
        };
      });
      // Below 768px: no ScrollTrigger at all -- the track is a plain
      // overflow-x-auto strip (see JSX), so it's swipeable natively.
    }, driver);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={driverRef} className="relative bg-surface">
      <div ref={stickyRef} className="sticky top-0 overflow-hidden py-20">
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
    </div>
  );
}
