import Link from "next/link";
import {
  searchCustomers,
  type CustomerFilter,
  type CustomerSort,
} from "@/lib/customers";
import { formatZAR } from "@/lib/catalog";
import FilterBar from "@/components/admin/FilterBar";
import Pager from "@/components/admin/Pager";

export const dynamic = "force-dynamic";

const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const filter = (params.filter ?? "") as CustomerFilter | "";
  const sort = (params.sort ?? "") as CustomerSort | "";
  const page = Number(params.page) || 1;

  const { customers, total, page: current, pageCount } = await searchCustomers({
    q,
    filter: filter || "all",
    sort: sort || "recent",
    page,
  });

  const hasFilters = Boolean(q || filter || sort);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Customers</h1>
        <span className="text-sm text-muted">
          {hasFilters
            ? `${total} matching`
            : `${total} ${total === 1 ? "customer" : "customers"}`}
        </span>
      </div>

      <FilterBar
        action="/admin/customers"
        q={q}
        placeholder="Search name, email or phone…"
        hasFilters={hasFilters}
        selects={[
          {
            name: "filter",
            label: "All customers",
            value: filter,
            options: [
              { value: "buyers", label: "Has ordered" },
              { value: "no-orders", label: "Never ordered" },
              { value: "month", label: "Bought this month" },
            ],
          },
          {
            name: "sort",
            label: "Sort: Recent order",
            value: sort,
            options: [
              { value: "spend", label: "Sort: Total spent" },
              { value: "orders", label: "Sort: Most orders" },
              { value: "name", label: "Sort: Name A–Z" },
            ],
          },
        ]}
      />

      {customers.length === 0 ? (
        <p className="text-sm text-muted bg-white border border-line rounded-xl p-4">
          No customers match.
        </p>
      ) : (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-2 text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2 font-medium">Orders</th>
                <th className="px-4 py-2 font-medium">Last order</th>
                <th className="px-4 py-2 font-medium">Total spent</th>
                <th className="px-4 py-2 font-medium">This month</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-surface">
                  <td className="px-4 py-3">
                    <div className="text-ink font-medium">
                      {customer.fullName || "—"}
                    </div>
                    <div className="text-xs text-muted">{customer.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {customer.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-muted">
                    {shortDate(customer.lastOrderAt)}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {formatZAR(customer.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {formatZAR(customer.monthSpent)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {shortDate(customer.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-sm text-forest hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager
        action="/admin/customers"
        page={current}
        pageCount={pageCount}
        params={{ q, filter, sort }}
      />
    </div>
  );
}
