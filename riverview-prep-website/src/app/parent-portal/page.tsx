"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Bell, FileText, Calendar, CreditCard, Archive, ExternalLink } from "lucide-react";
import SecondaryBanner from "@/components/SecondaryBanner";

const alerts = [
  { title: "Term Dates Released", date: "Oct 24, 2026", desc: "The official calendar for the upcoming academic year is now available.", type: "Important" },
  { title: "Sports Day Update", date: "Oct 20, 2026", desc: "U13 Rugby fixture vs Penryn moved to 15:00 on Friday.", type: "Update" },
  { title: "Fee Statement", date: "Oct 15, 2026", desc: "October statements are now live in the payment portal.", type: "Financial" },
];

const quickLinks = [
  { name: "Academic Reports", icon: <FileText className="w-6 h-6" />, href: "/reports" },
  { name: "School Calendar", icon: <Calendar className="w-6 h-6" />, href: "/calendar" },
  { name: "Fee Payments", icon: <CreditCard className="w-6 h-6" />, href: "#" },
  { name: "Document Archive", icon: <Archive className="w-6 h-6" />, href: "#" },
];

export default function ParentPortal() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <SecondaryBanner 
        title="Community Hub" 
        subtitle="Parent Portal & Resources"
      />

      {/* Main Content Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Alerts Stack (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Bell className="w-6 h-6 text-brand-gold" />
                  Priority Alerts
                </h2>
                <div className="telemetry-monospace text-[10px]">3 ACTIVE ALERTS</div>
              </div>

              <div className="space-y-4">
                {alerts.map((alert, i) => (
                  <div 
                    key={i} 
                    className="group p-8 bg-brand-cream rounded-[2rem] border border-brand-green/5 hover:border-brand-gold/30 transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-green/40">
                        {alert.type} • {alert.date}
                      </span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-green">{alert.title}</h3>
                    <p className="text-sm text-brand-green/60 leading-relaxed">{alert.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar (Quick Links & News) */}
            <div className="space-y-12">
              <div>
                <h4 className="font-bold uppercase tracking-widest text-xs mb-8 text-brand-green/40">Quick Access</h4>
                <div className="grid grid-cols-1 gap-4">
                  {quickLinks.map((link) => (
                    <a 
                      key={link.name} 
                      href={link.href}
                      className="flex items-center gap-6 p-6 bg-white border border-brand-green/5 rounded-2xl hover:shadow-xl hover:border-brand-gold/20 transition-all duration-500 group"
                    >
                      <div className="w-12 h-12 bg-brand-green/5 rounded-xl flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors">
                        {link.icon}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-brand-green rounded-[2rem] text-white">
                 <h4 className="font-bold uppercase tracking-widest text-[10px] text-brand-gold mb-6">Live Telemetry</h4>
                 <div className="space-y-4 font-mono text-xs opacity-80">
                    <p className="border-l-2 border-brand-gold/40 pl-4 py-1">
                      [10:42] Fixture Move: U13 Rugby vs Penryn confirmed for 15:00 Friday at Malelane Fields.
                    </p>
                    <p className="border-l-2 border-brand-gold/40 pl-4 py-1">
                      [09:15] Newsletter Sent: &quot;Weekly Pulse - Oct Week 3&quot; dispatched to all registered parents.
                    </p>
                    <p className="border-l-2 border-green-500 pl-4 py-1">
                      [SYSTEM] All digital portals operational. 100% compliance verified.
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
