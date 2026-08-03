import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string | null;
}

export default function Logo({ className, href }: LogoProps) {
  const image = (
    <Image
      src="/maynardville-logo.png"
      width={1514}
      height={327}
      alt="Maynardville Open-Air Festival"
      priority
      className={className ?? "h-9 w-auto"}
    />
  );

  if (href === null) return image;

  const linkHref = href ?? "/dashboard";
  return <Link href={linkHref}>{image}</Link>;
}