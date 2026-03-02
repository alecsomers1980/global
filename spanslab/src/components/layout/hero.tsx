"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] lg:min-h-[800px] flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-dark/95 via-slate-dark/90 to-slate-800/80 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2670&auto=format&fit=crop"
                    alt="Construction Site background"
                    fill
                    className="object-cover scale-105 opacity-60"
                    priority
                />
            </div>

            <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 mt-20 md:mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Content */}
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center rounded-full border border-orange-DEFAULT/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-orange-DEFAULT mb-8 backdrop-blur-md shadow-inner">
                                <span className="flex h-2.5 w-2.5 rounded-full bg-orange-DEFAULT mr-3 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                                Nelspruit's Premier Concrete Supplier
                            </div>

                            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
                                Building Strong <br />
                                Foundations with <span className="text-orange-DEFAULT drop-shadow-sm">Precision</span>.
                            </h1>

                            <p className="text-xl text-slate-300 md:text-2xl mb-10 leading-relaxed font-light">
                                Manufacturer of high-quality Cement Stock Bricks, Maxi Bricks, Rib & Block Slabs, and Paving. Quality materials, direct from our factory to your site.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 mb-14">
                                <Button size="lg" className="bg-orange-DEFAULT hover:bg-orange-hover text-white text-lg px-8 h-14 shadow-lg shadow-orange-DEFAULT/20 transition-all hover:scale-105 active:scale-95">
                                    Get a Free Quote
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white hover:text-slate-dark text-lg px-8 h-14 backdrop-blur-sm transition-all hover:scale-105">
                                    View Our Products
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-white/10 pt-8">
                                {[
                                    { text: "High-Quality Standards", icon: CheckCircle2 },
                                    { text: "Direct Factory Pricing", icon: CheckCircle2 },
                                    { text: "Expert Technical Support", icon: CheckCircle2 },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                        className="flex items-center space-x-3 text-white/80"
                                    >
                                        <item.icon className="h-5 w-5 text-orange-DEFAULT flex-shrink-0" />
                                        <span className="text-sm font-medium tracking-wide leading-tight">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Hexagons */}
                    <div className="hidden lg:flex justify-center items-center relative h-[600px] w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative w-[500px] h-[500px]"
                        >
                            {/* Hexagon 1: Top Left */}
                            <div
                                className="absolute top-[5%] left-[5%] w-[48%] h-[55%] bg-slate-800 transition-transform duration-700 hover:scale-105 hover:z-30 shadow-2xl overflow-hidden group"
                                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                            >
                                <Image src="/images/cement-stock.jpg" fill className="object-cover group-hover:scale-110 transition-transform duration-700" alt="Cement Stock Bricks" />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>

                            {/* Hexagon 2: Top Right */}
                            <div
                                className="absolute top-[5%] right-[2%] w-[48%] h-[55%] bg-orange-DEFAULT transition-transform duration-700 hover:scale-105 hover:z-30 shadow-2xl overflow-hidden group"
                                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                            >
                                <Image src="/images/rib.jpg" fill className="object-cover group-hover:scale-110 transition-transform duration-700" alt="Rib and Block" />
                                <div className="absolute inset-0 bg-orange-DEFAULT/30 mix-blend-multiply" />
                            </div>

                            {/* Hexagon 3: Bottom Center */}
                            <div
                                className="absolute bottom-[0%] left-[26.5%] w-[50%] h-[58%] bg-slate-700 transition-transform duration-700 hover:scale-105 hover:z-30 shadow-2xl overflow-hidden group border-[6px] border-white/10"
                                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                            >
                                <Image src="/images/60mm.jpg" fill className="object-cover group-hover:scale-110 transition-transform duration-700" alt="Interlocking Paving" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>

                            {/* Center Decorative Hexagon - Smaller overlay */}
                            <div
                                className="absolute top-[40%] left-[35%] w-[30%] h-[35%] bg-orange-DEFAULT flex items-center justify-center opacity-95 shadow-[0_0_30px_rgba(249,115,22,0.6)] backdrop-blur-sm z-40 transition-transform hover:scale-110 duration-500"
                                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                            >
                                <div className="text-white text-center flex flex-col items-center">
                                    <span className="text-3xl font-extrabold tracking-tight">#1</span>
                                    <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Provider</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:block"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-orange-DEFAULT/80 to-transparent" />
            </motion.div>
        </section>
    );
}
