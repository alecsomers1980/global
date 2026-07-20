import Link from "next/link";

/** Prev/Next pager for the admin lists. Carries the current search + filters
 *  through to the next page — blank values are dropped so the URL stays tidy. */
export default function Pager({
  action,
  page,
  pageCount,
  params = {},
}: {
  action: string;
  page: number;
  pageCount: number;
  params?: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) search.set(k, v);
    }
    search.set("page", String(target));
    return `${action}?${search.toString()}`;
  };

  const active =
    "rounded-xl border border-line bg-white px-4 py-2.5 text-sm hover:bg-surface-2 transition-colors";
  const disabled =
    "rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-muted opacity-50";

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      {page > 1 ? (
        <Link href={href(page - 1)} className={active}>
          Previous
        </Link>
      ) : (
        <span className={disabled}>Previous</span>
      )}

      <span className="text-sm text-muted">
        Page {page} of {pageCount}
      </span>

      {page < pageCount ? (
        <Link href={href(page + 1)} className={active}>
          Next
        </Link>
      ) : (
        <span className={disabled}>Next</span>
      )}
    </div>
  );
}
