'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecondaryBanner from '@/components/SecondaryBanner';
import { createClient } from '@/lib/supabase-client';
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const supabase = createClient();
    const { error } = await supabase.from('contact_submissions').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
      status: 'new',
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner
        title="Contact Us"
        subtitle="WE'D LOVE TO HEAR FROM YOU"
        image="/images/banner.jpg"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              <div className="telemetry-monospace text-brand-gold">GET IN TOUCH</div>
              <h2 className="text-3xl font-bold text-brand-green leading-tight">
                Let&apos;s start a <span className="drama-text text-brand-gold">conversation.</span>
              </h2>
              <p className="text-brand-green/70 leading-relaxed text-sm">
                Whether you&apos;re a prospective parent, an alumnus, or have a general enquiry, our office team is ready to assist.
              </p>

              <div className="space-y-4 pt-6">
                <div className="flex items-start gap-4 p-5 bg-brand-cream rounded-2xl border border-brand-green/5">
                  <MapPin className="w-6 h-6 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-green text-sm">Visit Us</h4>
                    <p className="text-brand-green/60 text-xs mt-1">Malelane, Mpumalanga<br />South Africa</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-brand-cream rounded-2xl border border-brand-green/5">
                  <Phone className="w-6 h-6 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-green text-sm">Call Us</h4>
                    <p className="text-brand-green/60 text-xs mt-1">+27 (0) 13 790 0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-brand-cream rounded-2xl border border-brand-green/5">
                  <Mail className="w-6 h-6 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-green text-sm">Email Us</h4>
                    <p className="text-brand-green/60 text-xs mt-1">info@riverviewprep.org</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-brand-green/5 shadow-xl relative">
                <div className="absolute -top-4 -right-4 w-full h-full bg-brand-gold/5 rounded-[3rem] -z-10" />

                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
                    <h3 className="text-2xl font-bold text-brand-green mb-2">Thank You!</h3>
                    <p className="text-brand-green/70">Your message has been received. Our team will respond within 2–3 business days.</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-8 px-8 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-xl font-bold text-brand-green mb-6">Send us a message</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Full Name *</label>
                        <input
                          type="text" required
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Jane Doe"
                          className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Email Address *</label>
                        <input
                          type="email" required
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="jane@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+27 82 123 4567"
                          className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Subject</label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                          placeholder="General Enquiry"
                          className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Message *</label>
                      <textarea
                        required
                        rows={6}
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="How can we help you?"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm resize-none"
                      />
                    </div>

                    {status === 'error' && (
                      <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Something went wrong: {errorMsg}. Please try again or email us directly.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {status === 'submitting' ? 'Sending...' : 'Send Message'}
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
