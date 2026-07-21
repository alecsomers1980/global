import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/data/business";
import Reveal from "@/components/Reveal";
import FaqSection from "@/components/FaqSection";
import {
  WENDY_SIZES,
  FRAME_BUILT,
  PRICE_LIST_DATE,
  formatRand,
} from "@/data/pricing";

export const metadata: Metadata = {
  title:
    "Wendy Houses & Timber Cabins in Nelspruit | Wendy Lane — Since 1993",
  description:
    "Nelspruit’s own timber building specialists since 1993. Real published prices for Wendy houses, frame‑built cabins, site offices, classrooms and clinics. Delivered and assembled across the Lowveld.",
};

const minWendyPrice = Math.min(...WENDY_SIZES.map((s) => s.priceNoWindow));
const logPrices = FRAME_BUILT.map((fb) => fb.log).filter(
  (log): log is number => log !== null,
);
const minLogPrice = Math.min(...logPrices);
const yearsTrading = new Date().getFullYear() - BUSINESS.established;
const wendyFirst = WENDY_SIZES[0];
const wendyMiddle = WENDY_SIZES[Math.floor(WENDY_SIZES.length / 2)];
const wendyLast = WENDY_SIZES[WENDY_SIZES.length - 1];
const sampleSizes = [wendyFirst, wendyMiddle, wendyLast];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          className="object-cover animate-ken-burns"
          sizes="100vw"
        />
        {/* Layered vignette — horizontal for text legibility, vertical for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/25" />

        <div className="relative z-10 w-full px-6 py-24 md:px-12 lg:px-20">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-leaf-light ring-1 ring-white/20 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
              Nelspruit · Est. 1993
            </span>

            <h1 className="mt-7 font-display text-5xl font-bold leading-[1.03] tracking-tightest text-white sm:text-6xl lg:text-7xl">
              Extra space,
              <br />
              built to last.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75 lg:text-xl">
              Wendy houses, site offices, classrooms, clinics and timber frame
              cabins — made in our own Nelspruit factory and delivered anywhere
              in the Lowveld.
            </p>

            <p className="mt-6 flex items-baseline gap-2 text-white/60">
              <span className="text-sm uppercase tracking-[0.15em]">From</span>
              <span className="font-display text-4xl font-semibold text-white">
                {formatRand(minWendyPrice)}
              </span>
              <span className="text-sm">incl. VAT</span>
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-lift transition-all hover:bg-brand-600 hover:-translate-y-0.5"
              >
                Build your quote
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-ink"
              >
                See our work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 border-x border-white/10 lg:grid-cols-4">
          {[
            { stat: String(yearsTrading), label: "Years in the Lowveld" },
            { stat: "2", label: "Ranges, one team" },
            { stat: "100%", label: "Prices published up front" },
            {
              stat: String(BUSINESS.serviceAreas.length),
              label: "Towns we deliver to",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`px-6 py-8 text-center lg:py-10 ${i < 2 ? "border-b border-white/10 lg:border-b-0" : ""}`}
            >
              <p className="font-display text-4xl font-semibold text-leaf lg:text-5xl">
                {item.stat}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-white/50">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Two ranges */}
      <section className="bg-cream py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <Reveal className="mb-16 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand">
              What we build
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tightest text-ink sm:text-5xl">
              Two ranges. One team.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink/60">
              Whether you need a simple timber shed or a fully-engineered cabin,
              everything is made in our factory and built by our own skilled teams.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Wendy card */}
            <div className="group overflow-hidden rounded-card bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/range-wendy.jpg"
                  alt="Traditional Wendy house built with timber"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-brand shadow-soft">
                  From {formatRand(minWendyPrice)}
                </span>
              </div>
              <div className="p-6 lg:p-8">
                <h3 className="font-display text-2xl font-bold text-ink mb-3">
                  Wendy Houses
                </h3>
                <p className="text-ink/75 mb-4">
                  Simple, affordable timber utility structures — perfect for
                  storage, security rooms, site offices or staff accommodation.
                </p>
                <ul className="text-ink/70 space-y-2 mb-6 text-sm list-disc list-inside">
                  <li>Garden sheds</li>
                  <li>Guard huts</li>
                  <li>Site offices</li>
                  <li>Storerooms</li>
                  <li>Classrooms</li>
                  <li>Clinics</li>
                </ul>
                <Link
                  href="/wendy-houses"
                  className="inline-flex items-center text-brand hover:text-brand-700 font-semibold text-sm transition-colors"
                >
                  Explore Wendy Houses
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>

            {/* Frame Built card */}
            <div className="group overflow-hidden rounded-card bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/range-frame.jpg"
                  alt="Frame-built timber cabin with veranda"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-brand shadow-soft">
                  From {formatRand(minLogPrice)}
                </span>
              </div>
              <div className="p-6 lg:p-8">
                <h3 className="font-display text-2xl font-bold text-ink mb-3">
                  Frame Built Range
                </h3>
                <p className="text-ink/75 mb-4">
                  An engineered building system that meets formal regulations, 
                  comparable to brick and mortar. More than half the homes in 
                  the developed world are timber frame.
                </p>
                <ul className="text-ink/70 space-y-2 mb-6 text-sm list-disc list-inside">
                  <li>Getaway cabins</li>
                  <li>Holiday cottages</li>
                  <li>General accommodation</li>
                  <li>Offices</li>
                </ul>
                <Link
                  href="/frame-built"
                  className="inline-flex items-center text-brand hover:text-brand-700 font-semibold text-sm transition-colors"
                >
                  Explore Frame Built
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Wendy Lane */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <Reveal className="mb-16 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand">
              Why us
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tightest text-ink sm:text-5xl">
              Why the Lowveld builds with us
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Since 1993 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand p-3 mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-semibold text-ink text-lg mb-2">Since 1993</h3>
              <p className="text-ink/70 text-sm leading-relaxed">
                {yearsTrading} years building for the Lowveld. We are still here
                because the work holds up.
              </p>
            </div>

            {/* Factory */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand p-3 mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="font-semibold text-ink text-lg mb-2">Our own factory</h3>
              <p className="text-ink/70 text-sm leading-relaxed">
                We prepare, manufacture and dispatch from our own operation 
                outside Nelspruit.
              </p>
            </div>

            {/* Teams */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand p-3 mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="font-semibold text-ink text-lg mb-2">Our own teams</h3>
              <p className="text-ink/70 text-sm leading-relaxed">
                Long-serving team leaders take the unit to site, deliver 
                and assemble it.
              </p>
            </div>

            {/* Real prices */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand p-3 mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <h3 className="font-semibold text-ink text-lg mb-2">
                Real prices, up front
              </h3>
              <p className="text-ink/70 text-sm leading-relaxed">
                Our full price list is on this site. No guessing, no games.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Price calculator teaser */}
      <section className="bg-brand text-white py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-white/50">
            No guessing
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold tracking-tightest sm:text-5xl">
            Know the price before you call.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Most suppliers make you request a quote just to see what anything costs.
            Our real price list is published — pick your size and options and see
            the total instantly. Prices as at {PRICE_LIST_DATE} and include VAT.
          </p>
          <Link
            href="/quote"
            className="mb-16 mt-9 inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-brand shadow-lift transition-all hover:-translate-y-0.5 hover:bg-cream"
          >
            Build your quote
          </Link>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {sampleSizes.map((size) => (
              <div
                key={size.code}
                className="rounded-card border border-white/15 bg-white/10 p-6 text-white backdrop-blur-sm transition-colors hover:bg-white/[0.15]"
              >
                <p className="text-xs uppercase tracking-[0.15em] text-white/60">
                  {size.code}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  {size.front}m × {size.side}m
                </p>
                <p className="mt-4 font-display text-3xl font-semibold">
                  {formatRand(size.priceNoWindow)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uses / applications */}
      <section className="bg-cream py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <Reveal className="mb-16 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand">
              Applications
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tightest text-ink sm:text-5xl">
              Whatever the space is for
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Garden sheds", href: "/gallery#wendy-houses" },
              { name: "Guard huts", href: "/gallery#wendy-houses" },
              { name: "Site offices", href: "/gallery#wendy-houses" },
              {
                name: "Site accommodation",
                href: "/gallery#wendy-houses",
              },
              { name: "Storerooms", href: "/gallery#wendy-houses" },
              { name: "Clinics", href: "/gallery#wendy-houses" },
              { name: "Classrooms", href: "/gallery#wendy-houses" },
              {
                name: "Getaway cabins",
                href: "/gallery#frame-built",
              },
            ].map((use) => (
              <Link
                key={use.name}
                href={use.href}
                className="group flex items-center justify-between rounded-card border border-ink/5 bg-white px-5 py-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lift"
              >
                <span className="font-medium text-ink transition-colors group-hover:text-brand">
                  {use.name}
                </span>
                <span className="text-brand transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-white">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand">
            In their words
          </p>
          <blockquote className="mt-8 font-display text-2xl leading-[1.5] tracking-tight text-ink md:text-[2rem]">
            &ldquo;I would like to thank your team for a wonderful job done. I am
            very happy with my Wendy. Comfort, David, John and Nico are kind,
            friendly and hard working men. I will definitely recommend your
            company and the men to my friends and family.&rdquo;
          </blockquote>
          <cite className="mt-8 block text-sm not-italic uppercase tracking-[0.15em] text-ink/45">
            Cheryl Deacon · Private client
          </cite>
        </Reveal>
      </section>

      {/* FAQ */}
      <FaqSection className="bg-cream" />

      {/* Service areas + CTA */}
      <section className="bg-gradient-to-br from-timber-dark via-timber to-timber-dark text-white py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-white/50">
            Where we build
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tightest sm:text-5xl">
            We deliver across the Lowveld
          </h2>
          <div className="mb-14 mt-9 flex flex-wrap justify-center gap-2.5">
            {BUSINESS.serviceAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                {area}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/quote"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-brand hover:bg-brand-50 font-semibold text-base transition-colors"
            >
              Build your quote
            </Link>
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-white/70 hover:bg-white hover:text-ink font-semibold text-base transition-colors"
            >
              WhatsApp us
            </a>
            <a
              href={BUSINESS.phone.href}
              className="text-white/80 hover:text-white underline underline-offset-4 text-lg"
            >
              {BUSINESS.phone.display}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
