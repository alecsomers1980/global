"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

type ReorderItem = {
  slug: string;
  variantId: string;
  title: string;
  price: number;
  salePrice: number | null;
  image: string;
  size: string;
  qty: number;
};

export default function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleReorder = async () => {
    setLoading(true);
    setError(null);
    setSkipped([]);
    setSuccess(false);

    try {
      const res = await fetch(`/api/account/orders/${orderId}/reorder`, {
        method: "POST",
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to reorder");
      }

      const { items, skipped: unavailable } = (await res.json()) as {
        items: ReorderItem[];
        skipped: string[];
      };

      // Nothing could be re-added — say so rather than offering an empty checkout.
      if (items.length === 0) {
        setError("None of these items are available to reorder right now.");
        return;
      }

      items.forEach((item) => {
        add(
          {
            slug: item.slug,
            variantId: item.variantId,
            title: item.title,
            price: item.price,
            salePrice: item.salePrice,
            image: item.image,
            size: item.size,
          },
          item.qty
        );
      });

      if (unavailable && unavailable.length > 0) {
        // Some went in — let them read what didn't before moving on.
        setSkipped(unavailable);
        setSuccess(true);
      } else {
        router.push("/checkout");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleReorder}
        disabled={loading}
        className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
      >
        {loading ? "Adding…" : "Reorder"}
      </button>
      {skipped.length > 0 && success && (
        <div className="text-amber-deep text-sm space-y-1">
          <p>
            Some items are unavailable and weren&apos;t added: {skipped.join(", ")}
          </p>
          <Link href="/checkout" className="inline-block underline">
            Go to checkout
          </Link>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
