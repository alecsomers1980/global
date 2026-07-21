import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { BUSINESS } from "@/data/business";
import { STANDARD_FEATURES, MAINTENANCE_NOTE } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Caring for Your Timber Building | Wendy Lane Nelspruit",
  description:
    "How to look after a timber Wendy house or cabin in the Lowveld — what we treat before delivery, why annual re-coating matters, and a simple seasonal check.",
  alternates: { canonical: "/care" },
};

/** General timber good-practice — deliberately framed as guidance, not as a
 *  Wendy Lane specification, since only the treatment facts come from the price list. */
const SEASONAL_CHECKS = [
  {
    title: "Walk around it once a season",
    copy: "Look for bare, faded or chalky patches on the outside walls — especially the north and west faces, which take the hardest sun. Those are the spots that need coating first.",
  },
  {
    title: "Keep vegetation off the timber",
    copy: "Trim back shrubs and creepers touching the walls. Plants trap moisture against timber and hold it there long after the rain has stopped.",
  },
  {
    title: "Keep the base clear",
    copy: "Don't stack soil, sand or firewood against the walls. Anything piled against timber keeps it damp and gives insects a bridge past the treated base.",
  },
  {
    title: "Check after storms",
    copy: "After heavy Lowveld rain or wind, check the roof sheeting and that water is running away from the structure rather than pooling underneath it.",
  },
];

export default function CarePage() {
  return (
    <>
      <PageHeader
        eyebrow="Owners' guide"
        title="Caring for your timber building"
        intro="A timber building that gets looked after will outlast one that doesn't — by years. Here's exactly what we do before it leaves our factory, and the one job that's yours."
      />

      {/* What we do */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand">
            Before it leaves us
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tightest text-ink sm:text-4xl">
            What we treat as standard
          </h2>
          <p className="mt-5 leading-relaxed text-ink/65">
            Every Wendy house we build gets the following at no extra cost — it is
            part of the price, not an upsell:
          </p>
          <ul className="mt-8 space-y-4">
            {STANDARD_FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex gap-4 rounded-card border border-ink/10 bg-cream p-5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-ink/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The one yearly job */}
      <section className="bg-cream py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand">
            Your job, once a year
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tightest text-ink sm:text-4xl">
            Re-coat the outside
          </h2>
          <div className="mt-8 rounded-card border-l-4 border-leaf bg-white p-6 shadow-soft">
            <p className="font-semibold text-ink">{MAINTENANCE_NOTE}</p>
            <p className="mt-3 leading-relaxed text-ink/70">
              This is the single biggest factor in how long your building lasts.
              Lowveld sun breaks down the sealant coat over a season, and once the
              timber underneath is exposed it starts taking on water. Re-coating
              once a year keeps that from ever starting — it is far cheaper than
              repairing timber that has already been left bare.
            </p>
          </div>
        </div>
      </section>

      {/* Seasonal checks */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand">
            Good practice
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tightest text-ink sm:text-4xl">
            A five-minute seasonal check
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {SEASONAL_CHECKS.map((check, i) => (
              <div
                key={check.title}
                className="rounded-card border border-ink/10 bg-cream p-6 transition-shadow hover:shadow-soft"
              >
                <span className="font-display text-3xl font-semibold text-leaf">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-semibold text-ink">{check.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {check.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-timber-dark via-timber to-timber-dark py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tightest sm:text-4xl">
            Not sure what your building needs?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">
            Send us a photo on WhatsApp and we&rsquo;ll tell you straight whether
            it needs a coat, a repair, or nothing at all.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-white px-8 py-3.5 font-semibold text-timber transition hover:bg-cream"
            >
              WhatsApp us a photo
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/40 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
