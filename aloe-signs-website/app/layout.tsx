import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: {
    default: "Aloe Signs | Branding, Printing & Signage Company in South Africa",
    template: "%s | Aloe Signs",
  },
  description: "Professional branding, signage & large-format printing company in South Africa. We design, print & install high-impact branding that gets your business noticed.",
  keywords: "Branding company, Signage company, Printing company, Graphic design services, Large format printing, Custom signage, Professional branding solutions, Commercial signage, Outdoor advertising solutions, Business branding services, South Africa, Gauteng",
  metadataBase: new URL("https://aloesigns.co.za"),
  openGraph: {
    siteName: "Aloe Signs",
    locale: "en_ZA",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-[#0B0E0D] text-[#F8FAFC] ${manrope.variable} font-sans`}>
        <CartProvider>
          {children}
          <WhatsAppButton />
          <Footer />
          <CookieConsent />
          <Analytics />
          <SpeedInsights />
          <GoogleAnalytics gaId="G-G0CCD43F3Y" />
        </CartProvider>
      </body>
    </html>
  );
}
