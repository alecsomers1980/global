import type { Metadata } from "next";
import PageBanner from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for the use of the Exec-Air website and services.",
};

export default function TermsPage() {
  return (
    <>
      <PageBanner
        title="Terms &amp; Conditions"
        subtitle="Last updated: May 2026"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <div className="prose prose-brand max-w-none space-y-8 text-brand-navy/70 leading-relaxed">
            {/* 1. Introduction */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">1. Introduction</h2>
              <p>
                These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of the Exec-Air Air Conditioning website (&ldquo;the Website&rdquo;) and the services we provide. By accessing or using our Website, you agree to be bound by these Terms. If you do not agree, please do not use our Website.
              </p>
              <p>
                Exec-Air Air Conditioning is a company registered in the Republic of South Africa, with its registered address at 296 Voortrekker Road, Krugersdorp, Gauteng, 1739.
              </p>
            </div>

            {/* 2. Definitions */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">2. Definitions</h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>&ldquo;Exec-Air&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo; — Exec-Air Air Conditioning (Pty) Ltd.</li>
                <li>&ldquo;User&rdquo;, &ldquo;you&rdquo;, &ldquo;your&rdquo; — any person who accesses or uses the Website.</li>
                <li>&ldquo;Services&rdquo; — all HVAC-related services offered by Exec-Air, including but not limited to installation, maintenance, repair, design, and consultation.</li>
                <li>&ldquo;Content&rdquo; — all text, images, graphics, logos, videos, and other materials on the Website.</li>
              </ul>
            </div>

            {/* 3. Use of Website */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">3. Use of the Website</h2>
              <p className="mb-2">By using this Website, you agree that:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>You will use the Website for lawful purposes only and in compliance with all applicable South African laws and regulations.</li>
                <li>You will not use the Website in any way that may cause damage, impairment, or disruption to the Website or its services.</li>
                <li>You will not attempt to gain unauthorised access to any part of the Website, the server on which it is hosted, or any associated database.</li>
                <li>You will not use any automated means (including bots, scrapers, or spiders) to access or collect data from the Website without our prior written consent.</li>
              </ul>
            </div>

            {/* 4. Intellectual Property */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">4. Intellectual Property</h2>
              <p className="mb-2">
                All Content on this Website, including but not limited to text, graphics, logos, images, videos, designs, and software, is the intellectual property of Exec-Air or its licensors and is protected by South African and international copyright, trademark, and other intellectual property laws.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>The Exec-Air name and logo are trademarks of Exec-Air Air Conditioning.</li>
                <li>You may view, download, and print pages from the Website for your personal, non-commercial use only.</li>
                <li>You may not reproduce, distribute, modify, create derivative works from, publicly display, or otherwise use any Content without our prior written permission.</li>
              </ul>
            </div>

            {/* 5. Services */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">5. Our Services</h2>
              <p className="mb-2">
                All services provided by Exec-Air are subject to separate service agreements, quotations, or contracts. These Terms govern your use of the Website only and do not constitute a contract for the provision of HVAC services.
              </p>
              <p>
                Service quotations are valid for the period stated on the quotation. Exec-Air reserves the right to amend pricing, scope, or availability of services at any time prior to acceptance of a quotation.
              </p>
            </div>

            {/* 6. Website Content & Accuracy */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">6. Website Content &amp; Accuracy</h2>
              <p>
                While we strive to ensure that the information on this Website is accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the Website or the Content. Any reliance you place on such information is strictly at your own risk.
              </p>
              <p>
                We reserve the right to modify, update, or remove Content from the Website at any time without notice.
              </p>
            </div>

            {/* 7. Limitation of Liability */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">7. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by South African law, Exec-Air, its directors, employees, and agents shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of or in connection with your use of the Website or reliance on its Content, including but not limited to loss of data, loss of profits, business interruption, or damage to computer systems.
              </p>
              <p>
                Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded by South African law.
              </p>
            </div>

            {/* 8. Indemnity */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">8. Indemnity</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Exec-Air, its directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with your use of the Website, your breach of these Terms, or your violation of any applicable law or the rights of a third party.
              </p>
            </div>

            {/* 9. Third-Party Links */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">9. Third-Party Links</h2>
              <p>
                The Website may contain links to third-party websites for your convenience. We do not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party websites. Accessing third-party links is at your own risk.
              </p>
            </div>

            {/* 10. Privacy */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">10. Privacy</h2>
              <p>
                Your use of the Website is also governed by our{" "}
                <a href="/privacy-policy" className="text-brand-teal hover:underline">
                  Privacy Policy
                </a>
                , which explains how we collect, use, and protect your personal information in compliance with the Protection of Personal Information Act (POPIA).
              </p>
            </div>

            {/* 11. Electronic Communications */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">11. Electronic Communications</h2>
              <p>
                When you contact us via the Website, email, or any of our online forms, you consent to receiving communications from us electronically. All electronic communications sent by Exec-Air shall be deemed to have been received by you when sent, in accordance with the Electronic Communications and Transactions Act, 2002 (Act No. 25 of 2002).
              </p>
            </div>

            {/* 12. Governing Law */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">12. Governing Law &amp; Jurisdiction</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of South Africa.
              </p>
            </div>

            {/* 13. Changes to Terms */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">13. Changes to These Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Your continued use of the Website after any changes constitutes acceptance of the revised Terms.
              </p>
            </div>

            {/* 14. Severability */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">14. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be severed, and the remaining provisions shall continue in full force and effect.
              </p>
            </div>

            {/* 15. Contact */}
            <div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">15. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us:</p>
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
