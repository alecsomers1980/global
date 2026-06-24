const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dbib.co.za";

/**
 * Site-wide structured data (JSON-LD) for search engines and AI/generative
 * engines (GEO). Describes the directory as an Organization and a WebSite with
 * an on-site search action.
 */
export default function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Doing Business in Bushbuckridge",
        alternateName: "DBiB",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description:
          "The Doing Business in Bushbuckridge (DBiB) directory connects local enterprises with the community, customers, partners and institutions in the Bushbuckridge region, Mpumalanga, South Africa.",
        areaServed: {
          "@type": "Place",
          name: "Bushbuckridge, Mpumalanga, South Africa",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Doing Business in Bushbuckridge",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-ZA",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/find-a-service?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
