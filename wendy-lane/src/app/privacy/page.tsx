import type { Metadata } from "next";
import { BUSINESS } from "@/data/business";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | Wendy Lane Nelspruit",
  description:
    "How Wendy Lane collects, uses and protects your personal information under South Africa’s POPIA. Plain‑language privacy notice.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Your data, plainly explained"
        title="Privacy Policy"
        intro="How Wendy Lane collects, uses and protects your personal information under South Africa’s POPIA."
      />
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-ink/80 mx-auto max-w-3xl">
            <p className="text-sm text-ink/60">
              Last updated: 22 July 2026
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-0 mb-4">
              1. Who we are
            </h2>
            <p>
              {BUSINESS.legalName} (“{BUSINESS.name}”, “we”, “us”) is the
              responsible party under South Africa’s Protection of Personal
              Information Act (POPIA). Our principal place of business is at{" "}
              {BUSINESS.address.street}, {BUSINESS.address.city},{" "}
              {BUSINESS.address.region}, {BUSINESS.address.postalCode}. You can
              reach us by email at{" "}
              <a href={`mailto:${BUSINESS.email}`} className="underline">
                {BUSINESS.email}
              </a>
              .
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-10 mb-4">
              2. What we collect
            </h2>
            <p>
              We only collect the information you voluntarily give us when you
              use the enquiry form or our interactive quote builder. That
              includes:
            </p>
            <ul>
              <li>
                Your name, phone number and (optionally) email address, so we
                can reach you.
              </li>
              <li>
                The town or area where you are building, to serve you better.
              </li>
              <li>
                Any free‑text message you include in the enquiry form.
              </li>
              <li>
                If you used the quote builder, the size, options and itemised
                total you configured. This helps us understand what you need
                before we ever speak.
              </li>
            </ul>
            <p>
              No payment or banking details are ever collected on this website.
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-10 mb-4">
              3. Why we collect it
            </h2>
            <p>
              We collect your information solely to respond to your enquiry,
              prepare a tailored quote, and arrange delivery of our products.
              This processing is necessary to take steps at your request before
              entering into a possible agreement — a lawful basis recognised by
              POPIA. We do not use your details for blanket marketing or add you
              to a mailing list without your specific consent.
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-10 mb-4">
              4. Cookies and tracking
            </h2>
            <p>
              This site does not currently set analytics or advertising cookies.
              If that changes in the future, we will update this policy and
              inform you before any such cookies are placed.
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-10 mb-4">
              5. Who we share it with
            </h2>
            <p>
              We do not sell, trade, or share your personal information with
              anyone outside{" "}
              {BUSINESS.name} except for the email‑delivery service we use
              (Resend) to send us the enquiry notifications you submit. Resend
              acts strictly as an operator on our behalf and processes your data
              only to deliver those emails. No third party receives your
              information for their own marketing.
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-10 mb-4">
              6. How long we keep it
            </h2>
            <p>
              We keep your information for as long as needed to handle your
              enquiry and complete any resulting sale, plus a reasonable period
              for our business records — typically no more than a few years.
              This is a starting policy that{" "}
              {BUSINESS.name} will confirm and adjust as our record‑keeping
              practices evolve.
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-10 mb-4">
              7. Your rights under POPIA
            </h2>
            <p>
              You have the right to ask us to confirm what personal information
              we hold about you, to request correction or deletion of that
              information, and to object to its processing. If you believe we
              have not handled your information lawfully, you may lodge a
              complaint with South Africa’s Information Regulator.
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-10 mb-4">
              8. How to contact us about privacy
            </h2>
            <p>
              For any privacy‑related questions or requests, please email{" "}
              <a href={`mailto:${BUSINESS.email}`} className="underline">
                {BUSINESS.email}
              </a>{" "}
              or call {BUSINESS.phone.display}.
            </p>

            <h2 className="font-display text-2xl font-bold tracking-tight text-ink mt-10 mb-4">
              9. Changes to this policy
            </h2>
            <p>
              We may update this privacy policy from time to time. When we do,
              we will revise the “Last updated” date at the top of the page. We
              encourage you to review this notice periodically to stay informed
              about how we protect your information.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
