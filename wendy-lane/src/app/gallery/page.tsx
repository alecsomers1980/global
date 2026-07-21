import type { Metadata } from "next";
import Link from "next/link";
import GalleryGrid, { type GalleryItem } from "@/components/GalleryGrid";
import PageHeader from "@/components/PageHeader";
import { BUSINESS } from "@/data/business";

export const metadata: Metadata = {
  title: "Our Work — Wendy Houses & Timber Cabins in the Lowveld",
  description:
    "See real Wendy houses, cabins, site offices, clinics and classrooms built and delivered by Wendy Lane across Nelspruit and the Lowveld since 1993.",
  alternates: { canonical: "/gallery" },
};

const WENDY_ITEMS: GalleryItem[] = [
  { src: "/images/projects/guard-hut.jpg", caption: "Guard hut", group: "Wendy Houses" },
  { src: "/images/projects/site-office.jpg", caption: "Site office", group: "Wendy Houses" },
  { src: "/images/projects/site-accommodation.jpg", caption: "Site accommodation", group: "Wendy Houses" },
  { src: "/images/projects/storeroom.jpg", caption: "Storeroom", group: "Wendy Houses" },
  { src: "/images/projects/clinic.jpg", caption: "Clinic", group: "Wendy Houses" },
  { src: "/images/projects/classroom.jpg", caption: "Classroom", group: "Wendy Houses" },
];

const FRAME_ITEMS: GalleryItem[] = [
  { src: "/images/projects/getaway-cabin.jpg", caption: "Getaway cabin", group: "Frame Built" },
  { src: "/images/projects/holiday-cottage.jpg", caption: "Holiday cottage", group: "Frame Built" },
  { src: "/images/projects/general-accommodation.jpg", caption: "General accommodation", group: "Frame Built" },
  { src: "/images/projects/office.jpg", caption: "Office", group: "Frame Built" },
];

export default function GalleryPage() {
  return (
    <>
      {/* Header */}
      <PageHeader
        eyebrow="Nelspruit · Since 1993"
        title="Our work"
        intro="Real Wendy houses and timber cabins built in our Nelspruit factory and delivered across the Lowveld — from guard huts and clinics to getaway cabins and holiday cottages."
      />

      {/* Wendy Houses */}
      <section id="wendy-houses" className="scroll-mt-24 bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tightest text-ink">
              Wendy Houses
            </h2>
            <Link
              href="/wendy-houses"
              className="shrink-0 text-brand hover:text-brand-700 font-semibold text-sm"
            >
              Prices &amp; sizes →
            </Link>
          </div>
          <GalleryGrid items={WENDY_ITEMS} />
        </div>
      </section>

      {/* Frame Built */}
      <section id="frame-built" className="scroll-mt-24 bg-cream py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tightest text-ink">
              Frame Built Range
            </h2>
            <Link
              href="/frame-built"
              className="shrink-0 text-brand hover:text-brand-700 font-semibold text-sm"
            >
              Models &amp; prices →
            </Link>
          </div>
          <GalleryGrid items={FRAME_ITEMS} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-timber-dark via-timber to-timber-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Picture yours next
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Build your quote in a minute with our real, published prices — no
            waiting for a call-back.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Build your quote
            </Link>
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-6 py-3 font-semibold hover:bg-white hover:text-ink transition-colors"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
