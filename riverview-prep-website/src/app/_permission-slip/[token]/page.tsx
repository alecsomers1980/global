'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle2, AlertCircle, Loader2, Shield, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Slip {
  id: string;
  title: string;
  description: string;
  event_date: string;
  due_date: string;
  status: string;
}

export default function PermissionSlipResponsePage() {
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();
  const [slip, setSlip] = useState<Slip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ parent_name: '', parent_email: '', student_name: '', consent: false, notes: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase.from('permission_slips').select('*').eq('token', token).single().then(({ data, error }) => {
      if (error || !data) { setNotFound(true); }
      else if (data.status !== 'active') { setNotFound(true); }
      else { setSlip(data); }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;
    setStatus('submitting');

    const { error } = await supabase.from('permission_slip_responses').insert({
      slip_id: slip!.id,
      parent_name: form.parent_name,
      parent_email: form.parent_email,
      student_name: form.student_name,
      consent_given: true,
      notes: form.notes || null,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </main>
    );
  }

  // Not found / expired / closed
  if (notFound || !slip) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <Shield className="w-16 h-16 text-brand-green/20 mb-6" />
          <h2 className="text-2xl font-bold text-brand-green mb-2">Link Expired or Not Found</h2>
          <p className="text-brand-green/60 max-w-md">
            This permission slip is no longer active. The due date may have passed or the school may have closed submissions.
            Please contact the school office if you believe this is an error.
          </p>
          <Link href="/contact" className="mt-8 px-8 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition-all">
            Contact the Office
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      {/* Consent Banner */}
      <section className="bg-brand-green text-white py-12">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <Shield className="w-12 h-12 text-brand-gold mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{slip.title}</h1>
          <p className="text-white/70 text-sm">Digital Permission Slip — Riverview Preparatory School</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">

          {status === 'success' ? (
            <div className="bg-white p-10 rounded-[2rem] border border-brand-green/5 shadow-xl text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-brand-green mb-2">Consent Submitted</h2>
              <p className="text-brand-green/70 mb-2">Thank you, {form.parent_name}. Your consent for {form.student_name} has been recorded.</p>
              <p className="text-brand-green/50 text-sm">A confirmation has been sent to {form.parent_email}.</p>
            </div>
          ) : (
            <>
              {/* Slip Details */}
              {slip.description && (
                <div className="bg-brand-cream p-6 rounded-2xl border border-brand-green/5 mb-8">
                  <div className="telemetry-monospace text-brand-gold text-xs mb-2">DETAILS</div>
                  <p className="text-brand-green/80 leading-relaxed text-sm whitespace-pre-wrap">{slip.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-6 mb-8">
                {slip.event_date && (
                  <div className="flex items-center gap-2 text-sm text-brand-green/60">
                    <Calendar className="w-4 h-4 text-brand-gold" />
                    <span><strong>Event Date:</strong> {new Date(slip.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
                {slip.due_date && (
                  <div className="flex items-center gap-2 text-sm text-brand-green/60">
                    <AlertCircle className="w-4 h-4 text-brand-gold" />
                    <span><strong>Respond By:</strong> {new Date(slip.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {/* Response Form */}
              <div className="bg-white p-8 rounded-[2rem] border border-brand-green/5 shadow-lg">
                <h3 className="text-xl font-bold text-brand-green mb-6">Parent / Guardian Consent</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Your Full Name *</label>
                      <input type="text" required placeholder="Jane Doe" value={form.parent_name}
                        onChange={e => setForm(p => ({ ...p, parent_name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Your Email Address *</label>
                      <input type="email" required placeholder="jane@example.com" value={form.parent_email}
                        onChange={e => setForm(p => ({ ...p, parent_email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Student&apos;s Full Name *</label>
                    <input type="text" required placeholder="John Doe" value={form.student_name}
                      onChange={e => setForm(p => ({ ...p, student_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-green/80 mb-1.5">Additional Notes (optional)</label>
                    <textarea rows={3} placeholder="Any allergies, medical conditions, or special instructions..." value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm resize-none" />
                  </div>

                  {/* POPIA Consent */}
                  <div className="p-4 bg-brand-cream/50 rounded-xl border border-brand-green/5">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" required checked={form.consent}
                        onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 rounded border-brand-green/20 text-brand-gold focus:ring-brand-gold shrink-0" />
                      <span className="text-xs text-brand-green/70 leading-relaxed">
                        I, {form.parent_name || '[Parent/Guardian Name]'}, grant permission for my child, {form.student_name || '[Student Name]'}, to participate in the activity described above. I confirm that the information provided is accurate and that I have legal authority to provide this consent. I understand that this digital consent carries the same weight as a signed paper form under South African law.
                      </span>
                    </label>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg || 'Something went wrong. Please try again.'}</span>
                    </div>
                  )}

                  <button type="submit" disabled={status === 'submitting' || !form.consent}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {status === 'submitting' ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Consent'}
                  </button>

                  <p className="text-center text-[10px] text-brand-green/30 leading-relaxed">
                    Your personal information is protected under POPIA and will only be used for the purpose of this permission slip. See our <Link href="/privacy" className="text-brand-gold hover:underline">Privacy Policy</Link>.
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
