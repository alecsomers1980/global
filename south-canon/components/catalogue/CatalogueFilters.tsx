import { TERRITORIES } from '@/lib/types'
import type { CatalogueFilters as Filters } from '@/lib/filters'
import type { Playwright } from '@/lib/types'

export function CatalogueFilters({
  filters,
  genres,
  playwrights,
}: {
  filters: Filters
  genres: string[]
  playwrights: Playwright[]
}) {
  return (
    <form method="get" className="grid gap-4 border-b border-rule pb-8 md:grid-cols-5">
      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-xs uppercase tracking-wide text-muted">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Title, writer or subject"
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Genre</span>
        <select
          name="genre"
          defaultValue={filters.genres[0] ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Playwright</span>
        <select
          name="playwright"
          defaultValue={filters.playwright ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        >
          <option value="">All playwrights</option>
          {playwrights.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Max cast</span>
        <input
          type="number"
          name="castMax"
          min={1}
          defaultValue={filters.castMax ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Max duration (min)</span>
        <input
          type="number"
          name="durationMax"
          min={1}
          step={5}
          defaultValue={filters.durationMax ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Available in</span>
        <select
          name="territory"
          defaultValue={filters.territory ?? ''}
          className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
        >
          <option value="">Any territory</option>
          {TERRITORIES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="self-end border border-ink px-6 py-2 text-sm uppercase tracking-wide hover:bg-ink hover:text-paper"
      >
        Filter
      </button>
    </form>
  )
}
