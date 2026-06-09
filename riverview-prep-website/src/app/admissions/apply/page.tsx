'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecondaryBanner from '@/components/SecondaryBanner';
import { createClient } from '@/lib/supabase-client';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const grades = ['Grade 000', 'Grade 00', 'Grade 0', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];

const steps = ['Student Info', 'Parent Info', 'Additional Info', 'Review & Submit'];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    student_first_name: '', student_last_name: '', student_dob: '', grade_applying: '', gender: '',
    parent_first_name: '', parent_last_name: '', parent_email: '', parent_phone: '',
    address_line1: '', address_city: '', previous_school: '', medical_notes: '',
    consent: false,
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = createClient();

  const update = (field: string, value: string | boolean) => setForm(p => ({ ...p, [field]: value }));

  const canProceed = () => {
    if (step === 0) return form.student_first_name && form.student_last_name && form.grade_applying;
    if (step === 1) return form.parent_first_name && form.parent_last_name && form.parent_email && form.parent_phone;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.consent) return;
    setStatus('submitting');
    const { error } = await supabase.from('enrolment_applications').insert({
      student_first_name: form.student_first_name,
      student_last_name: form.student_last_name,
      student_dob: form.student_dob || null,
      grade_applying: form.grade_applying,
      gender: form.gender || null,
      parent_first_name: form.parent_first_name,
      parent_last_name: form.parent_last_name,
      parent_email: form.parent_email,
      parent_phone: form.parent_phone,
      address_line1: form.address_line1 || null,
      address_city: form.address_city || null,
      previous_school: form.previous_school || null,
      medical_notes: form.medical_notes || null,
      status: 'pending',
    });
    if (error) { setStatus('error'); setErrorMsg(error.message); }
    else { setStatus('success'); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm";
  const labelClass = "block text-xs font-bold text-brand-green/80 mb-1.5";

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner title="Online Application" subtitle="DIGITAL ENROLMENT REGISTRATION" image="/images/banner.jpg" />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">

          {status === 'success' ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-brand-green mb-2">Application Submitted!</h2>
              <p className="text-brand-green/70 mb-4">Thank you, {form.parent_first_name}. We&apos;ve received your application for {form.student_first_name} for {form.grade_applying}.</p>
              <p className="text-brand-green/50 text-sm mb-8">Our admissions team will review your application and contact you within 5–7 business days. Please remember to pay the R200 application fee and submit required documents to the school office.</p>
              <Link href="/admissions" className="px-8 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition-all">Back to Admissions</Link>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      i === step ? 'bg-brand-green text-white' : i < step ? 'bg-brand-gold/20 text-brand-green' : 'bg-brand-cream text-brand-green/30'
                    }`}>
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{i + 1}</span>
                      <span className="hidden sm:inline">{s}</span>
                    </div>
                    {i < steps.length - 1 && <div className="w-6 h-px bg-brand-green/10" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 0: Student Info */}
              {step === 0 && (
                <div className="bg-white p-8 rounded-[2rem] border border-brand-green/5 shadow-lg space-y-4">
                  <h3 className="text-xl font-bold text-brand-green mb-4">Student Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>First Name *</label><input type="text" required className={inputClass} value={form.student_first_name} onChange={e => update('student_first_name', e.target.value)} /></div>
                    <div><label className={labelClass}>Last Name *</label><input type="text" required className={inputClass} value={form.student_last_name} onChange={e => update('student_last_name', e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className={labelClass}>Date of Birth</label><input type="date" className={inputClass} value={form.student_dob} onChange={e => update('student_dob', e.target.value)} /></div>
                    <div><label className={labelClass}>Grade Applying For *</label><select required className={inputClass} value={form.grade_applying} onChange={e => update('grade_applying', e.target.value)}><option value="">Select...</option>{grades.map(g => <option key={g}>{g}</option>)}</select></div>
                    <div><label className={labelClass}>Gender</label><select className={inputClass} value={form.gender} onChange={e => update('gender', e.target.value)}><option value="">Select...</option><option>Male</option><option>Female</option></select></div>
                  </div>
                </div>
              )}

              {/* Step 1: Parent Info */}
              {step === 1 && (
                <div className="bg-white p-8 rounded-[2rem] border border-brand-green/5 shadow-lg space-y-4">
                  <h3 className="text-xl font-bold text-brand-green mb-4">Parent / Guardian Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>First Name *</label><input type="text" required className={inputClass} value={form.parent_first_name} onChange={e => update('parent_first_name', e.target.value)} /></div>
                    <div><label className={labelClass}>Last Name *</label><input type="text" required className={inputClass} value={form.parent_last_name} onChange={e => update('parent_last_name', e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Email *</label><input type="email" required className={inputClass} value={form.parent_email} onChange={e => update('parent_email', e.target.value)} /></div>
                    <div><label className={labelClass}>Phone *</label><input type="tel" required className={inputClass} value={form.parent_phone} onChange={e => update('parent_phone', e.target.value)} /></div>
                  </div>
                </div>
              )}

              {/* Step 2: Additional Info */}
              {step === 2 && (
                <div className="bg-white p-8 rounded-[2rem] border border-brand-green/5 shadow-lg space-y-4">
                  <h3 className="text-xl font-bold text-brand-green mb-4">Additional Information</h3>
                  <div><label className={labelClass}>Residential Address</label><input className={inputClass} value={form.address_line1} onChange={e => update('address_line1', e.target.value)} placeholder="Street address" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>City / Town</label><input className={inputClass} value={form.address_city} onChange={e => update('address_city', e.target.value)} placeholder="e.g., Malelane" /></div>
                    <div><label className={labelClass}>Previous School</label><input className={inputClass} value={form.previous_school} onChange={e => update('previous_school', e.target.value)} placeholder="If applicable" /></div>
                  </div>
                  <div><label className={labelClass}>Medical Notes / Allergies</label><textarea rows={3} className={inputClass + ' resize-none'} value={form.medical_notes} onChange={e => update('medical_notes', e.target.value)} placeholder="Any conditions the school should be aware of..." /></div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="bg-white p-8 rounded-[2rem] border border-brand-green/5 shadow-lg space-y-6">
                  <h3 className="text-xl font-bold text-brand-green mb-4">Review Your Application</h3>
                  {[
                    { label: 'Student', value: `${form.student_first_name} ${form.student_last_name}` },
                    { label: 'Grade Applying', value: form.grade_applying },
                    { label: 'Date of Birth', value: form.student_dob || '—' },
                    { label: 'Parent', value: `${form.parent_first_name} ${form.parent_last_name}` },
                    { label: 'Email', value: form.parent_email },
                    { label: 'Phone', value: form.parent_phone },
                    { label: 'Address', value: form.address_line1 || '—' },
                    { label: 'Previous School', value: form.previous_school || '—' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between border-b border-brand-green/5 pb-2">
                      <span className="text-xs font-bold text-brand-green/50 uppercase">{item.label}</span>
                      <span className="text-sm text-brand-green font-semibold">{item.value}</span>
                    </div>
                  ))}

                  <div className="p-4 bg-brand-cream/50 rounded-xl border border-brand-green/5">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" required checked={form.consent} onChange={e => update('consent', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-brand-green/20 text-brand-gold focus:ring-brand-gold shrink-0" />
                      <span className="text-xs text-brand-green/70 leading-relaxed">
                        I confirm that all information provided is true and accurate. I understand that an application fee of R200 is required to process this application. I consent to Riverview Preparatory School processing this personal information in accordance with POPIA for the purpose of this enrolment application.
                      </span>
                    </label>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-xs"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {step > 0 ? (
                  <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-6 py-3 border border-brand-green/10 rounded-xl text-brand-green/60 font-bold text-sm hover:bg-brand-cream transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}
                {step < 3 ? (
                  <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl font-bold text-sm hover:bg-brand-green/90 disabled:opacity-50 transition-all">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={status === 'submitting' || !form.consent} className="flex items-center gap-2 px-8 py-3 bg-brand-gold text-white rounded-xl font-bold hover:bg-brand-gold/90 disabled:opacity-50 transition-all">
                    {status === 'submitting' ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Application'}
                  </button>
                )}
              </div>

              <p className="text-center text-[10px] text-brand-green/30 mt-6">
                After submitting, please deliver required documents (birth certificate, clinic card, latest report, parent IDs) to the school office.
              </p>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
