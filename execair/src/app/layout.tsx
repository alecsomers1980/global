import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { localBusinessSchema } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://execair.co.za"),
  title: {
    default:
      "Air Conditioning Krugersdorp | HVAC Specialists Since 1989 — Exec-Air",
    template: "%s | Exec-Air Air Conditioning Krugersdorp",
  },
  description:
    "HVAC specialists in Krugersdorp & Johannesburg since 1989. Commercial, industrial and residential air conditioning installation, service and maintenance across Gauteng.",
  keywords: [
    "air conditioning Krugersdorp",
    "HVAC Johannesburg",
    "air conditioning Gauteng",
    "commercial HVAC South Africa",
    "industrial air conditioning",
    "residential air conditioning",
    "Daikin installer South Africa",
    "LG air conditioner",
    "Samsung HVAC",
    "Exec-Air",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Exec-Air Air Conditioning",
    locale: "en_ZA",
    url: "/",
    title: "Air Conditioning Krugersdorp | HVAC Specialists — Exec-Air",
    description:
      "Commercial, industrial and residential HVAC across Gauteng since 1989.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Air Conditioning Krugersdorp | HVAC Specialists — Exec-Air",
    description:
      "Commercial, industrial and residential HVAC across Gauteng since 1989.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA" className={inter.variable}>
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/hero/Exec-Air_BrandedFleet_HeaderImage.jpg"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="antialiased">
        <Header />
        <main className="relative min-h-screen">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
