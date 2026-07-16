import Link from "next/link";
import { programs } from "@/lib/content";
import { CheckCircle2, ArrowRight, GraduationCap, BookOpen } from "lucide-react";

const iconMap = {
  school: GraduationCap,
  "tutor-centre": BookOpen,
} as const;

export default function Programs() {
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-brand-teal">
            What We Offer
          </p>
          <h2 className="mt-2 font-heading text-3xl text-brand-navy md:text-4xl">
            Two Paths, One Philosophy
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {programs.map((program) => {
            const Icon = iconMap[program.slug as keyof typeof iconMap] ?? GraduationCap;

            return (
              <article
                key={program.slug}
                className="flex flex-col rounded-3xl border border-brand-sky bg-white p-8 shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="mb-6 inline-flex rounded-full bg-brand-teal/10 p-4">
                  <Icon className="h-8 w-8 text-brand-teal" aria-hidden="true" />
                </div>

                <span className="mb-2 inline-block w-fit rounded-full bg-brand-sky/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                  {program.grade}
                </span>

                <h3 className="font-heading text-2xl font-bold text-brand-navy md:text-3xl">
                  {program.name}
                </h3>

                <p className="mt-3 text-base leading-relaxed text-brand-navy/80">
                  {program.summary}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {program.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-brand-navy/80">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-teal"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={program.href}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-teal transition hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}