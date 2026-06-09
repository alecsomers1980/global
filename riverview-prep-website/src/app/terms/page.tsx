import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecondaryBanner from '@/components/SecondaryBanner';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner
        title="Terms of Service"
        subtitle="USING OUR DIGITAL PLATFORMS"
        image="/images/banner.jpg"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl prose prose-sm prose-green">
          <div className="space-y-8 text-brand-green/80 leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using the Riverview Preparatory School website (&ldquo;the Website&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the Website.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">2. Use of the Website</h2>
              <p>The Website is provided for lawful purposes related to school communication, admissions, and community engagement. You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Submit false, misleading, or fraudulent information through any form.</li>
                <li>Attempt to gain unauthorized access to restricted areas of the Website.</li>
                <li>Use the Website in any way that may impair its performance or availability.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">3. Intellectual Property</h2>
              <p>All content on this Website — including text, images, logos, branding, and downloadable documents — is the property of Riverview Preparatory School unless otherwise stated. Content may be downloaded for personal, non-commercial use only. Reproduction, distribution, or modification requires prior written consent from the School.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">4. User-Submitted Content</h2>
              <p>Where the Website allows users to submit content (such as contact forms, alumni registrations, or photo uploads), you grant the School a non-exclusive license to use that content for the intended school-related purposes. You represent that you have the right to share any content you submit.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">5. Disclaimer</h2>
              <p>While we strive to keep information accurate and current, the School makes no warranties about the completeness or accuracy of content on the Website. The School is not liable for any loss or damage arising from the use of, or reliance on, information published on the Website.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">6. External Links</h2>
              <p>The Website may contain links to third-party websites. These links are provided for convenience only and do not constitute endorsement. The School is not responsible for the content or practices of linked websites.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">7. Changes to These Terms</h2>
              <p>We reserve the right to update these Terms of Service at any time. Changes will be posted on this page and, where appropriate, notified to registered users. Continued use of the Website after changes constitutes acceptance of the revised terms.</p>
              <p className="text-xs text-brand-green/40 mt-2">Last updated: May 2026</p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
