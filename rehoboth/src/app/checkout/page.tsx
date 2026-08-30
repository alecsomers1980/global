import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getShippingSettings } from "@/lib/shipping";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Rehoboth Herbal Co. order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;
  const settings = await getShippingSettings();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1100px] px-6 py-14 md:px-16">
        <h1 className="font-display text-4xl text-ink md:text-[52px]">Checkout</h1>

        {cancelled && (
          <p role="status" className="mt-6 border-l-2 border-brand bg-surface p-4 text-[15px] text-ink-soft">
            Your payment was cancelled and nothing has been charged. Your basket is
            as you left it.
          </p>
        )}

        <CheckoutForm settings={settings} />
      </main>
      <Footer />
    </>
  );
}
