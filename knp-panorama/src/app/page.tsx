import Image from 'next/image';
import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { ExperienceFinder } from '@/components/home/ExperienceFinder';
import { IconBadges } from '@/components/home/IconBadges';
import { DestinationStrip } from '@/components/home/DestinationStrip';
import { StoryBlock } from '@/components/home/StoryBlock';
import { CtaBand } from '@/components/home/CtaBand';
import { TourGrid } from '@/components/tours/TourGrid';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { TOURS } from '@/data/tours';
import { COMFORT_TIERS } from '@/data/taxonomy';

export default function Home() {
  return (
    <main>
      <Hero />
      <ExperienceFinder />

      <IconBadges />

      <DestinationStrip />

      <section className="py-20">
        <div className="container-kpe">
          <SectionHeader title="Our Experiences" viewAllHref="/safari" />
          <TourGrid tours={TOURS} />
        </div>
      </section>

      <StoryBlock />

      {/* Accommodation teaser — the five tiers condensed, linking to the full page. */}
      <section className="bg-[#FAFAFA] py-20">
        <div className="container-kpe grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded">
            <Image
              src="/images/heroes/accommodation.webp"
              alt="Open-air lodge dining area in the Mpumalanga bushveld at dusk"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="text-2xl tracking-wide2 md:text-3xl">Somewhere To Rest</h2>
            <p className="mt-4 text-sm normal-case leading-relaxed text-text/70">
              Where you stay can shape a trip as much as the journey itself. We match travellers to
              stays that suit how they travel, from straightforward and affordable through to
              private and exclusive.
            </p>
            <ul className="mt-6 space-y-2">
              {COMFORT_TIERS.map((tier) => (
                <li key={tier.slug} className="text-sm normal-case text-text/70">
                  <span className="font-semibold text-text">{tier.label}</span> — {tier.blurb}
                </li>
              ))}
            </ul>
            <Button href="/accommodation" variant="outline" className="mt-8">
              See Accommodation
            </Button>
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
