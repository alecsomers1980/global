import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import { portfolioData } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const all = portfolioData.flatMap((s) => s.projects.map((p) => ({ ...p, sector: s.title })));
  const project = all.find((p) => p.slug === slug);
  if (!project) return { title: "Not Found" };

  return {
    title: `${project.name} | HVAC Project Portfolio`,
    description: project.description,
    keywords: [
      project.name,
      "HVAC project",
      project.sector.toLowerCase(),
      "air conditioning installation",
      "Exec-Air",
      project.location || "",
    ].filter(Boolean),
    openGraph: {
      title: `${project.name} — Exec-Air HVAC Project`,
      description: project.description,
      images: project.image ? [{ url: project.image }] : [],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const all = portfolioData.flatMap((s) => s.projects.map((p) => ({ ...p, sector: s.title })));
  const project = all.find((p) => p.slug === slug);
  if (!project) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.description,
    provider: {
      "@type": "Organization",
      name: "Exec-Air Air Conditioning",
    },
    locationCreated: project.location ? { "@type": "Place", name: project.location } : undefined,
    dateCreated: project.year,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageBanner
        title={project.name}
        subtitle={project.location || project.sector}
      />

      {/* Project Detail */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            {/* Featured Image */}
            <div className="mb-12 overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={project.image}
                alt={project.name}
                width={1200}
                height={700}
                className="w-full object-cover"
                priority
              />
            </div>

            {/* Key Details Grid */}
            <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Sector", value: project.sector, icon: "🏢" },
                { label: "Year", value: project.year, icon: "📅" },
                { label: "Location", value: project.location, icon: "📍" },
                { label: "Client", value: project.client, icon: "👤" },
              ].map((detail) =>
                detail.value ? (
                  <div
                    key={detail.label}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5"
                  >
                    <span className="text-xl">{detail.icon}</span>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-navy/40">
                      {detail.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-brand-navy">{detail.value}</p>
                  </div>
                ) : null
              )}
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-brand-navy">Project Overview</h2>
              <p className="text-lg leading-relaxed text-brand-navy/70">{project.description}</p>
            </div>

            {/* Equipment Used */}
            {project.equipment && (
              <div className="mb-12 rounded-2xl border border-brand-teal/10 bg-brand-sky/10 p-8">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-brand-navy">
                  <svg className="h-6 w-6 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Equipment Installed
                </h2>
                <p className="leading-relaxed text-brand-navy/70">{project.equipment}</p>
              </div>
            )}

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6 text-2xl font-bold text-brand-navy">Project Gallery</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {project.gallery.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl shadow-md">
                      <Image
                        src={img}
                        alt={`${project.name} — image ${i + 1}`}
                        width={600}
                        height={400}
                        className="w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-3xl bg-brand-navy p-10 text-center">
              <h2 className="mb-4 text-2xl font-bold text-white">
                Interested in a similar project?
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-white/60">
                Our team delivers the same level of quality and expertise for every project — large
                or small. Get in touch for a consultation tailored to your requirements.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-8 py-3.5 font-semibold text-white transition-all hover:bg-brand-teal/90 hover:shadow-lg"
                >
                  Request a Consultation
                </Link>
                <Link
                  href="/product-range"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-8 py-3.5 font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
                >
                  Browse Our Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
