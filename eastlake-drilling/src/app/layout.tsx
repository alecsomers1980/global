import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "East Lake Drilling – Your Borehole Specialists",
  description:
    "Professional borehole drilling, pump installation and water purification services in Johannesburg and Randburg. East Lake Drilling – your trusted borehole specialists.",
  metadataBase: new URL("https://eastlakedrilling.co.za"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "borehole drilling",
    "borehole Johannesburg",
    "pump installation",
    "water filtration",
    "water testing",
    "off-grid solar borehole",
    "Randburg",
    "Gauteng",
  ],
  openGraph: {
    title: "East Lake Drilling – Your Borehole Specialists",
    description:
      "Professional borehole drilling, pump installation and water purification services in Johannesburg and Randburg.",
    url: "/",
    siteName: "East Lake Drilling",
    images: [
      {
        url: "/images/logo.png",
        width: 1628,
        height: 597,
        alt: "East Lake Drilling logo",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  icons: {
    icon: "/images/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0089F7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen flex flex-col bg-paper text-ink antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}