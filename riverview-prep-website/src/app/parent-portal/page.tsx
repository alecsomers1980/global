import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecondaryBanner from '@/components/SecondaryBanner';
import { Lock, Bell, Calendar, FileText } from 'lucide-react';

const features = [
  { icon: <Bell className="w-6 h-6" />, title: 'Announcements', desc: 'School notices and urgent updates.' },
  { icon: <Calendar className="w-6 h-6" />, title: 'School Calendar', desc: 'Term dates, events, and sports fixtures.' },
  { icon: <FileText className="w-6 h-6" />, title: 'Digital Resources', desc: 'Permission slips, reports, and documents.' },
  { icon: <Lock className="w-6 h-6" />, title: 'Secure Access', desc: 'Your child\'s records, accessible only to you.' },
];

export default function ParentPortalPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner
        title="Parent Portal"
        subtitle="YOUR CHILD'S JOURNEY AT A GLANCE"
        image="/images/banner.jpg"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-gold/10 rounded-full mb-8">
            <Lock className="w-10 h-10 text-brand-gold" />
          </div>
          <h2 className="text-3xl font-bold text-brand-green mb-4">
            Coming <span className="drama-text text-brand-gold">Soon</span>
          </h2>
          <p className="text-brand-green/70 text-lg leading-relaxed mb-12 max-w-xl mx-auto">
            We&apos;re building a secure, personalized dashboard where parents can access announcements,
            track their child&apos;s progress, and manage school communication — all in one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-brand-cream rounded-2xl border border-brand-green/5 text-left flex gap-4 items-start">
                <div className="text-brand-gold shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <h4 className="font-bold text-brand-green text-sm mb-1">{f.title}</h4>
                  <p className="text-brand-green/60 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-brand-cream rounded-2xl border border-brand-green/5 inline-block">
            <p className="text-brand-green/60 text-sm">
              Have questions? Email us at{' '}
              <a href="mailto:info@riverviewprep.org" className="text-brand-gold font-bold hover:underline">
                info@riverviewprep.org
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
