import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/site/Hero";
import AudienceSplit from "@/components/site/AudienceSplit";
import AreasOfFocus from "@/components/site/AreasOfFocus";
import Stats from "@/components/site/Stats";
import Testimonials from "@/components/site/Testimonials";
import ClosingCta from "@/components/site/ClosingCta";
import Container from "@/components/site/Container";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "H&S Labour Brokers — Recruitment, TES & Payroll in South Africa",
  description:
    "Permanent & contract recruitment, TES, payroll, vetting and HR across South Africa. Since 1998 — compliant, guaranteed.",
};

export default function HomePage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <Hero />
      <AudienceSplit />
      <AreasOfFocus />
      <Stats />

      <section className="relative overflow-hidden bg-navy py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10"
        />
        <Container className="relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Photos */}
            <div className="relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
                <Image
                  src="/images/about-team.jpg"
                  alt="The H&S Labour Brokers team"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden w-2/5 sm:block">
                <div className="relative aspect-square overflow-hidden rounded-2xl ring-4 ring-navy">
                  <Image
                    src="/images/about-handshake.jpg"
                    alt="Placing the right candidate with the right employer"
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-green">
                About Us
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
                Your trusted workforce partner since 1998
              </h2>
              <p className="mt-6 text-lg text-slate-300">
                Established in 1998, H&amp;S Labour Brokers has grown into a
                diverse portfolio of recruitment, Temporary Employment Services,
                response handling, vetting, psychometrics and HR services across
                many industries.
              </p>
              <p className="mt-4 text-lg text-slate-300">
                Our mission is simple — create strong, lasting partnerships with
                our clients through effective collaboration.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
              >
                More About Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Testimonials />
      <ClosingCta />
    </>
  );
}