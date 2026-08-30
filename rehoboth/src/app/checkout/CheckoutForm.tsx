"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, subtotalOf } from "@/lib/cart";
import { rands } from "@/lib/money";
import { shippingFor, amountToFreeDelivery, type ShippingSettings } from "@/lib/shipping";
import { BotGuard } from "@/components/form/BotGuard";
import { startCheckout } from "./actions";

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

export function CheckoutForm({ settings }: { settings: ShippingSettings }) {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [ready, setReady] = useState(false);
  const [collect, setCollect] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setReady(true), []);

  const subtotal = subtotalOf(items);
  const shipping = shippingFor(subtotal, collect, settings);
  const total = subtotal + shipping;
  const toFree = amountToFreeDelivery(subtotal, settings);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    form.set(
      "lines",
      JSON.stringify(items.map((i) => ({ variantId: i.variantId, qty: i.qty })))
    );

    const result = await startCheckout(form);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    // The order is recorded as pending; the basket has done its job. Clearing
    // now means the back button from PayFast cannot resubmit it.
    clear();
    postToPayFast(result.action, result.fields);
  }

  if (!ready) {
    return <p className="py-20 text-center text-ink-mute">Loading&hellip;</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 py-16">
        <p className="text-[17px] text-ink-soft">Your basket is empty.</p>
        <Link
          href="/shop"
          className="flex min-h-[52px] items-center bg-brand px-9 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep"
        >
          Shop the range
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative mt-10 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
      <BotGuard />

      <div className="flex flex-col gap-10">
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-2 font-display text-2xl text-ink">Your details</legend>
          <Field name="name" label="Full name" autoComplete="name" required />
          <Field name="email" label="Email address" type="email" autoComplete="email" required />
          <Field name="phone" label="Phone number" type="tel" autoComplete="tel" />
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 font-display text-2xl text-ink">Delivery</legend>

          <label className="flex cursor-pointer items-start gap-3 border border-hairline p-4 has-checked:border-brand has-checked:bg-surface">
            <input
              type="radio"
              name="delivery"
              value="deliver"
              checked={!collect}
              onChange={() => setCollect(false)}
              className="mt-1"
            />
            <span>
              <span className="block text-[15px] text-ink">Deliver to me</span>
              <span className="block text-[13px] text-ink-mute">
                {rands(settings.flat)} nationally, free over {rands(settings.free_over)}
              </span>
            </span>
          </label>

          {settings.collect_from_farm && (
            <label className="flex cursor-pointer items-start gap-3 border border-hairline p-4 has-checked:border-brand has-checked:bg-surface">
              <input
                type="radio"
                name="delivery"
                value="collect"
                checked={collect}
                onChange={() => setCollect(true)}
                className="mt-1"
              />
              <span>
                <span className="block text-[15px] text-ink">Collect from the farm</span>
                <span className="block text-[13px] text-ink-mute">
                  Low&rsquo;s Creek, Mpumalanga &middot; free
                </span>
              </span>
            </label>
          )}
        </fieldset>

        {!collect && (
          <fieldset className="flex flex-col gap-5">
            <legend className="mb-2 font-display text-2xl text-ink">Delivery address</legend>
            <Field name="line1" label="Street address" autoComplete="address-line1" required />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="city" label="Town or city" autoComplete="address-level2" required />
              <div className="flex flex-col gap-2">
                <label htmlFor="province" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
                  Province
                </label>
                <select
                  id="province"
                  name="province"
                  required
                  defaultValue=""
                  className="min-h-[48px] border border-hairline bg-white px-4 text-[15px] text-ink focus:border-brand focus:outline-none"
                >
                  <option value="" disabled>Select&hellip;</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <Field name="postcode" label="Postal code" autoComplete="postal-code" required />
          </fieldset>
        )}
      </div>

      <aside className="h-fit border border-hairline bg-surface p-7 lg:sticky lg:top-8">
        <h2 className="font-display text-2xl text-ink">Your order</h2>

        <ul className="mt-6 flex flex-col gap-4">
          {items.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-4 text-[15px]">
              <span className="text-ink">
                {line.name}
                <span className="block text-[13px] text-ink-mute">
                  {line.sizeLabel} &times; {line.qty}
                </span>
              </span>
              <span className="whitespace-nowrap text-ink">{rands(line.priceRetail * line.qty)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-7 flex flex-col gap-2 border-t border-hairline pt-5 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Subtotal</dt>
            <dd className="text-ink">{rands(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">{collect ? "Collection" : "Delivery"}</dt>
            <dd className="text-ink">{shipping === 0 ? "Free" : rands(shipping)}</dd>
          </div>
          <div className="mt-3 flex justify-between border-t border-hairline pt-4">
            <dt className="text-ink">Total</dt>
            <dd className="font-display text-2xl text-ink">{rands(total)}</dd>
          </div>
        </dl>

        {!collect && toFree > 0 && (
          <p className="mt-4 text-[13px] text-brand">
            Spend {rands(toFree)} more for free delivery.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-5 border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-7 flex min-h-[54px] w-full items-center justify-center bg-brand px-8 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep disabled:opacity-60"
        >
          {busy ? "Taking you to PayFast…" : `Pay ${rands(total)}`}
        </button>

        <p className="mt-4 text-center text-[13px] text-ink-mute">
          You will pay securely on PayFast. We never see your card details.
        </p>
      </aside>
    </form>
  );
}

function Field({
  name, label, type = "text", autoComplete, required,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
        {label}
        {!required && <span className="normal-case tracking-normal"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="min-h-[48px] border border-hairline bg-white px-4 text-[15px] text-ink focus:border-brand focus:outline-none"
      />
    </div>
  );
}

/**
 * PayFast takes a form POST, not a redirect — the signed fields have to travel
 * in a body. Build one, submit it, and let the browser leave the site.
 */
function postToPayFast(action: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  for (const [k, v] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = v;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
