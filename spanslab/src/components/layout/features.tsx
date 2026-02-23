"use client";

import { CheckCircle2, Truck, ShieldCheck, Ruler } from "lucide-react";

const features = [
    {
        icon: ShieldCheck,
        title: "SABS Approved",
        description: "All our products are manufactured to meet strict SABS quality standards for safety and durability.",
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
        title: "Expert Support",
        description: "Our technical team provides on-site support and engineering advice for complex projects.",
    },
];

export function Features() {
    return (
        <section className="py-20 bg-concrete-light border-y border-border/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-border mb-6 text-orange-DEFAULT">
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-DEFAULT mb-3 text-balance">
                                {feature.title}
                            </h3>
                            <p className="text-slate-light text-sm leading-relaxed max-w-xs text-balance">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
