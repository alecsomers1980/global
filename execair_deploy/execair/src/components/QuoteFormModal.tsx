"use client";

import { useState, useRef, useEffect } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import type { Product } from "@/lib/data";

interface QuoteFormModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuoteFormModal({ product, onClose }: QuoteFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      customer_name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      company: form.get("company") as string || null,
      product_name: product.name,
      product_btu: product.btu,
      message: form.get("message") as string || "",
    };

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Something went wrong");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 fade-in">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-brand-navy to-brand-navy/95 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">
                Request a Quote
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">{product.name}</h2>
              <p className="mt-0.5 text-sm text-white/50">{product.btu}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 inline-flex rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-brand-navy">Quote Request Sent</h3>
            <p className="text-brand-navy/60">
              Thank you! Our sales team will get back to you within 24 hours regarding the{" "}
              <strong>{product.name}</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-full bg-brand-teal px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            {/* Name */}
            <div>
              <label htmlFor="quote-name" className="mb-1 block text-sm font-medium text-brand-navy">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="quote-name"
                name="name"
                type="text"
                required
                placeholder="Your full name"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="quote-email" className="mb-1 block text-sm font-medium text-brand-navy">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="quote-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="quote-phone" className="mb-1 block text-sm font-medium text-brand-navy">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="quote-phone"
                name="phone"
                type="tel"
                required
                placeholder="+27 82 123 4567"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="quote-company" className="mb-1 block text-sm font-medium text-brand-navy">
                Company <span className="text-brand-navy/40">(optional)</span>
              </label>
              <input
                id="quote-company"
                name="company"
                type="text"
                placeholder="Your company name"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="quote-message" className="mb-1 block text-sm font-medium text-brand-navy">
                Additional Requirements <span className="text-brand-navy/40">(optional)</span>
              </label>
              <textarea
                id="quote-message"
                name="message"
                rows={3}
                placeholder="Tell us about your space, installation requirements, or any questions..."
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-teal px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 hover:shadow-lg hover:shadow-brand-teal/20 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Quote Request"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
