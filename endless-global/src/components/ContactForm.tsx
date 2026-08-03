"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  service: string;
  message: string;
  consent: boolean;
};

type ContactFormProps = {
  variant?: "full" | "compact";
  className?: string;
};

const initialForm: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  country: "",
  company: "",
  service: "",
  message: "",
  consent: false,
};

export default function ContactForm({
  variant = "full",
  className = "",
}: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>(initialForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): boolean => {
    if (!form.name.trim() || !form.email.trim() || !form.service) {
      setErrorMessage("Please fill in all required fields.");
      return false;
    }
    if (variant === "full" && !form.consent) {
      setErrorMessage("You must consent to the privacy policy to proceed.");
      return false;
    }
    // basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm(initialForm);
      } else {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-xl border border-line p-6 md:p-8 ${className}`}
    >
      {status === "success" ? (
        <div className="text-center py-10">
          <h3 className="text-2xl font-bold text-brand mb-4">Thank You!</h3>
          <p className="text-muted text-base">
            We’ll be in touch shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Name + Email row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Phone + Country (full only) */}
          {variant === "full" ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
          ) : (
            /* phone only for compact */
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          )}

          {/* Company (full only) */}
          {variant === "full" && (
            <div>
              <label htmlFor="company" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                Company Name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={form.company}
                onChange={handleChange}
                className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          )}

          {/* Service */}
          <div>
            <label htmlFor="service" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              Service Required <span className="text-red-500">*</span>
            </label>
            <select
              id="service"
              name="service"
              value={form.service}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="" disabled>
                Select a Service
              </option>
              <option value="investment">Investment Services</option>
              <option value="financial">Financial Services</option>
              <option value="trade">Trade Services</option>
              <option value="consulting">Consulting Services</option>
              <option value="other">Other / Not Sure</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              What Are You Looking For?
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Consent (full only) */}
          {variant === "full" && (
            <div className="flex items-start gap-3">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                checked={form.consent}
                onChange={handleChange}
                className="mt-1 accent-brand"
              />
              <label htmlFor="consent" className="text-sm text-muted leading-relaxed">
                I consent to having my information collected and used for the purpose of being contacted, in accordance with the{" "}
                <Link
                  href="/privacy-policy"
                  className="text-brand underline hover:text-brand-dark"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn-primary w-full md:w-auto"
          >
            {status === "submitting" ? "Sending..." : "Submit →"}
          </button>
        </form>
      )}
    </div>
  );
}
