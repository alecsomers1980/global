"use client";

import { useState } from "react";
import { BotGuard } from "@/components/form/BotGuard";
import { submitStockistApplication, type StockistResult } from "./actions";

export function StockistForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result: StockistResult = await submitStockistApplication(formData);

    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error);
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 border border-hairline bg-surface p-7">
        <h2 className="font-display text-2xl text-ink">Thank you</h2>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          We have your application and will be in touch. Trade prices follow once
          your application is approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
      <BotGuard />

      {error && (
        <div role="alert" className="border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="business" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
          Business name
        </label>
        <input
          id="business"
          name="business"
          required
          className="min-h-[48px] border border-hairline bg-white px-4 py-3 text-[15px] text-ink focus:border-brand focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
          Your name
        </label>
        <input
          id="contact"
          name="contact"
          required
          className="min-h-[48px] border border-hairline bg-white px-4 py-3 text-[15px] text-ink focus:border-brand focus:outline-none"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="min-h-[48px] border border-hairline bg-white px-4 py-3 text-[15px] text-ink focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="min-h-[48px] border border-hairline bg-white px-4 py-3 text-[15px] text-ink focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="town" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
          Town
        </label>
        <input
          id="town"
          name="town"
          required
          className="min-h-[48px] border border-hairline bg-white px-4 py-3 text-[15px] text-ink focus:border-brand focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="stocking" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
          What do you stock at the moment?
          <span className="normal-case tracking-normal"> (optional)</span>
        </label>
        <textarea
          id="stocking"
          name="stocking"
          rows={4}
          className="border border-hairline bg-white px-4 py-3 text-[15px] text-ink focus:border-brand focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="flex min-h-[54px] w-fit items-center justify-center bg-brand px-10 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep disabled:opacity-60"
      >
        {busy ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
