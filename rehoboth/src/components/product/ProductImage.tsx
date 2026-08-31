import Image from "next/image";
import { imageSrc } from "@/lib/product-image";

/**
 * A product's hero shot, or a brand panel where the client has not
 * photographed the product yet. Never substitutes another product's image.
 */
export function ProductImage({
  src,
  alt,
  accentHex,
  sizes,
  priority = false,
}: {
  src: string | null;
  alt: string;
  accentHex: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-surface"
        role="img"
        aria-label={`${alt} — photograph to come`}
      >
        <Image
          src="/brand/emblem-dark.png"
          alt=""
          width={260}
          height={247}
          className="h-16 w-auto opacity-25"
        />
        <span className="absolute bottom-0 left-0 h-1 w-full" style={{ backgroundColor: accentHex }} />
      </div>
    );
  }

  return (
    <Image
      src={imageSrc(src, 800)}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
    />
  );
}
