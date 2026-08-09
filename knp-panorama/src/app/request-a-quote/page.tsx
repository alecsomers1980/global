import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { WhatsAppButton } from '@/components/quote/WhatsAppButton';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description:
    'Tell us who is travelling and when so we can put together a tailored itinerary in the Mpumalanga Lowveld.',
};

export default async function RequestAQuotePage({
  searchParams,
}: {
  searchParams: Promise<{
    experience?: string;
    destination?: string;
    comfort?: string;
  }>;
}) {
  const { experience, destination, comfort } = await searchParams;

  return (
    <main>
      <PageHero
        title="Request a Quote"
        image="/images/heroes/home.webp"
        imageAlt="Sunset over a waterhole in the Kruger National Park"
        intro="A short form is all it takes — we'll do the rest and come back with a plan that fits your group perfectly."
      />

      <section className="py-16">
        <div className="container-kpe">
          <p className="mx-auto max-w-2xl text-text/70 normal-case">
            We put each itinerary together by hand because what a trip involves
            depends on group size, comfort level and time of year. That’s why
            we reply with a tailored quote rather than publishing a fixed
            figure. Tell us about your travel party below and we’ll send you
            something personal, usually within a few hours.
          </p>
          <div className="mt-10">
            <QuoteForm
              variant="full"
              defaultExperience={experience}
              defaultDestination={destination}
              defaultComfort={comfort}
              sourcePage="/request-a-quote"
            />
          </div>
          <WhatsAppButton className="mt-6" />
        </div>
      </section>
    </main>
  );
}
