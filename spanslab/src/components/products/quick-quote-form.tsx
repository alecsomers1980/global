"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

interface QuickQuoteFormProps {
    productName: string;
}

export function QuickQuoteForm({ productName }: QuickQuoteFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="bg-green-50 border border-green-200 p-8 rounded-xl text-center">
                <h3 className="text-xl font-bold text-green-900 mb-2">Request Received!</h3>
                <p className="text-green-700">Thank you for your interest in our {productName}. Our team will contact you shortly with a formal quote.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 border border-border p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-slate-DEFAULT mb-2">Get a Quick Quote</h3>
            <p className="text-slate-light text-sm mb-6">Need bulk pricing or delivery details? Send us your requirements.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input type="hidden" value={productName} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+27 82 000 0000" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quantity">Approximate Quantity / m²</Label>
                    <Input id="quantity" placeholder="e.g. 5000 bricks or 120m²" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Delivery Address / Additional Notes</Label>
                    <Textarea id="message" placeholder="Provide delivery address or special requirements..." className="min-h-[100px]" />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-DEFAULT hover:bg-orange-hover text-white py-6 text-lg font-bold transition-all hover:shadow-md">
                    {isSubmitting ? "Sending..." : (
                        <>
                            Request Quote <Send className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <p className="mt-4 text-[10px] text-center text-slate-400">
                Direct from Manufacturer | Quality Guaranteed
            </p>
        </div>
    );
}
