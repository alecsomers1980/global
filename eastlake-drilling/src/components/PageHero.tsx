import Image from "next/image";
import { FC } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  // used as the video poster (shown before the loop loads)
  image?: string;
}

const PageHero: FC<PageHeroProps> = ({ eyebrow, title, subtitle, image }) => {
  return (
    <section className="relative min-h-[40vh] grid place-items-center text-center overflow-hidden">
      {/* Optimized still image = fast, prioritized LCP (Vercel serves WebP) */}
      <Image
        src={image ?? "/images/hero/about-1.jpg"}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Same water video, fades in over the still once buffered (deferred so it
          doesn't starve the LCP image on slow mobile) */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      >
        <source src="/videos/water-ripple-720.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-darker/80 via-ink/70 to-ink/50" />

      {/* Foreground content */}
      <div className="relative z-10 container-px py-20">
        {eyebrow && <p className="eyebrow text-blue-200 mb-3">{eyebrow}</p>}
        <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-white/80 max-w-2xl mx-auto text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHero;
