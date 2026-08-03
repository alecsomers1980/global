import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Consulting Services",
  description:
    "Strategic consulting for growth and global expansion — international expansion, partnership development, business strategy, and market research.",
  alternates: { canonical: "/consulting-services" },
};

export default function ConsultingServicesPage() {
  return <ServicePage data={services["consulting-services"]} />;
}
