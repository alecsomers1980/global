"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_STORAGE_KEY = "dbib-cookie-notice";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only execute on the client to avoid hydration mismatch
    const dismissed = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (dismissed !== "dismissed") {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(COOKIE_STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4"
      role="region"
      aria-label="Cookie notice"
    >
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-primary/10">
        <p className="text-sm text-gray-700 text-center sm:text-left">
          This site uses essential cookies to keep you signed in and first-party
          analytics to improve the directory.{" "}
          <Link
            href="/privacy"
            className="text-primary font-semibold underline hover:no-underline"
          >
            Privacy Policy
          </Link>
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 bg-primary text-white font-medium rounded-xl px-5 py-2 transition hover:shadow-md"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
