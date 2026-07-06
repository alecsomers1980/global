import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalyticsGate from "@/components/GoogleAnalyticsGate";

// Self-hosted brand header font (Microgramma D Extended Bold).
const microgramme = localFont({
  src: "../fonts/MicrogrammaDExtendedBold.otf",
  variable: "--font-microgramme",
  weight: "700",
  display: "swap",
});

export const siteConfig = {
  name: "Everest Motoring",
  description: "Premium Pre-Owned Vehicles in Mpumalanga",
  logo: "/images/logo.png",
  phone: "013 854 0600",
  email: "info@everestmotoring.co.za",
  address: "White River, Mpumalanga",
  companyName: "DeCar Beleggings (Pty) Ltd",
  registrationNumber: "2011/007142/07",
  vatNumber: "4780257772"
};

export const metadata = {
  title: `${siteConfig.name} | Premium Pre-Owned Used Cars`,
  description: siteConfig.description,
  icons: {
    icon: [{ url: "/images/favicon.png", type: "image/png" }],
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        <meta name="x-deploy-marker" content="EVEREST-DEPLOY-MARKER-2026-04-27-B" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${microgramme.variable} bg-background-light text-slate-900 font-body antialiased selection:bg-slate-800 selection:text-white`}>
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          <Header siteConfig={siteConfig} />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer siteConfig={siteConfig} />
        </div>
        <GoogleAnalyticsGate gaId={gaId} />
        <CookieConsent />
      </body>
    </html>
  );
}
