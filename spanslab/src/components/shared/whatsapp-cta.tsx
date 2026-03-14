"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppCTA() {
    const phoneNumber = "27137521111"; // Standardized to the office number provided in footer
    const message = "Hi Spanslab, I'm interested in a quote for your products.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 animate-bounce hover:animate-none"
        >
            <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg border-2 border-white"
            >
                <MessageCircle className="h-8 w-8 text-white" />
                <span className="sr-only">Contact on WhatsApp</span>
            </Button>
        </a>
    );
}
