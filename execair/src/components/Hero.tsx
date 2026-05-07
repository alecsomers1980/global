import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-brand-navy">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/hero/Exec-Air_BrandedFleet_HeaderImage.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/images/videos/HVAC-VIDEO.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/75 to-brand-navy/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-transparent to-brand-navy/30" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 pt-20">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: Text */}
          <div>
            {/* 35 Years Badge */}
            <div className="mb-8 inline-flex items-center gap-4 rounded-full border border-white/20 bg-white/10 px-2 py-2 pr-6 backdrop-blur-md">
              <Image
                src="/images/icons/OVER-35-YEARS-OF-EXPERIENCE.png"
                alt="Exec-Air — over 35 years of HVAC experience"
                width={60}
                height={60}
                className="h-14 w-14"
                priority
              />
              <span className="text-sm font-bold uppercase tracking-[0.25em] text-white">
                Over 35 Years of Experience
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-light leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
              Air Conditioning &amp; HVAC{" "}
              <span className="font-bold text-brand-teal">specialists</span>{" "}
              in Krugersdorp
            </h1>

            {/* Subheadline */}
            <p className="mb-4 text-lg leading-relaxed text-white/70 md:text-xl">
              Commercial, industrial and residential HVAC across Johannesburg and Gauteng — design,
              installation, maintenance and repair since 1989.
            </p>

            {/* B-BBEE Badge */}
            <div className="mb-10 inline-flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Image
                src="/images/icons/Exec-Air_B-BBEE3_2023.jpg"
                alt="B-BBEE Level 3"
                width={80}
                height={30}
                className="h-6 w-auto"
              />
              <span className="text-sm font-medium text-white/80">
                Proudly Level 3 B-BBEE Contributor
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/our-work" className="btn-primary text-base">
                VIEW OUR WORK
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Link>
              <Link href="/contact-us" className="btn-outline text-base">
                Get in Touch
              </Link>
              <Link href="/product-range" className="btn-outline text-base">
                View Products
              </Link>
            </div>
          </div>

          {/* Right: YouTube Feature Card */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl">
              {/* YouTube Thumbnail */}
              <a
                href="https://youtu.be/Gj2-lHS7RQ8"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden"
              >
                <Image
                  src="https://img.youtube.com/vi/Gj2-lHS7RQ8/maxresdefault.jpg"
                  alt="Exec-Air featured on OnbytSAKE TV"
                  width={640}
                  height={360}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/30 transition-colors group-hover:bg-brand-navy/20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange shadow-xl transition-transform group-hover:scale-110">
                    <svg className="ml-1 h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </a>
              {/* Card Content */}
              <div className="p-6">
                <h3 className="mb-1 text-lg font-bold text-white">As Seen on TV</h3>
                <p className="mb-4 text-sm leading-relaxed text-white/60">
                  Watch our feature on OnbytSAKE Season 12 Episode 4, showcasing our HVAC expertise.
                </p>
                <a
                  href="https://youtu.be/Gj2-lHS7RQ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-brand-orange/90 hover:shadow-lg hover:shadow-brand-orange/30 active:scale-95"
                >
                  View Now on YouTube
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
          <div className="h-12 w-[1px] animate-pulse bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
