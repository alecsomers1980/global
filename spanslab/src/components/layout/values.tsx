"use client";

import { Award, Heart, Shield, Users } from "lucide-react";

const values = [
    {
        icon: Award,
        title: "Quality First",
        description: "We never compromise on the strength or finish of our products. SABS standards are our minimum.",
    },
    {
        icon: Shield,
        title: "Safety & Integrity",
        description: "Building is a responsibility. We ensure our materials are safe, reliable, and honestly spec'd.",
    },
    {
        icon: Users,
        title: "Customer Focus",
        description: "From DIY homeowners to large developers, every client gets our full attention and expertise.",
    },
    {
        icon: Heart,
        title: "Community Driven",
        description: "Proudly rooted in Nelspruit, we support local growth and employment opportunities.",
    },
];

export function ValuesSection() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-DEFAULT mb-4">Our Values</h2>
                    <p className="text-slate-light max-w-2xl mx-auto">
                        The principles that lay the foundation for everything we do.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value) => (
                        <div key={value.title} className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-orange-200 transition-colors group">
                            <value.icon className="w-10 h-10 text-slate-400 group-hover:text-orange-DEFAULT mb-4 transition-colors" />
                            <h3 className="text-lg font-bold text-slate-DEFAULT mb-2">{value.title}</h3>
                            <p className="text-slate-light text-sm leading-relaxed">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
