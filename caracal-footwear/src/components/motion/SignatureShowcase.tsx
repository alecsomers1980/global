'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGSAP, prefersReducedMotion } from '@/lib/motion/gsap';
import type { ProductWithVariants } from '@/lib/supabase/types';
import { formatZAR } from '@/lib/money';

interface SignatureShowcaseProps {
  products: ProductWithVariants[];
  /** teaser = homepage beat (max 3, "View the collection" CTA at the end);
      full = every product, used on the standalone /signature page. */
  variant: 'teaser' | 'full';
}

export default function SignatureShowcase({ products, variant }: SignatureShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shown = variant === 'teaser' ? products.slice(0, 3) : products;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const { gsap } = getGSAP();
    const ctx = gsap.context(() => {
      const panels = container.querySelectorAll<HTMLElement>('[data-signature-panel]');
      panels.forEach((panel) => {
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 1.04 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          },
        );
      });
    }, container);

    return () => ctx.revert();
  }, [shown.length]);

  return (
    // overflow-x-hidden is load-bearing: the panels' entrance animation
    // scales in from 1.04, and a below-the-fold panel sits at that scale
    // (immediateRender) until it's scrolled into view. transform:scale()
    // visually bleeds past an element's own box regardless of its own
    // overflow-hidden (that only clips descendants, not its own transformed
    // extent), so without this the scaled panel widens the page horizontally.
    <div ref={containerRef} className="bg-canvas overflow-x-hidden">
      {shown.map((product) => {
        const image = product.images.find((i) => i.colour_name === null) ?? product.images[0];
        return (
          <div
            key={product.id}
            data-signature-panel
            className="relative min-h-[70vh] flex items-end overflow-hidden border-b border-accent/10"
          >
            {image && (
              <Image
                src={image.url}
                alt={image.alt || product.name}
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent"
            />
            <div className="relative max-w-7xl mx-auto w-full px-4 md:px-6 py-12">
              <p className="text-xs uppercase tracking-[0.35em] text-muted">
                {product.signature_type === 'wildlife' && 'Wildlife panel'}
                {product.signature_type === 'hide' && 'Game hide panel'}
                {product.signature_type === 'floral' && 'Floral panel'}
              </p>
              <h3 className="display mt-2 text-4xl md:text-5xl text-text">{product.name}</h3>
              <p className="mt-3 text-text">{formatZAR(product.base_price)}</p>
              <Link
                href={`/product/${product.slug}`}
                className="mt-6 inline-block rounded-md bg-accent px-6 py-3 text-sm uppercase tracking-[0.15em] text-canvas transition-colors hover:bg-accent-hi"
              >
                View this style
              </Link>
            </div>
          </div>
        );
      })}

      {variant === 'teaser' && (
        <div className="flex justify-center py-12 bg-canvas">
          <Link
            href="/signature"
            className="rounded-md border border-text/30 px-6 py-3 text-sm uppercase tracking-[0.15em] text-text transition-colors hover:border-text"
          >
            View the Signature Collection
          </Link>
        </div>
      )}
    </div>
  );
}
