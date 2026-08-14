import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import LocalBusinessSchema from "@/components/site/LocalBusinessSchema";
import { SITE } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: { default: "Woodpecker Guesthouse", template: "%s | Woodpecker Guesthouse" },
  description:
    "Affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga — minutes from the Kruger National Park.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || SITE.phone.whatsapp;
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${figtree.variable} font-sans antialiased`}>
        {/* If JS fails to load/execute, Reveal.tsx's IntersectionObserver
            never adds .reveal-visible — don't let content stay invisible. */}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <LocalBusinessSchema />
        <Header />
        {children}
        <Footer />
        {whatsapp && <WhatsAppButton phone={whatsapp} />}
      </body>
    </html>
  );
}