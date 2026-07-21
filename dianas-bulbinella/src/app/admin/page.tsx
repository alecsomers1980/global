import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type SpecialRow = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: productCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  const { data: specials } = await supabase
    .from("specials")
    .select("id, name, starts_on, ends_on")
    .order("starts_on", { ascending: true });

  const today = new Date();
  const activeSpecials =
    specials?.filter((s: SpecialRow) => {
      const start = new Date(s.starts_on);
      const end = new Date(s.ends_on);
      return start <= today && end >= today;
    }) ?? [];

  const upcomingSpecials =
    specials?.filter((s: SpecialRow) => {
      const start = new Date(s.starts_on);
      return start > today;
    }) ?? [];

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-line rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Products</p>
          <p className="text-3xl font-semibold text-ink">
            {productCount ?? 0}
          </p>
        </div>
        <div className="bg-white border border-line rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Active specials</p>
          <p className="text-3xl font-semibold text-ink">
            {activeSpecials.length}
          </p>
        </div>
        <div className="bg-white border border-line rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Upcoming specials</p>
          <p className="text-3xl font-semibold text-ink">
            {upcomingSpecials.length}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium text-ink mb-3">Quick actions</h2>
        <div className="flex gap-3 items-center">
          <Link
            href="/admin/specials/new"
            className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors"
          >
            Schedule a special
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
          >
            Manage products
          </Link>
        </div>
      </div>

      {upcomingSpecials.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-ink mb-3">
            Upcoming specials
          </h2>
          <div className="bg-white border border-line rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Dates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {upcomingSpecials.map((s: SpecialRow) => (
                  <tr key={s.id} className="hover:bg-surface">
                    <td className="px-4 py-3 text-ink">{s.name}</td>
                    <td className="px-4 py-3 text-ink">
                      {formatDate(s.starts_on)} – {formatDate(s.ends_on)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {upcomingSpecials.length === 0 && (
        <p className="text-sm text-muted">No upcoming specials.</p>
      )}
    </div>
  );
}
