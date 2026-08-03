import Link from "next/link";

export interface HeroProps {
  bgImage: string;
  titleTop?: string;
  titleMain: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  size?: "home" | "inner";
}

export default function Hero({
  bgImage,
  titleTop,
  titleMain,
  subtitle,
  ctaLabel,
  ctaHref,
  size = "inner",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden pleated">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, rgba(16,39,8,0.92) 0%, rgba(16,39,8,0.55) 50%, rgba(16,39,8,0.15) 100%),
                        linear-gradient(to top, rgba(16,39,8,0.85) 0%, transparent 35%)`,
        }}
      />
      {/* Content */}
      <div
        className={`relative z-10 eg-container flex flex-col items-start justify-end pt-32 pb-16 ${
          size === "home" ? "min-h-[88vh]" : "min-h-[62vh]"
        }`}
      >
        {titleTop && (
          <p className="text-lg md:text-2xl font-medium uppercase tracking-wide text-white/85">
            {titleTop}
          </p>
        )}
        <h1
          className={`section-title !text-white mt-1 font-bold uppercase leading-[1.05] ${
            size === "home" ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl"
          }`}
        >
          {titleMain}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-white/85 text-base md:text-lg leading-relaxed">
            {subtitle}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="btn-primary bg-white text-brand hover:bg-white/90 mt-8"
          >
            {ctaLabel} →
          </Link>
        )}
      </div>
    </section>
  );
}
