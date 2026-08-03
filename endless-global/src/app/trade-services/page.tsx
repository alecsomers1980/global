import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Trade Services",
  description:
    "Simplifying international trade — market entry, compliance, logistics, negotiation, and partner matchmaking with trusted global partners.",
  alternates: { canonical: "/trade-services" },
};

export default function TradeServicesPage() {
  return <ServicePage data={services["trade-services"]} />;
}
