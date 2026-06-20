import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/site/company";
import { cities } from "@/lib/site/cities";
import PageHeader from "@/components/site/PageHeader";
import ClosingCta from "@/components/site/ClosingCta";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About H&S Labour Brokers — Trusted Recruitment & TES Since 1998",
  description:
    "Discover the story behind H&S Labour Brokers. Since 1998 we have connected South African employers with top talent, offering recruitment, TES, payroll, vetting, HR/IR and CV handling across Johannesburg, Cape Town, Durban, Pretoria, Gqeberha and Bloemfontein. Backed by a placement guarantee and full compliance support.",
  alternates: { canonical: "/about" },
};

const reasons = [
  {
    title: "25+ years of experience",
    body: "We understand the South African labour market and legal landscape.",
  },
  {
    title: "Registered compliance",
    body: "Fully registered with the Department of Employment and Labour.",
  },
  {
    title: "Placement guarantee",
    body: "We back our permanent placements with a replacement period for your peace of mind.",
  },
  {
    title: "Compliance handled for you",
    body: "Our TES solutions manage payroll, UIF, PAYE, SDL and IR responsibilities, including s198A deeming and joint-and-several liability.",
  },
  {
    title: "Tailored solutions",
    body: "From permanent hires to large-scale temporary workforces, we customise our offering to your business.",
  },
];

export default function AboutPage() {
  const yearsOfService = new Date().getFullYear() - company.foundedYear;

  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="Your trusted workforce partner since 1998"
        intro={`For over ${yearsOfService} years, H&S Labour Brokers has connected South African employers with the right people. Founded in ${company.foundedYear}, we combine deep industry knowledge with a personal, results-driven approach.`}
        imageSrc="/images/about-team.jpg"
        imageAlt="The H&S Labour Brokers team"
      >
        <Link
          href="/employers"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
        >
          <span>Hire Staff</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHeader>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-navy">Our story</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Since our inception, H&S Labour Brokers has grown into a trusted
            partner for businesses across South Africa. We specialise in
            permanent and contract recruitment, temporary employment services
            (TES), payroll, vetting, HR & IR management, and CV response
            handling. Whether you need a single key hire or a full contingent
            workforce, we bring the same dedication to every placement.
          </p>
        </div>
      </section>

      <section className="bg-mint py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-navy text-balance">
            Why employers choose H&S Labour Brokers
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6"
              >
                <CheckCircle2
                  className="mt-0.5 h-6 w-6 shrink-0 text-green-dark"
                  aria-hidden
                />
                <div>
                  <h3 className="font-semibold text-navy">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {r.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              Accreditations
            </h2>
            <ul className="mt-4 space-y-2">
              {company.accreditations.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-green-dark"
                    aria-hidden
                  />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">
              Areas we serve
            </h2>
            <p className="mt-4 text-slate-600">
              We provide labour broking and recruitment services across South
              Africa, including:
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-700">
              {cities.map((city) => (
                <li key={city.slug} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-green-dark">
                    •
                  </span>
                  {city.name}, {city.province}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}