'use client';

import React, { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SecondaryBanner from "@/components/SecondaryBanner";
import { 
  Heart, Shield, 
  ChevronDown, FileText, Download,
  Compass, Lightbulb, Users
} from "lucide-react";

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<'preschool' | 'primary'>('preschool');
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);

  const togglePolicy = (id: string) => {
    setOpenPolicy(openPolicy === id ? null : id);
  };

  return (
    <main className="relative min-h-screen bg-neutral-50">
      <Header />
      <SecondaryBanner 
        title="Academics" 
        subtitle="SHAPING HEARTS & MINDS" 
        image="/images/banner.jpg" 
      />

      {/* ── 🟢 1. Segmented Controller (Tab Navigation) ────────────────── */}
      <section className="pt-16 pb-6 bg-white border-b border-brand-green/5">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="inline-flex bg-brand-cream p-1.5 rounded-full shadow-inner border border-brand-green/5">
              <button
                onClick={() => setActiveTab('preschool')}
                className={`px-8 py-3 rounded-full font-bold text-sm tracking-widest transition-all duration-300 ${
                  activeTab === 'preschool'
                    ? "bg-brand-green text-white shadow-lg"
                    : "text-brand-green/60 hover:text-brand-green"
                }`}
              >
                PRE-SCHOOL
              </button>
              <button
                onClick={() => setActiveTab('primary')}
                className={`px-8 py-3 rounded-full font-bold text-sm tracking-widest transition-all duration-300 ${
                  activeTab === 'primary'
                    ? "bg-brand-green text-white shadow-lg"
                    : "text-brand-green/60 hover:text-brand-green"
                }`}
              >
                PRIMARY SCHOOL
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 🟢 2. Content Sections (Conditional Rendering) ─────────────── */}
      <div className="relative">
        
        {/* ─── 🧸 PRE-SCHOOL VIEW ────────────────────────────────────────── */}
        {activeTab === 'preschool' && (
          <section className="py-20 animate-fadeIn">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left: Text Content */}
                <div className="space-y-6">
                  <div className="telemetry-monospace text-brand-gold">CUBS TO GRADE 0</div>
                  <h2 className="text-4xl font-bold text-brand-green leading-tight">
                    Nurturing First Steps on a <br />
                    <span className="drama-text text-brand-gold">Lifelong Journey.</span>
                  </h2>
                  <p className="text-brand-green/70 leading-relaxed text-lg">
                    Our Pre-School provides a creative and stimulating sanctuary where individual potential is recognised and celebrated.
                    Set in a beautiful garden setting designed for safe, enjoyable play, we balance exploration with structured learning
                    to equip children with vital cognitive, physical, emotional, and social anchors for a happy start.
                  </p>
                  
                  {/* Key Pillars Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="p-6 bg-white rounded-3xl border border-brand-green/5 shadow-sm hover:shadow-md transition-shadow">
                      <Heart className="w-8 h-8 text-rose-500 mb-4" />
                      <h3 className="font-bold text-lg text-brand-green mb-2">Dedicated Educators</h3>
                      <p className="text-brand-green/60 text-sm">Passionate qualified educators assisted by devoted teacher aides providing a warm ratio of care.</p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-brand-green/5 shadow-sm hover:shadow-md transition-shadow">
                      <Compass className="w-8 h-8 text-blue-500 mb-4" />
                      <h3 className="font-bold text-lg text-brand-green mb-2">Core Philosophy</h3>
                      <p className="text-brand-green/60 text-sm">We provide play-based layouts addressing coordinate instructions safely fully secured.</p>
                    </div>
                  </div>
                </div>

                {/* Right: Programs Cards */}
                <div className="bg-brand-cream p-10 rounded-[3rem] border border-brand-green/5 relative">
                  <h3 className="text-2xl font-bold text-brand-green mb-8 text-center">Development Grids</h3>
                  <div className="space-y-4">
                    {[
                      { grade: "Cubs", age: "18 Months – 3 Years", desc: "Sensory play, social skills and gross motor basics." },
                      { grade: "Grade 000", age: "3 – 4 Years", desc: "Formulation setups addressing age appropriate milestones." },
                      { grade: "Grade 00", age: "4 – 5 Years", desc: "Intentional play-based instructional setups benchmarks safely." },
                      { grade: "Grade 0", age: "5 – 6 Years", desc: "Targeted school-readiness preparations and basic arithmetic setup." }
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-brand-green/5 hover:border-brand-gold/30 transition-all group">
                        <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center font-black text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-brand-green">{p.grade} <span className="text-xs text-brand-gold font-normal">({p.age})</span></p>
                          <p className="text-brand-green/60 text-xs mt-1">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── 🏫 PRIMARY SCHOOL VIEW ────────────────────────────────────── */}
        {activeTab === 'primary' && (
          <section className="py-20 animate-fadeIn">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left: Image Container styled like gallery */}
                <div className="order-2 lg:order-1 relative">
                  <div className="absolute -top-6 -left-6 w-full h-full border border-brand-gold/20 rounded-tr-[5rem] rounded-bl-[5rem] -z-10" />
                  <div className="relative aspect-video w-full rounded-tr-[3rem] rounded-bl-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                    <Image 
                      src="/images/Gallery/Academics/IMG_5302 (2).jpg" 
                      alt="Classroom Education" 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                </div>

                {/* Right: Text Content */}
                <div className="space-y-6 order-1 lg:order-2">
                  <div className="telemetry-monospace text-brand-green">JUNIOR & SENIOR PRIMARY</div>
                  <h2 className="text-4xl font-bold text-brand-green leading-tight">
                    Shaping Critical Thinkers and <br />
                    <span className="drama-text text-brand-gold">Tomorrow’s Leaders.</span>
                  </h2>
                  <p className="text-brand-green/70 leading-relaxed text-lg">
                    Education at Riverview extends far beyond containing classroom boundaries. With a cap of **25 learners per class**, our students receive highly focused, individualized learning mentorships. We fully exploit our rich surrounding environment through immersive Day tours and extended excursions.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4 p-5 bg-white rounded-2xl border border-brand-green/5 shadow-sm">
                      <Lightbulb className="w-6 h-6 text-brand-gold flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-brand-green mb-1">Future-Ready Capabilities</h4>
                        <p className="text-brand-green/60 text-sm">Fully serviced libraries and fully functional IT Labs ensure learners navigate modern literacy calibrated securely.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-5 bg-white rounded-2xl border border-brand-green/5 shadow-sm">
                      <Users className="w-6 h-6 text-brand-green flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-brand-green mb-1">Standard Of Excellence</h4>
                        <p className="text-brand-green/60 text-sm">Success across International standard assessments alongside frequently awarded high school scholarships certifies molding standards.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ── 🟢 3. Downloads & Accordions Block ──────────────────────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Download Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="telemetry-monospace text-brand-green mb-2">RESOURCES & CALENDARS</div>
              <h3 className="text-2xl font-bold text-brand-green mb-6">Stay Accountable.</h3>
              
              <div className="p-6 bg-white rounded-2xl border border-brand-green/5 flex items-center justify-between hover:border-brand-gold/30 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold"><FileText className="w-6 h-6" /></div>
                  <div><p className="font-bold text-brand-green text-sm flex-wrap">Term Dates 2026</p><p className="text-brand-green/40 text-[10px] uppercase">PDF Document</p></div>
                </div>
                <button className="p-2 rounded-full border border-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-brand-green/5 flex items-center justify-between hover:border-brand-gold/30 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold"><Download className="w-6 h-6" /></div>
                  <div><p className="font-bold text-brand-green text-sm flex-wrap">Term Planner Index</p><p className="text-brand-green/40 text-[10px] uppercase">Packaged Downloads</p></div>
                </div>
                <button className="p-2 rounded-full border border-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Right Columns: Policies Accordion */}
            <div className="lg:col-span-2 space-y-4">
              <div className="telemetry-monospace text-brand-green mb-2">POLICIES & GUIDELINES</div>
              <h3 className="text-2xl font-bold text-brand-green mb-6">Standards that Bind Us.</h3>

              {[
                {
                  id: "uniform",
                  title: "School Uniform & Representation Guidelines",
                  icon: <Shield className="w-5 h-5 text-brand-gold" />,
                  content: (
                    <div className="space-y-3 text-brand-green/70 text-sm leading-relaxed">
                      <p>Complete, clean regulation uniforms are required whenever children are dressed publicly in absolute layout bounding containers carrying absolute layouts safely.</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Ear sleepers only (Girls), discreet necklaces buffers allowable.</li>
                        <li>Regulation hair accessories (green/white) neatened symmetrically buffers setup.</li>
                        <li>Standard sun-hats strictly required outdoors fully compliant during breaks.</li>
                      </ul>
                    </div>
                  )
                },
                {
                  id: "discipline",
                  title: "Value-Based Disciplinary Framework",
                  icon: <Shield className="w-5 h-5 text-brand-green" />,
                  content: (
                    <div className="space-y-3 text-brand-green/70 text-sm leading-relaxed">
                      <p>Rules explained early making transparent buffers securely cascaded properly setup address accurately Addressage setup.</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Correcting steps constructively first between assigned mentors calibration accurately.</li>
                        <li>Supportive parent panels collaboration setup addressing strictly corrective layout offsets easily addressed cleanly correctly securely.</li>
                      </ul>
                    </div>
                  )
                }
              ].map((policy) => (
                <div key={policy.id} className="bg-white rounded-2xl border border-brand-green/5 overflow-hidden transition-all shadow-sm">
                  <button 
                    onClick={() => togglePolicy(policy.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {policy.icon}
                      <span className="font-bold text-brand-green">{policy.title}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-brand-green/40 transition-transform duration-300 ${openPolicy === policy.id ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`transition-all duration-500 overflow-hidden ${openPolicy === policy.id ? "max-h-[500px] border-t border-brand-green/5 p-6 bg-brand-cream/10" : "max-h-0"}`}>
                    {policy.content}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
