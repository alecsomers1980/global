import { WENDY_SIZES, FRAME_BUILT } from "@/data/pricing";
import { SITE_URL, BUSINESS } from "@/data/business";

export function wendyHousesProductSchema() {
  const lowPrice = Math.min(...WENDY_SIZES.map((s) => s.priceNoWindow));
  const highPrice = Math.max(...WENDY_SIZES.map((s) => s.priceOneWindow));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Wendy House",
    description: "A timber utility building available in 11 sizes.",
    brand: {
      "@type": "Brand",
      name: BUSINESS.name,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "ZAR",
      lowPrice,
      highPrice,
      offerCount: WENDY_SIZES.length,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/wendy-houses`,
    },
  };
}

export function frameBuiltProductSchema() {
  const allPrices = FRAME_BUILT.flatMap((model) =>
    [model.log, model.chromadek, model.nutec].filter(
      (p): p is number => p !== null,
    ),
  );
  const lowPrice = Math.min(...allPrices);
  const highPrice = Math.max(...allPrices);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Frame Built Cabin",
    description: "An engineered timber-frame building system available in 6 models.",
    brand: {
      "@type": "Brand",
      name: BUSINESS.name,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "ZAR",
      lowPrice,
      highPrice,
      offerCount: FRAME_BUILT.length,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/frame-built`,
    },
  };
}

export function jsonLdScriptProps(data: object) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
