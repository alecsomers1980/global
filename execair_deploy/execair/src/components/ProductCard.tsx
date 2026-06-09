"use client";

import Image from "next/image";
import type { Product } from "@/lib/data";

interface ProductCardProps {
  product: Product;
  onGetQuote: (product: Product) => void;
}

export default function ProductCard({ product, onGetQuote }: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-navy/5">
      {/* Product Image */}
      <div className="relative flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-white p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,151,178,0.04),transparent_70%)]" />
        <Image
          src={product.image}
          alt={product.name}
          width={280}
          height={280}
          className="relative h-52 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col border-t border-gray-100/80 p-5">
        <h3 className="mb-1 text-base font-bold leading-tight text-brand-navy">
          {product.name}
        </h3>
        <p className="mb-3 text-sm font-semibold text-brand-teal">{product.btu}</p>

        <ul className="mb-5 flex-1 space-y-1.5">
          {product.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-brand-navy/55">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-teal/60"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* Spec pill tags */}
        {product.tags && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-brand-teal/15 bg-brand-sky/30 px-2.5 py-0.5 text-[11px] font-medium text-brand-teal"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => onGetQuote(product)}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-teal/90 hover:shadow-md hover:shadow-brand-teal/20 active:scale-[0.97]"
        >
          Get a quote
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
