import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import BottomCTA from "@/components/BottomCTA";
import { faqs, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "HVAC FAQ — Air Conditioning Krugersdorp & Johannesburg",
  description:
    "Frequently asked questions about Exec-Air Air Conditioning — service areas, brands installed, B-BBEE status, inverter vs non-inverter, maintenance contracts, and more.",
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    url: "/faq",
    title: "HVAC FAQ — Exec-Air Air Conditioning",
    description:
      "Service areas, brands, maintenance contracts, inverter technology and more.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_ZA",
  },
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PageBanner
        title="HVAC Frequently Asked Questions"
        subtitle="Everything you need to know about Exec-Air Air Conditioning — our service areas, the brands we install, our B-BBEE status, maintenance contracts, and how to choose the right system."
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <div className="space-y-6">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm transition-all open:shadow-md"
              >
                <summary className="cursor-pointer list-none">
                  <h2 className="flex items-center justify-between text-lg font-semibold text-brand-navy">
                    {f.q}
                    <span className="ml-4 text-brand-teal transition-transform group-open:rotate-45">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </h2>
                </summary>
                <p className="mt-4 leading-relaxed text-brand-navy/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA />
    </>
  );
}
