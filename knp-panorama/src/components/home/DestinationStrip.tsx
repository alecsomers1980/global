import Image from 'next/image';
import Link from 'next/link';
import { DESTINATIONS } from '@/data/taxonomy';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Carousel } from '@/components/ui/Carousel';

export function DestinationStrip() {
  return (
    <section className="py-20">
      <div className="container-kpe">
        <SectionHeader title="Where We Travel" />
      </div>
      <Carousel ariaLabel="Destinations">
        {DESTINATIONS.map((d) => (
          <Link
            key={d.slug}
            href={`/request-a-quote?destination=${d.slug}`}
            className="relative block aspect-[3/4] w-[70%] shrink-0 snap-start overflow-hidden sm:w-1/2 lg:w-1/4"
            // Tiles link to a pre‑filled quote request rather than a category listing
            // because six of the eight destinations have no product yet and an empty
            // listing would be worse than a conversation.
          >
            <Image
              src={d.image}
              alt={d.label}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h3 className="text-sm text-white tracking-wide2">{d.label}</h3>
            </div>
          </Link>
        ))}
      </Carousel>
    </section>
  );
}
