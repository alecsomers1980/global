import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms on which Rehoboth Herbal Co. sells its products online, including pricing, delivery and cancellation.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms &amp; Conditions" updated="30 August 2026">
      <section>
        <p>
          These terms apply to every order placed through this website. Placing an
          order means you accept them.
        </p>
      </section>

      <section>
        <h2>Who you are buying from</h2>
        <p>
          Rehoboth Herbal Co., Portion 21 of Farm 277JU Lovedale, Honeybird,
          Low&rsquo;s Creek, Mpumalanga. Registration number [REG NUMBER]. VAT number
          [VAT NUMBER, or remove if not registered]. Contact: Frieda Grobler, 082 824
          9023, friedsgrobler@gmail.com.
        </p>
      </section>

      <section>
        <h2>What we sell</h2>
        <p>
          We sell traditional herbal products, cosmetics and soaps. They are{" "}
          <strong className="font-medium text-ink">not medicines</strong>, are not
          registered with SAHPRA, and are not intended to diagnose, treat, cure or
          prevent any disease. Nothing on this site is medical advice. Speak to a
          healthcare practitioner before use, particularly if you are pregnant,
          nursing, or taking medication.
        </p>
      </section>

      <section>
        <h2>Prices and payment</h2>
        <ul>
          <li>Prices are in South African rand and include VAT where applicable.</li>
          <li>Payment is taken by PayFast. We never see or store your card details.</li>
          <li>
            Your order is only confirmed once PayFast tells us the payment succeeded.
            Until then it is held as pending.
          </li>
          <li>
            If a price is obviously wrong, we may cancel the order and refund you in
            full rather than fulfil it.
          </li>
        </ul>
      </section>

      <section>
        <h2>Delivery</h2>
        <p>
          We deliver within South Africa. Delivery charges are shown at checkout
          before you pay. Delivery times are estimates, not guarantees; we are not
          liable for a courier&rsquo;s delay.
        </p>
        <p>
          Risk in the goods passes to you on delivery. Please check your order on
          arrival and tell us within seven days if anything is damaged or missing.
        </p>
      </section>

      <section>
        <h2>Stock</h2>
        <p>
          Everything is grown and packed in batches, so a product can sell out. If we
          cannot fulfil part of your order we will contact you and refund that part.
        </p>
      </section>

      <section>
        <h2>Cancellation</h2>
        <p>
          Under the Consumer Protection Act 68 of 2008 you may cancel an order placed
          online within seven days of delivery and return the goods, provided they are
          unopened and unused. See our{" "}
          <a href="/returns">Returns Policy</a> for how.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>These terms are governed by the law of the Republic of South Africa.</p>
      </section>
    </LegalPage>
  );
}
