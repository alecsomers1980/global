import React from "react";
import Image from "next/image";

interface SecondaryBannerProps {
  title: string;
  subtitle?: string;
  image?: string;
}

export default function SecondaryBanner({
  title,
  subtitle,
  image = "/images/banner.jpg",
}: SecondaryBannerProps) {
  return (
    <section className="relative h-[300px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax-like feel */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover object-center"
          priority
        />
        {/* Premium Overlay: Gradient and Blur */}
        <div className="absolute inset-0 bg-brand-green/60 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-green via-transparent to-transparent opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-4 px-6">
        <div className="w-12 h-1 bg-brand-gold mx-auto rounded-full" />
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-brand-gold/90 telemetry-monospace text-sm tracking-[0.2em] font-medium uppercase">
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative Corner Element */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-full h-full bg-brand-gold skew-x-[-20deg] transform translate-x-1/2" />
      </div>
    </section>
  );
}
