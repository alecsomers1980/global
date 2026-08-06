"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" });
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
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-8">
        <p className="text-text">Thanks — Donald will be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-4">
      {/* Honeypot: hidden from real users, often auto-filled by bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm text-text mb-1">Name</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-text mb-1">Email</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm text-text mb-1">Message</label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text resize-y"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-accent">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-accent text-canvas px-5 py-2 rounded hover:bg-accent-hi disabled:opacity-50 text-sm font-medium"
      >
        {status === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}