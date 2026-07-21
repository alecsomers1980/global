"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "dianas-popup-last-seen";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/** Home page promo popup. Shows at most once per 30 days per browser. */
export default function HomePopup({
  image,
  alt,
  link,
}: {
  image: string;
  alt: string;
  link: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let show = true;
    try {
      const last = window.localStorage.getItem(STORAGE_KEY);
      if (last && Date.now() - Number(last) < ONE_MONTH_MS) show = false;
    } catch {
      // localStorage unavailable (private mode) — just show it.
    }
    if (!show) return;

    // Small delay so it doesn't fight the hero for attention on load.
    const t = setTimeout(() => {
      setOpen(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const close = () => setOpen(false);

  const picture = (
    <Image
      src={image}
      alt={alt}
      width={900}
      height={1200}
      className="w-full h-auto"
      priority
    />
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Promotion"}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", damping: 24, stiffness: 240 }}
          >
            <div className="relative pointer-events-auto w-full max-w-md max-h-[90dvh] overflow-hidden rounded-2xl bg-paper shadow-2xl">
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 rounded-full bg-black/50 text-white p-2 hover:bg-black/70 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              {link ? (
                <Link href={link} onClick={close} className="block">
                  {picture}
                </Link>
              ) : (
                picture
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
