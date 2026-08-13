export default function LocalBusinessSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Woodpecker Guesthouse",
    description:
      "Affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga, minutes from the Kruger National Park.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hazyview",
      addressRegion: "Mpumalanga",
      addressCountry: "ZA",
    },
    url: "https://woodpeckersguesthouse.co.za",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}