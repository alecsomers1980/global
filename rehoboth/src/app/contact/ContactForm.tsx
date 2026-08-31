"use client";

import { useState, type FormEvent } from "react";
import { BotGuard } from "@/components/form/BotGuard";
import { sendContactMessage, type ContactResult } from "./actions";

const LABEL = "text-[13px] uppercase tracking-[0.08em] text-ink-mute";
const FIELD =
  "min-h-[48px] border border-hairline bg-white px-4 py-3 text-[15px] text-ink focus:border-brand focus:outline-none";

export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result: ContactResult = await sendContactMessage(new FormData(event.currentTarget));

    if (result.ok) {
      setSent(true);
    } else {
      setError(result.error);
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 border border-hairline bg-surface p-7">
        <h2 className="font-display text-2xl text-ink">Thank you</h2>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          We have your message and will come back to you as soon as we can. If it is
          urgent, please phone{" "}
          <a href="tel:+27828249023" className="underline hover:text-brand">
            082 824 9023
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
      <BotGuard />

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={LABEL}>Your name</label>
        <input id="name" name="name" autoComplete="name" required className={FIELD} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={LABEL}>Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required className={FIELD} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className={LABEL}>
            Phone number
            <span className="normal-case tracking-normal"> (optional)</span>
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={FIELD} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className={LABEL}>What is it about?</label>
        <select id="subject" name="subject" required defaultValue="" className={FIELD}>
          <option value="" disabled>Choose&hellip;</option>
          <option>A question about a product</option>
          <option>An order I have placed</option>
          <option>Stocking Rehoboth in my shop</option>
          <option>Something else</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={LABEL}>Your message</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className="border border-hairline bg-white px-4 py-3 text-[15px] text-ink focus:border-brand focus:outline-none"
        />
      </div>

      {error && (
        <div role="alert" className="border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex min-h-[54px] w-fit items-center justify-center bg-brand px-10 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
