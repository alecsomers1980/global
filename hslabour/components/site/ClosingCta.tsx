import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/site/Container";

export default function ClosingCta() {
  return (
    <section className="bg-mint py-16 sm:py-24">
      <Container>
        <div className="grid overflow-hidden rounded-3xl shadow-sm ring-1 ring-navy/10 md:grid-cols-2">
          {/* LEFT — NAVY */}
          <div className="relative flex flex-col bg-navy px-6 py-16 sm:px-10 lg:px-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10"
            />
            <p className="text-sm font-semibold uppercase tracking-wider text-green">
              For Career Seekers
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Discover your next career move
            </h2>
            <p className="mt-4 max-w-md text-slate-300">
              Browse live vacancies across South Africa and apply in minutes.
            </p>
            <Link
              href="/jobs"
              className="mt-8 inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
            >
              Browse Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* RIGHT — GREEN */}
          <div className="relative flex flex-col bg-green px-6 py-16 text-navy sm:px-10 lg:px-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-navy/70">
              For Employers
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Let&apos;s build your team
            </h2>
            <p className="mt-4 max-w-md text-navy/80">
              From a single specialist to large-scale TES — tell us what you need
              and we&apos;ll handle the rest.
            </p>
            <Link
              href="/employers"
              className="mt-8 inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-navy px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-navy-dark hover:-translate-y-0.5"
            >
              Request Staff
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
