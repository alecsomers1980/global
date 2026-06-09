"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import QuoteFormModal from "@/components/QuoteFormModal";
import type { Product, ProductCategory } from "@/lib/data";

export default function ProductGrid({ categories }: { categories: ProductCategory[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      {categories.map((category, catIndex) => (
        <div key={category.title} className={catIndex > 0 ? "mt-24" : ""}>
          {/* Category Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-teal/30 to-transparent" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-teal">
                Category {catIndex + 1}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-teal/30 to-transparent" />
            </div>
            <h2 className="text-3xl font-bold text-brand-navy md:text-4xl">
              {category.title}
            </h2>
            {category.description && (
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-brand-navy/55">
                {category.description}
              </p>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.products.map((product) => (
              <ProductCard
                key={product.name}
                product={product}
                onGetQuote={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      ))}

      <QuoteFormModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
