import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TourGrid } from '@/components/tours/TourGrid';
import { CtaBand } from '@/components/home/CtaBand';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { WhatsAppButton } from '@/components/quote/WhatsAppButton';
import { getToursByPillar } from '@/data/tours';
import { COMFORT_TIERS } from '@/data/taxonomy';

export const metadata: Metadata = {
  title: 'Safari',
  description:
    'Half-day and full-day Kruger National Park safaris with local guides from the Mpumalanga Lowveld.',
};

export default function SafariPage() {
  return (
    <>
      <PageHero
        title="Safari"
        eyebrow="KRUGER NATIONAL PARK"
        image="/images/heroes/safari.webp"
        imageAlt="Lions resting beside a road in the Kruger National Park"
        intro="Join a guided safari through the Kruger with drivers who know wildlife behaviour better than anyone."
      />

      <section className="py-20">
        <div className="container-kpe">
          <p className="mx-auto max-w-3xl text-text/70 normal-case">
            Game drives are at the heart of what we do. Every safari is led by
            a guide who grew up right here in the Lowveld — someone who can
            read the bush, spot a flick of a tail through the acacias, and
            still gets as excited as a first-time visitor when a leopard slips
            into view. Whether you have a single morning or a full day, your
            Kruger experience is built around real local knowledge.
          </p>
          <div className="mt-12">
            <SectionHeader title="Kruger Safaris" />
            <TourGrid tours={getToursByPillar('safari')} />
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAFA] py-20">
        <div className="container-kpe">
          <h2 className="text-center">Choose Your Comfort Level</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {COMFORT_TIERS.map((tier) => (
              <div key={tier.slug} className="rounded bg-white p-8 shadow-sm">
                <h3>{tier.label}</h3>
                <p className="mt-4 text-text/70 normal-case">{tier.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-kpe">
          <h2 className="text-center">Request Your Safari Quote</h2>
          <div className="mt-8">
            <QuoteForm variant="full" sourcePage="/safari" />
          </div>
          <WhatsAppButton />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
