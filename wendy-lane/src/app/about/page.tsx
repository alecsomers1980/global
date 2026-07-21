import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BUSINESS } from "@/data/business";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "About Wendy Lane | Building for the Lowveld since 1993",
  description:
    "Wendy Lane has been building Wendy houses and Frame Built cabins in Nelspruit and the Lowveld since 1993. Own factory, own build teams — fast, affordable space solutions.",
};

export default function AboutPage() {
  const yearsInBusiness = new Date().getFullYear() - BUSINESS.established;

  return (
    <>
      {/* Page header */}
      <PageHeader
        eyebrow={`${yearsInBusiness} years in the Lowveld`}
        title="Building for the Lowveld since 1993"
        intro={BUSINESS.tagline}
      />

      {/* The story */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:grid lg:grid-cols-2 lg:gap-12">
          <div className="prose prose-lg max-w-none text-ink/80">
            <p>
              Established in 1993, Wendy Lane has spent three decades giving the
              Lowveld quick, budget-friendly space. We offer everything from
              straightforward Wendy House options to a full Frame Built range:
              storage rooms, site offices, guard huts, garden sheds, classrooms,
              site accommodation, multi-roomed cabins for getaways, holiday
              cottages, general living quarters and clinics.
            </p>
            <p>
              Owner Roy Wakefield leads a hands-on team that handles every part
              of the job — supply, delivery and construction. Our manufacturing
              operation outside Nelspruit prepares, builds and dispatches every
              unit, while well-trained building teams led by long-serving
              veterans take the product to your site, deliver it and assemble it
              on the spot.
            </p>
            <p>
              Our sales and admin office is in Nelspruit, and the sales team
              will gladly travel for an on-site consultation and quotation. We
              have the experience and the passion to understand exactly what you
              need, and we are committed to delivering it to the standards we’ve
              agreed on.
            </p>
          </div>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-card lg:mt-0">
            <Image
              src="/images/about-factory.jpg"
              alt="Wendy Lane factory outside Nelspruit"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* By the numbers */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: BUSINESS.established, label: "Established" },
              { value: yearsInBusiness, label: "Years in the Lowveld" },
              { value: "2", label: "Product ranges" },
              { value: "1", label: "Team, start to finish" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-card bg-white p-6 text-center shadow-soft"
              >
                <div className="font-display text-4xl text-brand">
                  {stat.value}
                </div>
                <div className="mt-1 font-sans text-ink/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tightest text-ink lg:text-4xl">
            From your enquiry to your door
          </h2>
          <ol className="mt-10 space-y-6">
            {[
              {
                heading: "You tell us the space you need",
                body: "Call, send a WhatsApp, or build a quote online. Our sales team will come to your site if that’s easier.",
              },
              {
                heading: "We quote you properly",
                body: "Real prices off our published list, plus delivery for your area. No guesses, no hidden fees.",
              },
              {
                heading: "We manufacture it",
                body: "Everything is prepared, manufactured and dispatched from our own operation just outside Nelspruit.",
              },
              {
                heading: "We deliver and assemble",
                body: "Our own experienced build teams bring the product to your site and put it up.",
              },
            ].map((step, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-xl font-bold text-brand">
                  {idx + 1}
                </span>
                <div className="rounded-card bg-white p-5 shadow-soft">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {step.heading}
                  </h3>
                  <p className="mt-1 text-ink/70">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              Build your quote
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gradient-to-br from-timber-dark via-timber to-timber-dark py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-display text-3xl lg:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-white/80">
            We’re here to help you get the space you need, right across the
            Lowveld.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              Build your quote
            </Link>
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand transition hover:bg-brand-50"
            >
              WhatsApp us
            </a>
            <a
              href={BUSINESS.phone.href}
              className="inline-flex items-center gap-2 rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Call {BUSINESS.phone.display}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
