import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";
import ProductGrid from "@/components/ProductGrid";
import { productCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Jet Air Product Range | Air Conditioners & HVAC Equipment",
  description:
    "Explore Exec-Air's complete Jet Air HVAC product range — high wall splits, cassettes, ducted systems, evaporative coolers, rooftop packages, and more. Professional installation across South Africa. Request a quote today.",
  keywords: [
    "Jet Air air conditioners",
    "HVAC products South Africa",
    "air conditioning equipment",
    "high wall split units",
    "cassette air conditioners",
    "ducted HVAC systems",
    "evaporative coolers",
    "commercial air conditioning",
    "industrial cooling solutions",
    "residential air conditioners",
    "air conditioner supplier Gauteng",
    "Jet Air product catalogue",
  ],
  openGraph: {
    title: "Jet Air Product Range | Exec-Air HVAC Equipment",
    description:
      "Browse the full Jet Air product catalogue — high wall splits, cassettes, ducted units, and industrial cooling. Expert installation across South Africa.",
  },
};

export default function ProductRangePage() {
  // JSON-LD Product Catalogue structured data
  const catalogueSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Jet Air HVAC Product Range",
    description:
      "Comprehensive range of Jet Air air conditioning and HVAC products available from Exec-Air, including split units, cassettes, ducted systems, evaporative coolers, and more.",
    provider: {
      "@type": "Organization",
      name: "Exec-Air Air Conditioning",
      url: "https://execair.co.za",
    },
    about: {
      "@type": "Thing",
      name: "HVAC Equipment",
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogueSchema) }}
      />

      <PageBanner
        title="jET AIR PRODUCT RANGE"
        subtitle="Explore our comprehensive range of air conditioning and ventilation solutions for every application — residential, commercial, and industrial. All products backed by professional installation and after-sales support."
      />

      {/* Intro / Trust Bar */}
      <section className="border-b border-gray-100 bg-white py-10">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 text-center md:grid-cols-4">
            {[
              { label: "Product Categories", value: "10" },
              { label: "Warranty Coverage", value: "Up to 10 Years" },
              { label: "Coverage Range", value: "9K – 365K BTU" },
              { label: "Installation", value: "Gauteng & Nationwide" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-brand-teal">{stat.value}</p>
                <p className="mt-1 text-sm font-medium uppercase tracking-wider text-brand-navy/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          {/* SEO-rich intro text */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-brand-teal">
              Complete HVAC Product Catalogue
            </p>
            <p className="text-lg leading-relaxed text-brand-navy/60">
              From whisper-quiet inverter split units for your home to heavy-duty evaporative
              coolers for industrial facilities, our Jet Air product range covers every climate
              control need. Each system is supplied and installed by our certified technicians
              with full warranty and ongoing maintenance support across Gauteng and beyond.
            </p>
          </div>

          <ProductGrid categories={productCategories} />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-navy py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Can&rsquo;t find what you need?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/60">
            Our team specifies and sources HVAC equipment for projects of all sizes. Get in touch
            for a personalised consultation — we&rsquo;ll help you find the perfect system for your
            space, budget, and performance requirements.
          </p>
          <a href="/contact-us" className="btn-primary text-lg">
            Speak to Our Team
          </a>
        </div>
      </section>
    </>
  );
}
