"use client";

import Link from "next/link";
import { useEffect } from "react";

export type CartToastItem = { name: string; sizeLabel: string };

/**
 * Auto-dismisses after 6s, but "View cart" / "Continue shopping" let the
 * customer resolve it immediately either way.
 */
export function CartToast({
  item,
  onClose,
}: {
  item: CartToastItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const t = window.setTimeout(onClose, 6000);
    return () => window.clearTimeout(t);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm flex-col gap-3 border border-hairline bg-ground p-5 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <p className="text-sm text-ink">
        <strong>Added to cart</strong> — {item.name}, {item.sizeLabel}
      </p>
      <div className="flex gap-3">
        <Link
          href="/cart"
          className="flex-1 bg-brand px-4 py-2 text-center text-xs uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep"
        >
          View cart
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-hairline px-4 py-2 text-xs uppercase tracking-[0.06em] text-ink hover:border-brand"
        >
          Continue shopping
        </button>
      </div>
    </div>
  );
}
