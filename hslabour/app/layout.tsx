import { Roboto } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hslabour.co.za"),
  title: {
    default: "H&S Labour Brokers — Recruitment, TES & Payroll in South Africa",
    template: "%s | H&S Labour Brokers",
  },
  description:
    "H&S Labour Brokers: permanent & contract recruitment, Temporary Employment Services (TES), payroll, vetting and HR solutions across South Africa since 1998.",
  openGraph: {
    type: "website",
    siteName: "H&S Labour Brokers",
    locale: "en_ZA",
    url: "https://hslabour.co.za",
    images: ["/images/HSL-Logo-112x112.png"],
  },
  twitter: {
    card: "summary",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/HSL-Logo-112x112.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}