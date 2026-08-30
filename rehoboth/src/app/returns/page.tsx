import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Returns Policy",
  description:
    "How to return or exchange a Rehoboth Herbal Co. order, and what we can accept back.",
};

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns Policy" updated="30 August 2026">
      <section>
        <p>
          If something is wrong with your order, tell us and we will put it right.
          Email <a href="mailto:friedsgrobler@gmail.com">friedsgrobler@gmail.com</a> or
          call 082 824 9023 with your order reference.
        </p>
      </section>

      <section>
        <h2>Damaged, wrong or missing items</h2>
        <p>
          Tell us within seven days of delivery and we will replace the item or refund
          it, including the delivery cost. A photograph helps and saves you sending
          anything back.
        </p>
      </section>

      <section>
        <h2>Changed your mind</h2>
        <p>
          Under the Consumer Protection Act you may cancel an online order within
          seven days of delivery. We can accept a return where the product is:
        </p>
        <ul>
          <li>unopened, with any seal intact;</li>
          <li>in its original packaging;</li>
          <li>back with us within fourteen days of delivery.</li>
        </ul>
        <p>
          You pay the return postage in this case. We refund the product price once we
          have the goods back and have checked them.
        </p>
      </section>

      <section>
        <h2>What we cannot take back</h2>
        <p>
          For hygiene reasons we cannot accept a return of any product that has been
          opened or used — this includes capsules, powders, ointments, oils, tinctures,
          lip balm and soap. This does not affect your rights where a product is
          faulty.
        </p>
      </section>

      <section>
        <h2>Refunds</h2>
        <p>
          Refunds are paid back to the method you paid with, through PayFast, within
          ten working days of us approving the return.
        </p>
      </section>

      <section>
        <h2>Sending something back</h2>
        <p>
          Please contact us first — do not post anything back without hearing from us,
          or we may not be able to match it to your order. Our return address is
          Rehoboth Farm, Portion 21 of Farm 277JU Lovedale, Honeybird, Low&rsquo;s
          Creek, Mpumalanga.
        </p>
      </section>
    </LegalPage>
  );
}
