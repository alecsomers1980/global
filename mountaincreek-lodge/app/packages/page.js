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

  useEffect(() => {
    setPackages(getActivePackages());
    setLoaded(true);
  }, []);

  return (
    <main className="bg-linen min-h-screen">
      <HeroHeader
        eyebrow="Mountaincreek Lodge"
        title="Curated Escape Packages"
        description="Choose your perfect Lowveld experience."
      />

      {/* Packages List */}
      <section className="bg-linen py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          {!loaded ? (
            <div className="text-center py-20">
              <p className="text-primary/50 text-lg">Loading packages...</p>
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
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
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
