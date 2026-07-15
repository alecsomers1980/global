'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ServiceHero from '@/components/ServiceHero';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { cart, getCartTotal } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        postalCode: ''
    });

    if (cart.length === 0) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="py-20">
                    <div className="max-w-[800px] mx-auto px-6 text-center">
                        <h1 className="text-3xl font-bold text-charcoal mb-4">Your cart is empty</h1>
                        <p className="text-medium-grey mb-8">Add some products before checking out!</p>
                        <Link
                            href="/shop"
                            className="inline-block px-8 py-3 bg-aloe-green text-charcoal font-semibold rounded hover:bg-green-hover transition-colors"
                        >
                            Go to Shop
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const shippingCost = 0;
    const total = getCartTotal();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Create order
            const orderResponse = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    customerAddress: {
                        street: formData.address,
                        city: formData.city,
                        province: formData.province,
                        postalCode: formData.postalCode
                    },
                    items: cart,
                    subtotal: getCartTotal(),
                    shipping: shippingCost,
                    total: total
                })
            });

            const orderData = await orderResponse.json();

            if (!orderData.success) {
                throw new Error('Failed to create order');
            }

            // Redirect to PayFast using dynamic form
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = orderData.payfastUrl;

            // Add all PayFast fields from the server
            Object.entries(orderData.payfastData).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to process order. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            <main>
                {/* Page Header */}
                <ServiceHero
                    title="Checkout"
                    tagline="SECURE PAYMENT"
                    description="Enter your billing details and finalize your Aloe Signs order securely."
                    backgroundImage="/images/portfolio/shopfront-1.jpg"
                    compact={true}
                />

                {/* Checkout Form */}
                <section className="py-12 bg-white">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                                {/* Billing Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-charcoal mb-6">Billing Details</h2>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-charcoal mb-2">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full px-4 py-3 border border-border-grey rounded focus:outline-none focus:border-aloe-green"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-charcoal mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full px-4 py-3 border border-border-grey rounded focus:outline-none focus:border-aloe-green"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-border-grey rounded focus:outline-none focus:border-aloe-green"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-border-grey rounded focus:outline-none focus:border-aloe-green"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-charcoal mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 border border-border-grey rounded focus:outline-none focus:border-aloe-green"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full px-4 py-3 border border-border-grey rounded focus:outline-none focus:border-aloe-green"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-2">
                                                Province *
                                            </label>
                                            <select
                                                required
                                                value={formData.province}
                                                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                                className="w-full px-4 py-3 border border-border-grey rounded focus:outline-none focus:border-aloe-green"
                                            >
                                                <option value="">Select...</option>
                                                <option value="Gauteng">Gauteng</option>
                                                <option value="Western Cape">Western Cape</option>
                                                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                                <option value="Eastern Cape">Eastern Cape</option>
                                                <option value="Free State">Free State</option>
                                                <option value="Limpopo">Limpopo</option>
                                                <option value="Mpumalanga">Mpumalanga</option>
                                                <option value="Northern Cape">Northern Cape</option>
                                                <option value="North West">North West</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-charcoal mb-2">
                                                Postal Code *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.postalCode}
                                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                className="w-full px-4 py-3 border border-border-grey rounded focus:outline-none focus:border-aloe-green"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="lg:sticky lg:top-24 h-fit">
                                    <div className="bg-bg-grey rounded-[2rem] p-8 space-y-6 border border-border-grey shadow-sm">
                                        <h2 className="text-2xl font-bold text-charcoal">Your Order</h2>

                                        {/* Order Items */}
                                        <div className="space-y-3">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="text-medium-grey">
                                                        {item.name} × {item.quantity}
                                                    </span>
                                                    <span className="font-medium text-charcoal">
                                                        R{formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-border-grey pt-4 space-y-3">
                                            <div className="flex justify-between text-medium-grey">
                                                <span>Subtotal</span>
                                                <span>R{formatPrice(getCartTotal())}</span>
                                            </div>
                                            <div className="flex justify-between text-medium-grey">
                                                <span>Shipping</span>
                                                <span className="text-aloe-green font-bold">
                                                    {cart.some(item => item.category === 'billboards') ? 'INCLUDED' : 'FREE'}
                                                </span>
                                            </div>
                                            <div className="border-t border-border-grey pt-3 flex justify-between text-xl font-bold text-charcoal">
                                                <span>Total</span>
                                                <span>R{formatPrice(getCartTotal())}</span>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="bg-white rounded p-4 text-sm text-medium-grey">
                                            <p className="font-medium text-charcoal mb-2">Payment Method</p>
                                            <p>Secure payment via PayFast</p>
                                            {process.env.NEXT_PUBLIC_PAYFAST_MODE !== 'production' && (
                                                <p className="text-xs mt-2 text-aloe-green">✓ Sandbox mode (test payments)</p>
                                            )}
                                        </div>

                                        {/* Place Order Button */}
                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="w-full px-6 py-4 bg-aloe-green text-charcoal font-bold text-center rounded-full hover:bg-green-hover transition-colors disabled:bg-light-grey disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                                        </button>

                                        <p className="text-xs text-medium-grey text-center">
                                            By placing your order, you agree to our terms and conditions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Form generated dynamically on checkout success */}
            </main>
        </div>
    );
}
