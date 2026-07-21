import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/customers";
import { formatZAR } from "@/lib/catalog";
import {
  ORDER_STATUS_LABELS,
  statusBadgeClass,
  type OrderStatus,
} from "@/lib/orders";
import CustomerControls from "@/components/admin/CustomerControls";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomerDetail(id);
  if (!data) notFound();

  const { profile, orders, monthly, totalSpent, paidOrderCount } = data;

  return (
    <div>
      <Link
        href="/admin/customers"
        className="text-sm text-forest hover:underline"
      >
        ← Back to customers
      </Link>

      <h1 className="text-2xl font-semibold text-ink mt-2 mb-6">
        {profile.fullName || profile.email}
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-white border border-line rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-line">
              <h2 className="text-sm font-medium text-ink">Orders</h2>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-muted px-4 py-6">
                This customer hasn&apos;t placed an order yet.
              </p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-2 text-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">Order</th>
                    <th className="px-4 py-2 font-medium">Method</th>
                    <th className="px-4 py-2 font-medium">Total</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((order) => {
                    const status = order.status as OrderStatus;
                    return (
                      <tr key={order.id} className="hover:bg-surface">
                        <td className="px-4 py-3">
                          <div className="text-ink font-medium">
                            {order.order_number}
                          </div>
                          <div className="text-xs text-muted">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-ZA"
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted capitalize">
                          {order.delivery_method}
                        </td>
                        <td className="px-4 py-3 text-ink">
                          {formatZAR(Number(order.total))}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(
                              status
                            )}`}
                          >
                            {ORDER_STATUS_LABELS[status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-sm text-forest hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white border border-line rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-line">
              <h2 className="text-sm font-medium text-ink">Monthly spend</h2>
            </div>
            {monthly.length === 0 ? (
              <p className="text-sm text-muted px-4 py-6">
                Nothing to show — no paid orders yet.
              </p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-2 text-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">Month</th>
                    <th className="px-4 py-2 font-medium">Orders</th>
                    <th className="px-4 py-2 font-medium">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {monthly.map((m) => (
                    <tr key={m.month}>
                      <td className="px-4 py-3 text-ink">{m.label}</td>
                      <td className="px-4 py-3 text-muted">{m.orders}</td>
                      <td className="px-4 py-3 text-ink">
                        {formatZAR(m.spent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-line rounded-2xl p-4">
            <h2 className="text-sm font-medium text-ink mb-3">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="text-ink break-words">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="text-ink">{profile.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Joined</dt>
                <dd className="text-ink">
                  {new Date(profile.createdAt).toLocaleDateString("en-ZA")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Marketing opt-in</dt>
                <dd className="text-ink">
                  {profile.marketingOptIn ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Total spent</dt>
                <dd className="text-ink">{formatZAR(totalSpent)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Paid orders</dt>
                <dd className="text-ink">{paidOrderCount}</dd>
              </div>
            </dl>
          </div>

          <CustomerControls
            customerId={profile.id}
            fullName={profile.fullName}
            phone={profile.phone}
            email={profile.email}
          />
        </div>
      </div>
    </div>
  );
}
