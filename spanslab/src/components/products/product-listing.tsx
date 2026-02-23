"use client";

import { useState } from "react";
import { ProductCard } from "@/components/layout/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/data";

interface ProductListingProps {
    products: Product[];
}

const categories = [
    { id: "all", label: "All Products" },
    { id: "rib-and-block", label: "Rib & Block" },
    { id: "paving", label: "Paving" },
    { id: "building-materials", label: "Building Materials" },
];

export function ProductListing({ products }: ProductListingProps) {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProducts = activeCategory === "all"
        ? products
        : products.filter(product => product.categoryId === activeCategory);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Filter */}
                <aside className="lg:w-1/4">
                    <div className="sticky top-24 space-y-2">
                        <h3 className="font-bold text-slate-DEFAULT mb-4 text-lg">Categories</h3>
                        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={cn(
                                        "text-left px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                        activeCategory === category.id
                                            ? "bg-orange-DEFAULT text-white shadow-md"
                                            : "text-slate-light hover:bg-slate-100 hover:text-slate-DEFAULT"
                                    )}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="lg:w-3/4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                description={product.description}
                                image={product.image}
                                category={product.category}
                                slug={product.slug}
                            />
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <p className="text-slate-light">No products found in this category.</p>
                            <Button
                                variant="link"
                                onClick={() => setActiveCategory("all")}
                                className="text-orange-DEFAULT mt-2"
                            >
                                View all products
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
