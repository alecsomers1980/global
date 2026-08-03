import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://endlessluxury.co.za"),
  title: {
    default: "Endless Luxury — Exceptional Cars, Secured for You",
    template: "%s | Endless Luxury",
  },
  description:
    "Endless Luxury connects you with a curated selection of prestige vehicles, professional chauffeurs, and bespoke travel experiences across South Africa. Arrive without compromise.",
  keywords: [
    "luxury car hire",
    "chauffeur service",
    "executive car hire",
    "armoured vehicles",
    "wedding cars",
    "matric dance cars",
    "VIP protection",
    "yacht charter",
    "private aircraft",
    "South Africa",
  ],
  openGraph: {
    type: "website",
    siteName: "Endless Luxury",
    title: "Endless Luxury — Exceptional Cars, Secured for You",
    description:
      "Seamless access to cars, chauffeurs, and experiences that matter. Arrive without compromise.",
    images: ["/images/logoWhite.png"],
  },
  icons: {
    icon: "/images/cropped-favicon-1.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-ZA"
      className={`${montserrat.variable} ${poppins.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream text-navy">
        <StructuredData />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
