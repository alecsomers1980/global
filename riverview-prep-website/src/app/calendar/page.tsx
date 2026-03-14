"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight, Filter, MapPin, Ticket } from "lucide-react";
import SecondaryBanner from "@/components/SecondaryBanner";

const events = [
  { date: "16 Mar", title: "Parent Interviews — Senior Primary", location: "Riverview Prep", type: "Academic" },
  { date: "18 Mar", title: "Netball & Rugby vs Curro Nelspruit", location: "Away", type: "Sports" },
  { date: "19 Mar", title: "School Photo Day", location: "Campus", type: "Academic" },
  { date: "20 Mar", title: "Netball & Rugby vs Uplands", location: "Away", type: "Sports" },
  { date: "24 Mar", title: '"Oliver with a Twist" — Dinner Theatre', location: "School Hall", type: "Culture" },
  { date: "25 Mar", title: '"Oliver with a Twist" — Dinner Theatre', location: "School Hall", type: "Culture" },
  { date: "26 Mar", title: '"Oliver with a Twist" — General Seating', location: "School Hall", type: "Culture" },
  { date: "25 Jul", title: "School Golf Day — Malelane Golf Club", location: "Malelane", type: "Community" },
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CalendarPage() {
  const [filter, setFilter] = useState("All");

  const filteredEvents = filter === "All" ? events : events.filter(e => e.type === filter);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SecondaryBanner 
        title="Interactive Calendar" 
        subtitle="School Pulse & Events"
      />

      {/* Calendar Interface */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Calendar Grid (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                   <h2 className="text-3xl font-bold">October <span className="drama-text text-brand-gold">2026</span></h2>
                   <div className="flex items-center gap-2">
                      <button className="p-2 bg-brand-cream rounded-full hover:bg-brand-green hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-brand-cream rounded-full hover:bg-brand-green hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                    <Filter className="w-4 h-4 text-brand-green/40" />
                    {["All", "Sports", "Academic", "Culture", "Community"].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                          filter === f ? "bg-brand-green text-white" : "bg-brand-cream text-brand-green/60 hover:bg-brand-green/10"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-brand-green/5 border border-brand-green/10 rounded-[2rem] overflow-hidden shadow-sm">
                 {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                   <div key={day} className="bg-brand-cream/30 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-brand-green/40">
                      {day}
                   </div>
                 ))}
                 {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white min-h-[120px] p-4 opacity-20" />
                 ))}
                 {days.map(day => (
                    <div key={day} className="bg-white min-h-[120px] p-4 group hover:bg-brand-cream/50 transition-colors cursor-crosshair">
                       <span className="text-sm font-bold opacity-30 group-hover:opacity-100 transition-opacity">{day}</span>
                       {day === 16 && (
                         <div className="mt-2 p-2 bg-brand-green text-white text-[9px] font-bold rounded-lg uppercase tracking-tight leading-none">
                            Parent Interviews
                         </div>
                       )}
                       {day === 19 && (
                         <div className="mt-2 p-2 bg-brand-green text-white text-[9px] font-bold rounded-lg uppercase tracking-tight leading-none">
                            Photo Day
                         </div>
                       )}
                       {(day === 24 || day === 25) && (
                         <div className="mt-2 p-2 bg-brand-gold text-white text-[9px] font-bold rounded-lg uppercase tracking-tight leading-none">
                            Oliver — Dinner Theatre
                         </div>
                       )}
                       {day === 26 && (
                         <div className="mt-2 p-2 bg-brand-gold text-white text-[9px] font-bold rounded-lg uppercase tracking-tight leading-none">
                            Oliver — General
                         </div>
                       )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Event Stack & Featured Event */}
             <div className="space-y-8">
               {/* Oliver with a Twist Featured Card */}
               <Link href="/events/oliver-with-a-twist" className="group block">
                 <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white hover:shadow-2xl transition-all duration-500">
                   <div className="relative h-72">
                     <Image
                       src="/images/oliver-with-a-twist.jpg"
                       alt="Oliver with a Twist"
                       fill
                       className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-brand-green/90 via-brand-green/20 to-transparent" />
                     <div className="absolute top-4 left-4">
                       <span className="px-3 py-1 bg-brand-gold text-white text-[9px] font-black uppercase tracking-widest rounded-full">Featured Event</span>
                     </div>
                     <div className="absolute bottom-6 left-6 right-6 text-white">
                       <p className="text-[9px] uppercase tracking-widest text-brand-gold font-bold mb-1">24 – 26 March · 18:00</p>
                       <h3 className="text-xl font-bold leading-tight mb-3">Oliver with a Twist</h3>
                       <div className="flex items-center gap-2 text-white/70 text-xs">
                         <MapPin className="w-3 h-3" />
                         Riverview Prep School Hall
                       </div>
                     </div>
                   </div>
                   <div className="bg-brand-green text-white p-4 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs font-bold">
                       <Ticket className="w-3.5 h-3.5 text-brand-gold" />
                       <span>R80 – R280 per person</span>
                     </div>
                     <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold group-hover:translate-x-1 transition-transform">View Details →</span>
                   </div>
                 </div>
               </Link>

                <div>
                   <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-brand-green/40">Upcoming Events</h4>
                   <div className="space-y-3">
                      {filteredEvents.slice(0, 5).map((event, i) => (
                        <div key={i} className="p-5 bg-brand-cream border border-brand-green/5 rounded-[1.5rem] hover:border-brand-gold/30 hover:bg-white hover:shadow-md transition-all group">
                           <div className="text-[9px] uppercase font-bold tracking-[0.2em] text-brand-gold mb-1">{event.type} • {event.date}</div>
                           <h4 className="font-bold mb-1.5">{event.title}</h4>
                           <div className="flex items-center gap-2 text-xs opacity-60">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="p-8 bg-brand-green rounded-[2rem] text-white">
                   <h4 className="font-bold uppercase tracking-widest text-[10px] text-brand-gold mb-6">Live Pulse</h4>
                   <div className="space-y-4 font-mono text-[10px] opacity-80 leading-relaxed">
                      <p className="border-l-2 border-brand-gold/40 pl-4">
                        [NOTICE] School Photo Day — 19 March. Full uniform required.
                      </p>
                      <p className="border-l-2 border-brand-gold/40 pl-4">
                        [CULTURE] Oliver with a Twist tickets: R280 (dinner) or R80 (general).
                      </p>
                      <p className="border-l-2 border-brand-gold/40 pl-4">
                        [SPORTS] Selati Fun Run entry deadline: 16 March. R60 entry fee.
                      </p>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
