import Link from "next/link";
import { BookOpen, Check, Download } from "lucide-react";
import Container from "@/components/site/Container";

export default function EbookPromo() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-navy px-6 py-12 ring-1 ring-navy/10 sm:px-10 lg:grid-cols-2 lg:px-14">
          {/* Text */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green">
              For Job Seekers
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Land your next job faster with our job-hunting e-book
            </h2>
            <p className="mt-4 max-w-md text-slate-300">
              Practical, step-by-step strategies to write a standout CV, ace
              interviews and get noticed by employers — written by recruitment
              professionals.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green" /> Instant download after
                secure checkout
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green" /> Real, recruiter-tested
                advice
              </li>
            </ul>

            <div className="mt-8">
              <Link
                href="/ebook"
                className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                Buy the e-book
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              Want to earn instead? Promote the e-book and earn commission on
              every sale —{" "}
              <Link
                href="/affiliate-program"
                className="font-semibold text-green hover:text-green-dark"
              >
                join our affiliate program
              </Link>
              .
            </p>
          </div>

          {/* Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="flex aspect-[3/4] w-56 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-green to-green-dark p-6 text-center text-navy shadow-xl ring-1 ring-white/20">
              <BookOpen className="h-14 w-14" />
              <p className="mt-4 text-lg font-bold leading-tight">
                Job-Hunting Guide
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-navy/70">
                H&amp;S Labour Brokers
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
