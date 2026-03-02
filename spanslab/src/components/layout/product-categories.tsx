"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
    {
        title: "Cement Stock Bricks",
        description: "Standard 7-10 MPa concrete bricks for residential and commercial masonry.",
        image: "/images/cement-stock.jpg",
        href: "/products/cement-stock-bricks",
    },
    {
        title: "Maxi Bricks",
        description: "Large format, high-strength bricks designed for faster construction and reduced labor.",
        image: "/images/cement-stock.jpg",
        href: "/products/maxi-bricks",
    },
    {
        title: "Hollow Blocks",
        description: "90mm, 140mm, and 190mm structural blocks for robust walling solutions.",
        image: "https://images.unsplash.com/photo-1590486803833-1c5c65d56d3a?q=80&w=800&auto=format&fit=crop",
        href: "/products/hollow-blocks",
    },
    {
        title: "Rib & Block Slabs",
        description: "The preferred suspended floor solution, 40% lighter than traditional slabs.",
        image: "/images/rib.jpg",
        href: "/products/rib-and-block-system",
    },
    {
        title: "50mm Bevel Paving",
        description: "Durable and elegant paving solution for residential driveways, patios, and pedestrian walkways.",
        image: "/images/50mm.jpg",
        href: "/products/50mm-bevel",
    },
    {
        title: "60mm Interlock Paving",
        description: "Strong interlocking design ideal for medium-duty vehicular traffic and commercial parking lots.",
        image: "/images/60mm.jpg",
        href: "/products/60mm-interlock",
    },
    {
        title: "80mm Interlock Paving",
        description: "Heavy-duty interlocking paving designed for high-traffic industrial zones and loading docks.",
        image: "/images/60mm.jpg",
        href: "/products/80mm-interlock",
    },
];

export function ProductCategories() {
    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-dark mb-6 tracking-tight">
                        Our Core Products
                    </h2>
                    <div className="w-20 h-1 bg-orange-DEFAULT mx-auto mb-6 rounded-full" />
                    <p className="text-slate-light max-w-2xl mx-auto text-lg leading-relaxed">
                        Precision-engineered concrete solutions manufactured to strict industrial standards for residential, commercial, and civil projects.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    {/* First Row: 4 Products */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
                        {categories.slice(0, 4).map((category, index) => (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative bg-concrete-DEFAULT rounded-2xl overflow-hidden border border-border/40 hover:border-orange-DEFAULT/30 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 flex flex-col"
                            >
                                <div className="relative h-56 w-full overflow-hidden shrink-0">
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-slate-dark mb-2 group-hover:text-orange-DEFAULT transition-colors duration-300">
                                        {category.title}
                                    </h3>
                                    <p className="text-slate-light text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                                        {category.description}
                                    </p>
                                    <Link
                                        href={category.href}
                                        className="inline-flex items-center text-sm font-bold text-orange-DEFAULT hover:text-orange-hover transition-colors group/link mt-auto"
                                    >
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Second Row: 3 Paving Products (Centered) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                        {categories.slice(4).map((category, index) => (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: (index + 4) * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative bg-concrete-DEFAULT rounded-2xl overflow-hidden border border-border/40 hover:border-orange-DEFAULT/30 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 flex flex-col"
                            >
                                <div className="relative h-56 w-full overflow-hidden shrink-0">
                                    <Image
                                        src={category.image}
                                        alt={category.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-slate-dark mb-2 group-hover:text-orange-DEFAULT transition-colors duration-300">
                                        {category.title}
                                    </h3>
                                    <p className="text-slate-light text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                                        {category.description}
                                    </p>
                                    <Link
                                        href={category.href}
                                        className="inline-flex items-center text-sm font-bold text-orange-DEFAULT hover:text-orange-hover transition-colors group/link mt-auto"
                                    >
                                        View Details
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
