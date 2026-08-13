"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", honeypot: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [renderedAt] = useState(() => Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, renderedAt }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "sent") {
    return <p className="text-ink font-medium py-8 text-center">Thanks — we'll be in touch soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="honeypot">Company</label>
        <input
          id="honeypot"
          name="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm text-ink mb-1">Name *</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-ink mb-1">Email *</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm text-ink mb-1">Message *</label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-terracotta text-white px-5 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}