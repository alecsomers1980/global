"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function UniqueProjects() {
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = [card1Ref.current, card2Ref.current];
      cards.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
      });
    };

    const handleMouseLeave = () => {
      [card1Ref.current, card2Ref.current].forEach((card) => {
        if (!card) return;
        card.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0)";
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section id="unique-projects" className="bg-gray-50 py-24">
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Text Content */}
          <div>
            <p className="section-label mb-4">Unique Projects</p>
            <h2 className="section-heading mb-6">Creating the perfect environment</h2>
            <p className="mb-4 leading-relaxed text-brand-navy/70">
              At Exec-Air Air Conditioning, we specialize in heating, ventilation, and air conditioning
              (HVAC) solutions across residential, commercial, and industrial sectors. Our team brings
              decades of combined experience to every project, ensuring optimal climate control for
              any environment.
            </p>
            <p className="mb-8 leading-relaxed text-brand-navy/70">
              From single-room installations to large-scale industrial systems, we deliver tailored
              solutions that balance comfort, efficiency, and reliability.
            </p>
            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-teal px-8 py-3 font-semibold text-brand-teal transition-all duration-300 hover:bg-brand-teal hover:text-white"
            >
              READ MORE ABOUT US
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Images — offset layout with tilt movement */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Residential — offset top-right */}
            <div
              ref={card1Ref}
              className="relative z-20 -mr-4 w-60 overflow-hidden rounded-2xl bg-white shadow-xl transition-shadow duration-500 hover:shadow-2xl sm:w-72"
              style={{ transition: "transform 0.15s ease-out, box-shadow 0.5s" }}
            >
              <div className="bg-brand-sky/20 p-3">
                <Image
                  src="/images/icons/residential-air-conditioner.png"
                  alt="Residential air conditioning unit"
                  width={320}
                  height={320}
                  className="mx-auto h-52 w-auto object-contain sm:h-64"
                />
              </div>
              <div className="border-t border-gray-100 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-brand-navy">Residential Solutions</p>
                <p className="text-xs text-brand-navy/50">Homes &amp; Estates</p>
              </div>
            </div>

            {/* Industrial — offset bottom-left, overlapping */}
            <div
              ref={card2Ref}
              className="relative z-10 -ml-4 mt-20 w-60 overflow-hidden rounded-2xl bg-white shadow-xl transition-shadow duration-500 hover:shadow-2xl sm:w-72"
              style={{ transition: "transform 0.15s ease-out, box-shadow 0.5s" }}
            >
              <div className="bg-brand-sky/20 p-3">
                <Image
                  src="/images/icons/Heavy-industrial-hvac-system.png"
                  alt="Industrial HVAC system"
                  width={320}
                  height={320}
                  className="mx-auto h-52 w-auto object-contain sm:h-64"
                />
              </div>
              <div className="border-t border-gray-100 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-brand-navy">Commercial &amp; Industrial</p>
                <p className="text-xs text-brand-navy/50">Large-scale Systems</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
