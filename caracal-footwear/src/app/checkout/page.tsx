'use client';

import { useState } from 'react';
import { useCartStore, cartSubtotalCents } from '@/lib/cart/store';
import { formatZAR } from '@/lib/money';
import PayFastRedirectForm from '@/components/checkout/PayFastRedirectForm';

export default function CheckoutPage() {
  const [formRenderedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<{
    url: string;
    data: Record<string, string>;
  } | null>(null);

  const { items } = useCartStore();
  const subtotal = cartSubtotalCents(items);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string | null,
      address1: formData.get('address1') as string,
      address2: formData.get('address2') as string | null,
      city: formData.get('city') as string,
      province: formData.get('province') as string,
      postalCode: formData.get('postalCode') as string,
      honeypot: formData.get('company') as string,
      formRenderedAt,
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'Could not process your order.' }));
        setError(json.error ?? 'Could not process your order.');
        setSubmitting(false);
        return;
      }

      const json = await res.json();
      setRedirect({ url: json.payfastUrl, data: json.payfastData });
    } catch {
      setError('Could not process your order. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (redirect) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16 text-center">
        <p className="text-lg font-medium">Redirecting you to PayFast to complete payment…</p>
        <PayFastRedirectForm action={redirect.url} data={redirect.data} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16 text-center">
        <p className="text-muted">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
      <h1 className="display rule-accent text-4xl sm:text-6xl mb-10">CHECKOUT</h1>

      <p className="text-sm text-muted mb-8">
        Subtotal: {formatZAR(subtotal)}. Delivery is calculated at PayFast based on the final total.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Honeypot */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="text-xs uppercase tracking-wide text-muted">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-xs uppercase tracking-wide text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="text-xs uppercase tracking-wide text-muted">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-xs uppercase tracking-wide text-muted">Address</label>
          <input
            id="address1"
            name="address1"
            type="text"
            required
            placeholder="Street address"
            className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
          />
          <input
            id="address2"
            name="address2"
            type="text"
            placeholder="Apartment, suite, etc. (optional)"
            className="mt-2 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
          />
        </div>

        {/* City, Province, Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label htmlFor="city" className="text-xs uppercase tracking-wide text-muted">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            />
          </div>
          <div>
            <label htmlFor="province" className="text-xs uppercase tracking-wide text-muted">
              Province
            </label>
            <select
              id="province"
              name="province"
              required
              defaultValue=""
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Eastern Cape">Eastern Cape</option>
              <option value="Free State">Free State</option>
              <option value="Gauteng">Gauteng</option>
              <option value="KwaZulu-Natal">KwaZulu-Natal</option>
              <option value="Limpopo">Limpopo</option>
              <option value="Mpumalanga">Mpumalanga</option>
              <option value="Northern Cape">Northern Cape</option>
              <option value="North West">North West</option>
              <option value="Western Cape">Western Cape</option>
            </select>
          </div>
          <div>
            <label htmlFor="postalCode" className="text-xs uppercase tracking-wide text-muted">
              Postal Code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              required
              className="mt-1 w-full bg-surface border border-text/20 rounded-md px-3 py-2 text-text"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-accent" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent text-canvas py-3 rounded-md text-sm uppercase tracking-[0.15em] hover:bg-accent-hi transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Processing…' : 'Continue to PayFast'}
        </button>
      </form>
    </div>
  );
}