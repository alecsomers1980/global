import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/site/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How H&S Labour Brokers collects, uses, shares and protects your personal information in line with South Africa's Protection of Personal Information Act (POPIA).",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="We respect your privacy and are committed to protecting your personal information in accordance with the Protection of Personal Information Act, 2013 (POPIA)."
      updated="20 June 2026"
    >
      <p>
        This Privacy Policy explains how H&amp;S Labour Brokers cc (&ldquo;H&amp;S
        Labour Brokers&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or
        &ldquo;our&rdquo;) collects, uses, shares, stores and protects your
        personal information when you visit{" "}
        <Link href="/">hslabour.co.za</Link>, apply for jobs, use our staffing
        services, buy our e-book or shop services, or join our affiliate
        programme.
      </p>

      <h2>1. Who we are (Responsible Party)</h2>
      <p>
        For the purposes of POPIA, the responsible party is:
      </p>
      <ul>
        <li>H&amp;S Labour Brokers cc</li>
        <li>Registration number: [company registration number]</li>
        <li>Physical address: [registered physical address]</li>
        <li>
          Email:{" "}
          <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a>
        </li>
        <li>
          Telephone: <a href="tel:0114684192">011 468 4192</a>
        </li>
      </ul>

      <h2>2. Information Officer</h2>
      <p>
        Our Information Officer is responsible for ensuring our compliance with
        POPIA. You can contact the Information Officer at{" "}
        <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a> (marked for
        the attention of the Information Officer, [Information Officer name]).
      </p>

      <h2>3. The personal information we collect</h2>
      <p>
        Depending on how you interact with us, we may collect the following
        categories of personal information:
      </p>
      <h3>Job seekers and candidates</h3>
      <ul>
        <li>Name, contact details (email, phone), and location.</li>
        <li>
          Your CV and its contents — work history, qualifications, references,
          identity or work-permit details, and any other information you choose
          to share with us.
        </li>
        <li>Results of vetting, screening and psychometric assessments where applicable.</li>
      </ul>
      <h3>Employers and clients</h3>
      <ul>
        <li>Business contact name, company details, email and phone.</li>
        <li>Details of your staffing requirements.</li>
      </ul>
      <h3>Affiliates</h3>
      <ul>
        <li>Name, contact details and the promotional channels you use.</li>
        <li>
          Banking details (account name, bank, account number, branch code)
          solely to pay your commissions.
        </li>
      </ul>
      <h3>E-book and shop customers</h3>
      <ul>
        <li>Name, email and order details.</li>
        <li>
          Documents you upload for a service (for example a CV for review). We
          do not see or store your full card details — payments are processed
          securely by our payment provider (see section 6).
        </li>
      </ul>
      <h3>All website visitors</h3>
      <ul>
        <li>
          Technical data such as IP address, browser type, and pages visited,
          collected through cookies and similar technologies (see section 9).
        </li>
      </ul>

      <h2>4. How and why we use your information</h2>
      <p>We process personal information for the following purposes:</p>
      <ul>
        <li>To match candidates with suitable job opportunities and place them with employers.</li>
        <li>To provide our recruitment, TES, payroll, vetting and HR services.</li>
        <li>To fulfil e-book and shop orders and deliver purchased products and services.</li>
        <li>To administer the affiliate programme and pay commissions.</li>
        <li>To respond to enquiries and provide customer support.</li>
        <li>To comply with legal, regulatory and tax obligations.</li>
        <li>To maintain the security and integrity of our website and systems.</li>
      </ul>

      <h2>5. Lawful basis and consent</h2>
      <p>
        We process personal information where it is necessary to provide a
        service you have requested, to perform a contract, to comply with the
        law, to pursue our legitimate business interests in a balanced way, or
        with your consent. Where we rely on consent, you may withdraw it at any
        time (this will not affect processing already carried out). Providing
        your information is generally voluntary, but if you do not provide
        information we need we may be unable to provide the relevant service —
        for example, we cannot place you without a CV.
      </p>

      <h2>6. Who we share your information with</h2>
      <p>
        We do not sell your personal information. We share it only as necessary
        with:
      </p>
      <ul>
        <li>
          <strong>Employers and clients</strong> — to present you for relevant
          opportunities (for candidates).
        </li>
        <li>
          <strong>Operators (service providers)</strong> who process information
          on our behalf under confidentiality obligations, including:
          <ul>
            <li>Our hosting and database provider (Supabase / cloud hosting).</li>
            <li>Our payment provider, PayFast, which securely processes card and EFT payments.</li>
            <li>Our email and communication providers.</li>
          </ul>
        </li>
        <li>
          <strong>Authorities and regulators</strong> where required by law.
        </li>
      </ul>

      <h2>7. Cross-border transfers</h2>
      <p>
        Some of our service providers may store or process information on
        servers located outside South Africa. Where this happens, we take
        reasonable steps to ensure your information receives a level of
        protection consistent with POPIA.
      </p>

      <h2>8. How we protect and retain your information</h2>
      <p>
        We apply appropriate technical and organisational measures to protect
        personal information against loss, unauthorised access or disclosure —
        including access controls, encryption in transit, and restricted
        database permissions. We retain personal information only for as long as
        necessary to fulfil the purposes above or to meet legal and regulatory
        requirements, after which it is securely deleted or anonymised.
      </p>

      <h2>9. Cookies</h2>
      <p>
        Our website uses cookies and similar technologies to keep you signed in,
        remember your preferences, and understand how the site is used. Most
        browsers let you refuse or delete cookies; disabling them may affect how
        the site works (for example, staying logged in).
      </p>

      <h2>10. Your rights</h2>
      <p>Subject to POPIA, you have the right to:</p>
      <ul>
        <li>Request access to the personal information we hold about you.</li>
        <li>Request that we correct or delete your information.</li>
        <li>Object to the processing of your information.</li>
        <li>Withdraw consent where processing is based on consent.</li>
        <li>Lodge a complaint with the Information Regulator.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a>.
      </p>

      <h2>11. Complaints to the Information Regulator</h2>
      <p>
        If you believe we have not handled your personal information lawfully,
        you may lodge a complaint with the Information Regulator (South Africa):
      </p>
      <ul>
        <li>
          Website:{" "}
          <a
            href="https://inforegulator.org.za"
            target="_blank"
            rel="noopener noreferrer"
          >
            inforegulator.org.za
          </a>
        </li>
        <li>
          Email:{" "}
          <a href="mailto:complaints.IR@inforegulator.org.za">
            complaints.IR@inforegulator.org.za
          </a>
        </li>
        <li>Address: JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001</li>
      </ul>

      <h2>12. Children</h2>
      <p>
        Our services are not directed at children under 18, and we do not
        knowingly collect their personal information without parental or
        guardian consent.
      </p>

      <h2>13. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The
        &ldquo;Last updated&rdquo; date above reflects the latest version, and
        the current policy will always be available on this page.
      </p>

      <h2>14. Contact us</h2>
      <p>
        For any privacy questions or requests, email{" "}
        <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a> or call{" "}
        <a href="tel:0114684192">011 468 4192</a>. See also our{" "}
        <Link href="/paia">PAIA information</Link> and{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>
    </LegalLayout>
  );
}
