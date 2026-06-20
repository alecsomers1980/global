import Container from "@/components/site/Container";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ArrowRight, Search, Award, RefreshCw } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-mint">
      {/* Decorative ring outlines top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-10 h-40 w-40 rounded-full border-2 border-green/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-14 h-32 w-32 rounded-full border border-green/20"
      />

      {/* Dot grid bottom-left */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-8 h-32 w-40 opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#46D835" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      <Container className="relative z-10 py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="animate-fade-up">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
              Recruitment & Workforce Solutions
            </p>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-navy sm:text-5xl lg:text-6xl">
              Your partner in recruitment &{" "}
              <span className="text-green-dark">workforce solutions</span>.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg text-slate-600">
              Permanent & contract recruitment, Temporary Employment Services,
              payroll, vetting and HR — compliant, guaranteed, and delivered
              nationwide since 1998.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/employers"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-dark"
              >
                Hire Staff
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/20 bg-white px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/60"
              >
                Find a Job
                <Search className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-dark" />
                Dept. of Employment & Labour
              </span>
              <span className="inline-flex items-center gap-2">
                <Award className="h-4 w-4 text-green-dark" />
                25+ years&apos; experience
              </span>
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-dark" />
                Guaranteed replacement
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN — framed photo with decorative accents */}
          <div className="relative mx-auto hidden lg:block">
            <div className="relative h-[26rem] w-[26rem] overflow-hidden rounded-full shadow-xl ring-8 ring-navy">
              <Image
                src="/images/hero-people.jpg"
                alt="H&S Labour Brokers recruitment consultants"
                fill
                sizes="26rem"
                className="object-cover"
                priority
              />
            </div>
            {/* Concentric ring */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-full border border-green/40"
            />
            {/* Small dot cluster */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 top-10 h-24 w-24 opacity-40"
              viewBox="0 0 24 24"
              fill="#46D835"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="4" cy="4" r="2" />
              <circle cx="14" cy="6" r="1.5" />
              <circle cx="20" cy="16" r="2.5" />
              <circle cx="8" cy="18" r="1" />
              <circle cx="12" cy="12" r="1.5" />
            </svg>
          </div>
        </div>
      </Container>
    </section>
  );
}