'use client';

import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecondaryBanner from '@/components/SecondaryBanner';
import { createClient } from '@/lib/supabase-client';
import { Upload, CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';

export default function GalleryUploadPage() {
  const [form, setForm] = useState({ submitter_name: '', submitter_email: '', event_name: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setErrorMsg('File too large — maximum 10MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrorMsg('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus('uploading');

    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from('images')
      .upload(`community/${filename}`, file);

    if (uploadErr) { setStatus('error'); setErrorMsg(uploadErr.message); return; }

    const { data: urlData } = supabase.storage.from('images').getPublicUrl(`community/${filename}`);
    const imageUrl = urlData?.publicUrl;

    if (!imageUrl) { setStatus('error'); setErrorMsg('Failed to get public URL'); return; }

    // Save to community_photos table
    const { error: insertErr } = await supabase.from('community_photos').insert({
      submitter_name: form.submitter_name,
      submitter_email: form.submitter_email,
      event_name: form.event_name || null,
      description: form.description || null,
      image_url: imageUrl,
      status: 'pending',
    });

    if (insertErr) { setStatus('error'); setErrorMsg(insertErr.message); }
    else { setStatus('success'); }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm";
  const labelClass = "block text-xs font-bold text-brand-green/80 mb-1.5";

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner title="Share Your Photos" subtitle="COMMUNITY GALLERY SUBMISSIONS" image="/images/banner.jpg" />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 max-w-xl">

          {status === 'success' ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-brand-green mb-2">Photo Submitted!</h2>
              <p className="text-brand-green/70 mb-4">Thank you, {form.submitter_name}! Your photo has been submitted for review.</p>
              <p className="text-brand-green/50 text-sm mb-8">Our team will review it and add it to the gallery. This usually takes 1–2 school days.</p>
              <Link href="/gallery" className="px-8 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition-all">View Gallery</Link>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2rem] border border-brand-green/5 shadow-lg">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-brand-green/5">
                <Camera className="w-8 h-8 text-brand-gold" />
                <div>
                  <h3 className="font-bold text-brand-green">Submit a Photo</h3>
                  <p className="text-brand-green/50 text-xs">Share your school event photos with the community</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Your Name *</label><input type="text" required className={inputClass} placeholder="Jane Doe" value={form.submitter_name} onChange={e => setForm(p => ({ ...p, submitter_name: e.target.value }))} /></div>
                  <div><label className={labelClass}>Your Email *</label><input type="email" required className={inputClass} placeholder="jane@example.com" value={form.submitter_email} onChange={e => setForm(p => ({ ...p, submitter_email: e.target.value }))} /></div>
                </div>
                <div><label className={labelClass}>Event / Activity</label><input className={inputClass} placeholder="e.g., Inter-house Athletics 2026" value={form.event_name} onChange={e => setForm(p => ({ ...p, event_name: e.target.value }))} /></div>

                {/* Photo upload */}
                <div>
                  <label className={labelClass}>Photo * (max 10MB)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      preview ? 'border-brand-gold/30 bg-brand-cream/30' : 'border-brand-green/10 hover:border-brand-gold/30 hover:bg-brand-cream/20'
                    }`}
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl" />
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-10 h-10 text-brand-green/20 mx-auto" />
                        <p className="text-brand-green/50 text-sm font-medium">Click to select a photo</p>
                        <p className="text-brand-green/30 text-xs">JPG, PNG or WebP • Max 10MB</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                </div>

                <div><label className={labelClass}>Description (optional)</label><textarea rows={3} className={inputClass + ' resize-none'} placeholder="Tell us about the moment you captured..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>

                <div className="p-4 bg-brand-cream/50 rounded-xl border border-brand-green/5">
                  <p className="text-xs text-brand-green/60 leading-relaxed">
                    By submitting, you confirm this photo was taken at a Riverview Prep event and you have permission to share it. Photos are reviewed before being published to the gallery.
                  </p>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-xs"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>
                )}

                <button type="submit" disabled={status === 'uploading' || !file} className="w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 shadow-lg disabled:opacity-50 transition-all">
                  {status === 'uploading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Submit Photo for Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
