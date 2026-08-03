"use client";

import { useState, FormEvent } from "react";
import { serviceTypes } from "@/data/site";

const field =
  "w-full bg-cream text-ink rounded-[10px] px-4 py-3 text-sm border border-black/10 outline-none focus:ring-2 focus:ring-gold";
const lbl =
  "block text-navy text-xs mb-1.5 uppercase tracking-wide font-heading";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-[12px] p-6 md:p-8 shadow-[0_1px_14px_rgba(18,25,97,0.08)]">
        <div className="py-12 text-center">
          <p className="text-navy font-heading font-bold text-xl md:text-2xl">
            Thank you — your enquiry has been received.
          </p>
          <p className="text-navy/80 mt-2 text-sm">
            We&apos;ll be in touch shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] p-6 md:p-8 shadow-[0_1px_14px_rgba(18,25,97,0.08)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div>
          <label className={lbl}>Name *</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              className={field}
              type="text"
              placeholder="First"
              required
              aria-label="First name"
            />
            <input
              className={field}
              type="text"
              placeholder="Last"
              aria-label="Last name"
            />
          </div>
        </div>

        {/* Email & Contact Number */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Email Address *</label>
            <input className={field} type="email" required />
          </div>
          <div>
            <label className={lbl}>Contact Number *</label>
            <input className={field} type="tel" required />
          </div>
        </div>

        {/* Hire Services */}
        <div>
          <label className={lbl}>Hire Services *</label>
          <select className={field} required defaultValue="">
            <option value="" disabled>
              Select a service
            </option>
            {serviceTypes.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        {/* Date Required */}
        <div>
          <label className={lbl}>Date Required for Hire *</label>
          <input className={field} type="date" required />
        </div>

        {/* Pick Up & Drop Off */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Pick Up Point *</label>
            <input className={field} type="text" required />
          </div>
          <div>
            <label className={lbl}>Drop Off Point *</label>
            <input className={field} type="text" required />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className={lbl}>Message / Special Requirements</label>
          <textarea className={field} rows={4} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-gold text-white uppercase tracking-wide text-sm font-heading rounded-[10px] px-8 py-3 hover:bg-gold-dark transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
