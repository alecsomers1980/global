"use client";

import { useState, type FormEvent } from "react";
import { BUSINESS } from "@/data/business";

type Status = "idle" | "sending" | "sent" | "error";

export default function LeadForm({
  quoteSummary,
  heading = "Ask us for a quote",
  intro = "Leave your details and we'll come back to you — usually the same working day.",
}: {
  quoteSummary?: string;
  heading?: string;
  intro?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, quoteSummary }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      setError("Network problem — please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-card border border-brand/20 bg-brand-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-ink">Thanks — we&rsquo;ve got it.</h3>
        <p className="mt-2 text-ink/70">
          We&rsquo;ll be in touch shortly. In a hurry?{" "}
          <a
            href={BUSINESS.whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand underline underline-offset-4"
          >
            WhatsApp us
          </a>
          .
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink/35 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-display text-2xl font-bold text-ink">{heading}</h3>
        <p className="mt-1 text-sm text-ink/60">{intro}</p>
      </div>

      {/* Honeypot — hidden from humans, catnip for bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink/80">Your name *</span>
          <input name="name" required minLength={2} className={field} placeholder="Jane Nkosi" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink/80">Phone / WhatsApp *</span>
          <input name="phone" required minLength={8} inputMode="tel" className={field} placeholder="072 123 4567" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink/80">Email</span>
          <input name="email" type="email" className={field} placeholder="you@example.co.za" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink/80">Where are you building?</span>
          <select name="town" className={field} defaultValue="">
            <option value="">Select your area</option>
            {BUSINESS.serviceAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
            <option value="Other">Somewhere else</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink/80">
          What do you need? {quoteSummary && <span className="text-ink/40">(your quote is attached automatically)</span>}
        </span>
        <textarea
          name="message"
          rows={4}
          className={field}
          placeholder="Tell us what you're planning — size, use, timing, anything useful."
        />
      </label>

      {quoteSummary && (
        <details className="rounded-lg border border-brand/20 bg-brand-50/60 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-brand">
            Your quote will be included
          </summary>
          <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink/70">
            {quoteSummary}
          </pre>
        </details>
      )}

      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">{error}</p>
          <p className="mt-1">
            You can also{" "}
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              WhatsApp us
            </a>{" "}
            or call{" "}
            <a href={BUSINESS.phone.href} className="font-semibold underline">
              {BUSINESS.phone.display}
            </a>
            .
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-brand px-8 py-3.5 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send my enquiry"}
      </button>

      <p className="text-xs text-ink/45">
        We use your details only to reply to this enquiry.
      </p>
    </form>
  );
}
