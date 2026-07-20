"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, cartTotal } from "@/store/cart";
import { formatZAR } from "@/lib/catalog";
import {
  calcShipping,
  amountToFreeDelivery,
  type DeliveryMethod,
} from "@/lib/shipping";
import { createClient } from "@/lib/supabase/client";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const wasCancelled = searchParams.get("cancelled");

  const items = useCartStore((s) => s.items);
  const subtotal = cartTotal(items);

  // Stable client so the prefill effect runs once.
  const [supabase] = useState(() => createClient());

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<DeliveryMethod>("delivery");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [collectionPoint, setCollectionPoint] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from the signed-in profile (guests just leave it blank).
  useEffect(() => {
    let abort = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || abort) return;
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (profileErr || !profile || abort) return;
      setFullName((p) => p || profile.full_name || "");
      setEmail((p) => p || profile.email || "");
      setPhone((p) => p || profile.phone || "");
    })();
    return () => {
      abort = true;
    };
  }, [supabase]);

  const shipping = calcShipping(subtotal, method);
  const total = subtotal + shipping;
  const toFree = amountToFreeDelivery(subtotal, method);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
          email,
          fullName,
          phone,
          deliveryMethod: method,
          deliveryAddress:
            method === "delivery"
              ? { line1, line2, city, province, postalCode }
              : null,
          collectionPoint,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // Hand off to PayFast via a self-submitting form. The basket is cleared
      // on the success page, so a cancelled payment keeps it intact.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.payfastUrl;
      Object.entries(data.payfastData as Record<string, string>).forEach(
        ([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        }
      );
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Network error. Please check your connection.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="text-3xl font-serif text-ink">Your basket is empty</h1>
        <Link
          href="/shop"
          className="inline-block rounded-full bg-forest text-white px-6 py-3 text-sm font-semibold hover:bg-moss transition-colors"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto px-6 py-12 grid gap-8 lg:grid-cols-[1fr_380px]"
    >
      {/* Left: details + delivery */}
      <div className="space-y-6">
        {wasCancelled && (
          <div className="bg-amber/10 border border-amber text-amber-deep rounded-xl p-4 text-sm">
            Payment cancelled — your basket is still here.
          </div>
        )}

        <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-xl text-ink">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-sm text-ink mb-1">
                Full name *
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-ink mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm text-ink mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
            />
          </div>
        </div>

        <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-xl text-ink">Delivery</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="deliveryMethod"
                value="delivery"
                checked={method === "delivery"}
                onChange={() => setMethod("delivery")}
                className="accent-forest"
              />
              Deliver to me
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="deliveryMethod"
                value="collection"
                checked={method === "collection"}
                onChange={() => setMethod("collection")}
                className="accent-forest"
              />
              Collect
            </label>
          </div>

          {method === "delivery" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="line1" className="block text-sm text-ink mb-1">
                  Address line 1 *
                </label>
                <input
                  id="line1"
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="line2" className="block text-sm text-ink mb-1">
                  Address line 2
                </label>
                <input
                  id="line2"
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm text-ink mb-1">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                />
              </div>
              <div>
                <label htmlFor="province" className="block text-sm text-ink mb-1">
                  Province
                </label>
                <input
                  id="province"
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm text-ink mb-1">
                  Postal code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                />
              </div>
            </div>
          )}

          {method === "collection" && (
            <div>
              <label
                htmlFor="collectionPoint"
                className="block text-sm text-ink mb-1"
              >
                Preferred collection point
              </label>
              <input
                id="collectionPoint"
                type="text"
                placeholder="e.g. White River"
                value={collectionPoint}
                onChange={(e) => setCollectionPoint(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right: order summary */}
      <div className="lg:sticky lg:top-24 self-start">
        <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif text-xl text-ink">Order summary</h2>
          <div className="divide-y divide-line">
            {items.map((item) => {
              const lineTotal = (item.salePrice ?? item.price) * item.qty;
              return (
                <div
                  key={item.variantId}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted">{item.size}</p>
                    <p className="text-xs text-muted">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap text-ink">
                    {formatZAR(lineTotal)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 pt-3 border-t border-line">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="text-ink">{formatZAR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Delivery</span>
              <span className={shipping === 0 ? "text-forest" : "text-ink"}>
                {shipping === 0 ? "Free" : formatZAR(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-line text-ink">
              <span>Total</span>
              <span>{formatZAR(total)}</span>
            </div>
            {toFree > 0 && (
              <p className="text-xs text-muted">
                Spend {formatZAR(toFree)} more for free delivery.
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-forest text-white px-5 py-3 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
          >
            {submitting ? "Redirecting…" : "Pay with PayFast"}
          </button>

          {process.env.NEXT_PUBLIC_PAYFAST_MODE !== "production" && (
            <p className="text-center text-xs text-forest">
              ✓ Sandbox mode — test payments only
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-6 py-12 text-center text-muted">
          Loading checkout…
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
