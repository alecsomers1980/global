'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, Lock, Upload, ArrowRight } from 'lucide-react';

export default function UnderConstruction() {
    return (
        <div className="min-h-[100dvh] bg-charcoal text-white flex flex-col relative overflow-x-hidden font-outfit">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/50 to-charcoal" />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-aloe-green/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-aloe-green/5 rounded-full blur-[100px] animate-pulse delay-700" />

            <main className="relative z-10 w-full max-w-5xl px-6 py-12 md:py-20 m-auto flex flex-col items-center text-center">
                {/* Logo */}
                <div className="mb-6 md:mb-12 animate-fadeIn">
                    <Image
                        src="/aloe-logo.png"
                        alt="Aloe Signs"
                        width={240}
                        height={80}
                        className="h-16 md:h-20 w-auto brightness-110"
                        priority
                    />
                </div>

                {/* Main Message */}
                <div className="space-y-6 mb-16 max-w-3xl">
                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                        BIG. BOLD. <br />
                        <span className="text-aloe-green">COMING SOON.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-light-grey/80 max-w-2xl mx-auto leading-relaxed">
                        We are currently evolving our digital workshop to bring you a premium signage experience.
                    </p>
                </div>

                {/* Access Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                    {/* Artwork Upload */}
                    <Link
                        href="/portal/upload"
                        className="group p-8 glass-card rounded-[2rem] border border-white/10 hover:border-aloe-green/50 transition-all duration-500 text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <Upload size={80} />
                        </div>
                        <div className="w-12 h-12 bg-aloe-green/20 rounded-2xl flex items-center justify-center mb-6 text-aloe-green group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            Artwork Portal
                            <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-light-grey/60 text-sm leading-relaxed">
                            Upload your design files directly to our production team.
                        </p>
                    </Link>

                    {/* Staff Access */}
                    <Link
                        href="/portal/admin/login"
                        className="group p-8 glass-card rounded-[2rem] border border-white/10 hover:border-aloe-green/50 transition-all duration-500 text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <Lock size={80} />
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            Staff Login
                            <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-light-grey/60 text-sm leading-relaxed">
                            Internal access for order management and file downloads.
                        </p>
                    </Link>

                    {/* Dev Preview */}
                    <Link
                        href="/home"
                        className="group p-8 glass-card rounded-[2rem] border border-white/10 hover:border-white/30 transition-all duration-500 text-left relative overflow-hidden bg-white/5"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <LayoutGrid size={80} />
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white/70 group-hover:scale-110 transition-transform">
                            <LayoutGrid size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            Dev Preview
                            <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-light-grey/60 text-sm leading-relaxed">
                            Authorized preview of the upcoming website experience.
                        </p>
                    </Link>
                </div>

                {/* Footer Quote */}
                <div className="mt-20 text-light-grey/40 text-sm font-medium tracking-widest uppercase flex items-center gap-4">
                    <span className="w-8 h-px bg-white/10" />
                    Built to be seen
                    <span className="w-8 h-px bg-white/10" />
                </div>
            </main>

            {/* Cinematic Overlay */}
            <div className="fixed inset-0 pointer-events-none border-[30px] border-charcoal z-[100] opacity-50 hidden md:block" />
        </div>
    );
}
