import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecondaryBanner from '@/components/SecondaryBanner';
import { Lock, Calendar, Users, BookOpen, FileText } from 'lucide-react';

const features = [
  { icon: <Calendar className="w-6 h-6" />, title: 'Calendar Management', desc: 'Update school events and term dates.' },
  { icon: <Users className="w-6 h-6" />, title: 'Staff Directory', desc: 'Manage your profile and contact details.' },
  { icon: <BookOpen className="w-6 h-6" />, title: 'Resource Library', desc: 'Access teaching resources and policy documents.' },
  { icon: <FileText className="w-6 h-6" />, title: 'Forms & Submissions', desc: 'Digital leave forms and administrative requests.' },
];

export default function StaffPortalPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner
        title="Staff Portal"
        subtitle="RESOURCES FOR OUR EDUCATORS"
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
            A secure internal hub where staff can manage calendars, access resources,
            and handle administrative tasks — built to save time and reduce paperwork.
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
              Staff members can contact the office at{' '}
              <a href="mailto:info@riverviewprep.org" className="text-brand-gold font-bold hover:underline">
                info@riverviewprep.org
              </a>
              {' '}for access enquiries.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
