"use client";

import React from 'react';
import HeroHeader from "@/components/HeroHeader";
import { experiences } from '@/lib/experiences';
import Link from 'next/link';
import Image from 'next/image';
const highlights = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    text: "20 mins to Kruger Park",
  },
  {
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    text: "Scenic Drives & Waterfalls",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
    text: "Adventure for Everyone",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
    ),
    text: "Local Flavours & Warm Hospitality",
  },
];

export default function ExperiencesPage() {
  return (
    <main className="font-sans">
      <HeroHeader
        eyebrow="Beyond The Lodge"
        title="Discover the Lowveld"
        description="Adventure, wildlife, waterfalls, food and unforgettable scenery — all within reach."
      />

      {/* Experiences Layout */}
      <section className="bg-linen py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          {experiences.map((exp, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } bg-white overflow-hidden shadow-[0_4px_24px_-4px_rgba(26,47,35,0.08)] hover:shadow-[0_12px_40px_-8px_rgba(26,47,35,0.12)] transition-shadow duration-500`}
            >
              {/* Image Side */}
              <div className="relative w-full md:w-[45%] flex-shrink-0">
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full w-full overflow-hidden">
                  <Image 
                    src={exp.image} 
                    alt={exp.title} 
                    fill
                    quality={90}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>

              {/* Content Side */}
              <div className="flex flex-col justify-center p-8 md:p-10 lg:p-14 w-full text-center md:text-left">
                <h2 className="font-serif text-primary text-2xl lg:text-3xl mb-4">
                  {exp.title}
                </h2>
                <p className="font-sans text-gray-600 text-base mb-8 leading-relaxed">
                  {exp.shortDescription}
                </p>
                <div className="flex justify-center md:justify-start mt-auto">
                  <Link 
                    href={exp.slug === 'red-litchi' ? '/red-litchi' : `/experiences/${exp.slug}`}
                    className="inline-block bg-[var(--color-terracotta)] text-white font-sans text-sm font-semibold tracking-wider px-8 py-3.5 hover:opacity-90 transition-opacity duration-200 uppercase"
                  >
                    LEARN MORE
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights Icons Row */}
      <section className="bg-white py-12 border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {highlights.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              <span className="font-sans text-sm text-primary font-medium leading-tight">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Call to Action Banner */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-6">
          <p className="font-sans text-lg md:text-xl leading-relaxed">
            Let us help you plan your perfect itinerary. We'll take care of the details so you can enjoy every moment.
          </p>
          <button className="bg-[var(--color-terracotta)] text-white px-8 py-3 font-bold tracking-widest text-sm hover:opacity-90 transition-opacity">
            PLAN YOUR ESCAPE
          </button>
        </div>
      </section>
    </main>
  );
}
