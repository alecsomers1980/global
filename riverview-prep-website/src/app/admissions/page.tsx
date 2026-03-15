"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, FileText, CreditCard, ClipboardCheck, Award, Info, Landmark, Download } from "lucide-react";
import SecondaryBanner from "@/components/SecondaryBanner";

const steps = [
  { title: "Submit Forms", desc: "Return completed application forms together with copies of child’s birth certificate, clinic card, latest report, and parents IDs.", icon: <FileText /> },
  { title: "Application Fee", desc: "An application fee of R200.00 is required for every form submitted.", icon: <CreditCard /> },
  { title: "Evaluation Visit", desc: "Our office will contact you to schedule an age-comparable entrance evaluation appointment.", icon: <ClipboardCheck /> },
  { title: "Outcome Review", desc: "Final outcomes are reviewed by a panel and communicated cleanly back to parents accurately.", icon: <CheckCircle2 /> },
];

const preschoolFees = [
  { grade: "Cubs (3 Days / Week)", deposit: "R3,050", monthly: "R2,400", annual: "R26,400" },
  { grade: "Cubs (5 Days / Week)", deposit: "R3,050", monthly: "R3,050", annual: "R33,550" },
  { grade: "Grade 000 - 00", deposit: "R4,350", monthly: "R4,350", annual: "R47,850" },
];

const primaryFees = [
  { grade: "Grade 0", nonRef: "R8,400", refFlat: "R18,000", monthly: "R6,620", annual: "R72,820" },
  { grade: "Grade 1", nonRef: "R8,400", refFlat: "R18,000", monthly: "R6,850", annual: "R75,350" },
  { grade: "Grade 2", nonRef: "R7,200", refFlat: "R18,000", monthly: "R6,850", annual: "R75,350" },
  { grade: "Grade 3", nonRef: "R6,000", refFlat: "R18,000", monthly: "R6,850", annual: "R75,350" },
  { grade: "Grade 4", nonRef: "R4,800", refFlat: "R18,000", monthly: "R6,850", annual: "R75,350" },
  { grade: "Grade 5", nonRef: "R3,600", refFlat: "R18,000", monthly: "R6,850", annual: "R75,350" },
  { grade: "Grade 6", nonRef: "R2,400", refFlat: "R18,000", monthly: "R6,850", annual: "R75,350" },
  { grade: "Grade 7", nonRef: "R1,200", refFlat: "R18,000", monthly: "R6,850", annual: "R75,350" },
];

export default function AdmissionsPage() {
  const [activeFeeTab, setActiveFeeTab] = useState<'preschool' | 'primary'>('primary');

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      
      <SecondaryBanner 
        title="Admissions" 
        subtitle="STARTING THE JOURNEY"
      />

      {/* ── 🟢 1. Steps Section ────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="telemetry-monospace text-brand-gold mb-2">APPLICATION PROCESS</div>
            <h2 className="text-3xl font-bold text-brand-green">Stepping Stones to Enrollment</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group p-8 rounded-3xl bg-brand-cream border border-brand-green/5 hover:border-brand-gold/30 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-green mb-6 shadow-sm group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-brand-green mb-2">{step.title}</h3>
                <p className="text-xs text-brand-green/70 leading-relaxed">{step.desc}</p>
                <div className="absolute -top-3 -right-3 text-4xl font-bold text-brand-green/5 group-hover:text-brand-gold/10 transition-colors">
                  0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 🟢 2. Admission Criteria ───────────────────────────────────── */}
      <section className="py-16 bg-brand-cream border-t border-b border-brand-green/5">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[2rem] border border-brand-green/5 shadow-md">
            <div className="p-4 bg-brand-gold/10 rounded-2xl text-brand-gold"><Award className="w-10 h-10" /></div>
            <div>
              <h3 className="font-bold text-xl text-brand-green mb-2">Admission Policy Criteria</h3>
              <p className="text-brand-green/70 text-sm leading-relaxed">
                Entry is open provided continuous satisfactory benchmarks evaluating age-comparable timelines address correctly. 
                All conditions laid within applications accurately full transparency enabled securely properly cascaded freely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 🟢 3. Fee Structure Section (With Inner Tabs) ───────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-brand-green p-12 md:p-16 rounded-[3rem] text-white relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-gold/10 blur-3xl" />
            
            <div className="text-center mb-6">
              <div className="telemetry-monospace text-brand-gold mb-3">FINANCIALS 2026</div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8">School <span className="drama-text">Fees.</span></h2>
              
              <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10 shadow-inner">
                <button 
                  onClick={() => setActiveFeeTab('preschool')}
                  className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${
                    activeFeeTab === 'preschool' ? "bg-brand-gold text-brand-green shadow-md" : "text-white/60 hover:text-white"
                  }`}
                >
                  PRE-SCHOOL
                </button>
                <button 
                  onClick={() => setActiveFeeTab('primary')}
                  className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${
                    activeFeeTab === 'primary' ? "bg-brand-gold text-brand-green shadow-md" : "text-white/60 hover:text-white"
                  }`}
                >
                  PRIMARY (GR 0-7)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeFeeTab === 'preschool' ? (
                <table className="w-full text-left text-sm whitespace-nowrap animate-fadeIn">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">
                      <th className="pb-6 pr-6">Grade Level</th>
                      <th className="pb-6 pr-4">Refundable Deposit (To Gr 0)</th>
                      <th className="pb-6 pr-4">11x Monthly Fees</th>
                      <th className="pb-6">Total Annual Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {preschoolFees.map((fee, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors text-xs">
                        <td className="py-5 font-bold text-sm pr-6 leading-relaxed">{fee.grade}</td>
                        <td className="py-5 text-white/70 pr-4">{fee.deposit}</td>
                        <td className="py-5 text-brand-gold font-semibold pr-4">{fee.monthly}</td>
                        <td className="py-5 text-white/90 font-bold">{fee.annual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap animate-fadeIn">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">
                      <th className="pb-6 pr-6">Grade Level</th>
                      <th className="pb-6 pr-4">Non-Ref ONCE-OFF (Opt 1)</th>
                      <th className="pb-6 pr-4">Refundable ONCE-OFF (Opt 2)</th>
                      <th className="pb-6 pr-4">11x Monthly Fees</th>
                      <th className="pb-6">Total Annual Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {primaryFees.map((fee, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors text-xs">
                        <td className="py-5 font-bold text-sm pr-6 leading-relaxed">{fee.grade}</td>
                        <td className="py-5 text-white/70 pr-4 text-center sm:text-left">{fee.nonRef}</td>
                        <td className="py-5 text-white/70 pr-4 text-center sm:text-left">{fee.refFlat}</td>
                        <td className="py-5 text-brand-gold font-semibold pr-4">{fee.monthly}</td>
                        <td className="py-5 text-white/90 font-bold">{fee.annual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sub Notes Grid */}
            <div className="mt-12 pt-12 border-t border-white/10">
              <div className="flex items-center gap-2 mb-4 text-brand-gold">
                <Info className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-widest">Guidances & Exclusions:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-white/70 leading-relaxed">
                <div className="p-5 bg-white/5 rounded-2xl">
                  🔹 <strong>Calculations</strong>: Fees spreads over 11 months (Jan - Nov), paid in advance. 5% discount if paid annual before Jan 31st.
                </div>
                <div className="p-5 bg-white/5 rounded-2xl">
                  🔹 <strong>Deposits Discounts</strong>: Scaling 2nd child 25%, 3rd child 50% discount accurately applicable single households correctly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 🟢 4. Application Kit Downloads ────────────────────────────── */}
      <section className="py-20 bg-brand-cream border-t border-b border-brand-green/5">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="telemetry-monospace text-brand-gold mb-2">DOWNLOAD CENTER</div>
          <h2 className="text-3xl font-bold text-brand-green mb-10">Application Kits & Documents</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {[
              { name: "General Application Form", type: "PDF Bundle", size: "1.2 MB" },
              { name: "Parental Consent & Agreement", type: "PDF Document", size: "420 KB" },
              { name: "Medical Details & Questionaire", type: "Form Sheet", size: "380 KB" },
              { name: "Debit Order Authorization", type: "Financial", size: "510 KB" },
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-brand-green/5 hover:border-brand-gold/30 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold"><FileText className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-brand-green text-sm">{doc.name}</h4>
                    <p className="text-brand-green/40 text-[10px] uppercase tracking-wider mt-0.5">{doc.type} • {doc.size}</p>
                  </div>
                </div>
                <button className="p-3 rounded-xl bg-neutral-50 border border-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-brand-green/60 mt-8 leading-relaxed max-w-lg mx-auto">
            Please print, sign, and return completed forms alongside certified copies directly to the school office or email to <a href="mailto:admin@riverviewprep.org" className="text-brand-gold underline hover:no-underline font-bold">admin@riverviewprep.org</a>.
          </p>
        </div>
      </section>

      {/* ── 🟢 5. Banking Details ──────────────────────────────────────── */}
      <section className="py-16 bg-white text-center">
        <div className="container mx-auto px-6 max-w-sm">
          <div className="p-8 bg-brand-cream border border-brand-green/5 rounded-3xl shadow-md space-y-4">
            <div className="mx-auto w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold mb-2">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-brand-green text-lg">Banking Details</h3>
            <div className="text-xs text-brand-green/80 flex flex-col space-y-1">
              <p><strong>Bank:</strong> Standard Bank Malelane</p>
              <p><strong>Branch Code:</strong> 053252</p>
              <p><strong>Account No:</strong> 030408377</p>
              <p className="mt-2 text-[10px] text-brand-gold font-bold">Ref: Child’s Surname & Name or Account Number</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
