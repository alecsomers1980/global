"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    return (
      <div className="text-center py-8">
        <p className="text-ink font-medium">Thanks — we&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm text-ink mb-1">Name *</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
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
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
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
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon resize-y"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
