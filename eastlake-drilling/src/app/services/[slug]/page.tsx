import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Phone } from "lucide-react";
import { services, company, whatsappHref } from "@/lib/content";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import ParallaxBanner from "@/components/ParallaxBanner";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import Icon from "@/components/Icon";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) return {};
  return {
    title: `${service.title} in Johannesburg & Gauteng – East Lake Drilling`,
    description: `${service.short} East Lake Drilling serves Johannesburg, Randburg and greater Gauteng.`,
  };
}

export default function ServiceDetail({
  params,
}: {
  params: { slug: string };
}) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  const otherServices = services.filter((s) => s.slug !== params.slug);

  return (
    <>
      <ServiceJsonLd service={service} />
      <PageHero
        eyebrow="Service"
        title={service.title}
        subtitle={service.short}
        image={service.image}
      />

      <section className="container-px py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            <p className="text-lg text-ink/80 leading-relaxed">
              {service.body}
            </p>

            {service.sections.map((section, i) => (
              <p key={i} className="mt-5 text-ink/70 leading-relaxed">
                {section}
              </p>
            ))}

            <h3 className="text-xl font-semibold mt-10">
              What&apos;s included
            </h3>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {service.features.map((feat) => (
                <li key={feat} className="flex gap-2 items-start">
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-ink/80">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 rounded-2xl border border-black/5 bg-white shadow-sm p-6 h-fit">
            <h3 className="font-semibold text-lg">Get a free quote</h3>
            <p className="text-sm text-ink/70 mt-1">
              Our team responds the same day — let&apos;s discuss your
              requirements.
            </p>

            <Link
              href="/contact"
              className="block text-center rounded-full bg-brand text-white px-5 py-3 font-medium hover:bg-brand-dark mt-4"
            >
              Request a quote
            </Link>

            <a
              href={company.phoneHref}
              className="flex items-center justify-center gap-2 mt-3 text-ink/70 hover:text-brand"
            >
              <Phone className="w-4 h-4" />
              {company.phone}
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center rounded-full border border-[#25D366] text-[#1c9c4d] px-5 py-3 font-medium hover:bg-[#25D366]/10 mt-3"
            >
              WhatsApp us
            </a>
          </aside>
        </div>
      </section>

      <ParallaxBanner
        image={service.image}
        title={`Professional ${service.title.toLowerCase()} in Gauteng`}
        subtitle="Domestic, commercial, agricultural and industrial sites across Johannesburg and surrounds."
        cta={{ label: "Get a Free Quote", href: "/contact" }}
        height="sm"
      />

      {/* Other services */}
      <section className="bg-white py-16">
        <div className="container-px">
          <h2 className="text-2xl font-bold">Other services</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherServices.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="rounded-xl border border-black/5 p-6 hover:shadow-md transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand grid place-items-center">
                  <Icon name={s.icon} className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mt-3 group-hover:text-brand">
                  {s.title}
                </h3>
                <p className="text-sm text-ink/70 mt-1">{s.short}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}