import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FaqAccordion from "@/components/FaqAccordion";
import FaqJsonLd from "@/components/FaqJsonLd";
import CTASection from "@/components/CTASection";
import { faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ – East Lake Drilling",
  description: "Everything you need to know before you drill.",
};

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        subtitle="Everything you need to know before you drill."
        image="/images/hero/about-1.jpg"
      />
      <section className="container-px py-20 max-w-3xl mx-auto">
        <FaqAccordion items={faqs} />
      </section>
      <CTASection />
    </>
  );
}