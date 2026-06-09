'use client';

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SecondaryBanner from "@/components/SecondaryBanner";
import { createClient } from "@/lib/supabase-client";
import { Send, Award, Camera, CheckCircle2, AlertCircle } from "lucide-react";

interface Alumnus {
  id: string;
  full_name: string;
  email: string;
  graduation_year: number;
  current_location: string;
  memories: string;
}

export default function AlumniPage() {
  const [form, setForm] = useState({ full_name: '', email: '', graduation_year: '', current_location: '', memories: '', subscribe: false });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [spotlights, setSpotlights] = useState<Alumnus[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('alumni').select('*').order('created_at', { ascending: false }).limit(6).then(({ data }) => {
      if (data) setSpotlights(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase.from('alumni').insert({
      full_name: form.full_name,
      email: form.email,
      graduation_year: parseInt(form.graduation_year) || null,
      current_location: form.current_location,
      memories: form.memories,
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setForm({ full_name: '', email: '', graduation_year: '', current_location: '', memories: '', subscribe: false });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <main className="relative min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner
        title="Alumni Network"
        subtitle="ONCE A RIVERVIEWER, ALWAYS A RIVERVIEWER"
        image="/images/banner.jpg"
      />

      {/* ── 1. Connect & Reminisce ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Introduction */}
            <div className="space-y-6">
              <div className="telemetry-monospace text-brand-green">OUR HERITAGE</div>
              <h2 className="text-4xl font-bold text-brand-green leading-tight">
                Reconnect with your <br />
                <span className="drama-text text-brand-gold">Alma Mater.</span>
              </h2>
              <p className="text-brand-green/70 leading-relaxed text-lg">
                Whether you left Riverview Preparatory School last year or were part of our founding classes in 1996,
                you belong here. Our Alumni network keeps you connected to the school community, celebrates your
                achievements, and invites you to inspire the next generation of Riverviewers.
              </p>

              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-brand-cream rounded-2xl border border-brand-green/5">
                  <Camera className="w-6 h-6 text-brand-gold mb-3" />
                  <h4 className="font-bold text-brand-green text-sm mb-1">Wall of Memories</h4>
                  <p className="text-brand-green/60 text-xs">Share your favourite school photos and relive the moments that shaped your childhood.</p>
                </div>
                <div className="p-5 bg-brand-cream rounded-2xl border border-brand-green/5">
                  <Award className="w-6 h-6 text-brand-gold mb-3" />
                  <h4 className="font-bold text-brand-green text-sm mb-1">Alumni Spotlights</h4>
                  <p className="text-brand-green/60 text-xs">We celebrate alumni who are making a difference — in academics, sport, business, and the community.</p>
                </div>
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-full h-full bg-brand-gold/5 rounded-[3rem] -z-10" />
              <div className="p-8 md:p-10 bg-white rounded-[2rem] border border-brand-green/5 shadow-2xl">
                <h3 className="text-2xl font-bold text-brand-green mb-2 text-center">Join the Network</h3>
                <p className="text-center text-brand-green/50 text-xs mb-8">Share your details with our community office.</p>

                {status === 'success' ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                    <h4 className="text-xl font-bold text-brand-green mb-2">Welcome Back!</h4>
                    <p className="text-brand-green/60 text-sm">Your registration has been received. We&apos;ll be in touch with alumni news and events.</p>
                    <button onClick={() => setStatus('idle')} className="mt-6 px-6 py-2 bg-brand-green text-white font-bold rounded-xl text-sm hover:bg-brand-green/90 transition-all">
                      Register Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-green/80 mb-1">Full Name *</label>
                        <input
                          type="text" required placeholder="John Doe"
                          value={form.full_name}
                          onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-green/80 mb-1">Email Address *</label>
                        <input
                          type="email" required placeholder="john@example.com"
                          value={form.email}
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-green/80 mb-1">Graduating Class *</label>
                        <input
                          type="text" required placeholder="e.g., 2012"
                          value={form.graduation_year}
                          onChange={e => setForm(p => ({ ...p, graduation_year: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-green/80 mb-1">Current School / Occupation</label>
                        <input
                          type="text" placeholder="e.g., University of Pretoria"
                          value={form.current_location}
                          onChange={e => setForm(p => ({ ...p, current_location: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-green/80 mb-1">Your Favourite Riverview Memory</label>
                      <textarea
                        rows={4} placeholder="Tell us about your highlights..."
                        value={form.memories}
                        onChange={e => setForm(p => ({ ...p, memories: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm resize-none"
                      />
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                      <input type="checkbox" id="subscribe" checked={form.subscribe} onChange={e => setForm(p => ({ ...p, subscribe: e.target.checked }))} className="mt-0.5 rounded border-brand-green/20 text-brand-gold focus:ring-brand-gold" />
                      <label htmlFor="subscribe" className="text-xs text-brand-green/60">Keep me updated with alumni gatherings and school newsletters.</label>
                    </div>

                    {status === 'error' && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg || 'Something went wrong. Please try again.'}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 shadow-lg hover:shadow-xl transition-all mt-4 group disabled:opacity-50"
                    >
                      {status === 'submitting' ? 'Registering...' : 'Register as Alumni'} <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Alumni Spotlights ──────────────────────────────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="container mx-auto px-6 text-center">
          <div className="telemetry-monospace text-brand-green mb-2">WHERE ARE THEY NOW?</div>
          <h3 className="text-3xl font-bold text-brand-green mb-12">Alumni Spotlights</h3>

          {spotlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {spotlights.map((a) => (
                <div key={a.id} className="bg-white p-8 rounded-3xl border border-brand-green/5 shadow-sm text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center font-bold text-brand-gold text-lg mb-4">
                    {getInitials(a.full_name)}
                  </div>
                  <h4 className="font-bold text-brand-green mb-1">{a.full_name}</h4>
                  <span className="text-[10px] uppercase text-brand-gold font-bold tracking-widest mb-3 block">Class of {a.graduation_year}</span>
                  <p className="text-brand-green/60 text-xs leading-relaxed italic">
                    {a.memories ? `"${a.memories.length > 120 ? a.memories.substring(0, 120) + '...' : a.memories}"` : a.current_location || 'Part of the Riverview family.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { initials: "?", year: "————", text: "Be the first to register! Join the Alumni Network above and your story could be featured here." },
                { initials: "?", year: "————", text: "We're building a community of Riverview alumni — sign up to be part of it." },
                { initials: "?", year: "————", text: "Your journey matters. Share your story with the Riverview community." },
              ].map((a, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-brand-green/5 shadow-sm text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center font-bold text-brand-gold text-lg mb-4">
                    {a.initials}
                  </div>
                  <h4 className="font-bold text-brand-green mb-1">Join the Network</h4>
                  <span className="text-[10px] uppercase text-brand-gold font-bold tracking-widest mb-3 block">Class of {a.year}</span>
                  <p className="text-brand-green/60 text-xs leading-relaxed italic">&ldquo;{a.text}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
