"use client";

import { useState, FormEvent } from "react";
import { serviceTypes } from "@/data/site";

const field =
  "w-full bg-white text-ink rounded-[10px] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold";
const lbl = "block text-white text-xs mb-1.5 uppercase tracking-wide";

export default function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-black/45 backdrop-blur-sm border border-white/10 rounded-[10px] p-6 md:p-8 w-full max-w-md">
      <h3 className="font-heading text-white text-xl font-semibold mb-5">
        Request Estimate
      </h3>

      {submitted ? (
        <div className="py-10 text-center text-white">
          Thank you — we&apos;ll be in touch shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className={lbl}>Full Name *</label>
            <input type="text" required className={field} />
          </div>

          {/* Phone & Service Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Phone Number *</label>
              <input type="tel" required className={field} />
            </div>
            <div>
              <label className={lbl}>Service Type *</label>
              <select required className={field}>
                <option value="" disabled>
                  Service Type
                </option>
                {serviceTypes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Start Date</label>
              <input type="date" className={field} />
            </div>
            <div>
              <label className={lbl}>End Date</label>
              <input type="date" className={field} />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Start Time</label>
              <input type="time" className={field} />
            </div>
            <div>
              <label className={lbl}>End Time</label>
              <input type="time" className={field} />
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label className={lbl}>Special Requirements</label>
            <textarea rows={3} className={field} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-gold text-white uppercase tracking-wide text-sm font-heading rounded-[10px] px-7 py-3 hover:bg-gold-dark transition w-full md:w-auto"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
