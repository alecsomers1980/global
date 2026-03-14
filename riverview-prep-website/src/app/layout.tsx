import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Riverview Preparatory School | Heritage & Excellence",
  description: "A prestigious preparatory school in Malelane, Mpumalanga, South Africa. Fostering cognitive, physical, emotional, and social excellence since 1996.",
  keywords: ["Riverview Preparatory School", "Malelane", "Mpumalanga", "Independent School South Africa", "Preparatory School"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${playfairDisplay.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
