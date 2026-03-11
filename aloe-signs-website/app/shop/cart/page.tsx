'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import Header from '@/components/Header';
import ServiceHero from '@/components/ServiceHero';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const [deliveryOption, setDeliveryOption] = useState<'courier' | 'collection'>('courier');

    const deliveryCost = deliveryOption === 'courier' ? 250 : 0;

    if (cart.length === 0) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="py-20">
                    <div className="max-w-[800px] mx-auto px-6 text-center">
                        <svg className="w-24 h-24 mx-auto text-light-grey mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-charcoal mb-4">Your cart is empty</h1>
                        <p className="text-medium-grey mb-8">Add some products to get started!</p>
                        <Link
                            href="/shop"
                            className="inline-block px-8 py-3 bg-aloe-green text-charcoal font-semibold rounded hover:bg-green-hover transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            <main>
                {/* Page Header */}
                <ServiceHero
                    title="Shopping Cart"
                    tagline="REVIEW YOUR ORDER"
                    description="Confirm your quantities, check shipping options, and finalize your custom signage before checking out."
                    backgroundImage="/images/portfolio/shopfront-1.jpg" // Same background as shop for consistency
                    compact={true}
                />

                {/* Cart Content */}
                <section className="py-12 bg-white">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                            {/* Cart Items */}
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div
                                        key={item.cartId}
                                        className="bg-white border border-border-grey rounded-[2rem] p-6 flex gap-6"
                                    >
                                        {/* Product Image */}
                                        <div className="relative w-32 h-32 bg-bg-grey rounded-2xl flex-shrink-0 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <Link href={`/shop/${item.id}`}>
                                                    <h3 className="font-bold text-charcoal hover:text-aloe-green transition-colors">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-medium-grey">{item.size}</p>
                                                {item.selectedOptions && (
                                                    <div className="text-sm text-charcoal mt-1 space-y-0.5">
                                                        <p>• {item.selectedOptions.sides === 'single' ? 'Single Sided' : 'Double Sided'}</p>
                                                        <p>• Batch of {item.selectedOptions.quantity}</p>
                                                        {item.selectedOptions.artwork && <p>• Design / Artwork Included</p>}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-2xl font-bold text-aloe-green">
                                                R{formatPrice(item.price)}
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-4">
                                                {!item.selectedOptions ? (
                                                    <div className="flex items-center border border-border-grey rounded">
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                                            className="px-4 py-2 hover:bg-bg-grey transition-colors"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="px-6 py-2 border-x border-border-grey font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                                            className="px-4 py-2 hover:bg-bg-grey transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-medium-grey italic">
                                                        Cannot change quantity of batch
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => removeFromCart(item.cartId)}
                                                    className="text-red-500 hover:underline text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <p className="text-sm text-medium-grey mb-1">Subtotal</p>
                                            <p className="text-2xl font-bold text-charcoal">
                                                R{formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Clear Cart */}
                                <button
                                    onClick={clearCart}
                                    className="text-red-500 hover:underline text-sm"
                                >
                                    Clear entire cart
                                </button>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:sticky lg:top-24 h-fit">
                                <div className="bg-bg-grey rounded-[2rem] p-8 space-y-6 border border-border-grey">
                                    <h2 className="text-2xl font-bold text-charcoal">Order Summary</h2>

                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded border border-border-grey space-y-3">
                                            <p className="font-bold text-charcoal">Delivery Method</p>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="delivery"
                                                    checked={deliveryOption === 'courier'}
                                                    onChange={() => setDeliveryOption('courier')}
                                                    className="w-4 h-4 text-aloe-green focus:ring-aloe-green"
                                                />
                                                <span className="text-medium-grey flex-1">Nationwide Courier</span>
                                                <span className="font-semibold text-charcoal">R250</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="delivery"
                                                    checked={deliveryOption === 'collection'}
                                                    onChange={() => setDeliveryOption('collection')}
                                                    className="w-4 h-4 text-aloe-green focus:ring-aloe-green"
                                                />
                                                <span className="text-medium-grey flex-1">Collection (JHB)</span>
                                                <span className="font-semibold text-charcoal">FREE</span>
                                            </label>
                                        </div>

                                        <div className="flex justify-between text-medium-grey pt-4 border-t border-border-grey">
                                            <span>Subtotal</span>
                                            <span>R{formatPrice(getCartTotal())}</span>
                                        </div>
                                        <div className="flex justify-between text-medium-grey">
                                            <span>Shipping</span>
                                            <span className="text-charcoal font-semibold">
                                                {deliveryOption === 'courier' ? 'R 250' : 'FREE'}
                                            </span>
                                        </div>
                                        <div className="border-t border-border-grey pt-3 flex justify-between text-xl font-bold text-charcoal">
                                            <span>Total (Excl. VAT)</span>
                                            <span>R{formatPrice(getCartTotal() + deliveryCost)}</span>
                                        </div>
                                    </div>

                                    {/* Promotional Credit Alert */}
                                    <div className="bg-white border-l-4 border-aloe-green p-4 rounded-r-lg shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-aloe-green mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-bold text-charcoal">Lucky Number 10?</p>
                                                <p className="text-xs text-medium-grey mt-0.5">Every 10th client receives <strong className="text-aloe-green">R100 in credit</strong> applied to their next order.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href="/shop/checkout"
                                        className="block w-full px-6 py-4 bg-aloe-green text-charcoal font-bold text-center rounded hover:bg-green-hover transition-colors"
                                    >
                                        Proceed to Checkout
                                    </Link>

                                    <Link
                                        href="/shop"
                                        className="block text-center text-aloe-green hover:underline"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
