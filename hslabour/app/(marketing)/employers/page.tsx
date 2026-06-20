import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/site/services";
import { company } from "@/lib/site/company";
import ContactForm from "@/components/forms/ContactForm";
import Container from "@/components/site/Container";
import PageHeader from "@/components/site/PageHeader";
import { ArrowRight, RefreshCw, ShieldCheck, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Hire Staff — Labour Broking, TES & Recruitment",
  description:
    "Partner with H&S Labour Brokers for permanent, contract and temporary staffing across South Africa. 25+ years of trusted workforce solutions, compliance handled for you.",
  alternates: { canonical: "/employers" },
};

const steps = [
  {
    step: "1",
    title: "Brief",
    desc: "Tell us what you need — skills, experience, culture fit.",
  },
  {
    step: "2",
    title: "Source & Screen",
    desc: "We headhunt, vet, and shortlist top candidates.",
  },
  {
    step: "3",
    title: "Place",
    desc: "You interview the best; we handle contracts & onboarding.",
  },
  {
    step: "4",
    title: "Guarantee",
    desc: "If a candidate does not work out, we replace them — no extra cost.",
  },
];

export default function EmployersPage() {
  return (
    <>
      <PageHeader
        eyebrow="For Employers"
        title="Your partner in recruitment"
        intro="Scale your team with confidence. H&S Labour Brokers delivers permanent, contract and temporary staffing — backed by 25+ years of experience and a guarantee that protects your investment."
        imageSrc="/images/hero-people.jpg"
        imageAlt="H&S Labour Brokers recruitment team"
      >
        <a
          href="#request-staff"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
        >
          Request staff <ArrowRight className="h-4 w-4" />
        </a>
      </PageHeader>

      {/* What We Handle */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
              What we handle
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              End-to-end workforce services
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green hover:shadow-xl"
              >
                <h3 className="text-lg font-semibold text-navy">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {service.tagline}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="bg-mint py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              A simple, proven process
            </h2>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <li key={item.step} className="text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green text-lg font-bold text-navy">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Your Assurance */}
      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Your assurance
            </h2>
            <div className="mt-10 space-y-8">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mint text-green-dark">
                  <RefreshCw className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy">
                    Replacement guarantee
                  </h3>
                  <p className="mt-1 text-slate-600">
                    If a permanent placement doesn&apos;t work out within an
                    agreed period, we find a replacement at no additional fee —
                    your investment stays protected.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mint text-green-dark">
                  <ShieldCheck className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy">
                    TES compliance handled
                  </h3>
                  <p className="mt-1 text-slate-600">
                    For temporary placements we manage all payroll, UIF, PAYE,
                    SDL and labour-law obligations — including LRA section 198A
                    (deeming) and joint-and-several liability.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mint text-green-dark">
                  <Award className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-navy">
                    25+ years of trust
                  </h3>
                  <p className="mt-1 text-slate-600">
                    {`Operating since ${company.foundedYear}, we bring deep market knowledge and a proven track record to every assignment.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Request Form */}
      <section id="request-staff" className="bg-mint py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Start hiring today
            </h2>
            <p className="mt-3 text-center text-slate-600">
              Describe your needs and we&apos;ll get back to you within one
              business day.
            </p>
            <div className="mt-10">
              <ContactForm heading="Request staff" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}