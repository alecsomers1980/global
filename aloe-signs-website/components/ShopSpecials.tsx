'use client';

import { products, getLowestUnitPrice } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

// Filter for featured/special products (using IDs as before)
const featuredProductIds = ['estate-board-small', 'estate-board-medium', 'estate-board-large'];
const featuredProducts = products.filter(p => featuredProductIds.includes(p.id));

export default function ShopSpecials() {
    return (
        <section className="py-32 bg-charcoal">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-sm md:text-base text-aloe-green font-bold tracking-[0.2em] uppercase mb-4 flex items-center justify-center gap-4">
                        <span className="w-12 h-1 bg-aloe-green block"></span>
                        Shop Online
                        <span className="w-12 h-1 bg-aloe-green block"></span>
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                        Ready To Ship <span className="text-aloe-green">Specials</span>
                    </h3>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Save big on our most popular and ready-made signage products.
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {featuredProducts.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {/* View All Link */}
                <div className="text-center mt-20">
                    <Link
                        href="/shop"
                        className="inline-block px-10 py-4 border-2 border-aloe-green text-aloe-green hover:bg-aloe-green hover:text-charcoal font-black rounded uppercase tracking-widest transition-colors text-lg"
                    >
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
}
