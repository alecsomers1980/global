"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, subtotalOf } from "@/lib/cart";
import { rands } from "@/lib/money";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  // The cart is restored from localStorage on the client, so the first render
  // must match the server's empty state or React complains about a mismatch.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const subtotal = subtotalOf(items);

  return (
    <>
      <Header />
      <PageBanner eyebrow="Your basket" title="Your cart" />
      <main className="mx-auto max-w-[1000px] px-6 py-14 md:px-16">

        {!ready ? (
          <p className="mt-10 text-ink-mute">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-10 flex flex-col items-start gap-6">
            <p className="text-[17px] text-ink-soft">Your cart is empty.</p>
            <Link
              href="/shop"
              className="flex min-h-[52px] items-center bg-brand px-9 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep"
            >
              Shop the range
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 flex flex-col">
              {items.map((line) => (
                <li
                  key={line.variantId}
                  className="flex flex-wrap items-center justify-between gap-5 border-b border-hairline py-6"
                >
                  <div className="flex min-w-[200px] flex-col gap-1">
                    <Link
                      href={`/product/${line.productSlug}`}
                      className="font-display text-xl text-ink hover:text-brand"
                    >
                      {line.name}
                    </Link>
                    <span className="text-[13px] text-ink-mute">{line.sizeLabel}</span>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="flex items-center border border-hairline">
                      <button
                        type="button"
                        onClick={() => setQty(line.variantId, line.qty - 1)}
                        aria-label={`Decrease quantity of ${line.name}`}
                        className="h-11 w-11 text-lg text-ink hover:bg-surface"
                      >
                        &minus;
                      </button>
                      <span className="w-10 text-center text-sm" aria-live="polite">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(line.variantId, line.qty + 1)}
                        aria-label={`Increase quantity of ${line.name}`}
                        className="h-11 w-11 text-lg text-ink hover:bg-surface"
                      >
                        +
                      </button>
                    </div>

                    <span className="w-24 text-right text-[15px] text-ink">
                      {rands(line.priceRetail * line.qty)}
                    </span>

                    <button
                      type="button"
                      onClick={() => remove(line.variantId)}
                      aria-label={`Remove ${line.name} from cart`}
                      className="h-11 px-2 text-[13px] text-ink-mute hover:text-brand"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-end gap-6">
              <div className="flex w-full max-w-xs items-baseline justify-between">
                <span className="text-[15px] text-ink-soft">Subtotal</span>
                <span className="font-display text-3xl text-ink">{rands(subtotal)}</span>
              </div>
              <p className="text-[13px] text-ink-mute">Delivery calculated at checkout.</p>
              <Link
                href="/checkout"
                className="flex min-h-[54px] items-center bg-brand px-10 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
