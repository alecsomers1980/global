import Link from "next/link";

interface VideoHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export default function VideoHero({ eyebrow, title, subtitle }: VideoHeroProps) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden text-white">
      {/* Video background */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/hero/about-1.jpg"
      >
        <source src="/videos/water-ripple.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-darker/80 via-ink/70 to-ink/50" />

      {/* Foreground content */}
      <div className="relative z-10 container-px py-24">
        <p className="eyebrow text-white/90">{eyebrow}</p>
        <h1 className="mt-3 text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
          {title}
        </h1>
        <p className="mt-5 text-lg text-white/80 max-w-xl">{subtitle}</p>

        {/* CTA row */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="inline-block bg-white text-brand rounded-full px-6 py-3 font-semibold hover:bg-white/90 transition"
          >
            Get a Free Quote
          </Link>
          <Link
            href="/services"
            className="inline-block border border-white/70 text-white rounded-full px-6 py-3 font-semibold hover:bg-white/10 transition"
          >
            Explore Services
          </Link>
        </div>

        {/* Trust row */}
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
          <span>Domestic &amp; commercial</span>
          <span className="text-white/40">•</span>
          <span>Compact low-impact rig</span>
          <span className="text-white/40">•</span>
          <span>OHS Act compliant</span>
        </div>
      </div>
    </section>
  );
}