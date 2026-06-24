import SecondaryHeader from "@/components/SecondaryHeader";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for the Doing Business in Bushbuckridge (DBiB) directory. Rules for using our platform, including listings, payments, reviews, and liability.",
};

export default function TermsPage() {
  return (
    <>
      <SecondaryHeader
        title="Terms & Conditions"
        subtitle="The rules for using the Doing Business in Bushbuckridge directory."
        badge="LEGAL"
      />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Draft notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 mb-10">
          <strong>⚠️ Important:</strong> These terms are in draft and must be
          finalised and legally reviewed before the site goes live. Placeholder
          information is indicated in{" "}
          <span className="font-mono bg-amber-100 px-1 rounded">[brackets]</span>.
        </div>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          1. Introduction &amp; Acceptance of Terms
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Welcome to Doing Business in Bushbuckridge (DBiB). By accessing or
          using our website, you agree to be bound by these Terms &amp;
          Conditions. If you do not agree, please refrain from using the site.
          These terms apply to all visitors, users, business owners, and others
          who access or use our services.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          2. Definitions
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>&ldquo;The Website&rdquo;</strong> refers to the Doing
            Business in Bushbuckridge (DBiB) directory, accessible at its domain
            and any subdomains.
          </li>
          <li>
            <strong>&ldquo;We&rdquo;, &ldquo;Us&rdquo;, &ldquo;Our&rdquo;</strong>{" "}
            means [COMPANY LEGAL NAME], a company registered in South Africa
            under registration number [COMPANY REGISTRATION NUMBER].
          </li>
          <li>
            <strong>&ldquo;User&rdquo;</strong> means any person who visits or
            browses the Website.
          </li>
          <li>
            <strong>&ldquo;Business Owner&rdquo;</strong> means a User who
            registers, submits, or manages a business listing on the Website.
          </li>
          <li>
            <strong>&ldquo;Listing&rdquo;</strong> means a business profile,
            including all information, images, logos, and descriptions submitted
            by a Business Owner.
          </li>
          <li>
            <strong>&ldquo;Content&rdquo;</strong> includes any text, images,
            reviews, comments, or other materials uploaded or displayed on the
            Website.
          </li>
        </ul>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          3. Eligibility &amp; Accounts
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You must be at least 18 years old to create an account. When you
          register, you agree to provide accurate, current, and complete
          information. You are responsible for keeping your login credentials
          secure and for all activity that occurs under your account. Notify us
          immediately of any unauthorised use.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          4. Business Listings &amp; Subscriptions
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            Business listings are annual paid subscriptions. Pricing is displayed
            on the Website and excludes Value-Added Tax (VAT) where applicable.
          </li>
          <li>
            Listings are subject to review and approval before going live. We
            reserve the right to reject, edit, or remove any Listing that is
            unlawful, misleading, inappropriate, or violates these Terms.
          </li>
          <li>
            Business Owners must ensure that all Listing Content is accurate,
            honest, and kept up to date.
          </li>
        </ul>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          5. Payments &amp; Renewals
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            Payments are processed by Yoco. Yoco does not offer automatic
            recurring billing. Renewals are manual and prompted by reminder
            emails sent to the Business Owner.
          </li>
          <li>
            If a Listing is not renewed, it will be hidden from public view.
            Previously paid subscription fees are non-refundable, except as
            required by the Consumer Protection Act 68 of 2008 or other
            applicable legislation.
          </li>
        </ul>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          6. Job Postings &amp; Opportunities
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Employers who post job opportunities are solely responsible for the
          accuracy and legality of their postings. We act as a platform only and
          do not guarantee employment, vet applicants, or verify the truthfulness
          of job advertisements.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          7. User Content &amp; Conduct
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            By submitting Content (including listings, reviews, comments), you
            grant us a non-exclusive, royalty-free, worldwide licence to use,
            reproduce, modify, and display that Content on the Website and in
            related promotional materials.
          </li>
          <li>
            You warrant that you own or have the necessary rights to any Content
            you submit, and that it does not infringe third-party intellectual
            property rights.
          </li>
          <li>
            Prohibited Content includes, but is not limited to, anything that is
            unlawful, defamatory, abusive, hateful, infringing, or constitutes
            spam.
          </li>
        </ul>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">8. Reviews</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Reviews must reflect genuine experiences. We moderate reviews and
          reserve the right to remove or reject any review that appears fake,
          defamatory, or violates these Terms. We are not liable for the opinions
          expressed by reviewers.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          9. Intellectual Property
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Doing Business in Bushbuckridge name, logo, branding, and all
          original site content (excluding User-submitted Content) are owned by
          [COMPANY LEGAL NAME] and protected by South African and international
          intellectual property laws. You are granted a limited, revocable
          licence to access and use the Website for its intended purpose. No
          right, title, or interest is transferred to you.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          10. Third-Party Links &amp; Businesses
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Website may contain links to third-party websites, or feature
          businesses and services listed by independent owners. We do not endorse
          and are not responsible for the content, accuracy, or practices of any
          third-party sites or businesses. Interactions with third parties are at
          your own risk.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          11. Disclaimers &amp; Limitation of Liability
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            The Website is provided on an &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; basis. We make no warranties, express or implied,
            regarding the completeness, accuracy, or reliability of any Listings
            or Content.
          </li>
          <li>
            To the maximum extent permitted by South African law, we disclaim all
            liability for any direct, indirect, incidental, or consequential loss
            or damage arising from your use of, or inability to use, the Website.
          </li>
          <li>
            Nothing in these Terms limits or excludes any rights you may have
            under the Consumer Protection Act 68 of 2008.
          </li>
        </ul>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          12. Indemnity
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You agree to indemnify and hold harmless [COMPANY LEGAL NAME], its
          directors, employees, and agents from any claims, damages, or expenses
          arising out of your breach of these Terms, your misuse of the Website,
          or any Content you submit.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          13. Suspension &amp; Termination
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We may suspend or terminate your account and access to the Website
          immediately, without prior notice, if we believe you have breached
          these Terms or engaged in fraudulent or harmful conduct.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          14. Changes to These Terms
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We may update these Terms from time to time. The latest version will
          always be posted on this page with a revised last-updated date.
          Continued use of the Website after changes implies acceptance of the
          revised Terms.
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          15. Governing Law &amp; Jurisdiction
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          These Terms are governed by the laws of the Republic of South Africa.
          Any disputes arising out of or in connection with these Terms shall be
          subject to the exclusive jurisdiction of the courts of [GOVERNING CITY].
        </p>

        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          16. Contact Us
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          For questions about these Terms, please contact us:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>[COMPANY LEGAL NAME]</strong>
          </li>
          <li>Registration number: [COMPANY REGISTRATION NUMBER]</li>
          <li>Address: [PHYSICAL ADDRESS]</li>
          <li>Email: [CONTACT EMAIL]</li>
        </ul>

        <p className="text-sm text-muted-foreground italic mt-10">
          These terms were last updated on: <strong>[LAST UPDATED DATE]</strong>.
        </p>
      </div>
    </>
  );
}
