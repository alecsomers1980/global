import type { Metadata } from "next";
import { Public_Sans, JetBrains_Mono } from "next/font/google"; // Changed imports
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spanslab - Professional Concrete Products & Construction Materials",
  description: "Nelspruit's trusted supplier of Rib & Block slabs and Paving. Quality construction materials delivered with precision.",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://www.spanslab.co.za",
    siteName: "Spanslab",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Spanslab Construction Products",
    }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          publicSans.variable,
          jetbrainsMono.variable
        )}
      >
        <Navbar />
        <main className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
