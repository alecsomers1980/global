import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatZAR } from "@/lib/catalog";
import {
  ORDER_STATUS_LABELS,
  ACTIVE_STATUSES,
  DONE_STATUSES,
  statusBadgeClass,
} from "@/lib/orders";
import type { OrderStatus } from "@/lib/orders";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, delivery_method, created_at")
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-lg font-serif text-ink">My orders</h1>
        <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm text-center space-y-4">
          <p className="text-muted">You haven’t placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-block rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  const current = orders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status as OrderStatus)
  );
  const completed = orders.filter((o) =>
    DONE_STATUSES.includes(o.status as OrderStatus)
  );
  const cancelled = orders.filter((o) => o.status === "cancelled");

  const groups: { title: string; items: typeof orders }[] = [
    { title: "Current orders", items: current },
    { title: "Completed orders", items: completed },
    { title: "Cancelled", items: cancelled },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-serif text-ink">My orders</h1>
      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="text-lg font-serif text-ink mb-3">{group.title}</h2>
          <div className="space-y-3">
            {group.items.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block bg-paper border border-line rounded-2xl p-4 hover:border-forest transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-ink">{order.order_number}</p>
                    <p className="text-xs text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink">
                      {formatZAR(Number(order.total))}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(order.status as OrderStatus)}`}
                    >
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
