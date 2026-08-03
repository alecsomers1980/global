"use client";

import { useState } from "react";
import Image from "next/image";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="el-container my-0">
      <div className="relative overflow-hidden rounded-[14px]">
        <Image
          src="/images/newletterBG.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gold/90 to-gold-dark/80" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10">
          <Image
            src="/images/EndlessLuxuryLogo.png"
            alt="Endless Luxury"
            width={200}
            height={56}
            className="h-auto w-auto max-h-14"
          />
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="email"
                required
                placeholder="Email Address"
                className="bg-white text-ink rounded-[10px] px-4 py-3 w-64 placeholder:text-muted"
              />
              <button
                type="submit"
                className="bg-navy text-white rounded-[10px] px-6 py-3 text-sm uppercase tracking-wide font-heading hover:bg-navy-dark transition"
              >
                Subscribe
              </button>
            </form>
          ) : (
            <p className="text-white font-medium">Thank you for subscribing.</p>
          )}
        </div>
      </div>
    </div>
  );
}
