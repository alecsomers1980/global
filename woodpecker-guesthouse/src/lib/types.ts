export type Room = {
  id: string;
  slug: string;
  name: string;
  description: string;
  bed_type: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  rate_from: number | null;
  amenities: string[];
  hero_image: string | null;
  gallery_images: string[];
  sort_order: number;
  published: boolean;
};

export type GalleryCategory = {
  id: string;
  name: string;
  sort_order: number;
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  category_id: string | null;
  sort_order: number;
};