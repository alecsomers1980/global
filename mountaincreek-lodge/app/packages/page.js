"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroHeader from "@/components/HeroHeader";
import { getActivePackages } from "@/lib/packages";

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-[var(--color-terracotta)] flex-shrink-0 mt-0.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const GiftIcon = () => (
  <svg
    className="w-10 h-10 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7M5 12V8m14 4V8"
    />
  </svg>
);

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getActivePackages()
      .then(setPackages)
      .catch((err) => {
        console.error("Failed to load packages:", err);
        setLoadError(true);
      })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <main className="bg-linen min-h-screen">
      <HeroHeader
        eyebrow="Mountaincreek Lodge"
        title="Curated Stay Packages"
        description="Whether you're here for a quick countryside escape, a safari adventure, or a romantic weekend away, we've designed experiences to make your stay effortless, memorable, and uniquely Mountain Creek."
      />

      {/* Packages List */}
      <section className="bg-linen py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          {!loaded ? (
            <div className="text-center py-20">
              <p className="text-primary/50 text-lg">Loading packages...</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-20">
              <p className="text-primary/50 text-lg">
                Couldn&apos;t load packages right now. Please refresh the page.
              </p>
            </div>
          ) : (
            packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } bg-white overflow-hidden shadow-[0_4px_24px_-4px_rgba(26,47,35,0.08)] hover:shadow-[0_12px_40px_-8px_rgba(26,47,35,0.12)] transition-shadow duration-500`}
              >
                {/* Image Side */}
                <div className="relative w-full md:w-[45%] flex-shrink-0">
                  <div className="relative aspect-[4/3] md:aspect-auto md:h-full w-full overflow-hidden">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      quality={90}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  {pkg.tag && (
                    <span className="absolute top-5 left-5 bg-[var(--color-terracotta)] text-white text-[10px] font-bold tracking-widest px-3 py-1.5 uppercase">
                      {pkg.tag}
                    </span>
                  )}
                </div>

                {/* Content Side */}
                <div className="flex flex-col justify-center p-8 md:p-10 lg:p-14 w-full">
                  <div className="flex items-center gap-3 mb-3">
                    {pkg.duration && (
                      <span className="text-[10px] font-bold tracking-widest uppercase text-primary/40 border border-primary/15 px-3 py-1">
                        {pkg.duration}
                      </span>
                    )}
                    {pkg.category && (
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-terracotta)]/70">
                        {pkg.category}
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-primary text-2xl lg:text-3xl mb-3">
                    {pkg.title}
                  </h2>
                  <p className="font-sans text-gray-600 text-base mb-6 leading-relaxed">
                    {pkg.shortDescription}
                  </p>

                  <div className="mb-8">
                    <p className="font-sans text-[10px] font-bold text-primary/40 tracking-widest uppercase mb-3">
                      INCLUDES:
                    </p>
                    <ul className="flex flex-col gap-2.5">
                      {pkg.includes.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckIcon />
                          <span className="font-sans text-sm text-gray-700">
                            {item}
                          </span>
                        </li>
                      ))}
                      {pkg.includes.length > 4 && (
                        <li className="text-xs text-primary/40 ml-6">
                          + {pkg.includes.length - 4} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center gap-6">
                    <Link
                      href={`/packages/${pkg.slug}`}
                      className="bg-primary text-white font-sans text-sm font-semibold tracking-wider px-8 py-3.5 hover:bg-primary/90 transition-colors duration-200"
                    >
                      VIEW DETAILS & BOOK
                    </Link>
                    {pkg.price && (
                      <span className="font-serif text-xl text-primary/70">
                        From{" "}
                        <span className="text-primary font-semibold">
                          R{pkg.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-primary/40 ml-1">pp</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Enhance Your Stay */}
      <section className="bg-white py-16 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-primary text-center mb-12">
            Enhance Your Stay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                question: "Looking For Adventure?",
                text: "Ziplining, river rafting, tubing and more are just minutes away.",
                linkText: "View Adventure Experiences",
                href: "/experiences/adventure-activities",
              },
              {
                question: "Exploring The Panorama Route?",
                text: "Discover waterfalls, scenic viewpoints and unforgettable day trips.",
                linkText: "View Scenic Experiences",
                href: "/experiences/panorama-route",
              },
              {
                question: "Going on Safari?",
                text: "Discover some of the region's most trusted safari operators.",
                linkText: "View Safari Experiences",
                href: "/experiences/kruger-national-park",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col text-center items-center gap-3 p-8 bg-linen"
              >
                <h3 className="font-serif text-xl text-primary">
                  {item.question}
                </h3>
                <p className="font-sans text-gray-600 text-sm leading-relaxed">
                  {item.text}
                </p>
                <Link
                  href={item.href}
                  className="font-sans text-sm font-semibold tracking-wider text-[var(--color-terracotta)] hover:opacity-80 transition-opacity mt-2"
                >
                  {item.linkText.toUpperCase()}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Around Us */}
      <section className="bg-linen py-16 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-primary text-center mb-12">
            Experiences Around Us
          </h2>

          {/* Safari Experiences — big image feature */}
          <div className="relative overflow-hidden mb-8" style={{ minHeight: "360px" }}>
            <Image
              src="/images/experiences/kruger_safari.png"
              alt="Safari Experiences"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-12" style={{ minHeight: "360px" }}>
              <h3 className="font-serif text-white text-2xl md:text-3xl mb-3">
                Safari Experiences
              </h3>
              <p className="font-sans italic text-white/85 text-base md:text-lg mb-6 max-w-lg">
                &ldquo;Discover Kruger National Park through a range of trusted local operators.&rdquo;
              </p>
              <Link
                href="/experiences/kruger-national-park"
                className="inline-block bg-[var(--color-terracotta)] text-white font-sans text-sm font-semibold tracking-wider px-8 py-3.5 hover:opacity-90 transition-opacity duration-200 uppercase w-fit"
              >
                View Operators
              </Link>
            </div>
          </div>

          {/* Remaining experience categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Adventure Experiences",
                features: ["Skyway Trails", "Quad biking", "River rafting", "Tubing"],
                linkText: "Book Direct",
                href: "/experiences/adventure-activities",
              },
              {
                title: "Panorama Route",
                features: [
                  "God's Window",
                  "Blyde River Canyon",
                  "Lisbon Falls",
                  "Bourke's Luck Potholes",
                ],
                linkText: "Plan Your Route",
                href: "/experiences/panorama-route",
              },
              {
                title: "Local Dining",
                features: [
                  "Red Litchi Farm Café",
                  "Local restaurants",
                  "Bush pubs",
                ],
                linkText: "Explore Dining",
                href: "/red-litchi",
              },
            ].map((cat, i) => (
              <div
                key={i}
                className="flex flex-col bg-white p-8 shadow-[0_4px_24px_-4px_rgba(26,47,35,0.08)]"
              >
                <h3 className="font-serif text-xl text-primary mb-4">
                  {cat.title}
                </h3>
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {cat.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span className="font-sans text-sm text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={cat.href}
                  className="inline-block text-center bg-primary text-white font-sans text-sm font-semibold tracking-wider px-6 py-3 hover:bg-primary/90 transition-colors duration-200 uppercase"
                >
                  {cat.linkText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-primary">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-12 md:py-14">
          <div className="flex items-center gap-4 text-center md:text-left text-white">
            <GiftIcon />
            <p className="font-sans text-white text-base md:text-lg leading-relaxed">
              Need something custom? We can create a personalised package just
              for you.
            </p>
          </div>
          <a
            href="/contact"
            className="bg-[var(--color-terracotta)] text-white font-sans text-sm font-bold tracking-wider px-8 py-3.5 hover:opacity-90 transition-opacity duration-200 flex-shrink-0"
          >
            ENQUIRE NOW
          </a>
        </div>
      </section>
    </main>
  );
}
