import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd, touristTripJsonLd } from '@/components/seo/JsonLd';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { CtaBand } from '@/components/home/CtaBand';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { WhatsAppButton } from '@/components/quote/WhatsAppButton';
import { TourMeta } from '@/components/tours/TourMeta';
import { HighlightList } from '@/components/tours/HighlightList';
import { InclusionList } from '@/components/tours/InclusionList';
import { TOURS, getTour } from '@/data/tours';

export function generateStaticParams() {
  return TOURS.map((tour) => ({ slug: tour.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) return {};
  return {
    title: tour.title,
    description: tour.summary,
    openGraph: { title: tour.title, description: tour.summary, images: [tour.heroImage] },
  };
}

export default async function ExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) notFound();

  return (
    <>
      <JsonLd data={touristTripJsonLd(tour)} />
      {/* Hero */}
      <section className="relative flex h-[55vh] min-h-[380px] items-end">
        <Image
          src={tour.heroImage}
          alt={tour.title}
          fill
          priority
          className="object-cover -z-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 -z-10 bg-ink/50" />
        <div className="container-kpe pb-12">
          <h1 className="text-4xl md:text-5xl tracking-wide3 text-white">{tour.title}</h1>
          <TourMeta
            duration={tour.duration}
            location={tour.locationLabel}
            tone="light"
            className="mt-4"
          />
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-kpe grid gap-12 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2>Overview</h2>
              <div className="space-y-4 mt-6">
                {tour.overview.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-sm leading-relaxed text-text/70 normal-case"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            <HighlightList highlights={tour.highlights} title="Highlights" />

            <InclusionList included={tour.included} excluded={tour.excluded} />

            {/* What To Bring */}
            <div>
              <h2>What To Bring</h2>
              <div className="grid gap-2 sm:grid-cols-2 mt-6">
                {tour.whatToBring.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-text/70 normal-case"
                  >
                    <Check size={16} className="mt-[2px] shrink-0 text-amber" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column – quote form */}
          <div>
            <div className="lg:sticky lg:top-24">
              <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg tracking-wide2">Request a Quote</h2>
                <p className="mt-2 text-xs text-text/60 normal-case">
                  The team will come back with a tailored itinerary and all the information
                  you need.
                </p>
                <QuoteForm
                  variant="full"
                  defaultExperience={tour.slug}
                  defaultDestination={tour.destination}
                  sourcePage={`/experiences/${tour.slug}`}
                />
                <WhatsAppButton
                  experience={tour.title}
                  className="mt-4 w-full"
                />
              </div>
              {/*
                The reference theme puts a price box and a "Check Availability" button in this
                slot; here it holds the quote form instead. No price, no availability calendar,
                no booking button.
              */}
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
