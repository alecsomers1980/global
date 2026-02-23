import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const siteConfig = {
  name: "Everest Motoring",
  description: "Premium Pre-Owned Vehicles in Mpumalanga",
  logo: "/images/logo.png",
  phone: "013 750 0812",
  email: "sales@everestmotoring.co.za",
  address: "White River, Mpumalanga"
};

export const metadata = {
  title: `${siteConfig.name} | Premium Pre-Owned Used Cars`,
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${spaceGrotesk.variable} bg-background-light text-slate-900 font-display antialiased selection:bg-primary/20 selection:text-primary`}>
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          <Header siteConfig={siteConfig} />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer siteConfig={siteConfig} />
        </div>
      </body>
    </html>
  );
}
