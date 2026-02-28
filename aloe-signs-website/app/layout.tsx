import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";



export const metadata: Metadata = {
  title: "Aloe Signs | Branding, Printing & Signage Company in South Africa",
  description: "Professional branding, signage & large-format printing company in South Africa. We design, print & install high-impact branding that gets your business noticed.",
  keywords: "Branding company, Signage company, Printing company, Graphic design services, Large format printing, Custom signage, Professional branding solutions, Commercial signage, Outdoor advertising solutions, Business branding services, South Africa, Gauteng",
  icons: {
    icon: '/aloe-logo.png',
    shortcut: '/aloe-logo.png',
    apple: '/aloe-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0B0E0D] text-[#F8FAFC]">
        <CartProvider>
          {children}
          <WhatsAppButton />
          <Footer />
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}

