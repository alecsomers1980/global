import { SITE } from "@/lib/site";

export default function LocalBusinessSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: SITE.name,
    description:
      "Affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga, minutes from the Kruger National Park.",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: "Hazyview",
      addressRegion: "Mpumalanga",
      postalCode: "1242",
      addressCountry: "ZA",
    },
    telephone: SITE.phone.display,
    email: SITE.email,
    url: "https://woodpeckersguesthouse.co.za",
    sameAs: [SITE.social.facebook, SITE.social.instagram],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
