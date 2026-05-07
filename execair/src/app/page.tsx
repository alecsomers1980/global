import type { Metadata } from "next";
import Hero from "@/components/Hero";
import UniqueProjects from "@/components/UniqueProjects";
import ThreeStepApproach from "@/components/ThreeStepApproach";
import KeyFacts from "@/components/KeyFacts";
import CompanyDescription from "@/components/CompanyDescription";
import ClientLogos from "@/components/ClientLogos";
import PartnerLogos from "@/components/PartnerLogos";
import Workmanship from "@/components/Workmanship";
import Testimonials from "@/components/Testimonials";
import BottomCTA from "@/components/BottomCTA";
import { faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title:
    "Air Conditioning Krugersdorp | HVAC Installation Gauteng — Exec-Air",
  description:
    "HVAC specialists in Krugersdorp & Johannesburg since 1989. Commercial, industrial and residential air conditioning installation, service and maintenance across Gauteng. Get a free quote.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Air Conditioning Krugersdorp | HVAC Specialists — Exec-Air",
    description:
      "Commercial, industrial and residential HVAC across Gauteng since 1989.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_ZA",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <KeyFacts />
      <UniqueProjects />
      <ThreeStepApproach />
      <CompanyDescription />
      <ClientLogos />
      <PartnerLogos />
      <Workmanship />
      <Testimonials />
      <BottomCTA />
    </>
  );
}
