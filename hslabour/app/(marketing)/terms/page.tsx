import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/site/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms governing your use of the H&S Labour Brokers website, e-book and shop purchases, and affiliate programme.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      intro="These terms govern your use of our website and the products and services you buy from us. Please read them carefully."
      updated="20 June 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        This website is operated by H&amp;S Labour Brokers cc (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;), registration number [company
        registration number], a private employment agency registered with the
        South African Department of Employment and Labour. You can reach us at{" "}
        <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a> or{" "}
        <a href="tel:0114684192">011 468 4192</a>.
      </p>

      <h2>2. Acceptance</h2>
      <p>
        By accessing this website or buying a product or service from us, you
        agree to these Terms &amp; Conditions and to our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>. If you do not agree,
        please do not use the site.
      </p>

      <h2>3. Our products and services</h2>
      <ul>
        <li>
          <strong>Recruitment, TES, payroll, vetting and HR services</strong> —
          provided to employers under separate written agreements.
        </li>
        <li>
          <strong>Job-hunting e-book</strong> — a digital product delivered
          electronically after payment.
        </li>
        <li>
          <strong>Shop services</strong> — including instant digital downloads
          and done-for-you services such as CV preparation and document
          verification.
        </li>
        <li>
          <strong>Affiliate programme</strong> — allows approved affiliates to
          earn commission by referring buyers.
        </li>
      </ul>

      <h2>4. Orders, prices and payment</h2>
      <p>
        All prices are shown in South African Rand (ZAR). We may update prices
        at any time, but changes will not affect orders already paid for.
        Payments are processed securely by our payment provider, PayFast. By
        placing an order you confirm that the payment details you use are your
        own or that you are authorised to use them.
      </p>

      <h2>5. Digital products and delivery</h2>
      <p>
        Digital products (such as the e-book and instant downloads) are made
        available electronically immediately or shortly after your payment is
        confirmed. You are granted a personal, non-transferable licence to use
        them. You may not resell, redistribute or publicly share digital
        products without our written permission.
      </p>

      <h2>6. Done-for-you services</h2>
      <p>
        For services such as CV preparation or document verification, you agree
        to provide accurate and complete information. Turnaround times and the
        number of included revisions are stated on the relevant product. We are
        not responsible for delays caused by incomplete or inaccurate
        information supplied by you.
      </p>

      <h2>7. Cancellations and refunds</h2>
      <p>
        Where the Electronic Communications and Transactions Act (ECTA) and the
        Consumer Protection Act (CPA) provide a cooling-off right, you may be
        entitled to cancel certain electronic purchases within the prescribed
        period. However, where you request immediate access to a digital
        product or the commencement of a service and you have begun to use it,
        the cooling-off right may no longer apply. If a product or service is
        defective or not as described, contact us at{" "}
        <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a> and we will
        assess a remedy in line with your statutory rights.
      </p>

      <h2>8. Affiliate programme terms</h2>
      <ul>
        <li>Membership is subject to our approval and may be revoked for misuse.</li>
        <li>
          Commission is earned on qualifying sales completed through your unique
          referral link and is paid to the banking details you provide.
        </li>
        <li>
          You may not promote our products through spam, misleading claims, paid
          search on our brand terms, or any unlawful or deceptive method.
        </li>
        <li>
          We may withhold or reverse commission on orders that are refunded,
          fraudulent, or made in breach of these terms.
        </li>
      </ul>

      <h2>9. Job listings and applications</h2>
      <p>
        Job listings are provided for information and may change or be removed
        at any time. Applying for a role does not guarantee placement or
        employment.
      </p>

      <h2>10. Acceptable use</h2>
      <p>
        You agree not to misuse the website, attempt to gain unauthorised
        access, interfere with its operation, or use it for any unlawful
        purpose.
      </p>

      <h2>11. Intellectual property</h2>
      <p>
        All content on this website — including text, logos, graphics and
        digital products — is owned by or licensed to H&amp;S Labour Brokers and
        is protected by law. You may not copy or reproduce it without our
        written permission.
      </p>

      <h2>12. Disclaimers and limitation of liability</h2>
      <p>
        The website and its content are provided &ldquo;as is&rdquo;. To the
        extent permitted by law, we are not liable for any indirect or
        consequential loss arising from your use of the website or our products.
        Nothing in these terms excludes liability that cannot be excluded under
        South African law, including under the CPA.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of the Republic of South Africa,
        and the South African courts have jurisdiction over any dispute.
      </p>

      <h2>14. Changes</h2>
      <p>
        We may update these terms from time to time. The current version will
        always be available on this page, with the &ldquo;Last updated&rdquo;
        date reflecting the latest change.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a> or call{" "}
        <a href="tel:0114684192">011 468 4192</a>.
      </p>
    </LegalLayout>
  );
}
