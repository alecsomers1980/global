'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { getGSAP, prefersReducedMotion } from '@/lib/motion/gsap';

interface RevealProps {
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'li';
  className?: string;
  /** Pixels the element travels upward as it reveals. */
  y?: number;
  /** Seconds to wait before starting, for staggered groups. */
  delay?: number;
}

export default function Reveal({
  children,
  as: Tag = 'div',
  className,
  y = 24,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      // No animation at all -- element is already at its final state
      // because we never set an initial hidden state below.
      return;
    }

    const { gsap } = getGSAP();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [y, delay]);

  const Component = Tag as 'div';
  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
