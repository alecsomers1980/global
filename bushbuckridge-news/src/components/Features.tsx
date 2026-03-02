"use client";

import { Calendar, User, Mail, ArrowRight, Rss, ShieldAlert } from "lucide-react";

export default function CommunityPulse() {
    return (
        <section className="w-full !bg-[#F9FAFB] border-t border-zinc-200 py-12 relative overflow-hidden">
            {/* Background mesh graphic */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#E60000]/10 via-transparent to-transparent pointer-events-none"></div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">

                {/* Section header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <span className="text-[11px] font-sans font-bold text-[#E60000] uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Rss size={14} /> Community Network
                        </span>
                        <h2 className="text-3xl md:text-4xl font-display font-medium text-zinc-900 tracking-tight">
                            Local Pulse
                        </h2>
                    </div>
                    <a href="/community" className="text-[12px] font-sans font-bold text-zinc-500 hover:text-[#E60000] uppercase tracking-widest transition-colors flex items-center gap-2">
                        View All Events <ArrowRight size={16} />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

                    {/* ── COL 1: Events Log (4 cols) ── */}
                    <div className="news-card !bg-white !border-zinc-200 lg:col-span-4 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
                            <Calendar className="text-[#E60000] w-5 h-5" />
                            <h3 className="text-lg font-display text-zinc-900">Upcoming Events</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { date: "TOMORROW / 09:00", title: "Business Networking Forum", loc: "Civic Centre, Hub A" },
                                { date: "12 MAR / 18:00", title: "Town Hall Development Workshop", loc: "Community Park" },
                                { date: "15 MAR / 10:00", title: "Youth Sports Initiative Demo Day", loc: "Innovation Lab" },
                            ].map((event, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <span className="text-[10px] font-sans font-bold text-[#E60000] uppercase tracking-wider block mb-1">{event.date}</span>
                                    <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-[#E60000] transition-colors mb-1">{event.title}</h4>
                                    <p className="text-[12px] font-sans text-zinc-500">{event.loc}</p>
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary w-full mt-6 py-3 text-[12px]">
                            Submit Local Event
                        </button>
                    </div>

                    {/* ── COL 2: Top Node Activity (4 cols) ── */}
                    <div className="news-card !bg-white !border-zinc-200 lg:col-span-4 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
                            <User className="text-[#E60000] w-5 h-5" />
                            <h3 className="text-lg font-display text-zinc-900">Featured Voices</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "Dr. Samora Machel", role: "Economic Advisor", posts: "14 Articles", img: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?q=80&w=200&auto=format&fit=crop" },
                                { name: "Lerato Khoza", role: "Local Entrepreneur", posts: "9 Articles", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
                                { name: "Thabo Mbekeni", role: "Community Analyst", posts: "6 Articles", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
                            ].map((voice, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer bg-white p-3 rounded-lg border border-zinc-100 hover:border-[#E60000]/30 transition-colors shadow-sm">
                                    <img src={voice.img} alt={voice.name} className="w-10 h-10 rounded-md grayscale border border-zinc-200 group-hover:grayscale-0 transition-all duration-300" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-[#E60000] transition-colors">{voice.name}</h4>
                                        <p className="text-[11px] font-sans text-zinc-500 mt-0.5">{voice.role} · <span className="text-[#E60000] font-medium">{voice.posts}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── COL 3: Secure Uplink & Protocol Warning (4 cols) ── */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Newsletter card */}
                        <div className="news-card !bg-white !border-zinc-200 p-6 shadow-[0_4px_20px_rgba(230,0,0,0.05)] flex-1">
                            <div className="w-10 h-10 rounded-full bg-[#E60000]/10 flex items-center justify-center mb-4 border border-[#E60000]/30 text-[#E60000]">
                                <Mail size={20} />
                            </div>
                            <h3 className="text-lg font-display text-zinc-900 mb-2">Daily Briefing</h3>
                            <p className="text-xs text-zinc-500 font-sans mb-5 leading-relaxed">
                                Subscribe for a condensed editorial summary of the most critical local news delivered directly to your inbox every morning.
                            </p>
                            <div className="flex bg-white p-1 rounded border border-zinc-200 focus-within:border-[#E60000]/50 transition-colors">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="bg-transparent w-full text-zinc-900 text-[12px] font-sans px-3 py-2 outline-none placeholder-zinc-400"
                                />
                                <button className="bg-zinc-100 hover:bg-[#E60000]/10 text-[#E60000] border border-zinc-200 px-4 rounded text-[11px] font-sans font-bold uppercase tracking-wider transition-colors">
                                    Subscribe
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-sans mt-3 text-center">Unsubscribe at any time.</p>
                        </div>

                        {/* Local tech sponsor / alert */}
                        <div className="rounded-lg border-l-3 border-l-[#E60000] !bg-gradient-to-r from-[#E60000]/10 to-transparent p-4 flex items-start gap-4">
                            <ShieldAlert className="text-[#E60000] w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-sans font-bold text-zinc-900 uppercase tracking-widest mb-1">Local Advisory</h4>
                                <p className="text-[12px] font-sans text-zinc-600 leading-relaxed">
                                    Road closures scheduled for <span className="text-zinc-900 font-medium">Main Street</span> this weekend. Plan alternative routes for your commute.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
