import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatZAR } from "@/lib/catalog";
import {
  ORDER_STATUS_LABELS,
  statusBadgeClass,
  isPaid,
} from "@/lib/orders";
import type { OrderStatus } from "@/lib/orders";
import ReorderButton from "@/components/account/ReorderButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, total, subtotal, shipping, status, delivery_method, created_at, paid_at"
    )
    .eq("id", id)
    .single();

  if (!order) return notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("product_title, size, image, unit_price, qty, line_total")
    .eq("order_id", id);

  return (
    <div className="space-y-8">
      <Link
        href="/account/orders"
        className="text-sm text-muted hover:text-ink"
      >
        ← Back to orders
      </Link>

      <div>
        <h1 className="text-lg font-serif text-ink">
          Order {order.order_number}
        </h1>
        <p className="text-xs text-muted mt-1">
          {new Date(order.created_at).toLocaleDateString("en-ZA")}
        </p>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mt-2 ${statusBadgeClass(order.status as OrderStatus)}`}
        >
          {ORDER_STATUS_LABELS[order.status as OrderStatus]}
        </span>
      </div>

      <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm space-y-4">
        {items?.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 border-b border-line pb-4 last:border-0 last:pb-0"
          >
            {item.image && (
              <Image
                src={item.image}
                alt={item.product_title}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {item.product_title}
              </p>
              {item.size && (
                <p className="text-xs text-muted">{item.size}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Qty: {item.qty} × {formatZAR(Number(item.unit_price))}
              </p>
            </div>
            <p className="text-sm font-medium text-ink whitespace-nowrap">
              {formatZAR(Number(item.line_total))}
            </p>
          </div>
        ))}

        <div className="border-t border-line pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="text-ink">
              {formatZAR(Number(order.subtotal))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Delivery</span>
            <span className="text-ink">
              {Number(order.shipping) === 0
                ? "Free"
                : formatZAR(Number(order.shipping))}
            </span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-ink">Total</span>
            <span className="text-ink">
              {formatZAR(Number(order.total))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ReorderButton orderId={id} />
        {isPaid(order.status as OrderStatus) && (
          <a
            href={`/api/account/orders/${id}/invoice`}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
          >
            Download invoice
          </a>
        )}
      </div>
    </div>
  );
}
