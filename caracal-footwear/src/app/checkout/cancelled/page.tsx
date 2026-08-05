import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Payment Cancelled' };

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
      <h1 className="display text-3xl text-text">PAYMENT CANCELLED</h1>
      <p className="text-text">Your payment was cancelled. Your cart is still saved.</p>
      <Link href="/cart" className="inline-block text-sm text-text underline underline-offset-4">
        Back to cart
      </Link>
    </div>
  );
}
