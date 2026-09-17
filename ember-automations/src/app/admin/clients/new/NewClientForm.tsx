"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewClientForm() {
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [vertical, setVertical] = useState("");
  const [aiProvider, setAiProvider] = useState("deepseek");
  const [monthlyCredits, setMonthlyCredits] = useState("0");
  const [maxActive, setMaxActive] = useState("1");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const res = await fetch("/api/admin/spine/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        name,
        vertical,
        ai_provider: aiProvider,
        plan: {
          monthly_credits: Number(monthlyCredits),
          max_active: Number(maxActive),
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to create client");
      return;
    }

    router.push(`/admin/clients/${data.client.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#6b6b8a] text-sm mb-1">Slug</label>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-[#6b6b8a] text-sm mb-1">Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-[#6b6b8a] text-sm mb-1">Vertical</label>
          <input
            value={vertical}
            onChange={(event) => setVertical(event.target.value)}
            className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-[#6b6b8a] text-sm mb-1">AI provider</label>
          <select
            value={aiProvider}
            onChange={(event) => setAiProvider(event.target.value)}
            className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
          >
            <option value="deepseek">Deepseek</option>
            <option value="claude">Claude</option>
          </select>
        </div>

        <div>
          <label className="block text-[#6b6b8a] text-sm mb-1">Monthly credits</label>
          <input
            type="number"
            value={monthlyCredits}
            onChange={(event) => setMonthlyCredits(event.target.value)}
            className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-[#6b6b8a] text-sm mb-1">Max active requests</label>
          <input
            type="number"
            value={maxActive}
            onChange={(event) => setMaxActive(event.target.value)}
            className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      {error ? <p className="text-red-400 text-sm">{error}</p> : null}

      <button
        type="submit"
        className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm"
      >
        Create client
      </button>
    </form>
  );
}

