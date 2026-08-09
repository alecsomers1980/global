import Image from 'next/image';
import { SITE } from '@/data/site';
import { Leaf } from 'lucide-react';

export function StoryBlock() {
  return (
    <section id="our-story" className="py-20">
      <div className="container-kpe grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded">
          <Image
            src="/images/destinations/local-experiences.webp"
            alt="Local guide from Mpumalanga community sharing stories with guests"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Content */}
        <div>
          <h2 className="text-2xl md:text-3xl tracking-wide2">
            A Safari That Belongs To Its Community
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text/70 normal-case">
            Our guides were born and raised in Mpumalanga’s villages and townships. They bring
            insider knowledge, deep cultural heritage and a genuine passion for conservation to
            every journey — because this land is their home.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-text/70 normal-case">
            Responsible tourism lies at the core of what we do. We partner with{' '}
            {SITE.partner.name} to direct a portion of every trip’s proceeds into
            community‑led conservation, education and development work.
          </p>

          <ul className="mt-6 space-y-4">
            {SITE.partner.funds.map((fund, idx) => (
              <li key={idx} className="flex gap-3">
                <Leaf size={16} className="mt-0.5 shrink-0 text-amber-text" />
                <div>
                  <h3 className="text-sm tracking-wide2">{fund.title}</h3>
                  <p className="text-sm text-text/70 normal-case">{fund.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
