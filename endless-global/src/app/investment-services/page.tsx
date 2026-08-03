import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Investment Services",
  description:
    "Connecting investors with verified, high-potential global opportunities. Sustainable growth, global access, tailored strategy, and thorough due diligence.",
  alternates: { canonical: "/investment-services" },
};

export default function InvestmentServicesPage() {
  return <ServicePage data={services["investment-services"]} />;
}
