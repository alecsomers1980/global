"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Star, Share2, Megaphone } from "lucide-react";

interface HeroProps {
    post?: { title: string; slug: string; content: string; featured_image: string; published_at: string; };
    imageUrl?: string;
    sidebarPosts?: { title: string; slug: string; content: string; featured_image: string; published_at: string; }[];
    sidebarImageUrls?: string[];
}

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop";

function stripHtml(html: string) {
    if (!html) return "";
    // Strip tags, then replace literal newlines/multiple spaces, then decode common entities
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\\n/g, ' ')
        .replace(/\sn\s/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
}

export default function Hero({ post, imageUrl }: HeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.1 });
            tl.from(".hero-tag", { x: -20, opacity: 0, duration: 0.5, ease: "power2.out" })
                .from(".hero-title", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.3")
                .from(".hero-meta", { opacity: 0, duration: 0.5 }, "-=0.2")
                .from(".hero-excerpt", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
                .from(".hero-cta", { scale: 0.9, opacity: 0, duration: 0.4, ease: "back.out(1.5)" }, "-=0.4")
                .from(".hero-sidebar-card", {
                    y: 20, opacity: 0, stagger: 0.15, duration: 0.6, ease: "power3.out"
                }, "-=0.8");
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="w-full bg-white relative overflow-hidden pt-[110px] md:pt-[120px]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-10 relative z-10">

                {/* Grid: 8/12 hero + 4/12 sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ── MAIN HERO CARD ── */}
                    <Link
                        href={post ? `/article/${post.slug}` : "#"}
                        className="lg:col-span-8 group block relative overflow-hidden rounded-xl border border-zinc-200 cursor-pointer shadow-sm"
                    >
                        {/* Image */}
                        <div className="relative w-full h-[460px] md:h-[600px] img-zoom bg-zinc-100">
                            <img
                                src={imageUrl || DEFAULT_HERO_IMAGE}
                                alt={post?.title || "Top story"}
                                className="w-full h-full object-cover transition-all duration-700"
                            />
                            {/* Premium dark gradient overlay so white text remains readable */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/20"></div>

                            {/* Top-left Editor's Pick badge */}
                            <div className="hero-tag absolute top-6 left-6">
                                <span className="news-badge bg-[#E60000] text-white border-transparent shadow-md">
                                    <Star size={12} fill="currentColor" /> Editor's Choice
                                </span>
                            </div>

                            {/* Top-right data block */}
                            <div className="hero-tag absolute top-6 right-6 flex items-center gap-4 border border-white/20 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-[11px] font-sans font-bold text-white shadow-md">
                                <span className="flex items-center gap-1.5 text-white">Share <Share2 size={12} className="text-[#E60000]" /></span>
                            </div>

                            {/* Bottom content overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 border-t border-white/10 bg-gradient-to-t from-black/90 to-transparent">

                                {/* Meta block */}
                                <div className="hero-meta flex items-center gap-3 text-[#E60000] text-[12px] font-sans font-bold mb-4 uppercase tracking-widest border-l-3 border-[#E60000] pl-3">
                                    <span>{post?.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : "Today"}</span>
                                    <span className="text-white/60">•</span>
                                    <span className="text-white">5 Min Read</span>
                                </div>

                                {/* Title */}
                                <h1
                                    className="hero-title font-display text-white text-3xl md:text-[52px] font-bold leading-[1.1] tracking-tight mb-5 max-w-4xl group-hover:text-[#E60000] transition-colors duration-300 drop-shadow-lg"
                                >
                                    {post ? post.title : "New Business Hub Initiated: Empowering the Local Economy in 2026"}
                                </h1>

                                {/* Excerpt - explicitly bright white to ensure readability over dark areas */}
                                <p className="hero-excerpt text-white/95 text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-sans hidden md:block drop-shadow-md">
                                    {post
                                        ? stripHtml(post.content).substring(0, 160) + '...'
                                        : "The city council has approved the deployment of a new smart infrastructure hub, aimed at stabilizing commerce and allowing peer-to-peer growth."}
                                </p>

                                {/* CTA */}
                                <div className="hero-cta inline-flex items-center gap-4 text-white font-sans font-bold text-[12px] uppercase tracking-[0.2em] group-hover:text-[#E60000] transition-colors border-2 border-[#E60000] px-6 py-2.5 rounded-full backdrop-blur-sm drop-shadow-md">
                                    Read Full Report <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* ── SIDEBAR ── */}
                    <aside className="lg:col-span-4 flex flex-col h-full space-y-6">

                        {/* Network Statistics Card */}
                        <div className="news-card !bg-white !border-zinc-200 p-6 border-t-4 border-t-[#E60000] shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E60000]/5 rounded-bl-[100px] pointer-events-none"></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <span className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-[0.2em]">Network Pulse</span>
                                <span className="flex items-center gap-2 text-[#E60000] text-[10px] font-sans font-bold uppercase tracking-widest"><span className="live-indicator"></span> Active</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <div className="text-3xl font-display font-bold text-zinc-900 leading-tight tracking-tight">4,892</div>
                                    <div className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1">Live Readers</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-display font-bold text-zinc-900 leading-tight tracking-tight">27</div>
                                    <div className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-[0.15em] mt-1">Updates Today</div>
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Sponsorship Card */}
                        <div className="hero-sidebar-card flex-1 flex flex-col !bg-zinc-900 !border-zinc-800 rounded-xl overflow-hidden relative group shadow-xl">
                            {/* Premium Tech Background */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#E60000]/10 via-transparent to-black"></div>

                            <div className="p-8 flex flex-col h-full relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-[9px] font-sans font-bold text-[#E60000] border border-[#E60000]/30 px-2 py-1 rounded bg-[#E60000]/5 uppercase tracking-[0.2em]">Sponsorship</span>
                                </div>

                                <div className="mb-8">
                                    <div className="w-14 h-14 rounded-xl bg-[#E60000] flex items-center justify-center text-white shadow-[0_0_20px_rgba(230,0,0,0.3)] mb-6">
                                        <Megaphone size={28} />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-white mb-3 leading-tight tracking-tight">
                                        Drive Regional Impact with Bushnews Intelligence
                                    </h3>
                                    <p className="text-sm font-sans text-zinc-400 leading-relaxed mb-6">
                                        Leverage our high-performance network to scale your brand across the greater Bushbuckridge trade corridors.
                                    </p>
                                </div>

                                <div className="mt-auto space-y-4">
                                    <Link
                                        href="/advertise"
                                        className="btn-primary w-full flex justify-center py-4 text-[12px] font-bold tracking-[0.2em] bg-[#E60000] border-[#E60000]"
                                    >
                                        Inquire Architecture
                                    </Link>
                                    <Link
                                        href="/advertise/info"
                                        className="w-full flex justify-center py-3 text-[11px] font-sans font-bold text-zinc-400 hover:text-white transition-colors border border-zinc-700 hover:border-zinc-500 rounded-lg bg-zinc-800/50"
                                    >
                                        Download Media Kit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </section>
    );
}
