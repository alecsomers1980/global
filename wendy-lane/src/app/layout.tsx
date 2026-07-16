import type { Metadata } from "next";
import { Inter, Bitter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BUSINESS, SITE_URL } from "@/data/business";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Bitter({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Wendy Houses & Timber Cabins in Nelspruit | Wendy Lane — Since 1993",
    template: "%s | Wendy Lane Nelspruit",
  },
  description:
    "Wendy houses, site offices, classrooms, clinics and timber cabins built in Nelspruit since 1993. Real published prices, delivered and assembled across the Lowveld.",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    siteName: BUSINESS.name,
    url: SITE_URL,
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "Wendy Lane, Nelspruit" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

/**
 * LocalBusiness schema. The NAP data must match what's rendered on the page —
 * both read from BUSINESS so they cannot drift apart.
 */
function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    telephone: BUSINESS.phone.display,
    email: BUSINESS.email,
    foundingDate: String(BUSINESS.established),
    founder: { "@type": "Person", name: BUSINESS.owner },
    image: `${SITE_URL}/images/og-default.jpg`,
    logo: `${SITE_URL}/images/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
    areaServed: BUSINESS.serviceAreas.map((a) => ({ "@type": "Place", name: a })),
    sameAs: [BUSINESS.social.facebook, BUSINESS.social.instagram],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "07:30",
        closes: "17:00",
      },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "07:30", closes: "16:30" },
    ],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans bg-cream text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
        />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
