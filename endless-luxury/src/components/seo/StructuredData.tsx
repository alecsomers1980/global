import { services, faqs, site } from "@/data/site";

/**
 * JSON-LD structured data so search engines and AI answer engines (Google AI Overviews,
 * ChatGPT, Perplexity) can understand the business, its services, and its FAQs.
 */
export default function StructuredData() {
  const base = "https://endlessluxury.co.za";

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${base}/#business`,
        name: "Endless Luxury",
        description:
          "Endless Luxury connects clients with a curated selection of prestige vehicles, professional chauffeurs, and bespoke travel experiences across South Africa.",
        url: base,
        telephone: site.phone,
        email: site.email,
        image: `${base}/images/logoWhite.png`,
        areaServed: { "@type": "Country", name: "South Africa" },
        priceRange: "$$$",
        makesOffer: services.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.title, description: s.body },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${base}/#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
