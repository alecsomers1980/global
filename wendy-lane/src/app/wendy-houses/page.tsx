import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  WENDY_SIZES,
  VERANDAS,
  EXTRAS,
  STANDARD_FEATURES,
  MAINTENANCE_NOTE,
  PRICE_LIST_DATE,
  DELIVERY_NOTE,
  LARGE_LAYOUTS,
  LARGE_LAYOUT_TIERS,
  formatRand,
  priceOrPOA,
} from '@/data/pricing';
import { BUSINESS } from '@/data/business';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: 'Wendy House Prices Nelspruit | Sizes & Price List | Wendy Lane',
  description:
    'Wendy house prices in Nelspruit – full published price list for all 11 standard sizes, verandas & extras. Real prices incl. VAT. Timber huts for storage, security, site offices, accommodation.',
};

const minWendyPrice = Math.min(...WENDY_SIZES.map((s) => s.priceNoWindow));

const useCards = [
  {
    name: 'Garden sheds',
    href: '/gallery#wendy-houses',
    img: '/images/range-wendy.jpg',
    copy: 'The flexible, affordable multi-purpose answer. The \'do anything\' garden shed, or a playroom for your child.',
  },
  {
    name: 'Guard huts',
    href: '/gallery#wendy-houses',
    img: '/images/projects/guard-hut.jpg',
    copy: 'A quick, attractive answer to security needs, from one-man sentry rooms to gate control.',
  },
  {
    name: 'Site offices',
    href: '/gallery#wendy-houses',
    img: '/images/projects/site-office.jpg',
    copy: 'Offices, meeting rooms and project rooms. Dismantle it, move it to the next site, use it again.',
  },
  {
    name: 'Site accommodation',
    href: '/gallery#wendy-houses',
    img: '/images/projects/site-accommodation.jpg',
    copy: 'Single rooms, bunk rooms for teams, multi-room units, eating halls.',
  },
  {
    name: 'Storerooms',
    href: '/gallery#wendy-houses',
    img: '/images/projects/storeroom.jpg',
    copy: 'Storage is usually dead space where simplicity is key. Add or remove windows and doors, or partition it.',
  },
  {
    name: 'Clinics',
    href: '/gallery#wendy-houses',
    img: '/images/projects/clinic.jpg',
    copy: 'Simple, affordable, durable and quick to erect. Ideal for clinics in remote places.',
  },
  {
    name: 'Classrooms',
    href: '/gallery#wendy-houses',
    img: '/images/projects/classroom.jpg',
    copy: 'Classroom space in remote areas or on construction sites, without a lengthy building project.',
  },
];

export default function WendyHousesPage() {
  return (
    <>
      {/* Header */}
      <PageHeader
        eyebrow="The range"
        title="Wendy Houses"
        intro="A traditional Wendy House is a simple utility structure — storage, security rooms, site offices, staff accommodation. Timber is the most popular material for cost, availability and being environmentally friendly."
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
          From {formatRand(minWendyPrice)}
        </div>
      </PageHeader>

      {/* What it's for */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tightest text-ink mb-10">
            What people use them for
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {useCards.map((card) => (
              <Link
                key={card.name}
                href={card.href}
                className="rounded-card overflow-hidden bg-white border border-ink/10 hover:border-brand hover:shadow-lg transition group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={card.img}
                    alt={card.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold text-ink group-hover:text-brand transition-colors">
                    {card.name}
                  </h3>
                  <p className="mt-1 text-gray-600 text-sm leading-relaxed">
                    {card.copy}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Price list */}
      <section id="prices" className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tightest text-ink mb-4">
            Wendy House price list
          </h2>
          <p className="text-gray-700 mb-8 max-w-2xl">
            These are our real prices, published in full — prices include VAT @ 15%, and{' '}
            {DELIVERY_NOTE.toLowerCase()}
          </p>

          <figure>
            <div className="overflow-x-auto rounded-card border border-ink/10 shadow-soft">
              <table className="w-full min-w-[600px] text-sm sm:text-base">
                <thead className="bg-brand text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Code</th>
                    <th className="px-4 py-3 text-left">Size</th>
                    <th className="px-4 py-3 text-right">Door, no window</th>
                    <th className="px-4 py-3 text-center">Window</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">With one window</th>
                  </tr>
                </thead>
                <tbody>
                  {WENDY_SIZES.map((s) => (
                    <tr key={s.code} className="even:bg-white odd:bg-brand-50/40">
                      <td className="px-4 py-3 font-medium">{s.code}</td>
                      <td className="px-4 py-3">
                        {s.front}m × {s.side}m
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                        {formatRand(s.priceNoWindow)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          {s.windowType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                        {formatRand(s.priceOneWindow)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <figcaption className="mt-3 text-sm text-gray-600">
              Wendy Lane Wendy House price list — {PRICE_LIST_DATE}. All prices include VAT @ 15%.
            </figcaption>
          </figure>

          <div className="mt-8 text-center sm:text-left">
            <Link
              href="/quote"
              className="inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-700 transition"
            >
              Build your quote
            </Link>
          </div>
        </div>
      </section>

      {/* Verandas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tightest text-ink mb-4">Add a veranda</h2>
          <p className="text-gray-600 max-w-xl mb-8">
            Every veranda is 1.2m deep.
          </p>

          <figure>
            <div className="overflow-x-auto rounded-card border border-ink/10 shadow-soft">
              <table className="w-full min-w-[400px] text-sm sm:text-base">
                <thead className="bg-brand text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Code</th>
                    <th className="px-4 py-3 text-left">Size</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {VERANDAS.map((v) => (
                    <tr key={v.code} className="even:bg-white odd:bg-brand-50/40">
                      <td className="px-4 py-3 font-medium">{v.code}</td>
                      <td className="px-4 py-3">
                        {v.front}m × {v.side}m
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                        {formatRand(v.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <figcaption className="mt-3 text-sm text-gray-600">
              Veranda price list — {PRICE_LIST_DATE}. Prices include VAT @ 15%.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Extras */}
      <section className="bg-cream py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tightest text-ink mb-6">Extras & options</h2>

          <div className="grid gap-4 max-w-xl mb-8">
            {EXTRAS.map((ex) => (
              <div key={ex.id} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-ink/10 pb-2 last:border-b-0">
                <div>
                  <span className="font-medium text-ink">{ex.label}</span>
                  {ex.note && (
                    <span className="block text-sm text-gray-500 mt-0.5">{ex.note}</span>
                  )}
                </div>
                <span className="text-right tabular-nums font-semibold mt-1 sm:mt-0 sm:ml-6">
                  {priceOrPOA(ex.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-l-4 border-leaf bg-leaf/10 p-4 rounded max-w-xl">
            <p className="text-ink font-medium">Included in every Wendy, at no extra cost:</p>
            <ul className="mt-2 space-y-1 text-sm text-ink/80">
              {STANDARD_FEATURES.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden="true" className="text-brand font-bold">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink/60">{MAINTENANCE_NOTE}</p>
          </div>
        </div>
      </section>

      {/* Large layouts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tightest text-ink mb-4">
            Bigger layouts: Standard, Signature & Premium
          </h2>
          <p className="text-gray-600 max-w-2xl mb-10">
            Need a room, not a shed? We build four larger layouts, each in three
            specification levels. Every price below includes VAT @ 15%. {DELIVERY_NOTE}
          </p>

          {/* Layout price matrix */}
          <figure className="overflow-x-auto rounded-card border border-ink/10 mb-12">
            <table className="w-full text-left">
              <caption className="sr-only">
                Large Wendy house layouts priced across the Standard, Signature and Premium ranges
              </caption>
              <thead className="bg-brand text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Layout</th>
                  <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Size</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right whitespace-nowrap">Standard</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right whitespace-nowrap">Signature</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-right whitespace-nowrap">Premium</th>
                </tr>
              </thead>
              <tbody>
                {LARGE_LAYOUTS.map((l) => (
                  <tr key={l.slug} className="even:bg-white odd:bg-brand-50/40 border-t border-ink/10">
                    <th scope="row" className="px-4 py-3 font-medium text-ink text-left">{l.name}</th>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {l.size} · {l.area}m²
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatRand(l.prices.standard)}</td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatRand(l.prices.signature)}</td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatRand(l.prices.premium)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <figcaption className="px-4 py-3 text-sm text-gray-500 bg-white border-t border-ink/10">
              Wendy Lane large layout price list — {PRICE_LIST_DATE}. All prices include VAT @ 15%.
            </figcaption>
          </figure>

          {/* Floor plans */}
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink mb-6">The layouts</h3>
          <div className="grid gap-8 sm:grid-cols-2 mb-14">
            {LARGE_LAYOUTS.map((l) => (
              <div key={l.slug} className="rounded-card border border-ink/10 bg-white overflow-hidden">
                <div className="relative aspect-[4/3] bg-white">
                  <Image
                    src={l.plan}
                    alt={`Floor plan — ${l.name}, ${l.size}`}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-5 border-t border-ink/10">
                  <h4 className="font-display text-lg font-semibold text-ink">{l.name}</h4>
                  <p className="text-sm text-gray-600">{l.size} · {l.area}m²</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {l.features.map((f) => (
                      <li key={f} className="rounded-full bg-brand-50 text-brand text-xs font-medium px-3 py-1">
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-gray-700">
                    From <span className="font-semibold text-brand">{formatRand(l.prices.standard)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tier specs */}
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink mb-6">
            What each range gives you
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            {LARGE_LAYOUT_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="rounded-card border border-ink/10 p-6 flex flex-col bg-white shadow-soft"
              >
                <h4 className="font-display text-xl font-bold text-ink">{tier.name}</h4>
                <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
                  {tier.spec.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 text-leaf shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gradient-to-br from-timber-dark via-timber to-timber-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-6">
            Ready to plan your Wendy house?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white hover:bg-brand-700 transition"
            >
              Build your quote
            </Link>
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-card bg-white/10 px-6 py-3 font-semibold hover:bg-white/20 transition"
            >
              WhatsApp {BUSINESS.whatsapp.display}
            </a>
            <a
              href={BUSINESS.phone.href}
              className="inline-flex items-center gap-2 rounded-card bg-white/10 px-6 py-3 font-semibold hover:bg-white/20 transition"
            >
              {BUSINESS.phone.display}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
