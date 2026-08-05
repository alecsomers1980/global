'use client';

import Link from 'next/link';
import { useCartStore, cartSubtotalCents } from '@/lib/cart/store';
import { formatZAR } from '@/lib/money';
import { calculateDelivery } from '@/lib/delivery';

interface CartViewProps {
  deliverySettings: {
    freeThreshold: number;
    fee: number;
  };
}

export default function CartView({ deliverySettings }: CartViewProps) {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted">Your cart is empty.</p>
        <Link
          href="/range"
          className="underline text-text hover:text-muted"
        >
          Shop the range
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotalCents(items);
  const delivery = calculateDelivery(subtotal, deliverySettings);
  const total = subtotal + delivery;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Cart lines */}
      <ul className="lg:col-span-2 space-y-0">
        {items.map((item) => (
          <li
            key={item.variantId}
            className="flex items-start justify-between py-4 border-b border-muted/20 gap-4"
          >
            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${item.productSlug}`}
                className="font-medium hover:underline text-text"
              >
                {item.productName}
              </Link>
              <p className="text-muted text-sm">
                {item.colour}, size {item.size}
              </p>
              <p className="text-sm mt-1">{formatZAR(item.priceCents)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.variantId, item.qty - 1)}
                aria-label={`Decrease quantity of ${item.productName}, ${item.colour}, size ${item.size}`}
                className="w-6 h-6 rounded bg-surface text-text flex items-center justify-center hover:bg-accent hover:text-canvas transition-colors"
              >
                −
              </button>
              <span
                aria-live="polite"
                className="w-6 text-center text-sm"
              >
                {item.qty}
              </span>
              <button
                onClick={() => updateQty(item.variantId, item.qty + 1)}
                aria-label={`Increase quantity of ${item.productName}, ${item.colour}, size ${item.size}`}
                className="w-6 h-6 rounded bg-surface text-text flex items-center justify-center hover:bg-accent hover:text-canvas transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.variantId)}
              aria-label={`Remove ${item.productName}, ${item.colour}, size ${item.size} from cart`}
              className="text-sm text-muted hover:text-text underline shrink-0"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {/* Order summary */}
      <aside className="lg:col-span-1">
        <div className="bg-surface rounded-lg p-6">
          <h2 className="sr-only">Order summary</h2>

          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Subtotal</span>
            <span>{formatZAR(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Delivery</span>
            <span>{delivery === 0 ? 'Free' : formatZAR(delivery)}</span>
          </div>

          <hr className="border-muted/30 my-3" />

          <div className="flex justify-between font-semibold text-base mb-4">
            <span>Total</span>
            <span>{formatZAR(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="block w-full text-center py-3 rounded bg-accent text-canvas font-semibold hover:bg-accent-hi transition-colors"
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}