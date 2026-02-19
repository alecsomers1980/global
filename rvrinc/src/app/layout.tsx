import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: {
        default: "Roets & Van Rensburg Attorneys",
        template: "%s | RVR Inc."
    },
    description: "Upholding Justice. Premium legal services in South Africa. Specializing in Litigation, Property Law, and Corporate Services.",
    keywords: ["Attorneys", "Lawyers", "South Africa", "Legal Services", "Litigation", "RVR Inc"],
    openGraph: {
        type: "website",
        locale: "en_ZA",
        url: "https://rvrinc.co.za",
        title: "Roets & Van Rensburg Attorneys",
        description: "Upholding Justice. Premium legal services in South Africa.",
        siteName: "RVR Inc.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Roets & Van Rensburg Attorneys",
        description: "Upholding Justice. Premium legal services in South Africa.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/images/favicon.png" />
            </head>
            <body className={cn(inter.variable, playfair.variable, "min-h-screen bg-background font-sans antialiased")}>
                {children}
            </body>
        </html>
    );
}
