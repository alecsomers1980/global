"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Download, TrendingUp, Clock, Medal, FileText, Compass, PenTool } from "lucide-react";
import SecondaryBanner from "@/components/SecondaryBanner";

const stats = [
  { label: "Current GPA", value: "3.8", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Attendance", value: "98%", icon: <Clock className="w-5 h-5" /> },
  { label: "Merits", value: "124", icon: <Medal className="w-5 h-5" /> },
];

const feedback = [
  { subject: "Advanced Mathematics", teacher: "Mr. Henderson", comment: "Exceptional grasp of trigonometric identities. Participation in class remains high.", icon: <Compass /> },
  { subject: "English Literature", teacher: "Mrs. Sterling", comment: "Essay structure has improved significantly. Focus on expanding vocabulary for Term 4.", icon: <PenTool /> },
  { subject: "Physical Education", teacher: "Coach Miller", comment: "Demonstrates strong leadership qualities on the field. Technical skills are developing well.", icon: <Trophy /> },
];

function Trophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SecondaryBanner 
        title="Academic Growth" 
        subtitle="Student Telemetry & Progress"
      />

      {/* Snapshot Cards */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {stats.map((stat, i) => (
              <div key={i} className="p-8 bg-brand-cream rounded-[2rem] border border-brand-green/5 flex items-center justify-between group hover:border-brand-gold/30 transition-all duration-500">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-brand-green/40 mb-2">{stat.label}</p>
                  <h3 className="text-4xl font-bold text-brand-green">{stat.value}</h3>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-500">
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Report View */}
            <div className="lg:col-span-2 space-y-12">
              <div className="p-12 bg-brand-green rounded-[3rem] text-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8">
                    <button className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-brand-gold hover:text-white transition-colors">
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                 </div>
                 <h2 className="text-2xl font-bold mb-12">Term 3 Assessment</h2>
                 
                 {/* Mock Chart Area */}
                 <div className="h-64 flex items-end gap-2 mb-12">
                    {[65, 85, 70, 95, 80, 75, 90].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-brand-gold/20 rounded-t-lg relative group transition-all duration-500 hover:bg-brand-gold/40"
                        style={{ height: `${h}%` }}
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            {h}%
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 rounded-[2rem]">
                       <h4 className="font-bold text-brand-gold mb-2 uppercase tracking-widest text-[10px]">Strategic Strength</h4>
                       Excellent logical reasoning and analytical skills demonstrated in technical subjects.
                    </div>
                    <div className="p-8 bg-white/5 rounded-[2rem]">
                       <h4 className="font-bold text-brand-gold mb-2 uppercase tracking-widest text-[10px]">Growth Opportunity</h4>
                       Creative expression and vocabulary depth in humanities can be further expanded.
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                   <FileText className="w-6 h-6 text-brand-gold" />
                   Feedback Protocol
                 </h2>
                 {feedback.map((item, i) => (
                   <div key={i} className="p-8 border border-brand-green/5 bg-brand-cream rounded-[2rem] hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-brand-green">
                           {item.icon}
                         </div>
                         <div>
                            <h4 className="font-bold text-sm tracking-tight">{item.subject}</h4>
                            <p className="text-[10px] uppercase tracking-widest opacity-40">{item.teacher}</p>
                         </div>
                      </div>
                      <p className="text-brand-green/70 text-sm leading-relaxed">{item.comment}</p>
                   </div>
                 ))}
              </div>
            </div>

            {/* Sidebar Tools */}
            <div className="space-y-8">
               <div className="p-8 bg-brand-cream rounded-[2rem] border border-brand-gold/20">
                  <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Report Archives</h4>
                  <ul className="space-y-4">
                     {["Term 2, 2026", "Term 1, 2026", "Term 3, 2025"].map(archive => (
                       <li key={archive} className="flex items-center justify-between text-xs group cursor-pointer hover:text-brand-green">
                          <span className="opacity-60">{archive}</span>
                          <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                       </li>
                     ))}
                  </ul>
               </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
