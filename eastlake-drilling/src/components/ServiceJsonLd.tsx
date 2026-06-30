import React from "react";
import { company, serviceAreas } from "@/lib/content";

interface ServiceJsonLdProps {
  service: {
    slug: string;
    title: string;
    short: string;
  };
}

export default function ServiceJsonLd({ service }: ServiceJsonLdProps) {
  const baseUrl = "https://eastlakedrilling.co.za";
  const serviceUrl = `${baseUrl}/services/${service.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      description: service.short,
      serviceType: service.title,
      areaServed: serviceAreas.map((area) => ({
        "@type": "City",
        name: area,
      })),
      provider: {
        "@type": "LocalBusiness",
        name: company.name,
        telephone: company.phone,
        email: company.email,
        areaServed: "Gauteng, South Africa",
      },
      url: serviceUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Services",
          item: `${baseUrl}/services`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: service.title,
          item: serviceUrl,
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}