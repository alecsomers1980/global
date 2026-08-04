import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Archivo carries a proper heavy weight and condensed feel for the
// "WILD BY NATURE" statement lines without needing a paid face.
const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Caracal Footwear — Handcrafted Vellies",
    template: "%s | Caracal Footwear",
  },
  description:
    "Handcrafted South African vellies in genuine leather with a non-slip TPR sole. Sizes 4 to 15. Free delivery on orders over R1 000.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-ZA"
      className={`${inter.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col bg-canvas text-text">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
