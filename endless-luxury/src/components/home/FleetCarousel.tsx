"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fleet } from "@/data/site";

export default function FleetCarousel() {
  const [start, setStart] = useState(0);
  const maxStart = Math.max(0, fleet.length - 3);

  const prev = () => setStart((s) => Math.max(0, s - 1));
  const next = () => setStart((s) => Math.min(maxStart, s + 1));

  return (
    <section className="bg-cream py-20 md:py-24">
      <div className="el-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="el-eyebrow">OUR FLEET</span>
            <h2 className="font-heading text-navy font-bold text-3xl md:text-5xl leading-tight mt-3 max-w-xl">
              Connecting you with vehicles that impress
            </h2>
            <p className="text-muted mt-4 max-w-xl">
              Endless Luxury gives you access to a curated selection of vehicles sourced through
              trusted partners. Whether you’re making a statement arrival, hosting a group, or
              needing refined business-class comfort, we arrange the right car for every occasion.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="bg-gold text-white uppercase text-sm tracking-wide font-heading rounded-[10px] px-7 py-3 hover:bg-gold-dark whitespace-nowrap"
          >
            View All →
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Prev */}
          <button
            onClick={prev}
            disabled={start === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-navy/20 bg-white text-navy grid place-items-center hover:bg-navy hover:text-white transition shadow disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={next}
            disabled={start >= maxStart}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-navy/20 bg-white text-navy grid place-items-center hover:bg-navy hover:text-white transition shadow disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Viewport */}
          <div className="overflow-hidden mx-0 md:mx-14">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${start * (100 / 3)}%)` }}
            >
              {fleet.map((item, i) => {
                const isCenter = i === start + 1;
                return (
                  <div key={i} className="shrink-0 w-full md:w-1/3 px-3">
                    <div
                      className={`rounded-[10px] overflow-hidden shadow-[0_1px_10px_rgba(18,25,97,0.10)] transition ${
                        isCenter ? "bg-navy text-white" : "bg-white text-navy"
                      }`}
                    >
                      <div className="relative w-full h-48">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                        <div
                          className={`h-0.5 w-14 my-3 ${isCenter ? "bg-white" : "bg-gold"}`}
                        />
                        <p className={`text-sm ${isCenter ? "text-white/80" : "text-muted"}`}>
                          {item.description}
                        </p>
                        <Link
                          href="/talk-to-us"
                          className="inline-block mt-4 text-gold uppercase text-xs tracking-wide font-heading hover:underline"
                        >
                          Secure Your Vehicle →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
