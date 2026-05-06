import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Exec-Air Air Conditioning | HVAC Specialists Since 1989",
    template: "%s | Exec-Air Air Conditioning",
  },
  description:
    "Specialists in commercial, industrial and residential HVAC. Over 35 years of experience in heating, ventilation, and air conditioning solutions.",
  keywords: [
    "HVAC",
    "air conditioning",
    "air conditioners",
    "Exec-Air",
    "Krugersdorp",
    "heating",
    "ventilation",
    "commercial HVAC",
    "industrial HVAC",
    "residential HVAC",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Header />
        <main className="relative min-h-screen">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
