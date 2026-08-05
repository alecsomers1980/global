import type { JSX } from "react";
import Image from "next/image";

interface ProductImage {
  id: string;
  product_id: string;
  colour_name: string | null;
  url: string;
  alt: string;
  sort_order: number;
}

interface Props {
  images: ProductImage[];
  productName: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function ProductGallery({
  images,
  productName,
  activeIndex,
  onSelect,
}: Props): JSX.Element {
  // Empty state – no images available
  if (images.length === 0) {
    return (
      <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-surface">
        {/* Simple caracal head SVG */}
        <svg
          className="h-16 w-16 text-accent/30"
          viewBox="0 0 100 100"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="50" cy="55" r="40" />
          <polygon points="30,20 20,0 40,10" />
          <polygon points="70,20 80,0 60,10" />
        </svg>
        <p className="mt-4 text-xs text-muted">{productName}</p>
      </div>
    );
  }

  // Only one image – no thumbnail strip
  if (images.length === 1) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface">
        <Image
          src={images[0].url}
          alt={images[0].alt || productName}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover"
          priority={activeIndex === 0}
        />
      </div>
    );
  }

  // Multiple images
  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface">
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || `${productName}, image ${activeIndex + 1}`}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover"
          priority={activeIndex === 0}
        />
      </div>

      {/* Thumbnail strip */}
      <div
        className="mt-4 flex gap-2 overflow-x-auto"
        role="list"
        aria-label="Product image thumbnails"
      >
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={activeIndex === i ? "true" : undefined}
            className={`relative aspect-square size-16 overflow-hidden rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
              activeIndex === i
                ? "ring-2 ring-accent ring-offset-2 ring-offset-canvas border-accent"
                : "border-text/20"
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt || `${productName}, image ${i + 1}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}