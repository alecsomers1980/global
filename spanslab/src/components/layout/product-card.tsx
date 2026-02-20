"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
    slug: string;
}

export function ProductCard({ name, description, image, slug, category }: ProductCardProps) {
    return (
        <div className="group bg-white rounded-xl border border-border/60 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-DEFAULT text-xs font-semibold px-2 py-1 rounded-full border border-border/50">
                        {category}
                    </span>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-DEFAULT mb-2 group-hover:text-orange-DEFAULT transition-colors">
                    {name}
                </h3>
                <p className="text-slate-light text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                    {description}
                </p>
                <div className="mt-auto pt-4 border-t border-border/40">
                    <Link href={`/products/${slug}`}>
                        <Button variant="ghost" className="w-full justify-between hover:bg-orange-50 hover:text-orange-DEFAULT group-hover:text-orange-DEFAULT pl-0 hover:pl-4 transition-all duration-300">
                            View Specifications
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
