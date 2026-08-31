import type { Metadata } from "next";
import { Marcellus, Karla } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl, organizationJsonLd, websiteJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
  display: "swap",
});

const karla = Karla({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

const TITLE = "Rehoboth Herbal Co. — grown, dried and packed in Mpumalanga";
const DESCRIPTION =
  "Artemisia, moringa, turmeric, rosemary and neem — grown, dried and packed at Rehoboth Farm, Low's Creek, Mpumalanga. 100% natural, one ingredient in the bottle.";

export const metadata: Metadata = {
  // Lets every page below set a relative openGraph.images path and have
  // Next resolve it to a full URL — without this, relative OG/Twitter image
  // paths silently fail to unfurl on platforms that require an absolute one.
  metadataBase: new URL(siteUrl()),
  title: { default: TITLE, template: "%s · Rehoboth Herbal Co." },
  description: DESCRIPTION,
  openGraph: {
    siteName: "Rehoboth Herbal Co.",
    locale: "en_ZA",
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" className={`${marcellus.variable} ${karla.variable}`}>
      <body>
        {/* Sitewide entity data — who the brand is, not what any one page
            says. Individual pages add their own Product/BlogPosting/
            BreadcrumbList blocks on top of this. */}
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        {children}
        {/* In the layout rather than per page so it survives every route,
            including checkout — which is exactly where someone stops to ask a
            question. It reads its link in the browser, so no page is pushed
            off static generation to render it. */}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
