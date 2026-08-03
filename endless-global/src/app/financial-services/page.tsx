import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Financial Services",
  description:
    "Financial risk management, wealth management, business funding, and corporate finance advisory to protect and grow your capital.",
  alternates: { canonical: "/financial-services" },
};

export default function FinancialServicesPage() {
  return <ServicePage data={services["financial-services"]} />;
}
