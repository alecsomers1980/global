{/* This card reproduces the travel theme's card geometry, but where that theme shows a price, this shows a quote link. */}

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Tour } from '@/types/tour';
import { DESTINATIONS } from '@/data/taxonomy';
import { TourMeta } from '@/components/tours/TourMeta';

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  const destination = DESTINATIONS.find(
    (d) => d.slug === tour.destination
  );
  const href = `/experiences/${tour.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={href} className="relative block aspect-[16/9] overflow-hidden">
        <Image
          src={tour.heroImage}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {destination && (
          <span className="absolute left-3 top-3 bg-ink/85 px-3 py-1 text-[10px] uppercase tracking-wide3 text-white">
            {destination.label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base leading-snug tracking-wide2">
          <Link href={href} className="hover:text-amber">
            {tour.title}
          </Link>
        </h3>

        <p className="flex-1 text-sm leading-relaxed text-text/70 normal-case">
          {tour.summary}
        </p>

        <TourMeta
          duration={tour.duration}
          location={tour.locationLabel}
        />

        <Link
          href={href}
          className="mt-2 flex items-center gap-2 border-t border-ink/10 pt-4 text-xs font-semibold uppercase tracking-wide3 text-amber hover:text-amber-soft"
        >
          Request a Quote <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
