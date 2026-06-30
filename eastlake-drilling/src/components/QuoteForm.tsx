"use client";

import { useState, FormEvent } from "react";
import { Send } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  suburb: "",
  serviceType: "Borehole Drilling",
  message: "",
};

export default function QuoteForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setForm(initialForm);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="text-sm font-medium text-ink/80 mb-1 block">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="rounded-lg border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 w-full"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink/80 mb-1 block">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 w-full"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-ink/80 mb-1 block">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            className="rounded-lg border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 w-full"
          />
        </div>

        {/* Suburb */}
        <div>
          <label htmlFor="suburb" className="text-sm font-medium text-ink/80 mb-1 block">
            Suburb / Area
          </label>
          <input
            type="text"
            id="suburb"
            name="suburb"
            value={form.suburb}
            onChange={handleChange}
            className="rounded-lg border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 w-full"
          />
        </div>
      </div>

      {/* Service Type */}
      <div>
        <label htmlFor="serviceType" className="text-sm font-medium text-ink/80 mb-1 block">
          Service Type
        </label>
        <select
          id="serviceType"
          name="serviceType"
          value={form.serviceType}
          onChange={handleChange}
          className="rounded-lg border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 w-full"
        >
          <option value="Borehole Drilling">Borehole Drilling</option>
          <option value="Pump Installation">Pump Installation</option>
          <option value="Water Purification">Water Purification</option>
          <option value="Water Storage">Water Storage</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="text-sm font-medium text-ink/80 mb-1 block">
          Tell us about your project
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          className="rounded-lg border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 w-full resize-y"
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center rounded-full px-6 py-3 text-white font-medium bg-brand hover:bg-brand-dark disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40"
      >
        <Send className="w-4 h-4 mr-2" />
        {status === "submitting" ? "Sending…" : "Send Request"}
      </button>

      {/* Success message */}
      {status === "success" && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
          Thanks — we&apos;ll be in touch shortly.
        </div>
      )}

      {/* Error message */}
      {status === "error" && errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
          {errorMessage}
        </div>
      )}
    </form>
  );
}