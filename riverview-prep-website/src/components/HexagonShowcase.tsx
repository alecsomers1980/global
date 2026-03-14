"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";

const hexagonData = [
  {
    id: 1,
    image: "/images/Gallery/Culture/IMG_6334 (2).jpg",
    className: "w-48 h-56 md:w-64 md:h-72",
    top: "5%",
    left: "20%",
    delay: 0,
    zIndex: 10,
  },
  {
    id: 2,
    image: "/images/Gallery/Sport/IMG_7306.jpg",
    className: "w-40 h-48 md:w-56 md:h-64",
    top: "40%",
    left: "50%",
    delay: 0.2,
    zIndex: 20,
  },
  {
    id: 3,
    color: "bg-brand-green",
    className: "w-32 h-36 md:w-40 md:h-44",
    top: "15%",
    left: "70%",
    delay: 0.4,
    zIndex: 5,
  },
  {
    id: 5,
    color: "bg-brand-gold",
    className: "w-20 h-24 md:w-28 md:h-32",
    top: "75%",
    left: "35%",
    delay: 0.8,
    zIndex: 5,
  },
];

const HexagonShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const hexagons = containerRef.current.querySelectorAll(".hexagon-item");

    gsap.fromTo(
      hexagons,
      { opacity: 0, scale: 0.8, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      }
    );

    // Subtle floating animation
    hexagons.forEach((hex, i) => {
      gsap.to(hex, {
        y: "+=15",
        x: "+=5",
        duration: 3 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2,
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center">
      <div className="relative w-full h-full">
        {hexagonData.map((hex) => (
          <div
            key={hex.id}
            className={`hexagon-item absolute transition-transform duration-500 hover:scale-105 group cursor-pointer ${hex.className}`}
            style={{
              top: hex.top,
              left: hex.left,
              zIndex: hex.zIndex,
            }}
          >
            {/* Decorative background frame (Gold border) */}
            <div className="absolute -top-1 -right-1 w-full h-full border border-brand-gold/20 rounded-2xl md:rounded-[2.5rem] -z-10 transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-1" />
            
            {/* Main Container */}
            <div className={`relative w-full h-full overflow-hidden shadow-xl border-2 md:border-4 border-white transition-all duration-700
              ${hex.id % 2 === 0 ? "rounded-tr-[2rem] rounded-bl-[2rem] md:rounded-tr-[3rem] md:rounded-bl-[3rem]" : "rounded-tl-[2rem] rounded-br-[2rem] md:rounded-tl-[3rem] md:rounded-br-[3rem]"}
              ${hex.image ? "bg-white" : hex.color}
              group-hover:scale-105 group-hover:shadow-2xl`}
            >
              {hex.image ? (
                <>
                  <Image
                    src={hex.image}
                    alt="School Life"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-green/20 to-transparent opacity-40 group-hover:opacity-10 transition-opacity" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <div className="w-1/2 h-1/2 border-2 border-white rounded-full animate-pulse opacity-20" />
                </div>
              )}
            </div>

            {/* Golden glow pulse for image hexagons */}
            {hex.image && (
              <div className="absolute -inset-2 rounded-[3.5rem] bg-brand-gold/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HexagonShowcase;
