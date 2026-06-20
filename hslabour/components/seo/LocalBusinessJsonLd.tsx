import { company } from '@/lib/site/company';

export default function LocalBusinessJsonLd({
  city,
}: {
  city?: string;
  service?: string;
}) {
  // EmploymentAgency / Organization JSON-LD for entity trust + GEO.
  // NOTE: physical `address` is intentionally omitted until the client provides it.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    name: company.name,
    legalName: company.legalName,
    url: company.url,
    logo: company.logo,
    image: company.logo,
    email: company.email,
    telephone: company.phoneE164,
    foundingDate: String(company.foundedYear),
    areaServed: city || company.areasServed[0],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: company.openingHours.opens,
        closes: company.openingHours.closes,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
