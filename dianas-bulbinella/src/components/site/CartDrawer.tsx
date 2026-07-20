"use client";
import { useCartStore, cartTotal } from "@/store/cart";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { formatZAR } from "@/lib/catalog";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/shipping";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const open = useCartStore((s) => s.open);
  const setOpen = useCartStore((s) => s.setOpen);
  const remove = useCartStore((s) => s.remove);
  const setQty = useCartStore((s) => s.setQty);

  const total = cartTotal(items);
  const isEmpty = items.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 h-dvh w-full max-w-md bg-surface z-50 shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <h2 className="text-xl text-ink font-[family-name:var(--font-fraunces)]">
                Your basket
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-muted hover:text-ink transition-colors rounded-full"
                aria-label="Close basket"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <p className="text-muted text-lg">
                    Your basket is empty.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-forest px-6 py-3 text-paper text-sm font-medium hover:bg-moss transition-colors inline-flex"
                  >
                    Browse the shop
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => {
                    const unitPrice = item.salePrice ?? item.price;
                    const linePrice = unitPrice * item.qty;
                    return (
                      <li key={item.variantId} className="flex gap-4">
                        <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-paper shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ink font-medium leading-tight line-clamp-2">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {item.size}
                          </p>
                          <div className="flex items-center justify-between mt-2 gap-2">
                            <div className="flex items-center border border-line rounded-full overflow-hidden">
                              <button
                                onClick={() =>
                                  setQty(item.variantId, item.qty - 1)
                                }
                                className="w-8 h-8 flex items-center justify-center text-ink hover:bg-paper transition-colors"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm tabular-nums text-ink">
                                {item.qty}
                              </span>
                              <button
                                onClick={() =>
                                  setQty(item.variantId, item.qty + 1)
                                }
                                className="w-8 h-8 flex items-center justify-center text-ink hover:bg-paper transition-colors"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => remove(item.variantId)}
                              className="text-xs text-muted underline hover:text-amber transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-ink tabular-nums">
                            {formatZAR(linePrice)}
                          </p>
                          {item.salePrice && item.salePrice < item.price && (
                            <p className="text-xs text-amber line-through tabular-nums">
                              {formatZAR(item.price * item.qty)}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div className="border-t border-line px-6 py-5 space-y-4 bg-surface-2/30">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-lg font-medium text-ink tabular-nums">
                    {formatZAR(total)}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Delivery calculated at checkout — free over {formatZAR(FREE_DELIVERY_THRESHOLD)}.
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-full bg-forest px-6 py-3 text-paper text-sm font-medium hover:bg-moss transition-colors flex items-center justify-center"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
