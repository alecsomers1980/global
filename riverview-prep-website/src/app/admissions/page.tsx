"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, FileText, CreditCard, ClipboardCheck } from "lucide-react";
import SecondaryBanner from "@/components/SecondaryBanner";

const steps = [
  { title: "Apply", desc: "Submit the digital application form with required documents.", icon: <FileText /> },
  { title: "Evaluate", desc: "Your child participates in an age-appropriate entrance evaluation.", icon: <ClipboardCheck /> },
  { title: "Secure", desc: "Upon acceptance, pay the non-refundable deposit/levy.", icon: <CreditCard /> },
  { title: "Finalize", desc: "Complete the enrollment contract and digital signatures.", icon: <CheckCircle2 /> },
];

const fees = [
  { grade: "Grade 000 - 00", annual: "R20,383", monthly: "R1,853" },
  { grade: "Grade 0 - 7", annual: "R31,416", monthly: "R2,856" },
];

export default function AdmissionsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Sub-page Hero */}
      <SecondaryBanner 
        title="Starting the Journey" 
        subtitle="Admissions Process & Enrollment"
      />

      {/* Steps Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group p-8 rounded-[2rem] bg-brand-cream border border-brand-green/5 hover:border-brand-gold/30 transition-all duration-500">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-green mb-6 shadow-sm group-hover:bg-brand-green group-hover:text-white transition-all duration-500">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-brand-green/60 leading-relaxed">{step.desc}</p>
                <div className="absolute -top-4 -right-4 text-4xl font-bold text-brand-green/5 group-hover:text-brand-gold/10 transition-colors">
                  0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-brand-green p-12 md:p-20 rounded-[3rem] text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-gold/10 blur-3xl" />
            
            <div className="text-center mb-16">
              <div className="telemetry-monospace text-brand-gold mb-4">FINANCIALS 2026</div>
              <h2 className="text-3xl md:text-5xl font-bold">Fee <span className="drama-text">Structure.</span></h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] font-bold text-brand-gold">
                    <th className="pb-6">Grade Level</th>
                    <th className="pb-6">Annual Amount</th>
                    <th className="pb-6">Monthly (11 Months)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {fees.map((fee, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                      <td className="py-8 font-bold text-lg">{fee.grade}</td>
                      <td className="py-8 text-white/80">{fee.annual}</td>
                      <td className="py-8 text-white/80">{fee.monthly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-12 pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-white/50 leading-relaxed">
              <div className="p-8 bg-white/5 rounded-[2rem]">
                <h4 className="font-bold text-brand-gold mb-2 uppercase tracking-widest text-[10px]">Capital Levy</h4>
                An annual Capital Levy of R1,500 applies to all students to maintain our premium facilities.
              </div>
              <div className="p-8 bg-white/5 rounded-[2rem]">
                <h4 className="font-bold text-brand-gold mb-2 uppercase tracking-widest text-[10px]">Discounts</h4>
                A 5% discount is offered on annual fees if paid in full before January 31st, 2026.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-6">
           <h2 className="text-3xl font-bold mb-8">Ready to begin?</h2>
           <button className="magnetic-button">
             Download Application Bundle
           </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
