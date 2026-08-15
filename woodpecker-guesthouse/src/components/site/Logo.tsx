// The client's real logo (recovered from the live site's own
// wp-content/uploads/2022/06/Woodpeckers-logo.png), not a redesign.
// `logo-sand.png` is a light monochrome silhouette derived from that same
// file's alpha channel for legibility on the dark footer — a "reversed
// logo" variant, the same real artwork recolored, not new artwork.
import Image from "next/image";

type LogoProps = {
  className?: string;
  dark?: boolean;
};

export function Logo({ className, dark = false }: LogoProps) {
  return (
    <Image
      src={dark ? "/images/logo-sand.png" : "/images/logo.png"}
      alt="Woodpecker Guesthouse"
      width={449}
      height={405}
      className={`h-14 w-auto ${className ?? ""}`}
      priority
    />
  );
}
