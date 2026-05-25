"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPackageBySlug } from "@/lib/packages";

const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-[var(--color-terracotta)] flex-shrink-0 mt-0.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export default function PackageDetailPage() {
  const params = useParams();
  const [pkg, setPkg] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const found = getPackageBySlug(params.slug);
    setPkg(found);
    setLoaded(true);
  }, [params.slug]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-linen flex items-center justify-center">
        <p className="text-primary/50 text-lg">Loading...</p>
      </main>
    );
  }

  if (!pkg) {
    return (
      <main className="min-h-screen bg-linen flex flex-col items-center justify-center px-6">
        <h1 className="font-serif text-4xl text-primary mb-4">
          Package Not Found
        </h1>
        <p className="text-primary/60 mb-8">
          We couldn&apos;t find the package you&apos;re looking for.
        </p>
        <Link
          href="/packages"
          className="bg-primary text-white px-8 py-3 font-semibold tracking-wider text-sm hover:bg-primary/90 transition-colors"
        >
          VIEW ALL PACKAGES
        </Link>
      </main>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi! I'd like to enquire about the "${pkg.title}" package at Mountain Creek Lodge.`
  );

  return (
    <main className="min-h-screen bg-linen">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={pkg.image}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-10 pb-12 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/60 text-sm mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/packages"
              className="hover:text-white transition-colors"
            >
              Packages
            </Link>
            <span>/</span>
            <span className="text-white/90">{pkg.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {pkg.tag && (
              <span className="bg-[var(--color-terracotta)] text-white text-[10px] font-bold tracking-widest px-3 py-1.5 uppercase">
                {pkg.tag}
              </span>
            )}
            {pkg.category && (
              <span className="border border-white/30 text-white/80 text-[10px] font-bold tracking-widest px-3 py-1.5 uppercase">
                {pkg.category}
              </span>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            {pkg.title}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left — Description */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-3xl text-primary mb-6">
              About This Experience
            </h2>
            <p className="font-sans text-primary/80 text-lg leading-relaxed mb-10">
              {pkg.fullDescription}
            </p>

            {/* What's Included */}
            <h3 className="font-serif text-2xl text-primary mb-5">
              What&apos;s Included
            </h3>
            <ul className="space-y-4 mb-12">
              {pkg.includes.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="font-sans text-base text-primary/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ),
                  label: pkg.duration || "Flexible",
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  ),
                  label: `Up to ${pkg.maxGuests || "–"} guests`,
                },
                {
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  ),
                  label: "Secure Property",
                },
              ].map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-2 p-5 bg-white shadow-sm"
                >
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    {h.icon}
                  </svg>
                  <span className="font-sans text-sm text-primary/80 font-medium">
                    {h.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(26,47,35,0.08)] sticky top-28">
              <p className="font-sans text-xs uppercase tracking-widest text-primary/40 mb-2">
                Starting from
              </p>
              <p className="font-serif text-4xl text-primary mb-1">
                R{pkg.price?.toLocaleString() || "–"}
              </p>
              <p className="font-sans text-sm text-primary/50 mb-8">
                per person sharing
              </p>

              <div className="space-y-4 mb-8 pb-8 border-b border-primary/10">
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Duration</span>
                  <span className="font-medium text-primary">
                    {pkg.duration}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Max Guests</span>
                  <span className="font-medium text-primary">
                    {pkg.maxGuests}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Category</span>
                  <span className="font-medium text-primary">
                    {pkg.category}
                  </span>
                </div>
              </div>

              <a
                href={`https://wa.me/27829594643?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[var(--color-terracotta)] text-white text-center font-semibold tracking-wider text-sm px-6 py-4 hover:opacity-90 transition-opacity mb-4"
              >
                BOOK VIA WHATSAPP
              </a>
              <Link
                href="/contact"
                className="block w-full border-2 border-primary text-primary text-center font-semibold tracking-wider text-sm px-6 py-3.5 hover:bg-primary hover:text-white transition-colors"
              >
                SEND ENQUIRY
              </Link>

              <p className="text-xs text-primary/40 mt-6 text-center leading-relaxed">
                Prices may vary by season. Contact us for exact availability and
                pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Packages */}
      <section className="bg-primary/5 py-14 text-center px-6">
        <p className="font-sans text-primary/60 text-base mb-6">
          Explore more ways to experience the Lowveld
        </p>
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 font-semibold tracking-wider text-sm hover:bg-primary/90 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          ALL PACKAGES
        </Link>
      </section>
    </main>
  );
}
