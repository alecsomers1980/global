import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatZAR } from "@/lib/catalog";
import ClearCart from "@/components/checkout/ClearCart";

type OrderRow = {
  id: string;
  order_number: string;
  total: number;
  status: string;
  email: string;
  user_id: string | null;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-6">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-3xl font-serif text-ink">Thank you</h1>
          <p className="text-muted mt-2">Your order has been placed.</p>
          <Link
            href="/shop"
            className="inline-block mt-6 rounded-full bg-forest text-white px-5 py-3 text-sm font-semibold hover:bg-moss transition-colors"
          >
            Continue shopping
          </Link>
        </div>
        <ClearCart />
      </div>
    );
  }

  // The buyer may be a guest with no session, so read via the service-role
  // client. The order id is an unguessable uuid.
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, total, status, email, user_id")
    .eq("id", orderId)
    .maybeSingle<OrderRow>();

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-6">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-serif text-ink">
            We couldn&apos;t find that order
          </h1>
          <Link
            href="/shop"
            className="inline-block mt-6 rounded-full bg-forest text-white px-5 py-3 text-sm font-semibold hover:bg-moss transition-colors"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";

  let statusCard;
  if (order.status === "paid") {
    statusCard = (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-2xl font-serif text-ink">
          Thank you — payment received
        </h1>
        <p className="text-muted mt-1">
          Order #{order.order_number} · {formatZAR(Number(order.total))}
        </p>
        <p className="mt-2 text-sm text-ink/80">
          We&apos;ve got your order and will be in touch.
        </p>
      </div>
    );
  } else if (isCancelled) {
    statusCard = (
      <div className="bg-amber/10 border border-amber rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-2xl font-serif text-ink">
          Payment was not completed
        </h1>
        <p className="text-muted mt-1">Order #{order.order_number}</p>
        <Link
          href="/checkout"
          className="inline-block mt-6 rounded-full bg-forest text-white px-5 py-3 text-sm font-semibold hover:bg-moss transition-colors"
        >
          Try again
        </Link>
      </div>
    );
  } else {
    statusCard = (
      <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-2xl font-serif text-ink">
          Thank you — we&apos;re confirming your payment
        </h1>
        <p className="text-muted mt-1">Order #{order.order_number}</p>
        <p className="mt-2 text-sm text-muted">
          This usually takes a few seconds. We&apos;ll email you as soon as it&apos;s
          confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-6">
      {statusCard}

      {!order.user_id && !isCancelled && (
        <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm text-center space-y-3">
          <p className="text-sm text-muted">
            Want to track this order and reorder later?
          </p>
          <Link
            href={`/signup?email=${encodeURIComponent(order.email)}`}
            className="inline-block rounded-full bg-forest text-white px-5 py-3 text-sm font-semibold hover:bg-moss transition-colors"
          >
            Create an account
          </Link>
        </div>
      )}

      {/* Keep the basket if payment failed so "Try again" still has the items. */}
      {!isCancelled && <ClearCart />}
    </div>
  );
}
