"use client";

import { Quote } from "lucide-react";

export function Testimonials() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-DEFAULT mb-4">
                        Trusted by Builders
                    </h2>
                    <p className="text-slate-light max-w-2xl mx-auto text-lg">
                        Hear from contractors and developers who rely on Spanslab.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            quote: "Spanslab's Rib & Block system saved us 2 days on our last slab pour. The quality and service is unmatched in Nelspruit.",
                            author: "Johan Venter",
                            role: "Project Manager, Venter Construction",
                        },
                        {
                            quote: "Reliable delivery is critical for us. Spanslab is the only supplier that consistently hits our tight windows.",
                            author: "Sipho Nkosi",
                            role: "Site Foreman, Civil Civils",
                        },
                        {
                            quote: "Great paving products and really helpful advice on the quantities we needed. Highly recommended for DIYers too.",
                            author: "Michelle Steyn",
                            role: "Homeowner",
                        },
                    ].map((testimonial, i) => (
                        <div key={i} className="bg-concrete-light p-8 rounded-2xl border border-border/50 relative">
                            <Quote className="absolute top-6 left-6 h-8 w-8 text-orange-DEFAULT/20" />
                            <p className="text-slate-DEFAULT text-base leading-relaxed italic mb-6 pt-6 relative z-10">
                                "{testimonial.quote}"
                            </p>
                            <div>
                                <h4 className="font-bold text-slate-DEFAULT">{testimonial.author}</h4>
                                <p className="text-xs text-orange-DEFAULT font-medium">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
