import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  PRICE_LIST_DATE,
  FRAME_BUILT,
  FRAME_BUILT_INCLUSIONS,
  FRAME_BUILT_EXCLUSIONS,
  DELIVERY_NOTE,
  formatRand,
  priceOrPOA,
} from "@/data/pricing";
import { BUSINESS } from "@/data/business";

export const metadata: Metadata = {
  title: "Frame Built Timber Cabins & Chalet Prices | Wendy Lane Nelspruit",
  description:
    "Published price list for timber frame homes, cabins, chalets and offices in Nelspruit. Log, Chromadek, Nutec options. Prices include VAT and construction. Based in Nelspruit, Mpumalanga.",
};

export default function FrameBuiltPage() {
  const nonNullLogPrices = FRAME_BUILT.map((m) => m.log).filter(
    (p): p is number => p !== null,
  );
  const minLogPrice =
    nonNullLogPrices.length > 0 ? Math.min(...nonNullLogPrices) : null;
  const fromLogBadge = minLogPrice !== null ? `From ${formatRand(minLogPrice)}` : "POA";

  return (
    <>
      {/* Header */}
      <section className="bg-timber text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Frame Built Range
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-white/90 leading-relaxed">
            A timber frame structure is a different building system — it follows
            formal building regulations and performs like a conventional
            brick-and-mortar building. More than half the residential homes in
            the developed world are timber frame. These bear no resemblance to a
            Wendy House other than the timber in the structure.
          </p>
          <span className="mt-8 inline-block bg-white/20 text-white px-5 py-2 rounded-full text-lg font-medium backdrop-blur-sm">
            {fromLogBadge}
          </span>
        </div>
      </section>

      {/* Uses */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-ink text-center">
            What we build
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/frame-built/getaway-cabins",
                img: "/images/projects/getaway-cabin.jpg",
                title: "Getaway cabins",
                desc: "The affordable, attractive answer to a deep-in-nature getaway, erected just about anywhere.",
              },
              {
                href: "/frame-built/holiday-cottages",
                img: "/images/projects/holiday-cottage.jpg",
                title: "Holiday cottages",
                desc: "Simple, attractive, durable and quick to erect. An alternative to a long, expensive build.",
              },
              {
                href: "/frame-built/general-accommodation",
                img: "/images/projects/general-accommodation.jpg",
                title: "General accommodation",
                desc: "When you need more than a single room. Whether it's a farm manager or a family, our multi-roomed cabins do the job.",
              },
              {
                href: "/frame-built/offices",
                img: "/images/projects/office.jpg",
                title: "Offices",
                desc: "The perfect answer to an instant on-site office.",
              },
            ].map((card) => (
              <Link key={card.href} href={card.href} className="group block">
                <div className="overflow-hidden rounded-card bg-cream shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={card.img}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brand transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink/70 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Price List */}
      <section id="prices" className="bg-cream py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-ink text-center">
            Frame Built price list
          </h2>
          <div className="mt-10 overflow-x-auto rounded-card border border-ink/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-timber/10 text-ink font-semibold">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Bedrooms</th>
                  <th className="px-4 py-3">Log (knotty pine lining)</th>
                  <th className="px-4 py-3">Chromadek + dry walling</th>
                  <th className="px-4 py-3">Nutec + dry walling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {FRAME_BUILT.map((model) => {
                  const logDisplay = priceOrPOA(model.log);
                  const chromadekDisplay = priceOrPOA(model.chromadek);
                  const nutecDisplay = priceOrPOA(model.nutec);
                  const isPOA = (val: string) => val === "POA";
                  return (
                    <tr key={model.slug} className="hover:bg-white/60">
                      <td className="px-4 py-3 font-medium">{model.size}</td>
                      <td className="px-4 py-3">{model.area} m²</td>
                      <td className="px-4 py-3">{model.bedrooms} bed</td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${
                          isPOA(logDisplay) ? "text-gray-500 italic" : ""
                        }`}
                      >
                        {logDisplay}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${
                          isPOA(chromadekDisplay) ? "text-gray-500 italic" : ""
                        }`}
                      >
                        {chromadekDisplay}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${
                          isPOA(nutecDisplay) ? "text-gray-500 italic" : ""
                        }`}
                      >
                        {nutecDisplay}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <figure className="mt-4 text-center text-sm text-ink/60">
            <figcaption>
              Frame Built price list — {PRICE_LIST_DATE}. Prices include
              VAT @ 15% and construction. {DELIVERY_NOTE}
            </figcaption>
          </figure>
          <p className="mt-6 text-center text-sm text-ink/80">
            Building something not on this list?{" "}
            <a
              href={BUSINESS.phone.href}
              className="underline text-brand hover:text-brand-600"
            >
              Call us
            </a>{" "}
            or{" "}
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-brand hover:text-brand-600"
            >
              WhatsApp
            </a>{" "}
            and we&apos;ll quote your layout.
          </p>
        </div>
      </section>

      {/* Spec */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Standard in every building
            </h2>
            <ul className="mt-6 space-y-3">
              {FRAME_BUILT_INCLUSIONS.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-ink/80">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              What&rsquo;s not included
            </h2>
            <ul className="mt-6 space-y-3">
              {FRAME_BUILT_EXCLUSIONS.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-ink/70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink/50">
              These items are not included so you can manage them with your own
              contractors, keeping costs exactly where you need them.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="bg-ink text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold">
            Ready to start your project?
          </h2>
          <p className="mt-4 text-white/80 text-lg">
            We build strong, comfortable timber frame homes across Mpumalanga.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-card shadow-sm text-ink bg-white hover:bg-gray-100 transition-colors"
            >
              Request a quote
            </Link>
            <a
              href={BUSINESS.phone.href}
              className="inline-flex items-center px-6 py-3 border border-white/30 text-base font-medium rounded-card text-white hover:bg-white/10 transition-colors"
            >
              {BUSINESS.phone.display}
            </a>
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-white/30 text-base font-medium rounded-card text-white hover:bg-white/10 transition-colors"
            >
              WhatsApp {BUSINESS.whatsapp.display}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
