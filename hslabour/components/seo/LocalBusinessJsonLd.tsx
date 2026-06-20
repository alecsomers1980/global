import { company } from '@/lib/site/company';

export default function LocalBusinessJsonLd({
  city,
  service,
}: {
  city?: string;
  service?: string;
}) {
  // Build the EmploymentAgency JSON-LD schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    name: company.name,
    url: company.url,
    email: company.email,
    areaServed: city || company.areasServed[0],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}