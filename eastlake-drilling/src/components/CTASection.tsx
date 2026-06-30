import React from "react";
import Link from "next/link";
import { company } from "@/lib/content";

const CTASection: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container-px rounded-3xl bg-gradient-to-r from-brand to-brand-dark py-16 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to secure your own water supply?
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Get a free, no‑obligation quote tailored to your property and water needs.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-full bg-white px-8 py-3 font-semibold text-brand transition hover:bg-gray-100"
          >
            Request a Quote
          </Link>
          <Link
            href={company.phoneHref}
            className="rounded-full border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white hover:text-brand"
          >
            Call {company.phone}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;