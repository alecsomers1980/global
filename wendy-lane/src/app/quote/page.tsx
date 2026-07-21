import type { Metadata } from "next";
import QuoteBuilder from "@/components/QuoteBuilder";
import PageHeader from "@/components/PageHeader";
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
      <PageHeader
        eyebrow="Real prices, not estimates"
        title="Build your quote"
        intro={`These are our real prices, straight off the ${PRICE_LIST_DATE} price list. Choose your size and options and the total updates as you go — then send it straight to us.`}
      >
        <p className="text-sm text-white/60">
          Prefer to talk? Call{" "}
          <a href={BUSINESS.phone.href} className="font-medium text-white underline underline-offset-4">
            {BUSINESS.phone.display}
          </a>{" "}
          or WhatsApp{" "}
          <a
            href={BUSINESS.whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white underline underline-offset-4"
          >
            {BUSINESS.whatsapp.display}
          </a>
          .
        </p>
      </PageHeader>

      <QuoteBuilder />
    </main>
  );
}
