'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SecondaryBanner from "@/components/SecondaryBanner";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ArrowRight,
  Users,
  Star,
  Phone,
  Mail,
  Globe,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";

interface TicketOption {
  type: string;
  price: string;
  priceLabel: string;
  dates: string;
  includes: string[];
  highlight: boolean;
  badge?: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  venue: string;
  category: string;
  images: { url: string; is_primary: boolean }[];
  schedules: { date: string; time: string; cost?: number }[];
  ticket_options: TicketOption[];
  slug: string;
  booking_info: { type: 'phone' | 'email' | 'url'; value: string };
}

export default function DynamicEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (params.slug) {
      fetchEvent();
    }
  }, [params.slug]);

  async function fetchEvent() {
    setLoading(true);
    try {
      // Try fetching by slug first
      let { data, error: firstError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', params.slug)
        .single();
      
      // Fallback to ID if not found by slug (supports legacy links)
      if (firstError || !data) {
        const { data: idData, error: idError } = await supabase
          .from('events')
          .select('*')
          .eq('id', params.slug)
          .single();
        
        if (idError) throw idError;
        data = idData;
      }

      setEvent(data);
    } catch (err: any) {
      console.error("Error fetching event:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-40 gap-4 opacity-50">
          <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-green">Loading Production...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-40 px-6 text-center">
          <h2 className="text-3xl font-bold text-brand-green mb-4">Event Not Found</h2>
          <p className="text-brand-green/60 mb-8 max-w-md">The event you are looking for might have been moved or is no longer available.</p>
          <Link href="/calendar" className="px-8 py-3 bg-brand-gold text-white font-bold rounded-full">Back to Calendar</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryImage = event.images?.find(img => img.is_primary)?.url || event.images?.[0]?.url || "/images/placeholder-event.jpg";
  const displaySchedules = event.schedules || [];
  const displayTickets = event.ticket_options || [];
  const booking = event.booking_info || { type: 'phone', value: '+27137900000' };

  const bookingHref = booking.type === 'phone' ? `tel:${booking.value}` : 
                      booking.type === 'email' ? `mailto:${booking.value}` : booking.value;
  
  const BookingIcon = booking.type === 'phone' ? Phone : 
                      booking.type === 'email' ? Mail : Globe;

  const bookingLabel = booking.type === 'phone' ? 'Call the School' : 
                       booking.type === 'email' ? 'Email Enquiry' : 'Book Online';

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <SecondaryBanner title={event.title} subtitle="Event Spotlight" />

      {/* ── Quick Details Strip (Moved & Restyled) ── */}
      <section className="bg-brand-green py-8 border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-white">
              <Calendar className="w-5 h-5 text-brand-gold" />
              <div>
                <div className="text-[9px] uppercase tracking-widest font-black opacity-40">Dates</div>
                <div className="font-bold text-sm">
                  {displaySchedules.length > 0 ? displaySchedules.map(s => s.date).join(', ') : 'TBA'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Clock className="w-5 h-5 text-brand-gold" />
              <div>
                <div className="text-[9px] uppercase tracking-widest font-black opacity-40">Time</div>
                <div className="font-bold text-sm">
                  {displaySchedules[0]?.time || 'TBA'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <MapPin className="w-5 h-5 text-brand-gold" />
              <div>
                <div className="text-[9px] uppercase tracking-widest font-black opacity-40">Venue</div>
                <div className="font-bold text-sm">{event.venue || 'School Grounds'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── About Content ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="telemetry-monospace text-brand-green">ABOUT THE EVENT</div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                Join us for{" "}
                <span className="drama-text text-brand-gold">{event.title}.</span>
              </h2>
              <div className="space-y-6 text-brand-green/70 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <a
                  href={bookingHref}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-gold text-white font-bold rounded-full hover:bg-brand-gold/90 transition-all hover:shadow-lg"
                >
                  <BookingIcon className="w-4 h-4" />
                  {booking.type === 'url' ? 'Book Tickets' : bookingLabel}
                </a>
                <a
                  href="tel:+27137900000"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-brand-green/10 text-brand-green font-semibold rounded-full hover:bg-brand-green/5 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call School
                </a>
              </div>
            </div>

            {/* Side Image / Stats */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-full h-full bg-brand-gold/10 rounded-[3rem] -z-10" />
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <Image
                  src={primaryImage}
                  alt={event.title}
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-green/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                   <p className="font-bold text-lg leading-tight italic">
                    &ldquo;Riverview events are experiences that bring our community together.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dynamic Ticketing Section ── */}
      {displayTickets.length > 0 && (
        <section id="tickets" className="py-24 bg-brand-cream scroll-mt-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="telemetry-monospace text-brand-green mb-4">TICKETING</div>
              <h2 className="text-3xl md:text-5xl font-bold">
                Choose Your <span className="drama-text text-brand-gold">Experience.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {displayTickets.map((ticket, i) => (
                <div
                  key={i}
                  className={`relative rounded-[2.5rem] p-10 flex flex-col ${
                    ticket.highlight
                      ? "bg-brand-green text-white shadow-2xl"
                      : "bg-white border border-brand-green/10 shadow-lg"
                  }`}
                >
                  {ticket.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-5 py-2 bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        {ticket.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${ticket.highlight ? "text-brand-gold/80" : "text-brand-green/40"}`}>
                      {ticket.dates}
                    </p>
                    <h3 className={`text-2xl font-bold mb-4 ${ticket.highlight ? "text-white" : "text-brand-green"}`}>
                      {ticket.type}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-black ${ticket.highlight ? "text-brand-gold" : "text-brand-green"}`}>
                        {ticket.price}
                      </span>
                      <span className={`text-sm font-semibold ${ticket.highlight ? "text-white/60" : "text-brand-green/40"}`}>
                        {ticket.priceLabel}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 flex-1 mb-8">
                    {ticket.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${ticket.highlight ? "bg-brand-gold/20" : "bg-brand-green/10"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${ticket.highlight ? "bg-brand-gold" : "bg-brand-green"}`} />
                        </div>
                        <span className={`text-sm leading-relaxed ${ticket.highlight ? "text-white/80" : "text-brand-green/70"}`}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={bookingHref}
                    target={booking.type === 'url' ? '_blank' : undefined}
                    rel={booking.type === 'url' ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-sm transition-all ${
                      ticket.highlight ? "bg-brand-gold text-white hover:bg-brand-gold/90" : "bg-brand-green text-white hover:bg-brand-green/90"
                    }`}
                  >
                    <BookingIcon className="w-4 h-4" />
                    {booking.type === 'url' ? 'Book Now' : bookingLabel}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact Section (Light Background) ── */}
      <section className="py-24 bg-brand-cream border-t border-brand-green/5">
        <div className="container mx-auto px-6 text-center lg:text-left">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="telemetry-monospace text-brand-green">VENUE & CONTACT</div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight text-brand-green">
                Find <span className="drama-text text-brand-gold">Us.</span>
              </h2>
              <div className="space-y-4 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-brand-green/10 shadow-sm">
                   <MapPin className="text-brand-gold" />
                   <p className="font-semibold text-brand-green">{event.venue || 'Riverview Prep School'}</p>
                </div>
                <a href={bookingHref} className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-brand-green/10 shadow-sm hover:shadow-md transition-shadow">
                   <BookingIcon className="text-brand-gold" />
                   <p className="font-semibold text-brand-green">{booking.value}</p>
                </a>
              </div>
            </div>
            
            <div className="bg-brand-green p-10 rounded-[2.5rem] shadow-xl text-center text-white">
              <h3 className="text-2xl font-bold mb-4">View Full Calendar</h3>
              <p className="text-white/60 mb-8">See all upcoming events and important dates on our interactive calendar.</p>
              <Link href="/calendar" className="inline-flex items-center gap-3 px-8 py-4 bg-brand-gold text-white font-bold rounded-full hover:bg-brand-gold/90 transition-all">
                Open Calendar <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
