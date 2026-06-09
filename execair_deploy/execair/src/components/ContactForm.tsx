"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    details: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Build mailto with form data
    const subject = encodeURIComponent(`Website Enquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nCompany: ${formData.company}\nContact Number: ${formData.phone}\nEmail: ${formData.email}\n\nQuote Request Details:\n${formData.details}`
    );

    // Open email client as fallback, then show sent state
    window.open(`mailto:info@execair.co.za?subject=${subject}&body=${body}`, "_blank");

    setTimeout(() => {
      setStatus("sent");
      setFormData({ name: "", company: "", phone: "", email: "", details: "" });
      setTimeout(() => setStatus("idle"), 5000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-brand-navy/50">Fields marked with an * are required</p>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-brand-navy">
          Name <span className="text-brand-orange">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy transition-all duration-300 placeholder:text-gray-400 focus:border-brand-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-brand-navy">
          Company
        </label>
        <input
          id="company"
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy transition-all duration-300 placeholder:text-gray-400 focus:border-brand-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
          placeholder="Your company name"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-brand-navy">
          Contact Number
        </label>
        <input
          id="phone"
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy transition-all duration-300 placeholder:text-gray-400 focus:border-brand-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
          placeholder="Your contact number"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-brand-navy">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy transition-all duration-300 placeholder:text-gray-400 focus:border-brand-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="details" className="mb-1.5 block text-sm font-medium text-brand-navy">
          Quote Request Details
        </label>
        <textarea
          id="details"
          rows={5}
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy transition-all duration-300 placeholder:text-gray-400 focus:border-brand-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
          placeholder="Tell us about your HVAC requirements..."
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending" || status === "sent"}
        className="w-full rounded-full bg-brand-teal px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-teal/90 hover:shadow-lg hover:shadow-brand-teal/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "idle" && "Send Message"}
        {status === "sending" && "Sending..."}
        {status === "sent" && "Message Sent! ✓"}
      </button>
    </form>
  );
}
