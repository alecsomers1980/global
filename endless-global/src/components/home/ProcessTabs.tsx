"use client";

import { useState } from "react";
import { processSteps } from "@/lib/content";

type ProcessStep = {
  tab: string;
  image: string;
  title: string;
  lead: string;
  blocks: {
    heading: string;
    text: string;
  }[];
};

export default function ProcessTabs() {
  const [active, setActive] = useState(0);
  const steps = processSteps as ProcessStep[];

  return (
    <section className="bg-section py-16 md:py-24">
      <div className="eg-container">
        <div className="relative overflow-hidden rounded-xl pleated">
          <div className="absolute inset-0 bg-brand/70" />
          <h2 className="section-title relative !text-white text-center px-6 py-12 md:py-16">
            A Simple Process, Powerful Results
          </h2>
        </div>

        <div
          className="mt-10 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:border-b border-line"
          role="tablist"
          aria-label="Process steps"
        >
          {steps.map((step, i) => (
            <button
              key={i}
              id={`tab-${i}`}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`px-5 py-3 text-sm font-semibold text-left transition-colors ${
                i === active
                  ? "text-brand border-b-2 border-brand"
                  : "text-muted hover:text-brand"
              }`}
            >
              {step.tab}
            </button>
          ))}
        </div>

        <div
          key={active}
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className="mt-10 grid md:grid-cols-2 gap-10 lg:gap-16 items-start"
        >
          <img
            src={steps[active].image}
            alt={steps[active].title}
            className="w-full rounded-xl shadow-lg object-cover"
          />
          <div>
            <p className="text-lg font-medium text-ink">
              {steps[active].lead}
            </p>
            {steps[active].blocks.map((block, idx) => (
              <div key={idx} className="mt-6">
                <h3 className="text-base font-semibold text-brand">
                  {block.heading}
                </h3>
                <p className="mt-1 text-muted leading-relaxed">
                  {block.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
