import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/data/business";
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
const wendyFirst = WENDY_SIZES[0];
const wendyMiddle = WENDY_SIZES[Math.floor(WENDY_SIZES.length / 2)];
const wendyLast = WENDY_SIZES[WENDY_SIZES.length - 1];
const sampleSizes = [wendyFirst, wendyMiddle, wendyLast];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[600px] lg:min-h-[720px] flex items-center overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/60 to-ink/20" />
        <div className="relative z-10 w-full px-6 py-20 md:px-12 lg:px-20">
          <div className="max-w-2xl">
            <p className="text-leaf font-semibold tracking-wide uppercase text-sm">
              Nelspruit • Since 1993
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-5">
              Extra space, built to last.
            </h1>
            <p className="text-white/90 text-lg lg:text-xl leading-relaxed mb-8">
              From{" "}
              <span className="font-semibold text-white">
                {formatRand(minWendyPrice)}
              </span>{" "}
              — Wendy houses, site offices, classrooms, clinics and timber
              frame cabins, built in our Nelspruit factory and delivered
              anywhere in the Lowveld.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-brand hover:bg-brand-600 text-white font-semibold text-base transition-colors"
              >
                Build your quote
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-white/70 text-white hover:bg-white hover:text-ink font-semibold text-base transition-colors"
              >
                See our work
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                33 years in the Lowveld
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Our own factory & build teams
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Delivered & assembled on site
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Two ranges */}
      <section className="bg-cream py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink text-center mb-4">
            Two ranges. One team.
          </h2>
          <p className="text-ink/70 text-lg text-center max-w-2xl mx-auto mb-14">
            Whether you need a simple timber shed or a fully-engineered cabin,
            everything is made in our factory and built by our own skilled teams.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Wendy card */}
            <div className="rounded-card overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/range-wendy.jpg"
                  alt="Traditional Wendy house built with timber"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 lg:p-8">
                <p className="text-brand font-semibold text-lg">
                  From {formatRand(minWendyPrice)}
                </p>
                <h3 className="font-display text-2xl font-bold text-ink mt-2 mb-3">
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
            <div className="rounded-card overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/range-frame.jpg"
                  alt="Frame-built timber cabin with veranda"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6 lg:p-8">
                <p className="text-brand font-semibold text-lg">
                  From {formatRand(minLogPrice)}
                </p>
                <h3 className="font-display text-2xl font-bold text-ink mt-2 mb-3">
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
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink text-center mb-14">
            Why the Lowveld builds with us
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Since 1993 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand p-3 mb-5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-semibold text-ink text-lg mb-2">Since 1993</h3>
              <p className="text-ink/70 text-sm leading-relaxed">
                33 years building for the Lowveld. We are still here because 
                the work holds up.
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
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
            Know the price before you call.
          </h2>
          <p className="text-white/90 text-lg max-w-3xl mx-auto mb-10">
            Most suppliers make you request a quote just to see what anything costs.
            Our real price list is published — pick your size and options and see 
            the total instantly. Prices as at {PRICE_LIST_DATE} and include VAT.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-brand hover:bg-brand-50 font-semibold text-base transition-colors mb-14"
          >
            Build your quote
          </Link>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {sampleSizes.map((size) => (
              <div
                key={size.code}
                className="bg-white/10 backdrop-blur-sm rounded-card p-5 text-white"
              >
                <p className="font-display text-xl font-semibold">{size.code}</p>
                <p className="text-white/80 text-sm">
                  {size.front}m × {size.side}m
                </p>
                <p className="text-2xl font-bold mt-3">
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
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink text-center mb-14">
            Whatever the space is for
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Garden sheds", href: "/wendy-houses/garden-sheds" },
              { name: "Guard huts", href: "/wendy-houses/guard-huts" },
              { name: "Site offices", href: "/wendy-houses/site-offices" },
              {
                name: "Site accommodation",
                href: "/wendy-houses/site-accommodation",
              },
              { name: "Storerooms", href: "/wendy-houses/storerooms" },
              { name: "Clinics", href: "/wendy-houses/clinics" },
              { name: "Classrooms", href: "/wendy-houses/classrooms" },
              {
                name: "Getaway cabins",
                href: "/frame-built/getaway-cabins",
              },
            ].map((use) => (
              <Link
                key={use.name}
                href={use.href}
                className="bg-white rounded-card p-5 border border-transparent hover:border-brand transition-colors flex items-center justify-between group"
              >
                <span className="font-medium text-ink group-hover:text-brand transition-colors">
                  {use.name}
                </span>
                <span className="text-brand text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-leaf text-7xl font-bold leading-none mb-4">“</div>
          <blockquote className="text-ink/90 text-xl md:text-2xl font-display italic leading-relaxed mb-8">
            I would like to thank your team for a wonderful job done. I am very
            happy with my Wendy. Comfort, David, John and Nico are kind, friendly
            and hard working men. I will definitely recommend your company and the
            men to my friends and family.
          </blockquote>
          <cite className="not-italic text-ink/60 font-medium text-base">
            — Cheryl Deacon, Private
          </cite>
        </div>
      </section>

      {/* Service areas + CTA */}
      <section className="bg-ink text-white py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
            We deliver across the Lowveld
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {BUSINESS.serviceAreas.map((area) => (
              <span
                key={area}
                className="bg-white/10 text-white text-sm px-4 py-1.5 rounded-full"
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
