import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Nyoni Education Hub | Where curiosity leads and creativity thrives",
  description:
    "Nyoni Education Hub is an environmentally friendly, child-centered school and tutor centre in White River, South Africa — School for Grade 4-7 and a Tutor Centre for Grade 8-12, focused on critical thinking, soft skills, and a calm learning environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${inter.variable} font-sans antialiased bg-brand-cream text-brand-navy`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
