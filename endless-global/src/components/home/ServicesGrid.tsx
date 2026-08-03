import Link from "next/link";
import { homeServices } from "@/lib/content";

export default function ServicesGrid() {
  return (
    <section className="bg-section py-16 md:py-24">
      <div className="eg-container">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Our Services</span>
          <h2 className="section-title mt-4">Explore the Areas we Cover</h2>
          <p className="mt-4 text-muted">
            From finance to trade, we connect you with specialists who deliver
            results.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {homeServices.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="group block bg-white rounded-xl p-6 border border-line shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <img
                src={s.icon}
                alt=""
                aria-hidden="true"
                className="h-14 w-14 object-contain"
              />
              <h3 className="mt-5 text-lg font-semibold uppercase tracking-wide text-brand">
                {s.name}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {s.text}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all">
                Learn More →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
