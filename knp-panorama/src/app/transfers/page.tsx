import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TourGrid } from '@/components/tours/TourGrid';
import { CtaBand } from '@/components/home/CtaBand';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { WhatsAppButton } from '@/components/quote/WhatsAppButton';
import { getToursByPillar } from '@/data/tours';

export const metadata: Metadata = {
  title: 'Transfers',
  description:
    'OR Tambo airport transfers and door-to-door travel to the Mpumalanga Lowveld.',
};

const expectItems = [
  {
    title: 'Met On Arrival',
    body: 'A driver meets you in the arrivals hall and helps with luggage. No stress, no waiting — just a friendly face with your name on a board.',
  },
  {
    title: 'Routes We Cover',
    body: "OR Tambo and KMIA through to Hazyview, Nelspruit, White River and the lodges around the Kruger gates. We'll pick you up wherever your journey starts.",
  },
  {
    title: 'Travelling As A Group',
    body: 'Vehicles are arranged to suit the size of the party and the amount of luggage, from a sedan for two to a roomy minibus for a family.',
  },
];

export default function TransfersPage() {
  return (
    <>
      <PageHero
        title="Transfers"
        eyebrow="DOOR TO DOOR"
        image="/images/heroes/transfers.webp"
        imageAlt="A road winding through the green hills of Mpumalanga"
        intro="Reliable, comfortable transfers between the airport and your lodge in the Lowveld."
      />

      <section className="py-20">
        <div className="container-kpe">
          <p className="mx-auto max-w-3xl text-text/70 normal-case">
            Whether you are flying into OR Tambo or Kruger Mpumalanga
            International, we make sure the last leg of your journey is the
            easiest one. Our drivers know every back road and all the best
            coffee stops.
          </p>
          <div className="mt-12">
            <SectionHeader title="Airport & Journey Transfers" />
            <TourGrid tours={getToursByPillar('transfers')} />
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAFA] py-20">
        <div className="container-kpe">
          <h2 className="text-center">What To Expect</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {expectItems.map((item) => (
              <div key={item.title} className="rounded bg-white p-8 shadow-sm">
                <h3>{item.title}</h3>
                <p className="mt-4 text-text/70 normal-case">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-kpe">
          <h2 className="text-center">Request Your Transfer Quote</h2>
          <div className="mt-8">
            <QuoteForm variant="full" sourcePage="/transfers" />
          </div>
          <WhatsAppButton />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
