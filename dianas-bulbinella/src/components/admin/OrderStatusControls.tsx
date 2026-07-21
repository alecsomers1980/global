"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isPaid, type OrderStatus } from "@/lib/orders";

export default function OrderStatusControls({
  orderId,
  status,
  deliveryMethod,
}: {
  orderId: string;
  status: OrderStatus;
  deliveryMethod: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(next: OrderStatus) {
    setSaving(true);
    setError(null);
    try {
      // Goes through the API (not straight to Supabase) so the server can send
      // the shipped/collected email alongside the update.
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to update status");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  // Payment is set by the PayFast ITN, never by hand.
  if (!isPaid(status)) {
    return (
      <div className="bg-white border border-line rounded-2xl p-6">
        <h2 className="text-base font-medium text-ink mb-4">Update status</h2>
        <p className="text-sm text-muted">
          Waiting for payment — PayFast will confirm this automatically.
        </p>
      </div>
    );
  }

  if (status === "shipped" || status === "collected") {
    return (
      <div className="bg-white border border-line rounded-2xl p-6">
        <h2 className="text-base font-medium text-ink mb-4">Update status</h2>
        <p className="text-sm text-muted">This order is fulfilled.</p>
      </div>
    );
  }

  const btn =
    "rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50";

  return (
    <div className="bg-white border border-line rounded-2xl p-6">
      <h2 className="text-base font-medium text-ink mb-4">Update status</h2>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {status === "paid" && (
          <button
            onClick={() => update("completed")}
            disabled={saving}
            className={btn}
          >
            {saving ? "Saving…" : "Mark as completed"}
          </button>
        )}
        {deliveryMethod === "delivery" ? (
          <button
            onClick={() => update("shipped")}
            disabled={saving}
            className={btn}
          >
            {saving ? "Saving…" : "Mark as shipped"}
          </button>
        ) : (
          <button
            onClick={() => update("collected")}
            disabled={saving}
            className={btn}
          >
            {saving ? "Saving…" : "Mark as collected"}
          </button>
        )}
      </div>
      <p className="text-xs text-muted mt-3">
        Marking this order{" "}
        {deliveryMethod === "delivery" ? "shipped" : "collected"} emails the
        customer.
      </p>
    </div>
  );
}
