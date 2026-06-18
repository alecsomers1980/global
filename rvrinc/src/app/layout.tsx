import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: {
        default: "Roets & Van Rensburg Attorneys",
        template: "%s | RVR Inc."
    },
    description: "Upholding Justice. Premium legal services in South Africa. Specializing in Litigation, Property Law, and Corporate Services.",
    keywords: ["Attorneys", "Lawyers", "South Africa", "Legal Services", "Litigation", "RVR Inc"],
    metadataBase: new URL(SITE_URL),
    openGraph: {
        type: "website",
        locale: "en_ZA",
        url: SITE_URL,
        title: "Roets & Van Rensburg Attorneys",
        description: "Upholding Justice. Premium legal services in South Africa.",
        siteName: "RVR Inc.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Roets & Van Rensburg Attorneys",
        description: "Upholding Justice. Premium legal services in South Africa.",
    },
    icons: {
        icon: "/images/favicon.png",
        apple: "/images/favicon.png",
    },
};

const legalServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "Roets & Van Rensburg Inc.",
    url: SITE_URL,
    telephone: "+27871505683",
    email: "info@rvrinc.co.za",
    address: {
        "@type": "PostalAddress",
        streetAddress: "40 Van Ryneveld Avenue, Pierre van Ryneveld",
        addressLocality: "Pretoria",
        addressCountry: "ZA",
    },
    areaServed: ["Pretoria", "Marble Hall", "Gauteng", "Limpopo", "South Africa"],
    priceRange: "$$",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(inter.variable, playfair.variable, "min-h-screen bg-background font-sans antialiased")}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(legalServiceJsonLd) }}
                />
                {children}
            </body>
        </html>
    );
}
