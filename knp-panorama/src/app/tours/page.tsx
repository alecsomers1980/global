import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TourGrid } from '@/components/tours/TourGrid';
import { DestinationStrip } from '@/components/home/DestinationStrip';
import { CtaBand } from '@/components/home/CtaBand';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { WhatsAppButton } from '@/components/quote/WhatsAppButton';
import { getToursByPillar } from '@/data/tours';

export const metadata: Metadata = {
  title: 'Tours',
  description:
    "Explore the Panorama Route, Blyde River Canyon, Bourke's Luck Potholes and God's Window on guided day tours from the Lowveld.",
};

export default function ToursPage() {
  return (
    <>
      <PageHero
        title="Tours"
        eyebrow="THE PANORAMA ROUTE"
        image="/images/heroes/tours.webp"
        imageAlt="Bourke's Luck Potholes on the Panorama Route"
        intro="One of the most dramatic scenic routes in Africa, right on our doorstep."
      />

      <section className="py-20">
        <div className="container-kpe">
          <p className="mx-auto max-w-3xl text-text/70 normal-case">
            The Panorama Route packs waterfalls, canyons and viewpoints into a
            single unforgettable road trip. We also run cultural day tours that
            take you beyond the viewpoints — walking through rural villages,
            meeting artists and eating food that tells a story. Every tour is
            designed for small groups and led by someone who lives here.
          </p>
          <div className="mt-12">
            <SectionHeader title="Panorama Route Tours" />
            <TourGrid tours={getToursByPillar('tours')} />
          </div>
          <DestinationStrip />
        </div>
      </section>

      <section className="py-20">
        <div className="container-kpe">
          <h2 className="text-center">Request Your Tour Quote</h2>
          <div className="mt-8">
            <QuoteForm variant="full" sourcePage="/tours" />
          </div>
          <WhatsAppButton />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
