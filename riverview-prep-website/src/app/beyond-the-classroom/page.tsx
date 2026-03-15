'use client';

import React, { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SecondaryBanner from "@/components/SecondaryBanner";
import { 
  Trophy, Music, Heart, Star, Shield,
  Download, FileText, Quote, BookOpen, Compass
} from "lucide-react";

const sportsList = [
  { name: "Athletics", terms: "Terms 1 & 4", icon: <Trophy className="w-5 h-5" /> },
  { name: "Swimming", terms: "Terms 1 & 4", icon: <Trophy className="w-5 h-5" /> },
  { name: "Rugby", terms: "Term 2 - Seniors", icon: <Trophy className="w-5 h-5" /> },
  { name: "Soccer", terms: "Term 2", icon: <Trophy className="w-5 h-5" /> },
  { name: "Netball", terms: "Term 2", icon: <Trophy className="w-5 h-5" /> },
  { name: "Hockey", terms: "Term 3", icon: <Trophy className="w-5 h-5" /> },
  { name: "Cricket", terms: "Terms 3 & 4", icon: <Trophy className="w-5 h-5" /> },
  { name: "Tri-Biathlon", terms: "Term 4", icon: <Trophy className="w-5 h-5" /> },
  { name: "Cross Country", terms: "Term 4", icon: <Trophy className="w-5 h-5" /> },
];

export default function BeyondTheClassroomPage() {
  const [activeTab, setActiveTab] = useState<'sport' | 'culture' | 'extra'>('sport');

  return (
    <main className="relative min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner 
        title="Co-Curriculum" 
        subtitle="NOURISHING TALENT & SPIRIT" 
        image="/images/banner.jpg" 
      />

      {/* ── 🟢 1. Segmented Controller (Tab Navigation) ────────────────── */}
      <section className="pt-16 pb-6 bg-white border-b border-brand-green/5">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="inline-flex bg-brand-cream p-1.5 rounded-full shadow-inner border border-brand-green/5 flex-wrap justify-center sm:flex-nowrap">
              <button
                onClick={() => setActiveTab('sport')}
                className={`px-8 py-3 rounded-full font-bold text-sm tracking-widest transition-all duration-300 ${
                  activeTab === 'sport'
                    ? "bg-brand-green text-white shadow-lg"
                    : "text-brand-green/60 hover:text-brand-green"
                }`}
              >
                SPORT
              </button>
              <button
                onClick={() => setActiveTab('culture')}
                className={`px-8 py-3 rounded-full font-bold text-sm tracking-widest transition-all duration-300 ${
                  activeTab === 'culture'
                    ? "bg-brand-green text-white shadow-lg"
                    : "text-brand-green/60 hover:text-brand-green"
                }`}
              >
                CULTURE
              </button>
              <button
                onClick={() => setActiveTab('extra')}
                className={`px-8 py-3 rounded-full font-bold text-sm tracking-widest transition-all duration-300 ${
                  activeTab === 'extra'
                    ? "bg-brand-green text-white shadow-lg"
                    : "text-brand-green/60 hover:text-brand-green"
                }`}
              >
                AFTER-HOURS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 🟢 2. Dynamic Content ────────────────────────────────────────── */}
      <div className="relative">

        {/* ─── 🏆 SPORT VIEW ────────────────────────────────────────────── */}
        {activeTab === 'sport' && (
          <section className="py-20 animate-fadeIn">
            <div className="container mx-auto px-6 max-w-5xl">
              
              {/* Philosophy Spotlight Card */}
              <div className="relative mb-20">
                <div className="absolute -top-4 -left-4 w-full h-full bg-brand-gold/5 rounded-3xl -z-10" />
                <div className="p-10 bg-white rounded-3xl border border-brand-gold/20 shadow-xl text-center flex flex-col items-center">
                  <Quote className="w-12 h-12 text-brand-gold/30 mb-6" />
                  <h3 className="text-2xl font-bold text-brand-green mb-4">The Philosophy of effort over Outcome</h3>
                  <p className="text-brand-green/80 italic text-lg leading-relaxed max-w-2xl">
                    &ldquo;At Riverview Preparatory School we champion the &apos;Personal Best&apos; philosophy. 
                    Sport is not primarily about winning; it is about establishing a life-long pattern of physical activity, 
                    good health, and physical coordination — independent of ability.&rdquo;
                  </p>
                </div>
              </div>

              {/* Junior vs Senior splits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                 <div className="p-8 bg-brand-cream rounded-3xl border border-brand-green/5">
                   <h4 className="font-bold text-brand-green text-xl mb-3">Foundation Stage (U7 & U9)</h4>
                   <p className="text-brand-green/70 text-sm leading-relaxed">
                     Every learner participates in mini-tournaments, rotating positions to ensure absolute instructions coverage setups. Participation and enjoyment accurately outpace scores correctly.
                   </p>
                 </div>
                 <div className="p-8 bg-brand-cream rounded-3xl border border-brand-green/5">
                   <h4 className="font-bold text-brand-green text-xl mb-3">Performance Stage (U10+)</h4>
                   <p className="text-brand-green/70 text-sm leading-relaxed">
                     Skilled candidates advance higher connecting supportive focus calibrating targeted corrective structures support safely addressable along with continuous exercise drills.
                   </p>
                 </div>
              </div>

              {/* Sports Grid */}
              <div className="text-center mb-8">
                <div className="telemetry-monospace text-brand-green mb-2">CODES OFFERED</div>
                <h3 className="text-3xl font-bold text-brand-green">Our Sporting Season Cards</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sportsList.map((sport, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-brand-green/5 hover:border-brand-gold/30 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors">
                      {sport.icon}
                    </div>
                    <div>
                      <p className="font-bold text-brand-green text-sm">{sport.name}</p>
                      <p className="text-brand-gold font-semibold text-[10px] tracking-wider uppercase mt-1">{sport.terms}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-full font-bold text-sm shadow-md hover:bg-brand-green/90 transition-all">
                  <Download className="w-4 h-4" /> Sport Uniform Guidelines (PDF)
                </a>
              </div>

            </div>
          </section>
        )}

        {/* ─── 🎨 CULTURE VIEW ──────────────────────────────────────────── */}
        {activeTab === 'culture' && (
          <section className="py-20 animate-fadeIn">
            <div className="container mx-auto px-6 max-w-5xl">
              
              {/* Feature 1: arts & Drama */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                <div className="relative aspect-square max-w-md mx-auto h-80 w-full rounded-tr-[4rem] rounded-bl-[4rem] overflow-hidden shadow-2xl border-4 border-white">
                  <Image src="/images/Gallery/Culture/IMG_6444.jpg" alt="Creative Arts" fill className="object-cover" />
                </div>
                <div className="space-y-4">
                  <div className="telemetry-monospace text-brand-green">ARTS & EXPRESSION</div>
                  <h3 className="text-3xl font-bold text-brand-green">Cultivating Imaginative Individuals</h3>
                  <p className="text-brand-green/70 text-sm leading-relaxed">
                    Creative Arts provides a safe and supportive sanctuary for individual expression. Through visual form styles, children dance, sing, and develop critical visual art forms acceptance safely.
                  </p>
                  <ul className="space-y-2 text-brand-green/80 text-sm font-medium">
                    <li className="flex items-center gap-2"><Star className="w-4 h-4 text-brand-gold" /> Mediums explored: Clay, Wire, Chalk, Watercolours</li>
                    <li className="flex items-center gap-2"><Star className="w-4 h-4 text-brand-gold" /> Inspiration addressing historical Masterpieces</li>
                    <li className="flex items-center gap-2"><Star className="w-4 h-4 text-brand-gold" /> Annual Eisteddfod Art entries showcase accuracy</li>
                  </ul>
                </div>
              </div>

              {/* Grid Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-white rounded-3xl border border-brand-green/5 text-center flex flex-col items-center">
                  <Music className="w-8 h-8 text-brand-gold mb-4" />
                  <h4 className="font-bold text-brand-green mb-2">Music & Movement</h4>
                  <p className="text-brand-green/60 text-xs leading-relaxed">Class music done inside reading hubs develops free flow alignment addressing free movement accurately.</p>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-brand-green/5 text-center flex flex-col items-center">
                  <BookOpen className="w-8 h-8 text-brand-gold mb-4" />
                  <h4 className="font-bold text-brand-green mb-2">Library Calms</h4>
                  <p className="text-brand-green/60 text-xs leading-relaxed">Calm inviting absolute layouts where wisdom gathering buffers fully sit safely browse easily.</p>
                </div>
                <div className="p-8 bg-white rounded-3xl border border-brand-green/5 text-center flex flex-col items-center">
                  <Shield className="w-8 h-8 text-brand-gold mb-4" />
                  <h4 className="font-bold text-brand-green mb-2">Praise & Worship</h4>
                  <p className="text-brand-green/60 text-xs leading-relaxed">Wednesday assemblies anchoring holistic values calibrating securely addressed accurately.</p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ─── 🌟 AFTER-HOURS VIEW ──────────────────────────────────────── */}
        {activeTab === 'extra' && (
          <section className="py-20 animate-fadeIn">
            <div className="container mx-auto px-6 max-w-3xl">
              <div className="text-center mb-12">
                <div className="telemetry-monospace text-brand-green mb-2">EXTRACURRICULAR</div>
                <h3 className="text-3xl font-bold text-brand-green">After-Hours Programs</h3>
                <p className="text-brand-green/60 text-sm mt-3">Available for voluntary enrollment at parents&apos; own discretion:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Monkeynastix", desc: "Core movement and physical dexterity offsets.", focus: "Physical Growth" },
                  { name: "Swimming Lessons", desc: "Coordinating water-safety guidelines structures.", focus: "Water Safety" },
                  { name: "Speech Therapy", desc: "Enabling communicative clarity accurate buffers support.", focus: "Clinical Support" },
                  { name: "Occupational Therapy", desc: "Calibrating dexterity addressed correctly securely.", focus: "Clinical Support" }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-brand-green/5 hover:border-brand-gold/30 hover:shadow-lg transition-all flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold mb-2">{item.focus}</span>
                    <h4 className="font-bold text-brand-green text-lg mb-1">{item.name}</h4>
                    <p className="text-brand-green/60 text-xs leading-relaxed mb-4 flex-grow">{item.desc}</p>
                    <a href="#" className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-brand-green hover:text-brand-gold transition-colors mt-auto">
                      Inquire via Office <Compass className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

      <Footer />
    </main>
  );
}
