"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
    {
        title: "Rib & Block Slabs",
        description: "Engineered concrete flooring systems for efficient construction.",
        image: "https://images.unsplash.com/photo-1590486803833-1c5c65d56d3a?q=80&w=800&auto=format&fit=crop",
        href: "/products?category=rib-and-block",
    },
    {
        title: "Bevel Paving",
        description: "Durable 50mm and 60mm interlock pavers for driveways and roads.",
        image: "https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80&w=800&auto=format&fit=crop",
        href: "/products?category=paving",
    },
    {
        title: "Building Materials",
        description: "Sand, stone, cement, and mesh for all construction needs.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
        href: "/products?category=building-materials",
    },
];

export function ProductCategories() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-DEFAULT mb-4">
                        Our Core Products
                    </h2>
                    <p className="text-slate-light max-w-2xl mx-auto text-lg">
                        Manufactured to strict industrial standards for residential, commercial, and civil projects.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative bg-concrete-light rounded-lg overflow-hidden border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={category.image}
                                    alt={category.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-DEFAULT mb-2 group-hover:text-orange-DEFAULT transition-colors">
                                    {category.title}
                                </h3>
                                <p className="text-slate-light text-sm mb-4 line-clamp-2">
                                    {category.description}
                                </p>
                                <Link
                                    href={category.href}
                                    className="inline-flex items-center text-sm font-semibold text-orange-DEFAULT hover:text-orange-hover transition-colors"
                                >
                                    View Details
                                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
