import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading-family",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-family",
});

export const metadata: Metadata = {
  title: "B Lubbe & Associates Attorneys | Table View, Cape Town",
  description:
    "B Lubbe & Associates Attorneys, Conveyancers, Notaries and Administrators of Deceased Estates. Based in Table View, Milnerton, Melkbosstrand, Cape Town.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA">
      <body className={`${heading.variable} ${body.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
