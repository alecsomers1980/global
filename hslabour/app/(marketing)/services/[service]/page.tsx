import { services, getService } from "@/lib/site/services";
import { cities } from "@/lib/site/cities";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ServiceJsonLd from "@/components/seo/ServiceJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import PageHeader from "@/components/site/PageHeader";
import ClosingCta from "@/components/site/ClosingCta";
import { ArrowRight } from "lucide-react";

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateStaticParams() {
  return services.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.tagline,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <ServiceJsonLd name={service.name} description={service.description} />
      <FaqJsonLd faqs={service.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${slug}` },
        ]}
      />

      <PageHeader
        eyebrow="Our Services"
        title={service.name}
        intro={service.tagline}
        imageSrc="/images/about-handshake.jpg"
        imageAlt={service.name}
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
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
              Employer challenge
            </p>
            <p className="mt-3 leading-relaxed text-slate-700">
              {service.challenge}
            </p>
          </div>
          <div className="rounded-2xl bg-navy p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-green">
              Our solution
            </p>
            <p className="mt-3 leading-relaxed text-slate-300">
              {service.solution}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div
            className="prose max-w-none leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        </div>
      </section>

      <section className="bg-mint py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-navy">
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-4">
            {service.faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer font-medium text-navy list-none marker:content-none after:ml-2 after:text-green-dark after:content-['+'] group-open:after:content-['–']">
                  {faq.q}
                </summary>
                <p className="mt-3 leading-relaxed text-slate-600">{faq.a}</p>
              </details>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-navy">
            Available across South Africa
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/${city.slug}/${service.locationSlug}`}
                  className="block rounded-lg bg-slate-50 px-4 py-2 text-slate-800 transition-colors hover:bg-mint hover:text-navy"
                >
                  {city.name}, {city.province}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}