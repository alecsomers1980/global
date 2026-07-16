import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/data/business";

export const metadata: Metadata = {
  title: "Contact Wendy Lane | Wendy Houses in Nelspruit",
  description:
    "Contact Wendy Lane in Nelspruit for Wendy houses and Frame Built cabins. Call 013 755 2408, WhatsApp 071 469 6131 or email sales@wozawendylane.co.za. We build across the Lowveld.",
};

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-brand py-16 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="font-display text-4xl lg:text-5xl">Talk to us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 lg:text-xl">
            We’re in Nelspruit, and we build across the Lowveld.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Call us */}
            <div className="rounded-card bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                Call us
              </h2>
              <a
                href={BUSINESS.phone.href}
                className="mt-2 block text-2xl font-semibold text-brand"
              >
                {BUSINESS.phone.display}
              </a>
              <p className="mt-1 text-sm text-ink/60">
                Sales:{" "}
                <a
                  href={BUSINESS.sales.href}
                  className="font-medium text-brand underline"
                >
                  {BUSINESS.sales.name}
                </a>{" "}
                —{" "}
                <a
                  href={BUSINESS.sales.href}
                  className="font-medium text-brand underline"
                >
                  {BUSINESS.sales.display}
                </a>
              </p>
            </div>

            {/* WhatsApp */}
            <div className="rounded-card bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                WhatsApp
              </h2>
              <a
                href={BUSINESS.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-2xl font-semibold text-brand"
              >
                {BUSINESS.whatsapp.display}
              </a>
              <p className="mt-1 text-sm text-ink/60">
                Quickest way to reach us. Send a photo of your site and we’ll
                take it from there.
              </p>
            </div>

            {/* Email */}
            <div className="rounded-card bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                Email
              </h2>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="mt-2 block break-all text-lg font-semibold text-brand"
              >
                {BUSINESS.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Visit us + hours */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 lg:grid lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="font-display text-3xl text-ink">Find us</h2>
            <address className="mt-4 space-y-1 not-italic text-ink/80">
              <p>{BUSINESS.address.street}</p>
              <p>
                {BUSINESS.address.city}, {BUSINESS.address.region}{" "}
                {BUSINESS.address.postalCode}
              </p>
              <p>{BUSINESS.address.country}</p>
            </address>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${BUSINESS.geo.lat},${BUSINESS.geo.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-card bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-600"
            >
              Get directions
            </a>
          </div>

          <div className="mt-10 lg:mt-0">
            <h2 className="font-display text-3xl text-ink">Office hours</h2>
            <dl className="mt-4 divide-y divide-ink/10">
              {BUSINESS.hours.map((slot) => (
                <div
                  key={slot.days}
                  className={`flex justify-between py-2 ${
                    slot.time === "Closed" ? "text-ink/40" : "text-ink/80"
                  }`}
                >
                  <dt className="font-medium">{slot.days}</dt>
                  <dd>{slot.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="overflow-hidden rounded-card">
          <iframe
            src={`https://maps.google.com/maps?q=${BUSINESS.geo.lat},${BUSINESS.geo.lng}&z=14&output=embed`}
            title="Wendy Lane, Plot 52 Cairn Road, Nelspruit"
            className="aspect-[21/9] w-full"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* Quote CTA */}
      <section className="bg-brand py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="font-display text-3xl lg:text-4xl">
            Would you rather just see the price?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-white/80">
            Use our online quote builder — real prices, no surprises.
          </p>
          <Link
            href="/quote"
            className="mt-6 inline-flex items-center gap-2 rounded-card bg-white px-8 py-3 font-semibold text-brand transition hover:bg-brand-50"
          >
            Build your quote
          </Link>
        </div>
      </section>
    </>
  );
}
