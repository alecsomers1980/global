import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/JsonLd";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = "https://endlessglobalpoint.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Endless Global Point | Connecting You to the Right Solutions",
    template: "%s | Endless Global Point",
  },
  description:
    "Endless Global Point is a global business matchmaking agency connecting you with trusted experts in investment, financial, trade, and consulting services to help your business grow.",
  keywords: [
    "business matchmaking",
    "investment services",
    "financial services",
    "trade services",
    "consulting services",
    "South Africa",
    "global business connections",
  ],
  authors: [{ name: "Endless Global Point" }],
  openGraph: {
    type: "website",
    siteName: "Endless Global Point",
    title: "Endless Global Point | Connecting You to the Right Solutions",
    description:
      "We link you with trusted experts in investment, financial, trade, and consulting services to help your business grow.",
    url: siteUrl,
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Endless Global Point | Connecting You to the Right Solutions",
    description:
      "We link you with trusted experts in investment, financial, trade, and consulting services to help your business grow.",
  },
  alternates: { canonical: siteUrl },
  robots: { index: true, follow: true },
  icons: { icon: "/images/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA" className={montserrat.variable}>
      <body>
        <JsonLd />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
