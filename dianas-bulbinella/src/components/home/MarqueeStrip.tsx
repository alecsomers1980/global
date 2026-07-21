import React from "react";

const items = [
  "NATURAL",
  "CRUELTY-FREE",
  "SMALL BATCH",
  "HANDMADE IN WHITE RIVER",
  "SINCE 2012",
  "DEALERS NATIONWIDE",
];

export default function MarqueeStrip() {
  const repeated = [...items, ...items];

  return (
    <section aria-label="Diana's brand values" className="border-y border-line bg-surface/70 overflow-hidden">
      <div className="flex w-max animate-marquee items-center gap-10 py-4">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-10 text-xs font-medium tracking-[0.3em] text-muted whitespace-nowrap"
          >
            {item}
            <span className="text-amber">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}
