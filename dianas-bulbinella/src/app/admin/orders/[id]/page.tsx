import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatZAR } from "@/lib/catalog";
import {
  ORDER_STATUS_LABELS,
  statusBadgeClass,
  type OrderStatus,
} from "@/lib/orders";
import OrderStatusControls from "@/components/admin/OrderStatusControls";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("product_title, size, image, unit_price, qty, line_total")
    .eq("order_id", id);

  const addr = order.delivery_address as {
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  } | null;

  const status = order.status as OrderStatus;

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Order {order.order_number}
          </h1>
          <p className="text-sm text-muted">
            {new Date(order.created_at).toLocaleDateString("en-ZA")}
          </p>
        </div>
        <Link href="/admin/orders" className="text-sm text-forest hover:underline">
          Back to orders
        </Link>
      </div>

      {/* Items */}
      <section className="bg-white border border-line rounded-2xl p-6 mb-6">
        <h2 className="text-base font-medium text-ink mb-4">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-2 text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 font-medium text-right">Qty</th>
                <th className="px-4 py-2 font-medium text-right">Unit</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3">
                    <div className="text-ink">{item.product_title}</div>
                    {item.size && (
                      <div className="text-xs text-muted">{item.size}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-ink">{item.qty}</td>
                  <td className="px-4 py-3 text-right text-muted">
                    {formatZAR(Number(item.unit_price))}
                  </td>
                  <td className="px-4 py-3 text-right text-ink">
                    {formatZAR(Number(item.line_total))}
                  </td>
                </tr>
              ))}
              {!items?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-muted text-center">
                    No items
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="text-ink">
              <tr className="border-t border-line">
                <td colSpan={3} className="px-4 py-2 text-right text-muted">
                  Subtotal
                </td>
                <td className="px-4 py-2 text-right">
                  {formatZAR(Number(order.subtotal))}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right text-muted">
                  Delivery
                </td>
                <td className="px-4 py-2 text-right">
                  {Number(order.shipping) === 0
                    ? "Free"
                    : formatZAR(Number(order.shipping))}
                </td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={3} className="px-4 py-2 text-right">
                  Total
                </td>
                <td className="px-4 py-2 text-right">
                  {formatZAR(Number(order.total))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Customer */}
      <section className="bg-white border border-line rounded-2xl p-6 mb-6">
        <h2 className="text-base font-medium text-ink mb-4">Customer</h2>
        <div className="space-y-1 text-sm text-ink">
          <p>
            <span className="text-muted mr-2">Name:</span>
            {order.full_name || "—"}
          </p>
          <p>
            <span className="text-muted mr-2">Email:</span>
            {order.email}
          </p>
          <p>
            <span className="text-muted mr-2">Phone:</span>
            {order.phone || "—"}
          </p>
          {order.user_id === null && (
            <p className="text-muted italic pt-1">Guest order</p>
          )}
        </div>
      </section>

      {/* Delivery */}
      <section className="bg-white border border-line rounded-2xl p-6 mb-6">
        <h2 className="text-base font-medium text-ink mb-4">Delivery</h2>
        {order.delivery_method === "collection" ? (
          <div className="text-sm text-ink">
            <p className="font-medium">Collection</p>
            <p className="text-muted">{order.collection_point || "—"}</p>
          </div>
        ) : addr ? (
          <div className="text-sm text-ink space-y-1">
            {[addr.line1, addr.line2, addr.city, addr.province, addr.postalCode]
              .filter(Boolean)
              .map((line, i) => (
                <p key={i}>{line}</p>
              ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No address provided</p>
        )}
      </section>

      {/* Payment */}
      <section className="bg-white border border-line rounded-2xl p-6 mb-6">
        <h2 className="text-base font-medium text-ink mb-4">Payment</h2>
        <div className="text-sm space-y-2 text-ink">
          <div>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(
                status
              )}`}
            >
              {ORDER_STATUS_LABELS[status]}
            </span>
          </div>
          {order.paid_at && (
            <p className="text-muted">
              Paid: {new Date(order.paid_at).toLocaleString("en-ZA")}
            </p>
          )}
          {order.payment_id && (
            <p className="font-mono text-xs text-muted break-all">
              PayFast ID: {order.payment_id}
            </p>
          )}
        </div>
      </section>

      <OrderStatusControls
        orderId={order.id}
        status={status}
        deliveryMethod={order.delivery_method}
      />
    </div>
  );
}
