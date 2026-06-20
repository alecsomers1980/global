import { company } from "@/lib/site/company";

/** Emits Product + Offer structured data for priced shop/e-book items (ZAR). */
export default function ProductJsonLd({
  name,
  description,
  priceCents,
  url,
  image,
}: {
  name: string;
  description?: string;
  priceCents: number;
  url: string;
  image?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description ? { description } : {}),
    image: image ?? company.logo,
    brand: { "@type": "Brand", name: company.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: (priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${company.url}${url}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
