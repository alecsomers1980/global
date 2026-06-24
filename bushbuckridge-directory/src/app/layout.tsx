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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dbib.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Doing Business in Bushbuckridge (DBiB) — Local Business Directory",
    template: "%s | Doing Business in Bushbuckridge",
  },
  description:
    "Find trusted local businesses, job opportunities, tenders and community events in the Bushbuckridge region. The Doing Business in Bushbuckridge (DBiB) directory.",
  applicationName: "Doing Business in Bushbuckridge",
  keywords: [
    "Bushbuckridge",
    "business directory",
    "local businesses Bushbuckridge",
    "jobs Bushbuckridge",
    "tenders",
    "Mpumalanga",
    "Acornhoek",
    "Thulamahashe",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: SITE_URL,
    siteName: "Doing Business in Bushbuckridge",
    title: "Doing Business in Bushbuckridge (DBiB) — Local Business Directory",
    description:
      "Find trusted local businesses, jobs, tenders and events in the Bushbuckridge region.",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Doing Business in Bushbuckridge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doing Business in Bushbuckridge (DBiB)",
    description:
      "Find trusted local businesses, jobs, tenders and events in the Bushbuckridge region.",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import CookieNotice from "@/components/CookieNotice";
import OrganizationSchema from "@/components/OrganizationSchema";

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
        <OrganizationSchema />
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
        <CookieNotice />
      </body>
    </html>
  );
}
