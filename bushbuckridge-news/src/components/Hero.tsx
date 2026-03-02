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
                                        ? post.content?.replace(/<[^>]+>/g, '').substring(0, 160) + '...'
                                        : "The city council has approved the deployment of a new smart infrastructure hub, aimed at stabilizing commerce and allowing peer-to-peer growth."}
                                </p>

                                {/* CTA */}
                                <div className="hero-cta inline-flex items-center gap-3 text-white font-sans font-bold text-[13px] uppercase tracking-wider group-hover:text-[#E60000] transition-colors border-b-2 border-[#E60000] pb-1 drop-shadow-md">
                                    Read Full Article <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* ── SIDEBAR ── */}
                    <aside className="lg:col-span-4 flex flex-col h-full space-y-4">

                        {/* Status block */}
                        <div className="news-card !bg-white !border-zinc-200 p-4 border-t-2 border-t-[#E60000]">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[12px] font-sans font-bold text-zinc-500 uppercase tracking-widest">Network Impact</span>
                                <span className="flex items-center gap-1.5 text-[#E60000] text-[11px] font-sans font-bold uppercase"><span className="live-indicator"></span> High</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[26px] font-display font-bold text-zinc-900">4,892</div>
                                    <div className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-wider">Readers Online</div>
                                </div>
                                <div>
                                    <div className="text-[26px] font-display font-bold text-zinc-900">42</div>
                                    <div className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-wider">Stories Published</div>
                                </div>
                            </div>
                        </div>

                        {/* Advertisement Block (Replaced Trending Now) */}
                        <div className="hero-sidebar-card flex-1 flex flex-col !bg-zinc-50 !border-zinc-200 rounded-xl overflow-hidden relative group shadow-sm mt-2">
                            {/* Decorative background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E60000]/5 rounded-bl-[100px] pointer-events-none"></div>

                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="news-badge bg-zinc-200/50 text-zinc-500 border-transparent shadow-none !px-2">Sponsorship</span>
                                </div>

                                <div className="mb-4">
                                    <div className="w-12 h-12 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[#E60000] shadow-sm mb-4">
                                        <Megaphone size={24} />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-zinc-900 mb-2 leading-tight">
                                        Amplify Your Brand in Bushbuckridge
                                    </h3>
                                    <p className="text-sm font-sans text-zinc-600 leading-relaxed">
                                        Reach over 50,000 highly engaged local readers daily. Place your business at the forefront of the community network.
                                    </p>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <Link
                                        href="/advertise"
                                        className="btn-primary w-full flex justify-center py-3 text-[13px]"
                                    >
                                        Register as Advertiser
                                    </Link>
                                    <Link
                                        href="/advertise/info"
                                        className="w-full flex justify-center py-2.5 text-[12px] font-sans font-bold text-zinc-500 hover:text-[#E60000] transition-colors border border-zinc-200 hover:border-[#E60000]/30 rounded-md bg-white"
                                    >
                                        Read More
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
