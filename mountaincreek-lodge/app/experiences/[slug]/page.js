"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getExperienceBySlug } from "@/lib/experiences";
import HeroHeader from "@/components/HeroHeader";

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

export default function ExperienceDetailPage() {
  const params = useParams();
  const [exp, setExp] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const found = getExperienceBySlug(params.slug);
    setExp(found);
    setLoaded(true);
  }, [params.slug]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-linen flex items-center justify-center">
        <p className="text-primary/50 text-lg">Loading...</p>
      </main>
    );
  }

  if (!exp) {
    return (
      <main className="min-h-screen bg-linen flex flex-col items-center justify-center px-6">
        <h1 className="font-serif text-4xl text-primary mb-4">
          Experience Not Found
        </h1>
        <p className="text-primary/60 mb-8">
          We couldn&apos;t find the experience you&apos;re looking for.
        </p>
        <Link
          href="/experiences"
          className="bg-primary text-white px-8 py-3 font-semibold tracking-wider text-sm hover:bg-primary/90 transition-colors"
        >
          VIEW ALL EXPERIENCES
        </Link>
      </main>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hi! I'd like to enquire about the "${exp.title}" experience at Mountain Creek Lodge.`
  );

  return (
    <main className="min-h-screen bg-linen">
      <HeroHeader
        eyebrow="Beyond The Lodge"
        title={exp.title}
        description={exp.shortDescription}
      />

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left — Description */}
          <div className="lg:col-span-2">
            <div className="aspect-[16/9] w-full overflow-hidden mb-10 shadow-lg border border-primary/5">
                <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
            </div>

            <h2 className="font-serif text-3xl text-primary mb-6">
              About This Experience
            </h2>
            <p className="font-sans text-primary/80 text-lg leading-relaxed mb-10">
              {exp.fullDescription}
            </p>

            {/* What's Included */}
            <h3 className="font-serif text-2xl text-primary mb-5">
              Highlights
            </h3>
            <ul className="space-y-4 mb-12">
              {exp.highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="font-sans text-base text-primary/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(26,47,35,0.08)] sticky top-28">
              <p className="font-serif text-3xl text-primary mb-8 text-center leading-tight">
                Plan Your <br/>Adventure
              </p>

              <div className="space-y-4 mb-8 pb-8 border-b border-primary/10">
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Distance</span>
                  <span className="font-medium text-primary text-right max-w-[150px]">
                    {exp.distance}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary/60">Category</span>
                  <span className="font-medium text-primary text-right max-w-[150px]">
                    {exp.category}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                 <p className="text-xs font-bold tracking-widest uppercase text-primary/40 mb-2">Practical Info</p>
                 <p className="text-sm text-primary/70 leading-relaxed">{exp.practicalInfo}</p>
              </div>

              <a
                href={`https://wa.me/27829594643?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[var(--color-terracotta)] text-white text-center font-semibold tracking-wider text-sm px-6 py-4 hover:opacity-90 transition-opacity mb-4"
              >
                ENQUIRE NOW
              </a>
              <Link
                href="/accommodation"
                className="block w-full border-2 border-primary text-primary text-center font-semibold tracking-wider text-sm px-6 py-3.5 hover:bg-primary hover:text-white transition-colors"
              >
                VIEW ACCOMMODATION
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Experiences */}
      <section className="bg-primary/5 py-14 text-center px-6">
        <p className="font-sans text-primary/60 text-base mb-6">
          Explore more ways to experience the Lowveld
        </p>
        <Link
          href="/experiences"
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
          ALL EXPERIENCES
        </Link>
      </section>
    </main>
  );
}
