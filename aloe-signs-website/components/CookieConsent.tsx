'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const accepted = localStorage.getItem('cookieConsent');
        if (!accepted) {
            // distinct delay for better UX
            const timer = setTimeout(() => setShow(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-charcoal text-white shadow-lg border-t border-aloe-green/30 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 pr-8">
                    <p className="text-sm md:text-base text-light-grey">
                        We use cookies to enhance your browsing experience and analyze our traffic. By continuing to use our website, you consent to our use of cookies in accordance with our <Link href="/privacy-policy" className="text-aloe-green hover:underline">Privacy Policy</Link>.
                    </p>
                </div>
                <div className="flex items-center gap-4 min-w-fit">
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 bg-aloe-green text-charcoal font-bold rounded hover:bg-green-hover transition-colors text-sm md:text-base whitespace-nowrap"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={() => setShow(false)}
                        className="text-medium-grey hover:text-white transition-colors p-1"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
