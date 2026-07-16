"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // TODO: wire to real backend (e.g. Resend) once API key is configured
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <h3 className="font-heading text-2xl font-bold text-brand-navy mb-3">
          Thanks — we’ll be in touch soon!
        </h3>
        <p className="text-brand-navy/70">
          A member of our team will respond to your enquiry as quickly as
          possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <h2 className="font-heading text-2xl font-semibold text-brand-navy mb-4">
        Enquiry Form
      </h2>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-brand-navy mb-1"
        >
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-brand-sky bg-white px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition"
          placeholder="Your name"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-brand-navy mb-1"
        >
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-brand-sky bg-white px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-brand-navy mb-1"
        >
          Phone (optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-xl border border-brand-sky bg-white px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition"
          placeholder="+27 000 000 0000"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-brand-navy mb-1"
        >
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-xl border border-brand-sky bg-white px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none transition resize-y"
          placeholder="How can we help you?"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-brand-sand text-white font-semibold px-8 py-3 rounded-full hover:bg-brand-teal transition-colors focus:outline-none focus:ring-2 focus:ring-brand-sand/50"
      >
        Send Message
      </button>
    </form>
  );
}
