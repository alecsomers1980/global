import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { SITE_URL, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bushbuckridge Community Directory",
    template: "%s | Bushbuckridge Community Directory",
  },
  description: "Find trusted local businesses, job opportunities, and community events in the Bushbuckridge region.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Bushbuckridge Community Directory",
    url: SITE_URL,
    title: "Bushbuckridge Community Directory",
    description: "Find trusted local businesses, job opportunities, and community events in the Bushbuckridge region.",
    images: [absoluteUrl("/banner.webp")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bushbuckridge Community Directory",
    description: "Find trusted local businesses, job opportunities, and community events in the Bushbuckridge region.",
    images: [absoluteUrl("/banner.webp")],
  },
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import JsonLd from "@/components/JsonLd";
import { organizationLd, websiteLd } from "@/lib/structured-data";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
