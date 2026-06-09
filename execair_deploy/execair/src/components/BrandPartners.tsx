import Image from "next/image";
import { brandPartners } from "@/lib/data";

export default function BrandPartners() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="section-label mb-4">Our Success & Brand Partners</p>
          <h2 className="section-heading">Trusted brands we work with</h2>
          <p className="mt-4 leading-relaxed text-brand-navy/60">
            Our success hinges on providing legendary customer service. We partner with
            the world&apos;s leading HVAC manufacturers to deliver quality you can rely on.
          </p>
          <blockquote className="mt-6 border-l-4 border-brand-teal/30 pl-4 text-left italic text-brand-navy/50">
            &ldquo;Customer service shouldn&rsquo;t just be a department; it should be the entire company.&rdquo;
            <span className="mt-1 block text-sm not-italic">— Tony Hsieh</span>
          </blockquote>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-6 md:grid-cols-5">
          {brandPartners.map((partner) => (
            <div
              key={partner.name}
              className="group flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-6 transition-all duration-300 hover:border-brand-teal/20 hover:bg-white hover:shadow-lg"
            >
              <Image
                src={partner.image}
                alt={partner.name}
                width={120}
                height={60}
                className="h-20 w-auto object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 md:h-24"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
