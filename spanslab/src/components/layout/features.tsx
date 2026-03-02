"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Truck, ShieldCheck, Ruler } from "lucide-react";

const features = [
    {
        icon: ShieldCheck,
        title: "Quality Guaranteed",
        description: "All our products are manufactured to meet strict industrial quality standards for safety and durability.",
    },
    {
        icon: Truck,
        title: "Reliable Delivery",
        description: "Our fleet ensures consistent, on-time delivery of materials across Mpumalanga.",
    },
    {
        icon: Ruler,
        title: "Precision Engineering",
        description: "Our Rib & Block slabs are engineered for exact fit, reducing waste and installation time.",
    },
    {
        icon: CheckCircle2,
        title: "Manufacturer Direct",
        description: "Buy direct from our Nelspruit factory for the best pricing on bulk concrete materials.",
    },
];

export function Features() {
    return (
        <section className="py-24 bg-concrete-DEFAULT border-y border-border/40 relative overflow-hidden">
            {/* Subtle background detail */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-DEFAULT/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-transparent hover:border-orange-DEFAULT/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-concrete-light rounded-2xl flex items-center justify-center mb-6 text-orange-DEFAULT group-hover:bg-orange-DEFAULT group-hover:text-white transition-colors duration-300 shadow-sm border border-border/50">
                                <feature.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-dark mb-3 text-balance tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-slate-light text-sm leading-relaxed max-w-xs text-balance">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
