export type Pillar = 'safari' | 'tours' | 'transfers';

export type Destination =
  | 'kruger-national-park'
  | 'panorama-route'
  | 'eswatini'
  | 'mozambique'
  | 'local-experiences'
  | 'johannesburg'
  | 'family-experiences'
  | 'adventure-experiences';

export interface Tour {
  slug: string;
  title: string;
  pillar: Pillar;
  destination: Destination;
  duration: string;
  locationLabel: string;
  summary: string;
  heroImage: string;
  gallery: string[];
  overview: string[];
  highlights: { title: string; body: string }[];
  included: string[];
  excluded: string[];
  whatToBring: string[];
}
