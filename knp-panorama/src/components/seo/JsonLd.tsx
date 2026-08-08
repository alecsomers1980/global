import { SITE } from '@/data/site';
import type { Tour } from '@/types/tour';

/*
 * Escape the JSON string’s `</script` sequence so that it cannot accidentally
 * close the containing <script> tag. Any `<` is replaced with its Unicode escape
 * `\u003c`, which is safe inside a JSON string.
 */
function safeScriptData(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeScriptData(data) }}
    />
  );
}

export const TRAVEL_AGENCY_ID = 'https://www.knp-panorama.com/#organisation';

export function travelAgencyJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': TRAVEL_AGENCY_ID,
    name: SITE.tradingName,
    legalName: SITE.legalName,
    url: 'https://www.knp-panorama.com',
    telephone: SITE.phone,
    email: SITE.email,
    areaServed: {
      '@type': 'Place',
      name: SITE.region,
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Mpumalanga',
      addressCountry: 'ZA',
    },
    description:
      'Community-driven safaris and Panorama Route tours in the Mpumalanga Lowveld, guided by local experts who know the land and its wildlife.',
  };
}

export function touristTripJsonLd(tour: Tour): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.summary,
    url: `https://www.knp-panorama.com/experiences/${tour.slug}`,
    image: `https://www.knp-panorama.com${tour.heroImage}`,
    touristType: 'Wildlife and scenic day tours',
    provider: {
      '@id': TRAVEL_AGENCY_ID,
    },
    itinerary: {
      '@type': 'ItemList',
      itemListElement: tour.highlights.map((highlight, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: highlight.title,
        description: highlight.body,
      })),
    },
  };
}
