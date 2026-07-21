"use client";

import { useState } from "react";
import { PROVINCES, COUNTRIES, SOUTH_AFRICA } from "@/lib/dealer-types";

export default function DealerApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(SOUTH_AFRICA);
  const [province, setProvince] = useState("");
  const [town, setTown] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const isSA = country === SOUTH_AFRICA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dealer-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          country,
          province: isSA ? province : "",
          town,
          business,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-ink mb-2">Thank you</h2>
        <p className="text-muted">
          Diana has your application and will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm text-muted mb-1">Name *</label>
        <input
          required
          className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Email *</label>
        <input
          required
          type="email"
          className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Phone</label>
        <input
          type="tel"
          className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Country</label>
        <select
          className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest w-full"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            if (e.target.value !== SOUTH_AFRICA) setProvince("");
          }}
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {isSA && (
        <div>
          <label className="block text-sm text-muted mb-1">Province</label>
          <select
            className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest w-full"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            <option value="">Select province</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm text-muted mb-1">Town</label>
        <input
          className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest w-full"
          value={town}
          onChange={(e) => setTown(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Business</label>
        <input
          className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest w-full"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm text-muted mb-1">
          Tell Diana a little about yourself
        </label>
        <textarea
          rows={4}
          className="rounded-2xl border border-line bg-surface px-5 py-3.5 text-sm outline-none focus:border-forest w-full"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 sm:col-span-2">{error}</p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-paper hover:bg-moss transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? "Sending…" : "Send application"}
        </button>
      </div>
    </form>
  );
}
