import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CtaBand } from '@/components/home/CtaBand';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { WhatsAppButton } from '@/components/quote/WhatsAppButton';
import { TierList } from '@/components/accommodation/TierList';
import { PartnerCard } from '@/components/accommodation/PartnerCard';
import { SITE } from '@/data/site';

export const metadata: Metadata = {
  title: 'Accommodation',
  description:
    'Find your ideal stay near the Kruger National Park and the Panorama Route, in Hazyview and the Mpumalanga Lowveld.',
};

export default function AccommodationPage() {
  return (
    <main>
      <PageHero
        title="Accommodation"
        eyebrow="WHERE YOU STAY"
        image="/images/heroes/accommodation.webp"
        imageAlt="Open-air lodge dining area in the Mpumalanga bushveld at dusk"
        intro="Finding the right accommodation is part of the journey. We work with a hand‑picked collection of guesthouses, lodges and camps to match you with a stay that fits your style."
      />

      <section className="py-20">
        <div className="container-kpe">
          <p className="text-sm leading-relaxed text-text/70 normal-case max-w-prose">
            Where you stay can shape a trip as much as the journey itself. Whether you want to be
            woken by birdsong, unwind on a private deck overlooking the bush, or enjoy the
            convenience of a well‑run guesthouse close to the Park, we match travellers to stays
            that suit how they travel.
          </p>
        </div>
      </section>

      <section>
        <div className="container-kpe">
          <SectionHeader title="How We Match You" />
          <TierList />
        </div>
      </section>

      <section className="bg-[#FAFAFA] py-20">
        <div className="container-kpe">
          <SectionHeader title="Partner Guesthouses" />
          <div className="space-y-8">
            {SITE.guesthouses.map((gh) => (
              <PartnerCard
                key={gh.name}
                name={gh.name}
                location={gh.location}
                website={gh.website}
                blurb={gh.blurb}
              >
                {/*
                  TODO: The Nightsbridge embed ID must be recovered from the old site at
                  /accommodation-2386 and dropped in here; until then this links out to the
                  guesthouse's own booking page rather than guessing an ID.
                */}
                <p className="text-sm text-text/70 normal-case mb-4">
                  Availability is checked on the guesthouse’s own booking system.
                </p>
                <Button href={gh.website} variant="outline">
                  Check Availability
                </Button>
              </PartnerCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-kpe">
          <h2>Let Us Match You To A Stay</h2>
          <QuoteForm
            variant="full"
            sourcePage="/accommodation"
            className="mt-8"
          />
          <WhatsAppButton className="mt-6" />
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
