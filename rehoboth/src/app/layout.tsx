import type { Metadata } from "next";
import { Marcellus, Karla } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

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

export const metadata: Metadata = {
  title: {
    default: "Rehoboth Herbal Co. — grown, dried and packed in Mpumalanga",
    template: "%s · Rehoboth Herbal Co.",
  },
  description:
    "Artemisia, moringa, turmeric, rosemary and neem — grown, dried and packed at Rehoboth Farm, Low's Creek, Mpumalanga. 100% natural, one ingredient in the bottle.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" className={`${marcellus.variable} ${karla.variable}`}>
      <body>
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
