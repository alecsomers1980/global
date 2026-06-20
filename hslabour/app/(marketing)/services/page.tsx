import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import AreasOfFocus from "@/components/site/AreasOfFocus";
import ClosingCta from "@/components/site/ClosingCta";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Recruitment, TES & Payroll Services | H&S Labour Brokers",
  description:
    "H&S Labour Brokers offers permanent and contract recruitment, temporary employment services (TES), payroll, vetting, HR & IR, and CV response handling in South Africa.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Services"
        title="Workforce solutions, end to end"
        intro="With over 25 years of experience, H&S Labour Brokers provides end-to-end workforce solutions for employers across South Africa — from permanent placements to managed temporary employment services. We handle the complexity so you can focus on your business."
        imageSrc="/images/services-team.jpg"
        imageAlt="H&S Labour Brokers recruitment consultants"
      >
        <Link
          href="/employers"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
        >
          Hire Staff
          <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHeader>
      <AreasOfFocus showHeader={false} />
      <ClosingCta />
    </>
  );
}