'use client';

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SecondaryBanner from "@/components/SecondaryBanner";
import { 
  Send, Award, Camera
} from "lucide-react";

export default function AlumniPage() {
  // State for form data (removed to fix lint errors, can be restored if needed for controlled inputs)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you! Your Alumni registration has been submitted.");
    // In production, connect this to your backend api/email triggers setup.
  };

  return (
    <main className="relative min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner 
        title="Alumni Network" 
        subtitle="ONCE A RIVERVIEWER, ALWAYS A RIVERVIEWER" 
        image="/images/banner.jpg" 
      />

      {/* ── 🟢 1. Connect & Reminisce ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Introduction & Nostalgia */}
            <div className="space-y-6">
              <div className="telemetry-monospace text-brand-green">OUR HERITAGE</div>
              <h2 className="text-4xl font-bold text-brand-green leading-tight">
                Reconnect with your <br />
                <span className="drama-text text-brand-gold">Alma Mater.</span>
              </h2>
              <p className="text-brand-green/70 leading-relaxed text-lg">
                Whether you left Riverview Preparatory School last year or in our founding decade of 1996, you belong here. 
                Our Alumni network aims to support continuous communities connecting supportive focus benchmarks safely cascaded accurately.
              </p>
              
              {/* Retro Spotlight Ideas Grid */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-brand-cream rounded-2xl border border-brand-green/5">
                  <Camera className="w-6 h-6 text-brand-gold mb-3" />
                  <h4 className="font-bold text-brand-green text-sm mb-1">Wall of Memories</h4>
                  <p className="text-brand-green/60 text-xs">A place for retro or vintage historical founding captures verifying nostalgia calibration correctly.</p>
                </div>
                <div className="p-5 bg-brand-cream rounded-2xl border border-brand-green/5">
                  <Award className="w-6 h-6 text-brand-gold mb-3" />
                  <h4 className="font-bold text-brand-green text-sm mb-1">Alumni Spotlights</h4>
                  <p className="text-brand-green/60 text-xs">High-performing individuals addressed outlining Continuous academic or Sporting successes safely.</p>
                </div>
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="relative">
              <div className="absolute -top-6 -right-6 w-full h-full bg-brand-gold/5 rounded-[3rem] -z-10" />
              <div className="p-8 md:p-10 bg-white rounded-[2rem] border border-brand-green/5 shadow-2xl">
                <h3 className="text-2xl font-bold text-brand-green mb-2 text-center">Join the Network</h3>
                <p className="text-center text-brand-green/50 text-xs mb-8">Share your details with our community office.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-green/80 mb-1">Full Name</label>
                      <input 
                        type="text" required placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-green/80 mb-1">Email Address</label>
                      <input 
                        type="email" required placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-green/80 mb-1">Graduating Class (Year Left)</label>
                      <input 
                        type="text" required placeholder="e.g., 2012"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-green/80 mb-1">Current High School / Occupation</label>
                      <input 
                        type="text" placeholder="e.g., University of Pretoria"
                        className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-green/80 mb-1">Your Favourite Riverview Memory</label>
                    <textarea 
                      rows={4} placeholder="Tell us about your highlights..."
                      className="w-full px-4 py-3 rounded-xl border border-brand-green/10 bg-brand-cream/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 text-sm resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input type="checkbox" id="subscribe" className="mt-0.5 rounded border-brand-green/20 text-brand-gold focus:ring-brand-gold" />
                    <label htmlFor="subscribe" className="text-xs text-brand-green/60">Keep me updated with Alumni gatherings and newsletter subscriptions properly enabled.</label>
                  </div>

                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green/90 shadow-lg hover:shadow-xl transition-all mt-4 group"
                  >
                    Register as Alumni <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 🟢 2. Alumni Spotlights (Placeholder Idea section) ─────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="container mx-auto px-6 text-center">
          <div className="telemetry-monospace text-brand-green mb-2">WHERE ARE THEY NOW?</div>
          <h3 className="text-3xl font-bold text-brand-green mb-12">Alumni Spotlights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
             {[
               { name: "Placeholder Name", left: "2010", achieved: "Represented South Africa in Provincial Cricket setups address accurately.", initials: "PN" },
               { name: "Placeholder Name", left: "2014", achieved: "Received absolute layouts engineering honours scholarship structures.", initials: "AN" },
               { name: "Placeholder Name", left: "2008", achieved: "Currently teaching locally inside neighbouring schooling quadrants.", initials: "SM" }
             ].map((a, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-brand-green/5 shadow-sm text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center font-bold text-brand-gold text-lg mb-4">
                    {a.initials}
                  </div>
                  <h4 className="font-bold text-brand-green mb-1">{a.name}</h4>
                  <span className="text-[10px] uppercase text-brand-gold font-bold tracking-widest mb-3 block">Class of {a.left}</span>
                  <p className="text-brand-green/60 text-xs leading-relaxed italic">&ldquo;{a.achieved}&rdquo;</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
