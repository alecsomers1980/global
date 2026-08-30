import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getOrder } from "@/lib/orders";
import { rands } from "@/lib/money";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The customer usually arrives here before PayFast's ITN does, so an order
 * still reading `pending` is the normal case and not a failure. The page says
 * so plainly rather than claiming a payment it cannot yet confirm.
 */
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrder(orderId) : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[720px] px-6 py-20 md:px-16">
        {!order ? (
          <>
            <h1 className="font-display text-4xl text-ink md:text-[52px]">Thank you</h1>
            <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
              We could not find that order to show you, but if your payment went
              through you will have a confirmation email shortly. Call us on 082 824
              9023 with any question.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-brand">
              Order {order.reference}
            </p>
            <h1 className="mt-4 font-display text-4xl text-ink md:text-[52px]">
              Thank you, {order.customer_name.split(/\s+/)[0]}.
            </h1>

            <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
              {order.status === "paid" || order.status === "fulfilled" ? (
                <>
                  Your payment has cleared and a confirmation is on its way to{" "}
                  {order.customer_email}. We pack by hand on the farm, so give us a
                  day or two before it goes out.
                </>
              ) : (
                <>
                  We have your order and are waiting for PayFast to confirm the
                  payment — that usually takes a moment. You will get an email at{" "}
                  {order.customer_email} as soon as it clears.
                </>
              )}
            </p>

            <ul className="mt-10 flex flex-col gap-4 border-t border-hairline pt-6">
              {order.order_items.map((i, n) => (
                <li key={n} className="flex justify-between gap-4 text-[15px]">
                  <span className="text-ink">
                    {i.product_name}
                    <span className="block text-[13px] text-ink-mute">
                      {i.size_label} &times; {i.qty}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-ink">
                    {rands(i.unit_price * i.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 flex flex-col gap-2 border-t border-hairline pt-5 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="text-ink">{rands(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">
                  {order.collect_from_farm ? "Collection" : "Delivery"}
                </dt>
                <dd className="text-ink">
                  {Number(order.shipping) === 0 ? "Free" : rands(order.shipping)}
                </dd>
              </div>
              <div className="mt-3 flex justify-between border-t border-hairline pt-4">
                <dt className="text-ink">Total</dt>
                <dd className="font-display text-2xl text-ink">{rands(order.total)}</dd>
              </div>
            </dl>

            {order.collect_from_farm && (
              <p className="mt-8 border-l-2 border-brand bg-surface p-4 text-[15px] text-ink-soft">
                You chose to collect. We will call you on the number you gave us to
                arrange a time at Rehoboth Farm, Low&rsquo;s Creek.
              </p>
            )}
          </>
        )}

        <Link
          href="/shop"
          className="mt-12 flex min-h-[52px] w-fit items-center bg-brand px-9 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep"
        >
          Back to the shop
        </Link>
      </main>
      <Footer />
    </>
  );
}
