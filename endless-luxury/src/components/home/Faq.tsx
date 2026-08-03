"use client";

import { useState } from "react";
import Image from "next/image";
import { faqs } from "@/data/site";

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-cream py-20 md:py-24">
      <div className="el-container">
        {/* Section header */}
        <span className="el-eyebrow">FREQUENTLY ASKED QUESTIONS</span>
        <h2 className="font-heading text-navy font-bold text-3xl md:text-5xl leading-tight mt-3 max-w-xl mb-12">
          Everything you need to know, simplified.
        </h2>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left image */}
          <div className="relative rounded-[12px] overflow-hidden h-[420px]">
            <Image
              src="/images/home-4.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>

          {/* Right FAQ list */}
          <div className="divide-y divide-black/10">
            {faqs.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 text-left py-4 font-heading font-medium text-navy"
                >
                  <span>{item.q}</span>
                  <span className="text-gold text-xl">
                    {open === i ? "–" : "+"}
                  </span>
                </button>
                {open === i && (
                  <p className="pb-4 text-muted text-sm">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
