import { getAllDealers, matchesDealer, PROVINCES, COUNTRIES } from "@/lib/dealers";
import FilterBar from "@/components/admin/FilterBar";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; province?: string; country?: string };

export default async function AdminDealersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q = "", province = "", country = "" } = await searchParams;
  const dealers = await getAllDealers();

  const filtered = dealers.filter((d) => {
    if (country && d.country !== country) return false;
    if (province && d.province !== province) return false;
    if (q && !matchesDealer(d, q)) return false;
    return true;
  });

  const count = filtered.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Dealers</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{count} dealer{count !== 1 ? 's' : ''}</span>
          <Link
            href="/admin/dealers/new"
            className="rounded-xl bg-forest text-paper px-4 py-2.5 text-sm hover:bg-moss transition-colors"
          >
            Add dealer
          </Link>
          <Link
            href="/admin/dealers/applications"
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm hover:bg-surface-2 transition-colors"
          >
            Applications
          </Link>
        </div>
      </div>

      <FilterBar
        action="/admin/dealers"
        q={q}
        placeholder="Search name, town, province or country…"
        hasFilters={Boolean(q || province || country)}
        selects={[
          {
            name: "country",
            label: "All countries",
            value: country,
            options: COUNTRIES.map((c) => ({ value: c, label: c })),
          },
          {
            name: "province",
            label: "All provinces",
            value: province,
            // FilterBar renders the empty "All provinces" option itself.
            options: PROVINCES.map((p) => ({ value: p, label: p })),
          },
        ]}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">No dealers match.</div>
      ) : (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left p-4 text-xs font-medium text-muted uppercase">Dealer</th>
                <th className="text-left p-4 text-xs font-medium text-muted uppercase">Areas</th>
                <th className="text-left p-4 text-xs font-medium text-muted uppercase">Country / Province</th>
                <th className="text-left p-4 text-xs font-medium text-muted uppercase">Contact</th>
                <th className="text-left p-4 text-xs font-medium text-muted uppercase">Active</th>
                <th className="text-right p-4 text-xs font-medium text-muted uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-surface-2">
                  <td className="p-4">
                    <div className="font-medium text-ink">{d.name}</div>
                    {d.business && (
                      <div className="text-xs text-muted">{d.business}</div>
                    )}
                    {d.isDepot && (
                      <span className="inline-block mt-1 rounded-full bg-amber-soft text-amber-deep px-2 py-0.5 text-xs font-medium">
                        Depot
                      </span>
                    )}
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="text-sm text-muted">{d.areas.join(", ")}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-ink">
                      {d.province || d.country}
                    </div>
                    <div className="text-xs text-muted">
                      {d.province ? d.country : d.region}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{d.phone}</div>
                    {d.email && (
                      <div className="text-xs text-muted">{d.email}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={d.active ? "text-forest" : "text-muted"}>
                      {d.active ? "Yes" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/dealers/${d.id}`}
                      className="text-sm text-forest hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
