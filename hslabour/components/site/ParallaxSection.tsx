import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/site/Container";

type ParallaxSectionProps = {
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { href: string; label: string };
  /** Tailwind overlay class for readability (default dark navy). */
  overlayClassName?: string;
};

/**
 * Full-bleed band with a parallax background image (fixed on desktop, normal
 * scroll on mobile to avoid iOS jank) and a dark overlay for legible white text.
 */
export default function ParallaxSection({
  image,
  eyebrow,
  title,
  subtitle,
  cta,
  overlayClassName = "bg-navy/80",
}: ParallaxSectionProps) {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div aria-hidden="true" className={`absolute inset-0 ${overlayClassName}`} />
      <Container className="relative z-10 py-24 text-center sm:py-32">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-green">
            {eyebrow}
          </p>
        )}
        <h2 className="mx-auto mt-3 max-w-3xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-slate-200">
            {subtitle}
          </p>
        )}
        {cta && (
          <Link
            href={cta.href}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </Container>
    </section>
  );
}
