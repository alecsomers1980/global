"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
    title: string;
    description: string;
    image?: string;
}

export function PageHeader({
    title,
    description,
    image = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2689&auto=format&fit=crop"
}: PageHeaderProps) {
    return (
        <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
            <div className="absolute inset-0 z-0 opacity-60">
                <div className="absolute inset-0 bg-slate-900/60 z-10" />
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-200">
                        {description}
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
