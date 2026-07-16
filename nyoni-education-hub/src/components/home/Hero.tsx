import Link from "next/link";
import { siteConfig } from "@/lib/content";
import { Sprout, Users, Leaf } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-brand-cream px-4 py-20 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 md:flex-row">
        {/* Left Column */}
        <div className="flex-1 text-center md:text-left">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-teal">
            Progressive Education
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-tight text-brand-navy md:text-5xl lg:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-6 max-w-prose text-base text-brand-navy/80 md:text-lg">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/admissions"
              className="inline-flex items-center rounded-full bg-brand-sand px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-sand/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              Book a Tour
            </Link>
            <Link
              href="/our-story"
              className="inline-flex items-center rounded-full border-2 border-brand-navy/20 px-8 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-teal/40 hover:text-brand-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="relative flex-1">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-sky to-brand-teal/20 shadow-soft md:aspect-square">
            <Sprout
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-teal/40"
              size={120}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>

          {/* Floating stat badges */}
          <div
            className="absolute -right-4 -top-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg md:-right-6 md:-top-6"
            aria-hidden="true"
          >
            <Users className="h-5 w-5 text-brand-teal" />
            <span className="text-sm font-medium text-brand-navy">Small Classes</span>
          </div>
          <div
            className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg md:-bottom-6 md:-left-6"
            aria-hidden="true"
          >
            <Leaf className="h-5 w-5 text-brand-teal" />
            <span className="text-sm font-medium text-brand-navy">Nature‑Based Learning</span>
          </div>
        </div>
      </div>
    </section>
  );
}
