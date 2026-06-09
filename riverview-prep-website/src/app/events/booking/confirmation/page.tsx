'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase-client';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const payStatus = searchParams.get('status');
  const supabase = createClient();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      supabase.from('event_bookings').select('*').eq('id', bookingId).single().then(({ data }) => {
        setBooking(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const isSuccess = payStatus === 'success';

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-lg text-center">
          {loading ? (
            <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto" />
          ) : (
            <div className="bg-white p-10 rounded-[2rem] border border-brand-green/5 shadow-xl">
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h1 className="text-2xl font-bold text-brand-green mb-2">Payment Successful!</h1>
                  <p className="text-brand-green/70 mb-6">Your booking has been confirmed. You will receive a confirmation email shortly.</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                  <h1 className="text-2xl font-bold text-brand-green mb-2">Payment Cancelled</h1>
                  <p className="text-brand-green/70 mb-6">Your payment was not completed. If this was an error, please try again or contact the school office.</p>
                </>
              )}

              {booking && (
                <div className="bg-brand-cream p-6 rounded-2xl text-left space-y-3 mb-8">
                  <h3 className="font-bold text-brand-green">Booking Summary</h3>
                  <div className="text-sm text-brand-green/70 space-y-1">
                    <p><strong>Event:</strong> {booking.event_title}</p>
                    <p><strong>Tickets:</strong> {booking.ticket_tier} × {booking.quantity}</p>
                    <p><strong>Total:</strong> R{booking.amount_total}</p>
                    <p><strong>Reference:</strong> {booking.id}</p>
                    {booking.payfast_status && <p><strong>Payment:</strong> {booking.payfast_status}</p>}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/events" className="px-8 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 transition-all">View Events</Link>
                <Link href="/contact" className="px-8 py-3 border border-brand-green/10 text-brand-green font-bold rounded-xl hover:bg-brand-cream transition-all">Contact Office</Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
