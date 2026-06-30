import { company, services, serviceAreas } from "@/lib/content";

export default function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    image: "https://eastlakedrilling.co.za/images/logo.png",
    "@id": "https://eastlakedrilling.co.za",
    url: "https://eastlakedrilling.co.za",
    telephone: company.phone,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.location,
      addressRegion: "Gauteng",
      addressCountry: "ZA",
    },
    areaServed: serviceAreas.map((area) => ({
      "@type": "City",
      name: area,
    })),
    description:
      "Borehole drilling, pump installation, water filtration, water testing, treatment and off-grid solar across Johannesburg and Gauteng.",
    makesOffer: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}