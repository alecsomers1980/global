import type { Destination, Pillar } from '@/types/tour';

export interface DestinationMeta {
  slug: Destination;
  label: string;
  image: string;
  blurb: string;
}

export interface PillarMeta {
  slug: Pillar | 'accommodation';
  label: string;
  href: string;
}

export interface ComfortTierMeta {
  slug: string;
  label: string;
  blurb: string;
}

export const PILLARS: PillarMeta[] = [
  { slug: 'safari', label: 'Safari', href: '/safari' },
  { slug: 'tours', label: 'Tours', href: '/tours' },
  { slug: 'transfers', label: 'Transfers', href: '/transfers' },
  { slug: 'accommodation', label: 'Accommodation', href: '/accommodation' },
];

export const COMFORT_TIERS: ComfortTierMeta[] = [
  {
    slug: 'affordable',
    label: 'Affordable Comfort',
    blurb: 'Everything you need for a full day in the bush, without the frills.',
  },
  {
    slug: 'premium',
    label: 'Premium Comfort',
    blurb: 'More space, more comfort, and a slower pace through the day.',
  },
  {
    slug: 'luxurious',
    label: 'Luxurious Experience',
    blurb: 'Private guiding, premium vehicles and the finest lodges we work with.',
  },
];

export const DESTINATIONS: DestinationMeta[] = [
  {
    slug: 'kruger-national-park',
    label: 'Kruger National Park',
    image: '/images/destinations/kruger-national-park.webp',
    blurb: 'Open-vehicle game drives tracking the Big Five across the Lowveld.',
  },
  {
    slug: 'panorama-route',
    label: 'The Panorama Route',
    image: '/images/destinations/panorama-route.webp',
    blurb: "Blyde River Canyon, Bourke's Luck Potholes and God's Window.",
  },
  {
    slug: 'eswatini',
    label: 'eSwatini',
    image: '/images/destinations/eswatini.webp',
    blurb: 'Cross-border journeys into the Kingdom of eSwatini.',
  },
  {
    slug: 'mozambique',
    label: 'Mozambique',
    image: '/images/destinations/mozambique.webp',
    blurb: 'Warm Indian Ocean coastline within reach of the Lowveld.',
  },
  {
    slug: 'local-experiences',
    label: 'Local Experiences',
    image: '/images/destinations/local-experiences.webp',
    blurb: 'Village visits, markets and cultural heritage with local guides.',
  },
  {
    slug: 'johannesburg',
    label: 'Johannesburg',
    image: '/images/destinations/johannesburg.webp',
    blurb: 'City connections and transfers to and from Gauteng.',
  },
  {
    slug: 'family-experiences',
    label: 'Family Experiences',
    image: '/images/destinations/family-experiences.webp',
    blurb: 'Paced and planned for travellers of every age.',
  },
  {
    slug: 'adventure-experiences',
    label: 'Adventure Experiences',
    image: '/images/destinations/adventure-experiences.webp',
    blurb: 'Waterfalls, hiking and the active side of Mpumalanga.',
  },
];
