import Container from "@/components/site/Container";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { services } from "@/lib/site/services";
import { serviceHighlights } from "@/lib/site/highlights";

export default function AreasOfFocus({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
              Areas of Focus
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl text-balance">
              Everything your workforce needs
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From permanent placements to large-scale TES — every engagement backed
              by deep compliance expertise and our replacement guarantee.
            </p>
          </div>
        )}

        <div className={`${showHeader ? "mt-14 " : ""}grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}>
          {services.map((service) => {
            const highlights = serviceHighlights[service.slug] ?? [];
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-green hover:shadow-xl"
              >
                <h3 className="text-lg font-semibold text-navy">{service.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.tagline}</p>
                <ul className="mt-5 space-y-2">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-green-dark" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-green-dark">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}