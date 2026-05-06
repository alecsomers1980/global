import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import ProjectCard from "@/components/ProjectCard";
import { portfolioData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Work | HVAC Projects Portfolio — Commercial, Industrial & Residential",
  description:
    "Explore Exec-Air's top HVAC installation projects across South Africa. See our work in commercial air conditioning, industrial cooling, and residential climate control. 35+ years of proven expertise.",
  keywords: [
    "HVAC projects South Africa",
    "air conditioning installations",
    "commercial HVAC portfolio",
    "industrial cooling projects",
    "residential aircon installations",
    "Exec-Air project gallery",
    "HVAC case studies",
    "air conditioning Gauteng",
  ],
  openGraph: {
    title: "Our Work | Exec-Air HVAC Project Portfolio",
    description:
      "Browse our top HVAC projects across commercial, industrial, and residential sectors in South Africa.",
  },
};

export default function OurWorkPage() {
  const portfolioSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Exec-Air HVAC Project Portfolio",
    description:
      "Showcase of HVAC, air conditioning, ventilation, and climate control projects by Exec-Air across commercial, industrial, and residential sectors in South Africa.",
    provider: {
      "@type": "Organization",
      name: "Exec-Air Air Conditioning",
      url: "https://execair.co.za",
    },
    about: { "@type": "Thing", name: "HVAC Installation Projects" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioSchema) }}
      />

      <PageBanner
        title="OUR WORK"
        subtitle="Explore our portfolio of HVAC projects across commercial, industrial, and residential sectors. Each installation reflects over 35 years of engineering expertise and commitment to quality."
      />

      {/* SEO Intro Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h1 className="mb-6 text-sm font-bold uppercase tracking-[0.25em] text-brand-teal">
              HVAC Project Portfolio — South Africa
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-brand-navy/60">
              From large-scale commercial air conditioning installations at hospitals and shopping
              centres to precision climate control for printing facilities and luxury residences,
              our portfolio demonstrates our capability across every sector. Each project is backed
              by our certified installation teams, premium equipment partnerships, and ongoing
              maintenance support.
            </p>

            {/* Stats bar */}
            <div className="mb-10 grid gap-6 sm:grid-cols-3">
              {[
                { value: "19+", label: "Featured Projects" },
                { value: "3", label: "Core Sectors" },
                { value: "35+", label: "Years Experience" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-brand-teal">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium uppercase tracking-wider text-brand-navy/40">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Decorative images */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="https://execair.co.za/wp-content/uploads/2024/07/EXEC_AIR_HVAC2-1024x819.png"
                  alt="Exec-Air commercial HVAC installation in progress"
                  width={600}
                  height={480}
                  className="h-64 w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="https://execair.co.za/wp-content/uploads/2023/08/heavy_industrial_hvac-system-1024x1024.png"
                  alt="Heavy industrial HVAC system by Exec-Air"
                  width={600}
                  height={480}
                  className="h-64 w-full object-cover"
                />
              </div>
            </div>

            {/* Company Profile CTA */}
            <div className="mt-10">
              <a
                href="/docs/EAMC-COMPANY-PROFILE-2025.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-brand-orange px-8 py-4 font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-orange/90 hover:shadow-lg hover:shadow-brand-orange/20 active:scale-95"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Company Profile
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Sections */}
      {portfolioData.map((section, sectionIndex) => (
        <section
          key={section.title}
          id={section.title.toLowerCase()}
          className={sectionIndex % 2 === 0 ? "bg-gray-50 py-24" : "bg-white py-24"}
        >
          <div className="container mx-auto px-6">
            {/* Section header with nav pills */}
            <div className="mb-12 flex flex-col items-center gap-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {portfolioData.map((s) => (
                  <a
                    key={s.title}
                    href={`#${s.title.toLowerCase()}`}
                    className={`rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                      s.title === section.title
                        ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/20"
                        : "bg-gray-200 text-brand-navy/60 hover:bg-gray-300"
                    }`}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
              <h2 className="text-3xl font-bold text-brand-navy md:text-4xl">
                {section.title} HVAC Projects
              </h2>
              <p className="max-w-xl text-center leading-relaxed text-brand-navy/50">
                {section.title === "Commercial"
                  ? "Climate control solutions for offices, retail, healthcare, education, and hospitality environments."
                  : section.title === "Industrial"
                    ? "Heavy-duty cooling and ventilation for factories, warehouses, and large-scale facilities."
                    : "Premium air conditioning for luxury homes, estate developments, and student accommodation."}
              </p>
            </div>

            {/* Project Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {section.projects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Bottom CTA */}
      <section className="bg-brand-navy py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            Ready to start your project?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/60">
            Whether you need a single split unit or a full-scale HVAC system for a commercial
            building, our team has the expertise to deliver. Get in touch for a consultation
            tailored to your requirements.
          </p>
          <Link href="/contact-us" className="btn-primary text-lg">
            Get a Free Consultation
          </Link>
        </div>
      </section>
    </>
  );
}
