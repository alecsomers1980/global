import type { Metadata } from "next";
import QuoteBuilder from "@/components/QuoteBuilder";
import { PRICE_LIST_DATE } from "@/data/pricing";
import { BUSINESS } from "@/data/business";

export const metadata: Metadata = {
  title: "Wendy House Price Calculator & Instant Quote | Wendy Lane Nelspruit",
  description:
    "Build your Wendy house quote online. Real prices from our own price list — choose your size, window, veranda and extras, and send it straight to us on WhatsApp.",
};

export default function QuotePage() {
  return (
    <main className="bg-cream min-h-screen">
      <section className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
            Build your quote
          </h1>
          <p className="mt-4 max-w-2xl text-white/90 text-lg">
            These are our real prices, straight off the {PRICE_LIST_DATE} price list — not
            estimates. Choose your size and options, and the total updates as you go. Send it
            to us on WhatsApp and we&apos;ll come back to you with delivery for your area.
          </p>
          <p className="mt-4 text-white/70 text-sm">
            Prefer to talk? Call{" "}
            <a href={BUSINESS.phone.href} className="underline font-medium">
              {BUSINESS.phone.display}
            </a>{" "}
            or WhatsApp{" "}
            <a href={BUSINESS.whatsapp.href} className="underline font-medium">
              {BUSINESS.whatsapp.display}
            </a>
            .
          </p>
        </div>
      </section>

      <QuoteBuilder />
    </main>
  );
}
