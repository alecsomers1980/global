'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecondaryBanner from '@/components/SecondaryBanner';
import { createClient } from '@/lib/supabase-client';
import { Calendar, MapPin, Ticket, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface TicketOption {
  type: string; price: string; priceLabel: string; dates: string; includes: string[]; highlight: boolean; badge?: string;
}

interface EventData {
  id: string; title: string; venue: string; ticket_options: TicketOption[]; slug: string;
}

export default function BookEventPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'redirecting'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.slug) return;
    supabase.from('events').select('*').eq('slug', params.slug).single().then(({ data, error }) => {
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setEvent(data);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  if (loading) return <main className="min-h-screen bg-neutral-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></main>;
  if (notFound || !event) return <main className="min-h-screen bg-neutral-50"><Header /><div className="text-center py-32"><h2 className="text-2xl font-bold text-brand-green mb-2">Event Not Found</h2><Link href="/events" className="text-brand-gold hover:underline">← Back to Events</Link></div><Footer /></main>;

  const tiers = event?.ticket_options || [];
  const selectedTicket = tiers[selectedTier];
  const totalAmount = selectedTicket ? parseFloat(selectedTicket.price) * qty : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !event) return;
    setStatus('submitting');

    // Create booking record
    const { data: booking, error: bookingErr } = await supabase.from('event_bookings').insert({
      event_id: event.id,
      event_title: event.title,
      buyer_name: form.name,
      buyer_email: form.email,
      buyer_phone: form.phone || null,
      ticket_tier: selectedTicket.type,
      quantity: qty,
      amount_total: totalAmount,
      status: 'pending',
    }).select('id').single();

    if (bookingErr || !booking) { setStatus('idle'); setError(bookingErr?.message || 'Failed to create booking'); return; }

    setStatus('redirecting');

    // Create PayFast payment
    const res = await fetch('/api/payfast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalAmount,
        item_name: `${event.title} — ${selectedTicket.type} (x${qty})`,
        buyer_name: form.name,
        buyer_email: form.email,
        booking_id: booking.id,
      }),
    });

    const { paymentUrl, paymentData } = await res.json();

    // POST redirect to PayFast
    const payForm = document.createElement('form');
    payForm.method = 'POST';
    payForm.action = paymentUrl;
    payForm.style.display = 'none';
    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = value as string;
      payForm.appendChild(input);
    });
    document.body.appendChild(payForm);
    payForm.submit();
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm";
  const labelClass = "block text-xs font-bold text-brand-green/80 mb-1.5";

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner title="Book Tickets" subtitle={event.title} image="/images/banner.jpg" />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-brand-cream p-6 rounded-2xl mb-8 flex flex-wrap gap-6 text-sm text-brand-green/70">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-gold" />{event.title}</div>
            {event.venue && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-gold" />{event.venue}</div>}
          </div>

          {/* Ticket Selection */}
          {tiers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-brand-green mb-4 flex items-center gap-2"><Ticket className="w-5 h-5 text-brand-gold" />Select Tickets</h3>
              <div className="space-y-3">
                {tiers.map((tier, i) => (
                  <div
                    key={i}
                    onClick={() => { setSelectedTier(i); setQty(1); }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedTier === i ? 'border-brand-gold bg-brand-gold/5 shadow-md' : 'border-brand-green/5 bg-white hover:border-brand-green/10'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-brand-green">{tier.type}</h4>
                        <p className="text-xs text-brand-green/50">{tier.priceLabel} · {tier.dates}</p>
                        {tier.badge && <span className="inline-block mt-1 px-2 py-0.5 bg-brand-gold/20 text-brand-green text-[10px] font-bold rounded-full">{tier.badge}</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-brand-green">R{tier.price}</span>
                        {selectedTier === i && <span className="block text-xs text-brand-gold mt-1">Selected ✓</span>}
                      </div>
                    </div>
                    {selectedTier === i && tier.includes?.length > 0 && (
                      <ul className="mt-3 pt-3 border-t border-brand-green/5 space-y-1">
                        {tier.includes.map((inc, j) => <li key={j} className="text-xs text-brand-green/60">• {inc}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {selectedTicket && (
                <div className="mt-4 flex items-center gap-4 p-4 bg-white rounded-xl border border-brand-green/5">
                  <span className="text-xs font-bold text-brand-green/60 uppercase">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border border-brand-green/10 text-brand-green font-bold hover:bg-brand-cream">−</button>
                    <span className="w-10 text-center font-bold text-brand-green">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-full border border-brand-green/10 text-brand-green font-bold hover:bg-brand-cream">+</button>
                  </div>
                  <span className="ml-auto text-lg font-bold text-brand-green">R{totalAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Buyer Info Form */}
          {selectedTicket && (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-brand-green/5 shadow-lg space-y-4">
              <h3 className="text-lg font-bold text-brand-green mb-2">Your Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Full Name *</label><input type="text" required className={inputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" /></div>
                <div><label className={labelClass}>Email *</label><input type="email" required className={inputClass} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" /></div>
              </div>
              <div><label className={labelClass}>Phone</label><input type="tel" className={inputClass} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+27 82 123 4567" /></div>

              {error && <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-xs"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}

              <div className="flex items-start gap-3 p-4 bg-brand-cream/50 rounded-xl">
                <input type="checkbox" required id="terms" className="mt-0.5 rounded border-brand-green/20 text-brand-gold shrink-0" />
                <label htmlFor="terms" className="text-xs text-brand-green/60 leading-relaxed">I agree to the terms and conditions. Payment will be processed securely via PayFast. By proceeding, I consent to Riverview Prep processing my personal information for this booking.</label>
              </div>

              <button type="submit" disabled={status !== 'idle'} className="w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 shadow-lg disabled:opacity-50 transition-all">
                {status === 'submitting' ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Booking...</> :
                 status === 'redirecting' ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to PayFast...</> :
                 <>Proceed to Payment <ArrowRight className="w-4 h-4" /></>}
              </button>

              <p className="text-center text-[10px] text-brand-green/30">Powered by <span className="font-bold">PayFast</span> — Secure South African payments</p>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
