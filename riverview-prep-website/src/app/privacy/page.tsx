import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecondaryBanner from '@/components/SecondaryBanner';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner
        title="Privacy Policy"
        subtitle="HOW WE PROTECT YOUR INFORMATION"
        image="/images/banner.jpg"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl prose prose-sm prose-green">
          <div className="space-y-8 text-brand-green/80 leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">1. Introduction</h2>
              <p>Riverview Preparatory School (&ldquo;the School&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to protecting the privacy of our students, parents, staff, and website visitors. This policy explains how we collect, use, and safeguard personal information in compliance with the Protection of Personal Information Act (POPIA) of South Africa.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">2. Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Contact details (name, email address, telephone number) submitted via our contact and admissions forms.</li>
                <li>Student records required for enrolment, academic reporting, and co-curricular activities.</li>
                <li>Website usage data via standard analytics tools to improve our digital services.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">3. How We Use Your Information</h2>
              <p>Personal information is used exclusively for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Processing admissions applications and responding to enquiries.</li>
                <li>Communicating school announcements, newsletters, and event information.</li>
                <li>Maintaining accurate academic and administrative records.</li>
                <li>Improving the usability and content of our website.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">4. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction. Our website uses encrypted connections (HTTPS) and access to personal data is restricted to authorized staff members only.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">5. Third-Party Sharing</h2>
              <p>We do not sell, trade, or rent personal information to third parties. We may share information with trusted service providers who assist us in operating our website and school systems, provided they agree to keep the information confidential.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">6. Your Rights</h2>
              <p>Under POPIA, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Request access to personal information we hold about you.</li>
                <li>Request correction or deletion of your personal information.</li>
                <li>Withdraw consent where processing is based on consent.</li>
                <li>Lodge a complaint with the Information Regulator of South Africa.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-brand-green mb-3">7. Contact</h2>
              <p>For privacy-related queries, please contact our Information Officer at{' '}
                <a href="mailto:info@riverviewprep.org" className="text-brand-gold font-bold hover:underline">info@riverviewprep.org</a> or
                call +27 (0) 13 790 0000.
              </p>
              <p className="text-xs text-brand-green/40 mt-2">Last updated: May 2026</p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
