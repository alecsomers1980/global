import { company } from "@/lib/site/company";

interface ServiceJsonLdProps {
  name: string;
  description: string;
  city?: string;
}

export function ServiceJsonLd({ name, description, city }: ServiceJsonLdProps) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: company.name,
      url: company.url,
      logo: company.logo,
      email: company.email,
      telephone: company.phoneE164,
    },
    areaServed: city ? { "@type": "City", name: city } : "South Africa",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export default ServiceJsonLd;