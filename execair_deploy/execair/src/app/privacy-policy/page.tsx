import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Exec-Air Privacy Policy — how we collect, use, and protect your personal information in compliance with the POPI Act.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageBanner
        title="Privacy Policy"
        subtitle="Last updated: May 2026"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <div className="prose prose-brand max-w-none space-y-8 text-brand-navy/70 leading-relaxed">
            {/* 1. Introduction */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">1. Introduction</h2>
              <p className="mb-2">
                Exec-Air Air Conditioning (&ldquo;Exec-Air&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
              <p>
                This policy complies with the{" "}
                <strong>Protection of Personal Information Act, 2013 (Act No. 4 of 2013)</strong>{" "}
                (&ldquo;POPIA&rdquo;), South Africa&rsquo;s data privacy law.
              </p>
            </div>

            {/* 2. Responsible Party */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">2. Responsible Party</h2>
              <p>
                Exec-Air Air Conditioning is the responsible party for your personal information:
              </p>
              <address className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 not-italic">
                296 Voortrekker Road, Krugersdorp, Gauteng, 1739<br />
                <a href="tel:+27114773920" className="text-brand-teal hover:underline">+27 11 477 3920</a><br />
                <a href="mailto:info@execair.co.za" className="text-brand-teal hover:underline">info@execair.co.za</a>
              </address>
              <p className="mt-2">
                Our Information Officer is responsible for POPIA compliance. Contact the Information Officer at the details above.
              </p>
            </div>

            {/* 3. Information We Collect */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">3. Information We Collect</h2>
              <p className="mb-2">We may collect the following categories of personal information:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Contact Information:</strong> name, email address, phone number, company name, physical address.</li>
                <li><strong>Enquiry Information:</strong> details you provide when submitting an enquiry through our contact form, including your message and project requirements.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, operating system, referring URLs, pages visited, and time spent on pages, collected automatically when you visit our website.</li>
                <li><strong>Cookies and Tracking Data:</strong> information collected through cookies and similar technologies (see Section 9).</li>
              </ul>
            </div>

            {/* 4. How We Collect Information */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">4. How We Collect Information</h2>
              <p>We collect information in the following ways:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>When you fill in our contact or enquiry forms</li>
                <li>When you communicate with us via email, phone, or social media</li>
                <li>Automatically through cookies and analytics when you browse our website</li>
                <li>When you engage our services or request a quote</li>
              </ul>
            </div>

            {/* 5. Purpose of Collection */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">5. How We Use Your Information</h2>
              <p>We use your personal information for the following purposes:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>To respond to your enquiries and provide quotes</li>
                <li>To deliver and manage our HVAC services</li>
                <li>To communicate with you about projects, maintenance, and service updates</li>
                <li>To improve our website and services</li>
                <li>To comply with legal and regulatory obligations</li>
                <li>To send marketing communications (only with your consent, where required)</li>
              </ul>
            </div>

            {/* 6. Sharing & Disclosure */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">6. Sharing &amp; Disclosure</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Service Providers:</strong> trusted third parties who assist us in operating our website and business, bound by confidentiality agreements.</li>
                <li><strong>Legal Compliance:</strong> when required by law, regulation, or legal process.</li>
                <li><strong>Business Transfers:</strong> in connection with a merger, sale, or acquisition of all or part of our business.</li>
                <li><strong>With Your Consent:</strong> when you have given us explicit permission to share your information.</li>
              </ul>
            </div>

            {/* 7. Data Security */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">7. Data Security</h2>
              <p>
                We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These measures include secure server infrastructure, encryption, access controls, and regular security reviews.
              </p>
              <p>
                While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>

            {/* 8. Data Retention */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">8. Data Retention</h2>
              <p>
                We retain your personal information only for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law. When your information is no longer needed, we will securely delete or anonymise it.
              </p>
            </div>

            {/* 9. Cookies */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">9. Cookies</h2>
              <p className="mb-2">
                Our website uses cookies — small text files placed on your device — to enhance your browsing experience. We use the following types of cookies:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Essential Cookies:</strong> necessary for the website to function properly.</li>
                <li><strong>Analytics Cookies:</strong> help us understand how visitors interact with our website (e.g., page views, traffic sources).</li>
                <li><strong>Functional Cookies:</strong> remember your preferences and choices.</li>
              </ul>
              <p>
                You can manage or disable cookies through your browser settings. Disabling certain cookies may affect website functionality.
              </p>
            </div>

            {/* 10. Your Rights */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">10. Your Rights Under POPIA</h2>
              <p className="mb-2">Under the Protection of Personal Information Act, you have the right to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Access:</strong> request a copy of the personal information we hold about you.</li>
                <li><strong>Correction:</strong> request that we correct or update your personal information.</li>
                <li><strong>Deletion:</strong> request that we delete your personal information, subject to legal retention requirements.</li>
                <li><strong>Objection:</strong> object to the processing of your personal information in certain circumstances.</li>
                <li><strong>Withdraw Consent:</strong> withdraw your consent at any time, where processing is based on consent.</li>
                <li><strong>Complain:</strong> lodge a complaint with the{" "}
                  <a
                    href="https://www.justice.gov.za/inforeg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-teal hover:underline"
                  >
                    Information Regulator of South Africa
                  </a>{" "}
                  if you believe your data protection rights have been violated.
                </li>
              </ul>
              <p>
                To exercise any of these rights, contact our Information Officer using the details in Section 2.
              </p>
            </div>

            {/* 11. Third-Party Links */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">11. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to read the privacy policies of any third-party websites you visit.
              </p>
            </div>

            {/* 12. Children's Privacy */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">12. Children&rsquo;s Privacy</h2>
              <p>
                Our website and services are not directed at children under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
              </p>
            </div>

            {/* 13. Changes */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">13. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. We encourage you to review this policy periodically.
              </p>
            </div>

            {/* 14. Contact */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">14. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or how we handle your personal information, please contact us:</p>
              <address className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 not-italic">
                <strong>Exec-Air Air Conditioning</strong><br />
                296 Voortrekker Road, Krugersdorp, Gauteng, 1739<br />
                Tel: <a href="tel:+27114773920" className="text-brand-teal hover:underline">+27 11 477 3920</a><br />
                Email: <a href="mailto:info@execair.co.za" className="text-brand-teal hover:underline">info@execair.co.za</a>
              </address>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
