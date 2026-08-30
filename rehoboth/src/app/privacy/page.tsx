import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How Rehoboth Herbal Co. collects, uses and protects personal information, in line with the Protection of Personal Information Act.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Notice" updated="30 August 2026">
      <section>
        <p>
          This notice explains how Rehoboth Herbal Co. (&ldquo;we&rdquo;) collects and
          uses your personal information, and your rights under the Protection of
          Personal Information Act 4 of 2013 (POPIA).
        </p>
      </section>

      <section>
        <h2>Who is responsible</h2>
        <p>
          Rehoboth Herbal Co., Portion 21 of Farm 277JU Lovedale, Honeybird,
          Low&rsquo;s Creek, Mpumalanga. Registration number [REG NUMBER].
        </p>
        <p>
          Information Officer: [INFORMATION OFFICER NAME], [INFORMATION OFFICER
          EMAIL].
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Your name, email address, phone number and delivery address, when you place an order.</li>
          <li>Your order history and the contents of your cart.</li>
          <li>Your business details, if you apply to become a stockist.</li>
          <li>Basic technical information your browser sends, such as page addresses and device type.</li>
        </ul>
        <p>
          We do not collect or store your card details. Payments are processed by
          PayFast, who handle your card information directly.
        </p>
      </section>

      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To take payment for, pack and deliver your order.</li>
          <li>To contact you about that order.</li>
          <li>To assess a stockist application.</li>
          <li>To meet our legal and tax obligations.</li>
        </ul>
        <p>
          We will only send you marketing email if you have asked us to, and every
          such email carries an unsubscribe link.
        </p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>
          Only with the parties needed to fulfil your order: our payment processor
          (PayFast), our delivery partner, and our email provider. We do not sell
          your personal information to anyone.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          Order records are kept for five years, as tax law requires. Account details
          are kept until you ask us to delete them. Stockist applications that are
          declined are deleted after twelve months.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>You may ask us to:</p>
        <ul>
          <li>tell you what personal information we hold about you;</li>
          <li>correct anything that is wrong;</li>
          <li>delete your information, where we are not required to keep it;</li>
          <li>stop sending you marketing.</li>
        </ul>
        <p>
          Write to our Information Officer at the address above. If you are not
          satisfied with our response, you may complain to the Information Regulator
          (South Africa) at{" "}
          <a href="mailto:complaints.IR@justice.gov.za">complaints.IR@justice.gov.za</a>.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          We store your cart in your own browser so it survives a page reload. That
          information stays on your device and is not sent to us until you place an
          order.
        </p>
      </section>
    </LegalPage>
  );
}
