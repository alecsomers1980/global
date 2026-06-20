import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCity, cities } from "@/lib/site/cities";
import { getServiceByLocationSlug, services } from "@/lib/site/services";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import ServiceJsonLd from "@/components/seo/ServiceJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateStaticParams() {
  return cities.flatMap((city) =>
    services.map((service) => ({
      city: city.slug,
      service: service.locationSlug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = getCity(citySlug);
  const service = city ? getServiceByLocationSlug(serviceSlug) : undefined;
  if (!city || !service) return {};
  return {
    title: `${service.locationName} in ${city.name}`,
    description: `H&S Labour Brokers provides ${service.locationName.toLowerCase()} in ${city.name}, ${city.province}. ${service.tagline}`,
    alternates: { canonical: `/${citySlug}/${serviceSlug}` },
  };
}

export default async function CityServicePage({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = getCity(citySlug);
  const service = city ? getServiceByLocationSlug(serviceSlug) : undefined;

  if (!city || !service) notFound();

  const otherServicesInCity = services.filter(
    (s) => s.slug !== service.slug
  );
  const otherCitiesForService = cities.filter(
    (c) => c.slug !== city.slug
  );

  return (
    <>
      <LocalBusinessJsonLd
        city={city.name}
        service={service.locationName}
      />
      <BreadcrumbJsonLd
        items={[
          { name: city.name, path: `/${citySlug}` },
          { name: service.locationName, path: `/${citySlug}/${serviceSlug}` },
        ]}
      />
      <ServiceJsonLd
        name={service.name}
        description={service.description}
        city={city.name}
      />
      <FaqJsonLd faqs={service.faqs} />

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {service.locationName} in {city.name}
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-700">
          H&S Labour Brokers delivers trusted{" "}
          {service.locationName.toLowerCase()} in {city.name},{" "}
          {city.province}. {service.solution}
        </p>

        <div
          className="prose mt-8 max-w-none leading-relaxed text-slate-700"
          dangerouslySetInnerHTML={{ __html: service.description }}
        />

        {service.faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
            <dl className="mt-6 space-y-6 divide-y divide-gray-200">
              {service.faqs.map((faq, idx) => (
                <div key={idx} className="pt-6 first:pt-0">
                  <dt className="font-medium text-gray-900">{faq.q}</dt>
                  <dd className="mt-2 text-gray-700">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {otherServicesInCity.length > 0 && (
          <section className="mt-12 border-t border-gray-200 pt-10">
            <h2 className="text-xl font-semibold text-gray-900">
              Other services in {city.name}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherServicesInCity.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${city.slug}/${s.locationSlug}`}
                    className="text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    {s.locationName}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {otherCitiesForService.length > 0 && (
          <section className="mt-10 border-t border-gray-200 pt-10">
            <h2 className="text-xl font-semibold text-gray-900">
              {service.locationName} in other cities
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherCitiesForService.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}/${service.locationSlug}`}
                    className="text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-700"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="/employers"
            className="inline-block rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            Hire Staff
          </Link>
          <Link
            href="/jobs"
            className="inline-block rounded-md border border-blue-700 px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            View Jobs
          </Link>
        </div>
      </article>
    </>
  );
}