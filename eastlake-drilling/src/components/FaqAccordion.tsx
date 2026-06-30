"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  items: { q: string; a: string }[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="border border-black/5 bg-white rounded-xl"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-ink">{item.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-ink/70 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-ink/70 text-sm leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}