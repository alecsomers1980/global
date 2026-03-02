"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function Testimonials() {
    return (
        <section className="py-24 bg-concrete-DEFAULT relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-dark mb-6 tracking-tight">
                        Trusted by Builders
                    </h2>
                    <div className="w-20 h-1 bg-orange-DEFAULT mx-auto mb-6 rounded-full" />
                    <p className="text-slate-light max-w-2xl mx-auto text-lg leading-relaxed">
                        Hear from the contractors and developers who rely on Spanslab for their most critical projects.
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
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-10 rounded-3xl border border-border/40 relative shadow-sm hover:shadow-xl transition-shadow duration-500"
                        >
                            <Quote className="absolute top-8 left-8 h-10 w-10 text-orange-DEFAULT/10" />
                            <p className="text-slate-dark text-lg leading-relaxed italic mb-8 pt-8 relative z-10 font-light">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center space-x-4 border-t border-border/40 pt-6">
                                <div className="w-12 h-12 bg-orange-DEFAULT/10 rounded-full flex items-center justify-center text-orange-DEFAULT font-bold text-lg">
                                    {testimonial.author.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-dark">{testimonial.author}</h4>
                                    <p className="text-sm text-orange-DEFAULT font-semibold tracking-wide uppercase">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
