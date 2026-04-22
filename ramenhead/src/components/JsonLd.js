export default function RestaurantJsonLd() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Ramenhead",
    "image": ["https://www.ramenhead.co.za/assets/RAMENHEAD-WS-PIC-02.jpg"],
    "servesCuisine": ["Japanese", "Ramen"],
    "priceRange": "$$",
    "address": [
      {
        "@type": "PostalAddress",
        "streetAddress": "37 Parliament St, Speaker's Corner",
        "addressLocality": "Cape Town",
        "postalCode": "8001",
        "addressCountry": "ZA"
      },
      {
        "@type": "PostalAddress",
        "streetAddress": "Time Out Market, V&A Waterfront",
        "addressLocality": "Cape Town",
        "postalCode": "8001",
        "addressCountry": "ZA"
      }
    ],
    "url": "https://www.ramenhead.co.za",
    "telephone": "+27673128061",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "17:00",
        "closes": "22:00"
      }
    ],
    "menu": "https://www.ramenhead.co.za/downloads/menu.pdf",
    "acceptsReservations": "True"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
