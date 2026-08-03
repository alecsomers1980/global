// Organization + service structured data for SEO / GEO / AI answer engines.
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Endless Global Point",
    alternateName: "Endless Global",
    url: "https://endlessglobalpoint.com",
    logo: "https://endlessglobalpoint.com/images/endlessLogo.png",
    description:
      "A global business matchmaking agency connecting businesses, individuals, investors, and governments with trusted experts in investment, financial, trade, and consulting services.",
    foundingDate: "2022",
    email: "philipokoh24@gmail.com",
    telephone: "+27833727295",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cape Town",
      addressCountry: "ZA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+27833727295",
      email: "philipokoh24@gmail.com",
      contactType: "customer service",
      areaServed: "Worldwide",
    },
    makesOffer: [
      "Investment Services",
      "Financial Services",
      "Trade Services",
      "Consulting Services",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
