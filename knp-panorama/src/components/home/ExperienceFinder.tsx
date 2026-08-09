'use client';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { PILLARS, DESTINATIONS, COMFORT_TIERS } from '@/data/taxonomy';

export function ExperienceFinder() {
  const router = useRouter();
  const [experience, setExperience] = useState('');
  const [destination, setDestination] = useState('');
  const [comfort, setComfort] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (experience) params.set('experience', experience);
    if (destination) params.set('destination', destination);
    if (comfort) params.set('comfort', comfort);
    // This is a quote router, not a search index — it filters nothing.
    router.push(`/request-a-quote?${params.toString()}`);
  };

  return (
    <div className="container-kpe relative z-10 -mt-20">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded bg-white p-6 shadow-xl md:grid-cols-4 md:items-end"
      >
        <div>
          <label htmlFor="finder-experience" className="mb-2 block text-xs uppercase tracking-wide3 text-text/70">
            Experience
          </label>
          <select id="finder-experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full rounded border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-amber"
          >
            <option value="">Any experience</option>
            {PILLARS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="finder-destination" className="mb-2 block text-xs uppercase tracking-wide3 text-text/70">
            Destination
          </label>
          <select id="finder-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-amber"
          >
            <option value="">Any destination</option>
            {DESTINATIONS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="finder-comfort" className="mb-2 block text-xs uppercase tracking-wide3 text-text/70">
            Comfort
          </label>
          <select id="finder-comfort"
            value={comfort}
            onChange={(e) => setComfort(e.target.value)}
            className="w-full rounded border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-amber"
          >
            <option value="">Any comfort level</option>
            {COMFORT_TIERS.map((tier) => (
              <option key={tier.slug} value={tier.slug}>
                {tier.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="h-[46px] w-full rounded bg-amber px-4 text-xs font-semibold uppercase tracking-wide3 text-ink hover:bg-amber-soft"
        >
          Request a Quote
        </button>
      </form>
    </div>
  );
}
