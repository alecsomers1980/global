"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
    return (
        <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-concrete-light">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/50 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2670&auto=format&fit=crop"
                    alt="Construction Site background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400 mb-6 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-orange-DEFAULT mr-2 animate-pulse"></span>
                            Nelspruit's Premier Concrete Supplier
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                            Building Strong Foundations with <span className="text-orange-DEFAULT">Precision</span>.
                        </h1>

                        <p className="text-lg md:text-xl text-slate-200 mb-8 leading-relaxed max-w-2xl">
                            From Rib & Block slabs to paving, Spanslab delivers industrial-grade quality for residential and commercial projects across Mpumalanga.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Button size="lg" className="bg-orange-DEFAULT hover:bg-orange-hover text-white text-base px-8 h-12">
                                Get a Free Quote
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-DEFAULT text-base px-8 h-12">
                                View Our Products
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8">
                            <div className="flex items-center space-x-2 text-white/90">
                                <CheckCircle2 className="h-5 w-5 text-orange-DEFAULT" />
                                <span className="text-sm font-medium">SABS Approved Quality</span>
                            </div>
                            <div className="flex items-center space-x-2 text-white/90">
                                <CheckCircle2 className="h-5 w-5 text-orange-DEFAULT" />
                                <span className="text-sm font-medium">Fast Turnaround Times</span>
                            </div>
                            <div className="flex items-center space-x-2 text-white/90">
                                <CheckCircle2 className="h-5 w-5 text-orange-DEFAULT" />
                                <span className="text-sm font-medium">Expert Technical Support</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
