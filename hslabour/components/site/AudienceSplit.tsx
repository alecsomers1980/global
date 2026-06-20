import Container from "@/components/site/Container";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AudienceSplit() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Employer Card */}
          <div className="flex flex-col rounded-2xl bg-navy p-10 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-green">I&apos;m an Employer</p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight">Build a reliable, compliant workforce</h3>
            <p className="mt-3 flex-1 text-base text-slate-300">
              From a single specialist to large-scale TES, we recruit, vet and manage the people who keep your business moving — and carry the compliance load for you.
            </p>
            <Link
              href="/employers"
              className="group mt-8 inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
            >
              Request Staff
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Career Seeker Card */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">I&apos;m a Career Seeker</p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-navy">Take the next step in your career</h3>
            <p className="mt-3 flex-1 text-base text-slate-600">
              Browse live vacancies across South Africa and apply in minutes. We place permanent, contract and temporary roles across many sectors.
            </p>
            <Link
              href="/jobs"
              className="group mt-8 inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-navy-dark hover:-translate-y-0.5"
            >
              Browse Jobs
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}