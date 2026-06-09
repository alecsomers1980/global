"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] animate-in slide-in-from-bottom border-t border-brand-teal/20 bg-white/95 shadow-2xl backdrop-blur-xl">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
        <p className="text-center text-sm leading-relaxed text-brand-navy/70 sm:text-left">
          This website uses cookies to improve your experience. By continuing, you agree to our{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-brand-teal underline underline-offset-2 transition-colors hover:text-brand-teal/80"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-shrink-0 gap-3">
          <button
            onClick={decline}
            className="rounded-full border border-brand-navy/15 px-5 py-2 text-sm font-medium text-brand-navy/60 transition-all hover:bg-brand-navy/5"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-brand-teal px-5 py-2 text-sm font-medium text-white transition-all hover:bg-brand-teal/90"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
