import Link from "next/link";

interface ParallaxBannerProps {
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  height?: "sm" | "md";
}

export default function ParallaxBanner({
  image,
  eyebrow,
  title,
  subtitle,
  cta,
  height = "md",
}: ParallaxBannerProps) {
  return (
    <section
      className={`relative w-full overflow-hidden flex items-center justify-center text-center text-white ${
        height === "sm" ? "min-h-[40vh]" : "min-h-[60vh]"
      }`}
    >
      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-scroll md:bg-fixed bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-darker/80 via-ink/70 to-ink/60" />
      {/* Foreground content */}
      <div className="relative z-10 container-px py-16">
        {eyebrow && <p className="eyebrow text-blue-200">{eyebrow}</p>}
        <h2 className="mt-2 text-3xl md:text-4xl font-bold max-w-3xl mx-auto leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">{subtitle}</p>
        )}
        {cta && (
          <Link
            href={cta.href}
            className="inline-block mt-8 rounded-full bg-white text-brand-darker px-6 py-3 font-semibold hover:bg-white/90 transition"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}