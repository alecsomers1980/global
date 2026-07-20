import Link from "next/link";

export type SelectFilter = {
  /** Query-param name. */
  name: string;
  /** Shown as the empty/"any" first option. */
  label: string;
  value?: string;
  options: { value: string; label: string }[];
};

/** Search + filter row for the admin list screens.
 *
 *  A plain GET form on purpose — no client JS. The browser puts the fields
 *  straight into the query string, which the server component reads back out
 *  of searchParams, so the URL stays shareable and the back button works. */
export default function FilterBar({
  action,
  q = "",
  placeholder = "Search…",
  selects = [],
  hidden = {},
  hasFilters = false,
}: {
  action: string;
  q?: string;
  placeholder?: string;
  selects?: SelectFilter[];
  /** Params to carry through the form (e.g. the active tab). */
  hidden?: Record<string, string>;
  hasFilters?: boolean;
}) {
  const field =
    "rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-forest";

  return (
    <form action={action} className="flex flex-wrap items-center gap-2 mb-6">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className={`${field} w-72`}
      />

      {selects.map((s) => (
        <select key={s.name} name={s.name} defaultValue={s.value ?? ""} className={field}>
          <option value="">{s.label}</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}

      <button
        type="submit"
        className="rounded-xl bg-forest text-paper px-4 py-2.5 text-sm hover:bg-moss transition-colors"
      >
        Apply
      </button>

      {hasFilters && (
        <Link
          href={action}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm hover:bg-surface-2 transition-colors"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
