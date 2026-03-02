"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search } from "lucide-react";

const navLinks = [
    { label: "Community", href: "/community" },
    { label: "Crime", href: "/crime" },
    { label: "Lifestyle", href: "/lifestyle" },
    { label: "Notice", href: "/notice" },
    { label: "Politics", href: "/politics" },
    { label: "Sports", href: "/sports" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const onScroll = () => {
            const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            setScrollProgress(pct);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Entrance animation
    useEffect(() => {
        gsap.from(headerRef.current, { y: -50, opacity: 0, duration: 1, ease: "power4.out", delay: 0.1 });
    }, []);

    return (
        <>
            {/* Reading progress bar */}
            <div
                className="top-progress"
                style={{ transform: `scaleX(${scrollProgress / 100})` }}
            />

            {/* ── Floated Header ── */}
            <header
                ref={headerRef}
                className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
            >
                <div className="w-full max-w-[1400px]">
                    {/* The Pill container */}
                    <div className="h-[72px] md:h-20 w-full rounded-[2rem] flex items-center justify-between px-6 md:px-8 shadow-xl pointer-events-auto border border-zinc-200/60 bg-white/85 backdrop-blur-2xl transition-all duration-300">

                        <div className="flex items-center gap-6 md:gap-10">
                            {/* Logo */}
                            <Link href="/" className="flex items-center group pt-1">
                                <div className="relative w-36 h-7 md:w-44 md:h-9">
                                    <Image
                                        src="/Bushnews.png"
                                        alt="Bushbuckridge News Logo"
                                        fill
                                        className="object-contain object-left group-hover:scale-[1.02] transition-transform"
                                        unoptimized
                                    />
                                </div>
                            </Link>

                            {/* Desktop navigation */}
                            <nav className="hidden lg:flex items-center gap-7">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-[13px] font-sans font-bold text-zinc-600 uppercase tracking-widest transition-all hover:text-[#E60000] hover:scale-105"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <button
                                className="hidden md:flex w-9 h-9 items-center justify-center text-zinc-500 hover:text-[#E60000] transition-colors"
                                aria-label="Search"
                            >
                                <Search size={18} strokeWidth={2.5} />
                            </button>

                            <Link href="/subscribe" className="hidden sm:inline-flex btn-primary !m-0 !py-2.5 !text-[12px]">
                                Subscribe
                            </Link>

                            {/* Mobile menu toggle */}
                            <button
                                className="md:hidden w-10 h-10 flex items-center justify-center text-zinc-900 transition-colors bg-zinc-100 rounded-full border border-zinc-200 hover:text-[#E60000]"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile drawer (drops down just below the pill) */}
                    {mobileOpen && (
                        <div className="md:hidden mt-4 bg-white/95 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-2xl px-6 py-6 space-y-2 pointer-events-auto relative overflow-hidden">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block flex items-center py-4 text-zinc-900 font-sans font-bold text-sm tracking-widest uppercase border-b border-zinc-100 hover:text-[#E60000] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4">
                                <Link
                                    href="/subscribe"
                                    className="btn-primary w-full flex justify-center !py-3"
                                >
                                    Subscribe Now
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
}
