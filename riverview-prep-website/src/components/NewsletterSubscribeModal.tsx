'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { X, Mail, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewsletterSubscribeModal({ open, onClose }: Props) {
  const [form, setForm] = useState({ full_name: '', email: '', consent: false });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'duplicate'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = createClient();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;
    setStatus('submitting');

    // Check for existing subscription
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', form.email)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      setStatus('duplicate');
      return;
    }

    const { error } = await supabase.from('newsletter_subscribers').insert({
      full_name: form.full_name,
      email: form.email,
      consent_given: true,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setForm({ full_name: '', email: '', consent: false });
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-green/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-cream transition-colors z-10"
        >
          <X className="w-5 h-5 text-brand-green/50" />
        </button>

        {/* Brand header */}
        <div className="bg-brand-green px-8 pt-10 pb-8 text-center">
          <div className="w-16 h-16 bg-brand-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-brand-gold" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Stay Connected</h2>
          <p className="text-white/60 text-sm">
            Get the Riverview Reporter and school news delivered to your inbox.
          </p>
        </div>

        <div className="p-8">
          {status === 'success' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-brand-green mb-2">You&apos;re Subscribed!</h3>
              <p className="text-brand-green/60 text-sm mb-6">
                Welcome to the Riverview community. You&apos;ll receive our next edition directly in your inbox.
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition-all"
              >
                Done
              </button>
            </div>
          ) : status === 'duplicate' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Mail className="w-14 h-14 text-brand-gold mb-4" />
              <h3 className="text-xl font-bold text-brand-green mb-2">Already Subscribed</h3>
              <p className="text-brand-green/60 text-sm mb-6">
                This email address is already on our mailing list. You&apos;ll continue to receive the Riverview Reporter.
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-green/30" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-green/30" />
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/40 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                  />
                </div>
              </div>

              {/* POPIA Consent Checkbox */}
              <div className="p-4 bg-brand-cream/50 rounded-xl border border-brand-green/5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.consent}
                    onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded border-brand-green/20 text-brand-gold focus:ring-brand-gold shrink-0"
                  />
                  <span className="text-xs text-brand-green/70 leading-relaxed">
                    I consent to Riverview Preparatory School collecting and processing my personal information (name and email address) for the purpose of sending me newsletters, school announcements, and event invitations. I understand that I can unsubscribe at any time by clicking the unsubscribe link in any email, or by contacting the school at{' '}
                    <a href="mailto:info@riverviewprep.org" className="text-brand-gold hover:underline">info@riverviewprep.org</a>.
                    View our{' '}
                    <Link href="/privacy" className="text-brand-gold hover:underline" onClick={handleClose}>
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg || 'Something went wrong. Please try again.'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting' || !form.consent}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing...</>
                ) : (
                  'Subscribe to Newsletter'
                )}
              </button>

              <p className="text-center text-[10px] text-brand-green/30 leading-relaxed">
                Your information is protected under POPIA. We never share your details with third parties.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
